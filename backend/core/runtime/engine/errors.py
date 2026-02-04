"""
EP-5: Error Taxonomy

Standardized error classification for lab execution failures.
"""

from enum import Enum
from typing import Optional, Dict, Any
from dataclasses import dataclass


class ExecutionError(Enum):
    """Categorization of runtime errors."""
    
    SETUP_ERROR = "setup_error"
    """Import failures, missing dependencies, environment issues."""
    
    DATA_ERROR = "data_error"
    """Data loading, generation, or format failures."""
    
    NUMERICAL_ERROR = "numerical_error"
    """NaN, Inf, overflow, underflow, precision issues."""
    
    CONVERGENCE_ERROR = "convergence_error"
    """Algorithm failed to converge within limits."""
    
    VALIDATION_ERROR = "validation_error"
    """Output contract violation."""
    
    TIMEOUT_ERROR = "timeout_error"
    """Cell or notebook exceeded time limit."""
    
    ASSERTION_ERROR = "assertion_error"
    """Explicit assertion failed in lab code."""
    
    UNKNOWN_ERROR = "unknown_error"
    """Unclassified error."""


@dataclass
class ExecutionException:
    """Structured execution error with context."""
    
    error_type: ExecutionError
    message: str
    cell_index: Optional[int] = None
    cell_source: Optional[str] = None
    traceback: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
    
    def to_dict(self) -> Dict[str, Any]:
        """Serialize to dictionary for JSON output."""
        return {
            "error_type": self.error_type.value,
            "message": self.message,
            "cell_index": self.cell_index,
            "cell_source": self.cell_source[:200] if self.cell_source else None,
            "traceback": self.traceback,
            "metadata": self.metadata,
        }


def classify_error(exception: Exception, cell_source: str = "") -> ExecutionError:
    """
    Classify a Python exception into an ExecutionError category.
    
    Args:
        exception: The caught exception
        cell_source: Source code of the cell that raised the error
        
    Returns:
        Appropriate ExecutionError category
    """
    error_str = str(exception).lower()
    exception_type = type(exception).__name__
    
    # Import/module errors
    if exception_type in ("ImportError", "ModuleNotFoundError"):
        return ExecutionError.SETUP_ERROR
    
    # File/data errors
    if exception_type in ("FileNotFoundError", "IOError", "OSError"):
        return ExecutionError.DATA_ERROR
    
    if "could not find" in error_str or "file not found" in error_str:
        return ExecutionError.DATA_ERROR
    
    # Numerical errors
    if exception_type in ("FloatingPointError", "OverflowError", "ZeroDivisionError"):
        return ExecutionError.NUMERICAL_ERROR
    
    if any(term in error_str for term in ("nan", "inf", "overflow", "underflow")):
        return ExecutionError.NUMERICAL_ERROR
    
    # Convergence errors
    if any(term in error_str for term in ("converge", "iteration", "max_iter")):
        return ExecutionError.CONVERGENCE_ERROR
    
    # Timeout
    if "timeout" in error_str or exception_type == "TimeoutError":
        return ExecutionError.TIMEOUT_ERROR
    
    # Assertion
    if exception_type == "AssertionError":
        return ExecutionError.ASSERTION_ERROR
    
    # Validation keywords
    if any(term in error_str for term in ("expected", "mismatch", "contract")):
        return ExecutionError.VALIDATION_ERROR
    
    return ExecutionError.UNKNOWN_ERROR
