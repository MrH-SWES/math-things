# Math Things Accessibility and SPED Guidance

The goal is to **lower the reading burden while raising mathematical clarity**.

Design for conceptual access, not only compliance.

---

## Core Requirements

### Large Touch Targets

Interactive elements must be large enough for a child's finger on a tablet. Default minimum target size: 44×44px. Prefer larger for primary mathematical objects.

### Projection-Friendly Layouts

Apps will be projected in classrooms. Use sufficient contrast, large objects, and clear visual hierarchy that reads from the back of a room.

### Tablet-First Interaction

Design for touch-first interaction. Mouse/pointer support is expected but secondary. The mathematical gesture should feel natural on a touchscreen.

### Keyboard and Fallback Access Where Practical

Where direct manipulation cannot be made keyboard-accessible without degrading the mathematical experience, provide a reasonable keyboard fallback. Hidden accessible labels are allowed even when visible text is minimized.

---

## Text and Language

### Minimize Visible Student-Facing Prose

Visible student-facing prose should be avoided unless absolutely necessary. When labels or short instructions are required, keep them to the minimum needed for initial orientation — and then remove them from the ongoing experience.

### Use Hidden Accessible Labels

Accessible labels (aria-label, aria-labelledby, visually hidden text) are allowed and encouraged even when visible text is minimized. Screen reader access should be considered even for highly visual tools.

### Teacher-Facing Language Lives Outside the App

Lesson plans, prompts, standards alignment, discussion moves, and vocabulary support belong in teacher-facing materials that live around the app — not inside the student surface.

---

## SPED Considerations

- Avoid sensory overload: limit the number of simultaneous animations, sounds, and moving elements.
- Prefer calm, neutral backgrounds that focus attention on the mathematical object.
- Reduce cognitive load: one object, one action, one mathematical idea per app.
- Do not depend solely on color to convey mathematical structure — pair color with shape, size, or position.
- Avoid time pressure or countdown mechanics unless they are mathematically essential.
- Teacher-controllable toggles (e.g., showing/hiding symbolic labels) support differentiated instruction without building separate apps.
