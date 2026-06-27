import os
import pandas as pd
import numpy as np
from rdkit import Chem
from rdkit.Chem import AllChem
from joblib import Parallel, delayed
import warnings

# Suppress warnings
warnings.filterwarnings("ignore")
# Suppress RDKit logs
from rdkit import RDLogger
RDLogger.DisableLog('rdApp.*')

def process_single_smiles(smiles, pic50, idx):
    """
    Helper function to parse SMILES and return fingerprint and label.
    """
    try:
        if not isinstance(smiles, str) or not smiles:
            return None
        mol = Chem.MolFromSmiles(smiles)
        if mol is None:
            return None
        # Generate 1024-bit Morgan Fingerprint, radius 2
        fp = AllChem.GetMorganFingerprintAsBitVect(mol, 2, nBits=1024)
        arr = np.zeros((0,), dtype=np.int8)
        Chem.DataStructs.ConvertToNumpyArray(fp, arr)
        return arr, pic50, smiles
    except Exception as e:
        return None

def main():
    raw_csv = "backend/data/AID_2044_datatable.csv"
    output_dir = "backend/data"
    
    print(f"Loading data from {raw_csv}...")
    # Skipping metadata rows (rows 1-5, which correspond to indices 1, 2, 3, 4, 5 in 0-based index)
    # The header is row 0.
    df = pd.read_csv(raw_csv, skiprows=range(1, 6))
    
    print(f"Total rows read: {len(df)}")
    
    # Filter for 'Active' outcomes
    df_active = df[df['PUBCHEM_ACTIVITY_OUTCOME'] == 'Active'].copy()
    print(f"Filtered for 'Active' outcome: {len(df_active)} rows")
    
    # Drop rows with NaN in SMILES or EC50
    df_active = df_active.dropna(subset=['PUBCHEM_EXT_DATASOURCE_SMILES', 'EC50'])
    print(f"After dropping NaNs in SMILES and EC50: {len(df_active)} rows")
    
    # Calculate pIC50 = -log10(EC50 / 1e6)
    # Note: EC50 is in micromolar, so EC50 / 1e6 converts it to molar.
    df_active['pIC50'] = -np.log10(df_active['EC50'] / 1e6)
    
    smiles_list = df_active['PUBCHEM_EXT_DATASOURCE_SMILES'].tolist()
    pic50_list = df_active['pIC50'].tolist()
    
    print("Generating Morgan Fingerprints in parallel...")
    # Use parallel processing (joblib)
    # n_jobs=-1 uses all available CPU cores
    results = Parallel(n_jobs=-1)(
        delayed(process_single_smiles)(smiles, pic50, idx) 
        for idx, (smiles, pic50) in enumerate(zip(smiles_list, pic50_list))
    )
    
    # Filter out None results
    valid_results = [r for r in results if r is not None]
    print(f"Successfully processed {len(valid_results)} / {len(smiles_list)} active compounds")
    
    # Pack results
    fps = np.array([r[0] for r in valid_results], dtype=np.int8)
    pic50s = np.array([r[1] for r in valid_results], dtype=np.float32)
    smiles_processed = [r[2] for r in valid_results]
    
    # Save processed dataset
    npz_path = os.path.join(output_dir, "processed_data.npz")
    np.savez_compressed(npz_path, fps=fps, pic50s=pic50s, smiles=smiles_processed)
    print(f"Processed dataset saved successfully to {npz_path}")
    print(f"Fingerprints matrix shape: {fps.shape}")
    print(f"pIC50 targets shape: {pic50s.shape}")

if __name__ == "__main__":
    main()
