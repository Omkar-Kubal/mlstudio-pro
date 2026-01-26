"""
V2 Visual Runtime Module

Runtime infrastructure for V2-only visual primitives.
These visuals are optional, additive, and deferred.

V2 ONLY - Not for use with V1 content.
"""

from .base_visual import (
    VisualPrimitive,
    VisualOutput,
    VisualContract,
    RenderingMode,
)
from .registry import VisualRegistry, get_registry
from .visual_errors import (
    VisualError,
    VisualRenderingError,
    VisualValidationError,
    VisualContractError,
)

__all__ = [
    # Base classes
    "VisualPrimitive",
    "VisualOutput",
    "VisualContract",
    "RenderingMode",
    # Registry
    "VisualRegistry",
    "get_registry",
    # Errors
    "VisualError",
    "VisualRenderingError",
    "VisualValidationError",
    "VisualContractError",
]

__version__ = "2.0.0"
