"""
EP-1: Deterministic Execution

Utilities for enforcing reproducible random state across all labs.
"""

import json
from typing import List, Tuple, Optional
from pathlib import Path


# Standard seed injection code
SEED_CELL_SOURCE = '''# [V2 Runtime] Deterministic Seed Enforcement
import numpy as np
import random
np.random.seed(42)
random.seed(42)
try:
    import torch
    torch.manual_seed(42)
    if torch.cuda.is_available():
        torch.cuda.manual_seed_all(42)
except ImportError:
    pass
'''

# Patterns indicating seed is already set
SEED_PATTERNS = [
    "np.random.seed",
    "numpy.random.seed", 
    "random.seed",
    "torch.manual_seed",
]


class SeedEnforcer:
    """Ensures deterministic execution via seed management."""
    
    DEFAULT_SEED = 42
    
    def __init__(self, seed: int = DEFAULT_SEED):
        self.seed = seed
        self._seed_cell = self._generate_seed_cell()
    
    def _generate_seed_cell(self) -> dict:
        """Generate a notebook cell that sets all random seeds."""
        return {
            "cell_type": "code",
            "execution_count": None,
            "metadata": {"v2_runtime": True, "seed_enforcement": True},
            "outputs": [],
            "source": SEED_CELL_SOURCE.replace("42", str(self.seed))
        }
    
    def check_notebook(self, notebook: dict) -> Tuple[bool, List[str]]:
        """
        Check if notebook has proper seed enforcement.
        
        Args:
            notebook: Parsed notebook dict
            
        Returns:
            (has_seeds, issues): Whether seeds are set and list of issues
        """
        issues = []
        has_numpy_seed = False
        has_random_seed = False
        
        for i, cell in enumerate(notebook.get("cells", [])):
            if cell.get("cell_type") != "code":
                continue
            
            source = "".join(cell.get("source", []))
            
            if "np.random.seed" in source or "numpy.random.seed" in source:
                has_numpy_seed = True
            if "random.seed" in source:
                has_random_seed = True
        
        if not has_numpy_seed:
            issues.append("Missing numpy seed (np.random.seed)")
        if not has_random_seed:
            issues.append("Missing random seed (random.seed)")
        
        return (has_numpy_seed and has_random_seed), issues
    
    def inject_seed_cell(self, notebook: dict, force: bool = False) -> dict:
        """
        Inject seed enforcement cell at the start of notebook.
        
        Args:
            notebook: Parsed notebook dict
            force: If True, inject even if seeds exist
            
        Returns:
            Modified notebook dict
        """
        has_seeds, _ = self.check_notebook(notebook)
        
        if has_seeds and not force:
            return notebook
        
        # Find first code cell position
        cells = notebook.get("cells", [])
        insert_pos = 0
        
        for i, cell in enumerate(cells):
            if cell.get("cell_type") == "code":
                # Check if it's already our seed cell
                source = "".join(cell.get("source", []))
                if "[V2 Runtime]" in source:
                    return notebook  # Already injected
                insert_pos = i
                break
        
        # Insert seed cell
        cells.insert(insert_pos, self._seed_cell)
        notebook["cells"] = cells
        
        return notebook
    
    def verify_seed_consistency(self, notebook_path: Path) -> bool:
        """
        Verify that a notebook uses consistent seed value.
        
        Args:
            notebook_path: Path to notebook file
            
        Returns:
            True if seeds are consistent
        """
        with open(notebook_path, 'r', encoding='utf-8') as f:
            notebook = json.load(f)
        
        seeds_found = []
        
        for cell in notebook.get("cells", []):
            if cell.get("cell_type") != "code":
                continue
            
            source = "".join(cell.get("source", []))
            
            # Extract seed values
            import re
            for pattern in [r"seed\((\d+)\)", r"manual_seed\((\d+)\)"]:
                matches = re.findall(pattern, source)
                seeds_found.extend(int(m) for m in matches)
        
        if not seeds_found:
            return False
        
        # All seeds should be the same
        return len(set(seeds_found)) == 1
    
    @staticmethod
    def extract_seed_from_notebook(notebook: dict) -> Optional[int]:
        """Extract the seed value used in a notebook."""
        import re
        
        for cell in notebook.get("cells", []):
            if cell.get("cell_type") != "code":
                continue
            
            source = "".join(cell.get("source", []))
            match = re.search(r"np\.random\.seed\((\d+)\)", source)
            if match:
                return int(match.group(1))
        
        return None
