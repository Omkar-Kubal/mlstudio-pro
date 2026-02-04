# STEP A1 — Partial Coverage Resolution

**Date:** 2026-01-19  
**Objective:** Convert every "⚠️ Partially Covered" topic to ✅ or ❌  

---

## Resolution Table

| # | Topic | Primitive(s) | Resolution Type | Config/Extension Required | Final Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| 1 | **Correlation** | Distribution Evolution | **Static Visual** | SVG scatter plot with correlation coefficient overlay (r = -1, 0, +1 examples). No interactivity needed. | ✅ |
| 2 | **Hypothesis Testing** | Distribution Evolution | **Composition** | Two overlapping distributions with slider for sample size. Add vertical line for critical value. Config: `hypothesisTestingConfig` reusing P1. | ✅ |
| 3 | **Cross-Validation** | Fit Progression | **Static Visual** | Triptych SVG showing K-fold splits (train/test partitions). Text explains, visual shows fold structure. Not interactive. | ✅ |
| 4 | **SVM (Margin)** | Boundary Morphing | **Config Only** | Add `svmMarginConfig` with 2-class linear data focusing on margin region. Show decision boundary + margin lines (parallel lines at ±1). | ✅ |
| 5 | **Decision Trees** | — | **Static Visual** | Tree diagram SVG showing split nodes. Interactive tree not needed for concept (complexity too high). | ✅ |
| 6 | **Random Forests** | — | **Static Visual** | Diagram: multiple trees → voting. Composition of static tree SVGs. Text carries concept. | ✅ |
| 7 | **Regularization (L1/L2)** | Fit Progression | **Composition** | Show high-degree curve shrinking toward simpler curve as "regularization strength" slider increases. Reuse P2 with modified legend. | ✅ |
| 8 | **DBSCAN** | Cluster Formation | **Config Only** | Add `dbscanConfig` with epsilon slider instead of K slider. Points marked as core/border/noise. Voronoi off, connectivity web on. | ✅ |
| 9 | **Hierarchical Clustering** | — | **Static Visual** | Dendrogram SVG with horizontal cut line. Interactive dendrogram is V2 scope. Static sufficient for concept. | ✅ |
| 10 | **Silhouette Score** | Cluster Formation | **Composition** | Add silhouette bar per cluster as secondary panel. Reuse P5 + horizontal bar chart. | ✅ |
| 11 | **Weight Initialization** | Gradient Backflow | **Config Only** | Add weight scale toggle (0.5×, 1×, 2×) in `gradientBackflowConfig`. Shows gradient health vary with init. | ✅ |
| 12 | **Gradient Descent** | — | **Static Visual** | 3D loss surface SVG with gradient arrow. Interactive loss landscape is V2 (too complex). Static sufficient. | ✅ |
| 13 | **Learning Rate** | — | **Static Visual** | Comparison diagram: small LR (slow), medium LR (optimal), large LR (diverge). Three trajectory SVGs. | ✅ |
| 14 | **Dropout** | Network Forward Pass | **Config Only** | Add `dropoutDemoConfig` with random node masking (grayed out nodes). Toggle for dropout on/off. | ✅ |

---

## Resolution Details

### 1. Correlation
- **Type:** Static Visual
- **Rationale:** Correlation is a single metric best explained via static scatter plots showing different r values. No slider needed.
- **Deliverable:** SVG with 3 panels (r = -1, r = 0, r = +1) embedded in topic content.

### 2. Hypothesis Testing
- **Type:** Composition (Distribution Evolution)
- **Rationale:** Two distributions (H₀ and H₁) with overlap region. Sample size slider shows p-value change.
- **Config:** `hypothesisTestingConfig` with dual distributions and critical value marker.

### 3. Cross-Validation
- **Type:** Static Visual
- **Rationale:** K-fold structure is a data partitioning concept, not a dynamic algorithm. Diagram sufficient.
- **Deliverable:** SVG showing 5-fold split (train=4, test=1 per fold).

### 4. SVM (Margin)
- **Type:** Config Only
- **Rationale:** Boundary Morphing already shows decision boundaries. Add config with support vectors highlighted and margin lines.
- **Config:** `svmMarginConfig` extending boundary-morphing primitive.

### 5. Decision Trees
- **Type:** Static Visual
- **Rationale:** Interactive tree building is complex (gini, splits, depth). Static tree diagram carries intuition.
- **Deliverable:** SVG of 3-level decision tree with split conditions.

### 6. Random Forests
- **Type:** Static Visual
- **Rationale:** Ensemble concept is "many trees vote." Not interactive.
- **Deliverable:** Diagram with multiple trees feeding into voting box.

### 7. Regularization (L1/L2)
- **Type:** Composition
- **Rationale:** Fit Progression with "regularization strength" replacing "complexity" shows curve smoothing.
- **Config:** Extend fit-progression with `regularizationConfig`.

### 8. DBSCAN
- **Type:** Config Only
- **Rationale:** Same Cluster Formation primitive with epsilon slider instead of K. Points colored as core(solid)/border(ring)/noise(×).
- **Config:** `dbscanConfig` with epsilon range and noise markers.

### 9. Hierarchical Clustering
- **Type:** Static Visual
- **Rationale:** Dendrogram requires specialized tree layout. V2 candidate. Static dendrogram sufficient for concept.
- **Deliverable:** SVG dendrogram with horizontal cut line.

### 10. Silhouette Score
- **Type:** Composition
- **Rationale:** Cluster Formation + bar chart showing per-cluster silhouette values.
- **Config:** Extend cluster-formation with silhouette panel.

### 11. Weight Initialization
- **Type:** Config Only
- **Rationale:** Gradient Backflow already shows gradient health. Add weight scale option.
- **Config:** Add `weightScale` toggle (0.5×, 1×, 2×) to `gradientBackflowConfig`.

### 12. Gradient Descent
- **Type:** Static Visual
- **Rationale:** Loss landscape with gradient steps. Interactive 3D is V2. Static 2D contour sufficient.
- **Deliverable:** SVG contour plot with gradient arrows.

### 13. Learning Rate
- **Type:** Static Visual
- **Rationale:** LR effects best shown as trajectory comparison. Not interactive.
- **Deliverable:** 3-panel SVG (too slow, optimal, diverging).

### 14. Dropout
- **Type:** Config Only
- **Rationale:** Network Forward Pass with random node masking.
- **Config:** `dropoutDemoConfig` with masked nodes (grayed, no fill).

---

## Summary

| Resolution Type | Count | Topics |
| :--- | :---: | :--- |
| **Config Only** | 5 | SVM, DBSCAN, Weight Init, Dropout, (Hypo Test via P1 config) |
| **Composition** | 3 | Hypothesis Testing, Regularization, Silhouette Score |
| **Static Visual** | 6 | Correlation, Cross-Val, Decision Trees, Random Forests, Hierarchical, Gradient Descent, Learning Rate |

**All 14 partially covered topics resolved to ✅**

---

## Next: Step A2
