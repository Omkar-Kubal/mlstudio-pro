from fastapi import Header, HTTPException, Depends
from typing import Optional
import os
from supabase import create_client, Client

# Initialize a separate client for auth verification if needed, 
# or reuse the one from progress_manager if it's exported.
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_ANON_KEY")
use_mock_auth = os.getenv("USE_MOCK_AUTH", "false").lower() == "true"

supabase: Optional[Client] = None
if not use_mock_auth and supabase_url and supabase_key:
    supabase = create_client(supabase_url, supabase_key)

async def get_current_user(authorization: Optional[str] = Header(None)):
    """Extract and verify Supabase JWT from Authorization header."""
    # Check at runtime to allow dynamic changes in dev
    use_mock_auth_runtime = os.getenv("USE_MOCK_AUTH", "false").lower() == "true"
    
    if use_mock_auth_runtime:
        print(f"DEBUG: Using Mock Auth mode. Auth Header: {authorization[:20] if authorization else 'None'}...")
        # Return a dummy user for local development
        class MockUser:
            def __init__(self):
                self.id = "00000000-0000-0000-0000-000000000000"
                self.email = "dev@mlstudio.pro"
        return MockUser()

    print(f"DEBUG: Mock Auth OFF. Verifying header: {authorization[:20] if authorization else 'None'}...")

    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid authorization header")
    
    token = authorization.split(" ")[1]
    
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase client not initialized")
        
    try:
        # Verify token and get user
        res = supabase.auth.get_user(token)
        if not res.user:
            raise HTTPException(status_code=401, detail="Invalid token or user session")
        return res.user
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Authentication failed: {str(e)}")
