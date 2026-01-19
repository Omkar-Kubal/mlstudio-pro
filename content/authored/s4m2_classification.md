# Subject 4, Module 2: Classification

> Classification assigns inputs to discrete categories. Fundamentally, it's about regions in space—each classifier learns which region of input space belongs to which class. A classifier doesn't say what something *is*; it says which side of a boundary it falls on.

---

## Topic 1: Decision Boundaries

### Conceptual Intuition

Every classification problem reduces to one question: *where do you draw the line?*

Imagine a 2D scatter plot where points are colored by class. A decision boundary is the curve (or line, or surface) that separates these regions. Everything on one side gets one label; everything on the other side gets a different label.

Different classifiers create different boundary shapes:
- **Linear boundaries**: Straight lines (or hyperplanes in higher dimensions)—produced by logistic regression and linear SVMs
- **Non-linear boundaries**: Curves, circles, or complex shapes—produced by neural networks, kernel SVMs, and some tree ensembles
- **Piecewise boundaries**: Axis-aligned rectangles—produced by decision trees

The shape of the boundary determines what patterns the model can capture. A linear classifier can't separate classes that are interleaved or wrapped around each other.

### Visual Justification

**V1 Visual**: `boundary-morphing` (P3)

A 2D feature space shows points colored by class. The background is shaded by predicted class. As parameters change, observe how the boundary morphs from straight to curved, from simple to complex.

This visualization shows that classification isn't about labels—it's about carving up space.

### Formal Definition

A decision boundary for binary classification is the set of points where:
$$P(y=1|x) = P(y=0|x) = 0.5$$

For a linear classifier with weights **w** and bias *b*, the boundary is:
$$\mathbf{w}^T\mathbf{x} + b = 0$$

```python
# Optional verification
from sklearn.datasets import make_classification

X, y = make_classification(
    n_samples=300,
    n_features=2,
    n_redundant=0,
    n_informative=2,
    n_clusters_per_class=1,
    random_state=42
)
```

---

## Topic 2: Logistic Regression

### Conceptual Intuition

Despite the name, logistic regression is a **classifier**, not a regression model. It's called "regression" because it models the probability of a class (a continuous value between 0 and 1).

The process:
1. Compute a linear combination: z = **w**ᵀ**x** + b
2. Pass through the **sigmoid function** to squash z into (0, 1)
3. Apply a threshold to produce a class label

The sigmoid function is S-shaped, mapping any real number to a probability. For very negative z, the output approaches 0. For very positive z, it approaches 1. Near z = 0, the function is approximately linear and most uncertain.

Logistic regression assumes classes are linearly separable and that the log-odds of the positive class are linear in features.

### Softmax Extension

For multi-class problems, the **softmax function** generalizes the sigmoid. It converts a vector of raw scores into a probability distribution—classes compete, so increasing one probability necessarily decreases others.

### Visual Justification

**V1 Visual**: `boundary-morphing` (P3) configured for linear boundary + `distribution-evolution` (P1) for probability gradient

The boundary is a straight line. The color gradient shows probability transitioning from 0 to 1 as you cross the boundary. The sigmoid curve can be shown separately.

### Formal Definition

**Sigmoid function**:
$$\sigma(z) = \frac{1}{1 + e^{-z}}$$

**Softmax function** (for class k among K classes):
$$P(y=k) = \frac{e^{z_k}}{\sum_{j=1}^{K} e^{z_j}}$$

```python
# Optional verification
from sklearn.linear_model import LogisticRegression

model = LogisticRegression()
model.fit(X, y)

y_pred = model.predict(X)
y_prob = model.predict_proba(X)[:, 1]

print("Predictions:", y_pred[:5])
print("Probabilities:", y_prob[:5])
```

---

## Topic 3: Cross-Entropy Loss

### Conceptual Intuition

How do we train a probability-based classifier? We need a loss function that penalizes confident wrong predictions more than uncertain ones.

**Cross-entropy** measures the cost of using predicted probabilities to encode the true labels. The key insight: if the model is confident and wrong, the loss spikes dramatically. If the model is unsure (probability near 0.5), the penalty is moderate.

