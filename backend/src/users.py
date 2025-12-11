from typing import Tuple, Optional, List, Dict
from uuid import UUID
import sqlite3
from src.database import get_db_connection

def get_user_by_username(username: str) -> Optional[dict]:
    """Find user by username (case-insensitive)."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT user_id, username, email, role, avatar, color, level, experience FROM users WHERE LOWER(username) = LOWER(?)",
        (username,)
    )
    row = cursor.fetchone()
    conn.close()

    if row:
        return {
            "user_id": row["user_id"],
            "username": row["username"],
            "email": row["email"],
            "role": row["role"],
            "avatar": row["avatar"],
            "color": row["color"],
            "level": row["level"],
            "experience": row["experience"]
        }
    return None

def get_user_by_id(user_id: str) -> Optional[dict]:
    """Find user by user_id."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT user_id, username, email, role, avatar, color, level, experience FROM users WHERE user_id = ?",
        (user_id,)
    )
    row = cursor.fetchone()
    conn.close()

    if row:
        return {
            "user_id": row["user_id"],
            "username": row["username"],
            "email": row["email"],
            "role": row["role"],
            "avatar": row["avatar"],
            "color": row["color"],
            "level": row["level"],
            "experience": row["experience"]
        }
    return None

def get_all_users() -> List[Dict]:
    """Returns a list of all users."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT user_id, username, email, role, avatar, color, level, experience FROM users")
    rows = cursor.fetchall()
    conn.close()

    users = []
    for row in rows:
        users.append({
            "user_id": row["user_id"], # Standardized to user_id
            "name": row["username"],
            "email": row["email"],
            "role": row["role"],
            "avatar": row["avatar"],
            "color": row["color"],
            "level": row["level"],
            "experience": row["experience"]
        })
    return users

def get_git_author(user_id: UUID) -> Optional[Tuple[str, str]]:
    """Returns (name, email) for git commits."""
    user = get_user_by_id(str(user_id))
    if user:
        return (user["username"], user["email"])
    return None
