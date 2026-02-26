from fastapi import APIRouter, HTTPException, Body, Depends
from typing import List, Dict, Any
from ..services.curriculum_loader import curriculum_loader
from ..services.progress_manager import progress_manager
from ..models.curriculum import LearningModule
from .auth_deps import get_current_user

router = APIRouter()

@router.get("/", response_model=List[str])
async def get_all_modules():
    """List all available learning modules."""
    return curriculum_loader.list_all_modules()

@router.get("/progress", response_model=Dict[str, Any])
async def get_user_progress(user = Depends(get_current_user)):
    """Get the current user's progress and unlocked items."""
    return progress_manager.get_progress(user.id)

@router.post("/progress/{module_id}/{topic_slug}")
async def update_progress(module_id: str, topic_slug: str, user = Depends(get_current_user)):
    """Mark a topic as completed and update progress."""
    progress_manager.update_topic_completion(user.id, module_id, topic_slug)
    return {"status": "success", "module_id": module_id, "topic_slug": topic_slug}

@router.post("/progress/{module_id}/complete")
async def finish_module(module_id: str, user = Depends(get_current_user)):
    """Mark an entire module as completed."""
    progress_manager.complete_module(user.id, module_id)
    return {"status": "success", "module_id": module_id}

@router.get("/{lesson_id}", response_model=LearningModule)
async def get_module(lesson_id: str):
    """Get a specific learning module by ID (e.g., s1m1)."""
    module = curriculum_loader.load_module_by_id(lesson_id)
    if not module:
        raise HTTPException(status_code=404, detail=f"Module {lesson_id} not found")
    return module
