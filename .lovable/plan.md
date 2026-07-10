## Goal
On mobile, transform the vertically stacked Now / Later / Future zone boxes into a smooth, snap-locked horizontal carousel with peek-through of adjacent cards and a dot indicator for the active zone. Desktop (`md:` and up) keeps the existing 3-column grid.

## Scope
Single file: `src/components/quest-app.tsx`, only the `ZoneBoard` component (~lines 437-477). No changes to `ZoneColumn`, task logic, spawn engine, or styles.css.

## Changes

### 1. Replace the grid wrapper (mobile carousel + desktop grid)
Current:
```tsx
<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
```
New: on mobile use a horizontally scrolling snap container that bleeds past the parent's horizontal padding so adjacent cards peek in from both edges; on `md+` revert to the existing 3-column grid.

- Outer wrapper: `md:grid md:grid-cols-3 md:gap-4` + a scroll-container div for mobile only (`flex overflow-x-auto scroll-smooth snap-x snap-mandatory gap-4 -mx-4 px-4 pb-2 scrollbar-quest md:contents`).
  - `-mx-4 px-4` cancels the page's horizontal padding so the scroll track spans full viewport width while cards start at the visual edge.
  - `md:contents` collapses the mobile wrapper on desktop so its children participate directly in the grid — preserving the existing 3-column layout with zero visual change.
- Each `ZoneColumn` gets wrapped (or receives via a new className prop) with: `snap-center shrink-0 w-[85vw] md:w-auto`. First and last items get extra scroll padding via the container's `px-4` + a small `first:ml-2 last:mr-2` so peeks stay symmetrical.

Implementation choice: wrap each `ZoneColumn` in a lightweight `<div>` carrying the carousel sizing classes, rather than threading a new prop into `ZoneColumn`. Keeps `ZoneColumn` untouched.

### 2. Track active zone by scroll position
Add local state in `ZoneBoard`:
```tsx
const scrollerRef = useRef<HTMLDivElement>(null);
const [activeIdx, setActiveIdx] = useState(0);
```
On the mobile scroller, attach `onScroll` that computes `Math.round(scrollLeft / clientWidth * (ZONES.length / <visible-ratio>))`. Simpler and more robust: measure each child's `getBoundingClientRect().left` relative to the scroller center and pick the closest. Debounced with `requestAnimationFrame`.

### 3. Dot indicator (mobile only)
Below the scroller, render:
```tsx
<div className="mt-3 flex justify-center gap-2 md:hidden">
  {ZONES.map((z, i) => (
    <button
      key={z.id}
      aria-label={`Show ${z.label}`}
      onClick={() => scrollToIndex(i)}
      className="h-1.5 rounded-full transition-all"
      style={{
        width: i === activeIdx ? 20 : 6,
        background: i === activeIdx ? z.tint : "color-mix(in oklab, var(--color-foreground) 25%, transparent)",
        opacity: i === activeIdx ? 1 : 0.6,
      }}
    />
  ))}
</div>
```
Clicking a dot calls `scrollerRef.current?.scrollTo({ left: child.offsetLeft - offset, behavior: "smooth" })`.

### 4. Preserve existing behavior
- `LayoutGroup` stays wrapped around the mapped columns.
- Drag-and-drop between columns still works (drop targets are the same `ZoneColumn` divs).
- Desktop layout is byte-for-byte visually identical thanks to `md:contents` on the wrapper and `md:w-auto` on the per-card sizing div.

## Why this shape
- `md:contents` is the cleanest way to have one JSX tree serve both a mobile flex-carousel and a desktop grid without duplicating the column list or breaking `LayoutGroup`.
- Measuring child position beats `scrollLeft / snapWidth` math because `w-[85vw]` + gap + edge padding makes the arithmetic brittle; center-distance measurement is exact regardless of viewport.
- Dot indicator uses inline styles with each zone's `tint` so the active dot inherits the same neon color language already used in column headers — no new tokens required.

## Out of scope
- No changes to Inbox strip, XP bar, templates, or Done Wall layout.
- No new dependencies.
- No animations beyond CSS `transition-all` on the dot pill; native scroll snap handles the swipe feel.
