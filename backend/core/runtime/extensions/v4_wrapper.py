import os
import time
from pathlib import Path
from typing import Dict, Any, List, Optional
import sys

# Package-relative imports
from ..engine.runner import NotebookRunner
from ..engine.scorer import LabResult, CompletionState

from .ep8_profiler import ResourceProfiler
from .ep9_timeouts import update_result_with_timeout_info
from .ep10_gpu import is_hardware_compatible
from .ep11_cache import DeterministicCache

class NotebookRunnerV4:
    def __init__(self, base_runner: NotebookRunner):
        self.base = base_runner
        self.v4_enabled = os.getenv("V4_RUNTIME_ENABLED", "0") == "1"
        if self.v4_enabled:
            self.profiler = ResourceProfiler()
            self.cache = DeterministicCache(Path("reports/v4_cache"))

    def execute_lab_v4(self, notebook_path: Path, lab_metadata: Dict[str, Any]) -> LabResult:
        if not self.v4_enabled: return self.base.execute_notebook(notebook_path)
        compatible, reason = is_hardware_compatible(lab_metadata)
        if not compatible:
            result = LabResult(lab_name=notebook_path.stem, lab_path=str(notebook_path))
            result.completion_state = CompletionState.SOFT_FAIL
            result.metadata = {"v4_skip_reason": reason} # Manually ensuring metadata is dict
            return result
        self.profiler.start()
        result = self.base.execute_notebook(notebook_path)
        metrics = self.profiler.stop()
        if not hasattr(result, 'metadata'): result.metadata = {}
        result.metadata["v4_resource_usage"] = metrics
        result = update_result_with_timeout_info(result, self.base.timeout)
        return result
