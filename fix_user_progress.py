import firebase_admin
from firebase_admin import credentials, firestore
import os
from pathlib import Path
from dotenv import load_dotenv

# Load env from backend
load_dotenv('backend/.env')

def fix():
    user_id = "lSqQdnGcO2TR6xPniGt4kBcWhr72" # Found in dump
    module_id = "s1m1"
    
    # Topics for s1m1
    topic_slugs = [
        "descriptive-statistics",
        "population-vs-sample",
        "central-tendency",
        "dispersion-measures",
        "law-of-large-numbers"
    ]
    
    # Initialize Firebase
    if not firebase_admin._apps:
        cred_path = os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON")
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)

    db = firestore.client()
    
    print(f"Repairing progress for user: {user_id}")
    
    # 1. Remove the bogus "complete" topic if it exists
    bogus_doc_id = f"{user_id}:{module_id}:complete"
    db.collection("user_progress").document(bogus_doc_id).delete()
    print(f"Deleted bogus doc: {bogus_doc_id}")
    
    # 2. Add all legit topics
    for slug in topic_slugs:
        doc_id = f"{user_id}:{module_id}:{slug}"
        db.collection("user_progress").document(doc_id).set({
            "user_id": user_id,
            "module_id": module_id,
            "topic_slug": slug,
            "completed_at": firestore.SERVER_TIMESTAMP
        })
        print(f"Recorded completion for: {slug}")

    print("Progress repair COMPLETE.")

if __name__ == "__main__":
    fix()
