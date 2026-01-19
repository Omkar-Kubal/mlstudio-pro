# Subject 1, Module 3: Linear Algebra

---

# Vector Operations (Addition, Dot Product, Norms)

## Visual Classification
**No visual (text-only)** — Mathematical operations topic

---

## Conceptual Intuition

Vectors describe data points. Vector *operations* describe relationships between them.

Every machine learning model is built on a small set of operations:
- **Addition** — combining vectors
- **Dot product** — measuring alignment
- **Norm** — measuring magnitude

When you update weights in gradient descent, you are adding vectors. When a linear model makes a prediction, it computes a dot product. When you regularize, you penalize large norms.

---

## Why This Concept Exists

Without these operations:
- No optimizers (gradient descent is vector addition)
- No linear models (prediction = weight · features)
- No similarity measures (cosine similarity = normalized dot product)
- No distance metrics (Euclidean distance uses norms)

---

## Formal Definitions

**Vector Addition:**
$$\mathbf{a} + \mathbf{b} = [a_1 + b_1, a_2 + b_2, \ldots, a_n + b_n]$$

Geometrically: place vectors head-to-tail; the result is net movement.

**Euclidean Norm (L2):**
$$||\mathbf{x}||_2 = \sqrt{\sum_{i=1}^{n} x_i^2}$$

Measures distance from origin—"how strong" or "how far."

**Dot Product:**
$$\mathbf{a} \cdot \mathbf{b} = \sum_{i=1}^{n} a_i b_i = ||\mathbf{a}|| \cdot ||\mathbf{b}|| \cdot \cos(\theta)$$

Measures alignment:
- Large positive → vectors point same direction
- Zero → vectors are orthogonal (no relation)
- Negative → vectors point opposite directions

**Cosine Similarity:**
$$\cos(\theta) = \frac{\mathbf{a} \cdot \mathbf{b}}{||\mathbf{a}|| \cdot ||\mathbf{b}||}$$

Similarity normalized by magnitude—crucial for text embeddings and recommendation systems.

---

## Practical Interpretation

Every linear model prediction is: $\hat{y} = \mathbf{w} \cdot \mathbf{x}$

This dot product asks: "How aligned are the learned weights with this input?"

Large norms often indicate:
- Overfitting (large weights)
- Gradient explosion (large gradient vectors)
- Need for regularization

Cosine similarity is preferred over Euclidean distance in high dimensions because it focuses on direction, not scale.

---

## Optional Code (Verification Only)

```python
import numpy as np

a = np.array([2, 1])
b = np.array([-1, 3])

print("Addition:", a + b)
print("Norm:", np.linalg.norm(a))
print("Dot product:", np.dot(a, b))
```

---

## Transition

Individual vector operations are powerful. But ML operates on *collections* of vectors simultaneously. This is where matrices enter.

---

# Matrices & Matrix Multiplication

## Visual Classification
**No visual (text-only)** — Mathematical operations topic

---

## Conceptual Intuition

A vector is a single data point. A matrix is a *system*—an entire dataset, a transformation, or a layer in a neural network.

When you multiply a vector by a matrix, you are not just computing numbers. You are *transforming* the vector: rotating it, scaling it, projecting it into a new space.

This is how models reshape data. A linear layer takes inputs and outputs a new representation. That's a matrix multiplication.

---

## Why This Concept Exists

Matrix operations are the computational backbone of ML:
- Dataset = design matrix (rows = samples, columns = features)
- Linear layer = weight matrix
- Batch inference = single matrix multiplication
- Backpropagation = transposed matrix multiplications

Without matrices, we couldn't vectorize computation or train at scale.

---

## Formal Definitions

**Matrix:** A 2D array $A \in \mathbb{R}^{m \times n}$ with $m$ rows and $n$ columns.

**Matrix Multiplication:**
If $A \in \mathbb{R}^{m \times n}$ and $B \in \mathbb{R}^{n \times p}$, then $C = AB \in \mathbb{R}^{m \times p}$.

$$C_{ij} = \sum_{k=1}^{n} A_{ik} B_{kj}$$

Each output element is a dot product: row $i$ of A with column $j$ of B.

**Key constraint:** Inner dimensions must match. $A_{m \times n} \cdot B_{n \times p}$ works. $A_{m \times n} \cdot B_{p \times q}$ fails.

**Special Matrices:**
- Identity $I$: $AI = IA = A$ (no change)
- Diagonal: scales each dimension independently
- Orthogonal: pure rotation (preserves angles and distances)

---

## Practical Interpretation

Linear regression in matrix form:
$$\hat{y} = X \mathbf{W}$$

where $X$ is the data matrix and $W$ are weights.

Neural network layers: $\text{output} = \sigma(X W + b)$

Batch processing makes ML efficient—processing 1000 samples at once is one matrix multiplication, not 1000 individual computations.

---

## Optional Code (Verification Only)

