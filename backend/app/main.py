from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api import curriculum, labs_paths, runner

app = FastAPI(title="MLStudio Pro Backend", version="1.0.0")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to the frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(curriculum.router, prefix="/curriculum", tags=["curriculum"])
app.include_router(labs_paths.lab_router, prefix="/labs", tags=["labs"])
app.include_router(labs_paths.path_router, prefix="/paths", tags=["paths"])
app.include_router(runner.router, prefix="/runner", tags=["runner"])

@app.get("/")
async def root():
    return {"message": "MLStudio Pro Backend is running. Access /docs for API documentation."}

@app.get("/health")
async def health():
    return {"status": "healthy"}
