import firebase_admin
from firebase_admin import auth, credentials
import os
import sys

def set_admin_claim(email_or_uid):
    """Grant admin privileges to a user in Firebase Auth."""
    # Initialization
    try:
        if not firebase_admin._apps:
            sa_path = os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON")
            if sa_path and os.path.exists(sa_path):
                cred = credentials.Certificate(sa_path)
                firebase_admin.initialize_app(cred)
            else:
                firebase_admin.initialize_app()
    except Exception as e:
        print(f"Error initializing Firebase: {e}")
        return

    try:
        # Resolve user
        if "@" in email_or_uid:
            user = auth.get_user_by_email(email_or_uid)
        else:
            user = auth.get_user(email_or_uid)
        
        # Set custom claims
        auth.set_custom_user_claims(user.uid, {"admin": True})
        print(f"Successfully granted admin access to: {user.email} (UID: {user.uid})")
        print("Note: The user must log out and log back in for the changes to take effect.")
        
    except Exception as e:
        print(f"Error setting admin claim: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python set_admin.py <email_or_uid>")
    else:
        set_admin_claim(sys.argv[1])
