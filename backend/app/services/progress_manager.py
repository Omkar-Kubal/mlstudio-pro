import json
import os
from pathlib import Path
from typing import Dict, List, Any

from supabase import create_client, Client

# In-memory storage for mock mode (resets on server restart)
MOCK_COMPLETED_TOPICS = {
    "00000000-0000-0000-0000-000000000000": {
        "s1m1": ["descriptive-statistics", "population-vs-sample", "central-tendency", "dispersion-measures", "law-of-large-numbers"],
        "s1m2": ["random-variables"]
    }
}

class ProgressManager:
    """Manages user progress tracking using Supabase PostgreSQL."""
    
    def __init__(self):
        self.url = os.getenv("SUPABASE_URL")
        self.key = os.getenv("SUPABASE_ANON_KEY")
        self.use_mock_auth = os.getenv("USE_MOCK_AUTH", "false").lower() == "true"
        
        if not self.use_mock_auth and self.url and self.key:
            self.client: Client = create_client(self.url, self.key)
        else:
            self.client = None
            if not self.use_mock_auth:
                print("WARNING: Supabase credentials missing. Progress tracking disabled.")

    def get_progress(self, user_id: str) -> Dict[str, Any]:
        """Load and return current user progress from Supabase."""
        is_mock = os.getenv("USE_MOCK_AUTH", "false").lower() == "true"
        if is_mock:
            # Unlock everything in mock mode for exploration
            from .curriculum_loader import curriculum_loader
            all_mids = curriculum_loader.list_all_modules()
            return {
                "completed_topics": MOCK_COMPLETED_TOPICS.get(user_id, {}), 
                "unlocked_subjects": [1, 2, 3, 4, 5, 6, 7], 
                "unlocked_modules": all_mids,
                "streak": 5,
                "xp": 1250
            }
        
        if not self.client:
            return {"completed_topics": {}, "unlocked_subjects": [1], "unlocked_modules": ["s1m1"]}
            
        try:
            # Fetch all completed topics for this user
            response = self.client.table("user_progress").select("module_id, topic_slug").eq("user_id", user_id).execute()
            
            completed_topics = {}
            for item in response.data:
                mid = item["module_id"]
                if mid not in completed_topics:
                    completed_topics[mid] = []
                completed_topics[mid].append(item["topic_slug"])
                
            # Logic for unlocked modules/subjects (sequential based on all completed)
            unlocked_modules = ["s1m1"]
            unlocked_subjects = [1]
            
            # Simple sequential unlock logic based on curriculum (expensive here, but safe for MVP)
            from .curriculum_loader import curriculum_loader
            all_module_ids = curriculum_loader.list_all_modules()
            
            for mid in all_module_ids:
                module = curriculum_loader.load_module_by_id(mid)
                if not module: continue
                
                topic_slugs = [t.slug for t in module.topics]
                completed_in_mid = completed_topics.get(mid, [])
                
                if all(slug in completed_in_mid for slug in topic_slugs):
                    # This module is complete, unlock the NEXT one
                    try:
                        idx = all_module_ids.index(mid)
                        if idx < len(all_module_ids) - 1:
                            next_mid = all_module_ids[idx + 1]
                            if next_mid not in unlocked_modules:
                                unlocked_modules.append(next_mid)
                                # Unlock subject if it's the first module
                                if next_mid.endswith("m1"):
                                    try:
                                        subj_idx = int(next_mid[1:].split("m")[0])
                                        if subj_idx not in unlocked_subjects:
                                            unlocked_subjects.append(subj_idx)
                                    except: pass
                    except: pass
                else:
                    # Module not complete, stop unlocking sequence
                    break
                    
            return {
                "completed_topics": completed_topics,
                "unlocked_subjects": unlocked_subjects,
                "unlocked_modules": unlocked_modules,
                "streak": 1,
                "xp": len(response.data) * 50
            }
        except Exception as e:
            print(f"Error fetching progress: {e}")
            return {"completed_topics": {}, "unlocked_subjects": [1], "unlocked_modules": ["s1m1"]}

    def update_topic_completion(self, user_id: str, module_id: str, topic_slug: str):
        """Mark a topic as completed."""
        is_mock = os.getenv("USE_MOCK_AUTH", "false").lower() == "true"
        if is_mock:
            if user_id not in MOCK_COMPLETED_TOPICS:
                MOCK_COMPLETED_TOPICS[user_id] = {}
            if module_id not in MOCK_COMPLETED_TOPICS[user_id]:
                MOCK_COMPLETED_TOPICS[user_id][module_id] = []
            if topic_slug not in MOCK_COMPLETED_TOPICS[user_id][module_id]:
                MOCK_COMPLETED_TOPICS[user_id][module_id].append(topic_slug)
            return

        if not self.client: return
        
        try:
            # Upsert completion record
            self.client.table("user_progress").upsert({
                "user_id": user_id,
                "module_id": module_id,
                "topic_slug": topic_slug
            }).execute()
        except Exception as e:
            print(f"Error updating progress: {e}")

    def complete_module(self, user_id: str, module_id: str):
        """Mark an entire module as completed."""
        is_mock = os.getenv("USE_MOCK_AUTH", "false").lower() == "true"
        if is_mock:
            from .curriculum_loader import curriculum_loader
            module = curriculum_loader.load_module_by_id(module_id)
            if module:
                for topic in module.topics:
                    self.update_topic_completion(user_id, module_id, topic.slug)
            return

        # Real DB logic could be a bulk insert here
        pass

# Global instance
progress_manager = ProgressManager()
