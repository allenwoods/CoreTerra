# Data Flow & Architecture

This document describes the data flow design of the CoreTerra system, clarifying how data moves between the Client (Web/CLI), the Backend Handler, and the Dual-Storage Layer (SQLite & Git-backed Markdown).

## High-Level Diagram

```mermaid
graph TD
    subgraph Client ["Client Layer (Web / CLI)"]
        Input["Task Input (Capture)"]
        Query["Task Query (List/Detail)"]
        Mod["Task Modification (Clarify/Organize)"]
        History["History Query (Audit)"]
    end

    subgraph Backend ["Backend Layer (FastAPI)"]
        Handler["Request Handler"]
    end

    subgraph Storage ["Storage Layer"]
        DB[("Metadata Index (SQLite)")]
        FS["File System (MyST Markdown)"]
        Git["Git Version Control"]
    end

    %% Flows
    Input -->|POST /tasks/| Handler
    Query -->|GET /tasks/| Handler
    Mod -->|PATCH /tasks/{id}| Handler
    History -->|GET /tasks/{id}/history| Handler

    %% Handler Interactions
    Handler -->|1. Write .md| FS
    FS -.->|2. Commit| Git
    Handler -->|3. Update Index| DB

    Handler -->|Read Index (List)| DB
    Handler -->|Read Content (Detail)| FS
    Handler -->|Read Log| Git
```

## Detailed Data Flows

### 1. Task Input (Capture)
*Goal: Rapidly record a new task into the Inbox.*

1.  **Client**: Sends `POST /tasks/` with `title`, `priority`, etc.
2.  **Handler**:
    *   Generates a new `task_id` (UUID).
    *   Sets status to `INBOX`.
3.  **Storage (Write)**:
    *   **File System**: Creates `data/{task_id}.md` with frontmatter (metadata) and body.
    *   **Git**: Adds the file and creates a commit: `ADD: {title}`.
    *   **SQLite**: Inserts the record into the `tasks` table for fast indexing.
4.  **Response**: Returns the created task metadata to the client.

### 2. Task Query
*Goal: Retrieve task information efficiently.*

#### A. List Tasks
1.  **Client**: Sends `GET /tasks/?status=active&sort_by=priority`.
2.  **Handler**: Parses filters.
3.  **Storage (Read)**: Queries **SQLite** database. This avoids parsing thousands of markdown files and ensures high performance.
4.  **Response**: Returns a list of `TaskMetadataResponse` objects.

#### B. Task Detail
1.  **Client**: Sends `GET /tasks/{task_id}`.
2.  **Handler**: specific ID lookup.
3.  **Storage (Read)**: Reads `data/{task_id}.md` from the **File System**.
    *   *Why?* The file is the Source of Truth. If there is a sync discrepancy, the file wins. It also contains the full `body` text which might not be fully indexed in SQLite.
4.  **Response**: Returns `TaskFullResponse` (Metadata + Body).

### 3. Task Modification (Clarify / Organize)
*Goal: Update task properties (Status, Priority, Content) with safety checks.*

1.  **Client**:
    *   First, performs a **Read** (Flow 2B) to get the current `updated_at` timestamp.
    *   Sends `PATCH /tasks/{task_id}` or `PUT /tasks/{task_id}/status` including `updated_at`.
2.  **Handler**:
    *   **Optimistic Locking**: Compares request's `updated_at` with the current server state. If they differ, aborts with `409 Conflict`.
3.  **Storage (Write)**:
    *   **File System**: Updates the frontmatter/body of `data/{task_id}.md`.
    *   **Git**: Commits the change: `UPDATE: {task_id} - status -> next`.
    *   **SQLite**: Updates the corresponding row in the `tasks` table.
4.  **Response**: Returns the updated task metadata.

### 4. History Query (Planned)
*Goal: View the evolution of a task.*

> **Note**: This feature is currently in the planning phase. See [Implementation Plan: Git History API](plan/08-git-history-api.md).

1.  **Client**: Sends `GET /tasks/{task_id}/history`.
2.  **Handler**: Requests history for the specific file.
3.  **Storage (Read)**: Uses `git log` on `data/{task_id}.md` to retrieve commit history (Author, Timestamp, Message).
4.  **Response**: Returns a list of history items.
