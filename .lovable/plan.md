## Goal

Bring back the teal fill on the Brain Dump "Add" pill, with a black label in light mode and a white label in dark mode — while staying AA-compliant.

## What changes

**1. New button-fill token pair in `src/styles.css`**

The current teal (`--neon`) is very light in both themes (L 0.78 light / 0.82 dark). Black text on it passes easily, but white text on it is only ~2.4:1 — so dark mode needs a deeper teal fill behind the white label.

Add:
- `--neon-btn` — light theme: the existing vivid teal `oklch(0.78 0.2 195)` (unchanged look); dark theme: a deepened teal around `oklch(0.46 0.13 195)` so white text clears 4.5:1.
- `--neon-btn-text` — light theme: near-black `oklch(0.15 0.02 260)`; dark theme: near-white `oklch(0.98 0 0)`.
- Register both under `@theme` as `--color-neon-btn` / `--color-neon-btn-text`.

**2. `QuickAddBar` submit button in `src/components/quest-app.tsx`**

Active state becomes `bg-neon-btn text-neon-btn-text border-neon-btn` with the existing `var(--shadow-neon)` glow and hover/active darkening. Disabled state keeps the current `bg-muted text-muted-foreground` treatment (no opacity fade), and `aria-label="Add task"` plus the `focus-visible:outline` ring stay as-is.

**3. Verify**

Compute contrast ratios for both themes (target ≥ 4.5:1) and take light/dark screenshots of the pill in resting and typed states.

## Note

If you'd rather keep the *exact* bright teal in dark mode too, the label there has to stay black to pass AA — white on bright teal fails. The plan above keeps white text by deepening the dark-mode teal slightly; tell me if you prefer the opposite trade-off.
