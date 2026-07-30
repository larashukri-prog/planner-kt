## Goal

Every `input`, `textarea`, `button` and `select` in Planner-KT announces its purpose to a screen reader — and, where several identical controls repeat (one per quest), announces *which* quest it acts on.

## What I verified first

I ran an accessible-name check against the live board: no control on the default view is currently nameless. The gaps are in states that only appear after interaction (expanded quest card, inbox, Done Wall) and in generic names that repeat.

The auth screen (`src/components/auth-screen.tsx`) already wraps both fields in `<label>`, and the `/design-system` page already pairs every `Input`, `Switch` and `Checkbox` with a `Label htmlFor` or an `aria-label`. Neither needs changes.

## Fixes — all in `src/components/quest-app.tsx`

### 1. Unnamed inputs (real screen-reader blockers)

- **"Add a micro-step…" input** in the expanded quest card — placeholder only. Add `aria-label={\`Add a step to ${task.title}\`}`.
- **Due-date `<input type="date">`** — no name at all. Add `aria-label={\`Due date for ${task.title}\`}`.

### 2. Names that repeat and give no context

Today a screen-reader user tabbing the board hears "Delete, Delete, Delete". Each of these becomes quest-specific:

| Control | Now | Becomes |
| --- | --- | --- |
| Inbox delete | `Delete` | `Delete quest: {title}` |
| Card delete | `Delete quest` | `Delete quest: {title}` |
| Done Wall delete | `Delete` | `Delete quest: {title}` |
| Subtask remove | `Remove step` | `Remove step: {text}` |
| Subtask checkbox | `Mark complete` | `Mark step complete: {text}` |
| Complete checkbox | `Complete quest` | `Complete quest: {title}` |
| Rest Day | `Log as rest day` | `Log today as a rest day for Workout` |

### 3. Buttons whose label is a symbol

- **`ZoneQuickButton`** renders `← Now`. The arrow is decorative but read aloud. Wrap the arrow in `aria-hidden="true"` and add `aria-label={\`Move ${taskTitle} to ${label}\`}` (needs a new `taskTitle` prop, passed from the three call sites).
- **Zone move buttons inside the expanded card** (`→ now`) — same treatment: `aria-label={\`Move to ${zoneLabel}\`}`, arrow hidden. Also map the internal status keys to the user-facing zone names so it says "Later"/"Future", not "next"/"later".
- **Done Wall "undo"** — `aria-label={\`Move ${title} back to Later\`}`.
- **Template chips** — the emoji span gets `aria-hidden="true"` so the name is just "Laundry Loop", not "basket Laundry Loop".

### 4. State that a name alone can't carry

- **Quest title button** (expands the card): add `aria-expanded={open}` and `aria-label={\`${task.title} — ${open ? "collapse" : "expand"} details\`}`, so the toggle role is announced rather than inferred.
- **View toggle** (Board / Done Wall): add `aria-pressed={active}` to each button so the selected view is announced.

## Verification

After the edits I'll re-run the accessible-name sweep in the browser across four states — board, an expanded quest card, the inbox with an unsorted quest, and the Done Wall — asserting that zero controls resolve to an empty name and that no two controls in the same view share an identical one. Then a typecheck.

## Not changing

- Colour/contrast work — already completed and documented in Section 01 of `/design-system`.
- `src/components/ui/*` (shadcn primitives) — Radix already handles ARIA there; the labelling responsibility sits at the call sites listed above.
