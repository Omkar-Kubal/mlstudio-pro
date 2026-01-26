# Subject 4, Module 1: Regression

---

# Linear Regression

## Visual Classification
**V1 Primitive:** `fit-progression` (P2)

---

## Conceptual Intuition

Linear regression is the simplest and most fundamental supervised learning algorithm. It learns a straight line (or hyperplane) that best predicts a continuous target from input features.

The prediction is a weighted sum: $\hat{y} = w_0 + w_1 x_1 + w_2 x_2 + \ldots + w_n x_n$

The weights are learned by minimizing the sum of squared errors between predictions and actual values.

---

## Why This Concept Exists

Linear regression is the foundation:
- Many advanced algorithms build on it (ridge, lasso, neural networks)
- It's interpretable (weights tell you feature importance)
- It's fast (closed-form solution exists)
- It's a baseline against which complex models are compared

---

[VISUAL INTUITION: FIT_PROGRESSION]

## How to Read the Visual

At degree 1, the fit-progression primitive shows a straight line through the data. Observe:
- The line balances positive and negative residuals
- Points far from the line contribute more to error
- The line represents the best linear approximation

---

## Formal Definitions

**Least Squares Solution:**
$$\mathbf{w} = (X^T X)^{-1} X^T \mathbf{y}$$

**Mean Squared Error:**
$$\text{MSE} = \frac{1}{n} \sum_{i=1}^{n} (y_i - \hat{y}_i)^2$$

**R-squared:**
$$R^2 = 1 - \frac{\text{SS}_{res}}{\text{SS}_{tot}}$$

---

## Practical Interpretation

Linear regression assumes:
- Linearity (relationship is straight)
- Independence (errors are uncorrelated)
- Homoscedasticity (constant error variance)
- Normality (errors are normally distributed)

Violations lead to unreliable estimates. Check residual plots.

---

# Polynomial Regression

## Visual Classification
**V1 Primitive:** `fit-progression` (P2)

---

## Conceptual Intuition

Reality is often curved. Polynomial regression extends linear regression by adding higher-degree terms: $y = w_0 + w_1 x + w_2 x^2 + w_3 x^3 + \ldots$

This is still "linear" in the *parameters*—we're just adding engineered features.

---

## Why This Concept Exists

Polynomial features capture curvature without changing the algorithm. The tradeoff:
- Higher degree → more flexibility → better training fit
- Too high → overfitting → poor generalization

---

[VISUAL INTUITION: FIT_PROGRESSION]

## How to Read the Visual

Observe how the curve changes as polynomial degree increases:
- Degree 1: straight line (may underfit curved data)
- Degree 2-4: captures curvature smoothly
- Degree 10+: wiggles through every point (overfitting)

The visual demonstrates bias-variance tradeoff directly.

---

# Regularization (Ridge & Lasso)

## Visual Classification
**V1 Primitive:** `fit-progression` (P2) — with regularization effect

---

## Conceptual Intuition

Complex models (many features, high-degree polynomials) can overfit. Regularization adds a penalty to discourage large coefficients.

**Ridge (L2):** Adds penalty proportional to square of weights. Shrinks weights toward zero but never exactly to zero.

**Lasso (L1):** Adds penalty proportional to absolute value of weights. Can set weights exactly to zero, performing automatic feature selection.

---

## Why This Concept Exists

Regularization controls model complexity:
- Prevents overfitting
- Handles multicollinearity (ridge)
- Performs feature selection (lasso)

The regularization strength $\lambda$ trades off between fitting data and keeping weights small.

---

## Formal Definitions

**Ridge Loss:**
$$L = \text{MSE} + \lambda \sum_{i} w_i^2$$

**Lasso Loss:**
$$L = \text{MSE} + \lambda \sum_{i} |w_i|$$

---

# Elastic Net Regression

## Visual Classification
**No visual (text-only)** — Extension of regularization concepts

---

## Conceptual Intuition

Elastic Net combines L1 and L2 penalties. Lasso fails with correlated features (picks one arbitrarily). Ridge keeps all features. Elastic Net balances both.

---

## Why This Concept Exists

Used heavily in high-dimensional domains: genomics, text, finance. When you want both feature selection (L1) and stability (L2).

---

# Decision Tree Regression

