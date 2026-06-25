## Goal

Make the four recurring quests reliably honor the confirmed spec:

- 🛡️ Morning Routine — daily → NOW
- 🧺 Laundry Loop — Fridays → NOW
- 🛒 Restock Fuel — Tuesdays & Saturdays → NOW
- 🗺️ Explore Burlington — every other day → LATER

Anti-Guilt rule: if an uncompleted instance already exists, refresh its timestamp instead of stacking a duplicate. If it was completed yesterday (or the day's scheduled to spawn and nothing's there), drop a fresh one in.

## Why this morning's Morning Routine didn't show

Three bugs in the current implementation:

1. **`src/lib/use-daily-spawn.ts`** runs the spawn tick on mount using a `tasksRef` that is still empty — tasks load asynchronously from the backend. With an empty list the engine wrongly concludes "no match" and either spawns a duplicate (later eaten by the dedupe pass, leaving the stale row visible) or skips spawning entirely.
2. The `dateChanged` flag is gated by `localStorage` (`questlog.lastSpawnDate.v1`), stamped before the real task list has loaded. A refresh earlier in the day "consumes" the rollover, so the next visit on the same calendar day never re-evaluates.
3. **`src/lib/use-tasks.ts`** — the Anti-Guilt timestamp refresh (`createdAt: Date.now()`) is silently dropped by `patchToUpdate`, which has no mapping for `createdAt`. The card stays stale even when the engine "refreshed" it.

## Fix

### `src/lib/use-daily-spawn.ts`

- Add a `hasLoadedTasks` ref that flips true the first time `tasks` transitions from empty to populated, OR after a short grace period (~1500 ms) so brand-new accounts with zero tasks still spawn.
- Hold the spawn / escalation pass until `hasLoadedTasks` is true, then run immediately.
- Stamp `TICK_KEY` only after a pass that ran against a loaded task list. A reload earlier in the day no longer "consumes" the rollover.
- Keep the 60s interval so a tab left open across midnight still triggers rollover.
- Per recurring entry:
  - **Match found** (active task with same `recurringKey` or normalized title): adopt orphan, dedupe extras (keep oldest), backfill missing template subtasks. On `dateChanged && shouldSpawn(today)`, reset subtask completion AND bump `createdAt` (Anti-Guilt refresh).
  - **No match AND `shouldSpawn(today)`**: spawn a fresh instance via `addRecurringTask` in the configured zone.
  - **No match AND `!shouldSpawn(today)`**: do nothing (don't spawn Laundry on a Wednesday).
- Keep the auto-escalation block as-is — gated on `dateChanged`, promote-only.

### `src/lib/use-tasks.ts`

- Extend `patchToUpdate` to map `createdAt` → `created_at` (ISO string), so the Anti-Guilt timestamp refresh actually persists.

### Subtask list note

The spec you just pasted lists Morning Routine as `["Shower", "Brush Teeth", "Wash Face & Skincare"]` (3 items), but you previously asked to add **Hair**. This plan keeps the current 4-item list `["Shower", "Brush Teeth", "Wash Face & Skincare", "Hair"]`. Say the word if you want Hair removed.

## Verification

- Simulate "yesterday" by setting `questlog.lastSpawnDate.v1` to a past date and reloading: an existing incomplete Morning Routine has its subtasks unchecked and `createdAt` bumped; no duplicate appears.
- Morning Routine completed yesterday → a fresh instance appears at the top of NOW today.
- Mid-day reload → today's instance is preserved with current subtask checkmarks; no duplicate spawn.
- A manually-added task left incomplete yesterday is still present today, untouched.
- Laundry Loop only appears on Fridays; Restock Fuel only Tue/Sat; Explore Burlington alternates and lives in LATER.
