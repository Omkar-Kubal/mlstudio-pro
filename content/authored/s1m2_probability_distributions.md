# Subject 1, Module 2: Probability & Distributions

---

# Random Variables & Probability Distributions

## Visual Classification
**V1 Primitive:** `distribution-evolution` (P1)

---

## Conceptual Intuition

A random variable is not "random" in the colloquial sense. It is a function that assigns numerical values to outcomes of a random process. When you roll a die, the *process* is random. The random variable *maps* faces to numbers (1, 2, 3, 4, 5, 6).

This distinction matters: randomness happens in the world; random variables translate it into mathematics.

**Discrete random variables** take countable values: dice rolls, number of clicks, class labels. We ask: "What is the probability of exactly this value?"

**Continuous random variables** take uncountably infinite values: height, time, loss. We cannot ask about exact values (the probability of being *exactly* 175.000... cm is zero). Instead, we ask about ranges: "What is the probability of being between 174 and 176 cm?"

---

## Why This Concept Exists

Random variables are the bridge between real-world uncertainty and mathematical analysis. Without them:
- We cannot define expected value (the target of optimization)
- We cannot quantify variance (the measure of uncertainty)
- We cannot construct loss functions (which assume probabilistic targets)

In ML, features are realizations of random variables. Labels are realizations of random variables. Model outputs are random variables. The entire learning process is reasoning about probability distributions.

---

[VISUAL INTUITION: DISTRIBUTION_EVOLUTION]

## How to Read the Visual

Observe how individual data points, initially appearing chaotic, accumulate into a recognizable shape. The histogram emerges from randomness, and eventually, a smooth distribution curve overlays the bars.

This is the central insight: randomness at the individual level becomes *structure* at the aggregate level. Probability distributions describe that structure.

---

## Formal Definitions

**Probability Mass Function (PMF)** — for discrete random variables:
$$P(X = x)$$
Gives the probability of each exact value.

**Probability Density Function (PDF)** — for continuous random variables:
$$f(x) \quad \text{where} \quad P(a \le X \le b) = \int_a^b f(x) \, dx$$
Gives density, not probability. Probability is the area under the curve.

**Expected Value:**
$$E[X] = \sum_x x \cdot P(X=x) \quad \text{(discrete)}$$
$$E[X] = \int x \cdot f(x) \, dx \quad \text{(continuous)}$$

**Variance:**
$$\text{Var}(X) = E[(X - E[X])^2] = E[X^2] - (E[X])^2$$

---

## Practical Interpretation

Expected value is what ML models optimize toward (minimize expected loss).

Variance measures model uncertainty and risk.

Common mistake: confusing density with probability. For continuous variables, $f(x) = 0.5$ does NOT mean 50% probability. It means that value is denser than values where $f(x) = 0.1$.

---

## Optional Code (Verification Only)

```python
import numpy as np

samples = np.random.normal(loc=0, scale=1, size=10000)
print("Sample mean:", np.mean(samples))
print("Sample variance:", np.var(samples))
```

---

## Transition

Now that we understand how probability distributions describe uncertainty, we can examine specific distributions that appear repeatedly in ML and nature.

---

# Common Probability Distributions

## Visual Classification
**V1 Primitive:** `distribution-evolution` (P1)

---

## Conceptual Intuition

Not all uncertainty looks the same. Some processes produce binary outcomes. Others produce counts. Others produce continuous measurements. Different distributions model different types of randomness.

**Bernoulli:** A single coin flip. Success (1) with probability $p$, failure (0) with probability $1-p$. This is the foundation of binary classification.

**Binomial:** Multiple independent coin flips. "Out of $n$ trials, how many successes?" This extends Bernoulli to counts.

**Normal (Gaussian):** The bell curve. Values cluster around the mean; extreme values are rare. It appears everywhere because of the **Central Limit Theorem**: when you add up many independent effects, the sum tends toward normal regardless of what the original effects looked like.

---

## Why This Concept Exists

Different distributions imply different assumptions and different loss functions:
- Bernoulli → cross-entropy loss (binary classification)
- Gaussian → mean squared error (regression with normal errors)
- Poisson → count data modeling

Choosing the wrong distribution family leads to misspecified models and biased predictions.

---

[VISUAL INTUITION: DISTRIBUTION_EVOLUTION]

## How to Read the Visual

Observe how different distribution shapes emerge:
- Binomial forms a discrete histogram that becomes more symmetric as $n$ increases
- Normal forms a smooth, symmetric bell
- As you change parameters ($p$, $n$, $\mu$, $\sigma$), the shape stretches, shifts, or skews

The Central Limit Theorem is visible: sample means from *any* distribution converge toward normal shape as sample size grows.

---

## Formal Definitions

