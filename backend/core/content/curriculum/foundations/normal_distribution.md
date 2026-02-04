# Normal Distribution

## Visual Classification
**V1 Primitive:** `distribution-evolution` (P1)

---

## Lesson Content

### The Bell Curve

In nature and society, one shape appears more often than any other: the **Normal Distribution** (or Gaussian distribution). You've seen it as the "bell curve."

It appears in:
- Heights of adults
- Errors in measurement
- IQ scores
- Blood pressure

Why is it so common? Because of the **Central Limit Theorem** (which we'll cover later). Essentially, when you add up many small, independent random factors, the result tends to look like this bell shape.

### Properties of Normality

The normal distribution is the "perfect" distribution in statistics:
1. **Symmetric:** The left side mirrors the right side.
2. **Unimodal:** It has a single peak in the exact center.
3. **Coincidence:** Mean = Median = Mode.
4. **Asymptotic:** The tails get closer and closer to the axis but never touch it (theoretical probability never hits zero).

[VISUAL INTUITION: DISTRIBUTION_EVOLUTION]

Observe the classic bell shape. Notice that most of the "mass" (the area under the curve) is clustered around the center. As you move away from the mean, the probability drops off sharply. This is why "average" people are common, and extremely tall or short people are rare.

### Parameters

A normal distribution is defined by just two numbers:
1. **Mean ($\mu$):** Where the peak is. Shifting $\mu$ slides the whole curve left or right.
2. **Standard Deviation ($\sigma$):** How wide the bell is. Increasing $\sigma$ flattens the curve; decreasing it makes the peak sharper.

### Standard Normal Distribution ($Z$)

If we shift the mean to 0 and scale the standard deviation to 1, we get the **Standard Normal Distribution**. We can convert any normal variable $x$ to a standard score ($z$) using:

$$ z = \frac{x - \mu}{\sigma} $$

This $z$-score tells you how many standard deviations a value is from the mean.

### Why It Matters for ML

Many machine learning algorithms (Linear Regression, Gaussian Naive Bayes, etc.) explicitly assume that the input data or the errors are normally distributed. If your data isn't normal (e.g., highly skewed), these models may fail. This is why we often transform data (using log or power transforms) to make it "look more normal" before training.

### Formal Definition

 The probability density function (PDF) is:

$$ f(x) = \frac{1}{\sigma\sqrt{2\pi}} e^{ -\frac{1}{2}\left(\frac{x-\mu}{\sigma}\right)^2 } $$

Don't worry about memorizing the formula. Focus on the shape and the parameters $\mu$ and $\sigma$.

---

## Visual Justification

Using the distribution-evolution primitive here reinforces the link between the abstract "bell curve" concept and the dynamic behavior of data. Students can see that "Normal" is a specific state of symmetry and spread, distinguishable from the skewed states they saw in the previous lesson.
