**Diagnosis:** The `TaskCard`'s outer `motion.div` (lines 609–641) combines several Framer Motion features that conflict when a card is added to a zone column from another container (inbox → now via 1-click chip + Now button):

- `layout` prop tries to animate from a previous bounding box. The card has no prior box in the destination `<LayoutGroup>` (it was in `InboxStrip`'s separate LayoutGroup), so layout measurement can resolve to 0×0 / off-screen.
- `initial={{ opacity: 0, y: 8, scale: 0.98 }}` plus a spring `transition` runs simultaneously with the broken layout animation.
- The parent `<AnimatePresence initial={false}>` in `ZoneColumn` suppresses entry animations on first AP mount; if the column was empty when AP mounted, the new child's `initial` may be skipped inconsistently.

Result: the card mounts in the Now column but renders as an invisible / zero-sized / off-position box → "blank" column.

**Fix (permanent, applies to all 1-click quests and any future task added to a zone):**

1. In `ZoneColumn`'s `<AnimatePresence>` (around line 510 after the previous edit), remove `initial={false}` so newly-added children always run their declared `initial` → `animate` transition cleanly.
2. In `TaskCard`'s outer `motion.div` (line 609–611), remove the `layout` prop. Layout animation across containers is the source of the zero-box glitch and isn't needed — cards already animate via `initial`/`animate`/`exit`.
3. Keep everything else (drag, exit, completing animation, escalation class) unchanged.

That's two small edits. No schema changes, no state changes, no styling changes. After this, every 1-click quest (and any inbox → zone move) will appear immediately and reliably in the destination column.