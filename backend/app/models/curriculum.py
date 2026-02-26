from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any, Union

class QuizItem(BaseModel):
    id: str
    question: str
    options: List[str]
    correctAnswer: int
    explanation: str

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
    slug: str
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
    quiz: List[Union[QuizItem, str]]
    references: List[Reference]
    _contentWarnings: Optional[List[str]] = None