This creates a powerful learning signal—the model learns not just to predict correctly, but to be confident when correct and cautious when uncertain.

### Visual Justification

**V1 Visual**: Static diagram (no interactive primitive needed)

A loss curve shows loss vs. predicted probability for a true positive case. When p approaches 0 (confident wrong), loss shoots toward infinity. When p approaches 1 (confident correct), loss approaches 0. The curve is asymmetric and steep near the wrong end.

### Formal Definition

**Binary cross-entropy**:
$$L = -[y \cdot \log(p) + (1-y) \cdot \log(1-p)]$$

Where y is the true label (0 or 1) and p is the predicted probability.

For multi-class with C classes:
$$L = -\sum_{c=1}^{C} y_c \cdot \log(p_c)$$

```python
# Optional verification
import numpy as np

def cross_entropy(y_true, y_prob):
    epsilon = 1e-15  # Avoid log(0)
    y_prob = np.clip(y_prob, epsilon, 1 - epsilon)
    return -np.mean(y_true * np.log(y_prob) + (1 - y_true) * np.log(1 - y_prob))

y_true = np.array([1, 0, 1, 1])
y_prob = np.array([0.9, 0.1, 0.8, 0.7])

print("Cross-entropy loss:", cross_entropy(y_true, y_prob))
```

---

## Topic 4: KNN, Naive Bayes, and Decision Trees

### Conceptual Intuition

Beyond logistic regression, several classic algorithms approach classification differently:

**K-Nearest Neighbors (KNN)**:
- No explicit training—the algorithm stores the data
- Prediction: find the k closest points, take majority vote
- Small k = complex, wiggly boundaries (sensitive to noise)
- Large k = smooth boundaries (may miss local patterns)
- Distance metric matters (Euclidean, Manhattan, etc.)

**Naive Bayes**:
- Applies Bayes' Theorem with a strong "naive" assumption: features are independent given the class
- Computes P(class | features) ∝ P(class) × ∏ P(feature_i | class)
- Works surprisingly well for text classification despite violated assumptions
- Very fast and interpretable

**Decision Trees**:
- Ask yes/no questions about features, recursively partitioning space
- Creates axis-aligned rectangular regions
- Highly interpretable ("if age > 30 and income < 50k, then...")
- Prone to overfitting when grown deep

### Visual Justification

**V1 Visual**: `boundary-morphing` (P3) for KNN boundaries

For KNN, observe how changing k smooths or roughens the boundary. For decision trees, visualize axis-aligned rectangular splits.

### Formal Definition

**Naive Bayes**:
$$P(y|\mathbf{x}) \propto P(y) \cdot \prod_{i=1}^{n} P(x_i|y)$$

**KNN Decision Rule**: Classify x̂ as the most common class among its k nearest neighbors.

```python
# Optional verification
from sklearn.neighbors import KNeighborsClassifier
from sklearn.naive_bayes import GaussianNB
from sklearn.tree import DecisionTreeClassifier

# KNN
knn = KNeighborsClassifier(n_neighbors=5)
knn.fit(X, y)

# Naive Bayes
nb = GaussianNB()
nb.fit(X, y)

# Decision Tree
tree = DecisionTreeClassifier(max_depth=3)
tree.fit(X, y)

print("KNN accuracy:", knn.score(X, y))
print("Naive Bayes accuracy:", nb.score(X, y))
print("Tree accuracy:", tree.score(X, y))
```

---

## Topic 5: Ensemble Classifiers

### Conceptual Intuition

Why use one model when you can use many? Ensemble methods combine multiple models to achieve better performance than any single model.

**Random Forest**:
- Builds many decision trees on bootstrapped data with random feature subsets
- Final prediction = majority vote
- Reduces variance while maintaining low bias
- Robust and requires minimal tuning

**Gradient Boosting**:
- Builds trees sequentially, each correcting the previous one's errors
- Focuses computational power on hard examples
- High accuracy but can overfit without regularization

**Support Vector Machine (SVM)**:
- Finds the **maximum-margin boundary**—the safest line is farthest from all points
- Points closest to the boundary are **support vectors**
- The **kernel trick** enables non-linear boundaries without explicit feature expansion
- Common kernels: linear, polynomial, RBF (radial basis function)

