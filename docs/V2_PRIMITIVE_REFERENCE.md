# V2 Visual Primitive Reference

**Version:** 2.0.0  
**V2 Only:** These primitives must not be used by V1 content

---

## Primitive Overview

| Primitive | Purpose | Use Cases |
|-----------|---------|-----------|
| **Projection** | Dimensionality reduction | PCA, t-SNE, UMAP embeddings |
| **Sequence** | Sequential flow | RNN/LSTM state propagation |
| **Attention** | Attention matrices | Transformer visualization |
| **Filters** | CNN internals | Filters and feature maps |

---

## 1. Projection Visual

**Type:** `projection`  
**Module:** `visual_runtime.projection`  
**Contract:** `contracts/visuals/projection_contract.json`

### Purpose
Visualizes high-dimensional data projected to 2D or 3D space using dimensionality reduction techniques.

### Why V2 Only
- Requires computed embeddings from trained models
- V1 topics don't execute dimensionality reduction
- Needs careful seed enforcement for reproducibility

### Supported Methods
| Method | Deterministic | Notes |
|--------|---------------|-------|
| `pca` | Yes | Explained variance available |
| `tsne` | With seed | Random initialization |
| `umap` | With seed | Future-ready |

### Inputs
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `points` | array[N, D] | Yes | Original high-dim points |
| `projected` | array[N, 2/3] | Yes | Projected coordinates |
| `labels` | array[N] | No | Point labels |
| `method` | string | Yes | Projection method |
| `explained_variance` | array | No | PCA variance ratios |

### Output
```json
{
  "points": [{"x": 0.5, "y": 0.3, "label": "A"}],
  "method": "pca",
  "dimensions": 2,
  "n_points": 100,
  "explained_variance": [0.72, 0.18]
}
```

---

## 2. Sequence Visual

**Type:** `sequence`  
**Module:** `visual_runtime.sequence`  
**Contract:** `contracts/visuals/sequence_contract.json`

### Purpose
Visualizes sequential data flow in recurrent networks, showing hidden state propagation and gradient flow.

### Why V2 Only
- Requires step-by-step RNN execution traces
- V1 topics don't expose internal RNN states
- Gradient flow analysis needs backprop access

### Supported Types
| Type | Features |
|------|----------|
| `rnn` | Hidden states |
| `lstm` | Hidden + cell states, gates |
| `gru` | Hidden states, gates |

### Inputs
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `inputs` | array | Yes | Input sequence |
| `hidden_states` | array[T, H] | Yes | Hidden states per step |
| `outputs` | array | No | Output values |
| `cell_states` | array[T, H] | No | LSTM cell states |
| `gradients` | array[T] | No | Gradient magnitudes |
| `sequence_type` | string | Yes | Model type |

### Output
```json
{
  "steps": [
    {
      "step_index": 0,
      "input_value": "hello",
      "hidden_state": [0.1, 0.2],
      "gradient_magnitude": 0.5
    }
  ],
  "sequence_type": "lstm",
  "sequence_length": 10,
  "hidden_dim": 64,
  "gradient_flow": [{"step_index": 0, "vanishing": false}]
}
```

---

## 3. Attention Visual

**Type:** `attention`  
**Module:** `visual_runtime.attention`  
**Contract:** `contracts/visuals/attention_contract.json`

### Purpose
Visualizes attention weight matrices in Transformer models, showing token-to-token relationships.

### Why V2 Only
- Requires attention weight extraction from models
- V1 topics don't train or run Transformers
- Multi-head visualization needs layer access

### Supported Types
| Type | Description |
|------|-------------|
| `self_attention` | Query = Key sequence |
| `cross_attention` | Query ≠ Key sequence |
| `multi_head` | All heads visualization |

### Inputs
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `attention_weights` | array[H, S, S] | Yes | Attention matrices |
| `source_tokens` | array | Yes | Source tokens |
| `target_tokens` | array | No | Target tokens (cross-attn) |
| `attention_type` | string | Yes | Attention type |
| `layer_index` | int | No | Layer number |
| `selected_heads` | array | No | Heads to show |

### Output
```json
{
  "attention_type": "self_attention",
  "num_heads": 8,
  "seq_length": 12,
  "source_tokens": ["The", "cat", "sat"],
  "heads": [
    {"head_index": 0, "weights": [[0.1, 0.9], [0.5, 0.5]]}
  ],
  "aggregated": [[0.1, 0.9], [0.5, 0.5]]
}
```

---

## 4. Filters Visual

**Type:** `filters`  
**Module:** `visual_runtime.filters`  
**Contract:** `contracts/visuals/filters_contract.json`

### Purpose
Visualizes CNN convolutional filters and intermediate feature map activations.

### Why V2 Only
- Requires weight extraction from trained CNNs
- V1 topics don't expose layer internals
- Forward hook instrumentation needed

### Visualization Types
| Type | Shows |
|------|-------|
| `filters` | Raw filter weights |
| `feature_maps` | Activation maps |
| `both` | Filters and activations |

### Inputs
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `filters` | array[O, I, H, W] | Cond. | Filter weights |
| `feature_maps` | array[C, H, W] | Cond. | Activations |
| `layer_name` | string | No | Layer identifier |
| `visualization_type` | string | Yes | What to show |
| `selected_channels` | array | No | Channels to include |
| `normalize` | bool | No | Normalize to [0,1] |

### Output
```json
{
  "visualization_type": "both",
  "layer_name": "conv1",
  "filters": [
    {"filter_index": 0, "weights": [[[0.1, 0.2], [0.3, 0.4]]]}
  ],
  "feature_maps": [
    {"channel_index": 0, "activation": [[0.5, 0.6]], "statistics": {"mean": 0.55}}
  ],
  "filter_shape": [64, 3, 3, 3],
  "feature_map_shape": [64, 28, 28]
}
```

---

## Usage (V2 Only)

```python
from runtime.visual_runtime import (
    ProjectionVisual,
    SequenceVisual,
    AttentionVisual,
    FiltersVisual,
    RenderingMode,
)

# Example: Projection
proj = ProjectionVisual(seed=42)
output = proj.execute(
    mode=RenderingMode.JSON,
    points=high_dim_data,
    projected=pca_result,
    method="pca",
)

print(output.to_json())
```

---

## Why V1 Topics Must Not Use These

| Reason | Explanation |
|--------|-------------|
| **V1 is locked** | No changes to V1 content allowed |
| **No model access** | V1 labs don't expose internal states |
| **Contract mismatch** | V1 lab contracts don't include visual outputs |
| **Execution independence** | Visual failures must not affect V1 labs |

---

## Future Extensions

| Primitive | Status | Notes |
|-----------|--------|-------|
| Loss Landscape | Planned | 3D loss surface visualization |
| Decision Boundary | Planned | Classification boundary evolution |
| Gradient Flow | Planned | Backprop visualization |
| Network Architecture | Planned | Model structure diagrams |
