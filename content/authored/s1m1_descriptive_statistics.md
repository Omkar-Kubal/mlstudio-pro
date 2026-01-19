# Subject 1, Module 1: Descriptive Statistics

---

# Descriptive Statistics Overview

## Visual Classification
**No visual (text-only)** — Conceptual foundation topic

---

## Conceptual Intuition

Before building machine learning models, before making predictions, before drawing conclusions—we need to *understand* our data. Descriptive statistics are the first lens we apply to raw information.

Think of descriptive statistics as a summary report. When you receive a dataset with thousands of rows, you cannot examine every number. Instead, you ask: What is the typical value? How spread out are the values? Are there unusual observations?

These questions are answered by three pillars:
1. **Distribution** — How are values arranged? Are most values clustered together or scattered?
2. **Central Tendency** — Where is the "center"? What is a typical value?
3. **Dispersion** — How much do values vary? Is the data tight or spread wide?

---

## Why This Concept Exists

Without descriptive statistics, data is noise. You cannot:
- Identify what "normal" looks like for your data
- Detect when something is wrong (outliers, errors)
- Choose appropriate models (linear vs. robust, parametric vs. non-parametric)
- Communicate findings to stakeholders

Every machine learning pipeline begins with exploratory data analysis (EDA), and EDA is built on descriptive statistics. If you skip this step, you build models on data you don't understand.

---

## Formal Definitions

**Mean (Arithmetic Average):**
$$\bar{x} = \frac{1}{n} \sum_{i=1}^{n} x_i$$

**Median:** The middle value when data is sorted.

**Mode:** The most frequently occurring value.

**Range:** $\text{max}(x) - \text{min}(x)$

**Variance:**
$$\sigma^2 = \frac{1}{n} \sum_{i=1}^{n} (x_i - \bar{x})^2$$

**Standard Deviation:** $\sigma = \sqrt{\sigma^2}$

---

## Practical Interpretation

Descriptive statistics work well when:
- Data is reasonably clean and complete
- You need a quick summary before deeper analysis
- You want to communicate data properties to non-technical audiences

They can mislead when:
- Outliers dominate (mean becomes unreliable)
- Data has multiple modes (single summary statistics hide structure)
- Distributions are highly skewed (symmetric assumptions fail)

---

## Optional Code (Verification Only)

The following code confirms that basic statistics can be computed quickly from data:

```python
import numpy as np
import pandas as pd

data = [2, 5, 7, 7, 10]
arr = np.array(data)

print("Mean:", np.mean(arr))
print("Median:", np.median(arr))
print("Standard Deviation:", np.std(arr, ddof=0))

series = pd.Series(data)
print("Mode(s):", list(series.mode()))
```

---

## Transition

Descriptive statistics summarize data from a single dataset. But most real-world analysis involves *samples*—subsets of a larger population. Understanding the distinction between population and sample is essential for valid inference.

---

# Population vs Sample

## Visual Classification
**V1 Primitive:** `distribution-evolution` (P1)

---

## Conceptual Intuition

In statistics, we rarely have access to complete information. When a company wants to know customer satisfaction, it cannot survey every customer who has ever purchased a product. When a medical researcher studies a drug's effectiveness, they cannot test it on every human.

What we have is a **sample**—a subset of the larger **population** we care about.

The population is the complete set of all possible observations. The sample is what we actually measure. The goal of statistics is to use the sample to make statements about the population.

This distinction is not just academic. It is the foundation of generalization in machine learning. Your training data is a sample. The real world is the population. If your sample is biased, your model inherits that bias.

---

## Why This Concept Exists

Without understanding population vs. sample:
- You cannot reason about overfitting (fitting the sample, failing on the population)
- You cannot interpret train/test splits correctly
- You cannot understand why more data improves models
- You cannot build confidence intervals or conduct hypothesis tests

Every ML model's performance on unseen data depends on how well the training sample represents the true population.

---

[VISUAL INTUITION: DISTRIBUTION_EVOLUTION]

## How to Read the Visual

Observe how the shape of a distribution changes with sample size. With small samples, the histogram appears jagged and unstable—the "center" is hard to identify. As sample size increases, the distribution smooths out and converges toward a stable shape.

This convergence is the visual manifestation of the Law of Large Numbers: sample statistics approach population parameters as sample size grows.

