# Subject 3: Data Preparation

---

# Module 1: Data Cleaning

---

# Missing Data Strategies

## Visual Classification
**No visual (text-only)** — Data preparation topic

---

## Conceptual Intuition

Missing data is not a bug—it's a signal. Values go missing because sensors fail, users skip fields, systems merge imperfectly, business rules change.

The question is not "how do I fill this gap?" but "what does this gap tell me?"

**Three types of missingness:**
- **MCAR (Completely At Random):** Rare. Safe to drop.
- **MAR (At Random):** Depends on observed variables. Common.
- **MNAR (Not At Random):** Depends on the missing value itself. Dangerous.

---

## Why This Concept Exists

Naive imputation (fill with mean) is dangerous:
- Assumes missing values are average
- Shrinks variance
- Distorts correlations
- Misleads models

Understanding missingness enables intentional handling.

---

## Practical Interpretation

**Strategies:**
1. **Drop** — only when MCAR, small fraction, large dataset
2. **Simple imputation** — mean/median preserves center, destroys variance
3. **Missingness indicator** — create `is_missing` column (often boosts performance!)
4. **Conditional imputation** — impute within groups
5. **Model-based** — KNN, MICE for multivariate structure

---

## Optional Code (Verification Only)

```python
import pandas as pd
import numpy as np

df = pd.DataFrame({'age': [25, np.nan, 30], 'income': [50000, 60000, np.nan]})

# Check missing
print(df.isna().sum())

# Missingness indicator
df['income_missing'] = df['income'].isna().astype(int)

# Median imputation
df['income'] = df['income'].fillna(df['income'].median())
```

---

## Transition

Missing data is one form of data quality issue. Duplicate data is another—and equally dangerous.

---

# Duplicate Data

## Visual Classification
**No visual (text-only)** — Data preparation topic

---

## Conceptual Intuition

Duplicate data doesn't just waste space—it changes reality.

Duplicates inflate frequencies, bias statistics, distort class balance, skew model learning, and create false confidence.

**Types:**
- **Exact duplicates:** Identical across all columns. Easy to detect.
- **Logical duplicates:** Same entity, slight differences. Harder to detect.
- **Partial duplicates:** Subset of columns match. Context determines validity.

---

## Why This Concept Exists

Duplicates cause:
- Statistical distortion (mean shifts, variance shrinks)
- Model bias (overfitting to repeated samples)
- Evaluation leakage (train-test contamination)

Always deduplicate before splitting data.

---

## Practical Interpretation

```python
df.duplicated()                    # Exact duplicates
df.duplicated(subset=['key'])      # By specific column
df.drop_duplicates(keep='first')   # Remove duplicates
```

Always inspect before dropping. Some "duplicates" are valid repeated observations.

---

## Transition

Clean data is the foundation. The next step is transforming raw data into signals a model can learn from.

---

# Module 2: Feature Engineering

---

# Categorical Encoding

## Visual Classification
**No visual (text-only)** — Data preparation topic

---

## Conceptual Intuition

Categories have no inherent order, are not numeric, and can have high cardinality. Models require numbers—encoding is unavoidable.

**One-Hot:** Color=Red → [1,0,0]. No false ordering. But explodes dimensionality.

**Ordinal:** Low→1, Medium→2, High→3. Implies distance. Only valid when order is meaningful.

**Target Encoding:** Encode by target statistics (e.g., City → average income). Powerful but severe leakage risk.

---

## Why This Concept Exists

Wrong encoding creates spurious patterns:
- Ordinal encoding on unordered categories implies false relationships
- One-hot on high-cardinality explodes feature space
- Target encoding without cross-validation leaks test information

---

## Practical Interpretation

**Use One-Hot when:**
- Few categories
- Linear models
- Interpretability matters

**Use Target Encoding when:**
- High cardinality
- Tree-based models
- Proper cross-validation is applied

---

# Feature Scaling

## Visual Classification
**No visual (text-only)** — Data preparation topic

---

## Conceptual Intuition

Many models assume comparable feature ranges. Without scaling, large-magnitude features dominate and optimization becomes unstable.

**Standardization (Z-score):** $(x - \mu) / \sigma$ → Centers at 0, unit variance.

**Min-Max:** $(x - min) / (max - min)$ → Maps to [0,1]. Sensitive to outliers.

**Robust:** Uses median and IQR. Best with outliers.

---

## Why This Concept Exists

**Models that need scaling:**
- Linear/Logistic Regression
- KNN, SVM
- Neural Networks

**Models that don't:**
- Tree-based (random forest, XGBoost)

Scaling is numerical protection, not just cosmetic normalization.

---

# Polynomial Features

## Visual Classification
**V1 Primitive:** `fit-progression` (P2) — shows linear vs polynomial fit

---

## Conceptual Intuition

Linear models assume $y = ax + b$. Reality often involves curvature.

Polynomial expansion creates new features: $x \to x, x^2, x^3$ and interactions $x_1 \cdot x_2$.

This gives simple models more power—at the cost of feature explosion.

---

[VISUAL INTUITION: FIT_PROGRESSION]

## How to Read the Visual

Observe how increasing polynomial degree improves fit on curved data:
- Degree 1 (linear) underfits curves
- Degree 2-3 captures curvature
- High degrees overfit, passing through every point

The visual demonstrates the bias-variance tradeoff directly applied to feature construction.

---

## Practical Interpretation

**Use polynomial features when:**
- Data is small
- Relationship is smooth
- Model must stay simple (linear regression)

**Avoid when:**
- High dimensionality already
- Noisy data (polynomials amplify noise)

---

# Feature Selection

## Visual Classification
**No visual (text-only)** — Data preparation topic

---

## Conceptual Intuition

Too many features cause overfitting, noise amplification, slower training, and reduced interpretability.

Feature selection is signal isolation.

**Filter Methods:** Use statistics (correlation, variance). Fast, model-agnostic.

**Wrapper Methods:** Evaluate subsets with a model (RFE). Accurate but expensive.

**Embedded Methods:** Selection during training (L1, tree importance). Best balance.

---

## Why This Concept Exists

More features ≠ better. Irrelevant features add noise. Correlated features cause instability.

Feature selection removes; feature engineering creates. They complement each other.

---

# Domain-Driven Features

## Visual Classification
**No visual (text-only)** — Data preparation topic

---

## Conceptual Intuition

Domain features encode causality, reduce noise, and improve generalization.

**Examples:**
- Ratios: price per square foot, click-through rate
- Time features: hour of day, day of week, seasonality
- Aggregations: mean per user, count per session

These encode history and context that raw features miss.

---

## Why This Concept Exists

Models learn patterns, not causality. Domain features inject human knowledge that guides learning in the right direction.

**Leakage warning:** If a feature uses future information or target indirectly, model performance becomes invalid. Always ask: "Would this exist at prediction time?"

---

## Optional Code (Verification Only)

```python
import pandas as pd

df['hour'] = df['timestamp'].dt.hour
df['is_weekend'] = df['timestamp'].dt.dayofweek.isin([5,6]).astype(int)
df['user_mean'] = df.groupby('user_id')['value'].transform('mean')
```

---

## Transition

With data cleaned and features engineered, we are ready to build and train machine learning models.
