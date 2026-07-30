# WCAG 2.1 AA color contrast pass

## What I measured

I computed real contrast ratios for every OKLCH token in `src/styles.css` against `--background` and `--card`, in both themes.

**Dark mode passes everywhere.** Foreground 17.3:1, muted-foreground 6.2:1, neon 11.7:1, all zone colors 5.8–12.8:1.

**Light mode is where it fails.** The vivid neon/zone accents were tuned for a dark canvas but are also used as *text* on the near-white light surfaces:

| Token (light) | vs card | AA body (4.5:1) |
|---|---|---|
| `--foreground` | 17.1 | pass |
| `--muted-foreground` | 6.4 | pass |
| `--primary` | 3.9 | **fail** |
| `--neon` | 1.7 | **fail** |
| `--neon-2` | 2.7 | **fail** |
| `--neon-3` | 1.6 | **fail** |
| `--zone-now` | 3.2 | **fail** |
| `--zone-next` | 2.2 | **fail** |
| `--zone-later` | 3.4 | **fail** |
| `--inbox` | 2.0 | **fail** |
| `--destructive` | 4.3 | **fail (marginal)** |

These are used as text in ~14 places in `quest-app.tsx` (zone column headers, "Inbox"/"Done Today" headings, quick-sort arrows, template chip glyphs, links) plus the design-system route.

A second issue: text whose opacity is reduced below its token value — most notably the Brain Dump placeholder (`placeholder:opacity-60` on `text-muted-foreground`, ~2.6:1) and a few `opacity-50` labels.

## The fix: a parallel set of text-safe accent tokens

Keep the vivid tokens for what they're good at — gradient fills, glows, borders, checkbox fills, progress bars (non-text, exempt or held to 3:1). Add a `-text` variant of each accent that is automatically contrast-correct per theme, so components never have to think about it.

In `src/styles.css`:

```css
:root {
  /* text-safe accents — solved for >= 4.5:1 on --background and --card */
  --neon-text:       oklch(0.495 0.20 195);
  --neon-2-text:     oklch(0.585 0.24 320);
  --neon-3-text:     oklch(0.530 0.22 135);
  --zone-now-text:   oklch(0.580 0.22 30);
  --zone-next-text:  oklch(0.495 0.20 200);
  --zone-later-text: oklch(0.570 0.20 290);
  --inbox-text:      oklch(0.550 0.18 90);
  --primary:         oklch(0.505 0.18 200);   /* was 0.55 -> 3.9:1 */
  --destructive:     oklch(0.580 0.22 25);    /* was 0.60 -> 4.3:1 */
}

.dark {
  /* dark accents already clear 4.5:1 — the text alias points at the vivid token */
  --neon-text: var(--neon);
  --neon-2-text: var(--neon-2);
  /* ...same for the rest */
}
```

Register each in the `@theme inline` block (`--color-neon-text: var(--neon-text);` etc.) so `text-neon-text`, `text-zone-now-text` are real Tailwind utilities.

## Component swaps (presentation only)

- `src/components/quest-app.tsx`: every `style={{ color: "var(--color-neon)" }}`, `color: zone.tint`, `color: tpl.tint`, `color: "var(--color-inbox)"` used on *text or a text-adjacent glyph* switches to the `-text` variant. The zone objects get a `tint` (fills/borders, unchanged) plus a `textTint`. Background/border/glow usages are untouched, so the visual identity holds.
- `src/lib/linkify.tsx`: `hover:text-neon` -> `hover:text-neon-text`.
- `src/styles.css`: the `@utility text-neon` rule uses `--neon-text` for `color` and keeps `--neon` for the `text-shadow`.
- `src/routes/design-system.tsx` and `src/components/design-system/{parts,demos}.tsx`: same swap wherever an accent is the text color.
- Remove the opacity reductions on text: Brain Dump placeholder drops `opacity-60` (keeps the smaller size), and the `opacity-50` text labels move to `text-muted-foreground` at full opacity. Opacity on *disabled* controls stays — disabled elements are exempt from AA.

## Documentation

Add a small contrast table to the Foundations section of `/design-system` listing each accent's measured ratio in both themes and the rule "vivid token for fills, `-text` token for type," so the constraint is enforced by the system rather than by memory.

## Verification

Re-run the ratio computation against the final tokens for both themes, then screenshot the dashboard and `/design-system` in light and dark to confirm nothing looks washed out.

## Note on scope

Contrast on *non-text* UI — the XP bar gradient fill, checkbox borders, card borders — is held to the 3:1 non-text threshold, not 4.5:1. Forcing 4.5:1 on the border and gradient tokens would visibly flatten the Quest Log aesthetic for no AA benefit, so I'm leaving those vivid.