---

## Formal Definitions

**Population parameter:** A fixed (but usually unknown) characteristic of the entire population, denoted with Greek letters (e.g., $\mu$ for population mean, $\sigma$ for population standard deviation).

**Sample statistic:** An estimate computed from observed data, denoted with Latin letters (e.g., $\bar{x}$ for sample mean, $s$ for sample standard deviation).

**Sampling error:** The difference between a sample statistic and the true population parameter, caused by random variation in which observations are included.

---

## Practical Interpretation

Population vs. sample matters most when:
- Sample size is small (high sampling error)
- Sample is not randomly selected (selection bias)
- You need to generalize beyond the observed data

In ML: if your training data comes from one demographic but your model is deployed to a different demographic, you have a population mismatch. This is why domain shift and data distribution are critical concerns.

---

## Optional Code (Verification Only)

```python
import numpy as np

np.random.seed(42)

# True population
population = np.random.normal(loc=50, scale=10, size=100000)
population_mean = population.mean()

sample_sizes = [10, 30, 100, 500]
sample_means = []

for size in sample_sizes:
    sample = np.random.choice(population, size=size)
    sample_means.append(sample.mean())

print("Population mean:", population_mean)
print("Sample means:", sample_means)
```

---

## Transition

Now that we understand the population/sample distinction, we can examine how different measures locate the "center" of data—and why no single measure is universally best.

---

# Measures of Central Tendency

## Visual Classification
**V1 Primitive:** `distribution-evolution` (P1)

---

## Conceptual Intuition

When summarizing data, the first question is: *Where is the center?* But "center" is not a single concept. There are multiple valid definitions, each capturing a different aspect of typicality.

The **mean** is the balance point—the value where the data would balance if placed on a seesaw. It accounts for every observation equally, which means outliers pull it strongly.

The **median** is the positional center—the value that splits the data into two equal halves. It ignores magnitude and cares only about order, making it robust to extreme values.

The **mode** is the most common value—the peak of the distribution. It answers "what happens most often?" rather than "where is the average?"

---

## Why This Concept Exists

Different centers answer different questions:
- Mean: What would we predict if we had to minimize squared error?
- Median: What would we predict if we had to minimize absolute error?
- Mode: What is the most likely observation?

In ML, regression models minimize error around the mean (MSE), robust regression aligns with the median (MAE), and classification frequency aligns with mode. Choosing the wrong center leads to biased predictions.

---

[VISUAL INTUITION: DISTRIBUTION_EVOLUTION]

## How to Read the Visual

In a symmetric distribution, mean, median, and mode coincide at the center. As the distribution becomes skewed, these measures separate:
- The mean follows the tail (pulled toward extreme values)
- The median stays planted near the bulk of the data
- The mode remains at the peak

This separation is visible in the changing relationship between the distribution's shape and its summary statistics.

---

## Formal Definitions

**Mean:**
$$\bar{x} = \frac{1}{n} \sum_{i=1}^{n} x_i$$

**Median:** For sorted data $x_{(1)}, x_{(2)}, \ldots, x_{(n)}$:
- If $n$ is odd: median = $x_{(n+1)/2}$
- If $n$ is even: median = $\frac{x_{n/2} + x_{n/2+1}}{2}$

**Mode:** The value(s) with highest frequency.

---

## Practical Interpretation

Use **mean** when:
- Data is symmetric
- You want to optimize squared error
- Every observation should contribute equally

Use **median** when:
- Data is skewed (income, prices, wait times)
- Outliers are present
- You want a robust, "typical" value

Use **mode** when:
- Data is categorical
- You want the most common outcome
- You're making a "most likely" prediction

---

## Optional Code (Verification Only)

```python
import numpy as np
import pandas as pd

data = [30, 32, 34, 35, 36, 100]  # includes outlier

arr = np.array(data)

print("Mean:", np.mean(arr))
print("Median:", np.median(arr))

series = pd.Series(arr)
print("Mode:", series.mode().values)
```

---

## Transition

Knowing the center is only half the story. Two datasets can have identical means but behave very differently. The next question is: *How spread out is the data?*

---

# Measures of Dispersion (Variance & Standard Deviation)

## Visual Classification
**V1 Primitive:** `distribution-evolution` (P1)

---

## Conceptual Intuition

