## Diagnosis (verified)

The teal tokens are wired correctly, and the button markup uses them. Reading the live preview's computed styles on the Add pill returned `background: oklch(0.95 0.008 250)`, `color: oklch(0.48 0.02 260)`, `disabled: true`, with class `bg-muted text-muted-foreground`.

Cause: the button is only teal when `hasValue` is true. With the Brain Dump input empty it is disabled and falls back to the grey resting treatment, so the teal never appears until you type.

## Change

In `QuickAddBar` (`src/components/quest-app.tsx`), make the teal fill the permanent look of the pill instead of a typed-only state:

- Always apply `border-neon-btn bg-neon-btn text-neon-btn-text`, so the pill reads teal-with-black (light) / teal-with-white (dark) at rest.
- Keep the button `disabled` when empty for correct semantics, but express that state with `cursor-not-allowed` plus a slightly muted `brightness-95` rather than swapping to grey — no opacity fade, so the label contrast stays identical (11.5:1 light, 5.86:1 dark).
- Keep the neon glow shadow only when there is text, so typing still gives the pill its "armed" lift.
- Leave `aria-label="Add task"` and the focus-visible outline untouched.

## Verify

Re-read the live computed background/color in both light and dark themes with the input empty and with text, confirming teal in all four states and AA-passing label contrast.
