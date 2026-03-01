import json
import os
from pathlib import Path
from typing import Dict, List, Any
import firebase_admin
from firebase_admin import firestore

# In-memory storage for mock mode (resets on server restart)
MOCK_COMPLETED_TOPICS = {
    "00000000-0000-0000-0000-000000000000": {
        "s1m1": ["descriptive-statistics", "population-vs-sample", "central-tendency", "dispersion-measures", "law-of-large-numbers"],
        "s1m2": ["random-variables"]
    }
}

class ProgressManager:
    """Manages user progress tracking using Firebase Firestore."""
    
    def __init__(self):
        self.use_mock_auth = os.getenv("USE_MOCK_AUTH", "false").lower() == "true"
        self.db = None
        
        if not self.use_mock_auth:
            try:
                # Firestore client (assumes firebase_admin.initialize_app() was called in auth_deps)
                self.db = firestore.client()
            except Exception as e:
                print(f"WARNING: Firestore initialization failed: {e}. Progress tracking will use Mock mode.")
                self.use_mock_auth = True

    def get_progress(self, user_id: str) -> Dict[str, Any]:
        """Load and return current user progress from Firestore."""
        is_mock_runtime = os.getenv("USE_MOCK_AUTH", "false").lower() == "true"
        if is_mock_runtime or self.use_mock_auth:
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
        
        if not self.db:
            return {"completed_topics": {}, "unlocked_subjects": [1], "unlocked_modules": ["s1m1"]}
            
        try:
            # Fetch all completed topics for this user from 'user_progress' collection
            # Structure: user_id -> collections -> progress_docs
            docs = self.db.collection("user_progress").where("user_id", "==", user_id).stream()
            
            completed_topics = {}
            doc_count = 0
            for doc in docs:
                item = doc.to_dict()
                mid = item.get("module_id")
                topic_slug = item.get("topic_slug")
                if mid and topic_slug:
                    if mid not in completed_topics:
                        completed_topics[mid] = []
                    completed_topics[mid].append(topic_slug)
                    doc_count += 1
                
            # Logic for unlocked modules/subjects
            unlocked_modules = ["s1m1"]
            unlocked_subjects = [1]
            
            from .curriculum_loader import curriculum_loader
            all_module_ids = curriculum_loader.list_all_modules()
            
            for mid in all_module_ids:
                module = curriculum_loader.load_module_by_id(mid)
                if not module: 
                    print(f"DEBUG: Could not load module {mid} during progress check")
                    continue
                
                topic_slugs = [t.slug for t in module.topics]
                completed_in_mid = completed_topics.get(mid, [])
                
                # Check if all topics are done (or if the module itself was marked complete)
                # We use a bit of tolerance here to handle potential data inconsistencies
                is_module_complete = len(topic_slugs) > 0 and all(slug in completed_in_mid for slug in topic_slugs)
                
                if is_module_complete:
                    try:
                        idx = all_module_ids.index(mid)
                        if idx < len(all_module_ids) - 1:
                            next_mid = all_module_ids[idx + 1]
                            if next_mid not in unlocked_modules:
                                unlocked_modules.append(next_mid)
                                # Subject unlocking logic
                                if next_mid.endswith("m1"):
                                    try:
                                        subj_idx = int(next_mid[1:].split("m")[0])
                                        if subj_idx not in unlocked_subjects:
                                            unlocked_subjects.append(subj_idx)
                                    except: pass
                    except Exception as e:
                        print(f"DEBUG: Error calculating next module for {mid}: {e}")
                else:
                    # If current module is NOT complete, we stop unlocking further ones
                    # but we keep s1m1 as unlocked by default if nothing else is
                    break
                    
            return {
                "completed_topics": completed_topics,
                "unlocked_subjects": sorted(list(set(unlocked_subjects))),
                "unlocked_modules": unlocked_modules,
                "streak": 1,
                "xp": doc_count * 50
            }
        except Exception as e:
            print(f"Error fetching Firestore progress: {e}")
            return {"completed_topics": {}, "unlocked_subjects": [1], "unlocked_modules": ["s1m1"]}

    def update_topic_completion(self, user_id: str, module_id: str, topic_slug: str):
        """Mark a topic as completed in Firestore."""
        is_mock_runtime = os.getenv("USE_MOCK_AUTH", "false").lower() == "true"
        if is_mock_runtime or self.use_mock_auth:
            if user_id not in MOCK_COMPLETED_TOPICS:
                MOCK_COMPLETED_TOPICS[user_id] = {}
            if module_id not in MOCK_COMPLETED_TOPICS[user_id]:
                MOCK_COMPLETED_TOPICS[user_id][module_id] = []
            if topic_slug not in MOCK_COMPLETED_TOPICS[user_id][module_id]:
                MOCK_COMPLETED_TOPICS[user_id][module_id].append(topic_slug)
            return

        if not self.db: return
        
        try:
            # Use unique doc ID to avoid duplicates: user_id:module_id:topic_slug
            doc_id = f"{user_id}:{module_id}:{topic_slug}"
            self.db.collection("user_progress").document(doc_id).set({
                "user_id": user_id,
                "module_id": module_id,
                "topic_slug": topic_slug,
                "completed_at": firestore.SERVER_TIMESTAMP
            })
        except Exception as e:
            print(f"Error updating Firestore progress: {e}")

    def complete_module(self, user_id: str, module_id: str):
        """Mark an entire module as completed."""
        is_mock_runtime = os.getenv("USE_MOCK_AUTH", "false").lower() == "true"
        if is_mock_runtime or self.use_mock_auth:
            from .curriculum_loader import curriculum_loader
            module = curriculum_loader.load_module_by_id(module_id)
            if module:
                for topic in module.topics:
                    self.update_topic_completion(user_id, module_id, topic.slug)
            return
        
        # Firestore batch or loop for module completion
        from .curriculum_loader import curriculum_loader
        module = curriculum_loader.load_module_by_id(module_id)
        if module:
            for topic in module.topics:
                self.update_topic_completion(user_id, module_id, topic.slug)


# Global instance
progress_manager = ProgressManager()
