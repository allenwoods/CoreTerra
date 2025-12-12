"""
WHY: Git history provides audit trail for task lifecycle.
This test suite verifies that the history endpoint correctly exposes
the Git commit log for tasks, maintaining accountability and transparency.
"""

# Use valid UUID for testing
TEST_USER_ID = "550e8400-e29b-41d4-a716-446655440000"


def test_history_captures_task_lifecycle(client, temp_workspace):
    """
    WHY: History must reflect the complete audit trail from creation through updates.
    This verifies that Git history serves as an immutable audit log.
    """
    # Create task
    resp = client.post("/tasks/", json={
        "title": "Lifecycle Test",
        "user_id": TEST_USER_ID,
        "type": "Capture"
    })
    assert resp.status_code == 201
    task = resp.json()
    task_id = task["id"]

    # Update priority
    task = client.get(f"/tasks/{task_id}").json()
    client.patch(f"/tasks/{task_id}", json={
        "priority": "5",
        "updated_at": task["updated_at"]
    })

    # Get fresh updated_at
    task = client.get(f"/tasks/{task_id}").json()

    # Add role_owner first (required for active status)
    task = client.get(f"/tasks/{task_id}").json()
    client.patch(f"/tasks/{task_id}", json={
        "role_owner": "backend-engineer",
        "updated_at": task["updated_at"]
    })

    # Get fresh updated_at
    task = client.get(f"/tasks/{task_id}").json()

    # Update status
    status_resp = client.put(f"/tasks/{task_id}/status", json={
        "status": "active",
        "user_id": TEST_USER_ID,
        "updated_at": task["updated_at"]
    })
    assert status_resp.status_code == 200, "Status update should succeed"

    # Fetch history
    history_resp = client.get(f"/tasks/{task_id}/history")
    assert history_resp.status_code == 200
    history = history_resp.json()

    # WHY: Must have at least 4 commits (create, priority update, role_owner update, status update)
    assert len(history) >= 4, f"History must capture all state transitions, got {len(history)} commits"

    # WHY: Commits must be ordered newest first
    timestamps = [item["timestamp"] for item in history]
    assert timestamps == sorted(timestamps, reverse=True), (
        "History must be ordered from newest to oldest for audit clarity"
    )

    # WHY: Initial commit must be ADD message
    assert "ADD:" in history[-1]["message"], (
        "First commit must follow ADD format for audit trail"
    )

    # WHY: Update commits must be UPDATE message
    update_commits = [h for h in history if "UPDATE:" in h["message"]]
    assert len(update_commits) >= 2, "Updates must be captured in history"


def test_history_returns_empty_for_nonexistent_task(client, temp_workspace):
    """
    WHY: Missing tasks should return empty history gracefully, not crash.
    This supports graceful UI behavior.
    """
    fake_uuid = "00000000-0000-0000-0000-000000000000"
    resp = client.get(f"/tasks/{fake_uuid}/history")

    # WHY: Should succeed with empty list, not 404
    assert resp.status_code == 200
    assert resp.json() == [], "Non-existent task should return empty history"


def test_history_respects_limit_parameter(client, temp_workspace):
    """
    WHY: Limit parameter must work for performance control on tasks with many commits.
    """
    # Create task
    resp = client.post("/tasks/", json={
        "title": "Limit Test",
        "user_id": TEST_USER_ID,
        "type": "Capture"
    })
    task = resp.json()
    task_id = task["id"]

    # Make several updates
    for i in range(5):
        task = client.get(f"/tasks/{task_id}").json()
        client.patch(f"/tasks/{task_id}", json={
            "title": f"Update {i}",
            "updated_at": task["updated_at"]
        })

    # Fetch with limit
    history_resp = client.get(f"/tasks/{task_id}/history?limit=3")
    history = history_resp.json()

    # WHY: Must respect limit
    assert len(history) == 3, "History must respect limit parameter"


def test_history_includes_author_information(client, temp_workspace):
    """
    WHY: Author information is critical for accountability in team environments.
    """
    resp = client.post("/tasks/", json={
        "title": "Author Test",
        "user_id": TEST_USER_ID,
        "type": "Capture"
    })
    task = resp.json()

    history_resp = client.get(f"/tasks/{task['id']}/history")
    history = history_resp.json()

    # WHY: Every commit must have author metadata
    for commit in history:
        assert "author_name" in commit, "Author name required for accountability"
        assert "author_email" in commit, "Author email required for accountability"
        assert commit["author_name"], "Author name must not be empty"
        assert commit["author_email"], "Author email must not be empty"
