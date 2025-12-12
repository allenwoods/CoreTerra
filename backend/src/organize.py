from fastapi import APIRouter, HTTPException
from datetime import datetime, timezone
from uuid import UUID
from src.schemas import TaskStatusUpdateRequest, TaskMetadataResponse, Status
from src.storage import get_task, save_task

router = APIRouter()


@router.put("/tasks/{task_id}/status", response_model=TaskMetadataResponse)
def update_task_status(task_id: UUID, request: TaskStatusUpdateRequest):
    """
    Updates the status of a task.
    Corresponds to state transitions (e.g. Organize -> Active, Engage -> Done).
    Enforces business rules (e.g. Role Owner required for Active).
    """

    # 1. Fetch current task
    current_task = get_task(task_id)
    if not current_task:
        raise HTTPException(status_code=404, detail="Task not found")

    # 2. Check Optimistic Lock
    if request.updated_at != current_task.updated_at:
        raise HTTPException(
            status_code=409,
            detail=f"Conflict: Task has been modified. Client version: {request.updated_at}, Server version: {current_task.updated_at}",
        )

    # 3. Enforce Business Rules

    # Rule: Cannot move to ACTIVE (or NEXT/WAITING) without a Role Owner
    if request.status in [Status.ACTIVE, Status.NEXT, Status.WAITING]:
        if not current_task.role_owner:
            raise HTTPException(
                status_code=400,
                detail="Cannot activate task without a Role Owner. Please assign a role first.",
            )

    # 4. Apply Update
    updated_metadata = current_task.model_copy()
    updated_metadata.status = request.status

    now = datetime.now(timezone.utc)
    updated_metadata.updated_at = now

    # Set completion timestamp if done
    if request.status in [Status.DONE, Status.COMPLETED]:
        if not updated_metadata.completion_timestamp:
            updated_metadata.completion_timestamp = now

    # Set commitment timestamp if becoming active/next for the first time
    if (
        request.status in [Status.ACTIVE, Status.NEXT]
        and current_task.status == Status.INBOX
    ):
        if not updated_metadata.commitment_timestamp:
            updated_metadata.commitment_timestamp = now

    # 5. Save
    commit_msg = f"UPDATE: {task_id} - status -> {request.status.value}"
    saved_task = save_task(task_id, updated_metadata, current_task.body, commit_msg)

    return saved_task
