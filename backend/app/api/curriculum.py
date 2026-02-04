from fastapi import APIRouter, HTTPException
from typing import List, Dict
from ..services.curriculum_loader import curriculum_loader
from ..models.curriculum import LearningModule

router = APIRouter()

@router.get("/", response_model=List[str])
async def get_all_modules():
    """List all available learning modules."""
    return curriculum_loader.list_all_modules()

@router.get("/{lesson_id}", response_model=LearningModule)
async def get_module(lesson_id: str):
    """Get a specific learning module by ID (e.g., s1m1)."""
    module = curriculum_loader.load_module_by_id(lesson_id)
    if not module:
        raise HTTPException(status_code=404, detail=f"Module {lesson_id} not found")
    return module
