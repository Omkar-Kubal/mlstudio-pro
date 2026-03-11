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

        # FIX M-4 (partial): Use a targeted query rather than streaming all docs.
        # For unique user count and topic stats we still need to iterate progress docs,
        # but we limit the fields fetched using select() to reduce bandwidth.
        docs = list(
            db.collection("user_progress")
            .select(["user_id", "topic_slug", "module_id"])
            .stream()
        )
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
        page = firebase_auth.list_users()
        while page:
            for u in page.users:
                provider = u.provider_data[0].provider_id if u.provider_data else "email"
                claims = u.custom_claims or {}
                # FIX M-6: Admin status is determined solely by the custom claim,
                # not by email comparison (email is mutable in Firebase).
                is_admin = claims.get("admin", False) is True
                users.append({
                    "uid": u.uid,
                    "email": u.email,
                    "displayName": u.display_name,
                    "provider": provider,
                    "lastSignIn": u.user_metadata.last_sign_in_timestamp if u.user_metadata else None,
                    "is_admin": is_admin,
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
    raw_sa = os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON", "")

    # FIX M-5: Never return the raw service account value — it may contain the
    # full private key JSON. Instead, indicate whether it is configured and whether
    # it appears to be a file path or an inline JSON blob.
    if not raw_sa:
        sa_status = "not configured"
    elif raw_sa.startswith("{"):
        sa_status = "configured (inline JSON)"
    else:
        # It's a file path — safe to show existence check, not the path itself
        sa_status = "configured (file path)"

    return {
        "use_mock_auth": os.getenv("USE_MOCK_AUTH", "false"),
        # Admin email kept for display, but it is no longer used for authorization.
        "admin_email_hint": os.getenv("ADMIN_EMAIL", "not set"),
        "firebase_service_account": sa_status,
        "api_version": "1.0.0",
        "firebase_initialized": bool(firebase_admin._apps),
    }
