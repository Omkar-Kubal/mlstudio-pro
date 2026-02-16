from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any

class Meta(BaseModel):
    subject: str
    module: str
    level: str
    estimatedHours: float

class CodeSnippet(BaseModel):
    language: str
    description: str
    content: str

class Topic(BaseModel):
    title: str
    theory: List[str]
    visualIntuition: List[str]
    visualSuggestions: List[str]
    code: List[CodeSnippet]

class Reference(BaseModel):
    label: str
    url: str

class LearningModule(BaseModel):
    model_config = ConfigDict(protected_namespaces=())

    meta: Meta
    overview: List[str]
    topics: List[Topic]
    quiz: List[str]
    references: List[Reference]
    _contentWarnings: Optional[List[str]] = None
