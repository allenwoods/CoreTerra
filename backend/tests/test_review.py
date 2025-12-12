
# Use valid UUID for testing
TEST_USER_ID = "550e8400-e29b-41d4-a716-446655440000"


def test_review_establishes_priority_hierarchy(client, temp_workspace):
    """
    WHY: Review is about relative importance. We verify that priority settings correctly
    differentiate tasks, enabling effective triage.
    """
    # Create two tasks
    t1 = client.post(
        "/tasks/",
        json={"title": "Low Prio", "user_id": TEST_USER_ID, "type": "Capture"},
    ).json()
    t2 = client.post(
        "/tasks/",
        json={"title": "High Prio", "user_id": TEST_USER_ID, "type": "Capture"},
    ).json()

    print(f"Created T1: {t1['id']}")
    print(f"Created T2: {t2['id']}")

    # Set Priorities
    client.patch(
        f"/tasks/{t1['id']}", json={"priority": "1", "updated_at": t1["updated_at"]}
    )
    client.patch(
        f"/tasks/{t2['id']}", json={"priority": "5", "updated_at": t2["updated_at"]}
    )

    # Fetch list sorted by priority
    resp = client.get("/tasks/?sort_by=priority&order=desc")
    tasks = resp.json()

    print(f"Fetched Tasks: {[t['id'] for t in tasks]}")

    # WHY: High priority must come first
    if len(tasks) >= 2:
        assert tasks[0]["id"] == t2["id"], (
            f"Highest priority task ({t2['id']}) should be first, got {tasks[0]['id']}"
        )
        assert tasks[1]["id"] == t1["id"], (
            f"Lowest priority task ({t1['id']}) should be second, got {tasks[1]['id']}"
        )

    # Verify persistence
    r1 = client.get(f"/tasks/{t1['id']}").json()
    r2 = client.get(f"/tasks/{t2['id']}").json()

    assert r2["priority"] > r1["priority"], (
        "Review must establish a clear hierarchy of importance"
    )


def test_review_creates_commitment(client, temp_workspace):
    """
    WHY: A committed task must have a target date (due_date) to measure reliability (CAR).
    """
    t = client.post(
        "/tasks/",
        json={"title": "Commitment Test", "user_id": TEST_USER_ID, "type": "Capture"},
    ).json()

    # Commit to a date
    due_date = "2023-12-31T23:59:59+00:00"
    resp = client.patch(
        f"/tasks/{t['id']}", json={"due_date": due_date, "updated_at": t["updated_at"]}
    )
    updated = resp.json()

    # WHY: Date exists for measurement
    # Normalize Z to +00:00 for comparison
    actual = updated["due_date"].replace("Z", "+00:00")
    expected = due_date.replace("Z", "+00:00")

    assert actual == expected, (
        "Review must lock in a commitment date for CAR calculation"
    )
