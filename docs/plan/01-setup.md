# Plan 01: Environment & API Setup

## Goal
Establish the foundational connection between frontend and backend, ensuring environment variables are loaded from the user's config and the API client is correctly configured.

## Steps

1.  **Environment Configuration Script**
    -   Create a script `backend/scripts/load_env.py` (or similar location) that:
        -   Reads `~/.coreterra/config.json`.
        -   Parses `user_id`, `api_url`, etc.
        -   Outputs them in a format `run.sh` can consume (e.g., `export VITE_API_URL=...`).
    -   Update `run.sh` to execute this script and export variables before starting servers.

2.  **Backend CORS Configuration**
    -   Modify `backend/src/main.py` to add `CORSMiddleware`.
    -   Allow origins (default to `http://localhost:5173` and derived from config).
    -   Allow credentials, methods, and headers.

3.  **Frontend API Client**
    -   Install `axios`: `npm install axios`.
    -   Create `frontend/src/lib/api.ts` (or `api/client.ts`).
    -   Configure Axios instance with:
        -   Base URL from `import.meta.env.VITE_API_URL`.
        -   Interceptors to inject `user_id` (retrieved from storage, implemented in next plan) if needed, or just set up the structure.

4.  **Verification**
    -   Start the app using `run.sh`.
    -   Verify in browser console that `VITE_API_URL` is correctly set.
    -   Verify `health` check endpoint can be called from frontend (e.g., simple `console.log` test in `App.tsx` temporarily).
