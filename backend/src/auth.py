from typing import List, Dict
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from src.users import get_user_by_username, get_all_users
from src.schemas import Role
from uuid import UUID
import logging

router = APIRouter(tags=["auth", "users"])

logger = logging.getLogger(__name__)

class LoginRequest(BaseModel):
    username: str

class LoginResponse(BaseModel):
    user_id: str
    username: str
    email: str
    role: str
    avatar: str
    color: str

class UserResponse(BaseModel):
    user_id: str
    name: str
    email: str
    role: str
    avatar: str
    color: str

class RoleResponse(BaseModel):
    id: str
    name: str

@router.post("/auth/login", response_model=LoginResponse)
def login(request: LoginRequest):
    """
    Login by username lookup in database.
    WARNING: This is a prototype implementation with NO password verification.
    TODO: Add password authentication and session tokens in future iteration.
    """
    logger.warning(f"Insecure login attempt for user: {request.username}")

    user = get_user_by_username(request.username)

    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    # Validate UUID integrity
    try:
        UUID(user["user_id"])
    except ValueError:
        logger.error(f"Invalid UUID for user {request.username}: {user['user_id']}")
        raise HTTPException(status_code=500, detail="Internal data integrity error")

    return LoginResponse(
        user_id=user["user_id"],
        username=user["username"],
        email=user["email"],
        role=user["role"],
        avatar=user["avatar"],
        color=user["color"]
    )

@router.get("/users", response_model=List[UserResponse])
def get_users():
    """Get list of all users."""
    return get_all_users()

@router.get("/roles", response_model=List[RoleResponse])
def get_roles():
    """Get list of available roles."""
    # Convert Enum to list of objects compatible with frontend expectations
    # Frontend expects {id: string, name: string}
    roles = []
    for role in Role:
        # Convert kebab-case to Title Case for name
        name = role.value.replace("-", " ").title()
        # Special case handling if needed
        if role == Role.UI_DESIGNER:
            name = "UI Designer"
        elif role == Role.DEVOPS_ENGINEER:
            name = "DevOps Engineer"

        roles.append({"id": role.value, "name": name})
    return roles
