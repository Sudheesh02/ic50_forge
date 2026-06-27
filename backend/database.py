import sqlite3
import os
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "predictions.db")

def init_db():
    """Initializes the SQLite database and creates the prediction logs table."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS prediction_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            smiles TEXT NOT NULL,
            pic50_pred REAL NOT NULL,
            ic50_um_pred REAL NOT NULL,
            timestamp TEXT NOT NULL
        )
    """)
    conn.commit()
    conn.close()
    print(f"Database initialized at {DB_PATH}")

def log_prediction(smiles: str, pic50_pred: float, ic50_um_pred: float):
    """Inserts a successful prediction record into the database."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    cursor.execute("""
        INSERT INTO prediction_logs (smiles, pic50_pred, ic50_um_pred, timestamp)
        VALUES (?, ?, ?, ?)
    """, (smiles, pic50_pred, ic50_um_pred, timestamp))
    conn.commit()
    conn.close()

def get_logs(limit: int = 100):
    """Retrieves prediction history log records, sorted by recency."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("""
        SELECT id, smiles, pic50_pred, ic50_um_pred, timestamp 
        FROM prediction_logs 
        ORDER BY id DESC 
        LIMIT ?
    """, (limit,))
    rows = cursor.fetchall()
    logs = [dict(row) for row in rows]
    conn.close()
    return logs
