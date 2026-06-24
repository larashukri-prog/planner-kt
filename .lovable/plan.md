
## Fix: Duplicate Morning Routine in NOW

### Cause

The spawn engine's anti-duplicate check matches on `recurringKey`. Tasks created earlier via the **Template Chips** (e.g. clicking 🛡️ Morning Armor) have no `recurringKey`, so the daily tick can't see them and spawns a second "🛡️ Morning Routine" alongside the user's existing one.

### Fix — Adopt-then-dedupe in `src/lib/use-daily-spawn.ts`

Extend `spawnIfMissing` with a second lookup pass:

1. **Primary match** (unchanged): find active task where `recurringKey === entry.key` and `ownerId === "solo"`. If found → refresh.
2. **Adoption match** (new): if no primary match, find active solo task whose normalized title equals the entry's normalized title (lowercase, strip leading emoji + whitespace, e.g. `"🛡️ Morning Routine"` → `"morning routine"`; also matches the chip-created `"Morning Routine"`).
   - If found → adopt it: `updateTask(id, { recurringKey: entry.key, title: entry.title, subtasks: <reset>, createdAt: now })`. Status untouched.
3. **Otherwise** → spawn fresh (unchanged).

Also, **collapse multiple matches**: if the lookup returns more than one active task carrying the same `recurringKey` (the bug already created the dupe), keep the oldest (lowest `createdAt`) and `deleteTask` the rest. This runs only against tasks the engine itself owns — non-recurring user tasks remain untouched.

### Plumbing

- `useDailySpawn` params gain `deleteTask: (id: string) => void` (already exported by `useTasks`).
- Wire it from `src/components/quest-app.tsx` in the existing `useDailySpawn({...})` call.
- The isolation guarantee from the prior plan still holds: every mutation is gated on either `recurringKey === entry.key` or the normalized-title match against one of the four registry entries. Homework, travel plans, and arbitrary user tasks never match.

### Result

- Existing chip-spawned "Morning Routine" gets adopted (gains 🛡️ prefix + `recurringKey`), and the engine's own duplicate is removed.
- Future days: only one Morning Routine, refreshed in place.
