## Smooth date entry — stop committing/closing mid-type

The native `<input type="date">` fires `onChange` every time a segment (MM, DD, YYYY) becomes individually valid. Right now `onChange` both writes to state AND closes the picker, so the field unmounts as soon as the user types the first digit of a 2-digit day. That's the "type 2, lose focus, have to reopen to add 5" bug.

### Fix in `src/components/quest-app.tsx` (TaskCard date input only)

1. **Track the value in local state** (`pendingDate`) seeded from `task.dueDate`. Bind the input as a controlled component (`value`, not `defaultValue`).
2. **`onChange` only updates local state** — it does NOT call `onUpdate` and does NOT close the picker. The user can freely tab/type through MM → DD → YYYY without losing focus.
3. **Commit on `onBlur` and on `Enter`**: call `onUpdate(...)` with the parsed value and close the picker. If the field is empty on blur, clear `dueDate`.
4. **Escape cancels**: closes the picker without committing.
5. Keep `min={today}` and the today default so the picker still opens on 2026.

No schema, logic, or styling changes outside this one input. Result: type 1/2/5/2/0/2/6 straight through, tab out (or press Enter) → due date saved.
