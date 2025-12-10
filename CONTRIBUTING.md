# Contribution Guidelines

## Development Methodology

### Test-Driven Development (TDD)
CoreTerra mandates a strict **Red-Green-Refactor** TDD cycle for all feature development and bug fixes.

1.  **Red**: Write a failing test that defines the desired behavior or reproduces the bug.
    *   **Backend**: Use `pytest`.
    *   **Frontend**: Use `vitest`.
2.  **Green**: Write the minimum amount of code necessary to make the test pass.
3.  **Refactor**: Clean up the code while ensuring tests remain green.

## Testing Principles

CoreTerra follows a strict testing philosophy centered on **WHY** we are testing, rather than just **WHAT** the code does.

### The "WHY over WHAT" Principle

When writing tests, do not just verify that a field exists or a value is equal to X. Instead, verify the *business intent* or the *architectural invariant* that the code is supposed to uphold.

*   **Bad (WHAT):** `assert "ct_id" in task`
*   **Good (WHY):** `assert task1.ct_id != task2.ct_id` (Verifies the invariant that every task has a unique identity).

### Test Structure

Integration tests are organized by the user workflow stages (C-C-O-R-E):

1.  **Capture (`test_capture.py`):** Focuses on identity creation, timeline origin, and initial state (Inbox).
2.  **Clarify (`test_clarify.py`):** Focuses on context enrichment without identity mutation.
3.  **Organize (`test_organize.py`):** Focuses on accountability (Role Owner) and classification (Type).
4.  **Review (`test_review.py`):** Focuses on prioritization hierarchy and commitment (Due Dates).
5.  **Engage (`test_engage.py`):** Focuses on execution, causality (End > Start), and reliability metrics (CAR).

Please adhere to this structure when adding new feature tests.

## Git Workflow

### Branch Naming
Branch names should follow the format `type/description-kebab-case`.
*   `feat/`: New features (e.g., `feat/user-login`)
*   `fix/`: Bug fixes (e.g., `fix/data-race`)
*   `chore/`: Maintenance, dependency updates (e.g., `chore/update-deps`)
*   `docs/`: Documentation only changes
*   `refactor/`: Code changes that neither fix a bug nor add a feature

### Commit Messages
We distinguish between **Source Code Commits** and **Application Data Commits**.

**1. Source Code Commits (Developers)**
Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:
*   `feat: add user login endpoint`
*   `fix: resolve race condition in file save`
*   `chore: update fast-api dependency`

**2. Application Data Commits (System)**
As defined in `CLAUDE.md`, the application itself generates commits for data persistence using a specific format (e.g., `ADD: {Task ID} - {Task Title}`). **Do not use this format for source code changes.**

## Coding Standards

### Naming Conventions

**Python (Backend)**
*   **Variables/Functions**: `snake_case` (e.g., `calculate_total`, `user_id`)
*   **Files**: `snake_case` (e.g., `task_manager.py`)
*   **Classes**: `PascalCase` (e.g., `TaskRepository`)

**JavaScript/React (Frontend)**
*   **Variables/Functions**: `camelCase` (e.g., `handleClick`, `taskId`)
*   **Components**: `PascalCase` (e.g., `TaskList`, `Button`)
*   **Files**: `kebab-case` (e.g., `task-list.jsx`, `api-client.js`)

### Linting and Formatting
*   **Python**: We use `black` for code formatting.
*   **JavaScript**: We use `eslint` for linting.
Ensure your code passes these checks before pushing.

## Documentation Guidelines

### When to Document
*   **New Features**: Update `docs/` with relevant design decisions or usage guides.
*   **Architecture Changes**: Update `docs/5-dev_guide.md` or `docs/2-data_schema.md` if data structures change.
*   **Public API**: Ensure docstrings and API docs are updated.

### Where to Store
*   **Project Documentation**: Stored in `docs/` directory.
*   **Code Comments**: Use sparingly; prefer self-documenting code. Use docstrings for public interfaces.
