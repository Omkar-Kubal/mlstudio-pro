# V2 Failure Policy

**Version:** 2.0.0  
**Status:** FINAL  
**Authority:** This document defines failure classification and handling.

---

## Failure Classifications

### PASS

**Definition:** Lab executed successfully and all contract validations succeeded.

**Criteria:**
- No exceptions raised
- All scalar outputs within tolerance
- All shape contracts satisfied
- All invariants hold
- Execution completed within timeout

**Treatment:** No action required.

---

### SOFT_FAIL

**Definition:** Lab executed but produced warnings or minor deviations.

**Criteria:**
- Execution completed without fatal errors
- Minor numerical drift within acceptable bounds
- Deprecation warnings present
- Non-blocking validation issues

**Acceptable cases:**
- Floating-point precision differences (< 1e-6)
- Library deprecation warnings
- Convergence within relaxed tolerance
- Stochastic variation within seed-controlled bounds

**Treatment:** Logged for review. Does not block release.

---

### HARD_FAIL

**Definition:** Lab execution failed or contract validation failed.

**Criteria:**
- Exception raised during execution
- Timeout exceeded
- Contract validation failed
- Required output missing
- Numerical instability (NaN, Inf)

**Treatment:** Must be investigated. May block release.

---

## Release Blocking Rules

| Condition | Blocks Release |
|-----------|----------------|
| Any HARD_FAIL in core labs | Yes |
| SOFT_FAIL > 30% of labs | Yes |
| New HARD_FAIL in previously passing lab | Yes |
| SOFT_FAIL due to environment | No |
| HARD_FAIL due to known content issue | No (if documented) |

---

## Numerical Drift Policy

Numerical drift is tolerated if:
- Relative tolerance ≤ 1% (0.01)
- Absolute tolerance ≤ 1e-6
- Drift is deterministic across runs

Drift exceeding these bounds is SOFT_FAIL.

---

## Warning Treatment

| Warning Type | Classification |
|--------------|----------------|
| Deprecation warning | Ignored |
| Convergence warning | SOFT_FAIL |
| Numerical warning | SOFT_FAIL |
| Import warning | Ignored |

---

## Current State

As of V2 seal:
- PASS: 29
- SOFT_FAIL: 25
- HARD_FAIL: 30

HARD_FAIL cases are documented as content or environment issues.
They do not indicate runtime defects.
