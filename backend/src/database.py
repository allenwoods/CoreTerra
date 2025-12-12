import os
import sqlite3


def _get_paths():
    # Changed default from /tmp to ~/.coreterra/data for persistence
    home = os.path.expanduser("~")
    default_data_dir = os.path.join(home, ".coreterra", "data")

    data_dir = os.getenv("CORETERRA_DATA_DIR", default_data_dir)
    db_path = os.getenv("CORETERRA_DB_PATH", os.path.join(data_dir, "coreterra.db"))
    print(
        f"DEBUG: database.py _get_paths: env_data_dir={os.getenv('CORETERRA_DATA_DIR')}, db_path={db_path}"
    )
    return data_dir, db_path


def get_db_connection():
    data_dir, db_path = _get_paths()
    os.makedirs(os.path.dirname(db_path), exist_ok=True)
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn
