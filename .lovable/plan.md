## Goal

Add two new documented sections to `/design-system` — **Motion & Micro-interactions** and **Middle Layer Architecture** — each with live, interactive demos plus copyable code, matching the existing `Section` / `Example` / `CodeBlock` documentation primitives. Work stays in `src/routes/design-system.tsx` (plus small demo components in `src/components/design-system/`); the live app is untouched.

## Navigation & numbering

Insert both sections between "Enterprise UI Patterns" and "AI Contribution Model", and renumber eyebrows:

```text
01 Foundations & Tokens
02 Atomic Components
03 Enterprise UI Patterns
04 Motion & Micro-interactions   (new)
05 Middle Layer Architecture     (new)
06 AI Contribution Model
```

The `NAV` array gains two entries; sidebar scroll-spy and mobile chips pick them up automatically.

## Section 4 — Motion & Micro-interactions

Intro prose: motion is tokenized too — durations, easings and transforms come from a small shared vocabulary (`duration-200`, `ease-out`, `active:scale-95`, the `fade-in` / `scale-in` keyframes in `styles.css`), so animation ships as part of the system rather than as one-off CSS.

Three live `Example` blocks, each with its snippet:

1. **Tactile button** — hover lift + `active:scale-95` press, plus a "Complete quest" variant reproducing the app's emerald success flash (Tailwind transition utilities only, no JS). Note that the same transition tokens are reused by the real Quest card.
2. **Skeleton loading state** — a quest-card skeleton (avatar block, two text bars, badge) using `animate-pulse` over `bg-muted`, with a "Reload" button that flips back to the loaded card for ~1.2s so the shimmer→content swap is visible. Documents that skeletons mirror the real layout's 4px-grid dimensions to avoid layout shift.
3. **Toast notification** — a self-contained in-page toast using `framer-motion` `AnimatePresence` (slide-in from the right + fade, spring exit), triggered by a button and auto-dismissing. Kept local to the page (no global `<Toaster />` change), with a note that production uses `sonner` with the same motion values.

Each gets an `a11y` note: reduced-motion respect (`motion-reduce:transition-none` / `prefers-reduced-motion`), toast announced via `role="status"` + `aria-live="polite"`, skeleton marked `aria-hidden` with an accompanying `aria-busy` region.

Add a small **motion token table** (duration 150/200/320ms, easings, standard transforms) above the examples so the values are documented, not just demonstrated.

## Section 5 — Middle Layer Architecture

Intro prose: components never talk to the database directly. Every screen reads from a custom hook; the hook owns fetching, optimistic updates, realtime subscriptions and persistence — the "middle layer" between UI surface and data service.

Contents:

1. **Architecture diagram** — an accessible, CSS/flex-built layered diagram (no image, no new dependency) showing:

```text
UI components  ->  custom hooks (useTasks / useTheme / useAuth)
               ->  services (Supabase client, localStorage, PostHog)
               ->  Postgres + RLS
```
   Each layer is a labeled card listing its real responsibilities and the actual modules involved (`use-tasks.ts`, `use-theme.ts`, `use-auth.ts`, `@/integrations/supabase/client`). Arrows are decorative (`aria-hidden`), and the layer list is semantic markup so screen readers read it as an ordered list.

2. **Live stateful component — persisted preference toggle.** A working demo backed by a small `useLocalStorageState` hook (written inline in the page's demo file, keyed under a `questlog.ds.*` namespace so it can't collide with app state): a switch plus a counter, showing state surviving reload. Displays the current stored JSON value live so the persistence is visible. Paired `CodeBlock` shows the hook implementation (lazy `useState` initializer, `useEffect` write, try/catch for private mode, SSR-safe `typeof window` guard) and the two-line component that consumes it.

3. **Real-hook excerpt** — a trimmed `useTasks` snippet showing the optimistic-update pattern actually used in the app (local state updates first, server write follows, rollback on error) with a short annotation of why the UI stays instant. Read-only documentation; no behavior change.

4. Short "rules of the middle layer" list: components stay presentational, hooks own side effects, server writes are optimistic with rollback, storage keys are namespaced, and no component imports the data client directly.

## Technical notes

- No new packages; `framer-motion`, `lucide-react` and existing shadcn atoms only.
- Demo components live in a new `src/components/design-system/demos.tsx` to keep the route file from growing unbounded; the route imports and composes them.
- All colors via semantic tokens; no hardcoded color utilities. Spacing stays on the 4px grid per the existing foundations section.
- Heading order preserved (single `h1`, `h2` per section via `Section`, `h3` for sub-blocks).
- Update the route `head()` description to mention motion and data/state architecture.
