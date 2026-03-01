"""
Shared Firebase Admin SDK initialization.
This module is imported by main.py BEFORE any other service,
ensuring initialize_app() is called exactly once at startup.
"""
import os
import json
import firebase_admin
from firebase_admin import credentials

use_mock_auth = os.getenv("USE_MOCK_AUTH", "false").lower() == "true"
firebase_initialized = False

if not use_mock_auth:
    try:
        if not firebase_admin._apps:
            sa_config = os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON")
            
            if sa_config:
                if sa_config.startswith("{"):
                    # Parse as JSON string from env variable
                    cred_dict = json.loads(sa_config)
                    cred = credentials.Certificate(cred_dict)
                    firebase_admin.initialize_app(cred)
                elif os.path.exists(sa_config):
                    # Use as file path for local development
                    cred = credentials.Certificate(sa_config)
                    firebase_admin.initialize_app(cred)
                else:
                    raise ValueError("FIREBASE_SERVICE_ACCOUNT_JSON must be a valid file path or a JSON string.")
            else:
                # Try Application Default Credentials (for Cloud environments)
                firebase_admin.initialize_app()
            firebase_initialized = True
            print("LOG: Firebase Admin SDK initialized successfully.")
    except Exception as e:
        print(f"WARNING: Firebase Admin SDK failed to initialize: {e}. Falling back to Mock mode.")
        use_mock_auth = True
else:
    print("LOG: Firebase Admin SDK skipped — USE_MOCK_AUTH=true.")