```python
import numpy as np

X = np.array([[170, 65],
              [160, 55],
              [180, 75]])

W = np.array([[0.02],
              [0.05]])

predictions = X @ W
print("Predictions:\n", predictions)
```

---

## Transition

Matrix multiplication tells us how to compute transformations. But what makes a transformation reversible? What happens when information is lost? These questions lead to matrix properties.

---

# Matrix Properties: Transpose, Inverse, Rank

## Visual Classification
**No visual (text-only)** — Mathematical properties topic

---

## Conceptual Intuition

Not all transformations are equal. Some can be undone; others cannot. Some preserve all information; others lose dimensions.

**Transpose** swaps rows and columns—it changes perspective. If a matrix represents "features × samples," its transpose represents "samples × features."

**Inverse** undoes a transformation. If matrix $A$ rotates and scales, $A^{-1}$ reverses the rotation and scaling exactly. But not all matrices have inverses—some transformations are one-way.

**Rank** tells you how much independent information a matrix contains. A rank-deficient matrix has redundant features—some columns can be expressed as combinations of others.

---

## Why This Concept Exists

These properties answer critical questions:
- "Can this system be solved?" (inverse exists?)
- "Are my features redundant?" (rank deficient?)
- "Is my model stable?" (well-conditioned?)

Multicollinearity, numerical instability, and underdetermined systems all trace back to these properties.

---

## Formal Definitions

**Transpose:**
$$A^T_{ij} = A_{ji}$$

If $A \in \mathbb{R}^{m \times n}$, then $A^T \in \mathbb{R}^{n \times m}$.

**Inverse:**
For square matrix $A$, the inverse $A^{-1}$ satisfies:
$$AA^{-1} = A^{-1}A = I$$

A matrix is invertible if and only if:
- It is square
- It has full rank
- Its determinant is non-zero

**Rank:**
The number of linearly independent rows (or columns).

$$\text{rank}(A) \le \min(m, n)$$

If $\text{rank}(A) < \min(m, n)$, the matrix is rank-deficient.

---

## Practical Interpretation

The Normal Equation for linear regression uses transpose and inverse:
$$\mathbf{w} = (X^T X)^{-1} X^T \mathbf{y}$$

If $X^T X$ is not invertible (rank-deficient), this equation fails. This happens when features are collinear.

Modern ML avoids direct inversion. Gradient descent is preferred because:
- Inversion is $O(n^3)$—expensive for large matrices
- Numerical instability for ill-conditioned matrices
- Gradient methods work even when inverse doesn't exist

---

## Optional Code (Verification Only)

```python
import numpy as np

A = np.array([[1, 2, 3],
              [2, 4, 6],
              [3, 6, 9]])

print("Rank:", np.linalg.matrix_rank(A))  # Rank = 1 (all rows are multiples)
```

---

## Transition

When features are redundant, we have linear dependence. Understanding dependence leads to a deeper concept: finding the minimal set of directions that describe all possible data—the basis.

---

# Linear Independence & Basis

## Visual Classification
**No visual (text-only)** — Mathematical concept topic

---

## Conceptual Intuition

If two features carry the same information, one is redundant. If a feature can be recreated by combining others, it adds nothing new.

**Linearly independent** vectors point in genuinely different directions. No vector in the set can be expressed as a combination of others.

**Linearly dependent** vectors are redundant. At least one can be written as a weighted sum of the rest.

A **basis** is a minimal set of independent vectors that can represent any vector in the space. It's the coordinate system of your data.

---

## Why This Concept Exists

Independence and basis explain:
- Why PCA works (finding a new, better basis)
- Why embeddings are compact (learned compressed basis)
- Why redundant features waste computation
- Why rank equals the number of useful dimensions

Every dimensionality reduction technique is fundamentally about finding a smaller, more efficient basis.

---

## Formal Definitions

**Linear Combination:**
$$\mathbf{v} = a_1\mathbf{v}_1 + a_2\mathbf{v}_2 + \cdots + a_n\mathbf{v}_n$$

**Linear Independence:**
Vectors $\{\mathbf{v}_1, \ldots, \mathbf{v}_n\}$ are linearly independent if:
$$a_1\mathbf{v}_1 + a_2\mathbf{v}_2 + \cdots + a_n\mathbf{v}_n = \mathbf{0} \implies a_1 = a_2 = \cdots = a_n = 0$$

**Basis:**
A set of vectors that is:
1. Linearly independent
2. Spans the entire space (any vector can be expressed as their combination)

**Dimension** = number of basis vectors.

---

## Practical Interpretation

Rank of a matrix = number of linearly independent columns = dimension of the column space.

If your dataset has 100 features but rank 10, only 10 features carry independent information. The other 90 are redundant combinations.

ML models often implicitly find new bases:
- PCA rotates to principal directions
- Autoencoders learn compressed representations
- Word embeddings map vocabulary to a dense basis

---

## Optional Code (Verification Only)

```python
import numpy as np

v1 = np.array([1, 2])
v2 = np.array([2, 4])  # Multiple of v1

matrix = np.vstack([v1, v2])
print("Rank:", np.linalg.matrix_rank(matrix))  # Rank = 1 (dependent)
```

