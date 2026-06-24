## Fix date picker defaulting to 1902

The native `<input type="date">` currently has no `defaultValue` when a task has no due date, so the browser's picker opens on its empty epoch (jan 1902 in some browsers' scroll wheels). Two small changes in `src/components/quest-app.tsx` inside the TaskCard date input:

1. **Default to today** when the task has no `dueDate` — set `defaultValue` to `dateInputValue(Date.now())` instead of `""`. Picker opens on the current month/year (2026) immediately.

2. **Add `min={dateInputValue(Date.now())}`** so users can't accidentally pick a past date and the wheel/scroll starts at today.

No schema, no logic, no styling changes. One element edited.
