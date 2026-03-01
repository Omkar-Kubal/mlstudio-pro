import json
import os
from pathlib import Path
from typing import Dict, Any, Optional, List
from ..models.curriculum import LearningModule

class CurriculumLoader:
    def __init__(self):
        # Base directory is d:\mlstudio-pro\backend\core\content\curriculum
        self.base_dir = Path(__file__).resolve().parent.parent.parent / "core" / "content" / "curriculum"

    def get_module_path(self, subject_idx: int, module_idx: int) -> Optional[Path]:
        # Search for s{subject_idx}m{module_idx}.json in any subdirectory
        for subject_dir in self.base_dir.iterdir():
            if subject_dir.is_dir():
                json_path = subject_dir / "json" / f"s{subject_idx}m{module_idx}.json"
                if json_path.exists():
                    return json_path
        return None

    def load_module(self, subject_idx: int, module_idx: int) -> Optional[LearningModule]:
        file_path = self.get_module_path(subject_idx, module_idx)
        if not file_path or not file_path.exists():
            return None
        
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                return LearningModule(**data)
        except Exception as e:
            print(f"Error loading module from {file_path}: {e}")
            return None

    def load_module_by_id(self, lesson_id: str) -> Optional[LearningModule]:
        """Load module by sXmY ID or by its slug name."""
        # Try s1m1 format first
        if lesson_id.startswith("s") and "m" in lesson_id:
            try:
                parts = lesson_id[1:].split("m")
                subject_idx = int(parts[0])
                module_idx = int(parts[1])
                return self.load_module(subject_idx, module_idx)
            except (ValueError, IndexError):
                pass
        
        # Fallback: search by slug in all module files
        all_ids = self.list_all_modules()
        for mid in all_ids:
            module = self.load_module_by_id(mid) if mid != lesson_id else None # avoid recursion
            if not module:
                # Need to manually load to avoid infinite recursion
                try:
                    parts = mid[1:].split("m")
                    module = self.load_module(int(parts[0]), int(parts[1]))
                except: continue
                
            if module and module.meta.module.lower() == lesson_id.lower():
                return module
        
        return None

    def list_all_modules(self) -> List[str]:
        modules = []
        if not self.base_dir.exists():
            return []
            
        for subject_dir in self.base_dir.iterdir():
            if subject_dir.is_dir():
                json_dir = subject_dir / "json"
                if json_dir.exists():
                    modules.extend([f.stem for f in json_dir.glob("*.json")])
        
        # Numerical sort based on s{X}m{Y}
        def sort_key(mid):
            try:
                parts = mid[1:].split('m')
                return (int(parts[0]), int(parts[1]))
            except:
                return (0, 0)

        return sorted(modules, key=sort_key)

curriculum_loader = CurriculumLoader()
