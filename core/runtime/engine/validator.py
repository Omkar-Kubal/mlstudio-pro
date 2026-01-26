"""
EP-2 & EP-3: Output Contract Definition & Validation

Defines expected outputs and validates actual results against contracts.
"""

import json
import numpy as np
from pathlib import Path
from typing import Dict, Any, List, Optional, Union, Callable
from dataclasses import dataclass, field

from .scorer import ValidationResult


@dataclass
class ScalarContract:
    """Contract for a scalar output value."""
    name: str
    expected: float
    tolerance: float = 0.01  # Relative tolerance
    absolute_tolerance: float = 1e-6  # Absolute tolerance


@dataclass
class ShapeContract:
    """Contract for array/tensor shape."""
    name: str
    expected_shape: tuple
    expected_dtype: Optional[str] = None


@dataclass
class InvariantContract:
    """Contract for output invariants."""
    name: str
    invariant_type: str  # "monotonic_decrease", "bounded", "positive", "normalized", etc.
    params: Dict[str, Any] = field(default_factory=dict)


@dataclass
class LabContract:
    """Complete output contract for a lab."""
    lab_name: str
    version: str = "1.0"
    scalars: List[ScalarContract] = field(default_factory=list)
    shapes: List[ShapeContract] = field(default_factory=list)
    invariants: List[InvariantContract] = field(default_factory=list)
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "lab_name": self.lab_name,
            "version": self.version,
            "scalars": [
                {"name": s.name, "expected": s.expected, 
                 "tolerance": s.tolerance, "absolute_tolerance": s.absolute_tolerance}
                for s in self.scalars
            ],
            "shapes": [
                {"name": s.name, "expected_shape": list(s.expected_shape), 
                 "expected_dtype": s.expected_dtype}
                for s in self.shapes
            ],
            "invariants": [
                {"name": i.name, "invariant_type": i.invariant_type, "params": i.params}
                for i in self.invariants
            ],
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "LabContract":
        """Load contract from dictionary."""
        return cls(
            lab_name=data["lab_name"],
            version=data.get("version", "1.0"),
            scalars=[
                ScalarContract(
                    name=s["name"],
                    expected=s["expected"],
                    tolerance=s.get("tolerance", 0.01),
                    absolute_tolerance=s.get("absolute_tolerance", 1e-6)
                )
                for s in data.get("scalars", [])
            ],
            shapes=[
                ShapeContract(
                    name=s["name"],
                    expected_shape=tuple(s["expected_shape"]),
                    expected_dtype=s.get("expected_dtype")
                )
                for s in data.get("shapes", [])
            ],
            invariants=[
                InvariantContract(
                    name=i["name"],
                    invariant_type=i["invariant_type"],
                    params=i.get("params", {})
                )
                for i in data.get("invariants", [])
            ],
        )


