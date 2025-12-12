from fastapi import APIRouter
from datetime import datetime, timezone
import uuid
from src.schemas import TaskCreateRequest, TaskMetadataBase, Status, TaskMetadataResponse
from src.storage import save_task

router = APIRouter()

@router.post("/tasks/", response_model=TaskMetadataResponse, status_code=201)
def capture_task(request: TaskCreateRequest):
    """
    Captures a new task into the Inbox.
    Corresponds to the 'Capture' phase of C-O-R-E.
    """

    # Generate new Task ID
    task_id = uuid.uuid4()
    now = datetime.now(timezone.utc)

    # Construct Metadata
    metadata = TaskMetadataBase(
        task_id=task_id,
        title=request.title,
        status=Status.INBOX, # Force Inbox
        priority=request.priority,
        user_id=request.user_id,
        tags=request.tags,
        role_owner=request.role_owner,
        type=request.type,
        capture_timestamp=now,
        updated_at=now
    )

    # Commit Message
    commit_msg = f"ADD: {request.title}"

    # Save
    saved_task = save_task(task_id, metadata, request.body or "", commit_msg)

    return saved_task
