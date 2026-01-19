# PRIMITIVE SPEC: Fit Progression

**Status:** DESIGN_APPROVED  
**Type:** Visual Primitive (Theory-Grade)  
**Context:** Foundational reusable component for Regression, Classification, Trees, Regularization, Neural Networks

---

## 1. CORE CONCEPT

**Intuition Built:**
A model's relationship to data exists on a **spectrum of flexibility**. Too stiff = ignores signal. Too flexible = memorizes noise. The "sweet spot" is a balance that generalizes.

**Misconception Fixed:**
*"A model that fits the training data perfectly is a good model."*
(Users must viscerally *see* the wiggly line chasing noise, then *watch* it fail on new data.)

**Why Visual?**
- Text says "overfitting."
- The Primitive shows the line *contorting* to touch every point, then *shattering* when test data appears.
- Text says "regularization."
- The Primitive shows the line *relaxing* from a tangled mess into a smooth arc.

---

## 2. INPUT / CONTROL MODEL

This primitive is **slider-driven** with a single semantic axis.

### Primary Control (Scalar)
**"Model Complexity"** (Context-dependent label)
| Context | Label | Range |
| :--- | :--- | :--- |
| Polynomial Regression | Degree | 1 → 15 |
| Decision Tree | Max Depth | 1 → 20 |
| KNN | K (Inverse) | 100 → 1 |
| Neural Network | Hidden Units / Layers | Low → High |
| Regularization | Lambda (Inverse) | High → Low |

*Behavior:* Continuous morph. The line/boundary *bends* in real-time as the slider moves. No discrete jumps unless mathematically required (e.g., tree depth is integer).

### Secondary Control (Toggle)
**"Show Test Data"** (Binary)
- **OFF:** Only training points visible. User optimizes for train fit.
- **ON:** Test points appear (different color). User sees generalization gap.

This toggle is the **"reveal" moment**. It must feel like lifting a curtain.

---

## 3. OUTPUT VISUALS

### A. The Data (The Ground Truth)
- **Training Points:** Solid circles, primary color (e.g., Blue).
- **Test Points:** Hollow circles or different hue (e.g., Orange), initially hidden.
- **Placement:** Scattered with underlying signal + noise.

### B. The Model (The Actor)
- **Style:** Smooth curve (regression) or shaded regions (classification).
- **Motion:** When complexity changes, the model *morphs continuously*. Nodes interpolate. No fade-outs.
- **Aesthetic:** Semi-transparent fill under the curve (for regression). Gradient-shaded decision regions (for classification).

### C. The Error Signal (The Consequence)
- **Residual Lines:** Faint vertical lines from each training point to the model curve.
- **Error Metric:** A small, non-intrusive numeric display (e.g., "Train Error: 0.12 | Test Error: 0.45"). Updates in real-time.
- **Error Shading:** Optional: aggregate error shown as a shaded band around the model (prediction interval).

### D. The Axes (The Frame)
- Fixed. Data and model move within the frame.
- Labeled intuitively (e.g., "Input" → "Output").

---

## 4. VISUAL STATES

### I. Underfit (Low Complexity)
- **Model:** A nearly straight line (or very shallow tree boundary).
- **Behavior:** The line *ignores* the curvature in the data. It cuts through the cloud without following the wave.
- **Error Signal:** Residuals are long and systematic (all on one side of the line in patches).
- **User Feeling:** "The model is too dumb."

### II. Optimal Fit (Mid Complexity)
- **Model:** A smooth curve that captures the underlying signal.
- **Behavior:** The line follows the *trend* without chasing individual points.
- **Error Signal:** Residuals are short and randomly distributed (no pattern).
- **User Feeling:** "This looks right."

### III. Overfit (High Complexity)
- **Model:** A wiggly, high-frequency curve that passes through (or very close to) every training point.
- **Behavior:** The line *contorts* to minimize training error, creating sharp bends between points.
- **Error Signal:** Train residuals are near-zero, but test residuals (when revealed) are large and erratic.
- **User Feeling:** "The model is trying too hard."

