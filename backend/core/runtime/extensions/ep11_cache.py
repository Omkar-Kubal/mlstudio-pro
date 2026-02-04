import hashlib
import json
import os
from pathlib import Path

class DeterministicCache:
    def __init__(self, cache_dir: Path):
        self.cache_dir = Path(cache_dir)
        self.cache_dir.mkdir(parents=True, exist_ok=True)

    def _get_key(self, cell_source, seed):
        content = f"{cell_source}_{seed}"
        return hashlib.sha256(content.encode()).hexdigest()

    def get(self, cell_source, seed):
        key = self._get_key(cell_source, seed)
        cache_file = self.cache_dir / f"{key}.json"
        if cache_file.exists():
            with open(cache_file, 'r') as f: return json.load(f)
        return None

    def set(self, cell_source, seed, outputs):
        key = self._get_key(cell_source, seed)
        cache_file = self.cache_dir / f"{key}.json"
        with open(cache_file, 'w') as f: json.dump(outputs, f)
