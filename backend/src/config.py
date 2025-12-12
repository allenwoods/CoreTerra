"""
Configuration loader for enum definitions.
Loads enums from the centralized /config/enums.json file.
"""

import json
from pathlib import Path
from typing import Dict, List, Any
from functools import lru_cache
from enum import Enum

CONFIG_PATH = Path(__file__).parent.parent.parent / "config" / "enums.json"


@lru_cache(maxsize=1)
def load_enum_config() -> Dict[str, Any]:
    """Load enum configuration from JSON file."""
    with open(CONFIG_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def get_priority_values() -> List[str]:
    """Get list of valid priority values."""
    config = load_enum_config()
    return [p["value"] for p in config["priorities"]]


def get_status_values() -> List[str]:
    """Get list of valid status values."""
    config = load_enum_config()
    return [s["value"] for s in config["statuses"]]


def get_role_values() -> List[str]:
    """Get list of valid role values."""
    config = load_enum_config()
    return [r["value"] for r in config["roles"]]


def get_task_type_values() -> List[str]:
    """Get list of valid task type values."""
    config = load_enum_config()
    return [t["value"] for t in config["task_types"]]


def get_default_priority() -> str:
    """Get default priority value."""
    config = load_enum_config()
    return config["defaults"]["priority"]


def get_default_status() -> str:
    """Get default status value."""
    config = load_enum_config()
    return config["defaults"]["status"]


def get_default_task_type() -> str:
    """Get default task type value."""
    config = load_enum_config()
    return config["defaults"]["task_type"]


def create_enum_from_config(enum_name: str, config_key: str):
    """
    Dynamically create enum from config.

    Args:
        enum_name: Name for the enum class
        config_key: Key in config (e.g., 'priorities', 'statuses')

    Returns:
        Dynamically created Enum class
    """
    config = load_enum_config()
    values = {
        item["value"].upper().replace("-", "_"): item["value"]
        for item in config[config_key]
    }
    return Enum(enum_name, values, type=str)
