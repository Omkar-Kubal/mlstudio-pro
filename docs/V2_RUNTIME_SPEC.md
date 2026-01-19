# V2 Runtime Specification

## Overview

The V2 Runtime provides deterministic, verifiable, and auditable execution infrastructure for the 84 V1.1 data science labs.

## Architecture

```
runtime/                    # Core execution infrastructure
├── __init__.py            # Package exports
├── __main__.py            # CLI entrypoint
├── errors.py              # EP-5: Error taxonomy
├── scorer.py              # EP-6: Completion states
├── seed_enforcer.py       # EP-1: Deterministic seeding
├── logger.py              # EP-7: Execution metadata
├── validator.py           # EP-2/EP-3: Contract validation
├── runner.py              # EP-4: Execution harness
└── contract_generator.py  # EP-2: Contract auto-generation

contracts/                  # Output contracts (JSON)
├── {lab_name}.json        # Per-lab expected outputs

reports/                    # Execution results
├── {lab_name}_{timestamp}.json  # Per-run metadata
└── summary.json           # Aggregate results
```

## Execution Primitives

### EP-1: Deterministic Execution

**Purpose:** Ensure identical outputs across runs.

**Implementation:** `seed_enforcer.py`

- Injects seed cell at notebook start
- Seeds: `numpy.random.seed(42)`, `random.seed(42)`, `torch.manual_seed(42)`
- Verifies seed consistency across notebook

**Usage:**
```python
from runtime import SeedEnforcer

enforcer = SeedEnforcer(seed=42)
has_seeds, issues = enforcer.check_notebook(notebook)
notebook = enforcer.inject_seed_cell(notebook)
```

### EP-2: Output Contract Definition

**Purpose:** Define expected outputs for validation.

**Implementation:** `validator.py`, `contract_generator.py`

**Contract Schema:**
```json
{
  "lab_name": "string",
  "version": "1.0",
  "scalars": [
    {"name": "accuracy", "expected": 0.95, "tolerance": 0.02}
  ],
  "shapes": [
    {"name": "weights", "expected_shape": [10, 5], "expected_dtype": "float64"}
  ],
  "invariants": [
    {"name": "loss_decreasing", "invariant_type": "monotonic_decrease"},
    {"name": "probs_valid", "invariant_type": "normalized"}
  ]
}
```

**Invariant Types:**
- `monotonic_decrease` / `monotonic_increase`
- `bounded` (with `lower`, `upper` params)
- `positive` / `non_negative`
- `normalized` (values in [0, 1])
- `sum_to_one`
- `in_range`
- `no_nan` / `no_inf`

### EP-3: Result Validation

**Purpose:** Validate outputs against contracts.

**Implementation:** `validator.py`

```python
from runtime import ContractValidator

validator = ContractValidator(contracts_dir)
contract = validator.load_contract("lab_name")
result = validator.validate_scalar(scalar_contract, actual_value)
```

### EP-4: Execution Harness

**Purpose:** Headless notebook execution.

**Implementation:** `runner.py`

```python
from runtime import NotebookRunner

runner = NotebookRunner(
    labs_dir=Path("content/labs"),
    contracts_dir=Path("contracts"),
    reports_dir=Path("reports"),
    timeout=60,
)

# Single lab
result = runner.execute_notebook(Path("lab.ipynb"))

# All labs
results, summary = runner.run_all()
```

### EP-5: Error Taxonomy

**Purpose:** Classify runtime errors.

**Implementation:** `errors.py`

**Error Types:**
| Type | Description |
|------|-------------|
| `SETUP_ERROR` | Import/dependency failure |
| `DATA_ERROR` | Data loading/generation failure |
| `NUMERICAL_ERROR` | NaN, Inf, overflow |
| `CONVERGENCE_ERROR` | Algorithm didn't converge |
| `VALIDATION_ERROR` | Contract violation |
| `TIMEOUT_ERROR` | Cell exceeded time limit |
| `ASSERTION_ERROR` | Explicit assertion failed |
| `UNKNOWN_ERROR` | Unclassified |

### EP-6: Scoring & Completion Signals

**Purpose:** Determine lab completion state.

**Implementation:** `scorer.py`

**States:**
| State | Description |
|-------|-------------|
| `PASS` | All cells executed, all validations passed |
| `SOFT_FAIL` | Executed but validation failed |
| `HARD_FAIL` | Execution crashed |
| `SKIPPED` | Lab was skipped |

### EP-7: Execution Metadata

**Purpose:** Record reproducibility information.

**Implementation:** `logger.py`

**Metadata Fields:**
- `lab_name`, `lab_path`, `run_id`
- `timestamp`, `duration_seconds`
- `python_version`, `platform`
- `library_versions` (numpy, pandas, sklearn, etc.)
- `random_seed`, `output_hash`, `notebook_hash`
- `completion_state`, `cells_executed`, `error_count`

## CLI Usage

```bash
# Run all labs
python -m runtime run --all

# Run specific lab
python -m runtime run --lab stats_mean_median_mode_effects

# Check seed enforcement
python -m runtime check-seeds
python -m runtime check-seeds --fix

# Generate contracts
python -m runtime generate-contracts --all

# View reports
python -m runtime report --summary
```

## Requirements

```
nbformat>=5.0
nbconvert>=6.0
numpy>=1.20
```

## Extensibility

The runtime is designed for extension:

1. **New Invariants:** Add validator methods to `ContractValidator._register_invariant_validators()`
2. **New Error Types:** Extend `ExecutionError` enum in `errors.py`
3. **Custom Validators:** Subclass `ContractValidator` for domain-specific checks
4. **Output Parsers:** Extend `NotebookRunner._extract_outputs()` for structured extraction
