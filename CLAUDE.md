# CoreTerra Project Overview - AI Assistant Guide

This document is designed to help AI assistants quickly understand the core concepts, architectural design, and key implementation details of the CoreTerra project. For detailed documentation, please refer to the relevant files in the `docs/` directory.

## 1. Core Project Philosophy

CoreTerra is a team collaboration system that deeply integrates the GTD (Getting Things Done) efficient workflow. Its core process follows the C·O·R·E model. Built on Git and plain text files, the system provides a completely transparent, auditable, and future-proof workflow management solution for both technical and non-technical teams.

### 1.1 Strategic Positioning

**Bridging the gap between personal productivity and team collaboration**: Traditional GTD methods suffer from coordination overhead and cognitive load in team environments. CoreTerra resolves this conflict structurally by enforcing the principle of "Roles are the Areas of Focus," binding task organization to established organizational roles.

**Key Constraint**: The sole necessary condition for any task to transition from `inbox` status to `active` status is that it must be assigned a `role_owner`. This is a core design of the system, ensuring that every unit of work can be attributed and audited.

### 1.2 Data-Driven Performance Quantification

The system introduces three core metrics to translate subjective team principles into quantifiable data:

- **PQI (Planning Quality Index)**: Measures the time efficiency between task capture and formal commitment to execution.
  - Formula: `PQI = timestamp_commitment - timestamp_capture`
- **CAR (Commitment Accuracy Rate)**: Measures whether tasks are completed within their committed deadlines.
  - Formula: `CAR(task) = 1 if timestamp_completion <= due_date else 0`
- **SCS (Standard Compliance Score)**: The average score from AI/peer reviews based on linked Standard requirements.

### 1.3 AI-Native Architecture

The system is designed from the ground up for deep integration with Large Language Models (LLMs):

- **Structured Plain Text Foundation**: Uses a hybrid format of YAML Frontmatter and Markdown Body, ensuring LLMs receive semantically clear and structured input.
- **Four Specialized AI Agents**:
  - **AI Reminder**: Context-aware pushes and reminders.
  - **AI Trainer**: Compliance guidance and onboarding training.
  - **AI Reviewer**: Process optimization and standard refinement.
  - **AI Participant**: Automated task execution.

### 1.4 Auditability

**Git as Audit Log**: Every creation, modification, or status change of a task must correspond to an atomic Git commit. Commit messages follow a standardized format, for example:
- `ADD: {Task ID} - {Task Title}`
- `COMPLETE: {Task ID}`
- `UPDATE: {Task ID} - {Change Description}`

This forms a complete, tamper-proof "audit trail," perfectly realizing the lineage tracking required by AI systems.

### 1.5 Non-Punitive Gamification Mechanism

- **Non-Punitive Design**: The system avoids direct negative penalties for failure.
- **Social Reinforcement Mechanism (Reverse Reward Allocation)**: When an individual adheres to principles (e.g., achieving high PQI), the main reward pool (XP/Gems) is distributed to **other team members**.
- **Dual Reward Structure**:
  - **XP (Experience Points)**: Predictable rewards tied to process completion.
  - **Gems**: Unpredictable rewards granted for excellence or rare achievements.

## 2. Core Workflow: C·O·R·E Model

The C·O·R·E workflow defines the unique lifecycle path for all tasks in the system from birth to archival:

1. **Capture**: The sole entry point for all ideas, requirements, and to-dos. Initial status is `inbox`.
2. **Clarify**: Clarify the nature of the task (single-step task, project, reference material).
3. **Organize**: Mandatorily link a `role_owner`, add metadata such as priority, due dates, tags, etc. Status flows from `inbox` to `active`.
4. **Review**: Periodically review the system, assess priorities, and set `timestamp_commitment`.
5. **Engage**: Actual work phase. Upon task completion, status flows to `completed`, and can eventually be archived as `archived`.

For details, please refer to: `docs/1-requirement.md`

## 3. Data Architecture: Hybrid Persistence Model

CoreTerra adopts an innovative hybrid persistence model, balancing data integrity and query performance:

### 3.1 SSOT (Single Source of Truth)