**Bernoulli:**
$$P(X=1) = p, \quad P(X=0) = 1-p$$
$$E[X] = p, \quad \text{Var}(X) = p(1-p)$$

**Binomial:**
$$P(X=k) = \binom{n}{k} p^k (1-p)^{n-k}$$
$$E[X] = np, \quad \text{Var}(X) = np(1-p)$$

**Normal:**
$$f(x) = \frac{1}{\sigma\sqrt{2\pi}} e^{-\frac{(x-\mu)^2}{2\sigma^2}}$$
$$E[X] = \mu, \quad \text{Var}(X) = \sigma^2$$

---

## Practical Interpretation

Use Bernoulli/Binomial for:
- Binary classification targets
- Click-through rates, conversion metrics
- Any yes/no, success/failure outcomes

Use Normal for:
- Continuous targets with symmetric errors
- Measurement data
- When Central Limit Theorem applies (aggregated effects)

Warning: Normal assumption fails for heavy-tailed data (finance) or bounded data (proportions).

---

## Optional Code (Verification Only)

```python
import numpy as np

# Bernoulli: single binary trial
bernoulli_samples = np.random.binomial(1, 0.7, size=10)
print("Bernoulli samples:", bernoulli_samples)

# Binomial: sum of 20 Bernoulli trials
binomial_samples = np.random.binomial(20, 0.4, size=1000)
print("Binomial mean:", np.mean(binomial_samples))
```

---

## Transition

Probability becomes truly powerful when we condition on evidence—updating our beliefs based on what we observe.

---

# Conditional Probability & Bayes' Theorem

## Visual Classification
**No visual (text-only)** — Formula-centric topic (locked in registry)

---

## Conceptual Intuition

Most real questions are not about raw probabilities. They are conditional: "Given that X happened, how likely is Y?"

**Conditional probability** shrinks the universe. Instead of asking "How often does A happen in general?", we ask "How often does A happen *among cases where B is true*?"

This is the foundation of learning from data. We observe features (evidence), and we want to know the label (outcome). Classification is fundamentally computing $P(\text{label} | \text{features})$.

**Bayes' Theorem** tells us how to reverse conditional probabilities:

$$P(A|B) = \frac{P(B|A) \cdot P(A)}{P(B)}$$

This is belief updating:
- **Prior** $P(A)$: What we believed before seeing evidence
- **Likelihood** $P(B|A)$: How likely the evidence is if A is true
- **Posterior** $P(A|B)$: Updated belief after seeing evidence

---

## Why This Concept Exists

Bayes' Theorem explains:
- Why models output probabilities, not certainties
- Why predictions change with new data
- Why priors matter (rare disease + positive test ≠ high confidence)
- How spam filters, medical diagnosis, and recommendation systems work

Without conditional reasoning, ML would be impossible. Learning *is* conditioning on data.

---

## Formal Definitions

**Conditional Probability:**
$$P(A|B) = \frac{P(A \cap B)}{P(B)}$$

**Independence:**
Events A and B are independent if $P(A|B) = P(A)$, meaning B provides no information about A.

**Bayes' Theorem:**
$$P(A|B) = \frac{P(B|A) \cdot P(A)}{P(B)}$$

where $P(B) = P(B|A)P(A) + P(B|\neg A)P(\neg A)$ (Law of Total Probability).

---

## Practical Interpretation

The base rate fallacy is the most common mistake:
- A test is 95% accurate
- Disease affects 1% of population
- You test positive
- Probability you have the disease is NOT 95%

Calculation:
$$P(\text{disease}|\text{positive}) = \frac{0.95 \times 0.01}{0.95 \times 0.01 + 0.05 \times 0.99} \approx 16\%$$

Even accurate tests produce low confidence when priors are low.

---

## Optional Code (Verification Only)

```python
# Bayesian update for medical diagnosis
P_disease = 0.01
P_positive_given_disease = 0.95
P_positive_given_no_disease = 0.05

P_positive = (
    P_positive_given_disease * P_disease +
    P_positive_given_no_disease * (1 - P_disease)
)

P_disease_given_positive = (
    P_positive_given_disease * P_disease
) / P_positive

print(f"P(disease | positive test): {P_disease_given_positive:.4f}")
```

---

## Transition

Bayes' Theorem updates beliefs with evidence. But how do sample-based estimates improve with more data? The Law of Large Numbers provides the answer.

---

# Law of Large Numbers

## Visual Classification
**V1 Primitive:** `distribution-evolution` (P1)

---

## Conceptual Intuition

Flip a coin 10 times. You might get 7 heads. Flip it 1,000 times. You'll get close to 50% heads. Flip it 1,000,000 times. You'll get almost exactly 50%.

