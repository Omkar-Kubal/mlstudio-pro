"""
V2 Base Visual Primitive

Abstract base class and contracts for all visual primitives.
V2 ONLY - Not for use with V1 content.

Design Principles:
- Deterministic rendering
- Headless-friendly (no UI dependencies)
- Contract-driven outputs
- JSON-first data representation
- Visuals are optional (system works without them)
"""

from abc import ABC, abstractmethod
from enum import Enum
from typing import Dict, Any, List, Optional, TypeVar, Generic
from dataclasses import dataclass, field
import json
from pathlib import Path

from .visual_errors import (
    VisualValidationError,
    VisualSchemaError,
    VisualContractError,
)


class RenderingMode(Enum):
    """Supported rendering output modes."""
    
    JSON = "json"
    """Pure JSON data structure for frontend rendering."""
    
    SVG = "svg"
    """SVG string output."""
    
    PNG_BASE64 = "png_base64"
    """Base64-encoded PNG image."""
    
    CANVAS_COMMANDS = "canvas_commands"
    """Canvas drawing commands (declarative)."""


@dataclass
class VisualOutput:
    """
    Output container for rendered visuals.
    
    All visual primitives produce this standardized output.
    """
    
    visual_id: str
    """Unique identifier for this visual instance."""
    
    visual_type: str
    """Type of visual primitive (e.g., 'projection', 'attention')."""
    
    mode: RenderingMode
    """Rendering mode used."""
    
    data: Dict[str, Any]
    """Rendered visual data (format depends on mode)."""
    
    metadata: Dict[str, Any] = field(default_factory=dict)
    """Additional metadata (timing, dimensions, etc.)."""
    
    deterministic: bool = True
    """Whether this output is deterministically reproducible."""
    
    def to_dict(self) -> Dict[str, Any]:
        """Serialize to dictionary for JSON output."""
        return {
            "visual_id": self.visual_id,
            "visual_type": self.visual_type,
            "mode": self.mode.value,
            "data": self.data,
            "metadata": self.metadata,
            "deterministic": self.deterministic,
        }
    
    def to_json(self) -> str:
        """Serialize to JSON string."""
        return json.dumps(self.to_dict(), indent=2)


@dataclass
class VisualInput:
    """
    Input specification for visual primitives.
    
    Defines required and optional inputs with validation.
    """
    
    name: str
    """Input parameter name."""
    
    dtype: str
    """Expected data type (e.g., 'array', 'float', 'string')."""
    
    required: bool = True
    """Whether this input is required."""
    
    shape: Optional[List[Optional[int]]] = None
    """Expected shape for array inputs (None for any dimension)."""
    
    constraints: Dict[str, Any] = field(default_factory=dict)
    """Additional constraints (min, max, choices, etc.)."""
    
    description: str = ""
    """Human-readable description."""


