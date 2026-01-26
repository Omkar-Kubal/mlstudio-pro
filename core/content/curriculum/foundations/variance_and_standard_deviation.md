# Variance and Standard Deviation

## Visual Classification
**V1 Primitive:** `distribution-evolution` (P1)

---

## Lesson Content

### Beyond the Center

Knowing the center of your data is only half the story. Two datasets can have the same mean but look completely different. What's missing? A measure of **spread**—how far data points typically stray from the center.

Imagine two classrooms. In both, the average test score is 75. But in one classroom, everyone scored between 70 and 80. In the other, scores ranged from 30 to 100. These are very different situations. The mean alone cannot distinguish them.

### Measuring Spread

**Variance:**  
The average of the squared distances from each data point to the mean. Squaring serves two purposes: it makes all differences positive, and it penalizes large deviations more heavily than small ones.

**Standard Deviation:**  
The square root of variance. This brings the measure back to the original units of the data, making it interpretable. If your data is in dollars, variance is in "dollars squared" (hard to interpret), but standard deviation is back in dollars.

### The Intuition

Think of standard deviation as the "typical distance" from the mean. If the standard deviation is 10, most data points fall within roughly 10 units of the mean. A small standard deviation means data clusters tightly around the center. A large standard deviation means data is spread out.

[VISUAL INTUITION: DISTRIBUTION_EVOLUTION]

As the distribution widens or narrows, observe how the spread changes. A tight, peaked distribution has low variance. A flat, wide distribution has high variance. The visual makes concrete what "spread" means—it's not just a number, it's the shape of the data.

### Why Squared Differences?

Why not just average the absolute differences? Squaring has mathematical advantages:
- It's differentiable everywhere (important for optimization)
- It relates directly to the geometry of least squares
- It connects to the normal distribution and many statistical theorems

However, alternatives exist. The **Mean Absolute Deviation (MAD)** uses absolute values instead of squaring and is more robust to outliers.

### The Empirical Rule

For data that follows a roughly bell-shaped (normal) distribution:
- About **68%** of data falls within 1 standard deviation of the mean
- About **95%** falls within 2 standard deviations
- About **99.7%** falls within 3 standard deviations

This is sometimes called the **68-95-99.7 rule** and provides a quick way to interpret standard deviation in practice.

### Formal Definitions

For a dataset with values $x_1, x_2, \ldots, x_n$ and mean $\bar{x}$:

**Population Variance:**
$$\sigma^2 = \frac{1}{n} \sum_{i=1}^{n} (x_i - \bar{x})^2$$

**Sample Variance (with Bessel's correction):**
$$s^2 = \frac{1}{n-1} \sum_{i=1}^{n} (x_i - \bar{x})^2$$

**Standard Deviation:**
$$\sigma = \sqrt{\sigma^2} \quad \text{or} \quad s = \sqrt{s^2}$$

The $n-1$ in sample variance corrects for the tendency of a sample to underestimate population variance.

---

## Visual Justification

The distribution-evolution primitive allows learners to see spread as a visual property—the width of the distribution—rather than an abstract number. As the shape changes, the connection between visual width and numerical variance becomes intuitive.
