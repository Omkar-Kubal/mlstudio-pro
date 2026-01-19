# STEP C — Authoring Guidelines

**Date:** 2026-01-19  
**Scope:** Rules for content writers using visual primitives  
**Audience:** Non-technical authors creating MLStudio Pro content  

---

## 1. WHEN A VISUAL IS MANDATORY

| Condition | Rule |
| :--- | :--- |
| Topic is in registry with ✅ status | Visual MUST be included |
| Topic involves dynamic cause→effect | Visual MUST be included |
| Topic explains a slider-driven concept | Visual MUST be included |

**Examples:**
- "Underfitting vs Overfitting" → **Fit Progression required**
- "Decision Boundaries" → **Boundary Morphing required**
- "Vanishing Gradients" → **Gradient Backflow required**

---

## 2. WHEN VISUALS ARE FORBIDDEN

| Condition | Rule |
| :--- | :--- |
| Topic is in registry with ❌ status | NO primitive allowed |
| Topic is definitional (no dynamic exists) | NO primitive allowed |
| Topic is locked for V2 | NO primitive allowed; static diagram only |

**Forbidden Topics (V1):**
- Probability Basics
- Bayes Theorem
- PCA, t-SNE
- CNNs, RNNs, Transformers

*Static diagrams are permitted but NOT interactive primitives.*

---

## 3. VISUAL PLACEMENT RULES

| Rule | Specification |
| :--- | :--- |
| **Maximum per topic** | 1 primitive per topic |
| **Minimum per topic** | 0 (if topic is ❌ or text-only) |
| **Position** | After 2-3 sentences of context, before detailed explanation |
| **Never** | At the very start (no context) |
| **Never** | At the very end (anti-climactic) |

**Pattern:**
```
[2-3 sentences: What is the concept?]
[VISUAL INTUITION: PRIMITIVE_NAME]
[Detailed explanation referring to the visual]
```

---

## 4. HOW TO INSERT A VISUAL

### Syntax
```
[VISUAL INTUITION: PRIMITIVE_NAME]
```

### Valid Primitive Names
| Tag | Primitive |
| :--- | :--- |
| `DISTRIBUTION_EVOLUTION` | Distribution Evolution (P1) |
| `FIT_PROGRESSION` | Fit Progression (P2) |
| `BOUNDARY_MORPHING` | Boundary Morphing (P3) |
| `METRIC_DASHBOARD` | Metric Dashboard (P4) |
| `CLUSTER_FORMATION` | Cluster Formation (P5) |
| `NETWORK_FORWARD_PASS` | Network Forward Pass (P6) |
| `GRADIENT_BACKFLOW` | Gradient Backflow (P7) |

### Invalid Tags (Will Cause Errors)
- Misspelled names
- Custom primitive names not in registry
- V2 primitive names (not implemented)

---

## 5. TEXT AROUND VISUALS

### Before the Visual (REQUIRED)
- 2-3 sentences introducing the concept
- State what the user is about to see
- Ask a question the visual will answer

**Good:**
> "Overfitting occurs when a model memorizes training data instead of learning patterns. But how much flexibility is too much? Drag the complexity slider to see."

**Bad:**
> "[VISUAL INTUITION: FIT_PROGRESSION]" (no context)

### After the Visual (REQUIRED)
- Reference specific visual elements ("Notice how the curve...")
- Explain what happens at extreme slider values
- Connect back to the concept

**Good:**
> "Notice how the red test curve diverges when complexity exceeds 5. This is the overfitting region."

**Bad:**
> "The visual shows overfitting." (too vague)

---

## 6. COMPOSITION RULES

When a topic requires composition (multiple primitives or primitive + static):

| Rule | Specification |
| :--- | :--- |
| Max primitives in composition | 2 |
| Composition layout | Vertical (stacked), never side-by-side |
| Transition text | Required between each visual |

**Pattern:**
```
[Context for first visual]
[VISUAL INTUITION: PRIMITIVE_A]
[Transition: "Now let's see how this affects..."]
[VISUAL INTUITION: PRIMITIVE_B]
```

---

## 7. STATIC VISUAL RULES

For topics with static SVG/PNG diagrams:

| Rule | Specification |
| :--- | :--- |
| Format | SVG preferred, PNG acceptable |
| Caption | Required below image |
| Alt text | Required for accessibility |
| Never | Use static when primitive exists |

**Syntax:**
```markdown
![Alt text describing the diagram](/path/to/diagram.svg)
*Caption: Correlation values range from -1 to +1.*
```

---

## 8. ANTI-PATTERNS (WHAT AUTHORS MUST NEVER DO)

| Anti-Pattern | Why It's Wrong | Correct Alternative |
| :--- | :--- | :--- |
| Visual at top of topic | No context for user | Add 2-3 sentences first |
| Visual at bottom of topic | Anticlimactic, forgotten | Move to middle |
| Multiple primitives for one concept | Cognitive overload | Pick the best one |
| Primitive for definitional topic | No slider behavior exists | Use static diagram |
| Generic caption ("see visual") | Doesn't guide attention | Reference specific elements |
| Primitive for V2 topic | Will error | Use static diagram |
| Side-by-side visuals | Layout breaks on mobile | Stack vertically |
| Embedding untested primitive tag | Runtime error | Check registry first |

---

## 9. EXAMPLES

### ✅ GOOD EXAMPLE

**Topic: Underfitting vs Overfitting**
```markdown
A model's complexity determines how closely it can fit training data.
Too simple and it misses patterns (underfitting).
Too complex and it memorizes noise (overfitting).

[VISUAL INTUITION: FIT_PROGRESSION]

Drag the complexity slider from 1 to 10. Notice:
- At degree 1, the line is too straight (underfitting)
- At degree 4-5, the curve balances fit and generalization
- At degree 10, the curve passes through every point but performs poorly on test data (overfitting)

Toggle "Show Test Data" to see the generalization gap appear.
```

### ❌ BAD EXAMPLE

**Topic: Underfitting vs Overfitting**
```markdown
[VISUAL INTUITION: FIT_PROGRESSION]

Overfitting is bad. Underfitting is also bad. The model should be just right.
```

**Problems:**
1. No context before visual
2. No guidance on what to observe
3. No reference to slider or toggle
4. Generic explanation

---

## 10. CHECKLIST FOR AUTHORS

Before submitting content with a visual:

- [ ] Topic is in registry with ✅ status
- [ ] 2-3 context sentences before visual tag
- [ ] Visual tag uses correct primitive name
- [ ] Text after visual references specific elements
- [ ] Slider/toggle behavior is explained
- [ ] No side-by-side layouts
- [ ] No V2 primitive tags used
- [ ] Caption/alt text included (static visuals)

---

## STEP C COMPLETE

Authoring guidelines finalized:
- 10 sections covering all rules
- Good/bad examples included
- Checklist for authors provided

**All Steps (A, B, C) Complete — Visual System Closed**
