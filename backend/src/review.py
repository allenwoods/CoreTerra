from fastapi import APIRouter, HTTPException
from typing import List, Optional
from src.schemas import TaskMetadataResponse, TaskFullResponse, TaskHistoryItem
from src.storage import get_task, list_tasks, get_task_history
from uuid import UUID

router = APIRouter()


@router.get("/tasks/{task_id}", response_model=TaskFullResponse)
def read_task(task_id: UUID):
    """
    Retrieves a specific task by ID.
    """
    task = get_task(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.get("/tasks/", response_model=List[TaskMetadataResponse])
def read_tasks(
    status: Optional[str] = None,
    priority: Optional[str] = None,
    tag: Optional[str] = None,
    sort_by: Optional[str] = None,
    order: Optional[str] = "asc",
    limit: Optional[int] = None,
    offset: Optional[int] = 0,
):
    """
    Lists tasks, optionally filtered by status, priority, tag, with pagination support.
    """
    filters = {}
    if status:
        filters["status"] = status
    if priority:
        filters["priority"] = priority

    return list_tasks(
        filters, tag=tag, sort_by=sort_by, order=order, limit=limit, offset=offset
    )


@router.get("/tasks/{task_id}/history", response_model=List[TaskHistoryItem])
def read_task_history(
    task_id: UUID,
    limit: Optional[int] = None
):
    """
    Retrieves the Git commit history for a specific task.

    Returns:
        List of commit history items, ordered from newest to oldest

    Note:
        - Returns empty list if task not found (not 404)
        - This is intentional to distinguish between "task never existed"
          vs "task exists but has no history"
    """
    history_data = get_task_history(task_id, limit=limit)

    # Convert dict list to Pydantic models
    return [TaskHistoryItem(**item) for item in history_data]
