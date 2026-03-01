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

# Get allowed origins from environment variable or default to wildcard for dev
allowed_origins = os.getenv("ALLOWED_ORIGINS", "*").split(",")

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
