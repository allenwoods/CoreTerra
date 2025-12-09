from datetime import datetime
from typing import List, Optional
from enum import Enum
from pydantic import BaseModel, Field, UUID4

class Status(str, Enum):
    INBOX = "inbox"
    ACTIVE = "active"
    NEXT = "next"
    WAITING = "waiting"
    DONE = "done"
    COMPLETED = "completed"
    ARCHIVED = "archived"

class Priority(str, Enum):
    P1 = "1"
    P2 = "2"
    P3 = "3"
    P4 = "4"
    P5 = "5"

class Role(str, Enum):
    BACKEND_ENGINEER = "backend-engineer"
    FRONTEND_DEV = "frontend-dev"
    ARCHIVIST = "archivist"
    BACKEND_LEAD = "backend-lead"
    # Add other roles as needed

class TaskType(str, Enum):
    CAPTURE = "Capture"
    NEXT_ACTION = "NextAction"
    PROJECT = "Project"
    REFERENCE = "Reference"
    WAITING_FOR = "WaitingFor"

class User(BaseModel):
    user_id: UUID4
    username: str
    email: str
    roles: List[Role]
    body: Optional[str] = None # Added body to support MyST markdown mapping

class TaskMetadataBase(BaseModel):
    """Task metadata base model, mapping to MyST frontmatter."""
    task_id: UUID4 # Explicitly requested field for ID
    title: str
    status: Status
    priority: Priority
    user_id: UUID4
    tags: Optional[List[str]] = None
    due_date: Optional[datetime] = None
    parent_id: Optional[UUID4] = None
    role_owner: Optional[Role] = None
    type: Optional[TaskType] = None
    capture_timestamp: datetime # Renamed from timestamp_capture as requested
    completion_timestamp: Optional[datetime] = None # Renamed from timestamp_completion for consistency
    updated_at: datetime

class TaskMetadataResponse(TaskMetadataBase):
    """Task response model including system-generated metadata."""
    id: UUID4 = Field(validation_alias="task_id") # Map task_id to id for API response if needed, or just expose task_id

    class Config:
        populate_by_name = True

class TaskFullResponse(TaskMetadataResponse):
    """Full task response model including body."""
    body: str  # Raw MyST Markdown string

class TaskCreateRequest(BaseModel):
    """Request model for creating a new task."""
    title: str
    user_id: UUID4
    priority: Optional[Priority] = Priority.P3
    tags: Optional[List[str]] = None
    body: Optional[str] = ""
    role_owner: Optional[Role] = None
    type: TaskType = TaskType.CAPTURE

class TaskStatusUpdateRequest(BaseModel):
    status: Status
    user_id: UUID4
    updated_at: datetime

class TaskMetadataPatchRequest(BaseModel):
    priority: Optional[Priority] = None
    due_date: Optional[datetime] = None
    tags: Optional[List[str]] = None
    role_owner: Optional[Role] = None
    type: Optional[TaskType] = None
    title: Optional[str] = None
    updated_at: datetime
