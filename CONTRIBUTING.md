# Contribution Guidelines

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