Imagine two investment portfolios. Both have an average annual return of 10%. But one fluctuates between 8% and 12%, while the other swings from -20% to +40%. Same mean, completely different risk profiles.

**Dispersion** measures this spread—how much values deviate from the center. It quantifies uncertainty, variability, and risk.

The simplest measure is **range** (max minus min), but it tells you nothing about internal structure. A single outlier can make two very different datasets have the same range.

**Variance** measures the average squared deviation from the mean. Squaring ensures all deviations are positive and penalizes large deviations more heavily than small ones.

**Standard deviation** is the square root of variance, returning to the original units. It represents the "typical distance" from the mean.

---

## Why This Concept Exists

Dispersion directly affects ML behavior:
- High variance in features → unstable model predictions
- Low variance in targets → model has nothing to learn
- Feature scaling (normalization) is variance control
- Regularization penalizes high-variance models

Variance is also why Mean Squared Error (MSE) works: it's differentiable, and minimizing it naturally reduces spread of predictions around targets.

---

[VISUAL INTUITION: DISTRIBUTION_EVOLUTION]

## How to Read the Visual

Observe how two distributions can share the same center but differ dramatically in width. A tight, peaked distribution has low variance—values cluster near the mean. A flat, wide distribution has high variance—values are scattered.

The 68-95-99.7 rule for normal distributions: ~68% of data falls within 1 standard deviation, ~95% within 2, ~99.7% within 3.

---

## Formal Definitions

**Population Variance:**
$$\sigma^2 = \frac{1}{n} \sum_{i=1}^{n} (x_i - \mu)^2$$

