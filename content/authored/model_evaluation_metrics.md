# Model Evaluation Metrics

## Visual Classification
**V1 Primitive:** `metric-dashboard` (P4)

---

## Lesson Content

### Beyond Accuracy

"Accuracy" seems like the obvious way to grade a model. If it gets 90% of predictions right, that's an A, right?

Not necessarily. Imagine a test for a rare disease that affects 1% of the population. A model that simply says "Nobody has the disease" will be 99% accurate—and 100% useless. It would miss every single actual case.

To truly judge performance, we need finer tools that understand the difference between a **False Alarm** (Type I Error) and a **Miss** (Type II Error).

### The Confusion Matrix

This is the scoreboard of classification. It breaks predictions into four buckets:
1. **True Positives (TP):** Correctly identified hits (e.g., Sick person flagged as Sick).
2. **True Negatives (TN):** Correctly identified rejections (e.g., Healthy person flagged as Healthy).
3. **False Positives (FP):** False alarms (e.g., Healthy person flagged as Sick).
4. **False Negatives (FN):** Misses (e.g., Sick person flagged as Healthy).

### Precision vs. Recall

These two metrics often trade off against each other:

- **Precision:** When the model claims it found a positive, how often is it right? (Quality of positives).
- **Recall:** Out of all the actual positives exists, how many did the model find? (Quantity of positives).

[VISUAL INTUITION: METRIC_DASHBOARD]

Observe the Confusion Matrix as you adjust the **Decision Threshold**.
- A low threshold catches everyone (High Recall) but creates many false alarms (Low Precision).
- A high threshold is very selective (High Precision) but misses many cases (Low Recall).

Watch the ROC Curve loop. The best models push into the top-left corner (High TPR, Low FPR). A diagonal line is no better than guessing.

### Choosing Your Metric

- **Use Recall** when missing a positive is expensive (e.g., cancer detection, fraud alerts). You accept false alarms to ensure safety.
- **Use Precision** when a false alarm is expensive (e.g., spam filter blocking real email). You'd rather let some spam through than delete a real message.
- **Use F1-Score** (the harmonic mean of Precision and Recall) when you need a balance.

### Formal Definitions

$$ \text{Accuracy} = \frac{TP + TN}{TP + TN + FP + FN} $$

$$ \text{Precision} = \frac{TP}{TP + FP} $$

$$ \text{Recall (Sensitivity)} = \frac{TP}{TP + FN} $$

$$ \text{F1} = 2 \cdot \frac{\text{Precision} \cdot \text{Recall}}{\text{Precision} + \text{Recall}} $$

---

## Visual Justification

The metric-dashboard primitive makes the abstract "threshold tradeoff" tangible. Instead of memorizing formulas, students see the numbers in the Confusion Matrix shift in real-time. It connects the "knob" (threshold) to the "dial" (metrics).
