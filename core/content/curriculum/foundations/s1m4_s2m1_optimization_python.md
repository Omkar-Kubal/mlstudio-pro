# Subject 1, Module 4: Optimization Fundamentals

---

# Gradient Descent

## Visual Classification
**Static visual** — Loss landscape diagram (V2 topic foundation)

---

## Conceptual Intuition

Training a machine learning model is an optimization problem. We have a function (the loss) that measures how wrong our predictions are. Training means finding the parameters that minimize this loss.

But how do you find the bottom of a valley when you can't see the entire landscape? You feel the slope beneath your feet and walk downhill.

**Gradient descent** is this strategy: at each step, compute the direction of steepest increase (the gradient), then move in the *opposite* direction. Repeat until you stop improving.

---

## Why This Concept Exists

Gradient descent is *the* algorithm that makes neural networks possible:
- Closed-form solutions don't exist for complex models
- Millions of parameters cannot be tuned manually
- The gradient tells us which direction improves the loss

Every optimizer—SGD, Adam, RMSprop—is a variant of gradient descent.

---

## Formal Definitions

**Gradient:**
For a function $L(\mathbf{w})$, the gradient is:
$$\nabla L = \left[ \frac{\partial L}{\partial w_1}, \frac{\partial L}{\partial w_2}, \ldots, \frac{\partial L}{\partial w_n} \right]$$

It points in the direction of steepest *increase*.

**Update Rule:**
$$\mathbf{w}_{t+1} = \mathbf{w}_t - \eta \nabla L(\mathbf{w}_t)$$

where $\eta$ is the **learning rate**.

**Interpretations:**
- Small learning rate → slow convergence but stable
- Large learning rate → fast but may overshoot or diverge
- Just right → smooth convergence to minimum

---

## Practical Interpretation

**Variants:**
- **Batch GD:** Use entire dataset per update (accurate but slow)
- **Stochastic GD:** Use one sample per update (noisy but fast)
- **Mini-batch GD:** Use small batches (balanced tradeoff)

**Common issues:**
- Learning rate too high → loss oscillates or explodes
- Learning rate too low → training takes forever
- Stuck in local minima → use momentum or adaptive learning rates

---

## Optional Code (Verification Only)

```python
# Simplified gradient descent
learning_rate = 0.01
weights = np.random.randn(10)

for epoch in range(100):
    gradient = compute_gradient(weights, X, y)
    weights = weights - learning_rate * gradient
```

---

## Transition

With optimization fundamentals established, we can now turn to the tool that makes implementation practical: Python programming for data science.

---

# Subject 2, Module 1: Python Basics for Data Science

---

# Python Syntax for Data Science

## Visual Classification
**No visual (text-only)** — Programming fundamentals topic

---

## Conceptual Intuition

Python is the language of data science for a reason: it reads like pseudocode, integrates with scientific libraries, and matches the experimental workflow of data exploration.

Data science code follows a loop: observe → modify → test → reason → repeat. Python syntax supports this with interactive execution, readable structure, and minimal ceremony.

Three principles govern Python:
1. **Readability over brevity** — Code is read more than written
2. **Explicit over implicit** — No hidden behaviors
3. **Indentation defines logic** — Structure is visible

---

## Why This Concept Exists

In data science:
- You revisit experiments months later
- You collaborate with others who read your code
- You debug models by tracing data flow

Clean, readable syntax prevents subtle bugs that corrupt experiments.

---

## Practical Interpretation

Python is **dynamically typed** — no type declarations. This gives flexibility but requires discipline. Type errors appear at runtime, not compile time.

**Indentation matters.** A wrong indent can silently skip training, break evaluation, or leak data. Python enforces structure through whitespace.

Variables are **bindings to objects**, not boxes. This matters for mutability: modifying a list in one place affects all references to it.

---

## Optional Code (Verification Only)

```python
n_samples = 100
mean = total / n_samples

if mean > 0:
    status = "positive"
else:
    status = "negative"
```

---

## Transition

Python syntax is the surface. The real power lies in understanding Python's data types and structures.

---

# Data Types and Data Structures

## Visual Classification
**No visual (text-only)** — Programming fundamentals topic

---

## Conceptual Intuition

Most bugs in data science are data bugs, not algorithm bugs. Understanding data types answers:
- What operations are valid?
- What is mutable vs immutable?
- What gets copied vs referenced?
- What will scale and what will break?

**Primitives:** int (exact), float (approximate), bool (logic), str (text/labels).

**Containers:** list (ordered, mutable), tuple (ordered, immutable), dict (key-value), set (unique elements).

---

## Why This Concept Exists

Mutability causes silent bugs:
- `b = a` creates a reference, not a copy
- Modifying `b` changes `a` if both point to the same list
- This can leak test data into training or corrupt datasets

Understanding references prevents data corruption.

---

## Formal Definitions

**Immutable types:** int, float, str, tuple — cannot be changed after creation.

**Mutable types:** list, dict, set — can be modified in place.

**Shallow copy:** `b = a.copy()` — creates new container, same elements.

**Deep copy:** `b = copy.deepcopy(a)` — creates new container AND new elements (for nested structures).

---

## Practical Interpretation

Float imprecision: `0.1 + 0.2 != 0.3` due to binary representation. Use `np.isclose()` for comparisons.

Dict keys must be hashable (immutable). Lists cannot be dict keys.

For numerical work, use NumPy arrays, not Python lists. Lists are flexible but slow for large data.

---

## Optional Code (Verification Only)