### IV. The Reveal (Test Data Appears)
- **Trigger:** User toggles "Show Test Data" ON.
- **Animation:** Test points fade in gracefully (200-300ms).
- **Model Behavior:** Model does NOT change. This is the key. The user sees the *same* overfit curve now failing on unseen data.
- **Error Signal:** Test error metric spikes. Residual lines to test points are visibly longer than to train points.
- **User Feeling:** "Oh. It memorized the noise."

### V. Failure Modes (Do Not Show)
- **Never:** Let the model curve go off-screen (clamp complexity or auto-scale).
- **Never:** Show so many points that the signal is occluded (max ~100 points in the primary view).
- **Never:** Auto-animate complexity. User must drive it.

---

## 5. REUSE SCENARIOS (Implementation Matrix)

| Topic | Model Type | Complexity Control | Key Visual |
| :--- | :--- | :--- | :--- |
| **Linear Regression** | Line | Polynomial Degree | Line bends into curves, then wiggles. |
| **Logistic Regression** | Decision Boundary | Polynomial Features | Boundary curves, then becomes fractal-like. |
| **KNN** | Voronoi Regions | K (neighbors) | Regions merge (high K) or shatter (low K). |
| **Decision Trees** | Axis-Aligned Splits | Max Depth | Rectangles subdivide into finer grids. |
| **Random Forests** | Averaged Boundary | Number of Trees | Jagged boundary smooths out. |
| **Neural Networks** | Nonlinear Surface | Hidden Units | Smooth curve → complex manifold. |
| **Regularization** | Constrained Model | Lambda (inverse) | Wiggly → Smooth as lambda increases. |
| **Bias-Variance Tradeoff** | Conceptual | Complexity Axis | Error curves (U-shape) shown alongside model. |

---

## 6. GUARDRAILS

### Stability
- **Curve Smoothness:** Model curve must be rendered with sufficient resolution (min 200 points on the path) to avoid jagged edges during high-complexity states.
- **Animation Debounce:** Slider input is debounced (50ms) to prevent jittery rendering during rapid dragging.

### Performance
- **Point Limit:** Max 150 data points (train + test combined) for real-time model fitting in JS.
- **Fallback:** For complex models (e.g., KNN with K=1, N=100), pre-compute discrete states and interpolate visually.

### Interactions
- **No Scroll-Jacking:** Animation is strictly tied to the **Complexity Slider** or the **"Show Test Data"** toggle.
- **No Auto-Play:** The model never animates on its own. User controls the "story."

### Accessibility
- **Reduced Motion:** If `prefers-reduced-motion` is set, disable morphing. Show instant state changes.
- **Color Blind Safe:** Train/Test distinction must not rely solely on red/green. Use shape (solid vs. hollow) as primary differentiator.

---

## 7. PLACEHOLDER ↔ ANIMATION HANDOFF

### Loading State
- A gray, pulsating outline of a generic sigmoid curve.
- Text: "Loading Model..."

### Static Fallback (No JS / Print View)
- Renders a **triptych** (3-panel image):
  - **Panel 1:** Underfit (straight line through curved data).
  - **Panel 2:** Optimal Fit (smooth curve following trend).
  - **Panel 3:** Overfit (wiggly line touching all points, with faded test points showing errors).
- Caption below: "Drag the slider to explore the fit spectrum."

### Placeholder Text Mapping
When a content block contains `[VISUAL INTUITION: FIT_PROGRESSION]`:
1. Load the Fit Progression primitive component.
2. Initialize with `complexity = middle_of_range`.
3. `showTestData = false`.

---

## 8. DESIGN INVARIANTS (Checklist for Implementers)

- [ ] Slider controls complexity; nothing else affects the model.
- [ ] Model morphs; it does not fade/redraw.
- [ ] Test data reveal is a discrete toggle, not a slider.
- [ ] Error metrics are always visible but non-intrusive.
- [ ] User can reach underfit, optimal, and overfit states within the slider range.
- [ ] Static fallback preserves the "spectrum" concept via the triptych.
