from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from ..services.code_runner import code_runner

router = APIRouter()

class CodeRequest(BaseModel):
    code: str
    language: str = "python"

@router.post("/run")
async def run_code(request: CodeRequest):
    if request.language.lower() != "python":
        raise HTTPException(status_code=400, detail="Only Python is supported for local execution.")
    
    result = code_runner.run_python(request.code)
    return result
