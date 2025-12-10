# Plan 04: Task Detail View & MyST

## Goal
Implement the "Text as Game Board" detail view with MyST rendering and optimistic locking.

## Steps

1.  **Dependencies**
    -   Install `remark-frontmatter`, `remark-gfm`, `rehype-raw` (if needed for HTML inside MD), and potential MyST plugins.
    -   *Decision*: Use `react-markdown` with `remark-frontmatter` and `remark-gfm`. For checkbox interactivity, we need a custom approach or `remark-directive` if we want fancy stuff. For standard `[ ]` checkboxes, `remark-gfm` supports them, but making them *interactive* (clickable) requires custom renderers in `react-markdown`.

2.  **API Service Functions**
    -   `getTask(id)`: `GET /tasks/{id}`.
    -   `updateTaskStatus(id, status, version)`: `PUT /tasks/{id}/status`.
    -   `updateTaskMetadata(id, patch, version)`: `PATCH /tasks/{id}`.

3.  **Detail View Component**
    -   Create/Update `frontend/src/components/task/TaskDetail.tsx`.
    -   Fetch task details on mount.
    -   **Rendering**:
        -   Display Frontmatter fields (Title, Priority, Tags) as editable inputs.
        -   Render Body using `ReactMarkdown`.
    -   **Interactivity**:
        -   Implement "Optimistic Locking":
            -   Store `updated_at` from fetch.
            -   When user changes Status or Checkbox:
                -   Optimistically update UI.
                -   Send API request with `updated_at`.
                -   Handle 409 Conflict: Alert user, reload data.

4.  **MyST Rendering Implementation**
    -   Configure `ReactMarkdown` components to replace standard `<input type="checkbox">` with a clickable component that triggers an update.
    -   Ensure `frontmatter` is parsed (using `gray-matter` or similar in JS *before* passing to ReactMarkdown, or use `remark-frontmatter` to strip it from view). *Correction*: Backend returns `body` as raw string. Frontmatter is usually at the top. We might need to strip it for the "Body" view if the API returns the *entire* file content.
    -   *API Check*: `TaskFullResponse` has `body`. The backend `get_task` parses the file. Does `body` in response include frontmatter?
        -   Code check: `frontmatter.load(path)` returns `post`. `post.content` is usually just the body. `post.metadata` is the frontmatter.
        -   Backend `save_task`: `post = frontmatter.Post(body)`.
        -   Backend `get_task`: `return TaskFullResponse(**post.metadata, body=post.content)`.
        -   *Conclusion*: `body` in API response is *content only* (no frontmatter). So we just render `body`. Frontmatter fields come as separate JSON fields.

## Verification
-   Open a task.
-   Edit Title -> Saves.
-   Click Checkbox in body -> Saves (updates status/body?).
    -   *Note*: Updating the *body* content (checking a box in text) is a file edit. API `updateTaskStatus` updates *status*. To update the *body* (checkbox inside text), we generally need a full body update or a specific patch.
    -   *Refinement*: If the checkbox represents the *Task Status* (e.g. "Done"), we call status update. If it's a subtask in the body, we need to update the `body` string.
    -   *Decision*: For this plan, "Completion" button updates status. Body editing might be a "Edit" mode or simple text area for now, unless "Interactive Checkbox" in text is a hard requirement for *subtasks*. The spec says "Interactive Checkbox... update underlying MyST file". This implies updating the `body`.
    -   I will implement a "Save Body" feature or auto-save for the body text area.
