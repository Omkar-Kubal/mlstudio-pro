# Visual Primitives — Implementation Strategy

**Status:** AWAITING_APPROVAL  
**Scope:** Implementation planning only (no code)  
**Locked Primitives:** 7 (immutable contracts)

---

## TASK 1: IMPLEMENTATION SEQUENCE

### Build Order

| Phase | Primitive | Justification | Unlocks |
| :---: | :--- | :--- | :--- |
| **1** | Distribution Evolution | Highest reuse (Stats, Data Prep, ML Assumptions). Lowest complexity (single curve + slider). No dependencies. | Histogram/density rendering, morph engine, slider binding. |
| **2** | Fit Progression | Builds on Phase 1's morph engine. Direct path to Regression/Classification topics. | Model curve rendering, train/test toggle, error visualization. |
| **3** | Boundary Morphing | Extends Phase 2's curve logic to 2D regions. Required before clustering/classification topics. | Region fills, Voronoi, fragmentation logic. |
| **4** | Metric Dashboard | Standalone (no visual dependency on 1-3). High reuse for evaluation topics. Multi-panel coordination is reusable pattern. | Confusion matrix component, gauge components, bidirectional slider-curve binding. |
| **5** | Cluster Formation | Depends on Boundary Morphing's region rendering. Extends to centroid animation. | Centroid drift, Voronoi partitioning, noise/noise handling. |
| **6** | Network Forward Pass | New visual paradigm (nodes/edges). No dependency on 1-5, but conceptually after classical ML. | Node-edge graph renderer, activation fill, wave animation engine. |
| **7** | Gradient Backflow | Direct dependency on Phase 6's network renderer. Adds reverse-direction wave. | Backward wave, per-layer metrics, gradient magnitude bars. |

### Dependency Graph

```
Distribution Evolution (1)
         │
         ▼
   Fit Progression (2)
         │
         ▼
  Boundary Morphing (3)
         │
         ▼
  Cluster Formation (5)

  Metric Dashboard (4)  ← (parallel track, no dependencies)

  Network Forward Pass (6)
         │
         ▼
   Gradient Backflow (7)
```

---

## TASK 2: RUNTIME ARCHITECTURE PLAN

### 2.1 Primitive Location

| Location | Contents |
| :--- | :--- |
| `/components/primitives/` | All 7 primitive components. Shared, not topic-specific. |
| `/components/primitives/shared/` | Reusable sub-components (Slider, Gauge, MorphCurve, NodeGraph, etc.). |
| `/lib/primitives/registry.ts` | Primitive name → component mapping (no dynamic imports at call site). |
| `/lib/primitives/config/` | Default configs per primitive (initial values, limits, fallback text). |

### 2.2 Tag Resolution (`[VISUAL INTUITION: ...]`)

| Step | Action |
| :--- | :--- |
| 1 | Content parser encounters `[VISUAL INTUITION: PRIMITIVE_NAME]`. |
| 2 | Parser extracts `PRIMITIVE_NAME` and optional inline config (e.g., `[VISUAL INTUITION: FIT_PROGRESSION, complexity=mid]`). |
| 3 | Renderer looks up `PRIMITIVE_NAME` in `registry.ts`. |
| 4 | If found: Render component with merged config (default + inline). |
| 5 | If not found: Render static fallback block (image + caption). |

### 2.3 Config Injection (Decoupled from Subjects)

- Primitives accept a **single `config` prop** (flat object).
- Configs are **NOT** stored in subject/topic files.
- Configs live in:
  - `/lib/primitives/config/[primitive].config.ts` (defaults)
  - Inline overrides via `[VISUAL INTUITION: ..., key=value]` (optional)
- No subject-level imports. No coupling.

### 2.4 Placeholder & Static Fallback Enforcement

| State | Trigger | Behavior |
| :--- | :--- | :--- |
| Loading | Component mounting | Show skeleton placeholder (gray pulsing shape, loading text). |
| No JS | SSR or JS disabled | Render static fallback image (triptych or snapshot) + caption. |
| Error | Component throws | Render error boundary with static fallback (no crash). |
| Print | `@media print` | Force static fallback via CSS (hide interactive, show image). |

### 2.5 Reduced Motion Handling (Global)

| Mechanism | Implementation |
| :--- | :--- |
| CSS | `@media (prefers-reduced-motion: reduce)` disables all transitions. |
| JS | `usePrefersReducedMotion()` hook returns boolean. |
| Primitive Behavior | If `reducedMotion === true`: instant state changes, no wave/morph animations. |
| Enforcement | Applied at `PrimitiveWrapper` level (all primitives inherit). |

