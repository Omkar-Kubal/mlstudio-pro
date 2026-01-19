# Underfitting vs Overfitting

## Visual Classification
**V1 Primitive:** `fit-progression` (P2)

---

## Lesson Content

### The Goldilocks Problem

In machine learning, we're trying to learn a pattern from data. But not all patterns are real. Some are just noise.

Imagine you're trying to predict house prices. You know that size matters. But does the specific color of the mailbox matter? Probably not. If your model is too simple, it misses the size relationship. If it's too complex, it starts memorizing mailbox colors.

This balancing act—finding a model that is neither too simple nor too complex—is the central challenge of supervised learning.

### Definitions

**Underfitting (High Bias):**  
The model is too simple to capture the underlying trend. It's like trying to fit a straight line to a curved road. It makes strong assumptions and ignores the data nuances.
- *Symptom:* High error on training data AND high error on test data.

**Overfitting (High Variance):**  
The model is too complex. It fits the training data perfectly—including the random noise and outliers—but fails to generalize to new data. It memorizes rather than learns.
- *Symptom:* Low error on training data but HIGH error on test data.

**Good Fit:**  
The model captures the true signal but ignores the noise.

[VISUAL INTUITION: FIT_PROGRESSION]

Observe how the curve changes as model complexity increases (from a simple line to a high-degree polynomial).

- **Low Complexity:** The line describes the general direction but misses the curve. This is underfitting.
- **Medium Complexity:** The curve follows the trend of the dots smoothly. This is a good fit.
- **High Complexity:** The curve drastically wiggles to hit every single dot. It looks perfect on the current points, but if you look at the unseen (test) data, the predictions would be wildly wrong. This is overfitting.

### The Generalization Gap

The difference between training performance and test performance is the "generalization gap." In an overfitted model, this gap is huge. In a well-fitted model, the training and test errors are close to each other.

### How to Fix It

**Fixing Underfitting:**
- Increase model complexity (e.g., add more features, use a deeper neural network).
- Remove excessive regularization.
- Train longer.

**Fixing Overfitting:**
- Get more training data.
- Simplify the model (reduce features, reduce depth).
- Use **Regularization** (L1/L2) to punish complexity.
- Use **Cross-Validation** to detect it early.

### Formal Concept

Minimize the total error:
$$ \text{Total Error} = \text{Bias}^2 + \text{Variance} + \text{Irreducible Error} $$

You cannot eliminate error completely, but you can balance bias (underfitting) and variance (overfitting).

---

## Visual Justification

The fit-progression primitive provides the definitive visualization of this concept. By showing the transition from a rigid line to a chaotic wiggly curve, it makes the abstract trade-off between "simple" and "complex" visibly obvious. The "test data" toggle (implied capability) allows verification of the generalization gap.
