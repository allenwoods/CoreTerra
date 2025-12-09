import pytest
from tests.schemas import TaskCreateRequest

def test_organize_enforces_accountability(client, temp_workspace):
    """
    WHY: Organization is about assigning ownership. A task cannot become 'active' without a Role Owner.
    This enforces the 'Roles are Areas of Focus' principle.
    """
    # Create a task in inbox
    t = client.post("/tasks/", json={"title": "Unowned Task", "user_id": "u1"}).json()

    # Try to activate it WITHOUT a role owner
    # Note: This assumes the API enforces this rule.
    # If the current implementation is minimal, this test documents the Requirement (WHY).
    status_payload = {
        "status": "active",
        "user_id": "u1",
        "updated_at": t["updated_at"]
    }
    resp = client.put(f"/tasks/{t['id']}/status", json=status_payload)

    # Expectation: Failure or specific error because accountability is missing
    # If the API is not yet strictly enforcing, we might expect 200 but SHOULD fail in a robust system.
    # For this test plan, let's assume strict enforcement is the goal.
    # If implementation is missing, we document expectation.
    # We'll assert 400 or 422.
    assert resp.status_code in [400, 422], "System should reject activating a task without a designated Role Owner"

    # Now assign Role Owner (The Organize Step)
    organize_payload = {
        "role_owner": "backend-lead",
        "type": "Project",
        "updated_at": t["updated_at"] # Use original timestamp as previous call failed (or fetch new if needed)
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
    t = client.post("/tasks/", json={"title": "Ref", "user_id": "u1"}).json()

    # Organize as Reference
    resp = client.patch(f"/tasks/{t['id']}", json={
        "type": "Reference",
        "role_owner": "archivist",
        "updated_at": t["updated_at"]
    })
    updated = resp.json()

    # WHY: The Type determines the nature
    assert updated["type"] == "Reference"
    # Additional logic could verify that Reference items don't appear in 'Next Action' lists