class ContractValidator:
    """Validates lab outputs against contracts."""
    
    def __init__(self, contracts_dir: Path):
        self.contracts_dir = Path(contracts_dir)
        self.contracts_dir.mkdir(parents=True, exist_ok=True)
        self._invariant_validators = self._register_invariant_validators()
    
    def _register_invariant_validators(self) -> Dict[str, Callable]:
        """Register built-in invariant validators."""
        return {
            "monotonic_decrease": self._validate_monotonic_decrease,
            "monotonic_increase": self._validate_monotonic_increase,
            "bounded": self._validate_bounded,
            "positive": self._validate_positive,
            "non_negative": self._validate_non_negative,
            "normalized": self._validate_normalized,
            "sum_to_one": self._validate_sum_to_one,
            "in_range": self._validate_in_range,
            "no_nan": self._validate_no_nan,
            "no_inf": self._validate_no_inf,
        }
    
    def load_contract(self, lab_name: str) -> Optional[LabContract]:
        """Load contract for a lab."""
        contract_path = self.contracts_dir / f"{lab_name}.json"
        if not contract_path.exists():
            return None
        
        with open(contract_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        return LabContract.from_dict(data)
    
    def save_contract(self, contract: LabContract) -> Path:
        """Save contract to file."""
        contract_path = self.contracts_dir / f"{contract.lab_name}.json"
        
        with open(contract_path, 'w', encoding='utf-8') as f:
            json.dump(contract.to_dict(), f, indent=2)
        
        return contract_path
    
    def validate_scalar(
        self, 
        contract: ScalarContract, 
        actual: float
    ) -> ValidationResult:
        """Validate a scalar value against contract."""
        if np.isnan(actual) or np.isinf(actual):
            return ValidationResult(
                check_name=f"scalar:{contract.name}",
                passed=False,
                expected=contract.expected,
                actual=actual,
                message=f"Invalid value: {actual}"
            )
        
        # Check with relative and absolute tolerance
        passed = np.isclose(
            actual, 
            contract.expected, 
            rtol=contract.tolerance,
            atol=contract.absolute_tolerance
        )
        
        return ValidationResult(
            check_name=f"scalar:{contract.name}",
            passed=bool(passed),
            expected=contract.expected,
            actual=actual,
            tolerance=contract.tolerance,
            message=None if passed else f"Value {actual} not within {contract.tolerance*100}% of {contract.expected}"
        )
    
    def validate_shape(
        self, 
        contract: ShapeContract, 
        actual_shape: tuple,
        actual_dtype: Optional[str] = None
    ) -> ValidationResult:
        """Validate array shape against contract."""
        shape_match = actual_shape == contract.expected_shape
        dtype_match = contract.expected_dtype is None or actual_dtype == contract.expected_dtype
        
        passed = shape_match and dtype_match
        
        message = None
        if not shape_match:
            message = f"Shape mismatch: expected {contract.expected_shape}, got {actual_shape}"
        elif not dtype_match:
            message = f"Dtype mismatch: expected {contract.expected_dtype}, got {actual_dtype}"
        
        return ValidationResult(
            check_name=f"shape:{contract.name}",
            passed=passed,
            expected={"shape": contract.expected_shape, "dtype": contract.expected_dtype},
            actual={"shape": actual_shape, "dtype": actual_dtype},
            message=message
        )
    
    def validate_invariant(
        self,
        contract: InvariantContract,
        actual: Any
    ) -> ValidationResult:
        """Validate an invariant against actual data."""
        validator = self._invariant_validators.get(contract.invariant_type)
        if validator is None:
            return ValidationResult(
                check_name=f"invariant:{contract.name}",
                passed=False,
                expected=contract.invariant_type,
                actual="unknown",
                message=f"Unknown invariant type: {contract.invariant_type}"
            )
        
        return validator(contract, actual)
    
    # Invariant validators
    def _validate_monotonic_decrease(self, contract: InvariantContract, data: Any) -> ValidationResult:
        arr = np.asarray(data)
        diffs = np.diff(arr)
        passed = np.all(diffs <= 0)
        return ValidationResult(
            check_name=f"invariant:{contract.name}",
            passed=bool(passed),
            expected="monotonically decreasing",
            actual=f"has {np.sum(diffs > 0)} increases",
            message=None if passed else "Sequence is not monotonically decreasing"
        )
    
    def _validate_monotonic_increase(self, contract: InvariantContract, data: Any) -> ValidationResult:
        arr = np.asarray(data)
        diffs = np.diff(arr)
        passed = np.all(diffs >= 0)
        return ValidationResult(
            check_name=f"invariant:{contract.name}",
            passed=bool(passed),
            expected="monotonically increasing",
            actual=f"has {np.sum(diffs < 0)} decreases",
            message=None if passed else "Sequence is not monotonically increasing"
        )
    
    def _validate_bounded(self, contract: InvariantContract, data: Any) -> ValidationResult:
        arr = np.asarray(data)
        lower = contract.params.get("lower", float("-inf"))
        upper = contract.params.get("upper", float("inf"))
        passed = np.all((arr >= lower) & (arr <= upper))
        return ValidationResult(
            check_name=f"invariant:{contract.name}",
            passed=bool(passed),
            expected=f"[{lower}, {upper}]",
            actual=f"[{arr.min()}, {arr.max()}]",
            message=None if passed else f"Values outside bounds [{lower}, {upper}]"
        )
    
    def _validate_positive(self, contract: InvariantContract, data: Any) -> ValidationResult:
        arr = np.asarray(data)
        passed = np.all(arr > 0)
        return ValidationResult(
            check_name=f"invariant:{contract.name}",
            passed=bool(passed),
            expected="all positive",
            actual=f"min={arr.min()}",
            message=None if passed else "Contains non-positive values"
        )
    
    def _validate_non_negative(self, contract: InvariantContract, data: Any) -> ValidationResult:
        arr = np.asarray(data)
        passed = np.all(arr >= 0)
        return ValidationResult(
            check_name=f"invariant:{contract.name}",
            passed=bool(passed),
            expected="all non-negative",
            actual=f"min={arr.min()}",
            message=None if passed else "Contains negative values"
        )
    
    def _validate_normalized(self, contract: InvariantContract, data: Any) -> ValidationResult:
        arr = np.asarray(data)
        passed = np.all((arr >= 0) & (arr <= 1))
        return ValidationResult(
            check_name=f"invariant:{contract.name}",
            passed=bool(passed),
            expected="[0, 1]",
            actual=f"[{arr.min()}, {arr.max()}]",
            message=None if passed else "Values outside [0, 1]"
        )
    
    def _validate_sum_to_one(self, contract: InvariantContract, data: Any) -> ValidationResult:
        arr = np.asarray(data)
        total = np.sum(arr)
        passed = np.isclose(total, 1.0, atol=1e-6)
        return ValidationResult(
            check_name=f"invariant:{contract.name}",
            passed=bool(passed),
            expected="sum = 1.0",
            actual=f"sum = {total}",
            message=None if passed else f"Sum is {total}, not 1.0"
        )
    
    def _validate_in_range(self, contract: InvariantContract, data: Any) -> ValidationResult:
        value = float(data)
        lower = contract.params.get("lower", float("-inf"))
        upper = contract.params.get("upper", float("inf"))
        passed = lower <= value <= upper
        return ValidationResult(
            check_name=f"invariant:{contract.name}",
            passed=passed,
            expected=f"[{lower}, {upper}]",
            actual=value,
            message=None if passed else f"Value {value} outside [{lower}, {upper}]"
        )
    
    def _validate_no_nan(self, contract: InvariantContract, data: Any) -> ValidationResult:
        arr = np.asarray(data)
        nan_count = np.sum(np.isnan(arr))
        passed = nan_count == 0
        return ValidationResult(
            check_name=f"invariant:{contract.name}",
            passed=bool(passed),
            expected="no NaN values",
            actual=f"{nan_count} NaN values",
            message=None if passed else f"Contains {nan_count} NaN values"
        )
    
    def _validate_no_inf(self, contract: InvariantContract, data: Any) -> ValidationResult:
        arr = np.asarray(data)
        inf_count = np.sum(np.isinf(arr))
        passed = inf_count == 0
        return ValidationResult(
            check_name=f"invariant:{contract.name}",
            passed=bool(passed),
            expected="no Inf values",
            actual=f"{inf_count} Inf values",
            message=None if passed else f"Contains {inf_count} Inf values"
        )