```python
# Reference pitfall
a = [1, 2, 3]
b = a           # b references same object
b.append(4)
print(a)        # [1, 2, 3, 4] — a changed too!

# Correct approach
b = a.copy()    # b is independent
```

---

## Transition

Data structures store information. Control flow decides what happens to that information.

---

# Control Flow

## Visual Classification
**No visual (text-only)** — Programming fundamentals topic

---

## Conceptual Intuition

Data science is making decisions based on data.
- Which rows do we keep?
- Which branch of logic applies?
- How do we process datasets step by step?

**Conditionals (if/elif/else)** express rules: filtering, thresholds, categorization.

**For loops** iterate over collections: processing rows, applying transformations.

**While loops** implement convergence: training until loss stops improving.

---

## Why This Concept Exists

Every data pipeline makes decisions:
- Skip missing values
- Apply different preprocessing to different groups
- Stop training when validation loss plateaus

Control flow encodes this logic explicitly.

---

## Practical Interpretation

**Truthiness:** In Python, `0`, `0.0`, `""`, `[]`, `{}`, `None` are all "falsy." Non-empty containers and non-zero numbers are "truthy."

```python
if data:  # True if data is non-empty
    process(data)
```

**Loop control:**
- `break` — exit loop entirely
- `continue` — skip to next iteration
- `pass` — placeholder (do nothing)

Later, NumPy and Pandas replace explicit loops with vectorized operations for performance. The logic remains identical.

---

## Optional Code (Verification Only)

```python
for row in dataset:
    if row["age"] is None:
        continue  # Skip missing
    if row["age"] > 60:
        group = "senior"
    else:
        group = "adult"
```

---

## Transition

Control flow handles individual decisions. Functions package decisions into reusable units.

---

# Functions and Modules

## Visual Classification
**No visual (text-only)** — Programming fundamentals topic

---

## Conceptual Intuition

Data science code is rarely written once. You clean data repeatedly, re-run experiments, tune parameters, compare results.

**Functions** encapsulate logic:
- Prevent repetition
- Enable testing
- Make pipelines composable

A function is a named transformation: inputs → outputs with isolated logic.

---

## Why This Concept Exists

Without functions:
- Pipelines become fragile
- Experiments are irreproducible
- Bugs multiply silently

Functions make assumptions explicit and logic testable.

---

## Formal Definitions

**Pure function:** No side effects, same input → same output. Easy to test and reason about.

**Impure function:** Modifies external state (files, global variables, mutable inputs). Harder to debug.

**Default arguments:** Provide controlled flexibility (e.g., `learning_rate=0.01`).

**Modules:** Files containing functions. Organize code by responsibility (preprocessing.py, models.py, metrics.py).

---

## Practical Interpretation

**Danger:** Mutable default arguments persist between calls.

```python
# Bug: default list is shared
def append(item, items=[]):
    items.append(item)
    return items

# Solution: use None
def append(item, items=None):
    if items is None:
        items = []
    items.append(item)
    return items
```

Structure code as pipelines: `load_data() → clean() → train() → evaluate()`. Each step is independent and replaceable.

---

## Transition

Functions handle expected behavior. Error handling manages unexpected conditions.

---

# Error Handling

## Visual Classification
**No visual (text-only)** — Programming fundamentals topic

---

## Conceptual Intuition

In data science, errors are *expected*. Data is incomplete, messy, inconsistent.

Error handling answers:
- What happens when assumptions break?
- How do we fail safely instead of silently?

Exceptions are signals, not failures. They indicate broken assumptions that require response.

---

## Why This Concept Exists

Silent failures are worse than crashes:
- Models trained on corrupted data
- Metrics computed on wrong samples
- Results that look correct but aren't

Good error handling makes failures visible and intentional.

---

## Practical Interpretation

**try/except** provides controlled failure:

```python
try:
    value = int(user_input)
except ValueError:
    value = None
```

**Avoid broad exception handling:**

```python
# BAD: hides all errors
except:
    pass

# GOOD: handle specific cases
except ValueError:
    handle_invalid_value()
```

**Raise custom errors** to make assumptions explicit:

```python
if df.empty:
    raise ValueError("Dataset is empty")
```

---

## Transition

Error handling protects against failures. Clean code practices prevent them in the first place.

---

# Writing Clean, Maintainable Code

## Visual Classification
**No visual (text-only)** — Programming fundamentals topic

---

## Conceptual Intuition

Data science code is:
- Iterative and experimental
- Revisited months later
- Read by collaborators

Clean code is about **trust**. If you can't trust the code, you can't trust the results.

---

## Why This Concept Exists

Working code answers one question once. Clean code answers many questions repeatedly.

Bad names hide assumptions. Magic numbers obscure thresholds. Monolithic functions resist debugging.

---

## Practical Interpretation

**Naming:** Prefer `average_age = total_age / num_people` over `a = t / n`.

**Constants:** Use `THRESHOLD = 0.73` instead of hardcoding `0.73`.

**Single responsibility:** One function = one task. If you can't explain it in one sentence, split it.

**Reproducibility:**
- Set random seeds: `np.random.seed(42)`
- Use explicit parameters
- Avoid hidden state

**Comments:** Explain *why*, not *what*. Code shows what; comments show intent.

---

## Optional Code (Verification Only)

```python
# Bad
if s > 0.73:
    l = 1

# Good
THRESHOLD = 0.73
if prediction_score > THRESHOLD:
    label = 1
```

---

## Transition

With Python fundamentals established, we can now explore the libraries that power data science: NumPy for numerical computing and Pandas for data manipulation.