**Sample Variance (Bessel's correction):**
$$s^2 = \frac{1}{n-1} \sum_{i=1}^{n} (x_i - \bar{x})^2$$

**Standard Deviation:**
$$\sigma = \sqrt{\sigma^2}$$

The $n-1$ denominator corrects for the tendency of samples to underestimate population variance.

---

## Practical Interpretation

Variance matters when:
- Comparing stability of different datasets
- Deciding on feature scaling for distance-based models
- Interpreting model uncertainty
- Controlling model complexity via regularization

It can mislead when:
- Outliers inflate variance artificially
- Data is heavily skewed (variance loses interpretability)
- Units are important (variance is in squared units)

---

## Optional Code (Verification Only)

```python
import numpy as np

data = [10, 12, 13, 15, 50]  # includes outlier

arr = np.array(data)

print("Mean:", np.mean(arr))
print("Variance:", np.var(arr))
print("Standard Deviation:", np.std(arr))
```

---

## Transition

Mean and variance describe center and spread, assuming the distribution is reasonably symmetric. But what if data leans to one side, or has unusually heavy tails? These shape characteristics—skewness and kurtosis—reveal additional structure.

---

# Skewness & Kurtosis

## Visual Classification
**V1 Primitive:** `distribution-evolution` (P1)

---

## Conceptual Intuition

Not all distributions are symmetric. Real-world data often "leans" to one side or has extreme values that occur more (or less) frequently than expected.

**Skewness** measures asymmetry. A right-skewed distribution has a long tail extending to high values (think income distribution—most people earn modest amounts, a few earn enormously). A left-skewed distribution has a long tail on the low end (think age at death in wealthy countries—most die old, few die young).

**Kurtosis** measures tail heaviness, not "peakedness" as commonly misunderstood. High kurtosis means extreme values (outliers) are more frequent than a normal distribution would predict. Low kurtosis means extremes are rare.

---

## Why This Concept Exists

Skewness and kurtosis affect ML in concrete ways:
- Skewed targets bias regression models toward the tail
- Heavy-tailed errors cause MSE to explode (MAE is more robust)
- Many statistical tests assume normality—skewed/heavy-tailed data violates this
- Log transformations reduce right-skewness, improving model behavior

Understanding shape helps you choose appropriate loss functions, preprocessing steps, and evaluation metrics.

---

[VISUAL INTUITION: DISTRIBUTION_EVOLUTION]

## How to Read the Visual

As a distribution becomes right-skewed, observe:
- The bulk of data stays left
- A long tail extends right
- Mean moves right of median

As kurtosis increases (heavy tails), observe:
- The center may remain similar
- Extreme values become more visible
- The "shoulder" regions thin out while tails extend

---

## Formal Definitions

**Skewness:**
$$\gamma_1 = \frac{\frac{1}{n} \sum_{i=1}^{n} (x_i - \bar{x})^3}{s^3}$$

- $\gamma_1 = 0$: symmetric
- $\gamma_1 > 0$: right-skewed
- $\gamma_1 < 0$: left-skewed

**Excess Kurtosis:**
$$\gamma_2 = \frac{\frac{1}{n} \sum_{i=1}^{n} (x_i - \bar{x})^4}{s^4} - 3$$

- $\gamma_2 = 0$: normal-like tails
- $\gamma_2 > 0$: heavy tails (leptokurtic)
- $\gamma_2 < 0$: light tails (platykurtic)

---

## Practical Interpretation

Shape awareness matters when:
- Choosing loss functions (MSE vs. MAE vs. Huber)
- Deciding on transformations (log, Box-Cox)
- Validating model assumptions (residual normality)
- Interpreting prediction errors

Common mistake: Assuming all data is symmetric. Always check distribution shape before applying standard techniques.

---

## Optional Code (Verification Only)

```python
import numpy as np
from scipy.stats import skew, kurtosis

data = np.random.lognormal(mean=0, sigma=1, size=1000)

print("Skewness:", skew(data))
print("Kurtosis:", kurtosis(data))  # excess kurtosis
```

---

## Transition

Even with complete information about center, spread, and shape, some individual observations may not fit the overall pattern. These outliers and anomalies require special attention.

---

# Outliers & Anomalies

## Visual Classification
**No visual (text-only)** — Detection methods topic

---

## Conceptual Intuition

Not all data points belong equally. Some observations are far from the rest—these are **outliers**. Some observations are unusual in context—these are **anomalies**.

An outlier is defined statistically: it lies far from the bulk of the data. An anomaly is defined contextually: it represents something unexpected given domain knowledge.

A salary of ₹10 crore is a statistical outlier (far from most salaries). A sudden 10x spike in website traffic is an anomaly (unexpected behavior, possibly an attack).

Outliers arise from:
- Measurement or data entry errors
- Rare but valid events (fraud, failures)
- Heavy-tailed distributions (natural variation)

**Critical insight:** Outliers are not always bad. Removing them blindly can destroy the most important signals in your data.

---

## Why This Concept Exists

Outliers have outsized impact on ML:
- Mean and variance are highly sensitive to extremes
- Distance-based models (KNN, SVM) amplify outlier effects
- Regression coefficients can be dominated by a few points
- MSE-based loss functions explode with large errors

Understanding outliers helps you decide: filter, transform, or model robustly.

---

## Formal Definitions

**IQR Method:**
- $Q_1$ = 25th percentile, $Q_3$ = 75th percentile
- $\text{IQR} = Q_3 - Q_1$
- Lower bound = $Q_1 - 1.5 \times \text{IQR}$
- Upper bound = $Q_3 + 1.5 \times \text{IQR}$
- Points outside these bounds are outliers

**Z-Score Method:**
$$z = \frac{x - \mu}{\sigma}$$
- $|z| > 3$ typically flags outliers
- Assumes approximately normal distribution

---

## Practical Interpretation

IQR method is robust and distribution-agnostic—use for general data.

Z-score method assumes normality—fails on skewed data.

For high-dimensional data, use:
- **Isolation Forest** — isolates anomalies by random partitioning
- **Local Outlier Factor (LOF)** — compares local density
- **DBSCAN** — clusters and labels noise

Strategy:
1. Understand why outliers exist before removing them
2. Consider robust alternatives (median instead of mean, MAE instead of MSE)
3. Document outlier handling decisions for reproducibility

---

## Optional Code (Verification Only)

```python
import numpy as np
import pandas as pd

data = pd.Series([10, 12, 13, 14, 15, 100])

Q1 = data.quantile(0.25)
Q3 = data.quantile(0.75)
IQR = Q3 - Q1

outliers = data[(data < Q1 - 1.5 * IQR) | (data > Q3 + 1.5 * IQR)]
print("Outliers detected:", outliers.values)
```

---

## Transition

With a solid foundation in descriptive statistics—center, spread, shape, and outliers—we are ready to move beyond description into inference: making statements about populations based on samples, and quantifying our uncertainty.
