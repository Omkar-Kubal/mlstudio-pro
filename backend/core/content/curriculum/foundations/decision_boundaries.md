# Decision Boundaries

## Visual Classification
**V1 Primitive:** `boundary-morphing` (P3)

---

## Lesson Content

### Drawing the Line

Classification is about separation. Whether it's separating spam from inbox, cats from dogs, or benign from malignant tumors, the goal is to draw a line that divides the groups. This line is called the **Decision Boundary**.

But lines aren't always straight. And they aren't always simple.

### Interpreting the Region

The decision boundary isn't just an edge; it defines a territory.
- Everything on one side is predicted as "Class A."
- Everything on the other side is "Class B."
- The boundary itself is the point of maximum uncertainty ($P=0.5$).

When a new data point arrives, the model simply checks which side of the border it falls on.

### Complexity and Flexibility

A **Linear** boundary (like in Logistic Regression) is rigid. It's a straight line (or flat plane) slicing through space. It works great if your data is cleanly separated.

A **Non-Linear** boundary (like in KNN or High-Degree SVM) is flexible. It can curve, loop, and wrap around clusters of data.

[VISUAL INTUITION: BOUNDARY_MORPHING]

Watch how the boundary changes as the model becomes more flexible (increasing $K$ in KNN or complexity).
- A rigid boundary might miss some points but is stable.
- A highly flexible boundary can snake around every single outlier, creating "islands" of decision regions. This morphing behavior visually demonstrates the bias-variance tradeoff in classification.

### The Role of Smoothness

Notice the difference between a jagged, noisy boundary and a smooth, generalized one.
- **Jagged:** Captures noise in the training data (Overfitting).
- **Smooth:** Captures the broad underlying pattern (Generalization).

Algorithms like K-Nearest Neighbors allow you to tune this smoothness directly. A small neighborhood ($K=1$) creates a frantic, jagged map. A large neighborhood ($K=50$) creates a smooth, relaxed border.

### Formal Concept

For a binary classifier $f(x)$ that outputs a probability $p$, the decision boundary is the set of points $x$ where:

$$ f(x) = 0.5 $$

In higher dimensions (3D+), this line becomes a plane or hyperplane.

---

## Visual Justification

The boundary-morphing primitive allows students to see the invisible "territory" that a model learns. By animating the transition from simple to complex boundaries, it reveals how algorithms physically carve up the data space, making the abstract concept of "non-linearity" concrete.
