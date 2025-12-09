import pytest
from tests.schemas import TaskCreateRequest

def test_clarify_preserves_identity_while_enriching_context(client, seeded_workspace):
    """
    WHY: Clarification should add context (details, tags) without altering the task's fundamental identity or origin.
    """
    # Load existing task (simulating a task picked from inbox)
    # We use a known ID from fixtures or create one if needed.
    # Let's create one fresh to be sure.
    create_res = client.post("/tasks/", json={"title": "Vague Idea", "user_id": "u1", "type": "Capture"})
    task = create_res.json()
    original_id = task["id"]
    original_created_at = task["created_at"]

    # The Clarify Action: Adding details
    patch_payload = {
        "title": "Specific Project Proposal",
        "tags": ["proposal", "Q4"],
        "updated_at": task["updated_at"]
    }

    resp = client.patch(f"/tasks/{original_id}", json=patch_payload)
    assert resp.status_code == 200
    updated_task = resp.json()

    # WHY: Identity and Origin must remain immutable
    assert updated_task["id"] == original_id, "Clarification must not change the task identity"
    assert updated_task["created_at"] == original_created_at, "Clarification must preserve the original capture timestamp"

    # WHY: Content must be enriched
    assert updated_task["title"] != task["title"], "Clarification should refine the definition of the task"
    assert set(updated_task["tags"]) == {"proposal", "Q4"}, "Clarification should add categorical context"

def test_clarify_enforces_optimistic_locking(client, temp_workspace):
    """
    WHY: In a collaborative environment, we must prevent 'lost updates'.
    If User B tries to update a task based on a version that User A has already superseded,
    the system must reject User B's update to force a re-read.
    """
    # 1. Setup: Create a task
    t = client.post("/tasks/", json={"title": "Shared Task", "user_id": "u1"}).json()
    task_id = t["id"]
    original_version = t["updated_at"]

    # 2. User A updates the task (e.g., adds a tag)
    user_a_payload = {
        "tags": ["tag-by-A"],
        "updated_at": original_version
    }
    resp_a = client.patch(f"/tasks/{task_id}", json=user_a_payload)
    assert resp_a.status_code == 200

    # 3. User B tries to update the task using the NOW STALE original_version
    user_b_payload = {
        "tags": ["tag-by-B"],
        "updated_at": original_version # This is the stale timestamp!
    }
    resp_b = client.patch(f"/tasks/{task_id}", json=user_b_payload)

    # WHY: Data Integrity. We must not overwrite A's work blindly.
    assert resp_b.status_code == 409, "System must reject updates based on stale data (Optimistic Locking)"
