import pytest
from src.schemas import User, Role
from uuid import UUID

TEST_USER_ID = "550e8400-e29b-41d4-a716-446655440001"

def test_user_profile_structure(client, seeded_workspace):
    """
    WHY: Verify that user profiles are correctly structured and can be retrieved.
    Users are the entities performing actions (capturing, completing) and owning roles.
    """

    # Direct Schema Test (Unit Test style within Integration suite)
    import frontmatter
    import os

    fixture_path = os.path.join(seeded_workspace, "test_user.md")
    if os.path.exists(fixture_path):
        post = frontmatter.load(fixture_path)
        user_data = post.metadata

        # Validate against schema
        user = User(**user_data)
        assert user.username == "testuser"
        assert Role.BACKEND_ENGINEER in user.roles
        assert str(user.user_id) == TEST_USER_ID

def test_user_role_validation():
    """
    WHY: Verify that users can only be assigned valid roles defined in the system.
    """
    # Valid
    u = User(user_id="550e8400-e29b-41d4-a716-446655440002", username="u", email="e", roles=[Role.FRONTEND_DEV])
    assert u.roles[0] == Role.FRONTEND_DEV

    # Invalid (Pydantic should raise error)
    try:
        User(user_id="550e8400-e29b-41d4-a716-446655440003", username="u", email="e", roles=["invalid-role"])
        assert False, "Should have raised validation error"
    except ValueError:
        pass
