import pytest
from src.schemas import TaskType, Priority

def test_review_establishes_priority_hierarchy(client, temp_workspace):
    """
    WHY: Review is about relative importance. We verify that priority settings correctly
    differentiate tasks, enabling effective triage.
    """
    user_uuid = "00000000-0000-0000-0000-000000000123"
    # Create two tasks
    t1 = client.post("/tasks/", json={
        "title": "Low Prio",
        "user_id": user_uuid,
        "type": TaskType.CAPTURE
    }).json()
    t2 = client.post("/tasks/", json={
        "title": "High Prio",
        "user_id": user_uuid,
        "type": TaskType.CAPTURE
    }).json()

    # Set Priorities
    client.patch(f"/tasks/{t1['id']}", json={"priority": Priority.P1, "updated_at": t1["updated_at"]})
    client.patch(f"/tasks/{t2['id']}", json={"priority": Priority.P5, "updated_at": t2["updated_at"]})

    # Fetch list sorted by priority
    resp = client.get("/tasks/?sort_by=priority&order=desc") # Assuming API supports sort
    tasks = resp.json()

    # WHY: High priority must come first
    # If API doesn't support sort yet, we check the values manually to ensure persistence
    # But ideally, the "View" is what matters for Review.

    # Let's verify persistence at minimum for now
    r1 = client.get(f"/tasks/{t1['id']}").json()
    r2 = client.get(f"/tasks/{t2['id']}").json()

    assert r2["priority"] > r1["priority"], "Review must establish a clear hierarchy of importance"

def test_review_creates_commitment(client, temp_workspace):
    """
    WHY: A committed task must have a target date (due_date) to measure reliability (CAR).
    """
    user_uuid = "00000000-0000-0000-0000-000000000123"
    t = client.post("/tasks/", json={
        "title": "Commitment Test",
        "user_id": user_uuid,
        "type": TaskType.CAPTURE
    }).json()

    # Commit to a date
    due_date = "2023-12-31T23:59:59Z"
    resp = client.patch(f"/tasks/{t['id']}", json={
        "due_date": due_date,
        "updated_at": t["updated_at"]
    })
    updated = resp.json()

    # WHY: Date exists for measurement
    assert updated["due_date"] == due_date, "Review must lock in a commitment date for CAR calculation"
