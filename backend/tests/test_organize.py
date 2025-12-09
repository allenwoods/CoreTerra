import pytest
from src.schemas import TaskCreateRequest, Role, TaskType, Status
from uuid import uuid4

# Use valid UUID for testing
TEST_USER_ID = "550e8400-e29b-41d4-a716-446655440000"

def test_organize_enforces_accountability(client, temp_workspace):
    """
    WHY: Organization is about assigning ownership. A task cannot become 'active' without a Role Owner.
    This enforces the 'Roles are Areas of Focus' principle.
    """
    # Create a task in inbox
    t = client.post("/tasks/", json={
        "title": "Unowned Task",
        "user_id": TEST_USER_ID,
        "type": TaskType.CAPTURE
    }).json()

    # Try to activate it WITHOUT a role owner
    # Note: This assumes the API enforces this rule.
    status_payload = {
        "status": Status.ACTIVE,
        "user_id": TEST_USER_ID,
        "updated_at": t["updated_at"]
    }
    resp = client.put(f"/tasks/{t['id']}/status", json=status_payload)

    # Expectation: Failure or specific error because accountability is missing
    assert resp.status_code in [400, 422], "System should reject activating a task without a designated Role Owner"

    # Now assign Role Owner (The Organize Step)
    # This uses the PATCH endpoint (Clarify module) which is fine as organization is also metadata update
    organize_payload = {
        "role_owner": Role.BACKEND_LEAD,
        "type": TaskType.PROJECT,
        "updated_at": t["updated_at"] # Use original timestamp as previous call failed (no update happened)
    }
    resp = client.patch(f"/tasks/{t['id']}", json=organize_payload)
    assert resp.status_code == 200
    organized_task = resp.json()

    # Now try to activate again
    status_payload["updated_at"] = organized_task["updated_at"]
    resp = client.put(f"/tasks/{t['id']}/status", json=status_payload)

    # WHY: Accountability enables action
    assert resp.status_code == 200, "Task with Role Owner should be actionable"
    assert resp.json()["status"] == "active"

def test_organize_defines_nature_of_work(client, temp_workspace):
    """
    WHY: Organization must categorize the nature of work (NextAction vs Project vs Reference)
    to determine the correct workflow.
    """
    t = client.post("/tasks/", json={
        "title": "Ref",
        "user_id": TEST_USER_ID,
        "type": TaskType.CAPTURE
    }).json()

    # Organize as Reference
    resp = client.patch(f"/tasks/{t['id']}", json={
        "type": TaskType.REFERENCE,
        "role_owner": Role.ARCHIVIST,
        "updated_at": t["updated_at"]
    })
    updated = resp.json()

    # WHY: The Type determines the nature
    assert updated["type"] == "Reference"
    # Additional logic could verify that Reference items don't appear in 'Next Action' lists
