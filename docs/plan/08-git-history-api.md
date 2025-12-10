# Plan: Git History API

## Goal
Expose the version history of a task to the user. Since the backend uses Git as the underlying storage for the source of truth (`.md` files), we can leverage `git log` to show how a task has evolved over time.

## User Story
As a user, I want to see the history of changes for a specific task so that I can audit modifications or revert to a previous state if necessary.

## Proposed API

### Endpoint
`GET /tasks/{task_id}/history`

### Response Schema
```json
[
  {
    "commit_hash": "a1b2c3d...",
    "author": "User Name",
    "timestamp": "2023-10-27T10:00:00Z",
    "message": "UPDATE: Clarified title",
    "changes": [
      "title: Old Title -> New Title"
    ]
  },
  ...
]
```

## Implementation Details

1.  **Backend (`src/review.py` & `src/storage.py`)**:
    *   Add a function `get_task_history(task_id: UUID)` in `storage.py`.
    *   Use `GitPython` to iterate over commits affecting `data/{task_id}.md`.
    *   Extract metadata (hash, author, date, message).
    *   (Optional) Parse the diff to show specific field changes.

2.  **Schema (`src/schemas.py`)**:
    *   Define `TaskHistoryItem` model.

3.  **Frontend/CLI**:
    *   Update `Task Detail` view to fetch and display this list.