@dataclass
class VisualContract:
    """
    Contract definition for a visual primitive.
    
    Specifies inputs, outputs, and validation rules.
    """
    
    visual_type: str
    """Type identifier for this visual."""
    
    version: str = "1.0"
    """Contract version."""
    
    inputs: List[VisualInput] = field(default_factory=list)
    """Required and optional inputs."""
    
    output_schema: Dict[str, Any] = field(default_factory=dict)
    """JSON Schema for output data."""
    
    deterministic: bool = True
    """Whether rendering is deterministic."""
    
    failure_modes: List[str] = field(default_factory=list)
    """Known failure modes/conditions."""
    
    supported_modes: List[RenderingMode] = field(
        default_factory=lambda: [RenderingMode.JSON]
    )
    """Supported rendering modes."""
    
    def to_dict(self) -> Dict[str, Any]:
        """Serialize to dictionary."""
        return {
            "visual_type": self.visual_type,
            "version": self.version,
            "inputs": [
                {
                    "name": inp.name,
                    "dtype": inp.dtype,
                    "required": inp.required,
                    "shape": inp.shape,
                    "constraints": inp.constraints,
                    "description": inp.description,
                }
                for inp in self.inputs
            ],
            "output_schema": self.output_schema,
            "deterministic": self.deterministic,
            "failure_modes": self.failure_modes,
            "supported_modes": [m.value for m in self.supported_modes],
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "VisualContract":
        """Load contract from dictionary."""
        inputs = [
            VisualInput(
                name=inp["name"],
                dtype=inp["dtype"],
                required=inp.get("required", True),
                shape=inp.get("shape"),
                constraints=inp.get("constraints", {}),
                description=inp.get("description", ""),
            )
            for inp in data.get("inputs", [])
        ]
        
        supported_modes = [
            RenderingMode(m) for m in data.get("supported_modes", ["json"])
        ]
        
        return cls(
            visual_type=data["visual_type"],
            version=data.get("version", "1.0"),
            inputs=inputs,
            output_schema=data.get("output_schema", {}),
            deterministic=data.get("deterministic", True),
            failure_modes=data.get("failure_modes", []),
            supported_modes=supported_modes,
        )
    
    @classmethod
    def from_json(cls, path: Path) -> "VisualContract":
        """Load contract from JSON file."""
        try:
            with open(path, "r") as f:
                data = json.load(f)
            return cls.from_dict(data)
        except (json.JSONDecodeError, KeyError) as e:
            raise VisualContractError(
                f"Failed to load visual contract: {e}",
                contract_path=str(path),
            )


class VisualPrimitive(ABC):
    """
    Abstract base class for all visual primitives.
    
    All V2 visual primitives must inherit from this class
    and implement the required abstract methods.
    
    Design Requirements:
    - Deterministic: Same inputs produce same outputs
    - Headless: No UI dependencies
    - Contract-driven: Validates against schema
    - JSON-first: All data is serializable
    """
    
    # Must be set by subclasses
    VISUAL_TYPE: str = "base"
    CONTRACT: Optional[VisualContract] = None
    
    def __init__(self, seed: int = 42):
        """
        Initialize visual primitive.
        
        Args:
            seed: Random seed for reproducibility (if applicable)
        """
        self.seed = seed
        self._validated = False
    
    @abstractmethod
    def validate_inputs(self, **kwargs) -> bool:
        """
        Validate input data against contract.
        
        Args:
            **kwargs: Input data
            
        Returns:
            True if valid
            
        Raises:
            VisualSchemaError: If validation fails
        """
        pass
    
    @abstractmethod
    def compute(self, **kwargs) -> Dict[str, Any]:
        """
        Compute visual data from inputs.
        
        This is the core computation logic, separate from rendering.
        
        Args:
            **kwargs: Validated input data
            
        Returns:
            Computed visual data structure
        """
        pass
    
    @abstractmethod
    def render(
        self,
        data: Dict[str, Any],
        mode: RenderingMode = RenderingMode.JSON,
    ) -> VisualOutput:
        """
        Render computed data to output format.
        
        Args:
            data: Computed visual data from compute()
            mode: Output rendering mode
            
        Returns:
            VisualOutput with rendered data
        """
        pass
    
    def execute(
        self,
        mode: RenderingMode = RenderingMode.JSON,
        **kwargs,
    ) -> VisualOutput:
        """
        Full execution pipeline: validate -> compute -> render.
        
        Args:
            mode: Output rendering mode
            **kwargs: Input data
            
        Returns:
            VisualOutput with rendered visual
        """
        # Validate inputs
        self.validate_inputs(**kwargs)
        
        # Compute visual data
        computed = self.compute(**kwargs)
        
        # Render to output
        return self.render(computed, mode=mode)
    
    def get_contract(self) -> Optional[VisualContract]:
        """Get the contract for this visual primitive."""
        return self.CONTRACT
    
    @classmethod
    def get_visual_type(cls) -> str:
        """Get the visual type identifier."""
        return cls.VISUAL_TYPE