## Visual Classification
**Static visual** — Tree diagrams (no V1 primitive)

---

## Conceptual Intuition

Decision trees split feature space into regions and predict constant values per region. They learn rules, not equations.

The tree asks yes/no questions about features, recursively partitioning data until each region is "pure enough."

---

## Why This Concept Exists

Pros: Interpretable, handles non-linearity naturally, no feature scaling required.

Cons: High variance, overfits easily, unstable to small data changes.

---

# Random Forest Regression

## Visual Classification
**Static visual** — Ensemble diagram (no V1 primitive)

---

## Conceptual Intuition

Random Forest builds many trees on bootstrapped samples with random feature subsets. Predictions are averaged across all trees.

The ensemble reduces variance while maintaining the flexibility of trees.

---

## Why This Concept Exists

Single trees overfit. Averaging many trees smooths out noise. This is the bias-variance tradeoff in action through ensemble methods.

Key hyperparameters: `n_estimators` (number of trees), `max_depth`.

---

# Gradient Boosting Regression

## Visual Classification
**No visual (text-only)** — Sequential learning concept

---

## Conceptual Intuition

Boosting trains models sequentially. Each model corrects the errors (residuals) of the previous one.

This is functional gradient descent: each step moves toward lower loss by fitting residuals.

---

## Why This Concept Exists

Extremely powerful. The leading algorithm for tabular data in competitions and industry (XGBoost, LightGBM, CatBoost).

Key hyperparameters: `n_estimators`, `learning_rate` (shrinks each correction), `max_depth`.

---

# Support Vector Regression (SVR)

## Visual Classification
**No visual (text-only)** — V2 candidate

---

## Conceptual Intuition

SVR fits a function inside an ε-insensitive tube. Errors inside ε are ignored—only points outside the tube matter.

The kernel trick enables non-linear relationships without explicit feature expansion.

---

## Why This Concept Exists

SVR works well with:
- Small datasets
- High-dimensional feature spaces
- When you need robustness to outliers (small errors are ignored)

---

# K-Nearest Neighbors (KNN) Regression

## Visual Classification
**V1 Primitive:** `boundary-morphing` (P3) — for K effects

---

## Conceptual Intuition

KNN has no training phase. Prediction is simply the average of the k nearest neighbors.

Distance defines influence. Similar inputs produce similar outputs.

---

## Why This Concept Exists

Simple, intuitive baseline. Issues: sensitive to feature scaling, slow prediction (must scan all training data), suffers from curse of dimensionality.

---

[VISUAL INTUITION: BOUNDARY_MORPHING]

## How to Read the Visual

The boundary-morphing primitive shows how K affects predictions:
- Small K: predictions vary rapidly (high variance)
- Large K: predictions smooth out (high bias)

---

# Gaussian Process Regression (GPR)

## Visual Classification
**No visual (text-only)** — Advanced topic

---

## Conceptual Intuition

GPR is probabilistic regression: it learns a distribution over functions. Outputs include both mean prediction and uncertainty (standard deviation).

The kernel defines smoothness and correlation structure.

---

## Why This Concept Exists

Use GPR when:
- Data is small
- Uncertainty quantification matters
- Need confidence intervals on predictions

---

# Evaluation Metrics

## Visual Classification
**V1 Primitive:** `metric-dashboard` (P4) — for R², MSE visualization

---

## Conceptual Intuition

MSE penalizes large errors (squaring). RMSE is on the same scale as the target. R² measures variance explained.

MAE is robust to outliers. MAPE gives relative error.

---

[VISUAL INTUITION: METRIC_DASHBOARD]

## How to Read the Visual

The metric dashboard shows residual distribution and metric values. Observe:
- Residual histogram should be centered at zero
- R² close to 1 means good fit
- Large MSE/RMSE indicates prediction challenges

---

## Formal Definitions

$$\text{MSE} = \frac{1}{n} \sum (y - \hat{y})^2$$

$$\text{MAE} = \frac{1}{n} \sum |y - \hat{y}|$$

$$R^2 = 1 - \frac{\sum (y - \hat{y})^2}{\sum (y - \bar{y})^2}$$

---

## Transition

Regression predicts continuous values. Classification predicts discrete categories—a fundamentally different task with different metrics and algorithms.
