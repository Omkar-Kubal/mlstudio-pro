# PRIMITIVE SPEC: Network Forward Pass

**Status:** DESIGN_APPROVED  
**Type:** Visual Primitive (Theory-Grade)  
**Context:** Foundational reusable component for Neural Networks (MLP), Activation Functions, Deep Learning Intuition, Vanishing/Exploding Gradient Prep

---

## 1. CORE CONCEPT

**Intuition Built:**
A neural network is not a black box—it is a **pipeline of transformations**. Each layer takes a representation, stretches/rotates/squashes it, and passes it forward. The "intelligence" emerges from how these simple transforms compose.

**Misconception Fixed:**
*"Neural networks are magic."*
(Users think of networks as opaque. This primitive shows that each layer is just weighted sums + a nonlinear "kink." The mystery dissolves when you see data morph step-by-step.)

**Why Visual?**
- Text says "the hidden layer applies a ReLU activation."
- The Primitive shows signal bars *clamping to zero* when negative, visually demonstrating the "on/off" gating.
- Text says "deep networks learn hierarchical features."
- The Primitive shows input patterns *mutating* layer by layer until the output emerges.

---

## 2. INPUT / CONTROL MODEL

### Primary Control (Scalar Slider)
**"Input Value"** or **"Input Vector"**
- Controls the value(s) fed into the first layer.
- Range: -5.0 → +5.0 (or normalized -1 → +1 depending on context).

*Behavior:* As input changes, activation signals propagate forward through the network in real-time. User sees cause → effect immediately.

### Secondary Control (Discrete)
**"Activation Function"** (Toggle or Dropdown)

| Option | Visual Effect |
| :--- | :--- |
| Linear | No transformation; signals pass through unchanged. |
| ReLU | Negative values clamp to zero. |
| Sigmoid | Values squash into (0, 1) S-curve. |
| Tanh | Values squash into (-1, 1) S-curve. |
| Leaky ReLU | Negative values reduce but don't vanish. |

### Tertiary Control (Optional)
**"Step Mode"** (Toggle)
- **OFF:** Full forward pass shown instantly.
- **ON:** User steps through layer-by-layer manually (Next Layer button).

**"Network Depth"** (Optional slider if multiple architectures are shown)
- 1 Hidden Layer → 5 Hidden Layers
- Adds/removes layers visually.

---

## 3. OUTPUT VISUALS

### A. The Network Structure (The Skeleton)
- **Layers:** Vertical columns of nodes (circles).
  - Input Layer (left): Labeled with input variable names or indices.
  - Hidden Layers (middle): Unlabeled or numbered (Layer 1, 2, ...).
  - Output Layer (right): Labeled with output meaning (e.g., "Class A", "Class B").
- **Connections:** Lines between nodes (all-to-all for MLP).
- **Layout:** Clean, left-to-right flow. Equal spacing between layers.

### B. The Activation Signal (The Actor)
- **Node Fill:** Each node fills with color proportional to its activation value.
  - Positive: Color A (e.g., Blue gradient; darker = stronger).
  - Negative: Color B (e.g., Orange/Red gradient; darker = more negative).
  - Zero: Neutral (white or gray).
- **Motion:** When input changes, the "fill" animates as a wave from left to right, showing propagation.
- **Numeric Overlay (optional):** Small text inside each node showing the exact value (e.g., "0.73").

### C. The Weights (The Wires)
- **Thickness:** Line thickness encodes weight magnitude (thicker = larger |weight|).
- **Color:** Positive weight = Color A; Negative weight = Color B.
- **Opacity:** Faint for small weights; bold for large weights.
- **Motion:** When signal propagates, edges "pulse" or "glow" briefly as data flows over them.

### D. The Activation Function Visualization (Sidebar or Inline)
- **Graph:** A small plot showing the activation function curve.
- **Marker:** A dot on the curve shows the current pre-activation value and where it maps to post-activation.
- **Purpose:** Users see *how* the function transforms each value.

### E. The Layer Output (Summary)
- **Bar Chart or Heatmap:** For the output layer, show class probabilities as bars or a softmax distribution.
- **Highlight:** The winning class is visually emphasized (bold, larger, highlighted).

---

## 4. VISUAL STATES

### I. Resting (Default)
- Input slider at 0 or neutral.
- All activations show near-zero or small values.
- Network looks "idle."
- User Feeling: "Nothing is happening yet."

### II. Linear Flow (No Activation)
- Activation function set to "Linear."
- Signals pass through unchanged.
- Output is a simple linear combination of input.
- User Feeling: "This is just weighted sums—no magic."

