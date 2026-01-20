# V2 Capability Matrix

**Version:** 2.0.0  
**Status:** FINAL  
**Authority:** This document defines V2 boundaries.

---

## What V2 Can Do

| Capability | Status |
|------------|--------|
| Execute notebooks headlessly | ✅ Active |
| Validate outputs against contracts | ✅ Active |
| Score labs (PASS/SOFT_FAIL/HARD_FAIL) | ✅ Active |
| Log execution with structured output | ✅ Active |
| Enforce deterministic seeds | ✅ Active |
| Generate execution reports | ✅ Active |
| Classify errors by taxonomy | ✅ Active |
| Run via `python -m runtime run` | ✅ Active |

---

## What V2 Cannot Do

| Capability | Status |
|------------|--------|
| Execute with UI interaction | ❌ Not supported |
| Render visuals to users | ❌ Not supported |
| Modify lab content | ❌ Not supported |
| Train models at runtime | ❌ Not supported |
| Load external datasets | ❌ Not supported |
| Accept user input | ❌ Not supported |
| Provide pedagogical feedback | ❌ Not supported |
| Integrate with frontend | ❌ Not supported |

---

## What Exists But Is Disabled

| Capability | Status |
|------------|--------|
| Projection visual primitive | ⏸️ Implemented, dormant |
| Sequence visual primitive | ⏸️ Implemented, dormant |
| Attention visual primitive | ⏸️ Implemented, dormant |
| Filters visual primitive | ⏸️ Implemented, dormant |
| Visual registry | ⏸️ Implemented, dormant |
| Visual contracts | ⏸️ Implemented, dormant |

---

## Boundary Definition

- **Active**: Executes when runtime is invoked
- **Not supported**: Does not exist; will not be added in V2
- **Dormant**: Exists but is never invoked in V2

---

## Contributor Guidance

Contributors must not:
- Activate dormant capabilities
- Add new capabilities
- Modify active capabilities

Any such change requires a new version.
