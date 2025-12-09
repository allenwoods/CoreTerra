import pytest
from tests.schemas import TaskCreateRequest

def test_capture_generates_unique_identity(client, temp_workspace):
    """
    WHY: Verify that every captured task has a unique identity (ct_id).
    We test this by creating two identical tasks and ensuring their IDs differ.
    """
    payload = TaskCreateRequest(
        title="Same Idea",
        user_id="user1",
        body="Content",
        type="Capture"
    ).model_dump()

    # Capture first task
    resp1 = client.post("/tasks/", json=payload)
    assert resp1.status_code == 201
    task1 = resp1.json()

    # Capture second identical task
    resp2 = client.post("/tasks/", json=payload)
    assert resp2.status_code == 201
    task2 = resp2.json()

    # The WHY test: Uniqueness of identity
    assert task1["id"] != task2["id"], "Each captured task must have a unique global identifier (ct_id)"

def test_capture_establishes_timeline(client, temp_workspace):
    """
    WHY: Verify that capturing a task establishes its point of origin in time.
    This is critical for calculating PQI (Planning Quality Index) later.
    """
    payload = TaskCreateRequest(
        title="Timeline Test",
        user_id="user1",
        type="Capture"
    ).model_dump()

    resp = client.post("/tasks/", json=payload)
    assert resp.status_code == 201
    task = resp.json()

    # The WHY test: Existence of a valid timeline origin
    assert task["created_at"] is not None, "Captured task must have a timestamp to serve as the baseline for PQI metrics"
    assert task["status"] == "inbox", "Newly captured tasks must land in Inbox to await processing"