### III. Nonlinear Activation (ReLU / Sigmoid / Tanh)
- **ReLU:** Some nodes "turn off" (zero fill) when pre-activation is negative. Others stay active.
- **Sigmoid/Tanh:** Extreme inputs saturate (fills max out at ±1). Moderate inputs show gradient.
- User Feeling: "The function is shaping the signal."

### IV. Dead Neurons (ReLU Failure)
- When weights align such that a neuron *always* receives negative input, it stays gray/zero regardless of input changes.
- These neurons "don't participate."
- User Feeling: "This neuron is useless—it's always off."

### V. Saturation (Sigmoid/Tanh Edges)
- For extreme inputs (+5 or -5), sigmoid/tanh nodes hit 0.99 or -0.99.
- Gradients would be near-zero (conceptual prep for backprop).
- User Feeling: "The signal is maxed out—it can't grow more."

### VI. Deep Propagation (Multiple Layers)
- As depth increases, small input changes may amplify (exploding) or shrink (vanishing).
- Visual: The wave of color either intensifies or fades layer by layer.
- User Feeling: "Depth changes how signals evolve."

### VII. Failure Modes (Do Not Show)
- **Never:** Allow more than 8 nodes per layer (visual clutter).
- **Never:** Allow more than 5 hidden layers (too much to parse).
- **Never:** Auto-animate the input slider. User must drive it.
- **Never:** Show weight values numerically by default (too noisy).

---

## 5. REUSE SCENARIOS (Implementation Matrix)

| Topic | Focus | Key Visual |
| :--- | :--- | :--- |
| **MLP Basics** | Network structure | Nodes, edges, layer flow. |
| **Activation Functions** | ReLU vs Sigmoid vs Tanh | Activation function graph + node fill behavior. |
| **Dead Neurons** | ReLU failure case | Gray nodes that never activate. |
| **Saturation** | Sigmoid/Tanh limits | Nodes stuck at max/min fill. |
| **Depth Effects** | Signal amplification/decay | Shallow vs deep networks; wave intensity. |
| **Softmax Output** | Classification | Output layer as probability bars. |
| **Vanishing Gradient Prep** | Conceptual | Saturation + depth = shrinking signal (precursor to backprop). |

---

## 6. GUARDRAILS

### Stability
- **Propagation Smoothness:** Signal wave animates over 300ms from input to output.
- **Node Value Clamping:** Activations clamped to [-10, +10] for display stability.
- **Weight Normalization:** Edge thickness normalized relative to the max weight in the network.

### Performance
- **Node Limit:** Max 8 nodes per layer, max 5 hidden layers (40 hidden nodes total).
- **Edge Limit:** Fully connected = 8×8×5 = 320 edges max. Use opacity culling for weights < 0.1.
- **Fallback:** For larger networks, show a "zoomed-out" schematic (layer blocks, not individual nodes).

### Interactions
- **No Scroll-Jacking:** Animation tied to **Input Slider**, **Activation Toggle**, or **Step Button**.
- **Hover on Node:** Show exact activation value + pre-activation value + activation function output.
- **Hover on Edge:** Show weight value.

### Accessibility
- **Reduced Motion:** Disable wave animation. Show instant state.
- **Color Blind Safe:** Use saturation/brightness for activation intensity, not just hue. Add +/- symbols inside nodes.
- **Screen Reader:** Announce "Layer 2, Node 3, activation 0.73."

---

## 7. PLACEHOLDER ↔ ANIMATION HANDOFF

### Loading State
- Gray nodes in a standard 3-layer layout.
- Faint edges connecting all.
- Text: "Loading Network..."

### Static Fallback (No JS / Print View)
- Renders a **single snapshot** of the network with:
  - Input layer: sample input values.
  - Hidden layer: activation values filled in.
  - Output layer: probability bars.
- Arrows between layers indicating data flow direction.
- Caption: "Adjust the input slider to see how activations propagate."

### Placeholder Text Mapping
When a content block contains `[VISUAL INTUITION: NETWORK_FORWARD_PASS]`:
1. Load the Network Forward Pass primitive component.
2. Initialize with Input = 0, Activation = ReLU.
3. Use a sample 3-layer network (2 inputs, 4 hidden, 2 outputs).

---

## 8. DESIGN INVARIANTS (Checklist for Implementers)

- [ ] Input slider drives all downstream activations.
- [ ] Signal propagates as a visible wave from left to right.
- [ ] Activation function toggle changes node fill behavior instantly.
- [ ] Dead neurons (always zero) are visually distinct (gray).
- [ ] Saturated neurons (always max) are visually distinct (full fill).
- [ ] Weight thickness encodes magnitude; color encodes sign.
- [ ] Max 8 nodes/layer, max 5 hidden layers.
- [ ] Static fallback shows a labeled snapshot of the forward pass.
