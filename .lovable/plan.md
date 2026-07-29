## Goal

Upgrade the existing `/design-system` page with enterprise-grade structural rigor: a documented 4px grid, WCAG 2.1 AA notes on every atom, data-dense "Enterprise UI Patterns", and a stronger AI-contribution rationale. All work stays inside `src/routes/design-system.tsx` and `src/components/design-system/parts.tsx` — the live app is untouched apart from nothing at all.

## 1. Foundations & Tokens — 4px base grid

- New subsection "The 4px base grid" placed after the existing spacing scale.
- Left: a visual ruler showing steps 1–16 (4px → 64px) with an overlaid 4px-repeating background so multiples align visibly; each step labeled with the Tailwind token (`p-2`), rem, and px value.
- Right: a **density comparison** — the same task row rendered twice from the same atoms:
  - Standard density: `py-3` / `gap-3` / 44px row height (touch target compliant).
  - Compact density: `py-1` / `gap-2` / 28px row height for high-data-density tables.
  Both annotated with the multiples used, showing the grid is the only thing that changes.
- Short prose note: every padding, gap, height and icon size resolves to a multiple of 4, which is what keeps mixed-density views optically aligned.

## 2. Atomic Components — accessibility + API notes

- Extend the `Example` component in `parts.tsx` with two optional props: `a11y` (string) and `api` (string).
- Render them under the preview as a small two-line meta block: a shield/check icon + "WCAG 2.1 AA" line, and a puzzle icon + composable-API line.
- Fill in per component:
  - Button — 44px min target on default size, visible `focus-visible` ring, `asChild` polymorphism, cva variants.
  - Input/Label — programmatic label association, `aria-invalid` support, `aria-describedby` for errors.
  - Badge — non-color-dependent meaning (text label always present), `asChild` for links.
  - Switch/Checkbox — Radix roles, keyboard operable, controlled/uncontrolled APIs.
  - Card — semantic slot composition (Header/Title/Description/Content), heading-level agnostic.
- Add one line in the section description stating all atoms target WCAG 2.1 AA (contrast, focus visibility, keyboard operability, target size).

## 3. Enterprise UI Patterns

- Rename section title to "Enterprise UI Patterns" and the nav label accordingly (`NAV` entry + sidebar/mobile chips update automatically).
- Replace/augment the pattern set with three composed demos:
  1. **Data-Dense Task Grid** — a real `<table>` with sticky header, ~8 rows: select checkbox, quest title, zone badge, due date, owner, XP, status. Compact 4px-grid row rhythm, zebra-free divide-y rows, `scope="col"` headers, a `<caption class="sr-only">`, sortable-column buttons with `aria-sort`, and a density toggle (Comfortable/Compact) driven by the 4px scale to prove the same atoms scale.
  2. **Accessible Settings Form** — a real `<form>` with `<fieldset>`/`<legend>` groups, labeled inputs, help text wired via `aria-describedby`, one field showing an inline error with `aria-invalid` + `role="alert"`, switches for toggles, and a footer action row. Non-submitting demo (`onSubmit` prevented).
  3. Keep the **Daily XP progress strip** and Quest card as the lighter-density counterpart, so the section shows both ends of the density spectrum.
- Each pattern gets a short note on which atoms it composes and which a11y affordances it carries, plus a copyable code snippet.

## 4. AI-Native Contribution Model

- Rewrite the prose to add: dependency-light utility classes (no bespoke CSS layer, no component-library fork) mean a small, auditable surface — fewer transitive dependencies to patch, less dead CSS, and no drift-prone one-off stylesheets, i.e. minimized technical debt.
- Add that strict tokenized conventions make change *predictable*: a token edit propagates everywhere with a bounded blast radius, and any diff introducing a raw hex, inline style, or new dependency is mechanically detectable in review — the property enterprise teams need for secure, reviewable scaling.
- Extend the contribution-rules list with: "Prefer composition over new dependencies", "Every interactive pattern ships with keyboard and screen-reader behavior verified", "All spacing/sizing resolves to a 4px multiple".

## Technical notes

- No new packages; `lucide-react` icons only. No route, data, or business-logic changes.
- All colors via existing semantic tokens; no hardcoded color utilities.
- Heading order preserved (single `h1`, `h2` per section, `h3` for sub-blocks); density/sort toggles get accessible names; the data grid scrolls horizontally on mobile rather than overflowing.
- Update the route `head()` description to mention accessibility and enterprise patterns.
