# Measures of Central Tendency

## Visual Classification
**V1 Primitive:** `distribution-evolution` (P1)

---

## Lesson Content

### What Does "Typical" Mean?

When we look at a collection of numbers—exam scores, house prices, daily temperatures—we often want a single value that represents the "center" of that data. This idea of finding a central, typical value is what **measures of central tendency** capture.

But here's the interesting question: different measures give different answers. And which one is "correct" depends on what you're trying to understand.

### Three Ways to Find the Center

**Mean (Average):**  
Add all values together, divide by how many there are. The mean treats every data point equally. It's the balance point of the data—if you placed weights on a seesaw at each data value, the mean is where the seesaw would balance.

**Median:**  
Sort all values from smallest to largest, then pick the one in the middle. The median ignores how far away extreme values are—it only cares about position. Half the data falls below it, half above.

**Mode:**  
The most frequently occurring value. In some datasets, one value appears more often than others. That's the mode.

### When They Disagree

In a perfectly symmetric distribution, mean, median, and mode all land on the same point. But real data is rarely perfect.

Consider incomes in a city. Most people earn modest amounts, but a few earn millions. Those extreme high values pull the mean upward, making it higher than what most people actually earn. The median, however, stays planted in the middle—unaffected by how large the largest incomes are.

[VISUAL INTUITION: DISTRIBUTION_EVOLUTION]

As the shape of the distribution changes, watch how the mean and median respond differently. When the data is symmetric, they agree. When it becomes skewed—when one tail stretches longer than the other—they separate. The mean chases the tail; the median holds its ground.

### Choosing the Right Measure

There is no universally "best" measure. The choice depends on your question:

- **Mean** is best when data is symmetric and you want to account for every value.
- **Median** is best when outliers exist or when you want a measure robust to extremes.
- **Mode** is useful for categorical data or when the most common value matters (e.g., the most popular shoe size).

### Formal Definitions

For a dataset with values $x_1, x_2, \ldots, x_n$:

$$\text{Mean} = \bar{x} = \frac{1}{n} \sum_{i=1}^{n} x_i$$

$$\text{Median} = \begin{cases} x_{(n+1)/2} & \text{if } n \text{ is odd} \\ \frac{x_{n/2} + x_{n/2+1}}{2} & \text{if } n \text{ is even} \end{cases}$$

The mode is the value $x$ that maximizes the frequency $f(x)$.

---

## Visual Justification

The distribution-evolution primitive shows how mean and median respond differently to distribution shape. As skewness changes, learners directly observe the divergence between these measures—building intuition about when each is appropriate.
