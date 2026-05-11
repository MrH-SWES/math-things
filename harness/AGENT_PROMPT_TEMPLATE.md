# Agent Prompt Template

Use this structure when writing task prompts for agents working on Math Things apps.

---

# Title

[One-line description of the task, e.g., "Improve rekenrek bead interaction feel"]

---

# Read files

[List every file the agent must read before beginning. Always include:]
- `docs/00_MATH_THINGS_DESIGN_DOCTRINE.md`
- `docs/12_DO_NOT_VIOLATE.md`
- The target app file(s): `apps/<slug>/index.html`
- Any relevant harness files

---

# Edit only

[List the exact files the agent is allowed to modify. Be explicit.]

---

# Do not edit

[List files that must not be touched. Always include:]
- All other `apps/*/index.html` app files
- Service worker files
- Deployment files
- `index.html` (root launcher)

---

# Do not add

[List things that must not be introduced, e.g.:]
- Frameworks, bundlers, or package managers
- Dashboard UI
- Visible instruction text
- Badges, points, or reward systems

---

# Task

[Short description of the work to be done. What is the goal?]

---

# Requirements

[Numbered list of specific, testable requirements. Each one should be verifiable.]

1. ...
2. ...

---

# Implementation guidance

[Optional: notes on approach, constraints, preferred methods, or things to be careful about. Do not prescribe code — describe intent.]

---

# Acceptance tests

[List of explicit pass/fail conditions. Each test should be unambiguous.]

- [ ] ...
- [ ] ...

---

# Required review update format

After completing the task, update `harness/reviews/LATEST_REVIEW.md` with:

```
# Latest Review

Status: PASS or FAIL

Must Fix:
- None / items

Should Fix Soon:
- items

Notes:
- Files changed:
- Behavior changed:
- Doctrine principles applied:
- Desktop behavior:
- Mobile behavior:
- Accessibility notes:
- Remaining risks:

Acceptance Tests:
- [each test] PASS / FAIL
```

---

# Do not mark PASS unless…

[List specific conditions that must be true before marking PASS. Be strict.]

- All stated acceptance tests pass.
- No existing app files were modified outside the stated scope.
- No app behavior changed in unintended ways.
- No frameworks, bundlers, or package managers were added.
