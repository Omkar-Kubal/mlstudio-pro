# Subject 2, Module 2: NumPy

---

# NumPy Arrays

## Visual Classification
**No visual (text-only)** — Programming fundamentals topic

---

## Conceptual Intuition

Python lists are flexible but slow. They store references to arbitrary objects scattered in memory. When you need to compute on millions of numbers, this overhead becomes unacceptable.

**NumPy arrays** are homogeneous: every element has the same type, stored contiguously in memory. This enables:
- Fast vectorized operations
- Efficient memory usage
- Direct mapping to linear algebra

A NumPy array is not a fancy list—it's a mathematical object.

---

## Why This Concept Exists

Every ML operation is fundamentally array manipulation:
- Features are arrays
- Weights are arrays
- Gradients are arrays
- Predictions are arrays

NumPy is the foundation on which TensorFlow, PyTorch, and scikit-learn are built.

---

## Formal Definitions

**Shape:** The dimensions of an array. `(100, 3)` means 100 rows, 3 columns.

**dtype:** The data type of elements (int32, float64, etc.).

**View vs Copy:**
- Slicing returns a **view** (same underlying data)
- Modifying a view modifies the original
- Use `.copy()` for independent data

**Vectorization:** Applying operations to entire arrays without explicit loops.

```python
# Instead of:
for i in range(len(a)):
    c[i] = a[i] + b[i]

# Use:
c = a + b
```

---

## Practical Interpretation

Shape errors are the most common ML bugs. Always check `.shape` before operations.

View behavior causes subtle bugs: if you slice an array and modify the slice, the original changes too. Use `.copy()` when isolation is needed.

---

## Optional Code (Verification Only)

```python
import numpy as np

arr = np.array([1, 2, 3])
print(arr.dtype)  # int64

X = np.array([[1, 2, 3], [4, 5, 6]])
print(X.shape)    # (2, 3)
print(X.ndim)     # 2
```

---

## Transition

Creating arrays is straightforward. The complexity arises when combining arrays of different shapes.

---

# Array Shapes and Broadcasting

## Visual Classification
**No visual (text-only)** — Programming fundamentals topic

---

## Conceptual Intuition

Shape defines meaning. A `(100, 3)` array has 100 samples with 3 features. A `(3, 100)` array has 3 samples with 100 features. Same numbers, opposite meanings.

**Broadcasting** lets NumPy operate on arrays of different shapes without copying data. It's automatic array stretching.

Rules (compare from right to left):
1. Dimensions must be equal, OR
2. One dimension must be 1

If neither condition holds, the operation fails.

---

## Why This Concept Exists

Broadcasting enables concise, efficient code:

```python
X + bias  # bias applies to every row
X * scale  # scale applies to every column
```

Without broadcasting, you'd need explicit loops or manual replication.

---

## Formal Definitions

**Broadcasting example:**
- `X` shape: `(100, 3)`
- `bias` shape: `(3,)`
- Result shape: `(100, 3)` — `bias` is broadcast across rows

**Reshape semantics:**
- `x.reshape(1, -1)` → row vector
- `x.reshape(-1, 1)` → column vector
- `-1` means "infer this dimension"

---

## Practical Interpretation

**Silent broadcasting danger:** If shapes align accidentally, NumPy won't warn you. The operation succeeds but produces wrong results.

Always verify:
```python
print(f"X: {X.shape}, bias: {bias.shape}")
```

Shape mismatch errors are often caused by missing reshape operations.

---

## Optional Code (Verification Only)

```python
import numpy as np

X = np.array([[1, 2, 3], [4, 5, 6]])  # (2, 3)
bias = np.array([1, 2, 3])             # (3,)

print(X + bias)  # bias broadcast per row

# Column-wise requires reshape
col_bias = np.array([10, 20]).reshape(-1, 1)  # (2, 1)
print(X + col_bias)  # adds 10 to row 0, 20 to row 1
```

---

## Transition

Broadcasting makes operations convenient. But floating-point arithmetic introduces subtle dangers that can corrupt results.

---

# Numerical Stability

## Visual Classification
**No visual (text-only)** — Programming fundamentals topic

---

## Conceptual Intuition

Correct formulas, correct code, correct logic—still wrong results. How?

Computers store real numbers approximately. Floating-point numbers have finite precision. This creates:
- **Rounding errors** — small inaccuracies accumulate
- **Underflow** — numbers too small become zero
- **Overflow** — numbers too large become infinity

In ML, these issues compound across iterations, layers, and matrix operations.

---

## Why This Concept Exists

Numerical instability causes:
- `exp(1000)` → inf
- `exp(-1000)` → 0
- Vanishing/exploding gradients
- Corrupted loss values
- Silent training failures

Understanding stability is mandatory for reliable ML systems.

---

## Formal Definitions

**Catastrophic cancellation:** Subtracting similar numbers amplifies relative error.

**Log-probability:** Convert multiplication to addition:
$$\log(ab) = \log(a) + \log(b)$$

