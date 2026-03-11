import os
from dotenv import load_dotenv

# Load environment variables from .env if it exists
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
# Initialize Firebase FIRST, before any services that depend on it
from . import firebase_init  # noqa: F401
from .api import curriculum, labs_paths, runner, profile, admin, sessions

app = FastAPI(title="MLStudio Pro Backend", version="1.0.0")

# FIX H-2: Validate CORS configuration at startup.
# The HTTP spec forbids credentials (cookies, auth headers) with wildcard origins.
# In production, ALLOWED_ORIGINS must be set to the exact frontend URL(s).
allowed_origins_raw = os.getenv("ALLOWED_ORIGINS", "")
allowed_origins = [o.strip() for o in allowed_origins_raw.split(",") if o.strip()]

if not allowed_origins:
    # Development fallback — only safe because allow_credentials is False in this branch.
    # In production, ALLOWED_ORIGINS must be set explicitly.
    import warnings
    warnings.warn(
        "ALLOWED_ORIGINS is not set. Defaulting to localhost:3000 for development. "
        "Set ALLOWED_ORIGINS in production.",
        stacklevel=1,
    )
    allowed_origins = ["http://localhost:3000"]

# Prevent the invalid combination of wildcard + credentials.
if "*" in allowed_origins:
    raise RuntimeError(
        "ALLOWED_ORIGINS cannot be '*' when allow_credentials=True. "
        "Set ALLOWED_ORIGINS to your exact frontend URL(s)."
    )

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(curriculum.router, prefix="/curriculum", tags=["curriculum"])
app.include_router(labs_paths.lab_router, prefix="/labs", tags=["labs"])
app.include_router(labs_paths.path_router, prefix="/paths", tags=["paths"])
app.include_router(runner.router, prefix="/runner", tags=["runner"])
app.include_router(profile.router, prefix="/profile", tags=["profile"])
app.include_router(admin.router, prefix="/admin", tags=["admin"])
app.include_router(sessions.router, prefix="/sessions", tags=["sessions"])


@app.get("/")
async def root():
    return {"message": "MLStudio Pro Backend is running. Access /docs for API documentation."}


@app.get("/health")
async def health():
    return {"status": "healthy"}
