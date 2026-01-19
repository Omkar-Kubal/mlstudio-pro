# Subject 5: Model Evaluation

> Model evaluation ensures models perform reliably and meet real-world requirements. Without proper evaluation, we risk deploying models that only work in ideal conditions, overlook bias, and cannot be explained to stakeholders.

---

# Module 1: Evaluation Metrics

## Topic 1: Why Evaluation Matters

### Conceptual Intuition

A model that fits training data perfectly may fail catastrophically on new data. Evaluation answers the crucial question: *"Will this model work in production?"*

**Four reasons evaluation matters**:

1. **Reliability detection**: Compare training and test performance to detect overfitting before deployment
2. **Domain alignment**: Choose metrics that reflect real costs—a missed cancer diagnosis costs more than a false alarm
3. **Accountability**: Quantitative scores (accuracy, AUC, error rates) provide transparency for stakeholders
4. **Iteration guidance**: Evaluation reveals *where* a model fails, helping prioritize improvements

A model isn't useful because it has high accuracy—it's useful because it makes good decisions on unseen data.

### Visual Justification

**V1 Visual**: `fit-progression` (P2)

Show training error vs. test error as model complexity increases. Low complexity: both errors high (underfitting). Medium complexity: both errors low (good fit). High complexity: training error near zero, test error climbing (overfitting).

### Formal Definition

**Generalization error** is the expected prediction error on new data from the same distribution:
$$E[(y - \hat{y})^2] = \text{Bias}^2 + \text{Variance} + \text{Irreducible Error}$$

```python
# Optional verification
import numpy as np
from sklearn.metrics import mean_squared_error
from sklearn.model_selection import train_test_split

# Generate noisy data
rng = np.random.RandomState(0)
X = rng.uniform(-3, 3, size=100)[:, np.newaxis]
y = np.sin(X).ravel() + rng.normal(scale=0.3, size=100)

X_train, X_test, y_train, y_test = train_test_split(X, y, random_state=0)

# Compare different polynomial degrees
degrees = [1, 3, 5, 9]
for d in degrees:
    model = np.poly1d(np.polyfit(X_train.ravel(), y_train, d))
    train_mse = mean_squared_error(y_train, model(X_train))
    test_mse = mean_squared_error(y_test, model(X_test))
    print(f"Degree {d}: Train MSE={train_mse:.3f}, Test MSE={test_mse:.3f}")
```

---

## Topic 2: Regression Metrics

### Conceptual Intuition

For regression, we measure how far predictions are from true values. Different metrics emphasize different aspects:

**Mean Squared Error (MSE)**:
- Squares each error before averaging
- Large errors contribute disproportionately (squared)
- Use when big mistakes are especially costly

**Mean Absolute Error (MAE)**:
- Averages absolute errors
- Linear penalty—all errors weighted equally by magnitude
- More robust to outliers, easier to interpret

**Root Mean Squared Error (RMSE)**:
- Square root of MSE
- Same units as the target variable
- Commonly reported alongside MSE

**R² (Coefficient of Determination)**:
- Proportion of variance explained by the model
- R² = 1 means perfect fit
- R² = 0 means no better than predicting the mean
- Can be negative if the model is worse than the mean

### Visual Justification

**V1 Visual**: `metric-dashboard` (P4)

Scatter plot of actual vs. predicted values with the ideal y=x line. Points close to the line indicate low error. Color points by error magnitude to highlight worst predictions.

### Formal Definition

**MSE**:
$$MSE = \frac{1}{n}\sum_{i=1}^{n}(y_i - \hat{y}_i)^2$$

**MAE**:
$$MAE = \frac{1}{n}\sum_{i=1}^{n}|y_i - \hat{y}_i|$$

**R²**:
$$R^2 = 1 - \frac{\sum(y_i - \hat{y}_i)^2}{\sum(y_i - \bar{y})^2}$$

```python
# Optional verification
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
from sklearn.linear_model import LinearRegression
import numpy as np

# Create linear data with noise
rng = np.random.RandomState(42)
X = 2 * rng.rand(100, 1) - 1
y = 3 * X.ravel() + 2 + rng.normal(scale=0.5, size=100)

model = LinearRegression().fit(X, y)
y_pred = model.predict(X)

mse = mean_squared_error(y, y_pred)
mae = mean_absolute_error(y, y_pred)
r2 = r2_score(y, y_pred)

print(f"MSE: {mse:.3f}")
print(f"MAE: {mae:.3f}")
print(f"R²: {r2:.3f}")
```

