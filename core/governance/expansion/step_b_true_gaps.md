# STEP B — True Gaps & V2 Primitive Design

**Date:** 2026-01-19  
**Objective:** Identify topics that cannot be solved via existing primitives and design V2 candidates  

---

## B1 — True Gap Identification

### Criteria for True Gap
A topic is a TRUE GAP if:
1. Cannot be covered by any of the 7 existing primitives
2. Cannot be addressed via composition of existing primitives
3. Cannot be adequately explained with a static diagram
4. Requires interactive visualization for core intuition

### Evaluation

| Topic | Existing Primitive? | Composition? | Static Sufficient? | TRUE GAP? |
| :--- | :---: | :---: | :---: | :---: |
| PCA | ❌ | ❌ | ⚠️ Limited | ✅ YES |
| t-SNE | ❌ | ❌ | ⚠️ Limited | ✅ YES |
| CNNs | ❌ | ❌ | ⚠️ Limited | ✅ YES |
| RNNs / LSTMs | ❌ | ❌ | ⚠️ Limited | ✅ YES |
| Transformers / Attention | ❌ | ❌ | ⚠️ Limited | ✅ YES |
| Batch Normalization | ❌ | ❌ | ✅ Sufficient | ❌ NO |

### True Gaps (5 total)

1. **Dimensionality Reduction** (PCA, t-SNE)
2. **Convolutional Networks** (CNNs, Feature Maps)
3. **Recurrent Networks** (RNNs, LSTMs)
4. **Attention Mechanisms** (Transformers)

*Batch Normalization is conceptual and covered adequately by text + formula.*

---

## B2 — V2 Primitive Designs (Design-Only)

### V2-P1: Projection Primitive (Dimensionality Reduction)

**Core Intuition:**
Dimensionality reduction is not "throwing away data" — it is *finding the axes that matter* and projecting data onto them.

**Misconception Fixed:**
*"PCA loses information randomly."*
(Shows that PCA finds maximum variance directions; t-SNE preserves local structure.)

**Primary Control:**
- Slider: Number of components (1 → original dim)
- Toggle: PCA vs t-SNE

**Output Visual:**
- 3D → 2D projection with animated axis rotation
- Variance explained bar for each component
- Point scatter with color preservation

**Guardrails:**
- Max 1000 points
- Max 10 dimensions
- Reduced motion: instant projection

**Reuse Scenarios:**
- PCA
- t-SNE
- UMAP (future)
- Feature selection

**Why Not Composable:**
Requires specialized linear algebra visualization (eigenvector projection) not present in existing primitives.

---

### V2-P2: Filter Visualization Primitive (CNNs)

**Core Intuition:**
A CNN doesn't "see" images — it *detects patterns* at increasing levels of abstraction. Early layers find edges; later layers find objects.

**Misconception Fixed:**
*"CNNs are black boxes."*
(Shows filter kernels, feature maps, and activation patterns.)

**Primary Control:**
- Slider: Layer depth (1 → N layers)
- Toggle: Show filter vs activation map

**Output Visual:**
- Input image with overlaid filter highlight
- Grid of feature maps per layer
- Animated convolution sweep

**Guardrails:**
- Max 5 layers visualized
- Max 32 filters per layer
- Reduced motion: static feature maps

**Reuse Scenarios:**
- CNNs
- Image classification
- Object detection (conceptual)

**Why Not Composable:**
Requires 2D convolution animation and feature map grid layout not available in forward pass primitive.

---

### V2-P3: Sequence Flow Primitive (RNNs/LSTMs)

**Core Intuition:**
Recurrent networks have *memory* — they process sequences by feeding outputs back as inputs. Hidden state is the "running summary."

**Misconception Fixed:**
*"RNNs treat each input independently."*
(Shows hidden state carrying information across time steps.)

**Primary Control:**
- Slider: Time step (1 → T)
- Toggle: Show cell (RNN vs LSTM vs GRU)

**Output Visual:**
- Unrolled network across time
- Hidden state evolution (color bar)
- Gate activations (LSTM: forget, input, output)

**Guardrails:**
- Max 20 time steps
- Max 4 layers
- Reduced motion: step-by-step only

**Reuse Scenarios:**
- RNNs
- LSTMs
- GRU
- Sequence-to-sequence

**Why Not Composable:**
Requires temporal unrolling and gate visualization not present in feedforward primitive.

---

### V2-P4: Attention Matrix Primitive (Transformers)

**Core Intuition:**
Attention is *dynamic weighting* — each token looks at all other tokens and decides which ones matter for its output.

**Misconception Fixed:**
*"Transformers process tokens independently."*
(Shows attention weights connecting tokens to each other.)

**Primary Control:**
- Slider: Layer / Head selection
- Toggle: Query token selector

**Output Visual:**
- Token sequence (row)
- Attention weight matrix (heatmap)
- Lines connecting query to high-attention keys

**Guardrails:**
- Max 50 tokens
- Max 12 heads
- Reduced motion: static heatmap

**Reuse Scenarios:**
- Self-attention
- Cross-attention
- BERT/GPT visualization

**Why Not Composable:**
Requires N×N attention matrix and query-key-value flow not present in any existing primitive.

---

## Summary

| V2 Primitive | Topics Covered | Complexity | Priority |
| :--- | :--- | :---: | :---: |
| Projection | PCA, t-SNE, UMAP | High | Medium |
| Filter Visualization | CNNs, Feature Maps | Medium | High |
| Sequence Flow | RNN, LSTM, GRU | High | Medium |
| Attention Matrix | Transformers, BERT, GPT | High | High |

---

## STEP B COMPLETE

- 5 true gaps identified
- 4 V2 primitives designed (design-only)
- All designs follow existing primitive spec format
- Batch Normalization confirmed as text-only

**Ready for Step C (Authoring Guidelines)**
