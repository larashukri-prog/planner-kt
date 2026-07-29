## Goal

Yes — the Daily XP progress strip is the app's most characteristic motion, and it's currently missing from the Motion section. Add it as a documented, live, interactive example that also explains the teal → pink (`--neon` → `--neon-2`) gradient.

## 1. New Motion example: "Daily XP strip — gradient progress + celebration"

Added as the **first** example in Section 04 (it's the signature interaction), before the tactile button.

A self-contained `XPBarDemo` in `src/components/design-system/demos.tsx` reproducing the real bar from `quest-app.tsx`, at documentation scale:

- Full-width 36px (`h-9`) rounded track on `bg-secondary/40` with an inset shadow.
- **Gradient fill** — `linear-gradient(90deg, var(--color-neon) 0%, var(--color-neon-2) 100%)`, teal to magenta-pink, plus the blurred glow underlay at 60% opacity behind it.
- **Spring width animation** — framer-motion `animate={{ width }}` with `stiffness: 120, damping: 20`, exactly the app's values.
- **Looping shimmer** — a translucent white band sweeping the fill on a 2.4s linear repeat.
- **Celebration at 100%** — scale pulse (`[1, 1.02, 1]`) plus the six sparkles rising out of the bar via `AnimatePresence`.
- Demo controls: "+25% XP" / "Reset" buttons so the reviewer can drive it to 100% and watch the celebration fire, plus the live percentage label centered in the bar like the real one.

### Documentation attached to the example

- `a11y` note: the bar is a `role="progressbar"` with `aria-valuenow` / `aria-valuemin` / `aria-valuemax` and a text label, so progress is never conveyed by color or width alone; the celebration is decorative and `aria-hidden`; the infinite shimmer is suppressed under `prefers-reduced-motion`.
- `api` note: the gradient is composed from the two brand tokens, so it re-themes automatically in light and dark; the same spring config is reused by every width/position animation in the product.
- Code snippet showing the layered structure — glow underlay, gradient fill, shimmer child, centered label — with the real spring and gradient values.

## 2. Gradient documentation in the example

A short caption under the demo naming the token pair:

```text
--neon    oklch(0.72 0.19 175)  teal      → fill start
--neon-2  oklch(0.72 0.24 320)  magenta   → fill end
--gradient-neon = linear-gradient(135deg, neon → neon-2)
```

It notes that the same pair drives the app logo tile and the `--shadow-neon` glow, so one token edit re-skins every accent surface — tying the motion section back to Foundations.

## 3. Motion token table additions

Two rows appended so the XP values are documented, not just demonstrated:
- `spring 120 / 20` — progress width and layout position animations.
- `shimmer 2.4s linear ∞` — indeterminate progress sheen.

## Technical notes

- Demo lives in `src/components/design-system/demos.tsx`; only the route's motion section gains one `<Example>`. No change to the live app's `DailyXPBar`.
- Uses existing `framer-motion`; gradients reference CSS variables, no hardcoded hex.
- Reduced-motion: shimmer and sparkles are gated on a `prefers-reduced-motion` media query check so the bar still fills but stops looping.