**MyST Markdown Files**:
- Each task is stored as an independent `.md` file.
- YAML Frontmatter stores structured metadata.
- Markdown Body stores unstructured content like detailed descriptions and notes.
- Version controlled by Git, providing immutable audit tracking.

### 3.2 SMI (Searchable Metadata Index)

**SQLite Database**:
- Only mirrors key metadata fields from Frontmatter.
- Used for high-performance query, filtering, and sorting operations.
- Does not store the detailed description (body) content of tasks.

### 3.3 Core Field Definitions

| Field Name | Type | Description |
|--------|------|------|
| `ct_id` | String (UUID) | Global unique identifier, used for event logging and process tracking |
| `status` | Enum | `inbox \| active \| completed \| archived` |
| `priority` | Integer | 1-5, where 5 is highest |
| `role_owner` | String | Responsible role for the task (**Mandatory**, forced constraint when moving from inbox to active) |
| `parent_id` | String (UUID, Optional) | ct_id of the parent task. Subtasks are independent task entities with complete lifecycles |
| `timestamp_capture` | DateTime (ISO 8601) | Time point when the task was captured |
| `timestamp_commitment` | DateTime (ISO 8601) | Time point when the task was formally committed to execution |
| `timestamp_completion` | DateTime (ISO 8601) | Time point when the task was completed |
| `due_date` | Date (ISO 8601) | Target date for committed completion |

**Subtask Design Note**: There is no independent "Subtask" type in the system, only "Tasks with a parent_id" and "Tasks without a parent_id". All tasks are independent entities with complete metadata and C·O·R·E lifecycles. When adding a subtask to a parent task, a new task is created and automatically enters the Inbox.

For detailed data model definitions, please refer to: `docs/2-data_schema.md`

### 3.4 Atomic Transactions

All Create, Update, and Delete (CUD) operations must strictly follow this sequence as an indivisible atomic transaction:

1.  **File System Write**: Create or update the corresponding `.md` MyST Markdown file.
2.  **Local Git Commit**: Stage and commit the file changes to the local Git repository.
3.  **SQLite Index Update**: Update the metadata index in the SQLite database.

If any step fails, corresponding rollback operations must be executed. For detailed implementation specifications, please refer to: `docs/5-dev_guide.md`

## 4. API and Concurrency Control

### 4.1 Core API Endpoints

- `POST /tasks/`: Create a new task.
- `GET /tasks/{task_id}`: Get task details (returns raw MyST Markdown string, frontend is responsible for rendering).
- `GET /tasks/{task_id}/history`：Retrieve the historical change log of a task (based on Git Log).
- `GET /tasks/`: Query task list (supports filtering by status, priority, tag, etc.).
- `PUT /tasks/{task_id}/status`: Update task status.
- `PATCH /tasks/{task_id}`: Modify task metadata.

All write operations are atomic, ensuring consistency across files, Git, and the database.

### 4.2 Optimistic Locking Concurrency Control

To prevent data overwrites caused by concurrent writes, the system implements an optimistic locking mechanism:

1.  The client includes the last known `updated_at` timestamp in the request.
2.  The backend queries the current `updated_at` value from the SQLite index before executing the write.
3.  If the timestamps do not match, a `409 Conflict` status code is returned.
4.  Upon receiving a conflict response, the client must forcibly refresh local data.

For detailed API contracts, please refer to: `docs/3-api_contract.md`

## 5. UI/UX Design Principles

### 5.1 "Text as Board" Philosophy

Simplify complex backend workflows into an intuitive text editing experience for users, ensuring that every significant operation generates a version-controlled, auditable data artifact.

### 5.2 Three-Column Layout

- **Left Column**: Role and Navigation Area (collapsible role list, team space switcher).
- **Middle Column**: Editor and List Core Workspace (TaskListView or TaskDetailView).
- **Right Column**: AI Console and Team Status Area (AI assistant console, team member status, recent activity stream).

### 5.3 Core Components

- **TaskListView**: Sortable, filterable task list supporting custom column display.
- **TaskDetailView**: Task detail editor integrating MyST Markdown rendering, supporting bidirectional data binding for interactive checkboxes, etc.

