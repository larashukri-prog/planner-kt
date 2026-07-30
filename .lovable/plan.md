## What I verified first

Read-only checks against the current code (not assumptions):

- `lang="en"` is already on `<html>` in `src/routes/__root.tsx`.
- Titles/descriptions exist on the root and on `/` (metadata is set per route via `head()`, there is no `index.html` in this stack).
- The viewport meta is `width=device-width, initial-scale=1` — no `user-scalable=no`, no `maximum-scale`. Zoom is already allowed.
- Main content is already wrapped in `<main>`; heading order runs h1 → h2 → h3 with no skips.
- No `tabIndex` greater than 0 anywhere.
- Every icon-only button I found already carries an `aria-label`; both text inputs carry `aria-label`s.
- I measured the muted text token in OKLCH: **6.26:1** on light background, **6.75:1** on dark. It already passes AA, so swapping it for slate colors would be a downgrade in theming with no contrast gain — I don't plan to do that.

So the structural items in the request are largely already satisfied. The honest gap is that no *automated scanner* has actually been run — everything so far was manual review. That's what this plan fixes.

## Plan

1. **Run a real axe-core scan.** Drive the running app with headless Chromium and inject `axe-core` against every route (`/`, `/auth`, `/design-system`) in **both light and dark themes**, including expanded task cards and open panels so hidden controls are scanned too. Export the full violation list with severity, rule ID, and offending selector.

2. **Triage and fix every violation found.** Expected candidates based on the code read, to be confirmed by the scan rather than pre-emptively "fixed":
   - Placeholder-only contrast on the Brain Dump and micro-step inputs (placeholders inherit muted; needs measuring against the actual input fill, not the page background).
   - Accent-tinted labels drawn with inline `style={{ color: var(--color-*-text) }}` on card and column headers.
   - Low-opacity dashed borders and empty-state text (`border-border/60`) as non-text contrast.
   - Any control in `/design-system` demos missing a label — that route has the most hand-rolled widgets.
   Fixes stay in presentation code: semantic tokens in `src/styles.css` and class/attribute changes in `src/components/quest-app.tsx`, `src/routes/design-system.tsx`, `src/components/auth-screen.tsx`. No business-logic changes.

3. **Focus rings.** The global `:focus-visible` outline in `src/styles.css` covers standard elements. I'll confirm by tabbing through each route in the scan run and screenshotting the ring on the Add pill, zone chips, checkboxes, and theme toggle — adding per-component `focus-visible:ring-2 focus-visible:ring-ring` only where the global rule is being overridden.

4. **Re-scan until clean.** Repeat the axe run after fixes; the exit condition is zero violations at serious/critical level across all routes and both themes, with any remaining minor items listed explicitly rather than silently dropped.

5. **Rebuild and republish.** Run the production build, confirm it succeeds, then publish so the live URL serves the fixed bundle.

## Technical notes

- Scanning uses Playwright + `axe-core` loaded from CDN into the page; results are written to a file and read back, not dumped to the terminal.
- Contrast math is done in OKLCH → linear sRGB → WCAG relative luminance, so measurements match what the browser renders rather than eyeballed hex approximations.
- Existing contrast-safe `-text` token pairs (per project memory) are the fix mechanism for any text failure; vivid tokens stay reserved for fills, borders, and glows.

## What I will report back

The scan output before and after, the exact list of violations fixed, and confirmation that the deployed build is the scanned one.
