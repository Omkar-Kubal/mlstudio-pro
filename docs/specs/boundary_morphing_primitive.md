# PRIMITIVE SPEC: Boundary Morphing

**Status:** DESIGN_APPROVED  
**Type:** Visual Primitive (Theory-Grade)  
**Context:** Foundational reusable component for Classification, Clustering, Decision Trees, Neural Networks, SVM, Ensemble Methods

---

## 1. CORE CONCEPT

**Intuition Built:**
A decision boundary is not a fixed line—it is a **living membrane** that responds to data and model parameters. It bends toward minority classes, fractures into islands, or smooths into simple curves depending on model capacity and regularization.

**Misconception Fixed:**
*"The boundary just separates classes."*
(Users think of boundaries as static dividers. This primitive reveals boundaries as *negotiated territories*—shaped by local data density, model flexibility, and the tug-of-war between fitting and generalizing.)

**Why Visual?**
- Text says "non-linear decision boundary."
- The Primitive shows the boundary *curving* around data clusters like water flowing around stones.
- Text says "high variance model."
- The Primitive shows the boundary *fragmenting* into disconnected islands that isolate individual points.

---

## 2. INPUT / CONTROL MODEL

### Primary Control (Scalar Slider)
**"Boundary Flexibility"** (Context-dependent label)

| Context | Label | Range | Effect |
| :--- | :--- | :--- | :--- |
| SVM | Kernel Gamma | Low → High | Smooth hyperplane → Tight contours around points |
| KNN | K (Inverse) | High → Low | Large merged regions → Fragmented Voronoi cells |
| Decision Tree | Max Depth | Low → High | Axis-aligned blocks → Fine-grained partitions |
| Neural Network | Hidden Units | Low → High | Simple curve → Complex manifold |
| Logistic Regression | Polynomial Degree | 1 → 10 | Linear → Curvy → Wiggly |

*Behavior:* Continuous morph. The boundary *flows* and *reshapes* in real-time. No discrete jumps unless mathematically required (e.g., tree splits are discrete).

### Secondary Control (Discrete Toggle)
**"Boundary Style"** (Optional, max 1 toggle)

| Option A | Option B | Use Case |
| :--- | :--- | :--- |
| Hard Boundary | Probability Gradient | Show confidence zones (soft classification) |
| Single Model | Ensemble Average | Show variance reduction in Random Forest/Bagging |

---

## 3. OUTPUT VISUALS

### A. The Data Points (Ground Truth)
- **Class A:** Solid circles, Color 1 (e.g., Blue).
- **Class B:** Solid circles, Color 2 (e.g., Orange).
- **Class C+ (if multi-class):** Additional distinct colors/shapes.
- **Placement:** Clustered with some overlap to create "contested" regions.

### B. The Boundary (The Actor)
- **Style:** A smooth curve (or set of curves) separating colored regions.
- **Fill:** Each class region is filled with a semi-transparent version of its class color.
- **Motion:** When flexibility changes, the boundary *morphs continuously*. It bends, splits, or merges—never fades out and redraws.
- **Edge Aesthetic:** Crisp line on top of the filled regions. Optional glow/shadow for depth.

### C. The Probability Field (Optional Layer)
- **Gradient Shading:** Instead of hard fills, show a continuous gradient from Class A color → Class B color.
- **Intensity:** Darker = higher confidence. Lighter = uncertain zone near boundary.
- **Use Case:** Activated via "Probability Gradient" toggle.

### D. The Contested Zone (Highlight Layer)
- **Definition:** The region where the boundary position is most sensitive to parameter changes.
- **Visual:** A subtle pulsing or hatched overlay on the "thin" part of the probability gradient.
- **Purpose:** Shows where the model is "undecided."

### E. The Axes (The Frame)
- Fixed 2D plane.
- Labeled as "Feature 1" and "Feature 2" (or context-specific names).
- Grid lines optional, faint if present.

---

## 4. VISUAL STATES

### I. Linear / Simple (Low Flexibility)
- **Boundary:** A straight line (or gentle curve) dividing the plane.
- **Regions:** Two large, contiguous blocks of color.
- **Behavior:** The line can only tilt and shift; it cannot bend.
- **User Feeling:** "This is a simple model."

### II. Curved / Adaptive (Mid Flexibility)
- **Boundary:** A smooth, flowing curve that wraps around data clusters.
- **Regions:** Organic shapes that respect the natural density of points.
- **Behavior:** The boundary hugs the majority class and carves around outliers.
- **User Feeling:** "This is learning the shape of the data."

### III. Fragmented / Overfitting (High Flexibility)
- **Boundary:** Multiple disconnected curves creating "islands" of one class within another.
- **Regions:** Shattered into many small pockets.
- **Behavior:** The boundary contorts to classify every single training point correctly.
- **User Feeling:** "This is memorizing, not learning."

