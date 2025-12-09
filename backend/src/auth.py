from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from src.users import MOCK_USERS

router = APIRouter(prefix="/auth", tags=["auth"])

class LoginRequest(BaseModel):
    username: str

class LoginResponse(BaseModel):
    user_id: str
    username: str
    email: str

@router.post("/login", response_model=LoginResponse)
def login(request: LoginRequest):
    """
    Simple mock login. Finds user by username (case-insensitive).
    """
    target_username = request.username.lower()

    for uid, (name, email) in MOCK_USERS.items():
        if name.lower() == target_username:
            return LoginResponse(user_id=uid, username=name, email=email)

    # If not found, for this MVP, let's just return a default or error
    # Let's return error to force valid users
    raise HTTPException(status_code=401, detail="User not found")
