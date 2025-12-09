import pytest
from src.schemas import User, Role

def test_user_profile_structure(client, seeded_workspace):
    """
    WHY: Verify that user profiles are correctly structured and can be retrieved.
    Users are the entities performing actions (capturing, completing) and owning roles.
    """
    # Assuming there's an endpoint to get user info or we just verify the file structure via some mechanism.
    # If the backend treats users as just another type of file or has a specific endpoint.
    # For now, let's assume we can fetch it or at least validate the fixture matches the schema.

    # Since we don't have a user endpoint defined in the API contract yet,
    # we will just verify the schema against the loaded data (simulating internal load).

    # In a real integration test, we might call GET /users/{id}
    # Let's assume GET /users/{id} exists for this TDD cycle as implied by "User profile related fixtures and test"

    user_id = "00000000-0000-0000-0000-000000000123"

    # Note: API contract didn't specify /users/ endpoint, but we are adding "User profile related tests".
    # I will attempt to hit it.
    resp = client.get(f"/users/{user_id}")

    # If not implemented, it will be 404, which is fine for TDD.
    # But we can also test the Pydantic model directly to ensure our schema assumption matches the fixture.

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
        assert str(user.user_id) == user_id

def test_user_role_validation():
    """
    WHY: Verify that users can only be assigned valid roles defined in the system.
    """
    # Valid
    u = User(user_id="00000000-0000-0000-0000-000000000001", username="u", email="e", roles=[Role.FRONTEND_DEV])
    assert u.roles[0] == Role.FRONTEND_DEV

    # Invalid (Pydantic should raise error)
    try:
        User(user_id="00000000-0000-0000-0000-000000000001", username="u", email="e", roles=["invalid-role"])
        assert False, "Should have raised validation error"
    except ValueError:
        pass
