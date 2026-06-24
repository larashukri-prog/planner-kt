## Remove Family Hub Tab

### Scope
Hide the Family Hub workspace switcher and all family-specific UI so the app stays focused on a single personal quest board.

### Changes

1. **`src/components/quest-app.tsx`**
   - Remove `"family"` from the `WorkspaceToggle` items array (leaving only `"solo"` / "My Quests").
   - Remove the `Users` import from `lucide-react` if it becomes unused.
   - Update `QuickAddBar` placeholder to always show the solo prompt (remove the `workspace === "family"` branch).

2. **`src/lib/use-tasks.ts`**
   - Remove the family seed task from the `seed()` array.
   - Simplify `addTask` category logic: always assign `"champlain"` instead of branching on workspace.

3. **`src/lib/quest-types.ts`**
   - Keep `OwnerId = "solo" | "family"` unchanged so existing localStorage data and future re-enable are safe; no type migration needed.

### What stays
- The solo workspace remains active by default.
- All existing solo quests, recurring spawns, board zones, Done Wall, and theme toggle are untouched.
- Family tasks already stored in a user’s localStorage simply become invisible until the tab is restored later.