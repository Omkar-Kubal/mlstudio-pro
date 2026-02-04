# BACKEND_FRONTEND_BOUNDARY_SEAL

**Status**: ENFORCED
**Authority**: Backend
**Consumer**: Frontend

## Invariants

1. **No Direct Filesystem access from Frontend**: The `frontend/` directory must never import `fs`, `path`, or any other module that interacts with the host filesystem. All data must be consumed via HTTP APIs.
2. **No UI Imports in Backend**: The `backend/` directory must remain headless and never import code from the frontend. It should be capable of running without the frontend present.
3. **API as the Sole Integration Surface**: The FastAPI interface defined in `backend/app/api/` is the only permissible bridge between the two components.
4. **Contract-Driven Communication**: All data exchange must adhere to the Pydantic models defined in `backend/app/models/`, ensuring structural integrity and preventing schema leakage.

## Violation Consequences
Any breach of these boundaries (e.g., importing a backend utility into a Next.js component) will be considered a regression and must be reverted immediately.

---
*This seal confirms that MLStudio Pro has achieved a strict architectural split, enabling safe progression to V5 orchestration and intelligent automation.*