---

## Topic 3: Classification Metrics

### Conceptual Intuition

For classification, simply counting correct predictions isn't enough. We need to understand *what kinds* of errors the model makes.

**Accuracy**: Fraction correct. Misleading with imbalanced classes—predicting "no fraud" for everything gives 99.9% accuracy on fraud detection.

**Precision**: Of predictions for class X, what fraction are correct? *"When we say positive, how often are we right?"*

**Recall**: Of actual class X instances, what fraction did we find? *"Of all the positives, how many did we catch?"*

**F1 Score**: Harmonic mean of precision and recall. Balances both into a single number.

**Which to prioritize?**
- Medical diagnosis: High recall (don't miss sick patients)
- Spam filtering: High precision (don't block good emails)
- F1: When you need balance

### Visual Justification

**V1 Visual**: `metric-dashboard` (P4)

Bar chart comparing accuracy, precision, recall, and F1 for different models. Stacked bars show per-class metrics.

### Formal Definition

**Accuracy**:
$$\text{Accuracy} = \frac{TP + TN}{TP + TN + FP + FN}$$

**Precision**:
$$\text{Precision} = \frac{TP}{TP + FP}$$

**Recall**:
$$\text{Recall} = \frac{TP}{TP + FN}$$

**F1 Score**:
$$F_1 = 2 \cdot \frac{\text{Precision} \cdot \text{Recall}}{\text{Precision} + \text{Recall}}$$

```python
# Optional verification
from sklearn.datasets import make_classification
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
from sklearn.model_selection import train_test_split

X, y = make_classification(n_samples=200, n_features=4, n_informative=2, random_state=1)
X_train, X_test, y_train, y_test = train_test_split(X, y, random_state=42)

clf = LogisticRegression(solver='liblinear').fit(X_train, y_train)
y_pred = clf.predict(X_test)

print(f"Accuracy: {accuracy_score(y_test, y_pred):.3f}")
print(f"Precision: {precision_score(y_test, y_pred):.3f}")
print(f"Recall: {recall_score(y_test, y_pred):.3f}")
print(f"F1: {f1_score(y_test, y_pred):.3f}")
```

---

## Topic 4: Confusion Matrix

### Conceptual Intuition

The **confusion matrix** is a 2×2 table (for binary classification) that shows exactly where predictions go right and wrong:

|                    | Predicted Positive | Predicted Negative |
|--------------------|--------------------|--------------------|
| **Actual Positive**| True Positive (TP) | False Negative (FN)|
| **Actual Negative**| False Positive (FP)| True Negative (TN) |

All classification metrics derive from this matrix:
- Accuracy = (TP + TN) / total
- Precision = TP / (TP + FP)
- Recall = TP / (TP + FN)
- Specificity = TN / (TN + FP)

For multi-class problems, the matrix is N×N, where entry (i, j) counts instances of true class i predicted as class j.

### Visual Justification

**V1 Visual**: `metric-dashboard` (P4)

Heatmap with rows as true classes, columns as predicted classes. Diagonal cells (correct predictions) should be dark; off-diagonal cells (errors) should be light. Values in each cell show counts.

### Formal Definition

For binary classification with classes {0, 1}:
- **TP**: Correctly predicted positive
- **TN**: Correctly predicted negative
- **FP**: Incorrectly predicted positive (Type I error)
- **FN**: Incorrectly predicted negative (Type II error)

```python
# Optional verification
import seaborn as sns
import matplotlib.pyplot as plt
from sklearn.metrics import confusion_matrix

cm = confusion_matrix(y_test, y_pred)
labels = ['Negative', 'Positive']

plt.figure(figsize=(6, 4))
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues',
            xticklabels=labels, yticklabels=labels)
plt.xlabel('Predicted')
plt.ylabel('True')
plt.title('Confusion Matrix')
```

---

## Topic 5: ROC and AUC

### Conceptual Intuition

Most classifiers output probabilities, not just labels. The **threshold** we use to convert probabilities to predictions can be tuned.

The **ROC curve** (Receiver Operating Characteristic) plots True Positive Rate (TPR, same as recall) vs. False Positive Rate (FPR) for all thresholds:
- A perfect classifier hugs the top-left corner (TPR=1, FPR=0)
- A random classifier follows the diagonal
- The curve shows all possible tradeoffs

**AUC** (Area Under the Curve) summarizes the ROC into one number:
- AUC = 1.0: Perfect classifier
- AUC = 0.5: Random guessing
- AUC < 0.5: Worse than random (predictions are inverted)

AUC represents the probability that a randomly chosen positive example is ranked higher than a randomly chosen negative example.

### Visual Justification

**V1 Visual**: `metric-dashboard` (P4)

ROC curve with the diagonal baseline for random guessing. Shaded area below the curve represents AUC. A threshold marker shows the current operating point.

### Formal Definition

**True Positive Rate (TPR)**:
$$TPR = \frac{TP}{TP + FN}$$

**False Positive Rate (FPR)**:
$$FPR = \frac{FP}{FP + TN}$$

**AUC** = Area under the ROC curve, computed by integration or trapezoidal approximation.

```python
# Optional verification
from sklearn.metrics import roc_curve, roc_auc_score
import matplotlib.pyplot as plt

y_scores = clf.predict_proba(X_test)[:, 1]
fpr, tpr, thresholds = roc_curve(y_test, y_scores)
auc = roc_auc_score(y_test, y_scores)

plt.figure(figsize=(6, 5))
plt.plot(fpr, tpr, label=f'ROC (AUC = {auc:.3f})')
plt.plot([0, 1], [0, 1], 'r--', label='Random (AUC = 0.5)')
plt.xlabel('False Positive Rate')
plt.ylabel('True Positive Rate')
plt.title('ROC Curve')
plt.legend()
```

---

## Topic 6: Precision-Recall Curves

### Conceptual Intuition

For **imbalanced datasets** where positives are rare, ROC curves can be misleading. A model that finds half the positives with few false positives looks great on ROC—but the PR curve reveals the true story.

The **Precision-Recall curve** plots precision vs. recall at all thresholds:
- High threshold: High precision, low recall (conservative)
- Low threshold: Low precision, high recall (aggressive)

**Average Precision (AP)** summarizes the curve, analogous to AUC for ROC.

When to use PR curves:
- When the positive class is rare
- When false positives are costly
- When you need to set a specific precision or recall floor

### Visual Justification

**V1 Visual**: `metric-dashboard` (P4)

PR curve with shaded area showing Average Precision. Compare to ROC side-by-side on imbalanced data to show how PR reveals more about performance on the minority class.

### Formal Definition

**Precision at threshold t**:
$$\text{Precision}(t) = \frac{TP(t)}{TP(t) + FP(t)}$$

**Average Precision**:
$$AP = \sum_{n} (R_n - R_{n-1}) \cdot P_n$$

Where Rₙ and Pₙ are recall and precision at the nth threshold.

```python
# Optional verification
from sklearn.metrics import precision_recall_curve, average_precision_score
import matplotlib.pyplot as plt

precision, recall, pr_thresholds = precision_recall_curve(y_test, y_scores)
ap = average_precision_score(y_test, y_scores)

plt.figure(figsize=(6, 5))
plt.step(recall, precision, where='post')
plt.xlabel('Recall')
plt.ylabel('Precision')
plt.title(f'Precision-Recall Curve (AP = {ap:.3f})')
plt.ylim([0.0, 1.05])
plt.xlim([0.0, 1.0])
```

---

# Module 2: Validation Techniques

## Topic 1: Holdout Validation

### Conceptual Intuition

The simplest validation: split data into training set (to fit the model) and test set (to evaluate generalization).

**Typical splits**: 70/30, 80/20, or 90/10

**Advantages**: Fast, simple, intuitive

**Disadvantages**: 
- High variance—performance depends heavily on which points end up in which split
- Wastes data that could improve the model
- Unsuitable for small datasets

Use holdout for quick experiments, not for final model selection.

### Visual Justification

**V1 Visual**: Static diagram (No primitive needed)

Show a dataset split into two portions with different colors. Multiple random splits produce different performance estimates.

### Formal Definition

Split dataset D into Dₜᵣₐᵢₙ and Dₜₑₛₜ where |Dₜₑₛₜ| / |D| = test_ratio.

```python
# Optional verification
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score
from sklearn.datasets import load_iris

X, y = load_iris(return_X_y=True)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=42)

model = LogisticRegression()
model.fit(X_train, y_train)
predictions = model.predict(X_test)

print("Accuracy:", accuracy_score(y_test, predictions))
```

---

## Topic 2: Cross-Validation

### Conceptual Intuition

Cross-validation addresses holdout's high variance by using multiple splits and averaging results.

**K-Fold Cross-Validation**:
1. Split data into k equal folds
2. For each fold i:
   - Train on all folds except i
   - Test on fold i
3. Average the k test scores

**Benefits**:
- Every data point is used for testing exactly once
- More stable performance estimate
- Standard choice: k=5 or k=10

**Trade-off**: More folds = less bias but more variance and computation.

### Visual Justification

**V1 Visual**: Static diagram

Show data divided into 5 folds. Cycle through which fold is held out, highlighting the test fold each iteration.

### Formal Definition

For k-fold CV with metric M:
$$\text{CV Score} = \frac{1}{k}\sum_{i=1}^{k} M(y_i^{test}, \hat{y}_i^{test})$$

```python
# Optional verification
from sklearn.model_selection import cross_val_score
from sklearn.ensemble import RandomForestClassifier

model = RandomForestClassifier()
scores = cross_val_score(model, X, y, cv=5)

print("Cross-Validation Scores:", scores)
print(f"Average Accuracy: {scores.mean():.3f} (+/- {scores.std():.3f})")
```

---

## Topic 3: Stratified K-Fold

### Conceptual Intuition

Standard K-Fold can accidentally create folds with unrepresentative class distributions, especially with imbalanced data.

**Stratified K-Fold** preserves the class distribution in each fold. If the dataset is 70% class A and 30% class B, each fold will also be approximately 70/30.

**Rule**: Always use Stratified K-Fold for classification unless you have a specific reason not to.

### Visual Justification

**V1 Visual**: Static diagram

Side-by-side comparison: standard K-Fold creates folds with varying class ratios; Stratified K-Fold maintains consistent ratios across all folds.

### Formal Definition

Stratified K-Fold ensures:
$$\frac{|c_j \cap \text{Fold}_i|}{|\text{Fold}_i|} \approx \frac{|c_j|}{|D|}$$

for each class cⱼ and each fold i.

```python
# Optional verification
from sklearn.model_selection import StratifiedKFold, KFold
import numpy as np

kf = KFold(n_splits=5, shuffle=True, random_state=1)
skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=1)

print("Stratified K-Fold - Class distribution per test fold:")
for fold, (train_idx, test_idx) in enumerate(skf.split(X, y)):
    unique, counts = np.unique(y[test_idx], return_counts=True)
    print(f"  Fold {fold+1}: {dict(zip(unique, counts))}")
```

---

## Topic 4: Hyperparameter Tuning

### Conceptual Intuition

**Hyperparameters** are settings you choose before training—they're not learned from data. Examples: learning rate, tree depth, regularization strength, number of layers.

Poor hyperparameters doom a model before it starts:
- Too simple → underfitting (high bias)
- Too complex → overfitting (high variance)

**Key principle**: Always tune using cross-validation on training data, never on the test set. The test set must remain truly held out.

### Visual Justification

**V1 Visual**: `fit-progression` (P2)

Show accuracy vs. hyperparameter value (e.g., max_depth from 1 to 15). Training accuracy keeps improving; validation accuracy peaks then declines.

### Formal Definition

Hyperparameter optimization:
$$\theta^* = \arg\min_{\theta} \mathbb{E}_{D_{val}}[L(f_{\theta}(x), y)]$$

Subject to θ in hyperparameter space.

```python
# Optional verification
from sklearn.model_selection import cross_val_score
from sklearn.ensemble import RandomForestClassifier

print("Testing different max_depth values:")
for depth in range(1, 11):
    model = RandomForestClassifier(max_depth=depth, random_state=0)
    scores = cross_val_score(model, X, y, cv=5)
    print(f"  Depth {depth}: Accuracy = {scores.mean():.3f} (+/- {scores.std():.3f})")
```

---

## Topic 5: Grid Search vs Random Search

### Conceptual Intuition

When tuning multiple hyperparameters, how do you search the space efficiently?

**Grid Search**:
- Test all combinations of specified values
- Exhaustive but slow—if you have 3 parameters with 10 values each, that's 1000 combinations
- Wastes effort testing the same value of irrelevant parameters repeatedly

**Random Search**:
- Randomly sample parameter combinations
- Often finds good results with fewer evaluations
- Better coverage of important dimensions
- Preferred when the search space is large

**Practical guidance**: Start with random search to find promising regions, then optionally refine with grid search.

### Visual Justification

**V1 Visual**: Static diagram

2D parameter space showing grid search (regular lattice pattern) vs. random search (scattered points). Highlight how random search explores more unique values of each dimension.

### Formal Definition

Grid search over parameter space Θ = Θ₁ × Θ₂ × ... × Θₙ tests |Θ₁| × |Θ₂| × ... × |Θₙ| combinations.

Random search samples n points uniformly from Θ.

```python
# Optional verification
from sklearn.model_selection import GridSearchCV, RandomizedSearchCV
from sklearn.ensemble import RandomForestClassifier
from scipy.stats import randint

# Grid Search
param_grid = {'n_estimators': [10, 50, 100], 'max_depth': [2, 4, 6]}
grid = GridSearchCV(RandomForestClassifier(), param_grid, cv=3)
grid.fit(X, y)
print("Best Grid Params:", grid.best_params_)
print(f"Best Score: {grid.best_score_:.3f}")

# Random Search
param_dist = {'n_estimators': randint(10, 200), 'max_depth': randint(1, 10)}
random_search = RandomizedSearchCV(
    RandomForestClassifier(), param_distributions=param_dist,
    n_iter=10, cv=3, random_state=0
)
random_search.fit(X, y)
print("\nBest Random Params:", random_search.best_params_)
print(f"Best Score: {random_search.best_score_:.3f}")
```

---

# Module 3: Bias-Variance Tradeoff

## Topic 1: The Fundamental Tradeoff

### Conceptual Intuition

Every predictive model's error can be decomposed into three parts:

**Bias**: Error from oversimplified assumptions. A linear model fitting a curved pattern has high bias.

**Variance**: Error from sensitivity to training data. A model that changes dramatically with small data changes has high variance.

**Irreducible Error**: Noise inherent in the data that no model can capture.

**The tradeoff**:
- Simple models: High bias, low variance (underfit)
- Complex models: Low bias, high variance (overfit)
- Sweet spot: Minimum total error

This is the central challenge of machine learning.

### Visual Justification

**V1 Visual**: `fit-progression` (P2)

Show three curves on one plot: Bias² (decreasing with complexity), Variance (increasing with complexity), Total Error (U-shaped). The minimum of the total error curve is the optimal complexity.

### Formal Definition

**Bias-Variance Decomposition** (for squared loss):
$$\mathbb{E}[(y - \hat{f}(x))^2] = \text{Bias}[\hat{f}(x)]^2 + \text{Var}[\hat{f}(x)] + \sigma^2$$

Where σ² is irreducible noise.

```python
# Optional verification
from sklearn.model_selection import validation_curve
from sklearn.tree import DecisionTreeRegressor
from sklearn.datasets import make_regression
import numpy as np

X, y = make_regression(n_samples=500, n_features=1, noise=10)
model = DecisionTreeRegressor()
param_range = np.arange(1, 15)

train_scores, test_scores = validation_curve(
    model, X, y, param_name="max_depth", param_range=param_range,
    cv=5, scoring="neg_mean_squared_error"
)

train_mean = -np.mean(train_scores, axis=1)
test_mean = -np.mean(test_scores, axis=1)

# Training error decreases; test error makes a U-shape
```

---

## Topic 2: Underfitting vs Overfitting

### Conceptual Intuition

**Underfitting** (high bias):
- Model is too simple to capture the data's true pattern
- Both training and test error are high
- Adding complexity or features helps
- Examples: linear model on non-linear data, decision stump on complex problem

**Overfitting** (high variance):
- Model is too complex, memorizing noise in training data
- Training error is low, but test error is high
- Simplifying the model or adding regularization helps
- Examples: polynomial degree 15 on 20 points, decision tree with no depth limit

**Good fit**:
- Model captures the true pattern without fitting noise
- Both training and test error are low and close together

### Visual Justification

**V1 Visual**: `fit-progression` (P2)

Three side-by-side regression plots:
1. Underfit: straight line through curved data
2. Good fit: smooth curve following the trend
3. Overfit: wiggly line passing through every training point

### Formal Definition

Underfitting: High training error, high test error
Overfitting: Low training error, high test error (large gap)
Good fit: Low training error, low test error (small gap)

```python
# Optional verification
from sklearn.preprocessing import PolynomialFeatures
from sklearn.linear_model import LinearRegression
import numpy as np

np.random.seed(1)
X = np.sort(5 * np.random.rand(80, 1), axis=0)
y = np.sin(X).ravel() + np.random.normal(0, 0.1, X.shape[0])

# Degree 1: underfit, Degree 4: good, Degree 15: overfit
for degree in [1, 4, 15]:
    poly = PolynomialFeatures(degree)
    X_poly = poly.fit_transform(X)
    model = LinearRegression().fit(X_poly, y)
    y_pred = model.predict(X_poly)
    # Observe the fits
```

---

## Topic 3: Learning Curves

### Conceptual Intuition

**Learning curves** show model performance as a function of training set size. They help diagnose the source of error:

**High bias (underfitting)**:
- Both training and validation curves converge at a high error
- More data won't help—the model is fundamentally too simple
- Solution: increase model complexity

**High variance (overfitting)**:
- Large gap between training error (low) and validation error (high)
- More data helps—the model needs to see more examples to generalize
- Solution: more data, simpler model, or regularization

**Ideal**:
- Both curves converge at low error with minimal gap

### Visual Justification

**V1 Visual**: `fit-progression` (P2)

Dual-line plot with training size on x-axis, score on y-axis. Training score starts high and decreases slightly; validation score starts low and increases, converging toward training.

### Formal Definition

Learning curve at training size n:
$$\text{Score}(n) = \mathbb{E}_{D_n}[M(f_{D_n}, D_{val})]$$

Where D_n is a training set of size n.

```python
# Optional verification
from sklearn.model_selection import learning_curve
from sklearn.linear_model import Ridge
from sklearn.datasets import make_regression
import numpy as np

X, y = make_regression(n_samples=1000, n_features=20)
train_sizes, train_scores, val_scores = learning_curve(
    Ridge(), X, y, cv=5,
    train_sizes=np.linspace(0.1, 1.0, 10)
)

train_mean = np.mean(train_scores, axis=1)
val_mean = np.mean(val_scores, axis=1)

# Plot train_sizes vs train_mean and val_mean
```

---

## Topic 4: Regularization Effects

### Conceptual Intuition

**Regularization** combats overfitting by penalizing model complexity. It adds a penalty term to the loss function.

**L2 Regularization (Ridge)**:
- Penalty proportional to sum of squared coefficients
- Shrinks all coefficients toward zero (but not exactly zero)
- Produces stable, smooth solutions
- Good when many features contribute a little

**L1 Regularization (Lasso)**:
- Penalty proportional to sum of absolute coefficients
- Shrinks some coefficients to exactly zero
- Performs automatic feature selection
- Good for sparse solutions

**Elastic Net**: Combines L1 and L2. Use when unsure or when you want both sparsity and coefficient shrinkage.

**The regularization strength parameter** (α or λ) controls the tradeoff:
- α = 0: No regularization (risk overfitting)
- α = ∞: Maximum regularization (risk underfitting)

### Visual Justification

**V1 Visual**: `fit-progression` (P2)

Bar chart of coefficients for Lasso vs Ridge at various regularization strengths. As α increases, Lasso drives more coefficients to zero; Ridge shrinks all but keeps them nonzero.

### Formal Definition

**Ridge loss**:
$$L_{ridge} = \sum_{i}(y_i - \hat{y}_i)^2 + \alpha\sum_{j}w_j^2$$

**Lasso loss**:
$$L_{lasso} = \sum_{i}(y_i - \hat{y}_i)^2 + \alpha\sum_{j}|w_j|$$

```python
# Optional verification
from sklearn.linear_model import Lasso, Ridge
from sklearn.datasets import make_regression
import numpy as np

X, y = make_regression(n_samples=100, n_features=10, noise=10)

lasso = Lasso(alpha=0.1).fit(X, y)
ridge = Ridge(alpha=1.0).fit(X, y)

print("Ridge coefficients:", ridge.coef_)
print("Lasso coefficients:", lasso.coef_)
# Note: Lasso has some zeros, Ridge has all nonzero
```

---

## Module Summary

Model evaluation is the bridge between training and deployment. Metrics measure performance, validation ensures generalization, and understanding bias-variance guides model selection.

**Key takeaways**:
1. Choose metrics that reflect your domain's costs (precision vs recall, MSE vs MAE)
2. Use cross-validation for reliable performance estimates
3. Always stratify folds for classification
4. Tune hyperparameters on validation data, not test data
5. Random search is often better than grid search for large parameter spaces
6. Diagnose underfitting/overfitting with learning curves
7. Regularization prevents overfitting by penalizing complexity
