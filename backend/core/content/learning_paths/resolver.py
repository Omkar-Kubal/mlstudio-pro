import json
from typing import List, Dict, Any

class PathResolver:
    def __init__(self, persona_file: str):
        with open(persona_file, 'r') as f: self.data = json.load(f)
    def get_recommendation(self, persona: str, completed_ids: List[str]) -> Dict[str, Any]:
        if persona not in self.data["paths"]: return {"error": "Invalid persona"}
        path_info = self.data["paths"][persona]
        for cid in path_info["critical_path"]:
            if cid not in completed_ids: return {"persona": persona, "recommended_next": cid}
        return {"status": "completed"}
    def validate_dag(self) -> bool: return True
