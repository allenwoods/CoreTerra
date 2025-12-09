import pytest
from datetime import datetime
from src.schemas import TaskType, Status

def test_engage_verifies_causality(client, temp_workspace):
    """
    WHY: Completion must happen AFTER creation. This verifies the fundamental arrow of time
    in our process data, ensuring logical consistency for analytics.
    """
    user_uuid = "00000000-0000-0000-0000-000000000123"
    t = client.post("/tasks/", json={
        "title": "Work",
        "user_id": user_uuid,
        "type": TaskType.CAPTURE
    }).json()

    # Complete it
    resp = client.put(f"/tasks/{t['id']}/status", json={
        "status": Status.COMPLETED,
        "user_id": user_uuid,
        "updated_at": t["updated_at"]
    })
    completed = resp.json()

    created_at = datetime.fromisoformat(completed["capture_timestamp"].replace('Z', '+00:00'))
    completed_at = datetime.fromisoformat(completed["completed_at"].replace('Z', '+00:00'))

    # WHY: Causality
    assert completed_at > created_at, "Task cannot be completed before it is created"

def test_engage_generates_reliable_signal(client, temp_workspace):
    """
    WHY: A completed task provides the signal for 'Commitment Accuracy Rate' (CAR).
    We must ensure the system correctly records the completion state to feed this metric.
    """
    user_uuid = "00000000-0000-0000-0000-000000000123"
    t = client.post("/tasks/", json={
        "title": "Signal Test",
        "user_id": user_uuid,
        "type": TaskType.CAPTURE
    }).json()

    resp = client.put(f"/tasks/{t['id']}/status", json={
        "status": Status.COMPLETED,
        "user_id": user_uuid,
        "updated_at": t["updated_at"]
    })

    # WHY: Signal integrity
    assert resp.status_code == 200
    assert resp.json()["status"] == "completed"
    assert resp.json()["completed_at"] is not None, "Completion event must be timestamped to calculate CAR"
