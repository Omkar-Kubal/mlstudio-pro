import json
from pathlib import Path
from typing import List, Optional
from ..models.lab_path import Lab, Path as LearningPath

class LabLoader:
    def __init__(self):
        self.base_dir = Path(__file__).resolve().parent.parent.parent / "core" / "content" / "labs"
        
    def list_labs(self) -> List[Lab]:
        # Minimal implementation for now - listing from directory structure
        labs = []
        if not self.base_dir.exists():
            return labs
            
        # Example: foundations labs
        foundations_dir = self.base_dir / "foundations"
        if foundations_dir.exists():
            for folder in foundations_dir.iterdir():
                if folder.is_dir():
                    labs.append(Lab(
                        id=folder.name,
                        title=folder.name.replace("-", " ").title(),
                        description=f"Interactive lab for {folder.name}",
                        difficulty="Beginner"
                    ))
        return labs

    def get_lab(self, lab_id: str) -> Optional[Lab]:
        labs = self.list_labs()
        for lab in labs:
            if lab.id == lab_id:
                return lab
        return None

class PathResolver:
    def __init__(self):
        # In a real scenario, this would load from core/content/learning_paths
        self.base_dir = Path(__file__).resolve().parent.parent.parent / "core" / "content" / "learning_paths"

    def get_path_for_persona(self, persona: str) -> Optional[LearningPath]:
        # Placeholder for V4 resolver logic
        paths = {
            "researcher": LearningPath(
                persona="researcher",
                title="Research Scientist Track",
                description="Advanced statistics and model theory.",
                modules=["s1m1", "s1m2", "s2m1"]
            ),
            "engineer": LearningPath(
                persona="engineer",
                title="ML Engineer Track",
                description="Production-ready ML and systems.",
                modules=["s1m1", "s3m1", "s4m1"]
            )
        }
        return paths.get(persona.lower())

    def list_personas(self) -> List[str]:
        return ["researcher", "engineer"]

lab_loader = LabLoader()
path_resolver = PathResolver()
