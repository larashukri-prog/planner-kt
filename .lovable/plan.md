# Workout Quest + Rest Day

## Phase 1 — Spawning Engine (`src/lib/use-daily-spawn.ts`)

Add a new entry to `RECURRING_QUESTS`:

- `key`: `"workout"`
- `title`: `"💪 Workout"`
- `zone`: `"now"`
- `shouldSpawn`: `() => true` (daily)
- `subtasks`:
  1. Walk over to the IDX Fitness Center with a hype playlist
  2. Warmup: Pushups (3 sets to failure)
  3. Free Weights: Goblet Squats or Lunges (3x10)
  4. Free Weights: Overhead Press or Dumbbell Rows (3x10)
  5. Chug water & rack the weights

The existing engine already enforces the Anti-Guilt Rule via `recurringKey` matching: if an uncompleted Workout exists it bumps `createdAt` and resets subtask checkmarks; otherwise it inserts a fresh row through Supabase (via `addRecurringTask` → `use-tasks.ts`). No new query path needed — the user-scoped lookup happens in the in-memory `tasks` array which mirrors Supabase under RLS (`auth.uid()`).

## Phase 2 — Rest Day UI (`src/components/quest-app.tsx`)

In `TaskCard`, when `task.recurringKey === "workout"` AND `task.status === "now"`:

- Render a small "Rest Day" pill button next to the complete checkbox.
- Style: neutral slate/amber outline, muted text, Lucide `Coffee` icon, no neon glow — visually distinct from the "Complete" action.
- On click:
  1. Fire-and-forget `track('rest_day_logged')`.
  2. Trigger the existing success-flash animation.
  3. After ~320ms, call `updateTask` with `status: "completed"`, `completedAt: Date.now()`, and `title: "💪 Workout — [Rest Day]"` so it reads clearly on the Done Wall.

Using a title suffix instead of a new `is_rest_day` column avoids a Supabase migration; the `[Rest Day]` tag is the persisted flag. (If you'd rather have a real boolean column, say the word and I'll add a migration instead.)

## Phase 3 — Analytics (`src/components/quest-app.tsx`)

- `workout_completed`: fired in `CompleteCheckbox`'s claim handler when the completed task's `recurringKey === "workout"` and the title does not already contain `[Rest Day]`.
- `rest_day_logged`: fired from the Rest Day button handler.

Both go through the existing `track()` helper, which already queues via `queueMicrotask` so the UI never waits.

## Files touched

- `src/lib/use-daily-spawn.ts` — add Workout entry to `RECURRING_QUESTS`.
- `src/components/quest-app.tsx` — Rest Day button in `TaskCard`, conditional `workout_completed` event in completion handler.

No schema changes, no new dependencies (`Coffee` is already available via `lucide-react`).