Keeps very small probabilities manageable.

**Stable softmax:**
$$\text{softmax}(x)_i = \frac{e^{x_i - \max(x)}}{\sum_j e^{x_j - \max(x)}}$$

Subtracting max prevents overflow while preserving relative differences.

---

## Practical Interpretation

**Rules:**
1. Never exponentiate large numbers without subtracting max
2. Use log-probabilities for likelihood calculations
3. Scale features before training (numerical protection, not just normalization)
4. Use `np.isclose()` for float comparisons, not `==`

---

## Optional Code (Verification Only)

```python
import numpy as np

# Overflow
print(np.exp(1000))  # inf

# Underflow
print(np.exp(-1000))  # 0.0

# Stable softmax
def stable_softmax(x):
    exp_x = np.exp(x - np.max(x))
    return exp_x / exp_x.sum()

x = np.array([1000, 1001, 1002])
print(stable_softmax(x))  # Valid probabilities
```

---

## Transition

NumPy handles numerical arrays. For tabular data with mixed types, labels, and missing values, we need Pandas.

---

# Subject 2, Module 3: Pandas

---

# Linear Algebra with NumPy (for DataFrames)

## Visual Classification
**No visual (text-only)** — Programming fundamentals topic

---

## Conceptual Intuition

Before diving into Pandas, remember: every DataFrame operation ultimately reduces to array operations.

In NumPy notation:
- 1D arrays are vectors
- 2D arrays are matrices
- Shape determines semantics

The dot product `w · x` is the core of every linear model. Matrix multiplication `X @ W` is your predictions.

---

## Why This Concept Exists

Understanding the linear algebra beneath Pandas helps you:
- Debug shape mismatches
- Optimize computations
- Translate math to code
- Understand what models actually compute

---

## Practical Interpretation

**np.linalg.solve** is preferred over **np.linalg.inv** for solving systems—it's faster and more stable.

Matrix rank tells you how much independent information exists. If rank is less than number of columns, you have redundant features.

---

## Transition

With array fundamentals solid, we can explore Pandas for tabular data manipulation.

---

# Reading & Writing Data

## Visual Classification
**No visual (text-only)** — Programming fundamentals topic

---

## Conceptual Intuition

How data enters your workflow matters. File format affects structure and types. Schema inference can be wrong.

CSV is human-readable but loses type information. JSON preserves nesting but is verbose. Parquet is binary, efficient, and preserves types exactly.

---

## Why This Concept Exists

Garbage in, garbage out. If types are wrong at load time, everything downstream is compromised.

Explicit dtypes prevent:
- Integers read as floats
- Numbers read as strings
- Dates read as objects

---

## Practical Interpretation

Always specify types when possible:

```python
df = pd.read_csv('data.csv', dtype={'age': 'int32'})
df = pd.read_csv('data.csv', parse_dates=['date_column'])
```

Check `df.dtypes` immediately after loading.

---

# Indexing & Filtering

## Visual Classification
**No visual (text-only)** — Programming fundamentals topic

---

## Conceptual Intuition

Pandas forces you to be explicit about selection intent.

**loc:** Label-based access (use column names and index labels)
**iloc:** Position-based access (use integer positions)

This prevents the silent bugs that come from ambiguous indexing.

---

## Why This Concept Exists

Boolean masks replace loops with vectorized filtering:

```python
df[df['age'] > 30]  # All rows where age > 30
```

This is declarative: you state *what* you want, not *how* to get it.

---

## Practical Interpretation

Index alignment is more important than row numbers. After filtering, indices may be non-contiguous. Use `.reset_index()` if you need sequential integers.

---

# GroupBy & Aggregation

## Visual Classification
**No visual (text-only)** — Programming fundamentals topic

---

## Conceptual Intuition

GroupBy implements **Split-Apply-Combine**:
1. Split data into groups
2. Apply function to each group
3. Combine results

This turns rows into insights.

---

## Why This Concept Exists

"What is the average purchase by region?"
"What is the max temperature by month?"
"What is the count by category?"

GroupBy answers these questions declaratively.

---

## Practical Interpretation

```python
df.groupby('category')['value'].mean()
df.groupby('category')['value'].agg(['mean', 'sum', 'count'])
```

Multiple aggregations return a DataFrame with one row per group.

---

# Merging & Joining

## Visual Classification
**No visual (text-only)** — Programming fundamentals topic

---

## Conceptual Intuition

Real data is fragmented across tables. Joining reconstructs relationships.

A join is a claim about how two datasets relate. Wrong join = wrong dataset.

---

## Why This Concept Exists

**Join types:**
- **Inner:** Keep only matching rows
- **Left:** Keep all from left, match from right
- **Right:** Keep all from right, match from left
- **Outer:** Keep all from both

---

## Practical Interpretation

Cardinality matters:
- One-to-one: each key appears once in each table
- One-to-many: key appears once in left, multiple times in right (causes row expansion)
- Many-to-many: duplication explodes

