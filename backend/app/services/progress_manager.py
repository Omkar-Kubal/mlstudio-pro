import json
import os
from pathlib import Path
from typing import Dict, List, Any

from supabase import create_client, Client

class ProgressManager:
    """Manages user progress tracking using Supabase PostgreSQL."""
    
    def __init__(self):
        self.url = os.getenv("SUPABASE_URL")
        self.key = os.getenv("SUPABASE_ANON_KEY")
        if self.url and self.key:
            self.client: Client = create_client(self.url, self.key)
        else:
            self.client = None
            print("WARNING: Supabase credentials missing. Progress tracking disabled.")

    def get_progress(self, user_id: str) -> Dict[str, Any]:
        """Load and return current user progress from Supabase."""
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
                "unlocked_modules": unlocked_modules
            }
        except Exception as e:
            print(f"Error fetching progress: {e}")
            return {"completed_topics": {}, "unlocked_subjects": [1], "unlocked_modules": ["s1m1"]}

    def update_topic_completion(self, user_id: str, module_id: str, topic_slug: str):
        """Mark a topic as completed in Supabase."""
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

# Global instance
progress_manager = ProgressManager()
