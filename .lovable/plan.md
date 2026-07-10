Update the `ZoneBoard` component in `src/components/quest-app.tsx` so the three zone columns render in a single horizontal row on desktop instead of stacking vertically.

What will change:
- Replace the desktop `md:contents` behavior on the carousel scroller with a stable `md:grid md:grid-cols-3` (or `md:flex md:flex-row`) layout.
- Keep the mobile experience exactly as-is: horizontal snap scrolling, `w-[85vw]` card peeking, and dot indicators.
- Adjust the column wrapper divs so they fill the desktop row width (`md:w-full`) and stop acting as contents children of the vertical board container.
- Leave `ZoneColumn`, `TaskCard`, drag-and-drop, animations, and the mobile carousel logic untouched.

What will NOT change:
- Mobile carousel behavior, snap points, or dot indicators.
- Any task data, sorting, spawning engine, analytics, auth, or theme code.
- Styling tokens, colors, or the existing card design.

Verification:
- Build the project to confirm no TypeScript/Tailwind errors.
- Visually inspect the desktop preview to confirm Now, Later, and Future are visible side-by-side above the fold.
- Check the mobile preview to confirm the horizontal carousel still works.