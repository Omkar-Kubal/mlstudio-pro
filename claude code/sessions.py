from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any, Optional
from pydantic import BaseModel
from ..services.session_manager import session_manager
from .auth_deps import get_current_user, get_current_admin

router = APIRouter()


class StartSessionRequest(BaseModel):
    device: Optional[str] = "unknown"
    current_page: Optional[str] = None


class PingSessionRequest(BaseModel):
    current_page: Optional[str] = None


# ---------------------------------------------------------------
# START
# ---------------------------------------------------------------
@router.post("/start", response_model=Dict[str, Any])
async def start_session(
    body: StartSessionRequest,
    user=Depends(get_current_user),
):
    """Create a new session document for the current user."""
    return session_manager.start_session(
        user_id=user.id,
        device=body.device or "unknown",
        current_page=body.current_page,
    )


# ---------------------------------------------------------------
# PING (keep-alive)
# ---------------------------------------------------------------
@router.post("/{session_id}/ping", response_model=Dict[str, Any])
async def ping_session(
    session_id: str,
    body: PingSessionRequest,
    user=Depends(get_current_user),
):
    """Update last_ping and current_page for an active session.

    FIX H-1: Passes user_id so session_manager can verify ownership.
    """
    result = session_manager.ping_session(
        session_id=session_id,
        user_id=user.id,
        current_page=body.current_page,
    )
    if result.get("error") == "forbidden":
        raise HTTPException(status_code=403, detail="You do not own this session.")
    if result.get("error") == "not_found":
        raise HTTPException(status_code=404, detail="Session not found.")
    return result


# ---------------------------------------------------------------
# END
# ---------------------------------------------------------------
@router.post("/{session_id}/end", response_model=Dict[str, Any])
async def end_session(
    session_id: str,
    user=Depends(get_current_user),
):
    """Mark a session as ended and compute duration_ms.

    FIX H-1: Passes user_id so session_manager can verify ownership.
    """
    result = session_manager.end_session(session_id=session_id, user_id=user.id)
    if result.get("error") == "forbidden":
        raise HTTPException(status_code=403, detail="You do not own this session.")
    if result.get("error") == "not_found":
        raise HTTPException(status_code=404, detail="Session not found.")
    return result


# ---------------------------------------------------------------
# STATS (admin only)
# ---------------------------------------------------------------
@router.get("/stats", response_model=Dict[str, Any])
async def get_session_stats(admin=Depends(get_current_admin)):
    """Aggregate session statistics for the admin analytics page."""
    return session_manager.get_session_stats()
