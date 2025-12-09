import pytest
from datetime import datetime, timedelta
from fastapi.testclient import TestClient
from tests.schemas import TaskCreateRequest, TaskMetadataResponse, TaskFullResponse, TaskStatusUpdateRequest, TaskMetadataPatchRequest

# Helper to verify standard fields
def verify_task_response(task_data: dict, expected_title: str):
    assert task_data["title"] == expected_title
    assert "id" in task_data
    assert "status" in task_data
    assert "created_at" in task_data
    assert "updated_at" in task_data

def test_load_existing_data(client, seeded_workspace):
    """
    Scenario 1: Load Existing Data.
    Verify that the system correctly reads and indexes the seeded fixture files.
    """
    # Assuming the backend has a way to list tasks.
    # Note: Since the current main.py doesn't have the implementation, this test will fail until implemented.
    # We are testing the expectation.

    # We might need to trigger a sync/index here if the app doesn't do it on startup.
    # For now, we assume GET /tasks/ should return the tasks from the disk.

    response = client.get("/tasks/")
    # If the endpoint is not implemented, it might return 404 or 500 or just empty list depending on implementation
    # But for TDD, we assert 200 and expect the data.

    assert response.status_code == 200
    tasks = response.json()

    # We expect 2 tasks from fixtures
    assert len(tasks) >= 2

    titles = [t["title"] for t in tasks]
    assert "Test Task" in titles
    assert "Test Subtask" in titles

    # Verify details of one task
    test_task = next(t for t in tasks if t["title"] == "Test Task")
    assert test_task["status"] == "inbox"
    assert test_task["priority"] == 3
    assert test_task["role_owner"] == "backend-engineer"

def test_core_lifecycle(client, temp_workspace):
    """
    Scenario 2: C-C-O-R-E Lifecycle Verification.
    Capture -> Clarify -> Organize -> Review -> Engage
    """
    # 1. Capture
    create_payload = TaskCreateRequest(
        title="New Feature",
        user_id="dev1",
        priority=3,
        tags=["feature"],
        body="Implement login",
        type="Capture"
    )
    response = client.post("/tasks/", json=create_payload.model_dump())
    assert response.status_code == 201
    created_task = response.json()
    task_id = created_task["id"]

    assert created_task["title"] == "New Feature"
    assert created_task["status"] == "inbox" # Default status for captured items
    assert created_task["type"] == "Capture"

    # 2. Clarify (Update body/description)
    # We use PATCH to update metadata, but clarifying often involves changing the body too.
    # The API contract separates metadata update (PATCH) and potentially body update?
    # The contract says PATCH /tasks/{id} is for "Modify Metadata".
    # Does it support body update? The schema `TaskMetadataPatchRequest` does NOT have `body`.
    # Wait, the contract in docs/3-api_contract.md defines `TaskMetadataPatchRequest` without `body`.
    # But `TaskCreateRequest` has `body`.
    # Usually `PUT` or a specific endpoint is used for content.
    # Let's assume for now we clarify by updating metadata like tags or title,
    # or if the implementation allows body update via PATCH (despite strict schema in docs, often needed).
    # If not, maybe we can't update body via API yet?
    # Re-reading docs: "3.2 Retrieve Task... body is Raw MyST".
    # "3.5 Modify Metadata... PATCH ... TaskMetadataPatchRequest".
    # It seems body update isn't explicitly in 3.5.
    # Let's assume we proceed with Metadata updates for now as per contract.

    # Let's assume Clarify involves adding more tags or changing title.
    patch_payload = {
        "title": "New Feature: Login",
        "tags": ["feature", "auth"],
        "updated_at": created_task["updated_at"] # Optimistic locking
    }
    response = client.patch(f"/tasks/{task_id}", json=patch_payload)
    assert response.status_code == 200
    updated_task = response.json()
    assert updated_task["title"] == "New Feature: Login"
    assert "auth" in updated_task["tags"]

    # 3. Organize (Set role_owner, type, status to active/next)
    # Moving from Inbox to Active usually happens here.
    organize_payload = {
        "role_owner": "frontend-dev",
        "type": "NextAction",
        "updated_at": updated_task["updated_at"]
    }
    # We might need to change status too.
    # The contract has specific `PUT /tasks/{id}/status`.
    # But let's see if PATCH handles generic metadata including role_owner/type.
    response = client.patch(f"/tasks/{task_id}", json=organize_payload)
    assert response.status_code == 200
    organized_task = response.json()
    assert organized_task["role_owner"] == "frontend-dev"

    # Now update status to active
    status_payload = {
        "status": "active",
        "user_id": "dev1",
        "updated_at": organized_task["updated_at"]
    }
    response = client.put(f"/tasks/{task_id}/status", json=status_payload)
    assert response.status_code == 200
    active_task = response.json()
    assert active_task["status"] == "active"

    # 4. Review (Set priority, commitment time)
    review_payload = {
        "priority": 5,
        "updated_at": active_task["updated_at"]
        # commitment timestamp might be auto-set when moving to active or manually set?
        # Contract doesn't explicitly show timestamp field in PatchRequest, but `TaskMetadataBase` has it?
        # No, `TaskMetadataPatchRequest` has `priority`, `due_date`.
        # `timestamp_commitment` is system managed usually.
    }
    response = client.patch(f"/tasks/{task_id}", json=review_payload)
    assert response.status_code == 200
    reviewed_task = response.json()
    assert reviewed_task["priority"] == 5

    # 5. Engage (Complete the task)
    complete_payload = {
        "status": "completed",
        "user_id": "dev1",
        "updated_at": reviewed_task["updated_at"]
    }
    response = client.put(f"/tasks/{task_id}/status", json=complete_payload)
    assert response.status_code == 200
    completed_task = response.json()
    assert completed_task["status"] == "completed"
    assert completed_task["completed_at"] is not None

