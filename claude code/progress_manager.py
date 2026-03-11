import os
from typing import Dict, List, Any
import firebase_admin
from firebase_admin import firestore

# In-memory storage for mock mode (resets on server restart).
# FIX M-3: Each user's mock state is isolated by user_id key;
# the structure is unchanged but the note stands that this is process-local
# and shared between all requests in the same worker process.
MOCK_COMPLETED_TOPICS: Dict[str, Dict[str, List[str]]] = {
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
                self.db = firestore.client()
            except Exception as e:
                print(f"WARNING: Firestore initialization failed: {e}. Progress tracking will use Mock mode.")
                self.use_mock_auth = True

    def get_progress(self, user_id: str) -> Dict[str, Any]:
        """Load and return current user progress from Firestore."""
        is_mock_runtime = os.getenv("USE_MOCK_AUTH", "false").lower() == "true"
        if is_mock_runtime or self.use_mock_auth:
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
            docs = self.db.collection("user_progress").where("user_id", "==", user_id).stream()

            completed_topics: Dict[str, List[str]] = {}
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

            from .curriculum_loader import curriculum_loader
            all_module_ids = curriculum_loader.list_all_modules()

            # FIX H-4: Compute the full set of completed modules FIRST, then
            # derive the unlocked set in a single pass. The old code used `break`
            # which would stop processing all modules after the first incomplete
            # one, incorrectly locking modules that the user had actually completed.
            completed_module_ids: set = set()
            for mid in all_module_ids:
                module = curriculum_loader.load_module_by_id(mid)
                if not module:
                    continue
                topic_slugs = [t.slug for t in module.topics]
                completed_in_mid = completed_topics.get(mid, [])
                if len(topic_slugs) > 0 and all(slug in completed_in_mid for slug in topic_slugs):
                    completed_module_ids.add(mid)

            # Unlock s1m1 by default plus the module immediately after each completed one.
            unlocked_modules: List[str] = ["s1m1"]
            unlocked_subjects: set = {1}

            for mid in all_module_ids:
                if mid in completed_module_ids:
                    try:
                        idx = all_module_ids.index(mid)
                        if idx < len(all_module_ids) - 1:
                            next_mid = all_module_ids[idx + 1]
                            if next_mid not in unlocked_modules:
                                unlocked_modules.append(next_mid)
                                if next_mid.endswith("m1"):
                                    try:
                                        subj_idx = int(next_mid[1:].split("m")[0])
                                        unlocked_subjects.add(subj_idx)
                                    except (ValueError, IndexError):
                                        pass
                    except Exception as e:
                        print(f"DEBUG: Error calculating next module for {mid}: {e}")

            return {
                "completed_topics": completed_topics,
                "unlocked_subjects": sorted(list(unlocked_subjects)),
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

        if not self.db:
            return

        try:
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
        from .curriculum_loader import curriculum_loader
        module = curriculum_loader.load_module_by_id(module_id)
        if module:
            for topic in module.topics:
                self.update_topic_completion(user_id, module_id, topic.slug)


# Global instance
progress_manager = ProgressManager()
