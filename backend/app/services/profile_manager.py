import os
from typing import Dict, Any, Optional
import firebase_admin
from firebase_admin import firestore

class ProfileManager:
    """Manages user profile data in Firestore (migrated from Supabase)."""

    def __init__(self):
        self.use_mock = os.getenv("USE_MOCK_AUTH", "false").lower() == "true"
        self.db = None

        if not self.use_mock:
            try:
                if firebase_admin._apps:
                    self.db = firestore.client()
                    print("LOG: ProfileManager connected to Firestore.")
                else:
                    print("WARNING: Firebase not initialized yet. ProfileManager using Mock mode.")
                    self.use_mock = True
            except Exception as e:
                print(f"WARNING: ProfileManager Firestore init failed: {e}. Using Mock mode.")
                self.use_mock = True
        else:
            print("LOG: Using Mock Auth mode for ProfileManager.")

    def _mock_profile(self, user_id: str) -> Dict[str, Any]:
        return {
            "id": user_id,
            "display_name": "Demo User",
            "avatar_url": "https://api.dicebear.com/7.x/bottts/svg?seed=Felix",
            "persona": "Beginner",
            "bio": "Keep exploring!",
        }

    def get_profile(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Fetch user profile from Firestore."""
        if self.use_mock or os.getenv("USE_MOCK_AUTH", "false").lower() == "true":
            return self._mock_profile(user_id)

        if not self.db:
            return None

        try:
            doc = self.db.collection("profiles").document(user_id).get()
            if doc.exists:
                return {"id": user_id, **doc.to_dict()}
            # Auto-create a default profile on first fetch
            default = self._mock_profile(user_id)
            self.db.collection("profiles").document(user_id).set(default)
            return default
        except Exception as e:
            print(f"Error fetching profile: {e}")
            return None

    def update_profile(self, user_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update user profile in Firestore."""
        if self.use_mock or os.getenv("USE_MOCK_AUTH", "false").lower() == "true":
            return None

        if not self.db:
            return None

        try:
            allowed_fields = {"display_name", "avatar_url", "persona", "bio"}
            filtered = {k: v for k, v in updates.items() if k in allowed_fields}
            self.db.collection("profiles").document(user_id).update(filtered)
            doc = self.db.collection("profiles").document(user_id).get()
            return {"id": user_id, **doc.to_dict()} if doc.exists else None
        except Exception as e:
            print(f"Error updating profile: {e}")
            return None


# Global instance
profile_manager = ProfileManager()
