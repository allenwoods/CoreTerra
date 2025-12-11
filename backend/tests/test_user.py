import pytest
from src.schemas import User, Role
from uuid import UUID

TEST_USER_ID = "550e8400-e29b-41d4-a716-446655440001"

def test_user_profile_structure(client, seeded_workspace):
    """
    WHY: Verify that user profiles are correctly structured and can be retrieved.
    Users are the entities performing actions (capturing, completing) and owning roles.
    """

    u = User(
        user_id=TEST_USER_ID,
        username="testuser",
        email="test@example.com",
        role=Role.BACKEND_ENGINEER,
        avatar="http://example.com/avatar",
        color="bg-blue-500",
        level=5,
        experience=250
    )
    assert u.username == "testuser"
    assert u.role == Role.BACKEND_ENGINEER
    assert str(u.user_id) == TEST_USER_ID
    assert u.level == 5
    assert u.experience == 250

def test_user_role_validation():
    """
    WHY: Verify that users can only be assigned valid roles defined in the system.
    """
    # Valid
    u = User(
        user_id="550e8400-e29b-41d4-a716-446655440002",
        username="u",
        email="e",
        role=Role.FRONTEND_ENGINEER,
        avatar="",
        color=""
    )
    assert u.role == Role.FRONTEND_ENGINEER

    # Invalid (Pydantic should raise error)
    try:
        User(
            user_id="550e8400-e29b-41d4-a716-446655440003",
            username="u",
            email="e",
            role="invalid-role",
            avatar="",
            color=""
        )
        assert False, "Should have raised validation error"
    except ValueError:
        pass
