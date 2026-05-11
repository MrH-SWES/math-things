# Harness

This directory contains reusable templates and review files for agent work on Math Things apps.

---

## Before Starting Any App Task

1. **Read `docs/00_MATH_THINGS_DESIGN_DOCTRINE.md`** — the full design doctrine.
2. **Read `docs/12_DO_NOT_VIOLATE.md`** — short list of hard rules.
3. **Work on one app at a time** unless explicitly instructed otherwise.
4. **Target app file is `apps/<slug>/index.html`**, not a root-level HTML file.

---

## After Completing Any App Task

Update `harness/reviews/LATEST_REVIEW.md` using the review format below.

---

## Review Format

```
# Latest Review

Status: PASS / FAIL / NOT RUN

Must Fix:
- ...

Should Fix Soon:
- ...

Notes:
- Files changed:
- Behavior changed:
- Doctrine principles applied:
- Desktop behavior:
- Mobile behavior:
- Accessibility notes:
- Remaining risks:

Acceptance Tests:
- ...

Do not mark PASS unless:
- ...
```

**PASS** means the task met the stated acceptance tests — not that the app is perfect.

**FAIL** is acceptable when the review honestly identifies remaining issues.

---

## Template Files

| File | Purpose |
|------|---------|
| `AGENT_PROMPT_TEMPLATE.md` | Template for writing new agent task prompts |
| `APP_REVIEW_TEMPLATE.md` | Template for post-task review entries |
| `APP_AUDIT_TEMPLATE.md` | Template for full app audits |
| `reviews/LATEST_REVIEW.md` | Most recent task review (always overwrite this file) |
