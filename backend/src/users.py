from typing import Tuple, Optional
from uuid import UUID

# Mock user database for MVP
# In a real system, this would come from a DB
MOCK_USERS = {
    # The UUID used in tests
    "550e8400-e29b-41d4-a716-446655440000": ("Test User", "test@example.com"),
    # Add other users from prototype.html if needed
    "00000000-0000-0000-0000-000000000001": ("Alex", "alex@example.com"),
}

def get_git_author(user_id: UUID) -> Optional[Tuple[str, str]]:
    """
    Returns the (name, email) tuple for a given user_id to be used in git commits.
    Returns None if user not found.
    """
    return MOCK_USERS.get(str(user_id))
