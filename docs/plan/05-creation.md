# Plan 05: Task Capture & Creation

## Goal
Implement the "Capture" phase by connecting the existing Quick Add Bar to the backend API.

## Steps

1.  **API Service Verification**
    -   Verify `createTask(data)` in `frontend/src/lib/api.ts` matches backend `POST /tasks/`. (Done in previous steps, confirmed correct).

2.  **Quick Add Component (`QuickAddBar.tsx`)**
    -   Modify `frontend/src/components/layout/QuickAddBar.tsx`.
    -   Translate all UI text (placeholders, tooltips) to English.
    -   Ensure it calls the `onCommand` prop with the input title.

3.  **Context Integration (`TaskContext.tsx` & `App.tsx`)**
    -   Verify `TaskContext.createTask` calls the API and updates local state.
    -   Verify `App.tsx` passes the `createTask` handler to `DashboardLayout`.
    -   Verify `DashboardLayout` passes the handler to `QuickAddBar`.

## Verification
-   Type "Buy Milk" in the bottom bar -> Enter.
-   Task should appear in the Inbox immediately.
-   Network request `POST /tasks/` should be successful.
