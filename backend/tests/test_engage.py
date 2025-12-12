from datetime import datetime
from src.schemas import TaskType, Status

# Use valid UUID for testing
TEST_USER_ID = "550e8400-e29b-41d4-a716-446655440000"


def test_engage_verifies_causality(client, temp_workspace):
    """
    WHY: Completion must happen AFTER creation. This verifies the fundamental arrow of time
    in our process data, ensuring logical consistency for analytics.
    """
    t = client.post(
        "/tasks/",
        json={"title": "Work", "user_id": TEST_USER_ID, "type": TaskType.CAPTURE},
    ).json()

    # Complete it
    resp = client.put(
        f"/tasks/{t['id']}/status",
        json={
            "status": Status.COMPLETED,
            "user_id": TEST_USER_ID,
            "updated_at": t["updated_at"],
        },
    )
    completed = resp.json()

    # Handle timezone (Z vs +00:00)
    created_str = completed["capture_timestamp"].replace("Z", "+00:00")
    completed_str = completed["completion_timestamp"].replace("Z", "+00:00")

    created_at = datetime.fromisoformat(created_str)
    completed_at = datetime.fromisoformat(completed_str)

    # WHY: Causality
    assert completed_at > created_at, "Task cannot be completed before it is created"


def test_engage_generates_reliable_signal(client, temp_workspace):
    """
    WHY: A completed task provides the signal for 'Commitment Accuracy Rate' (CAR).
    We must ensure the system correctly records the completion state to feed this metric.
    """
    t = client.post(
        "/tasks/",
        json={
            "title": "Signal Test",
            "user_id": TEST_USER_ID,
            "type": TaskType.CAPTURE,
        },
    ).json()

    resp = client.put(
        f"/tasks/{t['id']}/status",
        json={
            "status": Status.COMPLETED,
            "user_id": TEST_USER_ID,
            "updated_at": t["updated_at"],
        },
    )

    # WHY: Signal integrity
    assert resp.status_code == 200
    assert resp.json()["status"] == "completed"
    assert resp.json()["completion_timestamp"] is not None, (
        "Completion event must be timestamped to calculate CAR"
    )
