Remove the redundant "Daily XP progress strip" example from Section 03 (Enterprise UI Patterns) in `src/routes/design-system.tsx`. This example already exists as the lead demo in the Motion & Micro-interactions section (Section 04), so keeping it in the patterns section is duplicate content.

Scope: one targeted edit.

What will change:
- Delete the `SubHeading` block and the static progress bar markup at lines 605–625 of `src/routes/design-system.tsx`.
- Leave the Data-dense task grid and Accessible settings form untouched as the two primary examples in Section 03.
- Leave the `XPBarDemo` import and the full Motion section intact, since the Daily XP strip lives there.
- No routing, no dependencies, no other files touched.

Verification:
- After the edit, run the build/typecheck and confirm the page renders without errors.
- Confirm the Motion section still shows the Daily XP strip, while Section 03 only shows the Data-dense task grid and Accessible settings form.