### Visual Justification

**V1 Visual**: `boundary-morphing` (P3) for SVM margins + static composition for ensemble voting

For SVM, visualize the margin bands with support vectors highlighted. For ensembles, show individual tree boundaries (light) overlaid with the final ensemble boundary (bold).

### Formal Definition

**SVM Optimization**:
$$\min_{\mathbf{w}, b} \frac{1}{2}||\mathbf{w}||^2 \quad \text{subject to} \quad y_i(\mathbf{w}^T\mathbf{x}_i + b) \geq 1$$

**Random Forest Prediction** (classification):
$$\hat{y} = \text{mode}\{h_1(\mathbf{x}), h_2(\mathbf{x}), ..., h_T(\mathbf{x})\}$$

```python
# Optional verification
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.svm import SVC

# Random Forest
rf = RandomForestClassifier(n_estimators=100)
rf.fit(X, y)

# Gradient Boosting
gb = GradientBoostingClassifier(n_estimators=100, learning_rate=0.1)
gb.fit(X, y)

# SVM with RBF kernel
svm = SVC(kernel='rbf', gamma=0.5)
svm.fit(X, y)

print("Random Forest accuracy:", rf.score(X, y))
print("Gradient Boosting accuracy:", gb.score(X, y))
print("SVM accuracy:", svm.score(X, y))
```

---

## Topic 6: Imbalanced Datasets and Threshold Tuning

### Conceptual Intuition

When one class vastly outnumbers another (e.g., 99% negative, 1% positive), **accuracy is misleading**. A model that always predicts "negative" achieves 99% accuracy while being useless.

**Key metrics for imbalanced data**:
- **Precision**: Of predicted positives, how many are actually positive?
- **Recall**: Of actual positives, how many did we find?
- **F1 Score**: Harmonic mean of precision and recall
- **ROC-AUC**: Area under the ROC curve (TPR vs FPR at all thresholds)

**Threshold tuning**: The default 0.5 threshold isn't sacred. Moving it up increases precision but decreases recall. Moving it down does the opposite. The optimal threshold depends on the cost of false positives vs. false negatives.

**Strategies for imbalanced data**:
- Oversampling the minority class (or undersampling the majority)
- SMOTE: Synthesize new minority examples
- Class weights: Tell the model to care more about the minority class
- Focal loss: Down-weight easily classified examples

### Visual Justification

**V1 Visual**: `metric-dashboard` (P4)

Show the confusion matrix heatmap updating as the threshold changes. Precision-recall curves and ROC curves with a moving threshold marker demonstrate the trade-off.

### Formal Definition

**Precision**:
$$\text{Precision} = \frac{TP}{TP + FP}$$

**Recall** (Sensitivity):
$$\text{Recall} = \frac{TP}{TP + FN}$$

**F1 Score**:
$$F_1 = 2 \cdot \frac{\text{Precision} \cdot \text{Recall}}{\text{Precision} + \text{Recall}}$$

```python
# Optional verification
from sklearn.metrics import classification_report, roc_curve, precision_recall_curve
import numpy as np

# Get probabilities
y_prob = rf.predict_proba(X)[:, 1]

# Custom threshold
threshold = 0.3
y_custom = (y_prob > threshold).astype(int)

print(classification_report(y, y_custom))

# ROC curve points
fpr, tpr, thresholds = roc_curve(y, y_prob)
print(f"TPR at threshold 0.5: {tpr[np.argmin(np.abs(thresholds - 0.5))]}")
```

---

## Module Summary

Classification is fundamentally about **partitioning feature space** into regions. The choice of algorithm determines the boundary shape, and the threshold determines the operating point on the precision-recall trade-off.

**Key takeaways**:
1. Decision boundaries define classification—understand what shapes your algorithm can produce
2. Cross-entropy loss penalizes confident wrong predictions exponentially
3. Different classifiers (KNN, Naive Bayes, trees, SVMs) make different assumptions
4. Ensembles combine models to reduce variance or bias
5. For imbalanced data, look beyond accuracy—use precision, recall, and threshold tuning
