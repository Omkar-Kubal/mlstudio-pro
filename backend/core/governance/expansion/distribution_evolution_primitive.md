# PRIMITIVE SPEC: Distribution Evolution

**Status:** DESIGN_APPROVED  
**Type:** Visual Primitive (Theory-Grade)  
**Context:** Foundational reusable component for 12+ topics (Stats, ML, Data Prep)

---

## 1. CORE CONCEPT

**Intuition Built:**
Data is not a static number or a list of points; it is a **shape** that breathes and reacts. Operations (scaling, sampling, fitting) are "forces" that stretch, squash, shift, or distort this shape.

**Misconception Fixed:**
*"Summary statistics tell the whole story."*
(e.g., Users often think Mean = Center, ignoring skew or multimodality. This primitive forces them to seeing the *structure* behind the number.)

**Why Visual?**
Text says "kurtosis increases."
The Primitive shows the "shoulders" of the distribution lifting and the peak sharpening.
Text says "normalization."
The Primitive shows the axis "breathing" in to fit the shape into a [0, 1] box.

---

## 2. INPUT / CONTROL MODEL

This primitive is **slider-driven** to allow users to feel the "elasticity" of the change.

### Primary Control (Scalar)
**"The Knob"** (Context-dependent label)
- **Stats:** Sample Size ($n$), Standard Deviation ($\sigma$)
- **Preprocessing:** Outlier Strength, Missing Value ratio
- **ML:** Regularization Strength ($\lambda$)

*Behavior:* Continuous, chemically-smooth transitions. No discrete jumps unless mathematically required (e.g. $df$ in t-distribution).

### Secondary Control (Discrete Toggle)
**"View State"** (Optional)
MAX 2 options.
- E.g., `Raw` vs `Standardized`
- E.g., `PDF` (Theoretical) vs `Histogram` (Empirical)

---

## 3. OUTPUT VISUALS

The visual must read as "organic" but "mathematically precise."

### A. The Shape (Primary Actor)
- **Style:** Filled area curve (SVG/Canvas).
- **Aesthetic:** Semi-transparent fill (Glassmorphism). 
- **Stroke:** Crisp, weighted line on top.
- **Motion:** When parameters change, the curve *morphs* (interpolates nodes), it does not fade-out/fade-in. The user must see the mass "flow" to the new position.

### B. The Skeleton (Contextual Overlay)
- **Mean Line:** Dashed vertical line, moves with the mass.
- **Spread Indicator:** Horizontal bar below the x-axis representing $1\sigma$ or IQR. Expands/contracts physically.
- **Outliers:** Individual floating dots that separate from the main mass (only if outlier detection is the topic).

### C. The Axis (The Frame of Reference)
- The grid usually stays fixed to show the data moving *through* the space.
- **EXCEPTION:** In "Scaling/Normalization" modes, the *axis itself* might animate (numbers changing) while the shape stays relative, or vice versa.

---

## 4. VISUAL STATES

### I. Initial (Baseline)
- A clean, balanced distribution (usually Gaussian or slight skew).
- "Resting state" where the user creates a mental anchor.

### II. Perturbation (The Action)
- As control moves, the shape distorts.
- **Example:** Increasing "Skew" drags the tail right like pulling toffee. The peak leans left to compensate.
- **Example:** Adding "Noise" makes the smooth curve jittery or spreads it out.

### III. Stabilization (The Convergence)
- As $n \to \infty$ (Sample Size increases):
- Jagged histogram bins transition smoothly into a clean density curve.
- "Law of Large Numbers" felt visually as vibration stops and shape solidifies.

### IV. Misleading (The "Aha!" Moment)
- A state where **Mean is identical** to Baseline, but **Shape is different** (e.g., Bimodal "Camel back").
- Used to prove why we need this primitive.

### V. Failure Modes (Do Not Show)
- **Never:** Show raw individual points for $n > 500$ (Visual noise).
- **Never:** Allow the curve to clip off-screen (Auto-rescale Y-axis or clamp inputs).

---

## 5. REUSE SCENARIOS (Implementation Matrix)

| Topic | Control | Visual Transformation |
| :--- | :--- | :--- |
| **Descriptive Stats** | Skew / Kurtosis sliders | Shape stretches/peaks while keeping area constant (PDF property). |
| **Sampling** | Sample Size ($n$) | Histogram bars subdivide and smooth out into the theoretical line. |
| **Data Cleaning** | Imputation Method | **Mean:** A spike grows at the center.<br>**Random:** The shape fills in naturally. |
| **Feature Scaling** | Scale Factor | The entire shape shrinks horizontally into the [0,1] range. |
| **Train/Test Shift** | "Drift" Slider | Two curves (Train=Blue, Test=Orange) separate slowly, showing overlap area reducing. |
| **Central Limit Thm** | Iterations | Uniform flat shape morphs into a Gaussian Bell. |

---

## 6. GUARDRAILS

### Stability
- **Bin Count:** If using histograms, bin count must dynamic ($k = \sqrt{n}$ or Rice Rule) to avoid "comb" artifacts, but changes must be debounced so bins don't flicker.
- **Y-Axis:** Auto-scaling must be dampened. No jittery axis rescaling on every frame.

### Performance
- **Cap:** Max 2000 points for real-time KDE calculation in JS.
- **Fallback:** Pre-calculated SVG paths if device is low-power (detect via fps).

### Interactions
- **No Scroll-Jacking:** All animation is strictly tied to the **Control Slider** or a "Play" button. Scrolling the page never morphs the data (user misses the cause-and-effect).

---

## 7. PLACEHOLDER ↔ ANIMATION HANDOFF

### Loading State
- A gray, pulsating "skeleton" of a bell curve.
- Text: "Sampling Distribution..."

### Static Fallback (No JS/Print)
- Renders the "Final" state of the evolution (e.g., the Normalized shape).
- Shows a "Ghost" outline of the "Initial" state behind it for context (dotted line), preserving the "Before/After" comparison without motion.
