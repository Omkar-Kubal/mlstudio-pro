# Subject 4, Module 4: Trees and Ensembles

> Decision trees and ensemble methods are among the most powerful and interpretable machine learning techniques. Trees recursively partition feature space, while ensembles combine multiple trees to reduce variance or bias.

---

## Topic 1: Decision Trees and Bias-Variance

### Conceptual Intuition

A decision tree is a flowchart for prediction. At each node, it asks a yes/no question about a feature: "Is age > 30?" Based on the answer, it goes left or right until reaching a **leaf**, which outputs the prediction.

**How trees grow**:
1. Start with all data at the root
2. Find the feature and threshold that best separates the target (using Gini impurity for classification or MSE for regression)
3. Split the data and repeat for each branch
4. Stop when a stopping criterion is met (max depth, min samples, etc.)

**Bias-variance tradeoff**:
- **Deep trees**: Low bias (can model complex patterns) but high variance (small data changes produce very different trees, overfitting)
- **Shallow trees**: Low variance (robust to noise) but high bias (may miss complex structure, underfitting)

We control depth via max_depth, min_samples_leaf, or pruning to find the sweet spot.

### Visual Justification

**V1 Visual**: `fit-progression` (P2)

Observe how a decision tree boundary changes with depth. A depth-1 tree creates a single straight split. Deeper trees create increasingly complex, axis-aligned boundaries. Too deep and the boundary memorizes training noise.

### Formal Definition

**Gini impurity** at node t:
$$G(t) = 1 - \sum_{k=1}^{K} p_k^2$$

Where pₖ is the proportion of class k at node t.

**Information gain** (for choosing splits):
$$IG = G(\text{parent}) - \sum_{i} \frac{n_i}{n} G(\text{child}_i)$$

```python
# Optional verification
from sklearn.datasets import make_classification
from sklearn.tree import DecisionTreeClassifier, DecisionTreeRegressor
import numpy as np

# Classification
X, y = make_classification(n_samples=100, n_features=2, n_redundant=0, random_state=1)
tree_clf = DecisionTreeClassifier(max_depth=5, random_state=1)
tree_clf.fit(X, y)

# Regression
rng = np.random.RandomState(42)
X_reg = rng.uniform(-3, 3, 100).reshape(-1, 1)
y_reg = X_reg.ravel()**2 + rng.normal(0, 2, 100)
tree_reg = DecisionTreeRegressor(max_depth=4, random_state=42)
tree_reg.fit(X_reg, y_reg)

print("Classification accuracy:", tree_clf.score(X, y))
```

---

## Topic 2: Bagging and Random Forests

### Conceptual Intuition

A single tree is unstable—small changes in data can produce very different trees. **Bagging** (Bootstrap Aggregation) stabilizes predictions by training many trees on different random subsets and averaging.

**How bagging works**:
1. Create T bootstrap samples (random samples with replacement)
2. Train a full tree on each sample
3. Average predictions (regression) or take majority vote (classification)

Each tree overfits its own sample, but averaging reduces variance while maintaining low bias.

**Random Forests** extend bagging with additional randomness: at each split, only a random subset of features is considered. This **decorrelates** the trees—they make different errors, so averaging is more effective.

**Default settings that work well**:
- √d features per split (classification) or d/3 (regression)
- Many trees (100-500)
- Full-depth trees (no max_depth)

Random Forests require minimal tuning and are robust to overfitting.

### Visual Justification

**V1 Visual**: `fit-progression` (P2) composed with static ensemble overlay

Show multiple individual tree boundaries (light, translucent) overlaid on the same plot. The ensemble boundary (bold) is smoother and more stable than any individual tree.

### Formal Definition

**Bootstrap sample**: Draw n samples with replacement from n training points. On average, ~63% unique points appear.

**Out-of-bag (OOB) error**: Points not in a tree's bootstrap sample can be used for validation without a separate test set.

```python
# Optional verification
from sklearn.ensemble import BaggingClassifier, RandomForestClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.model_selection import train_test_split

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=0)

# Bagging
bag = BaggingClassifier(
    estimator=DecisionTreeClassifier(max_depth=None),
    n_estimators=50, random_state=0
)
bag.fit(X_train, y_train)
print("Bagging Accuracy:", bag.score(X_test, y_test))

# Random Forest
rf = RandomForestClassifier(n_estimators=100, max_features='sqrt', random_state=42)
rf.fit(X_train, y_train)
print("Random Forest Accuracy:", rf.score(X_test, y_test))
print("Feature importances:", rf.feature_importances_)
```

---

## Topic 3: Boosting and Gradient Boosting

### Conceptual Intuition

While bagging reduces variance by averaging independent trees, **boosting** reduces bias by training trees sequentially, each one correcting the errors of the previous ones.

**AdaBoost** (Adaptive Boosting):
- Start with equal weights on all training points
- Fit a weak learner (typically a shallow tree—a "stump")
- Increase weights on misclassified points
- Repeat, combining weak learners into a strong ensemble
- Points that are hard to classify get progressively more attention

**Gradient Boosting**:
- Fit each new tree to the **residual error** of the current ensemble
- This is gradient descent in function space—each tree reduces the loss
- Uses a **learning rate** (shrinkage) to control step size
- Smaller learning rate + more trees = usually better, but slower