Always check row counts before and after joins.

---

# Handling Missing Data

## Visual Classification
**No visual (text-only)** — Programming fundamentals topic

---

## Conceptual Intuition

Missing ≠ zero. Missing ≠ bug. Missingness is information.

How you handle missing data encodes assumptions. Dropping loses information. Imputing introduces bias. Ignoring propagates errors.

---

## Why This Concept Exists

NaNs propagate intentionally in Pandas. This forces explicit handling.

**MCAR:** Missing Completely At Random (safe to drop)
**MAR:** Missing At Random (depends on observed variables)
**MNAR:** Missing Not At Random (missingness is meaningful)

---

## Practical Interpretation

```python
df.isna().sum()          # Count missing per column
df.dropna()              # Drop rows with any missing
df.fillna(df.median())   # Impute with median
df['col_missing'] = df['col'].isna().astype(int)  # Create indicator
```

Never impute blindly. Understand why data is missing first.

---

## Transition

Pandas manipulates data. Visualization reveals what the data looks like.

---

# Subject 2, Module 4: Data Visualization

---

# Why Visualization Matters

## Visual Classification
**No visual (text-only)** — Conceptual topic

---

## Conceptual Intuition

Humans excel at pattern recognition but fail at interpreting raw numbers. Visualization converts data into visual patterns that leverage spatial reasoning.

A table of 10,000 numbers is noise. A scatter plot of the same data is insight.

---

## Why This Concept Exists

Visualization prevents silent failures:
- Data leakage invisible in metrics
- Class imbalance hidden by accuracy
- Skewed distributions missed by mean

Metrics aggregate. Visualization reveals.

---

## Practical Interpretation

**Anscombe's Quartet:** Four datasets with identical mean, variance, and correlation—but completely different patterns. Only visualization reveals the truth.

Always visualize before modeling.

---

# Matplotlib Basics

## Visual Classification
**No visual (text-only)** — Programming fundamentals topic

---

## Conceptual Intuition

Matplotlib is primitive by design. It gives full control over every element. Higher-level libraries hide these decisions.

**Hierarchy:**
- Figure: the canvas
- Axes: the coordinate system
- Plot elements: lines, bars, points

---

## Why This Concept Exists

The object-oriented interface (`fig, ax = plt.subplots()`) gives explicit control. The pyplot interface (`plt.plot()`) is convenient but limited.

Use object-oriented for production code.

---

## Practical Interpretation

**Plot type by question:**
- Line: trends over time
- Scatter: relationships between variables
- Bar: categorical comparisons
- Histogram: distribution shape

Choose plot based on what you're investigating.

---

# Seaborn Statistical Plots

## Visual Classification
**No visual (text-only)** — Programming fundamentals topic

---

## Conceptual Intuition

Matplotlib shows *how* to draw. Seaborn shows *what* to draw.

Seaborn expects DataFrames with semantic column names. Visualization becomes declarative: specify what varies, what is compared, what is grouped.

---

## Why This Concept Exists

Statistical defaults encode best practices:
- Distribution plots show spread and outliers
- Relationship plots add regression lines
- Heatmaps reveal correlations

---

## Practical Interpretation

```python
sns.histplot(df['column'], kde=True)   # Distribution
sns.regplot(x='x', y='y', data=df)     # Relationship
sns.boxplot(x='category', y='value', data=df)  # Comparison
sns.heatmap(df.corr(), annot=True)     # Correlation
```

Seaborn + Pandas = rapid exploratory analysis.

---

# Visualizing Model Results

## Visual Classification
**V1 Primitive:** `metric-dashboard` (P4) — for classification metrics
**V1 Primitive:** `fit-progression` (P2) — for regression diagnostics

---

## Conceptual Intuition

Metrics compress behavior into numbers. Visualization reveals behavior.

A model with 92% accuracy might fail completely on one class. Only visualization exposes this.

---

## Why This Concept Exists

**Regression diagnostics:**
- Predicted vs Actual: perfect predictions lie on diagonal
- Residual plot: reveals non-linearity, heteroscedasticity
- Residual distribution: checks for bias

**Classification diagnostics:**
- Confusion matrix: what the model confuses
- ROC curve: threshold-independent performance
- Precision-Recall: critical for imbalanced classes

---

[VISUAL INTUITION: METRIC_DASHBOARD]

## How to Read the Visual

The metric dashboard shows how threshold changes affect precision, recall, and the confusion matrix. High accuracy might coexist with class-specific failures visible only through this breakdown.

---

[VISUAL INTUITION: FIT_PROGRESSION]

## How to Read the Visual

In regression, observe the residual pattern. Random scatter means the model has captured the signal. Structured patterns (curves, funnel shapes) indicate missing features or wrong model form.

---

## Practical Interpretation

Never tune hyperparameters before visualizing failure modes. Understand *where* the model fails before trying to fix *how* it fails.

---

## Transition

With data manipulation and visualization complete, we are ready to build machine learning models systematically.