---

## TASK 3: PERFORMANCE & DEGRADATION STRATEGY

### 3.1 Mobile vs Desktop

| Dimension | Desktop | Mobile |
| :--- | :--- | :--- |
| Point Limit | As per spec (500/200/etc.) | 50% of spec limit. |
| Animation FPS Target | 60 fps | 30 fps acceptable. |
| Touch Interactions | Hover + click | Touch + drag (no hover). |
| Panel Layout | Multi-panel side-by-side | Stacked vertically. |

### 3.2 Low-Power Device Fallback

| Detection | Action |
| :--- | :--- |
| `navigator.hardwareConcurrency < 4` | Reduce point limits by 50%. |
| Frame drop detected (via `requestAnimationFrame` timing) | Downgrade to static fallback after 3 consecutive frame drops. |
| `navigator.connection.saveData === true` | Force static fallback (no animations). |

### 3.3 Max Limits Enforcement (Hard Caps)

| Primitive | Hard Cap | Enforcement |
| :--- | :--- | :--- |
| Distribution Evolution | 2000 points | Downsample on init if exceeded. |
| Fit Progression | 150 points (train + test) | Truncate with warning. |
| Boundary Morphing | 200 points, 5 classes | Clamp classes; downsample points. |
| Metric Dashboard | 10,000 predictions | Pre-compute discrete states. |
| Cluster Formation | 500 points, 10 clusters | Clamp K; downsample points. |
| Network Forward Pass | 8 nodes/layer, 5 layers | Ignore excess layers/nodes. |
| Gradient Backflow | 8 nodes/layer, 8 layers | Ignore excess layers/nodes. |

### 3.4 Error Isolation

| Rule | Enforcement |
| :--- | :--- |
| Primitive crash ≠ page crash | Each primitive wrapped in `ErrorBoundary`. |
| Fallback on error | ErrorBoundary renders static fallback + "Visualization unavailable" message. |
| No throw propagation | Errors logged, not rethrown. |
| Reading flow intact | Surrounding text content renders regardless of primitive state. |

### 3.5 Client-Only vs SSR

| Scope | Rendering |
| :--- | :--- |
| Primitive shell (container, placeholder) | SSR-safe (renders gray skeleton). |
| Interactive logic (sliders, animations) | Client-only (`useEffect` or `dynamic import`). |
| Static fallback | SSR-safe (image + caption). |
| Hydration | Skeleton replaced by interactive on hydrate. |

---

## TASK 4: PILOT GATE DEFINITION

### Gate Checklist (Per Primitive)

Before moving to the next primitive, ALL gates must pass:

| Gate | Criterion | Verification |
| :--- | :--- | :--- |
| **Visual Clarity** | Primary control → visible change is obvious within 1 second. | Manual review. |
| **Interaction Correctness** | Slider/toggle produces expected state per spec. | Automated test (input → output snapshot). |
| **Performance Budget** | No frame drops on target device (desktop: 60fps, mobile: 30fps). | Performance profiling. |
| **Fallback Integrity** | Static fallback renders without JS. | Disable JS, reload, verify. |
| **No Reading Disruption** | Surrounding text renders if primitive fails. | Force error, verify page integrity. |
| **Accessibility** | Reduced motion works. Color + shape used together. | Chrome DevTools audit. |
| **Config Decoupling** | No subject-specific imports in primitive. | Code review. |

### Pilot Gate Sign-Off Template

```
PRIMITIVE: [Name]
DATE: [YYYY-MM-DD]
REVIEWER: [Name]

[ ] Visual Clarity: PASS / FAIL
[ ] Interaction Correctness: PASS / FAIL
[ ] Performance Budget: PASS / FAIL
[ ] Fallback Integrity: PASS / FAIL
[ ] No Reading Disruption: PASS / FAIL
[ ] Accessibility: PASS / FAIL
[ ] Config Decoupling: PASS / FAIL

OVERALL: APPROVED / BLOCKED

If BLOCKED, list blocking issues:
- ...
```

---

## READY TO IMPLEMENT CHECKLIST

Before implementation begins:

- [ ] All 7 primitives are DESIGN_LOCKED (confirmed above).
- [ ] Build order is approved (Phase 1–7).
- [ ] Runtime architecture plan is approved.
- [ ] Degradation policy is approved.
- [ ] Pilot gate criteria are approved.
- [ ] First primitive (Distribution Evolution) is greenlit for implementation.

---

**AWAITING APPROVAL**

Do not proceed to code until this document is approved.
