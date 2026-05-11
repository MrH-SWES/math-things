# Math Things. | Math, in your hands.

This repository is the **Math Things app lab** — a collection of digital manipulatives for K–5 classrooms.

## What is a Math Thing?

A Math Thing is not a standalone lesson, tutor, worksheet, quiz, dashboard, or game with math pasted on top. It is a physical-feeling mathematical object that a teacher can place in front of students so the mathematics becomes something to move, split, join, compare, measure, sort, rotate, bundle, unbundle, transform, or build.

The teacher teaches. The tool gives the teacher something worth teaching with.

## Repository Structure

Each app lives as a self-contained single-file HTML prototype at `apps/<slug>/index.html`.

```
math-things/
├── index.html                    # App launcher — links to all apps
├── apps/                         # One directory per app
│   ├── ten-frame/index.html
│   ├── rekenrek/index.html
│   ├── number-bond/index.html
│   └── ...                       # (one folder per app)
├── docs/                         # Shared doctrine, rubrics, and catalog
│   ├── 00_MATH_THINGS_DESIGN_DOCTRINE.md
│   ├── 01_MATERIAL_SYSTEM.md
│   ├── 02_INTERACTION_DOCTRINE.md
│   ├── 03_APP_AUDIT_RUBRIC.md
│   ├── 04_ACCESSIBILITY_AND_SPED.md
│   ├── 05_APP_CATALOG.md
│   └── 12_DO_NOT_VIOLATE.md
└── harness/                      # Agent workflow templates
    ├── README.md
    ├── AGENT_PROMPT_TEMPLATE.md
    ├── APP_REVIEW_TEMPLATE.md
    ├── APP_AUDIT_TEMPLATE.md
    └── reviews/
        └── LATEST_REVIEW.md
```

## How This Repo Works

- Shared doctrine docs in `docs/` define what a Math Thing is and how to build, audit, and improve them.
- Harness files in `harness/` give agents reusable templates for prompts, reviews, and audits.
- **Agents should work on one app at a time** unless explicitly instructed otherwise.
- The authoritative design source is `MATH_THINGS_UPDATED_DESIGN_DOCTRINE.md`.

## Key Docs

| File | Purpose |
|------|---------|
| `docs/00_MATH_THINGS_DESIGN_DOCTRINE.md` | Full design doctrine — read before any app work |
| `docs/12_DO_NOT_VIOLATE.md` | Short list of hard rules for agents |
| `docs/05_APP_CATALOG.md` | Catalog of all current apps and their audit status |
| `harness/AGENT_PROMPT_TEMPLATE.md` | Template for writing new agent task prompts |
| `harness/APP_AUDIT_TEMPLATE.md` | Template for auditing individual apps |
| `harness/reviews/LATEST_REVIEW.md` | Most recent agent task review |

## GitHub Pages

Apps are served at:

```
https://mrh-swes.github.io/math-things/apps/<slug>/
```

The app launcher is at:

```
https://mrh-swes.github.io/math-things/
```
