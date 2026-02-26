import os
from typing import Dict, Any, Optional
from supabase import create_client, Client

class ProfileManager:
    """Manages user profile data in Supabase."""
    
    def __init__(self):
        self.url = os.getenv("SUPABASE_URL")
        self.key = os.getenv("SUPABASE_ANON_KEY")
        self.use_mock_auth = os.getenv("USE_MOCK_AUTH", "false").lower() == "true"
        
        if not self.use_mock_auth and self.url and self.key:
            self.client: Client = create_client(self.url, self.key)
        else:
            self.client = None
            if not self.use_mock_auth:
                print("WARNING: Supabase credentials missing. Profile management disabled.")
            else:
                print("LOG: Using Mock Auth mode for ProfileManager.")

    def get_profile(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Fetch user profile from Supabase."""
        is_mock = os.getenv("USE_MOCK_AUTH", "false").lower() == "true"
        if is_mock:
            return {
                "id": user_id,
                "display_name": "Demo User",
                "avatar_url": "https://api.dicebear.com/7.x/bottts/svg?seed=Felix",
                "persona": "Beginner",
                "bio": "Keep exploring!"
            }
            
        if not self.client: return None
        
        try:
            response = self.client.table("profiles").select("*").eq("id", user_id).single().execute()
            return response.data
        except Exception as e:
            print(f"Error fetching profile: {e}")
            return None

    def update_profile(self, user_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Update user profile in Supabase."""
        is_mock = os.getenv("USE_MOCK_AUTH", "false").lower() == "true"
        if is_mock or not self.client: return None
        
        try:
            # Filter updates to only include allowed fields
            allowed_fields = {"display_name", "avatar_url", "persona", "bio"}
            filtered_updates = {k: v for k, v in updates.items() if k in allowed_fields}
            
            response = self.client.table("profiles").update(filtered_updates).eq("id", user_id).execute()
            if response.data:
                return response.data[0]
            return None
        except Exception as e:
            print(f"Error updating profile: {e}")
            return None

# Global instance
profile_manager = ProfileManager()
