Refactor the `QuickAddBar` component in `src/components/quest-app.tsx` to make it the page's primary focal point, modeled after a clean Google search bar.

Changes:
- Remove `shadow-inner` and the inline inset `boxShadow` style.
- Replace `bg-secondary/40` with a solid, prominent surface background (`bg-card`) so it reads as crisp white in light mode and the raised card color in dark mode.
- Add an outward drop shadow (`shadow-md` base, elevating to `shadow-lg` on focus) to lift the capsule off the page.
- Keep `rounded-full` for the continuous capsule shape.
- Add a premium focus/active state: `focus-within:ring-2 focus-within:ring-primary/50 focus-within:shadow-lg transition-all duration-200`.
- Preserve the existing `ArrowRight` icon and "Capture" button layout, plus the `/` keyboard shortcut and pulse animation.

No other components, state, or backend logic will change.