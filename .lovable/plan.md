Scope
- In the recurring "Explore College Town" quest, keep the subtask "Pick a local spot" but remove the parenthetical examples "(Church St, Lake Champlain, or a new coffee shop)" so the subtask is generic and location-agnostic.

Current state
- The text only exists in one place: `src/lib/use-daily-spawn.ts`, line 59, inside the `subtasks` array for the `explore-college-town` recurring quest.
- A codebase search for "Church", "Champlain", "coffee shop", and "pick a local spot" found no other occurrences.

Change
- `src/lib/use-daily-spawn.ts` line 59
  - From: `"Pick a local spot (Church St, Lake Champlain, or a new coffee shop)"`
  - To: `"Pick a local spot"`

Verification
- Re-run `rg -n "Church|Champlain|coffee shop" src/` to confirm zero remaining occurrences.
- Re-run `rg -n "Pick a local spot" src/lib/use-daily-spawn.ts` to confirm the trimmed subtask remains.
- Optionally run `bun run build` to confirm the change compiles cleanly.