The **Law of Large Numbers** states: as sample size increases, the sample average converges to the true expected value.

This does NOT mean:
- Individual outcomes become predictable
- Randomness "balances out" in the short run
- Past outcomes affect future outcomes

It DOES mean:
- Aggregates stabilize
- Estimates improve with more data
- Long-run averages are reliable

---

## Why This Concept Exists

LLN is why machine learning works:
- More training data → better generalization
- Validation metrics stabilize with larger held-out sets
- Stochastic gradient descent converges (average gradient → true gradient)
- Ensemble methods average away noise

Without LLN, learning from finite samples would be theoretically unjustified.

---

[VISUAL INTUITION: DISTRIBUTION_EVOLUTION]

## How to Read the Visual

Observe how the distribution shape becomes more stable and well-defined as sample size increases. With few samples, the histogram is jagged and noisy. With many samples, it smooths into the true underlying distribution.

This convergence is the visual proof of LLN: randomness at the individual level becomes predictable structure at the aggregate level.

---

## Formal Definitions

**Formal Statement:**
Let $X_1, X_2, \ldots, X_n$ be independent, identically distributed (i.i.d.) random variables with expected value $\mu$.

Then:
$$\bar{X}_n = \frac{1}{n} \sum_{i=1}^{n} X_i \xrightarrow{n \to \infty} \mu$$

The sample mean converges to the population mean as $n$ grows.

---

## Practical Interpretation

LLN explains:
- Why early training metrics fluctuate wildly
- Why small A/B tests are unreliable
- Why you need sufficient data before making decisions
- Why overfitting happens with small samples (noise dominates signal)

Rule of thumb: distrust estimates from small samples. Patterns that appear in 10 observations may be noise. Patterns that persist in 10,000 are likely real.

---

## Optional Code (Verification Only)

```python
import numpy as np

samples = []
means = []

for i in range(1, 5001):
    samples.append(np.random.binomial(1, 0.7))
    means.append(np.mean(samples))

print("Final running mean:", means[-1])
print("True probability:", 0.7)
```

---

## Transition

With probability foundations complete, we can now move to the mathematical structures that underlie all ML computation: vectors, matrices, and the geometry of high-dimensional spaces.

---

# Scalars, Vectors & Spaces

## Visual Classification
**No visual (text-only)** — Linear algebra introduction

---

## Conceptual Intuition

Machine learning is not about equations—it is about geometry.

Every dataset lives in a space. Every row is a point. Every model defines a surface that separates or approximates those points. Learning is movement through this space, searching for the best surface.

**Scalar:** A single number. Learning rate, bias term, loss value. Scalars control magnitude, not direction.

**Vector:** An ordered list of numbers. Each row in your dataset is a vector. A vector has both magnitude (length) and direction. In ML, direction often matters more than magnitude (hence normalization).

**Space:** The set of all possible vectors of a given dimension. A dataset with 100 features lives in 100-dimensional space. You cannot visualize it, but the math works the same as in 2D or 3D.

---

## Why This Concept Exists

Understanding spaces explains:
- Why feature engineering changes model behavior (you're reshaping the space)
- Why high-dimensional data is sparse (curse of dimensionality)
- Why distance metrics matter (KNN, SVM, clustering)
- Why neural networks are "universal approximators" (they can carve up any space)

Every ML algorithm operates geometrically, whether you see it or not.

---

## Formal Definitions

**Scalar:** A single real number $c \in \mathbb{R}$.

**Vector:** An ordered tuple $\mathbf{x} = [x_1, x_2, \ldots, x_n] \in \mathbb{R}^n$.

**Magnitude (Norm):**
$$||\mathbf{x}||_2 = \sqrt{\sum_{i=1}^{n} x_i^2}$$

**Vector Space:** A set $V$ where:
- Vectors can be added: $\mathbf{u} + \mathbf{v} \in V$
- Vectors can be scaled: $c \cdot \mathbf{v} \in V$
- These operations satisfy standard properties (commutativity, associativity, etc.)

---

## Practical Interpretation

In practice:
- A 4-column dataset has 4-dimensional vectors
- A 768-dimension transformer embedding lives in 768D space
- Similar points are close (small distance); different points are far

High dimensionality creates challenges:
- Most volume is near the surface (not center)
- Random points are nearly orthogonal
- Data becomes sparse

This is why dimensionality reduction (PCA, t-SNE) and careful feature selection matter.

---

## Optional Code (Verification Only)

```python
import numpy as np

x = np.array([2, 3])
print("Vector:", x)
print("Magnitude:", np.linalg.norm(x))
```

---

## Transition

With vectors and spaces defined, we can now explore operations on vectors—addition, scaling, dot products—that form the computational backbone of machine learning.
