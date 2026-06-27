# IC50 FORGE

**IC50 FORGE** is a full-stack, highly efficient web platform for predicting Chagas disease drug potency (pIC50 and IC50). It features a modern, minimalist Apple-style UI, built using Next.js (React) and Tailwind CSS with Framer Motion animations, backed by a FastAPI server, a Deep Learning (Keras/TensorFlow) regression model, and an SQLite database for prediction auditing and logs.

---

## Key Features

- **Apple-Inspired Aesthetic**: Minimalist layout, glassmorphic cards, smooth hover effects, custom scrollbars, and buttery transitions.
- **Deep Learning Model**: Standard sequential neural network trained on TRYPANOSOMA CRUZI (Chagas disease) active outcomes from the PubChem AID 2044 dataset.
- **Morgan Fingerprint Visualizer**: Input SMILES strings are converted to 1024-bit Morgan Fingerprints (radius 2) via RDKit and displayed interactively on the UI as a glowing bit grid.
- **SQLite Audit Logger**: Successful predictions are saved in a local SQLite database and retrieved dynamically via a Dashboard history table.
- **Single-Port Deployment**: Next.js is configured for static export (`output: 'export'`), and FastAPI hosts the static build output alongside API endpoints on a single port (default `8000`), eliminating CORS issues.

---

## Directory Structure

```text
IC50/
├── backend/
│   ├── data/
│   │   ├── AID_2044_datatable.csv  # Raw screening data
│   │   └── processed_data.npz      # Preprocessed fingerprints and pIC50 values
│   ├── data_pipeline.py            # Extracts SMILES/EC50, calculates pIC50, generates fingerprints
│   ├── train_model.py              # Builds & trains the Keras model
│   ├── database.py                 # SQLite predictions database logger
│   ├── main.py                     # FastAPI server (API endpoints + Next.js static hosting)
│   ├── ic50_model.h5               # Saved Keras regression model
│   ├── predictions.db              # SQLite database (auto-generated)
│   └── requirements.txt            # Python dependencies
├── frontend/
│   ├── out/                        # Compiled Next.js static export (auto-generated)
│   ├── src/
│   │   └── app/
│   │       ├── globals.css         # Styling, custom fonts, glassmorphic utilities
│   │       ├── layout.tsx          # Font loading and SEO meta tags
│   │       └── page.tsx            # Main interactive landing page & dashboard modal
│   ├── next.config.ts              # Next.js configurations (output: 'export')
│   ├── package.json                # Frontend NPM packages
│   └── tsconfig.json               # TypeScript configuration
└── README.md                       # Documentation and startup guide
```

---

## Getting Started

### Prerequisites

- **Python 3.10+** (Python 3.13 was used for verification)
- **Node.js 18+** (Node.js 24 was used for verification)

---

### Step 1: Install Dependencies

#### Backend Dependencies
From the project root directory, install Python packages:
```bash
pip install -r backend/requirements.txt
```
*(Dependencies: `fastapi`, `uvicorn`, `pandas`, `numpy`, `rdkit`, `tensorflow`, `joblib`)*

#### Frontend Dependencies
Navigate to the `frontend` folder and install NPM packages:
```bash
cd frontend
npm install
```
*(Dependencies: `next`, `react`, `react-dom`, `framer-motion`, `lucide-react`)*

---

### Step 2: Preprocess & Train the Model (Optional)

The model is pre-trained and saved in `backend/ic50_model.h5` during system setup. If you wish to retrain it:

1. **Run the data pipeline**:
   This script loads the raw CSV, filters for active outcomes, generates 1024-bit Morgan Fingerprints in parallel, and saves the numpy arrays.
   ```bash
   python backend/data_pipeline.py
   ```
2. **Train the Neural Network**:
   This script trains the Keras Sequential model (with EarlyStopping, batch normalization, and dropout) and saves it as `ic50_model.h5`.
   ```bash
   python backend/train_model.py
   ```

---

### Step 3: Compile the Frontend (Optional)

The static build is pre-compiled under `frontend/out`. If you modify the React/Tailwind frontend code, recompile it:
```bash
cd frontend
npm run build
```
This writes the static assets to `frontend/out/`, which the FastAPI backend mounts.

---

### Step 4: Run the Platform

Start the unified server from the project root:
```bash
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
```

Once running:
- Open your browser to **[http://localhost:8000](http://localhost:8000)** to access the platform.
- The Swagger API documentation is available at **[http://localhost:8000/docs](http://localhost:8000/docs)**.

---

## Active Development (Frontend + Backend Concurrently)

If you are developing actively and want hot-reloading for the Next.js frontend:

1. Run the FastAPI server in one terminal:
   ```bash
   python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
   ```
2. Run the Next.js development server in another terminal:
   ```bash
   cd frontend
   npm run dev
   ```
   This will run hot-reloading on **[http://localhost:3000](http://localhost:3000)**.
3. Configure API proxies:
   During active development, calls to `/api/*` will need to go to port `8000`. You can change the fetch URLs in `frontend/src/app/page.tsx` from relative routes (`/api/...`) to absolute paths (`http://localhost:8000/api/...`) to enable direct local communication during development.
