Problem: The delete button on Inbox task cards is hidden by default (`opacity-0`) and only reveals on `group-hover`. On touch/mobile devices there is no hover state, so users cannot see or tap the delete control.

Fix in `src/components/quest-app.tsx` inside the `<InboxStrip>` component:
- Change the delete button visibility class from `opacity-0 group-hover:opacity-100` to `opacity-100 md:opacity-0 md:group-hover:opacity-100`.
- This keeps the current hover-reveal behavior on desktop while making the delete icon permanently visible on mobile viewports.
- Optionally add a touch-friendly hit area (`min-h-[28px] min-w-[28px]` / `p-2`) so it is easy to tap.

No state, data, or routing changes are required.