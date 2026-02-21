import json
import os
from pathlib import Path
from typing import Dict, Any, Optional, List
from ..models.curriculum import LearningModule

class CurriculumLoader:
    def __init__(self):
        # Base directory is d:\mlstudio-pro\backend\core\content\curriculum
        self.base_dir = Path(__file__).resolve().parent.parent.parent / "core" / "content" / "curriculum"
        self.json_dir = self.base_dir / "foundations" / "json"

    def get_module_path(self, subject_idx: int, module_idx: int) -> Path:
        return self.json_dir / f"s{subject_idx}m{module_idx}.json"

    def load_module(self, subject_idx: int, module_idx: int) -> Optional[LearningModule]:
        file_path = self.get_module_path(subject_idx, module_idx)
        if not file_path.exists():
            return None
        
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                return LearningModule(**data)
        except Exception:
            return None

    def load_module_by_id(self, lesson_id: str) -> Optional[LearningModule]:
        # lesson_id expected in format "s1m1"
        if not lesson_id.startswith("s") or "m" not in lesson_id:
            return None
        
        try:
            parts = lesson_id[1:].split("m")
            subject_idx = int(parts[0])
            module_idx = int(parts[1])
            return self.load_module(subject_idx, module_idx)
        except (ValueError, IndexError):
            return None

    def list_all_modules(self) -> List[str]:
        if not self.json_dir.exists():
            return []
        return [f.stem for f in self.json_dir.glob("*.json")]

curriculum_loader = CurriculumLoader()
