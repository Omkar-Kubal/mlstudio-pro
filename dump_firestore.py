import firebase_admin
from firebase_admin import credentials, firestore
import os
from dotenv import load_dotenv

# Load env from backend
load_dotenv('backend/.env')

def dump():
    user_id = "69396bde-f1a3-4cbd-bb08-6f09897bc0ae" # From logs
    
    # Initialize Firebase if not already
    if not firebase_admin._apps:
        cred_path = os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON")
        if not cred_path or not os.path.exists(cred_path):
            print(f"Credentials not found at {cred_path}")
            return
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)

    db = firestore.client()
    docs = db.collection("user_progress").stream()
    
    print(f"Dumping all user progress...")
    found = False
    for doc in docs:
        found = True
        data = doc.to_dict()
        print(f"ID: {doc.id} => User: {data.get('user_id')}, Module: {data.get('module_id')}, Topic: {data.get('topic_slug')}")
    
    if not found:
        print("No progress found for this user.")

if __name__ == "__main__":
    dump()