### IV. Merging (Ensemble / Regularization)
- **Trigger:** Secondary toggle to "Ensemble Average" or increasing regularization.
- **Animation:** Fragmented islands *dissolve* and *flow* back into a smooth boundary.
- **User Feeling:** "Averaging reduces the noise."

### V. Splitting (Adding Model Capacity)
- **Trigger:** Increasing flexibility from mid → high.
- **Animation:** A single smooth boundary *pinches* and *divides* into multiple separate curves.
- **User Feeling:** "The model is creating new regions."

### VI. Failure Modes (Do Not Show)
- **Never:** Let boundary fragments become so small they are unclickable/invisible.
- **Never:** Show more than 5 classes simultaneously (visual clutter).
- **Never:** Auto-animate the slider. User must drive it.
- **Never:** Allow points to overlap so densely that class membership is ambiguous visually.

---

## 5. REUSE SCENARIOS (Implementation Matrix)

| Topic | Model Type | Flexibility Control | Key Visual |
| :--- | :--- | :--- | :--- |
| **Logistic Regression** | Linear Boundary | Polynomial Features | Line curves into polynomial. |
| **SVM (RBF Kernel)** | Kernel Boundary | Gamma | Smooth → Tight contours → Islands. |
| **KNN** | Voronoi Regions | K | Fragmented (K=1) → Smooth (K=high). |
| **Decision Trees** | Axis-Aligned Splits | Max Depth | Large rectangles → Fine grid. |
| **Random Forest** | Averaged Boundary | Number of Trees | Jagged → Smooth (variance averaging). |
| **Neural Networks** | Arbitrary Manifold | Layers / Units | Simple curve → Complex topology. |
| **Clustering (k-Means)** | Voronoi by Centroid | Number of Clusters | Plane partitions into K regions. |
| **Soft Clustering (GMM)** | Probability Gradient | Covariance Type | Hard regions → Soft gradients. |

---

## 6. GUARDRAILS

### Stability
- **Boundary Resolution:** Minimum 300 path points for smooth curve rendering.
- **Animation Debounce:** 50ms debounce on slider input to prevent flicker.
- **Fragment Limit:** If model creates >20 disconnected regions, visually merge the smallest ones (LOD simplification).

### Performance
- **Point Limit:** Max 200 data points for real-time boundary computation in JS.
- **Grid Resolution:** For probability gradient, use a 50×50 grid maximum.
- **Fallback:** For high-complexity models, pre-compute 5-10 discrete boundary states and interpolate between them.

### Interactions
- **No Scroll-Jacking:** Animation is strictly tied to the **Flexibility Slider** or toggles.
- **Hover Feedback:** Hovering over a point highlights which region it falls into.
- **Click Feedback (optional):** Clicking a point shows its predicted class and probability.

### Accessibility
- **Reduced Motion:** If `prefers-reduced-motion` is set, disable morphing. Show instant state changes.
- **Color Blind Safe:** Use patterns (dots, stripes, crosshatch) in addition to color to distinguish regions.
- **High Contrast Mode:** Boundary line weight increases; fill opacity increases.

---

## 7. PLACEHOLDER ↔ ANIMATION HANDOFF

### Loading State
- A gray, pulsating generic S-curve dividing the plane.
- Text: "Computing Boundary..."

### Static Fallback (No JS / Print View)
- Renders a **triptych** (3-panel image):
  - **Panel 1:** Linear boundary (simple straight line).
  - **Panel 2:** Curved boundary (smooth nonlinear separation).
  - **Panel 3:** Fragmented boundary (multiple islands, with a few misclassified points highlighted).
- Caption: "Adjust the slider to see how model complexity shapes the boundary."

### Placeholder Text Mapping
When a content block contains `[VISUAL INTUITION: BOUNDARY_MORPHING]`:
1. Load the Boundary Morphing primitive component.
2. Initialize with `flexibility = middle_of_range`.
3. Generate sample 2-class data with slight overlap.

---

## 8. DESIGN INVARIANTS (Checklist for Implementers)

- [ ] Slider controls boundary flexibility; nothing else affects it.
- [ ] Boundary morphs continuously; it does not redraw/fade.
- [ ] Regions are always filled with class colors (semi-transparent).
- [ ] Fragmented state is reachable at high flexibility.
- [ ] Smooth/merged state is reachable via ensemble toggle or low flexibility.
- [ ] Static fallback preserves the "spectrum" concept via the triptych.
- [ ] Color + pattern used together for accessibility.
- [ ] Max 5 classes, max 200 points, max 50×50 gradient grid.
