from fastapi import APIRouter, HTTPException, Depends
from typing import List
from ..services.lab_path_services import lab_loader, path_resolver
from ..models.lab_path import Lab, Path as LearningPath
from .auth_deps import get_current_user

lab_router = APIRouter()
path_router = APIRouter()

# Labs Endpoints
@lab_router.get("/", response_model=List[Lab])
async def get_labs(user = Depends(get_current_user)):
    return lab_loader.list_labs()

@lab_router.get("/{lab_id}", response_model=Lab)
async def get_lab(lab_id: str, user = Depends(get_current_user)):
    lab = lab_loader.get_lab(lab_id)
    if not lab:
        raise HTTPException(status_code=404, detail=f"Lab {lab_id} not found")
    return lab

# Paths Endpoints
@path_router.get("/", response_model=List[str])
async def get_personas(user = Depends(get_current_user)):
    return path_resolver.list_personas()

@path_router.get("/{persona}", response_model=LearningPath)
async def get_path(persona: str, user = Depends(get_current_user)):
    path = path_resolver.get_path_for_persona(persona)
    if not path:
        raise HTTPException(status_code=404, detail=f"Path for persona {persona} not found")
    return path
