# EP-1 to EP-7 Implementation Guide

## Summary

| EP | Name | Module | Status |
|----|------|--------|--------|
| EP-1 | Deterministic Execution | `seed_enforcer.py` | ✅ Complete |
| EP-2 | Output Contract Definition | `validator.py`, `contract_generator.py` | ✅ Complete |
| EP-3 | Result Validation | `validator.py` | ✅ Complete |
| EP-4 | Execution Harness | `runner.py` | ✅ Complete |
| EP-5 | Error Taxonomy | `errors.py` | ✅ Complete |
| EP-6 | Scoring & Completion Signals | `scorer.py` | ✅ Complete |
| EP-7 | Execution Metadata & Logging | `logger.py` | ✅ Complete |

---

## EP-1: Deterministic Execution

### Purpose
Ensure identical outputs across runs by enforcing fixed random seeds.

### Implementation Details

**File:** `runtime/seed_enforcer.py`

**Key Components:**
- `SEED_CELL_SOURCE`: Template code injected into notebooks
- `SeedEnforcer.check_notebook()`: Verifies seed presence
- `SeedEnforcer.inject_seed_cell()`: Adds seed cell if missing
- `SeedEnforcer.extract_seed_from_notebook()`: Gets current seed value

**Seed Cell Template:**
```python
import numpy as np
import random
np.random.seed(42)
random.seed(42)
try:
    import torch
    torch.manual_seed(42)
except ImportError:
    pass
```

---

## EP-2: Output Contract Definition

### Purpose
Define machine-verifiable expected outputs for each lab.

### Implementation Details

**Files:** 
- `runtime/validator.py` (contract classes)
- `runtime/contract_generator.py` (auto-generation)

**Contract Types:**

1. **ScalarContract**: Expected numerical values
   - `name`: Identifier
   - `expected`: Expected value
   - `tolerance`: Relative tolerance (default 1%)
   - `absolute_tolerance`: Absolute tolerance (default 1e-6)

2. **ShapeContract**: Expected array dimensions
   - `name`: Identifier
   - `expected_shape`: Tuple of dimensions
   - `expected_dtype`: Optional dtype string

3. **InvariantContract**: Output properties
   - `name`: Identifier
   - `invariant_type`: Type of invariant
   - `params`: Type-specific parameters

**Auto-Generation:**
Contracts are auto-generated based on:
- Lab category (prefix-based classification)
- Code pattern analysis (accuracy, loss, probabilities)
- Domain knowledge defaults

---

## EP-3: Result Validation

### Purpose
Validate actual outputs against contracts with tolerance checks.

### Implementation Details

**File:** `runtime/validator.py`

**Validation Methods:**
- `validate_scalar()`: Uses `np.isclose()` with rtol and atol
- `validate_shape()`: Exact tuple comparison
- `validate_invariant()`: Dispatches to invariant-specific validators

**Invariant Validators:**
| Type | Description |
|------|-------------|
| `monotonic_decrease` | All diffs ≤ 0 |
| `monotonic_increase` | All diffs ≥ 0 |
| `bounded` | All values in [lower, upper] |
| `positive` | All values > 0 |
| `non_negative` | All values ≥ 0 |
| `normalized` | All values in [0, 1] |
| `sum_to_one` | Sum equals 1.0 (within tolerance) |
| `in_range` | Single value in [lower, upper] |
| `no_nan` | No NaN values |
| `no_inf` | No Inf values |

---

## EP-4: Execution Harness

### Purpose
Execute notebooks headlessly and capture all outputs.

### Implementation Details

**File:** `runtime/runner.py`

**Core Class:** `NotebookRunner`

**Execution Flow:**
1. Load notebook with `nbformat`
2. Inject seed cell if `enforce_seeds=True`
3. Execute with `ExecutePreprocessor`
4. Capture outputs and errors from each cell
5. Extract outputs for validation
6. Compute output hash for reproducibility
7. Determine completion state
8. Save execution metadata

**Key Parameters:**
- `timeout`: Seconds per cell (default 60)
- `kernel_name`: Python kernel (default "python3")
- `enforce_seeds`: Auto-inject seeds (default True)

---

## EP-5: Error Taxonomy

### Purpose
Classify runtime errors into actionable categories.

### Implementation Details

**File:** `runtime/errors.py`

**Error Classification Logic:**
```python
def classify_error(exception, cell_source):
    # Import errors → SETUP_ERROR
    # File errors → DATA_ERROR
    # FloatingPoint/Overflow → NUMERICAL_ERROR
    # Convergence keywords → CONVERGENCE_ERROR
    # Timeout → TIMEOUT_ERROR
    # Assertion → ASSERTION_ERROR
    # Default → UNKNOWN_ERROR
```

**ExecutionException Dataclass:**
- `error_type`: Classified ExecutionError
- `message`: Error message
- `cell_index`: Which cell failed
- `cell_source`: Source code (truncated to 200 chars)
- `traceback`: Full traceback
- `metadata`: Additional context

---

## EP-6: Scoring & Completion Signals

### Purpose
Determine final lab status from execution results.

### Implementation Details

**File:** `runtime/scorer.py`

**Completion State Logic:**
```python
def determine_completion_state(cells_total, cells_executed, errors, validations):
    if cells_executed < cells_total:
        return HARD_FAIL
    if non_validation_errors:
        return HARD_FAIL
    if failed_validations:
        return SOFT_FAIL
    return PASS
```

**LabResult Dataclass:**
- Timing: `start_time`, `end_time`, `duration_seconds`
- Execution: `cells_total`, `cells_executed`
- Errors: `List[ExecutionException]`
- Validation: `List[ValidationResult]`
- Reproducibility: `output_hash`, `random_seed`

---

## EP-7: Execution Metadata

### Purpose
Record all information needed for reproducibility.

### Implementation Details

**File:** `runtime/logger.py`

**ExecutionMetadata Fields:**
- **Identification:** `lab_name`, `lab_path`, `run_id`
- **Timing:** `timestamp`, `duration_seconds`
- **Environment:** `python_version`, `platform`
- **Libraries:** `library_versions` (tracked: numpy, pandas, sklearn, etc.)
- **Reproducibility:** `random_seed`, `output_hash`, `notebook_hash`
- **Results:** `completion_state`, `cells_executed`, `error_count`

**Tracked Libraries:**
- numpy, pandas, matplotlib, seaborn
- scikit-learn, scipy
- torch, tensorflow, keras

---

## Verification

### Running All Labs
```bash
python -m runtime run --all
```

### Expected Output
```
Running 84 notebooks...
[1/84] stats_data_summary_basics... PASS (2.3s)
[2/84] stats_descriptive_vs_inferential... PASS (1.8s)
...

==================================================
Total: 84
Pass: 82
Soft Fail: 2
Hard Fail: 0
Duration: 245.3s
```

### Success Criteria
- ✅ All 84 labs can be executed headlessly
- ✅ Outputs are validated automatically
- ✅ Failures are classified and reported
- ✅ No visuals or lesson content touched
- ✅ System is extensible to future labs
