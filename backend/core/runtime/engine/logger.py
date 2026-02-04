"""
EP-7: Execution Metadata & Logging

Records runtime information for reproducibility and auditability.
"""

import json
import hashlib
import platform
import subprocess
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, List, Optional
from dataclasses import dataclass, field, asdict


@dataclass
class LibraryVersion:
    """Version information for a Python library."""
    name: str
    version: str


@dataclass
class ExecutionMetadata:
    """Complete metadata for a lab execution run."""
    
    # Identification
    lab_name: str
    lab_path: str
    run_id: str = field(default_factory=lambda: datetime.now().strftime("%Y%m%d_%H%M%S"))
    
    # Timing
    timestamp: str = field(default_factory=lambda: datetime.now().isoformat())
    duration_seconds: float = 0.0
    
    # Environment
    python_version: str = field(default_factory=platform.python_version)
    platform: str = field(default_factory=platform.platform)
    
    # Libraries
    library_versions: List[LibraryVersion] = field(default_factory=list)
    
    # Reproducibility
    random_seed: int = 42
    output_hash: Optional[str] = None
    notebook_hash: Optional[str] = None
    
    # Results
    completion_state: str = "unknown"
    cells_executed: int = 0
    cells_total: int = 0
    error_count: int = 0
    errors: List[Dict[str, Any]] = field(default_factory=list)
    validations: List[Dict[str, Any]] = field(default_factory=list)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization."""
        data = asdict(self)
        data["library_versions"] = [
            {"name": lv.name, "version": lv.version} 
            for lv in self.library_versions
        ]
        return data


class ExecutionLogger:
    """Logs execution metadata for reproducibility."""
    
    TRACKED_LIBRARIES = [
        "numpy", "pandas", "matplotlib", "seaborn", "scikit-learn",
        "scipy", "torch", "tensorflow", "keras"
    ]
    
    def __init__(self, reports_dir: Path):
        self.reports_dir = Path(reports_dir)
        self.reports_dir.mkdir(parents=True, exist_ok=True)
    
    def get_library_versions(self) -> List[LibraryVersion]:
        """Get versions of tracked libraries."""
        versions = []
        
        for lib_name in self.TRACKED_LIBRARIES:
            try:
                if lib_name == "scikit-learn":
                    import sklearn
                    versions.append(LibraryVersion(lib_name, sklearn.__version__))
                else:
                    module = __import__(lib_name)
                    versions.append(LibraryVersion(lib_name, getattr(module, "__version__", "unknown")))
            except ImportError:
                pass
        
        return versions
    
    def compute_file_hash(self, file_path: Path) -> str:
        """Compute SHA256 hash of a file."""
        sha256 = hashlib.sha256()
        with open(file_path, 'rb') as f:
            for chunk in iter(lambda: f.read(8192), b''):
                sha256.update(chunk)
        return sha256.hexdigest()[:16]
    
    def compute_output_hash(self, outputs: List[Any]) -> str:
        """Compute hash of notebook outputs for reproducibility check."""
        output_str = json.dumps(outputs, sort_keys=True, default=str)
        return hashlib.sha256(output_str.encode()).hexdigest()[:16]
    
    def create_metadata(
        self,
        lab_name: str,
        lab_path: Path,
        seed: int = 42
    ) -> ExecutionMetadata:
        """Create initial metadata for a lab execution."""
        return ExecutionMetadata(
            lab_name=lab_name,
            lab_path=str(lab_path),
            library_versions=self.get_library_versions(),
            random_seed=seed,
            notebook_hash=self.compute_file_hash(lab_path),
        )
    
    def save_metadata(self, metadata: ExecutionMetadata) -> Path:
        """Save metadata to JSON file."""
        filename = f"{metadata.lab_name}_{metadata.run_id}.json"
        filepath = self.reports_dir / filename
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(metadata.to_dict(), f, indent=2)
        
        return filepath
    
    def load_metadata(self, filepath: Path) -> ExecutionMetadata:
        """Load metadata from JSON file."""
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Convert library versions
        lib_versions = [
            LibraryVersion(**lv) for lv in data.pop("library_versions", [])
        ]
        
        metadata = ExecutionMetadata(**data)
        metadata.library_versions = lib_versions
        return metadata
    
    def generate_summary_report(self, results: List[ExecutionMetadata]) -> Dict[str, Any]:
        """Generate aggregate summary of multiple executions."""
        if not results:
            return {"total": 0}
        
        states = {}
        for r in results:
            states[r.completion_state] = states.get(r.completion_state, 0) + 1
        
        return {
            "total": len(results),
            "pass": states.get("pass", 0),
            "soft_fail": states.get("soft_fail", 0),
            "hard_fail": states.get("hard_fail", 0),
            "skipped": states.get("skipped", 0),
            "total_duration_seconds": sum(r.duration_seconds for r in results),
            "avg_duration_seconds": sum(r.duration_seconds for r in results) / len(results),
            "timestamp": datetime.now().isoformat(),
            "python_version": platform.python_version(),
        }
