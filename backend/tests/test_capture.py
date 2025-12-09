import pytest
from src.schemas import TaskCreateRequest, TaskType, Priority

def test_capture_generates_unique_identity(client, temp_workspace):
    """
    WHY: Verify that every captured task has a unique identity (task_id).
    We test this by creating two identical tasks and ensuring their IDs differ.
    """
    # Using explicit UUID for user_id as per new schema
    user_uuid = "00000000-0000-0000-0000-000000000123"

    payload = TaskCreateRequest(
        title="Same Idea",
        user_id=user_uuid,
        body="Content",
        type=TaskType.CAPTURE
    ).model_dump(mode='json')

    # Capture first task
    resp1 = client.post("/tasks/", json=payload)
    assert resp1.status_code == 201
    task1 = resp1.json()

    # Capture second identical task
    resp2 = client.post("/tasks/", json=payload)
    assert resp2.status_code == 201
    task2 = resp2.json()

    # The WHY test: Uniqueness of identity
    # Note: API response aliases task_id to id
    assert task1["id"] != task2["id"], "Each captured task must have a unique global identifier (task_id)"

def test_capture_establishes_timeline(client, temp_workspace):
    """
    WHY: Verify that capturing a task establishes its point of origin in time.
    This is critical for calculating PQI (Planning Quality Index) later.
    """
    user_uuid = "00000000-0000-0000-0000-000000000123"
    payload = TaskCreateRequest(
        title="Timeline Test",
        user_id=user_uuid,
        type=TaskType.CAPTURE
    ).model_dump(mode='json')

    resp = client.post("/tasks/", json=payload)
    assert resp.status_code == 201
    task = resp.json()

    # The WHY test: Existence of a valid timeline origin
    assert task["capture_timestamp"] is not None, "Captured task must have a timestamp to serve as the baseline for PQI metrics"
    assert task["status"] == "inbox", "Newly captured tasks must land in Inbox to await processing"
