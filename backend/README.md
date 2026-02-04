# MLStudio Pro Backend

Authority and source of truth for all content, execution, and contracts.

## Guarantees
- **Headless Execution**: The backend runs independently of the frontend.
- **Read-Only Authority**: All curriculum and path data is managed here.
- **Contract Enforcement**: The backend enforces the schema of all returned data.

## Boundaries
- `backend/core/` is **private**. It must never be imported by the frontend.
- Filesystem access is strictly localized to `backend/app/services/`.
- No UI logic or Markdown parsing leaks into the API.

## API Setup
1. Ensure Python 3.9+ is installed.
2. Install dependencies: `pip install fastapi uvicorn pydantic`
3. Run the server: `python -m uvicorn app.main:app --reload`
