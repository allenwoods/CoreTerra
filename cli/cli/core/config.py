import json
import os
from pathlib import Path
from typing import Dict, Optional
import typer

APP_NAME = "coreterra"
CONFIG_DIR = Path.home() / ".coreterra"
CONFIG_FILE = CONFIG_DIR / "config.json"

def get_config_path() -> Path:
    return CONFIG_FILE

def load_config() -> Dict[str, str]:
    if not CONFIG_FILE.exists():
        return {}
    try:
        with open(CONFIG_FILE, "r") as f:
            return json.load(f)
    except Exception:
        return {}

def save_config(config: Dict[str, str]):
    CONFIG_DIR.mkdir(parents=True, exist_ok=True)
    with open(CONFIG_FILE, "w") as f:
        json.dump(config, f, indent=4)

def get_api_url() -> str:
    # Env var takes precedence
    env_url = os.getenv("COT_API_URL")
    if env_url:
        return env_url

    config = load_config()
    return config.get("api_url", "http://localhost:8000")

def get_user_id() -> Optional[str]:
    config = load_config()
    return config.get("user_id")

def ensure_logged_in():
    user_id = get_user_id()
    if not user_id:
        typer.echo("Not logged in. Please run 'core login <username>' first.")
        raise typer.Exit(code=1)
    return user_id
