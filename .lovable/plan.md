## Goal

The Add pill's label should be **dark in light mode and light in dark mode** — i.e. it follows `text-foreground`. That only works if the fill is a theme-following surface rather than the fixed bright teal it is today, so the fill changes with it.

## Diagnosis (confirmed against your live preview)

The button currently reports:

```text
theme: light          disabled: true        opacity: 0.4
class: bg-neon text-neon-foreground ... disabled:opacity-40
text:  rgb(7,11,20)   fill: rgb(0,220,223)
```

Two separate problems:

1. **The fill is fixed bright teal in both themes.** `--neon` is a light color in light *and* dark mode, so its paired `--neon-foreground` is dark in both. That is why the dark-mode label is dark instead of light — the token pair can never invert.
2. **The resting button is faded.** It is disabled whenever the Brain Dump input is empty, and `disabled:opacity-40` fades the whole element — label and fill together — so the text composites to a light gray on near-white, roughly 2.5:1. That is why the light-mode label never looks dark. Earlier measurements only tested the typed-in state, which is why this was missed.

## Changes

Single file: `src/components/quest-app.tsx`, the submit button in `QuickAddBar` (around line 297). No token file, state, or business-logic changes.

**1. Theme-following fill and label**

Replace `bg-neon text-neon-foreground` with a surface fill plus `text-foreground`. The foreground token already inverts per theme, which is exactly the behavior asked for:

```text
light:  --foreground near-black   on a light surface fill
dark:   --foreground near-white   on a dark surface fill
```

Keep the pill feeling like the primary action by giving it a neon accent border and retaining the neon glow shadow when the input has text — the accent stays vivid, but it moves to the border and glow instead of the label.

**2. Disabled state — stop fading the label**

Drop `disabled:opacity-40`. Give the disabled pill its own solid treatment: a muted surface with `text-muted-foreground` and `cursor-not-allowed`, and no glow. That pair is AA-compliant in both themes, so the resting button stays legible instead of ghosting out. The button remains genuinely disabled — only its appearance changes.

**3. Hover / active / focus**

- Hover and active shift only the surface fill, leaving `text-foreground` untouched so contrast holds.
- Keep the existing 2px `focus-visible:outline-ring` with offset (an outline, not a ring, because the glow `box-shadow` would override a ring).

**4. Metadata — already correct, keep as-is**

Native `<button type="submit">` with `aria-label="Add task"`.

## Verification

Measure the computed label and fill colors in **four** states — light/dark × empty input (disabled) and typed input (enabled) — convert to sRGB and compute contrast, confirming all four are at or above 4.5:1. Confirm the label reads dark in light mode and light in dark mode. Confirm the focus outline still renders on keyboard focus, and capture light- and dark-mode screenshots of the pill in both resting and typed states.
