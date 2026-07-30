## What I found (verified in the code)

**1. `lang="en"` — already correct.** `src/routes/__root.tsx` renders `<html lang="en">`. No change needed.

**2. One `<h1>` per screen — already correct.**
- App board/Done Wall: single `<h1>Planner-KT</h1>` in the header.
- Sign-in screen: single `<h1>Planner-KT — Sign In</h1>`.
- Design system: single `<h1>Planner-KT Design System</h1>`.
- 404 and error screens: one `<h1>` each.

**3. Heading nesting on the main app screen is wrong.** The board columns ("Now", "Later", "Future") render as `<h3>`, but nothing between the page `<h1>` and them is an `<h2>` for that region — the only `<h2>`s nearby are "Inbox" and "Daily XP", which are sibling regions, not parents. A screen-reader user browsing by heading hears the columns as children of "Daily XP". The Done Wall is correct (`h2` "Done Today" → `h3` day groups) and the design system is correct (`h1` → section `h2` → `h3` → demo `h4`).

**4. No `<main>` landmark on the app screen.** The design-system page has one; the board/Done Wall page does not, so there is no "skip to content" target.

## What I'll change

1. **Wrap the board in a labelled region.** In `src/components/quest-app.tsx`, `ZoneBoard` gets a `<section aria-labelledby="board-heading">` with a visually hidden `<h2 id="board-heading">Quest board</h2>`. The three column headings stay `<h3>`, which then nest correctly: `h1` → `h2` (Quest board) → `h3` (Now / Later / Future).
2. **Add the `<main>` landmark.** The content wrapper inside `QuestApp` (currently a plain `div` holding the header, capture bar, board/Done Wall, and footer) becomes `<main>` wrapping just the content below the `<header>`, so there is exactly one `<main>` on the page and the existing `<header>`/`<footer>` stay outside it.
3. **Add a "Skip to content" link** at the top of the app screen, pointing at the new `<main>` — visible only on keyboard focus, using the focus ring already in place.
4. **Sign-in screen**: wrap the form card in `<main>` so that route has a landmark too.

## Technical notes

- A `sr-only` heading is used rather than a visible one so the low-cognitive-load visual layout is unchanged — the columns keep their current look.
- No changes to `__root.tsx`'s `lang`, no changes to any route `head()` metadata, and no logic/state changes; this is markup and landmark structure only.
- Verification: re-run the Playwright audit to dump the heading outline of the board view, Done Wall view, sign-in, and `/design-system`, confirming each page reads `h1 → h2 → h3` with no skipped level and exactly one `h1` and one `main`.
