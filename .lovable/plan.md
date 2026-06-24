Two small changes:

1. **Remove "Morning Armor" from the 1-click template chips.** In `src/components/quest-app.tsx` (line 274), delete the Morning Armor entry from the `QUEST_TEMPLATES` array. The Morning Routine still spawns automatically via `useDailySpawn`, so there's no reason to also have a manual chip for it.

2. **Hide the due-date control on recurring tasks.** In `TaskCard` (`src/components/quest-app.tsx`, the "Due date control" block around lines 731–794), wrap the entire `<div className="flex items-center gap-2">…</div>` so it only renders when `!task.recurringKey`. Recurring quests reset every 24h, so a due date is meaningless for them — this hides both the "Add due date" button and the existing date pill for recurring tasks. Non-recurring tasks keep the full due-date UI unchanged.

No changes to schema, escalation engine, or non-recurring task behavior.