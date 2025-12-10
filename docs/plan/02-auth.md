# Plan 02: Authentication & User Context

## Goal
Implement a simple mechanism to identify the user, complying with the requirement to use `~/.coreterra` config and store `user_id`.

## Steps

1.  **User Context Provider**
    -   Create `frontend/src/context/UserContext.tsx`.
    -   State: `userId`, `username`, `roles`, `isAuthenticated`.
    -   On mount: Check `localStorage` for user info.

2.  **Login Page**
    -   Create `frontend/src/pages/LoginPage.tsx`.
    -   Simple form: "Username" (mock passwordless or simple check).
    -   **Action**: Call `POST /auth/login` (mocked in backend).
    -   On success: Save `user_id` and info to `localStorage` and update Context.
    -   Redirect to Dashboard.

3.  **Route Protection**
    -   Create `frontend/src/components/ProtectedRoute.tsx`.
    -   Wrap main app routes. If not authenticated, redirect to `/login`.

4.  **Backend Verification**
    -   Ensure `backend/src/auth.py` has the `login` endpoint and it returns expected user data.
    -   Fix if missing or incorrect.

5.  **Integration**
    -   Update `App.tsx` to include `UserProvider` and Routes.
    -   Update `frontend/src/lib/api.ts` to inject `user_id` into headers or request body (if API requires it in body, most C-C-O-R-E endpoints like `create_task` require `user_id` in body, but some might use headers. API Contract says `user_id` is part of Request Body schemas).
    -   *Note*: Since `user_id` is in the request body for most operations, the API helper might just expose it for easy access, rather than auto-injecting into body (which is harder with Axios interceptors unless we enforce schema). We will expose `useUser()` hook for components to easily get `user_id`.

## Verification
-   Open App -> Redirects to Login.
-   Login -> Redirects to Dashboard.
-   Refresh -> Stays logged in.
