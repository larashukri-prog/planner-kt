**Diagnosis:** The Morning Routine task already exists in your saved state from before today's edit. `useDailySpawn` only refreshes subtasks at midnight, and even then it just resets `isCompleted` on the existing subtasks — it never adds new items from the recurring template. So "Hair" won't appear until something inserts it.

**Fix (in `src/lib/use-daily-spawn.ts`):**

When the engine finds an existing recurring task (the `matches.length > 0` branch around lines 111–128), also reconcile the subtasks against `entry.subtasks`:

- Compare existing subtask texts (case-insensitive, trimmed) to the template list.
- For any template item missing from the existing task, append a new `Subtask` (`{ id: uid(), text, isCompleted: false }`) to the end.
- Apply this once per session regardless of `dateChanged`, so the new "Hair" item shows up immediately on next render — no need to wait for midnight.
- Do NOT remove subtasks the user has added manually, and do NOT reorder existing ones — only append missing template items.

This is general (works for any future template additions), not a one-off Hair patch. No schema changes; no UI changes.