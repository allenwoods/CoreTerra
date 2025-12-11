from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, UUID4, ConfigDict
from src.config import (
    create_enum_from_config,
    get_default_priority,
    get_default_task_type
)

# Create enums dynamically from centralized config
Status = create_enum_from_config("Status", "statuses")
Priority = create_enum_from_config("Priority", "priorities")
Role = create_enum_from_config("Role", "roles")
TaskType = create_enum_from_config("TaskType", "task_types")

class User(BaseModel):
    user_id: UUID4
    username: str
    email: str
    role: Role
    avatar: str
    color: str
    level: int = 1
    experience: int = 0
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
    capture_timestamp: datetime
    commitment_timestamp: Optional[datetime] = None
    completion_timestamp: Optional[datetime] = None
    updated_at: datetime

class TaskMetadataResponse(TaskMetadataBase):
    """Task response model including system-generated metadata."""
    model_config = ConfigDict(populate_by_name=True)

    id: UUID4 = Field(validation_alias="task_id") # Map task_id to id for API response if needed, or just expose task_id


class TaskFullResponse(TaskMetadataResponse):
    """Full task response model including body."""
    body: str  # Raw MyST Markdown string

class TaskCreateRequest(BaseModel):
    """Request model for creating a new task."""
    title: str
    user_id: UUID4
    priority: Optional[Priority] = Field(default_factory=lambda: Priority(get_default_priority()))
    tags: Optional[List[str]] = None
    body: Optional[str] = ""
    role_owner: Optional[Role] = None
    type: TaskType = Field(default_factory=lambda: TaskType(get_default_task_type()))

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
