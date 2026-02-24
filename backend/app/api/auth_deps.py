from fastapi import Header, HTTPException, Depends
from typing import Optional
import os
from supabase import create_client, Client

# Initialize a separate client for auth verification if needed, 
# or reuse the one from progress_manager if it's exported.
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_ANON_KEY")

supabase: Optional[Client] = None
if supabase_url and supabase_key:
    supabase = create_client(supabase_url, supabase_key)

async def get_current_user(authorization: Optional[str] = Header(None)):
    """Extract and verify Supabase JWT from Authorization header."""
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
