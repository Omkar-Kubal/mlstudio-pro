# STEP A3 — Final Topic → Primitive Registry

**Date:** 2026-01-19  
**Objective:** Complete mapping of all curriculum topics to primitives  

---

## Registry Table

### Statistics Topics

| Topic | Status | Primitive | Resolution | Notes |
| :--- | :---: | :--- | :--- | :--- |
| Measures of Central Tendency | ✅ | P1 (Distribution Evolution) | Config | `meanSensitivityConfig` exists |
| Variance and Standard Deviation | ✅ | P1 (Distribution Evolution) | Config | Add `varianceConfig` |
| Distributions and Data Shapes | ✅ | P1 (Distribution Evolution) | Config | `distributionEvolutionConfig` exists |
| Normal Distribution | ✅ | P1 (Distribution Evolution) | Config | Add `normalDistConfig` |
| Sampling and CLT | ✅ | P1 (Distribution Evolution) | Config | Add `cltConfig` with sample size slider |
| Probability Basics | ❌ | — | Locked | Static Venn diagram only |
| Bayes Theorem | ❌ | — | Locked | Static probability tree only |
| Correlation | ✅ | — | Static | SVG scatter triptych (r=-1,0,+1) |
| Hypothesis Testing | ✅ | P1 (Distribution Evolution) | Composition | Add `hypothesisTestingConfig` |

---

### Supervised Learning Topics

| Topic | Status | Primitive | Resolution | Notes |
| :--- | :---: | :--- | :--- | :--- |
| Linear Regression | ✅ | P2 (Fit Progression) | Config | Add `linearRegressionConfig` |
| Polynomial Regression | ✅ | P2 (Fit Progression) | Config | `polynomialFitConfig` exists |
| Underfitting vs Overfitting | ✅ | P2 (Fit Progression) | Config | `polynomialFitConfig` covers |
| Bias-Variance Tradeoff | ✅ | P2 (Fit Progression) | Config | Same as above + test toggle |
| Train/Test Split | ✅ | P2 (Fit Progression) | Config | Test data toggle exists |
| Cross-Validation | ✅ | — | Static | SVG K-fold diagram |
| Logistic Regression | ✅ | P3 (Boundary Morphing) | Config | Add `logisticConfig` |
| Decision Boundaries | ✅ | P3 (Boundary Morphing) | Config | `boundaryMorphingConfig` exists |
| K-Nearest Neighbors | ✅ | P3 (Boundary Morphing) | Config | Same as above (K slider) |
| Support Vector Machines | ✅ | P3 (Boundary Morphing) | Config | Add `svmMarginConfig` |
| Decision Trees | ✅ | — | Static | SVG tree diagram |
| Random Forests | ✅ | — | Static | SVG ensemble diagram |
| Model Evaluation Metrics | ✅ | P4 (Metric Dashboard) | Config | `metricDashboardConfig` exists |
| Confusion Matrix | ✅ | P4 (Metric Dashboard) | Config | Same |
| ROC and AUC | ✅ | P4 (Metric Dashboard) | Config | Same |
| Precision-Recall Tradeoff | ✅ | P4 (Metric Dashboard) | Config | Same |
| Imbalanced Datasets | ✅ | P4 (Metric Dashboard) | Config | `thresholdTuningConfig` exists |
| Regularization (L1/L2) | ✅ | P2 (Fit Progression) | Composition | Add `regularizationConfig` |

---

### Unsupervised Learning Topics

