import sys
import os
from pathlib import Path

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from backend.app.services.curriculum_loader import curriculum_loader

def check():
    print("Checking s1m1 loading...")
    module = curriculum_loader.load_module_by_id("s1m1")
    if not module:
        print("FAILED: Module s1m1 not found")
        return
    
    print(f"Module Title: {module.meta.module}")
    print(f"Topic Count: {len(module.topics)}")
    for topic in module.topics:
        print(f" - {topic.slug}: {topic.title}")

    print("\nChecking statistics (slug) loading...")
    module_slug = curriculum_loader.load_module_by_id("statistics")
    if not module_slug:
        print("FAILED: Module 'statistics' not found")
    else:
        print(f"Module Title: {module_slug.meta.module}")
        print(f"Topic Count: {len(module_slug.topics)}")

if __name__ == "__main__":
    check()
