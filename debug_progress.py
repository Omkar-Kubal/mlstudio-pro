
import os
import sys
from pathlib import Path

# Add backend to path
backend_path = Path("d:/mlstudio-pro/backend").resolve()
sys.path.append(str(backend_path))

# Set mock auth to true just for testing the logic in get_progress
os.environ["USE_MOCK_AUTH"] = "true"

from app.services.curriculum_loader import curriculum_loader
from app.services.progress_manager import ProgressManager

pm = ProgressManager()

print("Listing all modules:")
all_mids = curriculum_loader.list_all_modules()
print(all_mids)

print("\nTesting get_progress logic (mock mode):")
# In mock mode it should unlock everything
progress = pm.get_progress("00000000-0000-0000-0000-000000000000")
print("Unlocked modules (mock):", progress["unlocked_modules"])

# Simulate NON-MOCK mode for just the logic check
os.environ["USE_MOCK_AUTH"] = "false"
pm.use_mock_auth = False

print("\nTesting get_progress logic (simulated real mode with mock data):")
# We'll need to manually populate the data since we don't have Firestore here
# Let's see if we can trick the pm.get_progress by mocking the Firestore stream

class MockDoc:
    def __init__(self, data):
        self._data = data
    def to_dict(self):
        return self._data

class MockQuery:
    def __init__(self, docs):
        self.docs = docs
    def stream(self):
        return iter(self.docs)

class MockCollection:
    def __init__(self, docs_data):
        self.docs_data = docs_data
    def where(self, *args, **kwargs):
        # Filter docs based on user_id (not really needed for this debug)
        return MockQuery([MockDoc(d) for d in self.docs_data])

class MockDB:
    def __init__(self, docs_data):
        self.docs_data = docs_data
    def collection(self, name):
        return MockCollection(self.docs_data)

# Test case 1: Every topic in s1m1 completed
s1m1_topics = [
    "descriptive-statistics", "population-vs-sample", "central-tendency", 
    "dispersion-measures", "law-of-large-numbers"
]
docs_data = [
    {"user_id": "test", "module_id": "s1m1", "topic_slug": slug} 
    for slug in s1m1_topics
]

pm.db = MockDB(docs_data)
progress = pm.get_progress("test")
print("Unlocked modules (s1m1 complete):", progress["unlocked_modules"])

# Test case 2: one topic missing in s1m1
docs_data_missing = docs_data[:-1]
pm.db = MockDB(docs_data_missing)
progress = pm.get_progress("test")
print("Unlocked modules (s1m1 INcomplete):", progress["unlocked_modules"])
