# Plan 07: CI/CD & Testing

## Goal
Ensure code quality and automated testing.

## Steps

1.  **Frontend Testing Setup**
    -   Install `vitest` and `jsdom`: `npm install -D vitest jsdom @testing-library/react`.
    -   Create a basic test: `frontend/src/App.test.tsx` (renders without crashing).

2.  **GitHub Workflow**
    -   Create `.github/workflows/ci.yml`.
    -   Triggers: Push to `main`, PR.
    -   Jobs:
        -   **Backend**: Install python, `uv sync`, run tests (if any exist, or just lint).
        -   **Frontend**: Install node, `npm install`, `npm run lint`, `npm test`, `npm run build`.

## Verification
-   Run `npm test` locally.
-   (Simulated) Push triggers workflow.