Boosting can achieve very high accuracy but risks overfitting without regularization (early stopping, tree depth limits, learning rate shrinkage).

### Visual Justification

**V1 Visual**: `fit-progression` (P2) showing residual reduction

For regression: show data with predictions, then residuals, then how the next tree fits those residuals. Each iteration reduces the remaining error.

### Formal Definition

**AdaBoost weight update**:
$$w_i^{(t+1)} = w_i^{(t)} \cdot e^{\alpha_t \cdot \mathbb{1}[y_i \neq h_t(x_i)]}$$

**Gradient Boosting update**:
$$F_{m}(x) = F_{m-1}(x) + \eta \cdot h_m(x)$$

Where hₘ is fit to the negative gradient of the loss.

```python
# Optional verification
from sklearn.ensemble import AdaBoostClassifier, GradientBoostingRegressor
from sklearn.datasets import make_regression

# AdaBoost
ada = AdaBoostClassifier(
    estimator=DecisionTreeClassifier(max_depth=1),
    n_estimators=50, learning_rate=1.0, random_state=0
)
ada.fit(X_train, y_train)
print("AdaBoost Accuracy:", ada.score(X_test, y_test))

# Gradient Boosting (regression)
X_reg2, y_reg2 = make_regression(n_samples=150, n_features=1, noise=20.0, random_state=42)
gbr = GradientBoostingRegressor(n_estimators=100, learning_rate=0.1, max_depth=3, random_state=42)
gbr.fit(X_reg2, y_reg2)
print("Gradient Boosting R²:", gbr.score(X_reg2, y_reg2))
```

---

## Topic 4: XGBoost and LightGBM

### Conceptual Intuition

XGBoost and LightGBM are highly optimized gradient boosting implementations that dominate machine learning competitions and production systems.

**XGBoost** (eXtreme Gradient Boosting):
- Uses second-order Taylor approximation (gradient + Hessian) for more accurate split decisions
- Built-in L1/L2 regularization on leaf weights
- Parallel tree construction for speed
- **Level-wise** tree growth: expands all nodes at one depth before going deeper (balanced trees)

**LightGBM**:
- **Leaf-wise** tree growth: always splits the leaf with the largest loss reduction (can create very deep, asymmetric trees)
- Histogram-based binning for faster split finding
- GOSS (Gradient-based One-Side Sampling): focuses on high-gradient instances
- Native categorical feature support

**When to use which**:
- XGBoost: safe default, balanced trees, well-documented
- LightGBM: faster on large datasets, higher memory efficiency, may need more tuning to prevent overfitting

Both require careful hyperparameter tuning (learning_rate, max_depth, n_estimators, regularization).

### Visual Justification

**V1 Visual**: Static comparison diagram

Show tree growth patterns side-by-side: XGBoost grows level-by-level (breadth-first) while LightGBM grows leaf-by-leaf (one branch goes deep before others).

### Formal Definition

**XGBoost objective**:
$$\mathcal{L}^{(t)} = \sum_{i=1}^{n} \left[ g_i f_t(x_i) + \frac{1}{2} h_i f_t(x_i)^2 \right] + \Omega(f_t)$$

Where gᵢ and hᵢ are first and second derivatives of the loss.

**Regularization term**:
$$\Omega(f) = \gamma T + \frac{1}{2}\lambda \sum_{j=1}^{T} w_j^2$$

Where T is the number of leaves and wⱼ are leaf weights.

```python
# Optional verification
import xgboost as xgb
import lightgbm as lgb
from sklearn.model_selection import train_test_split
from sklearn.datasets import make_classification

X_clf, y_clf = make_classification(n_samples=200, n_features=5, n_informative=3, random_state=0)
X_tr, X_te, y_tr, y_te = train_test_split(X_clf, y_clf, test_size=0.3, random_state=0)

# XGBoost
xgb_clf = xgb.XGBClassifier(
    n_estimators=50, max_depth=4, learning_rate=0.1,
    use_label_encoder=False, eval_metric='logloss', random_state=42
)
xgb_clf.fit(X_tr, y_tr)
print("XGBoost Accuracy:", xgb_clf.score(X_te, y_te))

# LightGBM
lgb_clf = lgb.LGBMClassifier(n_estimators=50, max_depth=4, learning_rate=0.1, random_state=42)
lgb_clf.fit(X_tr, y_tr)
print("LightGBM Accuracy:", lgb_clf.score(X_te, y_te))
```

---

## Module Summary

Trees and ensembles form the backbone of practical machine learning. A single tree is interpretable but unstable. Ensembles stabilize predictions through averaging (bagging) or sequential error correction (boosting).

**Key takeaways**:
1. Decision trees partition space with axis-aligned splits—control depth to balance bias and variance
2. Bagging reduces variance by averaging many independent trees
3. Random Forests add feature randomness to decorrelate trees
4. Boosting reduces bias by sequentially fitting errors
5. XGBoost and LightGBM are production-grade boosting frameworks with different tree growth strategies
6. Gradient boosting often wins competitions but requires careful tuning
