# Visual Coverage Audit

**Date:** 2026-01-19  
**Scope:** MLStudio Pro Curriculum → 7 Visual Primitives  

---

## Primitive Reference

| # | Primitive | Primary Control | Key Visual |
| :--- | :--- | :--- | :--- |
| P1 | Distribution Evolution | Sample size / distribution type | Histogram morphing, overlays |
| P2 | Fit Progression | Model complexity (degree) | Curve fitting, train/test curves |
| P3 | Boundary Morphing | Flexibility (K in KNN) | Decision regions, boundary contour |
| P4 | Metric Dashboard | Decision threshold | Confusion matrix, ROC/PR curves |
| P5 | Cluster Formation | K (cluster count) | Centroids, Voronoi, inertia |
| P6 | Network Forward Pass | Input value | Node activations, edge weights |
| P7 | Gradient Backflow | Output error | Backward wave, gradient bars |

---

## Coverage Matrix

### Statistics Topics

| Topic | P1 | P2 | P3 | P4 | P5 | P6 | P7 | Coverage |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| Measures of Central Tendency | ✅ | | | | | | | ✅ Fully |
| Variance and Standard Deviation | ✅ | | | | | | | ✅ Fully |
| Distributions and Data Shapes | ✅ | | | | | | | ✅ Fully |
| Normal Distribution | ✅ | | | | | | | ✅ Fully |
| Sampling and Central Limit Theorem | ✅ | | | | | | | ✅ Fully |
| Probability Basics | | | | | | | | ❌ No visual (text only) |
| Bayes Theorem | | | | | | | | ⚠️ Composition possible |
| Correlation | ⚠️ | | | | | | | ⚠️ Scatter plot needed |
| Hypothesis Testing | ✅ | | | | | | | ⚠️ Distribution overlap |

---

### Supervised Learning Topics

| Topic | P1 | P2 | P3 | P4 | P5 | P6 | P7 | Coverage |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| Linear Regression | | ✅ | | | | | | ✅ Fully |
| Polynomial Regression | | ✅ | | | | | | ✅ Fully |
| Underfitting vs Overfitting | | ✅ | | | | | | ✅ Fully |
| Bias-Variance Tradeoff | | ✅ | | | | | | ✅ Fully |
| Train/Test Split | | ✅ | | | | | | ✅ Fully |
| Cross-Validation | | ⚠️ | | | | | | ⚠️ Composition |
| Logistic Regression | | | ✅ | ✅ | | | | ✅ Fully |
| Decision Boundaries | | | ✅ | | | | | ✅ Fully |
| K-Nearest Neighbors | | | ✅ | | | | | ✅ Fully |
| Support Vector Machines | | | ✅ | | | | | ⚠️ Margin visual needed |
| Decision Trees | | | ⚠️ | | | | | ⚠️ Tree visual needed |
| Random Forests | | | ⚠️ | | | | | ⚠️ Ensemble concept |
| Model Evaluation Metrics | | | | ✅ | | | | ✅ Fully |
| Confusion Matrix | | | | ✅ | | | | ✅ Fully |
| ROC and AUC | | | | ✅ | | | | ✅ Fully |
| Precision-Recall Tradeoff | | | | ✅ | | | | ✅ Fully |
| Imbalanced Datasets | | | | ✅ | | | | ✅ Fully |
| Regularization (L1/L2) | | ✅ | | | | | | ⚠️ Weight penalty vis |

---

### Unsupervised Learning Topics

| Topic | P1 | P2 | P3 | P4 | P5 | P6 | P7 | Coverage |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| Clustering Algorithms | | | | | ✅ | | | ✅ Fully |
| K-Means | | | | | ✅ | | | ✅ Fully |
| DBSCAN | | | | | ⚠️ | | | ⚠️ Config change only |
| Hierarchical Clustering | | | | | ⚠️ | | | ⚠️ Dendrogram needed |
| Elbow Method | | | | | ✅ | | | ✅ Fully (inertia bar) |
| Silhouette Score | | | | | ⚠️ | | | ⚠️ Composition |
| PCA | | | | | | | | ❌ True gap |
| t-SNE | | | | | | | | ❌ True gap |
| Dimensionality Reduction | | | | | | | | ❌ True gap |

