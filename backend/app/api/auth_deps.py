from fastapi import Header, HTTPException, Depends
from typing import Optional
import os
import firebase_admin
from firebase_admin import auth

# use_mock_auth is resolved at import time — firebase_init.py ran before us in main.py
use_mock_auth = os.getenv("USE_MOCK_AUTH", "false").lower() == "true" or not bool(firebase_admin._apps)

async def get_current_user(authorization: Optional[str] = Header(None)):
    """Extract and verify Firebase ID Token from Authorization header."""
    # Check at runtime to allow dynamic changes in dev
    use_mock_auth_runtime = os.getenv("USE_MOCK_AUTH", "false").lower() == "true"
    
    if use_mock_auth_runtime or use_mock_auth:
        # Return a dummy user for local development
        class MockUser:
            def __init__(self):
                self.id = "00000000-0000-0000-0000-000000000000"
                self.email = "dev@mlstudio.pro"
                self.is_admin = True
        return MockUser()

    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid authorization header")
    
    token = authorization.split(" ")[1]
    
    try:
        # Verify Firebase ID Token
        decoded_token = auth.verify_id_token(token)
        
        class FirebaseUser:
            def __init__(self, token_data: dict):
                self.id = token_data.get("uid")
                self.email = token_data.get("email")
                self.name = token_data.get("name")
                
                # Check for admin claim OR email match from .env
                admin_email = os.getenv("ADMIN_EMAIL")
                is_admin_claim = token_data.get("admin", False) is True
                self.is_admin = is_admin_claim or (admin_email and self.email == admin_email)
                self.token_data = token_data
        
        return FirebaseUser(decoded_token)
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Authentication failed: {str(e)}")

async def get_current_admin(user = Depends(get_current_user)):
    """Ensure the current user has admin privileges."""
    if not user.is_admin:
        raise HTTPException(
            status_code=403, 
            detail="Forbidden: Admin access only"
        )
    return user
