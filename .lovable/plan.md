## Goal
Ensure "Morning Armor" (Morning Routine) always renders above "Workout" in the NOW column, regardless of which task was spawned/bumped most recently.

## Change
In `src/components/quest-app.tsx`, inside `ZoneBoard` where `items` are computed per zone (around line 447), apply a stable sort that gives recurring quests an explicit priority order, with everything else preserving original order.

Priority order (top → bottom):
1. `morning-armor`
2. `workout`
3. all other tasks (unchanged relative order)

Implementation: replace
```ts
const items = tasks.filter((t) => t.status === z.id);
```
with a filter + `.sort()` using a small `priority(key)` helper that returns `0` for morning-armor, `1` for workout, `2` otherwise. Use a stable comparator (return 0 for ties so insertion order is preserved by Array.prototype.sort in modern engines).

## Scope
- Frontend only, one file: `src/components/quest-app.tsx`.
- No schema, spawn engine, or analytics changes.
- Affects all zones uniformly, but only Morning Armor + Workout have explicit priorities, so behavior in Later/Future is unchanged in practice.