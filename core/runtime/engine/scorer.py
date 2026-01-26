"""
EP-6: Scoring & Completion Signals

Defines completion states and structured lab execution results.
"""

from enum import Enum
from dataclasses import dataclass, field
from typing import List, Dict, Any, Optional
from datetime import datetime

from .errors import ExecutionException


class CompletionState(Enum):
    """Lab execution completion states."""
    
    PASS = "pass"
    """All cells executed successfully, all validations passed."""
    
    SOFT_FAIL = "soft_fail"
    """Execution completed but validation or assertions failed."""
    
    HARD_FAIL = "hard_fail"
    """Execution crashed before completion."""
    
    SKIPPED = "skipped"
    """Lab was skipped (dependency missing, etc.)."""


@dataclass
class ValidationResult:
    """Result of a single validation check."""
    
    check_name: str
    passed: bool
    expected: Any
    actual: Any
    tolerance: Optional[float] = None
    message: Optional[str] = None
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "check_name": self.check_name,
            "passed": self.passed,
            "expected": str(self.expected),
            "actual": str(self.actual),
            "tolerance": self.tolerance,
            "message": self.message,
        }


@dataclass
class LabResult:
    """Complete result of a lab execution."""
    
    lab_name: str
    lab_path: str
    completion_state: CompletionState
    
    # Timing
    start_time: datetime = field(default_factory=datetime.now)
    end_time: Optional[datetime] = None
    duration_seconds: float = 0.0
    
    # Execution details
    cells_total: int = 0
    cells_executed: int = 0
    
    # Errors
    errors: List[ExecutionException] = field(default_factory=list)
    
    # Validation
    validations: List[ValidationResult] = field(default_factory=list)
    validations_passed: int = 0
    validations_failed: int = 0
    
    # Metadata
    output_hash: Optional[str] = None
    random_seed: int = 42
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    def finalize(self):
        """Compute final metrics after execution."""
        self.end_time = datetime.now()
        self.duration_seconds = (self.end_time - self.start_time).total_seconds()
        self.validations_passed = sum(1 for v in self.validations if v.passed)
        self.validations_failed = sum(1 for v in self.validations if not v.passed)
    
    def to_dict(self) -> Dict[str, Any]:
        """Serialize to dictionary for JSON output."""
        return {
            "lab_name": self.lab_name,
            "lab_path": self.lab_path,
            "completion_state": self.completion_state.value,
            "start_time": self.start_time.isoformat(),
            "end_time": self.end_time.isoformat() if self.end_time else None,
            "duration_seconds": round(self.duration_seconds, 3),
            "cells_total": self.cells_total,
            "cells_executed": self.cells_executed,
            "errors": [e.to_dict() for e in self.errors],
            "validations": [v.to_dict() for v in self.validations],
            "validations_passed": self.validations_passed,
            "validations_failed": self.validations_failed,
            "output_hash": self.output_hash,
            "random_seed": self.random_seed,
            "metadata": self.metadata,
        }


def determine_completion_state(
    cells_total: int,
    cells_executed: int,
    errors: List[ExecutionException],
    validations: List[ValidationResult]
) -> CompletionState:
    """
    Determine the completion state based on execution results.
    
    Args:
        cells_total: Total number of code cells
        cells_executed: Number of cells successfully executed
        errors: List of execution errors
        validations: List of validation results
        
    Returns:
        Appropriate CompletionState
    """
    # Hard fail if execution didn't complete
    if cells_executed < cells_total:
        return CompletionState.HARD_FAIL
    
    # Hard fail if any non-validation errors
    non_validation_errors = [
        e for e in errors 
        if e.error_type.value not in ("validation_error", "assertion_error")
    ]
    if non_validation_errors:
        return CompletionState.HARD_FAIL
    
    # Soft fail if validations failed
    failed_validations = [v for v in validations if not v.passed]
    if failed_validations:
        return CompletionState.SOFT_FAIL
    
    # Pass
    return CompletionState.PASS
