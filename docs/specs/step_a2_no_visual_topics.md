# STEP A2 — No-Visual-By-Design Topics

**Date:** 2026-01-19  
**Objective:** Lock list of topics intentionally excluded from visual primitives in V1  

---

## Locked List

| # | Topic | Reason | Static Diagram Allowed | Final Status |
| :--- | :--- | :--- | :---: | :---: |
| 1 | **Probability Basics** | Definitional — concepts like sample space, events, and axioms are text-based definitions. No visual dynamic exists. | ✅ Basic Venn diagram | ❌ No primitive |
| 2 | **Bayes Theorem** | Cognitive — formula-centric. Visual is the formula itself. Tree diagrams allowed but not interactive. | ✅ Probability tree | ❌ No primitive |
| 3 | **PCA** | Scope — requires eigenvalue decomposition visualization, projection onto principal components. V2 candidate. | ✅ Static projection diagram | ❌ V2 |
| 4 | **t-SNE** | Scope — requires manifold embedding visualization with perplexity control. Complex algorithm. V2 candidate. | ✅ Before/after scatter | ❌ V2 |
| 5 | **Dimensionality Reduction (General)** | Scope — umbrella topic. PCA/t-SNE primitives would cover this. | ✅ Concept diagram | ❌ V2 |
| 6 | **CNNs** | Scope — requires filter/feature map visualization with layer-by-layer convolution. V2 candidate. | ✅ Filter diagram | ❌ V2 |
| 7 | **RNNs / LSTMs** | Scope — requires sequence flow with hidden state feedback. V2 candidate. | ✅ Unrolled diagram | ❌ V2 |
| 8 | **Transformers / Attention** | Scope — requires attention matrix visualization with query/key/value flow. V2 candidate. | ✅ Attention heatmap | ❌ V2 |

---

## Reason Categories

### Definitional (No inherent dynamic)
- **Probability Basics** — Axioms and definitions have no slider-driven behavior. Static diagrams suffice.

### Cognitive (Formula-centric)
- **Bayes Theorem** — The insight is the formula P(A|B) = P(B|A)P(A)/P(B). A probability tree illustrates but doesn't require interactivity.

### Scope (V2 Candidates)
- **PCA, t-SNE, Dim. Reduction** — Require projection/embedding visualization
- **CNNs** — Require filter visualization primitive
- **RNNs/LSTMs** — Require sequence flow primitive
- **Transformers** — Require attention matrix primitive

---

## V2 Primitive Candidates (Declared, Not Designed)

| Future Primitive | Topics Covered | Estimated Complexity |
| :--- | :--- | :--- |
| Projection / Embedding | PCA, t-SNE, Dim. Reduction | High |
| Filter Visualization | CNNs, Feature Maps | Medium |
| Sequence Flow | RNNs, LSTMs, GRU | High |
| Attention Matrix | Transformers, Self-Attention | High |

---

## Static Diagram Allowance

All 8 topics are permitted to include static SVG/PNG diagrams for conceptual support:
- Venn diagrams (Probability)
- Probability trees (Bayes)
- Projection arrows (PCA)
- Before/after scatter (t-SNE)
- Filter grids (CNN)
- Unrolled sequences (RNN)
- Attention heatmaps (Transformers)

These are **not primitives** — they are embedded static assets.

---

## Summary

| Category | Count |
| :--- | :---: |
| Definitional | 1 |
| Cognitive | 1 |
| Scope (V2) | 6 |
| **Total Locked** | **8** |

**All 8 topics locked as ❌ No Primitive for V1**

---

## Next: Step A3