| Topic | Status | Primitive | Resolution | Notes |
| :--- | :---: | :--- | :--- | :--- |
| Clustering Algorithms | ✅ | P5 (Cluster Formation) | Config | `clusterFormationConfig` exists |
| K-Means | ✅ | P5 (Cluster Formation) | Config | Same |
| DBSCAN | ✅ | P5 (Cluster Formation) | Config | Add `dbscanConfig` (epsilon slider) |
| Hierarchical Clustering | ✅ | — | Static | SVG dendrogram |
| Elbow Method | ✅ | P5 (Cluster Formation) | Config | Inertia bar covers |
| Silhouette Score | ✅ | P5 (Cluster Formation) | Composition | Add silhouette panel |
| PCA | ❌ | — | Locked (V2) | Static projection diagram |
| t-SNE | ❌ | — | Locked (V2) | Static before/after |
| Dimensionality Reduction | ❌ | — | Locked (V2) | Static concept diagram |

---

### Deep Learning Topics

| Topic | Status | Primitive | Resolution | Notes |
| :--- | :---: | :--- | :--- | :--- |
| Neural Network Basics | ✅ | P6 (Network Forward Pass) | Config | `networkForwardPassConfig` exists |
| Activation Functions | ✅ | P6 (Network Forward Pass) | Config | Same (toggle exists) |
| Forward Propagation | ✅ | P6 (Network Forward Pass) | Config | Same |
| Backpropagation | ✅ | P7 (Gradient Backflow) | Config | `gradientBackflowConfig` exists |
| Vanishing Gradients | ✅ | P7 (Gradient Backflow) | Config | Same |
| Exploding Gradients | ✅ | P7 (Gradient Backflow) | Config | Same |
| Dead ReLU | ✅ | P6 + P7 | Config | Both show dead neurons |
| Weight Initialization | ✅ | P7 (Gradient Backflow) | Config | Add weight scale toggle |
| Gradient Descent | ✅ | — | Static | SVG loss contour |
| Learning Rate | ✅ | — | Static | SVG trajectory comparison |
| Batch Normalization | ⚠️ | — | Text | Conceptual only (no primitive) |
| Dropout | ✅ | P6 (Network Forward Pass) | Config | Add `dropoutDemoConfig` |
| CNNs | ❌ | — | Locked (V2) | Static filter diagram |
| RNNs / LSTMs | ❌ | — | Locked (V2) | Static unrolled diagram |
| Transformers / Attention | ❌ | — | Locked (V2) | Static attention heatmap |

---

## Summary Statistics

| Category | Count |
| :--- | :---: |
| ✅ Fully Covered (Primitive) | 31 |
| ✅ Static Visual Only | 9 |
| ❌ Locked (No Primitive V1) | 8 |
| ⚠️ Text Only (Conceptual) | 1 |
| **Total Topics** | **49** |

---

## Configs Required (New)

| Config Name | Primitive | Topic |
| :--- | :--- | :--- |
| `varianceConfig` | P1 | Variance and SD |
| `normalDistConfig` | P1 | Normal Distribution |
| `cltConfig` | P1 | Sampling and CLT |
| `hypothesisTestingConfig` | P1 | Hypothesis Testing |
| `linearRegressionConfig` | P2 | Linear Regression |
| `regularizationConfig` | P2 | Regularization |
| `logisticConfig` | P3 | Logistic Regression |
| `svmMarginConfig` | P3 | SVM |
| `dbscanConfig` | P5 | DBSCAN |
| `dropoutDemoConfig` | P6 | Dropout |

**10 new configs to add** (primitives already exist)

---

## Static Visuals Required

| Topic | Asset Type |
| :--- | :--- |
| Correlation | SVG scatter triptych |
| Cross-Validation | SVG K-fold diagram |
| Decision Trees | SVG tree diagram |
| Random Forests | SVG ensemble diagram |
| Hierarchical Clustering | SVG dendrogram |
| Gradient Descent | SVG loss contour |
| Learning Rate | SVG trajectory comparison |
| Probability Basics | SVG Venn diagram |
| Bayes Theorem | SVG probability tree |

**9 static assets required**

---

## STEP A COMPLETE

All 49 curriculum topics categorized:
- 31 primitive-covered
- 9 static-visual-covered
- 8 locked for V2
- 1 text-only

**Ready for Step B (True Gaps Identification)**
