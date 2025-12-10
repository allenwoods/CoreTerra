import os
import sqlite3

def _get_paths():
    data_dir = os.getenv('CORETERRA_DATA_DIR', '/tmp/coreterra-data')
    db_path = os.getenv('CORETERRA_DB_PATH', os.path.join(data_dir, 'coreterra.db'))
    return data_dir, db_path

def get_db_connection():
    data_dir, db_path = _get_paths()
    os.makedirs(os.path.dirname(db_path), exist_ok=True)
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn
