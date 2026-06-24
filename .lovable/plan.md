**Diagnosis:** In `src/components/quest-app.tsx` `ZoneColumn` (lines 504–513), the empty-state placeholder (`"Drop a quest here"`) is rendered inside the same `<AnimatePresence>` as the mapped `TaskCard`s, but it has no `key` prop. `AnimatePresence` requires every direct child to have a stable, unique `key` to track mount/unmount. Without one, when the column transitions from 0 items → 1 item, AnimatePresence can fail to remove the placeholder cleanly — the new `TaskCard` mounts but appears hidden / behind the placeholder / not laid out, producing the "I clicked Now but it didn't show" glitch.

**Fix:** In `ZoneColumn`'s body (around lines 504–520):

1. Move the empty-state placeholder OUT of the `<AnimatePresence>` — render it as a plain conditional (`{items.length === 0 && <div>…</div>}`) above or below the AnimatePresence block. The placeholder doesn't need enter/exit animation; the cards do.
2. Keep `<AnimatePresence initial={false}>` wrapping only the `items.map((task) => <TaskCard … key={task.id} />)` list.

That's the only change. No schema, no state, no other components touched. After this, clicking "Now" on an inbox task (or any move that lands the first card in a previously-empty zone) will render the card reliably.