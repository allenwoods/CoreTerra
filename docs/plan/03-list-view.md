# Plan 03: Task List View

## Goal
Connect the main dashboard (Task List) to the backend.

## Steps

1.  **API Service Functions**
    -   In `frontend/src/lib/api.ts` (or `services/tasks.ts`), add:
        -   `fetchTasks(filters?: TaskFilters)`: Calls `GET /tasks/`.
        -   Support query params: `status`, `priority`, `limit`.

2.  **Task List Component**
    -   Update `frontend/src/components/inbox/Inbox.tsx` (or Main Task List component).
    -   Use `useEffect` (or React Query if we decide to add it later, but sticking to simple `useEffect` for now as per "resourceful" note) to call `fetchTasks`.
    -   Store tasks in state.
    -   Handle "Loading" and "Error" states.

3.  **Filtering & Sorting UI**
    -   Ensure the UI has controls for Status (Active, Done, etc.) and Priority.
    -   Connect controls to the API call.

4.  **Backend Fixes**
    -   Verify `GET /tasks/` supports all needed filters.
    -   Verify date formatting matches what frontend expects.

## Verification
-   Manually create a task (via CLI or checking backend DB).
-   Refresh frontend -> Task appears.
-   Filter by status -> List updates.
