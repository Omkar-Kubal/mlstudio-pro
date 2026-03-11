"""
Session tracking service — stores per-user session data in Firestore.

Firestore structure:
  sessions/{session_id}:
    user_id:      str
    started_at:   Timestamp
    last_ping:    Timestamp
    ended_at:     Timestamp | None
    page_count:   int
    current_page: str | None   (current topic slug, updated on each ping)
    device:       str
    duration_ms:  int | None
"""

import os
import uuid
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List, Optional
import firebase_admin
from firebase_admin import firestore

ACTIVE_THRESHOLD_MINUTES = 5  # sessions with last_ping within 5min are "active"


class SessionManager:
    def __init__(self):
        self.use_mock = os.getenv("USE_MOCK_AUTH", "false").lower() == "true"
        self.db = None

        if not self.use_mock:
            try:
                if firebase_admin._apps:
                    self.db = firestore.client()
                    print("LOG: SessionManager connected to Firestore.")
                else:
                    print("WARNING: Firebase not initialized. SessionManager using Mock mode.")
                    self.use_mock = True
            except Exception as e:
                print(f"WARNING: SessionManager Firestore init failed: {e}. Using Mock mode.")
                self.use_mock = True
        else:
            print("LOG: SessionManager using Mock mode.")

    # ---------------------------------------------------------------
    # START SESSION
    # ---------------------------------------------------------------
    def start_session(
        self, user_id: str, device: str = "unknown", current_page: Optional[str] = None
    ) -> Dict[str, Any]:
        session_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc)

        if self.use_mock:
            return {"session_id": session_id, "started_at": now.isoformat(), "mock": True}

        if not self.db:
            return {"session_id": session_id, "mock": True}

        doc = {
            "user_id": user_id,
            "started_at": now,
            "last_ping": now,
            "ended_at": None,
            "page_count": 1,
            "current_page": current_page,
            "device": device[:256],  # cap device string length
            "duration_ms": None,
        }
        self.db.collection("sessions").document(session_id).set(doc)
        return {"session_id": session_id, "started_at": now.isoformat()}

    # ---------------------------------------------------------------
    # PING SESSION (keep-alive + update current page)
    # ---------------------------------------------------------------
    def ping_session(
        self, session_id: str, user_id: str, current_page: Optional[str] = None
    ) -> Dict[str, Any]:
        """FIX H-1: user_id is now required to verify session ownership."""
        now = datetime.now(timezone.utc)

        if self.use_mock:
            return {"last_ping": now.isoformat(), "mock": True}

        if not self.db:
            return {"last_ping": now.isoformat()}

        ref = self.db.collection("sessions").document(session_id)
        doc = ref.get()

        if not doc.exists:
            return {"error": "not_found"}

        # FIX H-1: Ownership check
        if doc.to_dict().get("user_id") != user_id:
            return {"error": "forbidden"}

        updates: Dict[str, Any] = {
            "last_ping": now,
            "page_count": firestore.Increment(1),
        }
        if current_page:
            updates["current_page"] = current_page

        ref.update(updates)
        return {"last_ping": now.isoformat(), "session_id": session_id}

    # ---------------------------------------------------------------
    # END SESSION
    # ---------------------------------------------------------------
    def end_session(self, session_id: str, user_id: str) -> Dict[str, Any]:
        """FIX H-1: user_id is now required to verify session ownership."""
        now = datetime.now(timezone.utc)

        if self.use_mock:
            return {"ended_at": now.isoformat(), "duration_ms": 0, "mock": True}

        if not self.db:
            return {"ended_at": now.isoformat()}

        ref = self.db.collection("sessions").document(session_id)
        doc = ref.get()
        if not doc.exists:
            return {"error": "not_found"}

        data = doc.to_dict()

        # FIX H-1: Ownership check
        if data.get("user_id") != user_id:
            return {"error": "forbidden"}

        started_at = data.get("started_at")
        duration_ms = None
        if started_at:
            if hasattr(started_at, "timestamp"):
                started_dt = started_at.replace(tzinfo=timezone.utc) if started_at.tzinfo is None else started_at
            else:
                started_dt = started_at
            duration_ms = int((now - started_dt).total_seconds() * 1000)

        ref.update({
            "ended_at": now,
            "duration_ms": duration_ms,
            "current_page": None,
        })
        return {"ended_at": now.isoformat(), "duration_ms": duration_ms, "session_id": session_id}

    # ---------------------------------------------------------------
    # AGGREGATE STATS (for admin analytics)
    # ---------------------------------------------------------------
    def get_session_stats(self) -> Dict[str, Any]:
        if self.use_mock:
            return {
                "active_users_today": 2,
                "avg_duration_ms": 420000,   # 7 minutes
                "total_sessions_today": 5,
                "returning_users": 1,
                "live_now": 1,
                "current_pages": [{"page": "gradient-descent", "count": 1}],
                "mock": True,
            }

        if not self.db:
            return {"active_users_today": 0, "avg_duration_ms": 0, "total_sessions_today": 0}

        now = datetime.now(timezone.utc)
        day_ago = now - timedelta(hours=24)
        ping_threshold = now - timedelta(minutes=ACTIVE_THRESHOLD_MINUTES)

        # FIX M-4: Only query sessions from the last 24h (already filtered).
        # The previous full-collection scan for returning_users is replaced with
        # a count-only query that avoids loading all session documents into memory.
        docs = list(
            self.db.collection("sessions")
            .where("started_at", ">=", day_ago)
            .stream()
        )

        unique_users_today: set = set()
        durations: List[int] = []
        live_now_users: set = set()
        page_counts: Dict[str, int] = {}

        for doc in docs:
            d = doc.to_dict()
            uid = d.get("user_id")
            unique_users_today.add(uid)

            dur = d.get("duration_ms")
            if dur:
                durations.append(dur)

            last_ping = d.get("last_ping")
            if last_ping:
                lp = last_ping.replace(tzinfo=timezone.utc) if last_ping.tzinfo is None else last_ping
                if lp >= ping_threshold and d.get("ended_at") is None:
                    live_now_users.add(uid)
                    page = d.get("current_page")
                    if page:
                        page_counts[page] = page_counts.get(page, 0) + 1

        # FIX M-4: Compute returning users only among users active today, using a
        # targeted per-user count query instead of a full collection scan.
        returning = 0
        for uid in unique_users_today:
            if uid is None:
                continue
            user_sessions = (
                self.db.collection("sessions")
                .where("user_id", "==", uid)
                .limit(2)   # We only need to know if count > 1
                .stream()
            )
            count = sum(1 for _ in user_sessions)
            if count > 1:
                returning += 1

        avg_dur = int(sum(durations) / len(durations)) if durations else 0

        top_pages = sorted(
            [{"page": p, "count": c} for p, c in page_counts.items()],
            key=lambda x: x["count"],
            reverse=True
        )[:5]

        return {
            "active_users_today": len(unique_users_today),
            "total_sessions_today": len(docs),
            "avg_duration_ms": avg_dur,
            "returning_users": returning,
            "live_now": len(live_now_users),
            "current_pages": top_pages,
            "mock": False,
        }


# Global singleton
session_manager = SessionManager()
