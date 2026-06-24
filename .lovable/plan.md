
## Daily Quest Spawning Engine

Auto-spawns recurring quests when the local calendar day changes, using LocalStorage to track the last tick. Includes an anti-duplicate rule and a strict isolation guarantee for user-created tasks.

### Isolation Guarantee (CRITICAL)

The tick is a **pure additive/refresh** operation, scoped exclusively to tasks tagged with a `recurringKey` matching one of the four registry entries. The engine must never:

- delete, archive, or move any task without a `recurringKey`
- mutate `status`, `subtasks`, `title`, or `completedAt` on any non-recurring task
- touch recurring tasks owned by anyone other than the originating registry entry (matched by exact `recurringKey` string)
- run a "cleanup" or "sweep" pass — there is no global iteration over `tasks` that writes; the only writes are targeted by `recurringKey`

Manually entered tasks, homework, custom todos, and travel plans in Now / Next / Later persist untouched across midnight, app reloads, and workspace switches. The only LocalStorage key the engine writes is its own tick marker.

### New file: `src/lib/use-daily-spawn.ts`

`useDailySpawn({ tasks, addRecurringTask, updateTask })`:

1. On mount and every 60s, read `questlog.lastSpawnDate.v1` from LocalStorage.
2. Compare stored `YYYY-MM-DD` (local) to today. If equal → return (no-op).
3. Otherwise, iterate the `RECURRING_QUESTS` registry. For each entry whose `shouldSpawn(today)` is true, call `spawnIfMissing(entry)`.
4. Write today's date back to `questlog.lastSpawnDate.v1`.

`spawnIfMissing(entry)` — the only mutation surface:

- Find task where `recurringKey === entry.key` AND `status !== "completed"` AND `ownerId === "solo"`.
- If found → call `updateTask(found.id, { subtasks: <all reset to isCompleted:false>, createdAt: Date.now() })`. Status is **not** changed; if user dragged it to Later, it stays in Later.
- If not found → call `addRecurringTask({ title, subtasks, status: entry.zone, recurringKey: entry.key })`.

No other code paths mutate tasks. Non-recurring tasks have no `recurringKey`, so they are invisible to the lookup and never matched.

### Recurring registry

```ts
type Recurring = {
  key: string;                            // stable id, also stored on the task
  title: string;                          // e.g. "🛡️ Morning Routine"
  subtasks: string[];
  zone: "now" | "next";
  shouldSpawn: (today: Date) => boolean;
};
```

Entries:
- **morning-armor** — `🛡️ Morning Routine`, zone `now`, daily (always `true`). Subtasks: `["Shower", "Brush Teeth", "Wash Face & Skincare"]`.
- **laundry-loop** — `🧺 Laundry Loop`, zone `now`, `today.getDay() === 5` (Friday). Subtasks: `["Gather clothes", "Start washer", "Move to dryer", "Put away"]`.
- **restock-fuel** — `🛒 Restock Fuel`, zone `now`, `getDay() === 2 || getDay() === 6` (Tue/Sat). Subtasks: `["Check fridge/pantry", "Walk to grocery store", "Grab essentials"]`.
- **explore-burlington** — `🗺️ Explore Burlington`, zone `next`, day-of-year parity even (`Math.floor((today - Jan1)/86400000) % 2 === 0`). Subtasks: `["Pick a local spot (Church St, Lake Champlain, or a new coffee shop)", "Leave the dorm for 30+ minutes", "Take a mental break"]`.

### Type & hook changes

- `src/lib/quest-types.ts`: add optional `recurringKey?: string` to `Task`. Purely additive — existing tasks read back with `recurringKey === undefined` and are permanently excluded from the engine's matcher.
- `src/lib/use-tasks.ts`: add `addRecurringTask({ title, subtasks, status, recurringKey })` that writes a task with the supplied `status` (bypasses the inbox default in `addTask`), `ownerId: "solo"`, `category: "champlain"`. `addTask`, `moveTask`, `updateTask`, `deleteTask` are unchanged.

### Wire-up in `src/components/quest-app.tsx`

Inside `QuestApp`, one new call after `const t = useTasks();`:

```ts
useDailySpawn({
  tasks: t.tasks,
  addRecurringTask: t.addRecurringTask,
  updateTask: t.updateTask,
});
```

No JSX, no UI, no other component changes. Spawned tasks render via the existing `ZoneBoard`; XP bar recalculates automatically.

### LocalStorage

- `questlog.lastSpawnDate.v1` — `"YYYY-MM-DD"` of the last tick. The only key written by the engine. `questlog.tasks.v1` is written only via the existing `useTasks` effect, triggered by the targeted `addRecurringTask` / `updateTask` calls above.

### Edge cases

- First load ever → `lastDate` null → tick runs, today's recurring quests spawn, all pre-existing user tasks untouched.
- Same-day reloads → date matches → no-op.
- App open through midnight → 60s interval catches the rollover.
- User completes Morning Armor then it stays on the Done Wall; next day's tick sees no active version with that `recurringKey` and spawns a fresh one. The completed instance on the Done Wall is never modified.
- User drags Laundry Loop to Later → next Friday's tick refreshes its subtasks but leaves it in Later.
- Family workspace is never touched (engine scopes to `ownerId: "solo"`).