---

### Deep Learning Topics

| Topic | P1 | P2 | P3 | P4 | P5 | P6 | P7 | Coverage |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| Neural Network Basics | | | | | | ✅ | | ✅ Fully |
| Activation Functions | | | | | | ✅ | | ✅ Fully |
| Forward Propagation | | | | | | ✅ | | ✅ Fully |
| Backpropagation | | | | | | | ✅ | ✅ Fully |
| Vanishing Gradients | | | | | | | ✅ | ✅ Fully |
| Exploding Gradients | | | | | | | ✅ | ✅ Fully |
| Dead ReLU | | | | | | ✅ | ✅ | ✅ Fully |
| Weight Initialization | | | | | | | ✅ | ⚠️ Weight scale slider |
| Gradient Descent | | | | | | | ⚠️ | ⚠️ Loss landscape needed |
| Learning Rate | | | | | | | ⚠️ | ⚠️ Composition |
| Batch Normalization | | | | | | | | ⚠️ Conceptual only |
| Dropout | | | | | | ⚠️ | | ⚠️ Node masking |
| CNNs | | | | | | | | ❌ True gap |
| RNNs / LSTMs | | | | | | | | ❌ True gap |
| Transformers / Attention | | | | | | | | ❌ True gap |

---

## Gap Summary

### ✅ Fully Covered (24 topics)
- Measures of Central Tendency
- Variance and Standard Deviation
- Distributions and Data Shapes
- Normal Distribution
- Sampling and CLT
- Linear/Polynomial Regression
- Underfitting vs Overfitting
- Bias-Variance Tradeoff
- Train/Test Split
- Logistic Regression
- Decision Boundaries
- K-Nearest Neighbors
- Model Evaluation Metrics
- Confusion Matrix
- ROC and AUC
- Precision-Recall Tradeoff
- Imbalanced Datasets
- K-Means Clustering
- Elbow Method
- Neural Network Basics
- Activation Functions
- Forward Propagation
- Backpropagation
- Vanishing/Exploding Gradients

### ⚠️ Partially Covered (15 topics)
*Explainable via composition or text support*
- Bayes Theorem (distribution overlap)
- Correlation (needs scatter plot)
- Hypothesis Testing (distribution comparison)
- Cross-Validation (multiple fit progressions)
- Support Vector Machines (margin visualization)
- Decision Trees (tree structure visual)
- Random Forests (ensemble concept)
- Regularization (weight penalty)
- DBSCAN (epsilon-based clustering)
- Hierarchical Clustering (dendrogram)
- Silhouette Score (per-cluster bars)
- Weight Initialization (weight scale)
- Gradient Descent (loss landscape)
- Learning Rate (step size)
- Dropout (node masking)

### ❌ True Gaps (7 topics)
*Require new primitives*
- Probability Basics (no visual needed — text only)
- PCA / Dimensionality Reduction (projection visual)
- t-SNE (manifold visual)
- CNNs (filter/feature map visual)
- RNNs / LSTMs (sequence flow visual)
- Transformers / Attention (attention matrix visual)

---

## Recommendations

1. **No new primitives needed for core Stats/ML curriculum** — 24 topics fully covered
2. **Composition patterns** can address 15 partially covered topics
3. **Future primitives** (if curriculum expands):
   - Dimensionality Reduction Primitive (PCA/t-SNE)
   - Attention Flow Primitive (Transformers)
   - Sequence Flow Primitive (RNNs)
   - Filter Visualization Primitive (CNNs)

---

## Current Topic → Primitive Mapping (visual-configs.ts)

| Topic Title | Primitive |
| :--- | :--- |
| Measures of Central Tendency | parameter-sensitivity |
| Imbalanced Datasets and Threshold Tuning | parameter-sensitivity |
| Underfitting vs Overfitting | fit-progression |
| Distributions and Data Shapes | distribution-evolution |
| Decision Boundaries | boundary-morphing |
| Model Evaluation Metrics | metric-dashboard |
| Clustering Algorithms | cluster-formation |
| Neural Network Basics | network-forward-pass |
| Backpropagation and Gradients | gradient-backflow |

**9 topics currently mapped**; 24 fully covered (15 need registry entries).
