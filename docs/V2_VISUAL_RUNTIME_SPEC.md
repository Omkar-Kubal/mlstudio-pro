# V2 Visual Runtime Specification

**Version:** 2.0.0  
**Status:** Architecture Complete  
**V2 Only:** This runtime is exclusively for V2 visual primitives

---

## Overview

The Visual Runtime provides infrastructure for V2-only visual primitives that power advanced visualization capabilities. These visuals are:

- **Optional**: The system functions fully without them
- **Additive**: They extend V1 capabilities without modifying them  
- **Deferred**: Implementation is decoupled from V1 content

## Architecture

```
runtime/
├── visual_runtime/
│   ├── __init__.py          # Module exports
│   ├── base_visual.py       # Abstract base classes
│   ├── visual_errors.py     # Error taxonomy
│   ├── registry.py          # Primitive registry
│   ├── projection.py        # PCA, t-SNE, UMAP
│   ├── sequence.py          # RNN/LSTM flow
│   ├── attention.py         # Transformer attention
│   └── filters.py           # CNN filters/feature maps
│
contracts/
└── visuals/
    ├── projection_contract.json
    ├── sequence_contract.json
    ├── attention_contract.json
    └── filters_contract.json
```

## Design Principles

### 1. Deterministic Rendering
All visual primitives produce deterministic output given the same inputs and seed. Randomized algorithms (t-SNE, UMAP) require seed enforcement.

### 2. Headless-Friendly
No UI dependencies. All primitives can execute in headless environments (CI, server-side, Jupyter without display).

### 3. Contract-Driven
Each primitive has a JSON contract defining:
- Required and optional inputs
- Output schema
- Determinism guarantees
- Failure modes

### 4. JSON-First
All data is JSON-serializable. No binary blobs, no TensorFlow/PyTorch tensors in contracts.

### 5. Visuals Are Optional
The runtime never blocks if visuals fail. Failures are logged but do not affect lab execution.

---

## Visual Primitive Lifecycle

```
┌─────────────┐    ┌──────────────┐    ┌─────────────┐    ┌──────────────┐
│   Validate  │───▶│   Compute    │───▶│   Render    │───▶│ VisualOutput │
│   Inputs    │    │   Visual     │    │   to JSON   │    │              │
└─────────────┘    └──────────────┘    └─────────────┘    └──────────────┘
       │                  │                   │
       ▼                  ▼                   ▼
  SchemaError        ComputeData         RenderMode
```

### Step 1: Validate Inputs
- Check required inputs present
- Validate types and shapes
- Raise `VisualSchemaError` on failure

### Step 2: Compute Visual Data
- Transform input data into visualization structure
- Pure computation, no rendering

### Step 3: Render to Output
- Convert computed data to output format
- Support JSON, SVG, PNG modes
- Return `VisualOutput` container

---

## Base Classes

### VisualPrimitive (Abstract)

```python
class VisualPrimitive(ABC):
    VISUAL_TYPE: str
    CONTRACT: VisualContract
    
    def validate_inputs(self, **kwargs) -> bool: ...
    def compute(self, **kwargs) -> Dict[str, Any]: ...
    def render(self, data, mode) -> VisualOutput: ...
    def execute(self, mode, **kwargs) -> VisualOutput: ...
```

### VisualOutput

```python
@dataclass
class VisualOutput:
    visual_id: str
    visual_type: str
    mode: RenderingMode
    data: Dict[str, Any]
    metadata: Dict[str, Any]
    deterministic: bool
```

### VisualContract

```python
@dataclass
class VisualContract:
    visual_type: str
    version: str
    inputs: List[VisualInput]
    output_schema: Dict[str, Any]
    deterministic: bool
    failure_modes: List[str]
    supported_modes: List[RenderingMode]
```

---

## Error Taxonomy

| Error Type | Description |
|------------|-------------|
| `CONTRACT_ERROR` | Contract missing or invalid |
| `SCHEMA_ERROR` | Input doesn't match schema |
| `VALIDATION_ERROR` | Output validation failed |
| `RENDERING_ERROR` | Rendering failed |
| `DIMENSION_ERROR` | Shape/dimension mismatch |
| `UNSUPPORTED_ERROR` | Feature not supported |

---

## Integration Points

### Runtime Integration

Visual runtime integrates with existing runtime as **optional post-execution hooks**:

```python
# In runner.py (conceptual, not executed)
def execute_notebook(self, ...):
    result = self._run_cells(...)
    
    # Visual hook (callable but never invoked in V1)
    if self._visual_hook and result.success:
        self._visual_hook(result.outputs)
    
    return result
```

### Validator Integration

Visual contracts can be validated alongside lab contracts:

```python
# In validator.py (conceptual)
def validate_visual_contract(self, visual_type: str) -> bool:
    contract = self._load_visual_contract(visual_type)
    return contract is not None
```

---

## V2 Only Constraints

| Constraint | Reason |
|------------|--------|
| No V1 content may use visuals | V1 is locked |
| No UI semantics in contracts | Headless-first |
| No TensorFlow/PyTorch deps | Runtime independence |
| No execution of notebooks | Labs are frozen |
| Visuals never block execution | Optional by design |

---

## Success Criteria

- [x] Visual runtime exists independently
- [x] Visual contracts validate correctly  
- [x] No existing runtime code broken
- [x] No lab execution triggered
- [x] V2 primitives ready but unused
