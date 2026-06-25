## Goal
Make the placeholder text in the quick-add input smaller and less prominent, while keeping it readable in both light and dark mode.

## Change
In `src/components/quest-app.tsx` (~line 278), update the `<input>` inside `QuickAddBar`:
- Add `placeholder:text-sm` to reduce font size.
- Add `placeholder:opacity-55` to lower opacity.
- Keep the existing `placeholder:text-muted-foreground` so the color still adapts automatically to the active theme.

## Why this works
`text-muted-foreground` is already mapped to theme-aware CSS variables (`--muted-foreground`), so the base color shifts correctly between light and dark. Reducing size and opacity only affects presentation and does not break theme contrast.