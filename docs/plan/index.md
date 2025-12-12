# Frontend Connection Implementation Plans

This directory contains the detailed implementation plans for connecting the CoreTerra React frontend to the FastAPI backend.

## Plan Index & Status

| ID | Plan Name | Description | Status | Dependencies |
| :--- | :--- | :--- | :--- | :--- |
| **01** | [Environment & API Setup](./01-setup.md) | Configures `axios`, CORS, and environment variable loading. | 🟢 Completed | None |
| **02** | [Authentication & User Context](./02-auth.md) | Implements Login page, `UserContext`, and route protection. | 🟢 Completed | 01 |
| **03** | [Task List View](./03-list-view.md) | Connects the Inbox/Kanban views to the `GET /tasks/` API. | 🟢 Completed | 01, 02 (for user context) |
| **04** | [Task Detail View & MyST](./04-detail-view.md) | Implements full task details, MyST rendering, and optimistic locking updates. | 🟢 Completed | 03 |
| **05** | [Task Capture & Creation](./05-creation.md) | Connects the Quick Add and Create Modal to `POST /tasks/`. | 🟢 Completed | 03 (to refresh list) |
| **06** | [User & Settings](./06-user-settings.md) | Adds a Settings page to view user profile and system config. | 🟢 Completed | 02 |
| **07** | [CI/CD & Testing](./07-ci-cd.md) | Sets up `vitest` and GitHub Actions for frontend quality assurance. | 🟢 Completed | 01 |
| **08** | [Git History API](./08-git-history-api.md) | Exposes the task version history via `GET /tasks/{task_id}/history`. | ⚪ Ready | 04 |

## Execution Flow

1.  **Foundation (01 & 02):** We must first establish the API connection and Authentication context. All subsequent data fetching relies on the authenticated `user_id` and the configured `api` client.
2.  **Core Features (03, 04, 05):**
    *   **03 (List)** is the primary view.
    *   **05 (Creation)** feeds into the list.
    *   **04 (Detail)** allows deep interaction with items from the list.
3.  **Enhancement (06):** The Settings page provides visibility into the user context established in 02.
4.  **Assurance (07):** CI/CD setup ensures that as we implement these features, we maintain code quality.

## Legend
- ⚪ Ready: Plan drafted and approved.
- 🟡 In Progress: Implementation started.
- 🟢 Completed: Implementation verified and merged.
