# Daily XP Progress Bar

Add a global "Daily XP" progress bar to the main dashboard, styled like a premium video game level bar with neon glow and framer-motion animated fill.

## Placement

In `src/components/quest-app.tsx`, inside the `view === "board"` motion wrapper, render `<DailyXPBar />` **between `<InboxStrip />` and `<ZoneBoard />`** (full-width within the existing `max-w-7xl` container). The user spec says "below WorkspaceToggle, above ZoneBoard" — in this codebase WorkspaceToggle lives in the Header and is followed by the QuickAddBar + InboxStrip, so the practical "above the board" slot is just before `<ZoneBoard />`.

The bar always renders on the board view (not on the Done Wall), filtered to the current workspace so solo vs family stays consistent with the rest of the UI.

## Logic

New component `DailyXPBar` receives the already workspace-filtered `tasks` array.

- "Today" = same calendar day as `Date.now()` (local time, midnight boundary).
- `completedToday` = tasks where `status === "completed"` AND `completedAt` falls today.
- `nowCount` = tasks where `status === "now"` (active quests still on the board).
- `denominator = nowCount + completedToday.length`.
- `percent = denominator === 0 ? 0 : Math.round((completedToday.length / denominator) * 100)`.

Empty state (`denominator === 0`): render the track with no fill and centered muted text **"Ready for today's campaign."**

Populated state: centered label **"Daily Completion: {percent}% XP"** over the bar, with a small right-aligned mono counter `{completed}/{denominator}`.

## Visual design

- Outer card: `quest-card` style, dark, full width, ~56px tall, rounded.
- Track: inset dark pill (`bg-secondary/40`) with subtle inner shadow.
- Fill: `motion.div` whose `width` animates to `${percent}%` via `framer-motion` (`transition: { type: "spring", stiffness: 120, damping: 20 }`).
- Fill gradient uses existing tokens: `linear-gradient(90deg, var(--color-neon) 0%, var(--color-neon-2) 100%)` with `box-shadow: var(--shadow-neon)` and a soft glow via a blurred sibling layer at low opacity.
- Animated shimmer: a thin `motion.div` overlay translating x infinitely for the "energy" feel (respect `prefers-reduced-motion` — skip when set).
- Header row above the bar: small mono caption "DAILY XP" + Flame/Sparkles icon in neon, plus the percent on the right.

## 100% celebration

When `percent` transitions from `<100` to `100`:

- Trigger a one-shot scale pulse on the outer card (`animate={{ scale: [1, 1.02, 1] }}`, ~450ms).
- Render a brief sparkle burst: 6 small `motion.span` dots positioned along the bar, animating opacity/scale/translate out over ~700ms via `AnimatePresence`.
- Briefly swap the label to **"Campaign cleared!"** for ~1.6s, then return to "Daily Completion: 100% XP".
- Use a `useRef` to track previous percent so the effect only fires on the rising edge, not on every re-render.

## Files

- **Edit** `src/components/quest-app.tsx`:
  - Add `DailyXPBar` component (co-located, same file pattern as other sub-components).
  - Render it inside the board view between `<InboxStrip />` and `<ZoneBoard />`, passing `tasks={filtered}`.

No changes to `use-tasks.ts`, `quest-types.ts`, or styles.css are needed — all visuals use existing CSS variables (`--color-neon`, `--color-neon-2`, `--shadow-neon`, `--color-secondary`, etc.).