def test_list_and_filtering(client, temp_workspace):
    """
    Scenario 3: List and Filtering.
    """
    # Create a few tasks
    t1 = client.post("/tasks/", json={"title": "T1", "user_id": "u1", "priority": 1, "status": "active"}).json() # assuming status default inbox
    # Wait, create request doesn't allow setting status directly usually, it defaults.
    # If we want to test filtering, we need to update them.

    # Let's rely on default status 'inbox' for T1

    # T2: Priority 5
    t2 = client.post("/tasks/", json={"title": "T2", "user_id": "u1", "priority": 5}).json()

    # Filter by priority
    response = client.get("/tasks/?priority=5")
    assert response.status_code == 200
    results = response.json()
    assert len(results) == 1
    assert results[0]["id"] == t2["id"]

    # Filter by status (default inbox)
    response = client.get("/tasks/?status=inbox")
    assert response.status_code == 200
    results = response.json()
    assert len(results) >= 2 # T1 and T2

def test_optimistic_locking(client, temp_workspace):
    """
    Scenario 4: Optimistic Locking.
    """
    # Create a task
    create_res = client.post("/tasks/", json={"title": "Lock Test", "user_id": "u1"}).json()
    task_id = create_res["id"]
    original_updated_at = create_res["updated_at"]

    # Simulate User A updates the task
    update_res_a = client.patch(f"/tasks/{task_id}", json={
        "priority": 5,
        "updated_at": original_updated_at
    })
    assert update_res_a.status_code == 200
    new_updated_at = update_res_a.json()["updated_at"]

    # Simulate User B tries to update using the OLD timestamp
    update_res_b = client.patch(f"/tasks/{task_id}", json={
        "priority": 4,
        "updated_at": original_updated_at # STALE
    })

    # Should fail with 409 Conflict
    assert update_res_b.status_code == 409

def test_data_schema_validation(client, temp_workspace):
    """
    Scenario 5: Data Schema & Validation.
    """
    # Invalid Priority (>5)
    response = client.post("/tasks/", json={
        "title": "Invalid Priority",
        "user_id": "u1",
        "priority": 6
    })
    assert response.status_code == 422 # Validation Error

    # Missing required field title
    response = client.post("/tasks/", json={
        "user_id": "u1"
    })
    assert response.status_code == 422
