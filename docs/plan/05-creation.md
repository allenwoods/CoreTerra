# Plan 05: Task Capture & Creation

## Goal
Implement the "Capture" phase (creating tasks).

## Steps

1.  **API Service**
    -   `createTask(data)`: `POST /tasks/`.

2.  **Capture Component**
    -   Update `frontend/src/components/inbox/CaptureInput.tsx` (or similar).
    -   Simple text input for "Title".
    -   Optional expanded mode for "Body" or "Priority".
    -   On Enter -> Call API -> Clear Input -> Refresh List.

## Verification
-   Type "Buy Milk" -> Enter.
-   Task appears in Inbox.
