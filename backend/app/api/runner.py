from fastapi import APIRouter, HTTPException, Request, Depends
from pydantic import BaseModel
from ..services.code_runner import code_runner
from .auth_deps import get_current_user

router = APIRouter()

class CodeRequest(BaseModel):
    code: str
    language: str = "python"

@router.post("/run")
async def run_code(request: Request, body: CodeRequest, user = Depends(get_current_user)):
    """Executes Python code with rate limiting (5 req/min)."""
    # Rate limit check manually since we want to use the global limiter from app state
    limiter = request.app.state.limiter
    
    @limiter.limit("5/minute")
    async def _handle(request: Request):
        if body.language.lower() != "python":
            raise HTTPException(status_code=400, detail="Only Python is supported for local execution.")
        
        result = code_runner.run_python(body.code)
        return result

    return await _handle(request)
