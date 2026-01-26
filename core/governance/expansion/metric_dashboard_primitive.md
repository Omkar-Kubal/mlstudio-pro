# PRIMITIVE SPEC: Metric Dashboard

**Status:** DESIGN_APPROVED  
**Type:** Visual Primitive (Theory-Grade)  
**Context:** Foundational reusable component for Classification Evaluation, Threshold Tuning, Imbalanced Datasets, Model Comparison

---

## 1. CORE CONCEPT

**Intuition Built:**
Evaluation metrics are not independent numbers—they are **coupled values on a seesaw**. Moving the decision threshold doesn't improve your model; it *reallocates* errors between false positives and false negatives. Every gain in one metric comes at a cost to another.

**Misconception Fixed:**
*"I'll just maximize accuracy."*
(Users don't realize accuracy hides class imbalance. A 99% accuracy on a 99/1 class split is meaningless. This primitive forces users to see the **tradeoff surface**, not a single score.)

**Why Visual?**
- Text says "precision-recall tradeoff."
- The Primitive shows the ROC/PR curve with a **draggable point** on it—as you slide, the confusion matrix cells *animate* their counts in real-time.
- Text says "threshold = 0.5."
- The Primitive shows a vertical line on a score distribution, and users *feel* how sliding it changes who gets classified as positive.

---

## 2. INPUT / CONTROL MODEL

### Primary Control (Scalar Slider)
**"Decision Threshold"** (0.0 → 1.0)

| Position | Effect |
| :--- | :--- |
| Low (0.1) | Classify most as Positive → High Recall, Low Precision |
| Mid (0.5) | Balanced (default starting point) |
| High (0.9) | Classify most as Negative → Low Recall, High Precision |

*Behavior:* Continuous. All metrics update in real-time as the slider moves. The point on the ROC/PR curve *slides along the curve* synchronously.

### Secondary Control (Discrete Toggle)
**"Curve View"** (Optional, max 1 toggle)

| Option A | Option B | Use Case |
| :--- | :--- | :--- |
| ROC Curve | Precision-Recall Curve | Show appropriate tradeoff for balanced vs imbalanced data |

### Tertiary Control (Read-Only Display)
**"Class Balance Indicator"**
- A small bar showing the ratio of Positive to Negative in the dataset.
- Not interactive—contextual information only.

---

## 3. OUTPUT VISUALS

This primitive is a **coordinated multi-panel display**. All panels respond to the same threshold slider.

### Panel A: Score Distribution (Left)
- **Content:** Two overlapping histograms (or density curves) showing the model's predicted probability scores for the Positive class (actual Positives in Color 1, actual Negatives in Color 2).
- **Threshold Line:** A vertical line at the current threshold value.
- **Motion:** As threshold moves, the line slides left/right. The area "captured" on each side visually represents TP, FP, TN, FN.
- **Purpose:** Shows *why* the threshold matters—where the distributions overlap is where errors happen.

### Panel B: Confusion Matrix (Center)
- **Content:** A 2×2 grid with cells: TP, FP, FN, TN.
- **Style:** Each cell is a colored square. Size or intensity encodes count.
- **Motion:** As threshold changes, cell values animate (numbers count up/down smoothly). Cell colors pulse briefly on significant change.
- **Labels:** Row = Actual, Column = Predicted. Clear "Positive/Negative" labels.
- **Purpose:** The concrete, countable consequence of the threshold choice.

### Panel C: Metric Gauges (Right Side)
- **Content:** 4-6 key metrics displayed as compact gauges or bars:
  - Accuracy
  - Precision
  - Recall (Sensitivity)
  - F1 Score
  - Specificity (optional)
  - AUC (static, does not change with threshold)
- **Style:** Horizontal fill bars or radial gauges.
- **Motion:** Bars grow/shrink smoothly as threshold changes.
- **Coupling Highlight:** When Precision increases and Recall decreases (or vice versa), use a subtle animation (e.g., one bar turning green, the other turning orange) to emphasize the tradeoff.
- **Purpose:** The summary view—shows the "headline" numbers that users often focus on.

### Panel D: ROC / PR Curve (Bottom or Overlay)
- **Content:** The curve itself (pre-computed, static shape).
- **Moving Point:** A draggable point on the curve representing the current threshold.
- **Sync:** Dragging the point on the curve updates the threshold slider (bidirectional binding).
- **Axes:** ROC: FPR (x) vs TPR (y). PR: Recall (x) vs Precision (y).
- **Reference Line:** ROC includes the diagonal "random guess" line. PR includes a horizontal line at the Positive class prevalence.
- **Purpose:** The geometric summary of all possible thresholds.

---

## 4. VISUAL STATES

### I. Balanced Threshold (Default Start)
- **Threshold:** 0.5
- **Confusion Matrix:** TP and TN are roughly similar; FP and FN are balanced.
- **Metrics:** Precision ≈ Recall; F1 is near its maximum.
- **Curve Point:** Near the "elbow" of the ROC curve (top-left) or PR curve peak.
- **User Feeling:** "This is a reasonable starting point."

### II. High Recall Mode (Low Threshold)
- **Threshold:** 0.1–0.3
- **Confusion Matrix:** TP is high; FP is also high. FN is very low.
- **Metrics:** Recall is high; Precision drops.
- **Curve Point:** Moves toward top-right on ROC (high TPR, high FPR).
- **User Feeling:** "I'm catching everyone, but with many false alarms."

### III. High Precision Mode (High Threshold)
- **Threshold:** 0.7–0.9
- **Confusion Matrix:** TP is low; FP is very low. FN is high.
- **Metrics:** Precision is high; Recall drops.
- **Curve Point:** Moves toward bottom-left on ROC (low TPR, low FPR).
- **User Feeling:** "I'm only flagging when I'm sure, but I'm missing a lot."

### IV. Class Imbalance Revealed
- **Trigger:** Dataset has 90/10 or more skewed class ratio.
- **Visual Cue:** The "Class Balance Indicator" bar is visibly lopsided.
- **Score Distribution:** The two histograms have very different heights/areas.
- **Accuracy Trap:** Accuracy stays high (~90%) even when threshold is extreme, but Precision/Recall swing wildly.
- **User Feeling:** "Accuracy is lying to me."

### V. Perfect Separation (Edge Case)
- **Condition:** Model scores perfectly separate classes (no overlap in score distribution).
- **Visual:** The two histograms don't touch. Any threshold in the gap achieves 100% on all metrics.
- **ROC Curve:** Goes straight to top-left corner.
- **User Feeling:** "This model is perfect—or the data is too easy."

### VI. Failure Modes (Do Not Show)
- **Never:** Allow metrics to show as "NaN" or "Infinity" (clamp at 0 or 1).
- **Never:** Let the threshold slider go outside [0, 1].
- **Never:** Display more than 6 metrics simultaneously (cognitive overload).
- **Never:** Auto-animate the threshold. User must drive it.

---

## 5. REUSE SCENARIOS (Implementation Matrix)

| Topic | Focus | Key Visual Emphasis |
| :--- | :--- | :--- |
| **Binary Classification** | Threshold tuning | All panels active; full tradeoff exploration. |
| **Imbalanced Datasets** | Class ratio awareness | Highlight Class Balance Indicator; show Accuracy trap. |
| **Model Comparison** | Side-by-side | Two ROC curves overlaid; AUC comparison. |
| **Medical/Fraud Detection** | High Recall priority | Start threshold low; emphasize FN cost. |
| **Spam Filtering** | High Precision priority | Start threshold high; emphasize FP cost. |
| **Threshold Selection** | Business rules | Annotate specific threshold points (e.g., "if FPR < 5%"). |
| **PR vs ROC Choice** | When to use which | Toggle between curves; explain skew behavior. |

---

## 6. GUARDRAILS

### Stability
- **Metric Smoothness:** Metrics update every frame (60fps ideal). No "jumping" numbers—use eased counting animation.
- **Curve Resolution:** ROC/PR curves have at least 100 points for smooth shapes.
- **Slider Debounce:** Not needed (metrics are cheap to compute). Allow instant feedback.

### Performance
- **Data Limit:** Max 10,000 predictions for real-time confusion matrix computation.
- **Histogram Bins:** 50 bins max for score distribution.
- **Fallback:** For large datasets, pre-compute confusion matrices at 20 discrete threshold levels and interpolate.

### Interactions
- **No Scroll-Jacking:** All animation is tied to the **Threshold Slider** or the **Curve Point drag**.
- **Bidirectional Binding:** Dragging the curve point updates the slider; moving the slider updates the curve point.
- **Hover:** Hovering over a confusion matrix cell shows the count and percentage.

### Accessibility
- **Reduced Motion:** Disable counting animations. Show instant updates.
- **Color Blind Safe:** Confusion matrix cells use shape (e.g., icons) + color. TP = checkmark, FP = X, etc.
- **Screen Reader:** Announce "Threshold: 0.X. Precision: Y. Recall: Z." on slider change.

---

## 7. PLACEHOLDER ↔ ANIMATION HANDOFF

### Loading State
- Skeleton confusion matrix (gray 2×2 grid).
- Skeleton curve (faint S-shape placeholder).
- Text: "Loading Metrics..."

### Static Fallback (No JS / Print View)
- Renders a **composite image**:
  - Confusion matrix at threshold = 0.5.
  - ROC curve with a dot marked at the operating point.
  - Table of metrics: Accuracy, Precision, Recall, F1, AUC.
- Caption: "Move the threshold slider to explore tradeoffs."

### Placeholder Text Mapping
When a content block contains `[VISUAL INTUITION: METRIC_DASHBOARD]`:
1. Load the Metric Dashboard primitive component.
2. Initialize with `threshold = 0.5`.
3. Use sample binary classification predictions (or context-provided data).

---

## 8. DESIGN INVARIANTS (Checklist for Implementers)

- [ ] Threshold slider drives all panels simultaneously.
- [ ] Confusion matrix cells animate counts smoothly.
- [ ] ROC/PR curve point is draggable and synced to slider.
- [ ] Precision and Recall are visually shown as a tradeoff (opposed motion).
- [ ] Class imbalance is visible via the balance indicator.
- [ ] Accuracy trap is demonstrable (accuracy stable while P/R swing).
- [ ] Static fallback includes confusion matrix + curve + metric table.
- [ ] Max 6 metrics displayed; max 10,000 predictions computed live.
