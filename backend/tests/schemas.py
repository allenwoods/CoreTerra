from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field

class TaskMetadataBase(BaseModel):
    """Task metadata base model, mapping to MyST frontmatter."""
    title: str
    status: str
    priority: int = Field(..., ge=1, le=5)  # Priority range 1 (low) to 5 (urgent)
    user_id: str
    tags: Optional[List[str]] = None
    due_date: Optional[datetime] = None
    parent_id: Optional[str] = None
    role_owner: Optional[str] = None # Added based on data_schema.md
    type: Optional[str] = None # Added based on project_overview.md

class TaskMetadataResponse(TaskMetadataBase):
    """Task response model including system-generated metadata."""
    ct_id: str = Field(alias="id") # Mapping ct_id to id for API consistency if needed, or keeping ct_id
    created_at: datetime = Field(alias="timestamp_capture")
    updated_at: datetime
    completed_at: Optional[datetime] = Field(None, alias="timestamp_completion")

    class Config:
        populate_by_name = True

class TaskFullResponse(TaskMetadataResponse):
    """Full task response model including body."""
    body: str  # Raw MyST Markdown string, NOT HTML

class TaskCreateRequest(BaseModel):
    """Request model for creating a new task."""
    title: str
    user_id: str
    priority: Optional[int] = Field(3, ge=1, le=5)
    tags: Optional[List[str]] = None
    body: Optional[str] = ""
    role_owner: Optional[str] = None # Optional at creation? Capture phase might not have it yet.
    type: str = "Capture"

class TaskStatusUpdateRequest(BaseModel):
    """Request model for updating task status."""
    status: str
    user_id: str
    updated_at: datetime  # For optimistic locking

class TaskMetadataPatchRequest(BaseModel):
    """Request model for partial metadata update."""
    priority: Optional[int] = Field(None, ge=1, le=5)
    due_date: Optional[datetime] = None
    tags: Optional[List[str]] = None
    role_owner: Optional[str] = None
    type: Optional[str] = None
    title: Optional[str] = None
    updated_at: datetime  # Required for optimistic locking
