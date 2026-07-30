## Goal

Reposition the `/design-system` documentation so Planner-KT reads as an assistive-technology app for cognitive accessibility and college-life routine management. Tokens are added and documented only — the live board is untouched this round.

## 1. Foundations — cognitive load & density

- Rewrite the page intro and the Foundations section description so the stated primary constraint is **reducing cognitive overwhelm**, not visual polish.
- Add a short "Density contract" card at the top of Foundations:
  - **Comfortable density is the strict default** for all daily views: `py-3` rows, minimum 44×44px touch targets, generous line spacing.
  - **High-density layouts are restricted** to audit/backlog surfaces (the existing data-dense grid) and must never be the default on a daily screen.
  - Density only ever moves along the 4px grid; components are never forked.
- Cross-reference this rule from the existing data-dense grid pattern so it's labeled as an audit-only surface.

## 2. Color palette cards show the raw value

Extend the `Swatch` component in `src/components/design-system/parts.tsx` to render four things per card:

1. the visual swatch
2. the semantic name (Primary)
3. the Tailwind utility class (`bg-primary`) — the thing components are allowed to consume
4. the raw OKLCH value in `font-mono text-xs text-muted-foreground`, marked "reference only"

The core and brand/zone palette arrays get `utility` and `oklch` fields (light-mode value, with dark-mode value shown where it differs). A one-line caption under each grid restates that components consume utilities, never raw values.

## 3. Life Maintenance tokens

Add a small, deliberately low-saturation token family to `src/styles.css` (both `:root` and `.dark`, plus `@theme inline` mappings), so recurring college-life prompts read as calm and routine rather than urgent:

- `--life` / `--life-text` — the calm base cue for life maintenance (soft, desaturated, distinct in hue from the vivid quest accents)
- `--life-surface` — a very quiet tinted surface for the card background
- Category sub-cues on the same low-chroma family for laundry / food / body (workouts) so they are distinguishable at a glance without adding visual noise

Rules to document alongside them:
- Life-maintenance cues are **lower chroma than academic/quest accents** — routine work should never compete for attention with deadlines.
- Every `-text` variant clears 4.5:1 on `--background` and `--card` in both themes (verified with measured ratios added to the existing contrast table).
- No red/alarm hues in this family; time sensitivity is communicated by a Badge, not by color alone.

Add a "Life maintenance" swatch grid in Foundations using the extended Swatch card.

## 4. New pattern — Recurring Life Prompt

Add a `RecurringLifePromptDemo` to `src/components/design-system/demos.tsx` and a matching `Example` in the Enterprise UI Patterns section. The card composes existing atoms only:

- `Checkbox` for each step, at the 44px comfortable target
- `Badge` for **frequency** (e.g. "Every Friday", "Daily") and a separate neutral `Badge` for **time sensitivity** ("Flexible" / "Today")
- Life-maintenance token for the left cue rail and quiet surface tint
- Strict 4px-grid spacing (`p-4`, `gap-3`, `py-3` rows)

The Example carries the standard accessibility and composable-API notes: group labelled by the card heading, badges as text (not color-only), reduced-motion respected, and the pattern extensible by swapping the badge pair.

## 5. Middle Layer — Daily Spawn Engine

Extend the Middle Layer Architecture section with a "Daily Spawn Engine" subsection documenting `src/lib/use-daily-spawn.ts` as the canonical example of the middle layer removing daily setup work from the student:

- A template table (title, cadence, target zone) mirroring the real recurring quests.
- The **Anti-Guilt Rule**: an existing uncompleted instance is refreshed in place, never duplicated.
- The rollover tick: local date key in namespaced storage, subtask reset on scheduled days, template drift reconciliation (missing subtasks added, obsolete ones pruned).
- Auto-escalation as the second pass of the same tick, and the fact that it never demotes.
- An annotated code excerpt plus a line added to the ArchitectureDiagram flow showing the timer → hook → persistence path.
- One sentence framing the accessibility intent: the routine is built, persisted and surfaced automatically, so working memory is never the thing keeping the routine alive.

## Technical notes

- Files touched: `src/styles.css` (new tokens + `@theme inline` mappings), `src/components/design-system/parts.tsx` (Swatch), `src/components/design-system/demos.tsx` (new demo), `src/routes/design-system.tsx` (copy, swatch data, new pattern + architecture subsection), and the route `head()` description.
- No changes to `quest-app.tsx`, `use-tasks.ts`, or `use-daily-spawn.ts` — documentation describes existing behavior.
- Verification: contrast ratios computed for every new `-text` token in both themes, and an axe-core pass over `/design-system` in light and dark before finishing.
