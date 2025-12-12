from fastapi import APIRouter, HTTPException
from datetime import datetime, timezone
from uuid import UUID
from src.schemas import TaskMetadataPatchRequest, TaskMetadataResponse
from src.storage import get_task, save_task

router = APIRouter()

@router.patch("/tasks/{task_id}", response_model=TaskMetadataResponse)
def clarify_task(task_id: UUID, request: TaskMetadataPatchRequest):
    """
    Clarifies a task by updating its metadata (title, tags, etc.).
    Corresponds to the 'Clarify' phase.
    Enforces optimistic locking via `updated_at`.
    """

    # 1. Fetch current task
    current_task = get_task(task_id)
    if not current_task:
        raise HTTPException(status_code=404, detail="Task not found")

    # 2. Check Optimistic Lock
    # Note: Pydantic parses ISO strings to datetime objects, so we compare datetimes directly.
    # However, depending on precision, inequality might be tricky.
    # Let's ensure we compare them correctly.
    if request.updated_at != current_task.updated_at:
        raise HTTPException(
            status_code=409,
            detail=f"Conflict: Task has been modified. Client version: {request.updated_at}, Server version: {current_task.updated_at}"
        )

    # 3. Apply Updates
    # We update the fields that are present in the request
    # Note: current_task is TaskFullResponse, inheriting from TaskMetadataBase

    # Create a copy of the model to update
    updated_metadata = current_task.model_copy()

    commit_parts = []

    if request.title is not None:
        updated_metadata.title = request.title
        commit_parts.append(f"title -> '{request.title}'")

    if request.tags is not None:
        updated_metadata.tags = request.tags
        commit_parts.append(f"tags -> {request.tags}")

    if request.priority is not None:
        updated_metadata.priority = request.priority
        commit_parts.append(f"priority -> {request.priority}")

    if request.due_date is not None:
        updated_metadata.due_date = request.due_date
        commit_parts.append(f"due_date -> {request.due_date}")

    if request.role_owner is not None:
        updated_metadata.role_owner = request.role_owner
        commit_parts.append(f"role_owner -> {request.role_owner}")

    if request.type is not None:
        updated_metadata.type = request.type
        commit_parts.append(f"type -> {request.type}")

    # Handle body update
    body_to_save = current_task.body
    if request.body is not None:
        body_to_save = request.body
        commit_parts.append(f"body updated ({len(request.body)} chars)")

    # Update timestamp
    now = datetime.now(timezone.utc)
    updated_metadata.updated_at = now

    # 4. Save
    commit_msg = f"UPDATE: {task_id} - " + ", ".join(commit_parts)

    # Save with the updated body (if provided) or existing body
    saved_task = save_task(task_id, updated_metadata, body_to_save, commit_msg)

    return saved_task
