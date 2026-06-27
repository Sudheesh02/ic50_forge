import os
import numpy as np
import tensorflow as tf
from tensorflow import keras
from keras import layers
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score

def main():
    data_path = "backend/data/processed_data.npz"
    model_save_path = "backend/ic50_model.h5"
    
    if not os.path.exists(data_path):
        print(f"Error: {data_path} not found. Run data_pipeline.py first.")
        return
        
    print(f"Loading preprocessed data from {data_path}...")
    data = np.load(data_path)
    X = data['fps']
    y = data['pic50s']
    
    print(f"Features shape: {X.shape}")
    print(f"Targets shape: {y.shape}")
    
    # Split into train and validation sets
    X_train, X_val, y_train, y_val = train_test_split(X, y, test_size=0.2, random_state=42)
    print(f"Training set: {X_train.shape[0]} samples")
    print(f"Validation set: {X_val.shape[0]} samples")
    
    # Build Keras Sequential model
    print("Building Keras Sequential model...")
    model = keras.Sequential([
        layers.Input(shape=(1024,)),
        layers.Dense(256, activation='relu'),
        layers.BatchNormalization(),
        layers.Dropout(0.2),
        layers.Dense(64, activation='relu'),
        layers.Dense(1, activation='linear')
    ])
    
    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=0.001),
        loss='mse',
        metrics=['mae']
    )
    
    model.summary()
    
    # Define EarlyStopping callback
    early_stopping = keras.callbacks.EarlyStopping(
        monitor='val_loss',
        patience=5,
        restore_best_weights=True
    )
    
    print("Training model...")
    history = model.fit(
        X_train, y_train,
        validation_data=(X_val, y_val),
        epochs=100,
        batch_size=32,
        callbacks=[early_stopping],
        verbose=1
    )
    
    # Evaluate model
    print("Evaluating model...")
    val_predictions = model.predict(X_val).flatten()
    
    mse = mean_squared_error(y_val, val_predictions)
    mae = mean_absolute_error(y_val, val_predictions)
    r2 = r2_score(y_val, val_predictions)
    
    print("\n--- Model Performance ---")
    print(f"Mean Squared Error (MSE): {mse:.4f}")
    print(f"Mean Absolute Error (MAE): {mae:.4f}")
    print(f"R² Score:                 {r2:.4f}")
    print("-------------------------\n")
    
    # Save the model
    print(f"Saving model to {model_save_path}...")
    model.save(model_save_path)
    print("Model saved successfully.")

if __name__ == "__main__":
    main()
