## Add `dueDate` + Auto-Escalation Engine

### 1. Schema (`src/lib/quest-types.ts`)
- Add `dueDate?: number | null` (stored as a timestamp at local midnight of the chosen day) to `Task`.
- Add `escalatedAt?: number | null` — timestamp of the last auto-escalation, used to drive the temporary glow flag.

### 2. TaskCard UI (`src/components/quest-app.tsx`)

**Front of the card (always visible when `dueDate` is set):**
- Small pill-style badge near the title/category row: calendar icon + relative label (`Today`, `Tomorrow`, `in 3d`, `5/12`, or `Overdue` in red). Subtle muted styling; uses semantic tokens, no hardcoded colors.

**Expanded card, near the micro-step checklist:**
- "Add Due Date" ghost button with Lucide `Calendar` icon. When no date set → button text "Add due date". When set → shows formatted date and acts as edit affordance, plus a small `X` to clear.
- Clicking reveals an inline native `<input type="date">` (one-click, no popover dependency). On change, calls `updateTask(id, { dueDate: parsedTimestamp })`. Clearing sets `dueDate: null`.

**Escalation flash:**
- If `escalatedAt` is within the last 24h, the card gets a temporary glowing border (warm amber for 7-day escalation → `next`, red for 2-day escalation → `now`). Implemented as a class on the outer card wrapper driven by a new `data-escalated` attribute; styles added in `src/styles.css` so they work cleanly in both light and dark mode without dulling the existing game accents.
- The glow is cleared the next time the user interacts with the card (move/toggle/edit) by setting `escalatedAt: null`.

### 3. Auto-Escalation Engine (`src/lib/use-daily-spawn.ts`)

Hook the engine into the existing `runTick()` so it runs at app start and at every minute tick, but the actual escalation pass only fires when `dateChanged` is true (the once-per-day midnight rollover the recurring spawner already uses). This keeps escalation a true "daily server tick" without adding a second scheduler.

For each active (non-`completed`) task with a `dueDate`:

```text
daysUntil = ceil((dueMidnight - todayMidnight) / 1 day)

if status === "later" && daysUntil <= 7 && daysUntil > 2:
    → status = "next",  escalatedAt = now   (Warning Zone, amber)

if (status === "later" || status === "next") && daysUntil <= 2:
    → status = "now",   escalatedAt = now   (Action Zone, red)
```

Rules:
- **Never demote.** A task already in `now` is never touched, even if `dueDate` is far away.
- A `later` task that is already inside 2 days jumps straight to `now` (skips `next`).
- Overdue tasks (`daysUntil <= 0`) are treated as Action Zone and pinned to `now`.
- Completed tasks are ignored.

### 4. Wiring

- `useDailySpawn` gains a new param: the full `updateTask` is already passed in, so the escalation pass just calls `updateTask(id, { status, escalatedAt })` after the recurring-spawn loop completes.
- No new dependencies. No QuickAddBar changes. No backend changes (everything stays in localStorage via the existing `useTasks` persistence).

### Technical notes

- `dueDate` is normalized to local-midnight ms so day math is stable across timezones / DST.
- Relative label helper (`formatDueLabel`) lives next to `TaskCard` in `quest-app.tsx`.
- Escalation glow classes (`.escalated-warn`, `.escalated-act`) added to `src/styles.css` using existing CSS custom properties; they layer a soft `box-shadow` ring so they coexist with the existing neon/XP accents instead of replacing them.
