# V3 Visual Mapping

**Version:** 3.0.0  
**Status:** ACTIVE  
**Authority:** This document explains visual mapping decisions for V3.

---

## Summary

| Category | Count |
|----------|-------|
| Total labs | 84 |
| Labs with visuals | 16 |
| Labs without visuals | 68 |
| Projection visuals | 8 |
| Sequence visuals | 4 |
| Filters visuals | 4 |
| Attention visuals | 0 |

---

## Visual-Enabled Labs

### Projection Visual (8 labs)

| Lab | Rationale |
|-----|-----------|
| `linalg_eigen_directions` | Eigenvectors define principal directions; 2D projection illustrates eigendecomposition |
| `linalg_linear_transformations` | Linear transformations visualized as 2D projections showing matrix effects |
| `linalg_geometry_of_ml` | Geometric interpretation of high-dimensional ML concepts |
| `ml_kmeans_convergence` | Cluster assignments visualized in 2D with centroids |
| `ml_dbscan_density` | Density-based clusters as 2D scatter with coloring |
| `ml_choosing_k_elbow` | K selection via projected cluster separation |
| `ml_decision_boundaries` | Decision boundaries projected to 2D feature space |
| `ml_knn_vs_svm` | Classification regions compared in 2D |

### Sequence Visual (4 labs)

| Lab | Rationale |
|-----|-----------|
| `dl_vanishing_gradients` | Gradient magnitude over layers as sequence flow |
| `dl_backpropagation_numerical` | Backpropagation as sequential gradient flow |
| `dl_weight_initialization_effects` | Activation distributions across layers |
| `dl_batchnorm_dropout_effects` | Layer-wise effects of normalization |

### Filters Visual (4 labs)

| Lab | Rationale |
|-----|-----------|
| `cnn_feature_maps` | Feature map activations at each layer |
| `cnn_convolution_operation` | Convolution filter weights |
| `cnn_pooling_effects` | Pooling effects on feature maps |
| `cv_image_as_arrays` | Image channels as feature representation |

### Attention Visual (0 labs)

No Transformer-based labs exist in V2 curriculum.
Attention primitive remains unused but available for future content.

---

## Text-Only Labs (68)

These labs do not receive visual primitives.

### Categories

| Category | Example Labs | Reason |
|----------|--------------|--------|
| Python Basics | `py_control_flow_functions`, `py_data_types_structures` | Procedural concepts; no spatial representation |
| Pandas | `pd_dataframe_operations`, `pd_groupby_aggregation` | Tabular operations; text output sufficient |
| Statistics | `stats_mean_median_mode_effects`, `stats_variance_std_spread` | Numerical concepts; formulas sufficient |
| Probability | `prob_bayes_medical_test`, `prob_clt_simulation` | Mathematical derivations; no projection needed |
| NumPy | `np_array_shapes_broadcasting`, `np_vectorization_speed` | Array operations; code output sufficient |
| Data Prep | `missing_data_strategies`, `feature_encoding_scaling` | Preprocessing steps; no visual benefit |
| Evaluation | `eval_confusion_matrix_metrics`, `eval_roc_pr_curves` | Metrics are already visual in code output |

### Policy

Labs without visual mappings are complete as-is.
Text and code execution provide full comprehension.
No visual is required for understanding.

---

## Mapping Decisions

### Why Projection

Labs that produce:
- High-dimensional data that reduces to 2D
- Cluster assignments with spatial meaning
- Decision boundaries in feature space

### Why Sequence

Labs that produce:
- Layer-by-layer computations
- Gradient flow through network depth
- Temporal or ordered transformations

### Why Filters

Labs that produce:
- CNN filter weights
- Feature map activations
- Channel-wise image representations

### Why No Attention

- V2 curriculum does not include Transformer architecture labs
- No self-attention or cross-attention outputs available
- Primitive exists for future use only

---

## Constraints Enforced

| Constraint | Status |
|------------|--------|
| Read-only from lab outputs | ✅ |
| Deterministic | ✅ |
| Skippable | ✅ |
| No UI language | ✅ |
| No interactivity | ✅ |

---

## Validation

All mappings validated against:
- Lab contract existence
- Primitive contract compatibility
- Output data source availability

See `reports/visual_validation_summary.json` for details.