---

## Transition

When a matrix transforms vectors, most vectors change direction. But some special vectors only stretch or shrink—they maintain their direction. These are eigenvectors.

---

# Eigenvalues & Eigenvectors

## Visual Classification
**No visual (text-only)** — Mathematical concept topic (PCA foundation)

---

## Conceptual Intuition

When you apply a matrix transformation to most vectors, they rotate. But some special vectors—**eigenvectors**—don't rotate at all. They only scale.

The **eigenvalue** tells you how much the eigenvector stretches or shrinks.

Imagine transforming a circle into an ellipse. The eigenvectors are the axes of the ellipse. The eigenvalues are the lengths of those axes.

---

## Why This Concept Exists

Eigenanalysis reveals the "natural directions" of a transformation:
- PCA uses eigenvectors of the covariance matrix → principal directions
- Optimization uses eigenvalues of the Hessian → curvature, convergence speed
- Neural network training stability depends on eigenvalue magnitudes

Understanding eigenvalues helps diagnose training issues (exploding/vanishing gradients) and understand feature importance.

---

## Formal Definitions

For square matrix $A$, vector $\mathbf{v}$ is an eigenvector if:
$$A\mathbf{v} = \lambda\mathbf{v}$$

where $\lambda$ is the eigenvalue.

**Interpretation:**
- $\lambda > 1$: direction expands
- $0 < \lambda < 1$: direction shrinks
- $\lambda = 0$: dimension collapses (rank deficient)
- $\lambda < 0$: direction flips

---

## Practical Interpretation

In PCA:
- Compute covariance matrix of data
- Find eigenvectors (principal directions)
- Find eigenvalues (variance explained by each direction)
- Keep top-k eigenvectors for dimensionality reduction

In optimization:
- Hessian eigenvalues indicate curvature
- Large eigenvalues → steep directions (fast learning)
- Small eigenvalues → flat directions (slow learning)
- Negative eigenvalues → saddle points

---

## Optional Code (Verification Only)

```python
import numpy as np

A = np.array([[3, 1],
              [1, 3]])

values, vectors = np.linalg.eig(A)

print("Eigenvalues:", values)
print("Eigenvectors:\n", vectors)
```

---

## Transition

Eigenanalysis works for square matrices. But real-world data matrices are rarely square. For non-square matrices, we need a more general tool: Singular Value Decomposition.

---

# Singular Value Decomposition (SVD)

## Visual Classification
**No visual (text-only)** — V2 topic foundation (PCA locked)

---

## Conceptual Intuition

SVD is the universal decomposition. It works for *any* matrix—square or rectangular—and reveals its fundamental structure.

Every matrix can be broken into three parts:
1. **Rotation** in output space
2. **Scaling** along principal axes
3. **Rotation** in input space

This decomposition powers PCA, recommendation systems, noise reduction, and compression.

---

## Why This Concept Exists

SVD answers:
- What are the most important directions in this data?
- How can we compress without losing information?
- How do we separate signal from noise?

It's the mathematical foundation of:
- PCA (SVD on centered data)
- Latent semantic analysis (text)
- Collaborative filtering (recommendations)
- Image compression

---

## Formal Definitions

For any matrix $X \in \mathbb{R}^{m \times n}$:
$$X = U\Sigma V^T$$

**Components:**
- $U \in \mathbb{R}^{m \times r}$: Left singular vectors (output directions)
- $\Sigma \in \mathbb{R}^{r \times r}$: Singular values (diagonal, sorted largest first)
- $V^T \in \mathbb{R}^{r \times n}$: Right singular vectors (input directions)

**Properties:**
- Singular values $\sigma_1 \ge \sigma_2 \ge \cdots \ge \sigma_r \ge 0$
- Number of non-zero singular values = rank
- $U$ and $V$ are orthonormal

---

## Practical Interpretation

**Low-rank approximation:**
Keep only top-$k$ singular values:
$$X_k = U_k \Sigma_k V_k^T$$

This removes small singular values (noise) while preserving large ones (signal).

**Compression ratio:** Store $k(m + n + 1)$ numbers instead of $mn$.

**PCA connection:** PCA on $X$ is SVD on centered $X$. Principal components are right singular vectors scaled by singular values.

---

## Optional Code (Verification Only)

```python
import numpy as np

X = np.random.randn(10, 5)
U, S, Vt = np.linalg.svd(X, full_matrices=False)

print("Singular values:", S)

# Low-rank approximation (keep top 2)
k = 2
X_approx = U[:, :k] @ np.diag(S[:k]) @ Vt[:k, :]
print("Reconstruction error:", np.linalg.norm(X - X_approx))
```

---

## Transition

With linear algebra foundations complete—vectors, matrices, properties, eigenvalues, and SVD—we have the mathematical toolkit for understanding how ML algorithms manipulate data. The next step is to see these tools in action: optimization, loss functions, and learning algorithms.
