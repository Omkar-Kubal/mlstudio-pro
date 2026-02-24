from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any
from .auth_deps import get_current_user
from ..services.profile_manager import profile_manager

router = APIRouter()

@router.get("/")
async def get_my_profile(user = Depends(get_current_user)):
    """Retrieve the current user's profile."""
    profile = profile_manager.get_profile(user.id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile

@router.patch("/")
async def update_my_profile(updates: Dict[str, Any], user = Depends(get_current_user)):
    """Update the current user's profile."""
    updated_profile = profile_manager.update_profile(user.id, updates)
    if not updated_profile:
        raise HTTPException(status_code=400, detail="Failed to update profile")
    return updated_profile
