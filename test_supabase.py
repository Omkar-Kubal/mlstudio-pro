import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv('backend/.env')
url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_ANON_KEY")

print(f"URL: {url}")
try:
    supabase = create_client(url, key)
    # Try a simple unauthenticated request
    res = supabase.table('subjects').select("*", count='exact').limit(1).execute()
    print("Success!")
except Exception as e:
    print(f"Error: {e}")
