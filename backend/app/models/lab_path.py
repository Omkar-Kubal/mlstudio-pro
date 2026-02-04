from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class Lab(BaseModel):
    id: str
    title: str
    description: str
    notebook_path: Optional[str] = None
    difficulty: str

class Path(BaseModel):
    persona: str
    title: str
    description: str
    modules: List[str] # List of lesson_ids (s1m1 etc.)