### 5.4 Interaction Principles

- **Keyboard First**: Global Command Palette (Cmd+K) supports quick operations.
- **Non-Intrusive Gamification Feedback**: XP, Gems, and other rewards appear briefly as inline tags to avoid interrupting user "flow".

For detailed UI/UX specifications, please refer to: `docs/4-ui_ux_spec.md`

## 6. Development Guidelines

### 6.1 Monorepo Structure

```
/backend    # FastAPI backend service, handling all data persistence logic
/frontend   # React frontend application, responsible for UI rendering and user interaction
/cli        # Command line tool, acting as a lightweight client for the API
```

**Important Constraint**: All business logic and data validation rules must reside only in the FastAPI backend. The CLI tool should always act as a "thin client," solely responsible for converting user commands into equivalent API calls.

### 6.2 FastAPI Synchronous Endpoint Design

All API endpoints handling file I/O and Git operations must be defined using synchronous `def` functions, not asynchronous `async def`:

- File writes and local Git commands are inherently blocking operations.
- FastAPI automatically executes synchronous functions in a dedicated thread pool, maintaining responsiveness of the main event loop.

### 6.3 Error Handling and Rollback Strategy

| Failure Stage | Rollback Operation |
|---------|---------|
| File Write Failure | Transaction aborts immediately, returns 500 Internal Server Error |
| Git Commit Failure | Revert file system changes, do not execute database operations, return 500 and log details |
| Database Update Failure | Trigger high-priority monitoring alert, return 500 and explicitly state that the index may be out of sync |

For detailed development guidelines, please refer to: `docs/5-dev_guide.md`

See `CONTRIBUTING.md` for detailed guidelines on Git branching, commit messages, TDD, and coding standards.

## 7. Testing Strategy

### 7.1 Three-Layer Testing Architecture

1.  **Unit Tests**: Use Pydantic models for data validation, ensuring data types, enum constraints, and mandatory fields.
2.  **Integration Tests**: Verify atomic transaction integrity, ensuring synchronized updates of the file system and SQLite index.
3.  **End-to-End Tests (E2E)**: Simulate full user workflows to verify the collaborative working of all system components.

### 7.2 "Third Verification" Core Acceptance Criteria

Any successful write operation must simultaneously satisfy:

1.  **Correct Client Feedback**: API returns the expected success response.
2.  **System State Consistency**: Subsequent read operations can query the changed data.
3.  **Audit Log Generation**: Executing `git log -- {ID}.md` command asserts that a new, well-formatted Git Commit has been created.

### 7.3 Performance Benchmarks

**End-to-End State Sync Latency**: The maximum tolerable latency from executing a state change command in the CLI to it being visible in the Web UI interface must not exceed **2 seconds**.

For detailed testing strategies, please refer to: `docs/6-test_strategy.md`

## 8. Key Design Constraints

During development, the following constraints must be strictly adhered to:

1.  **Mandatory role_owner Constraint**: Tasks must be assigned a `role_owner` when transitioning from `inbox` to `active`.
2.  **Atomic Transactions**: Strict sequence of File Write → Git Commit → Index Update; partial success is not allowed.
3.  **Git Commit Standardization**: All auto-generated commits must follow the `"[ACTION]: [Task Title]"` format.
4.  **Backend No Rendering Responsibility**: The backend only returns raw MyST Markdown strings; the frontend is fully responsible for rendering.
5.  **CLI/API Parity**: All business logic can only exist in the backend; the CLI acts as a thin client.

## 9. Document Index

- `docs/index.md`: Documentation navigation and overview
- `docs/0-project_overview.md`: Project strategy, architecture, and implementation brief
- `docs/1-requirement.md`: Product Requirement Document (PRD)
- `docs/2-data_schema.md`: Data model and metrics specifications
- `docs/3-api_contract.md`: API interface contract
- `docs/4-ui_ux_spec.md`: Interface and interaction specifications
- `docs/5-dev_guide.md`: Development guide and architecture specifications
- `docs/6-test_strategy.md`: Testing and acceptance strategy

---

*Document last updated: 2025*
