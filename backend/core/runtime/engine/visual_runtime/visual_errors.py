"""
V2 Visual Errors

Standardized error classification for visual rendering failures.
V2 ONLY - Not for use with V1 content.
"""

from enum import Enum
from typing import Optional, Dict, Any
from dataclasses import dataclass


class VisualErrorType(Enum):
    """Categorization of visual rendering errors."""
    
    CONTRACT_ERROR = "contract_error"
    """Visual contract is missing or invalid."""
    
    SCHEMA_ERROR = "schema_error"
    """Input data does not match expected schema."""
    
    VALIDATION_ERROR = "validation_error"
    """Output validation failed."""
    
    RENDERING_ERROR = "rendering_error"
    """Visual rendering failed."""
    
    DATA_ERROR = "data_error"
    """Input data is malformed or incompatible."""
    
    DIMENSION_ERROR = "dimension_error"
    """Dimensional mismatch in projection or transformation."""
    
    UNSUPPORTED_ERROR = "unsupported_error"
    """Requested visual type is not supported."""


class VisualError(Exception):
    """Base exception for visual runtime errors."""
    
    def __init__(
        self,
        message: str,
        error_type: VisualErrorType = VisualErrorType.RENDERING_ERROR,
        visual_id: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None,
    ):
        super().__init__(message)
        self.message = message
        self.error_type = error_type
        self.visual_id = visual_id
        self.metadata = metadata or {}
    
    def to_dict(self) -> Dict[str, Any]:
        """Serialize to dictionary for JSON output."""
        return {
            "error_type": self.error_type.value,
            "message": self.message,
            "visual_id": self.visual_id,
            "metadata": self.metadata,
        }


class VisualRenderingError(VisualError):
    """Error during visual rendering."""
    
    def __init__(
        self,
        message: str,
        visual_id: Optional[str] = None,
        stage: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None,
    ):
        meta = metadata or {}
        if stage:
            meta["stage"] = stage
        super().__init__(
            message=message,
            error_type=VisualErrorType.RENDERING_ERROR,
            visual_id=visual_id,
            metadata=meta,
        )


class VisualValidationError(VisualError):
    """Error during visual output validation."""
    
    def __init__(
        self,
        message: str,
        visual_id: Optional[str] = None,
        expected: Optional[Any] = None,
        actual: Optional[Any] = None,
        metadata: Optional[Dict[str, Any]] = None,
    ):
        meta = metadata or {}
        if expected is not None:
            meta["expected"] = str(expected)
        if actual is not None:
            meta["actual"] = str(actual)
        super().__init__(
            message=message,
            error_type=VisualErrorType.VALIDATION_ERROR,
            visual_id=visual_id,
            metadata=meta,
        )


class VisualContractError(VisualError):
    """Error related to visual contracts."""
    
    def __init__(
        self,
        message: str,
        contract_path: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None,
    ):
        meta = metadata or {}
        if contract_path:
            meta["contract_path"] = contract_path
        super().__init__(
            message=message,
            error_type=VisualErrorType.CONTRACT_ERROR,
            visual_id=None,
            metadata=meta,
        )


class VisualSchemaError(VisualError):
    """Error when input data doesn't match expected schema."""
    
    def __init__(
        self,
        message: str,
        visual_id: Optional[str] = None,
        field: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None,
    ):
        meta = metadata or {}
        if field:
            meta["field"] = field
        super().__init__(
            message=message,
            error_type=VisualErrorType.SCHEMA_ERROR,
            visual_id=visual_id,
            metadata=meta,
        )


class VisualDimensionError(VisualError):
    """Error for dimensional mismatches."""
    
    def __init__(
        self,
        message: str,
        visual_id: Optional[str] = None,
        expected_dims: Optional[int] = None,
        actual_dims: Optional[int] = None,
        metadata: Optional[Dict[str, Any]] = None,
    ):
        meta = metadata or {}
        if expected_dims is not None:
            meta["expected_dims"] = expected_dims
        if actual_dims is not None:
            meta["actual_dims"] = actual_dims
        super().__init__(
            message=message,
            error_type=VisualErrorType.DIMENSION_ERROR,
            visual_id=visual_id,
            metadata=meta,
        )
