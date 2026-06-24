The Morning Routine subtasks live in two places:

1. **Template chip** — `src/components/quest-app.tsx` line 274: the list shown to the user when they click the "Morning Armor" template chip.
2. **Daily spawn** — `src/lib/use-daily-spawn.ts` line 23: the list used when the app auto-spawns the recurring Morning Routine quest each day.

Currently the two lists differ slightly (the daily spawn merges "Wash Face" + "Skincare" into one item).

## Changes

- In `src/components/quest-app.tsx` (line 274), append `"Hair"` to the subtasks array:
  ```
  ["Shower", "Brush Teeth", "Wash Face", "Skincare", "Deodorant", "Perfume", "Hair"]
  ```

- In `src/lib/use-daily-spawn.ts` (line 23), append `"Hair"` to the subtasks array:
  ```
  ["Shower", "Brush Teeth", "Wash Face & Skincare", "Hair"]
  ```

No other code changes required. The new subtask will appear in newly created or respawned Morning Routine quests immediately.