from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any, List, Optional
import os
import firebase_admin
from firebase_admin import auth as firebase_auth, firestore
from .auth_deps import get_current_admin
from ..services.session_manager import session_manager

router = APIRouter()

use_mock = os.getenv("USE_MOCK_AUTH", "false").lower() == "true"

# ------------------------------------------------------------------
# STATS
# ------------------------------------------------------------------

@router.get("/stats", response_model=Dict[str, Any])
async def get_platform_stats(admin=Depends(get_current_admin)):
    """Get aggregate platform statistics (admin only)."""
    session_stats = session_manager.get_session_stats()

    if use_mock:
        return {
            "total_users": 3,
            "total_completions": 12,
            "popular_topics": [
                {"topic": "descriptive-statistics", "count": 3},
                {"topic": "random-variables", "count": 2},
                {"topic": "central-tendency", "count": 2}
            ],
            "active_modules": ["s1m1", "s1m2"],
            **session_stats,
            "mock": True
        }

    try:
        db = firestore.client()

        docs = list(db.collection("user_progress").stream())
        unique_users = len({d.to_dict().get("user_id") for d in docs if d.to_dict().get("user_id")})

        topic_counts: Dict[str, int] = {}
        module_counts: Dict[str, int] = {}
        for doc in docs:
            d = doc.to_dict()
            topic = d.get("topic_slug")
            mod = d.get("module_id")
            if topic:
                topic_counts[topic] = topic_counts.get(topic, 0) + 1
            if mod:
                module_counts[mod] = module_counts.get(mod, 0) + 1

        popular = sorted(
            [{"topic": t, "count": c} for t, c in topic_counts.items()],
            key=lambda x: x["count"],
            reverse=True
        )[:5]

        active_mods = [m for m, c in module_counts.items() if c > 0]

        return {
            "total_users": unique_users,
            "total_completions": len(docs),
            "popular_topics": popular,
            "active_modules": active_mods,
            **session_stats,
            "mock": False
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch stats: {str(e)}")


# ------------------------------------------------------------------
# USER MANAGEMENT
# ------------------------------------------------------------------

@router.get("/users", response_model=List[Dict[str, Any]])
async def list_users(admin=Depends(get_current_admin)):
    """List all Firebase Auth users (admin only)."""
    if use_mock:
        return [
            {"uid": "00000000-0000-0000-0000-000000000000", "email": "dev@mlstudio.pro", "displayName": "Dev User", "provider": "email", "is_admin": True},
            {"uid": "mock-user-2", "email": "student@example.com", "displayName": None, "provider": "google", "is_admin": False},
        ]

    try:
        users = []
        admin_email = os.getenv("ADMIN_EMAIL")
        page = firebase_auth.list_users()
        while page:
            for u in page.users:
                provider = u.provider_data[0].provider_id if u.provider_data else "email"
                claims = u.custom_claims or {}
                is_admin = claims.get("admin", False) or (admin_email and u.email == admin_email)
                users.append({
                    "uid": u.uid,
                    "email": u.email,
                    "displayName": u.display_name,
                    "provider": provider,
                    "lastSignIn": u.user_metadata.last_sign_in_timestamp if u.user_metadata else None,
                    "is_admin": bool(is_admin),
                })
            page = page.get_next_page()
        return users
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list users: {str(e)}")


@router.post("/users/{uid}/make-admin")
async def make_admin(uid: str, admin=Depends(get_current_admin)):
    """Grant admin privileges to a user (admin only)."""
    if use_mock:
        return {"status": "ok", "uid": uid, "mock": True}
    try:
        firebase_auth.set_custom_user_claims(uid, {"admin": True})
        return {"status": "ok", "uid": uid}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to set admin claim: {str(e)}")


@router.post("/users/{uid}/remove-admin")
async def remove_admin(uid: str, admin=Depends(get_current_admin)):
    """Remove admin privileges from a user (admin only)."""
    if use_mock:
        return {"status": "ok", "uid": uid, "mock": True}
    try:
        firebase_auth.set_custom_user_claims(uid, {"admin": False})
        return {"status": "ok", "uid": uid}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to remove admin claim: {str(e)}")


@router.delete("/users/{uid}")
async def delete_user(uid: str, admin=Depends(get_current_admin)):
    """Delete a Firebase Auth user (admin only)."""
    if use_mock:
        return {"status": "deleted", "uid": uid, "mock": True}
    try:
        firebase_auth.delete_user(uid)
        return {"status": "deleted", "uid": uid}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete user: {str(e)}")


# ------------------------------------------------------------------
# SETTINGS
# ------------------------------------------------------------------

@router.get("/settings", response_model=Dict[str, Any])
async def get_settings(admin=Depends(get_current_admin)):
    """Return non-sensitive system configuration (admin only)."""
    return {
        "use_mock_auth": os.getenv("USE_MOCK_AUTH", "false"),
        "admin_email": os.getenv("ADMIN_EMAIL", "not set"),
        "firebase_project": os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON", "not configured"),
        "api_version": "1.0.0",
        "firebase_initialized": bool(firebase_admin._apps),
    }
