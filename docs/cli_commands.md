# CoreTerra CLI Command Design

This document outlines the design for the CoreTerra Command Line Interface (CLI).

## Design Philosophy
The CLI follows the C-C-O-R-E workflow (Capture, Clarify, Organize, Review, Engage) and provides a scriptable, keyboard-first interface for power users.

## Configuration
*   **Path**: `~/.coreterra/config.json`
*   **Content**: `{"user_id": "...", "api_url": "..."}`
*   **Env Vars**: `COT_API_URL` overrides config.

## Commands

### 0. Auth
*   **Command**: `core login [username]`
*   **Description**: Authenticates with the backend and saves the user ID locally.
*   **Backend**: `POST /auth/login`

### 1. Capture
*   **Command**: `core capture "Title" [options]`
*   **Options**:
    *   `--body / -b`: Description body.
    *   `--priority / -p`: Priority (1-5).
*   **Backend**: `POST /tasks/`

### 2. Clarify
*   **Command**: `core clarify <task_id> [options]`
*   **Description**: Update metadata (Role, Priority, Tags, Title).
*   **Options**:
    *   `--role / -r`: Role owner (e.g., 'backend-engineer').
    *   `--priority / -p`: Priority.
    *   `--tags / -t`: Comma-separated tags.
    *   `--due / -d`: Due date (YYYY-MM-DD).
*   **Backend**: `PATCH /tasks/{id}`
*   **Logic**: Fetches task to get `updated_at`, then sends PATCH request.

### 3. Organize
*   **Command**: `core organize <task_id> [options]`
*   **Description**: Move task to a different container (Status).
*   **Options**:
    *   `--status / -s`: Status (next, waiting, inbox).
*   **Backend**: `PUT /tasks/{id}/status`
*   **Logic**: Fetches task to get `updated_at`, then sends PUT request.

### 4. Review
*   **Command**: `core list [options]`
*   **Options**:
    *   `--status / -s`: Filter by status.
    *   `--role / -r`: Filter by role.
    *   `--limit / -n`: Limit results.
*   **Backend**: `GET /tasks/`

*   **Command**: `core show <task_id>`
*   **Backend**: `GET /tasks/{id}`

### 5. Engage
*   **Command**: `core complete <task_id>`
*   **Description**: Mark task as done.
*   **Backend**: `PUT /tasks/{id}/status` (status='done')

## Backend Mapping

| CLI Command | Backend Endpoint | Notes |
| :--- | :--- | :--- |
| `core login` | `POST /auth/login` | **New Endpoint Required** |
| `core capture` | `POST /tasks/` | Existing |
| `core clarify` | `PATCH /tasks/{id}` | Existing |
| `core organize` | `PUT /tasks/{id}/status` | Existing |
| `core list` | `GET /tasks/` | Existing |
| `core show` | `GET /tasks/{id}` | Existing |
| `core complete` | `PUT /tasks/{id}/status` | Existing |
