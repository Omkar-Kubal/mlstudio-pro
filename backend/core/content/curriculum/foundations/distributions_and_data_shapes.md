# Distributions and Data Shapes

## Visual Classification
**V1 Primitive:** `distribution-evolution` (P1)

---

## Lesson Content

### The Shape of Data

A single number (mean) tells you where the center is. Another (variance) tells you how spread out it is. But to really understand data, you need to see its **shape**.

Most real-world data isn't perfectly symmetric. It leans, it peaks, it stretches. These shapes tell stories about the underlying processes generating determining the data.

### Common Shapes

**Symmetric (Bell-shaped):**  
The classic curve where the left and right sides are mirror images. The mean and median are in the center. This often happens when data comes from the sum of many small independent effects (like height or test scores).

**Skewed Right (Positive Skew):**  
The "long tail" is on the right side. This happens when there's a lower bound (often zero) but no upper bound. Think of wealth distribution, call center wait times, or insurance claims. Most values are small, but a few massive outliers pull the tail to the right.

**Skewed Left (Negative Skew):**  
The "long tail" points to the left. This is rarer but happens when there's a strict upper limit. Think of age at death in developed countries (most are old, a few are young) or test scores on a very easy exam (most get 100%, a few fail).

**Bimodal:**  
Two distinct peaks. This suggests you might be looking at two different groups mixed together—like height data for men and women combined.

[VISUAL INTUITION: DISTRIBUTION_EVOLUTION]

### Interpreting Skewness

As you watch the distribution change from symmetric to skewed:
- **Notice the tail:** Skewness is defined by the direction of the *tail*, not the peak.
- **Watch the mean:** In a right-skewed distribution, the mean is pulled to the right so $\text{Mean} > \text{Median}$.
- **Watch the median:** It resists the pull of outliers.

### Why Shape Matters

Assuming data is symmetric when it's heavily skewed is a common error in data science.
- If you use the mean for skewed data (like average house price), you overestimate the "typical" case.
- Many statistical tests (like t-tests) assume normality (symmetry). Applying them to skewed data yields invalid p-values.
- In machine learning, training models on skewed targets without transformation (like log-scaling) can lead to poor performance on the minority "tail" cases.

### Formal Definitions

Skewness measures asymmetry:

$$ \text{Skewness} = \frac{\frac{1}{n} \sum_{i=1}^{n} (x_i - \bar{x})^3}{s^3} $$

- **Zero:** Symmetric
- **Positive:** Skewed Right
- **Negative:** Skewed Left

Kurtosis measures "tailedness" (how extreme the outliers are compared to a normal distribution).

---

## Visual Justification

The distribution-evolution primitive is the canonical tool for this topic. It allows students to visually define "skewness" by seeing the mass shift and the tail extend, rather than just memorizing definitions. It reinforces why mean/median diverge.
