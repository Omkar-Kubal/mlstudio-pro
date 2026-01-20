"""
V2 Visual Registry

Central registry for visual primitives.
V2 ONLY - Not for use with V1 content.
"""

from typing import Dict, Type, Optional, List
from pathlib import Path
import json

from .base_visual import VisualPrimitive, VisualContract
from .visual_errors import VisualContractError


class VisualRegistry:
    """
    Registry for visual primitives and their contracts.
    
    Provides:
    - Primitive registration
    - Contract loading and validation
    - Primitive lookup by type
    """
    
    _instance: Optional["VisualRegistry"] = None
    
    def __init__(self, contracts_dir: Optional[Path] = None):
        """
        Initialize registry.
        
        Args:
            contracts_dir: Directory containing visual contracts
        """
        self._primitives: Dict[str, Type[VisualPrimitive]] = {}
        self._contracts: Dict[str, VisualContract] = {}
        self.contracts_dir = contracts_dir
        
        if contracts_dir:
            self._load_contracts(contracts_dir)
    
    def register(
        self,
        primitive_class: Type[VisualPrimitive],
        override: bool = False,
    ) -> None:
        """
        Register a visual primitive.
        
        Args:
            primitive_class: Visual primitive class to register
            override: Allow overriding existing registration
            
        Raises:
            ValueError: If already registered and override=False
        """
        visual_type = primitive_class.get_visual_type()
        
        if visual_type in self._primitives and not override:
            raise ValueError(
                f"Visual primitive '{visual_type}' already registered. "
                "Use override=True to replace."
            )
        
        self._primitives[visual_type] = primitive_class
    
    def get_primitive(
        self,
        visual_type: str,
    ) -> Optional[Type[VisualPrimitive]]:
        """
        Get a registered primitive class by type.
        
        Args:
            visual_type: Visual type identifier
            
        Returns:
            Primitive class or None if not found
        """
        return self._primitives.get(visual_type)
    
    def get_contract(
        self,
        visual_type: str,
    ) -> Optional[VisualContract]:
        """
        Get contract for a visual type.
        
        Args:
            visual_type: Visual type identifier
            
        Returns:
            Contract or None if not found
        """
        return self._contracts.get(visual_type)
    
    def list_primitives(self) -> List[str]:
        """List all registered primitive types."""
        return list(self._primitives.keys())
    
    def list_contracts(self) -> List[str]:
        """List all loaded contract types."""
        return list(self._contracts.keys())
    
    def _load_contracts(self, contracts_dir: Path) -> None:
        """Load all contracts from directory."""
        contracts_dir = Path(contracts_dir)
        
        if not contracts_dir.exists():
            return
        
        for path in contracts_dir.glob("*_contract.json"):
            try:
                contract = VisualContract.from_json(path)
                self._contracts[contract.visual_type] = contract
            except VisualContractError:
                # Skip invalid contracts
                pass
    
    def load_contract(self, path: Path) -> VisualContract:
        """
        Load a specific contract file.
        
        Args:
            path: Path to contract JSON file
            
        Returns:
            Loaded contract
        """
        contract = VisualContract.from_json(path)
        self._contracts[contract.visual_type] = contract
        return contract
    
    def validate_contract(
        self,
        visual_type: str,
    ) -> bool:
        """
        Validate that a primitive has a matching contract.
        
        Args:
            visual_type: Visual type to validate
            
        Returns:
            True if contract exists and matches primitive
        """
        return (
            visual_type in self._primitives
            and visual_type in self._contracts
        )
    
    def create_primitive(
        self,
        visual_type: str,
        seed: int = 42,
    ) -> Optional[VisualPrimitive]:
        """
        Create an instance of a registered primitive.
        
        Args:
            visual_type: Visual type identifier
            seed: Random seed for reproducibility
            
        Returns:
            Primitive instance or None if not found
        """
        primitive_class = self.get_primitive(visual_type)
        if primitive_class:
            return primitive_class(seed=seed)
        return None


# Global registry instance
_global_registry: Optional[VisualRegistry] = None


def get_registry(contracts_dir: Optional[Path] = None) -> VisualRegistry:
    """
    Get the global visual registry.
    
    Args:
        contracts_dir: Directory for contracts (only used on first call)
        
    Returns:
        Global registry instance
    """
    global _global_registry
    
    if _global_registry is None:
        _global_registry = VisualRegistry(contracts_dir)
    
    return _global_registry


def register_primitive(
    primitive_class: Type[VisualPrimitive],
    override: bool = False,
) -> Type[VisualPrimitive]:
    """
    Decorator to register a visual primitive.
    
    Usage:
        @register_primitive
        class MyPrimitive(VisualPrimitive):
            VISUAL_TYPE = "my_primitive"
            ...
    """
    get_registry().register(primitive_class, override=override)
    return primitive_class
