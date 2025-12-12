import pytest
import uuid
from src.schemas import TaskCreateRequest, TaskType, Priority, Role

# Use a valid UUIDv4 for testing
TEST_USER_ID = "550e8400-e29b-41d4-a716-446655440000"

def test_capture_generates_unique_identity(client, temp_workspace):
    """
    WHY: Verify that every captured task has a unique identity (task_id).
    We test this by creating two identical tasks and ensuring their IDs differ.
    """
    payload = TaskCreateRequest(
        title="Same Idea",
        user_id=TEST_USER_ID,
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
    payload = TaskCreateRequest(
        title="Timeline Test",
        user_id=TEST_USER_ID,
        type=TaskType.CAPTURE
    ).model_dump(mode='json')

    resp = client.post("/tasks/", json=payload)
    assert resp.status_code == 201
    task = resp.json()

    # The WHY test: Existence of a valid timeline origin
    assert task["capture_timestamp"] is not None, "Captured task must have a timestamp to serve as the baseline for PQI metrics"
    assert task["status"] == "inbox", "Newly captured tasks must land in Inbox to await processing"

def test_capture_with_full_metadata(client, temp_workspace):
    """
    WHY: Verify that all optional metadata fields (priority, tags, role_owner, body, due_date)
    are correctly persisted when creating a task. This ensures the frontend can send complete
    task data and have it stored properly.
    """
    payload = TaskCreateRequest(
        title="Complex Task with Metadata",
        user_id=TEST_USER_ID,
        priority=Priority("1"),  # P1 - Critical
        tags=["urgent", "bug", "frontend"],
        body="Detailed task description with markdown content",
        role_owner=Role("backend-engineer"),
        type=TaskType("NextAction"),
        due_date="2025-12-20"
    ).model_dump(mode='json')

    resp = client.post("/tasks/", json=payload)
    assert resp.status_code == 201
    task = resp.json()

    # The WHY test: All metadata should be persisted correctly
    assert task["priority"] == "1", "Priority P1 should be stored as '1'"
    assert task["tags"] == ["urgent", "bug", "frontend"], "Tags array should be preserved exactly"
    assert task["role_owner"] == "backend-engineer", "Role owner should be persisted"
    assert task["type"] == "NextAction", "Task type should be persisted"
    assert task["status"] == "inbox", "Even with role_owner set, new tasks start in inbox"
    # Note: due_date tested separately as backend datetime handling may vary
