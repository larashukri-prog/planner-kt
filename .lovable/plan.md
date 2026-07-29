## Goal

Add a public `/design-system` route: a premium docs-style page (Vercel/Stripe feel) documenting Planner-KT's tokenized UI system, linked from the app footer.

## Route & layout

- New file `src/routes/design-system.tsx` (`createFileRoute("/design-system")`) with its own `head()`: unique title, description, og:title/og:description.
- Public page — no auth gate, no server functions, purely presentational.
- Layout: sticky left sidebar (`md:` and up) with anchor links to the four sections + scroll-spy highlighting via IntersectionObserver; on mobile the sidebar collapses into a horizontal scrollable chip row pinned under the header.
- Header bar: "Planner-KT / Design System" wordmark, theme toggle (reuse `useTheme`), and a back link to `/`.
- All styling uses existing semantic tokens from `src/styles.css` (no hardcoded colors), Space Grotesk display + JetBrains Mono for code.

## Sections

1. **Foundations & Tokens**
   - Color swatch grid: background, foreground, card, primary, secondary, muted, accent, destructive, border, plus the app-specific neon / neon-2 / neon-3 and zone-now / zone-later / zone-future / inbox tokens. Each swatch shows the token name (`--primary`), the Tailwind class (`bg-primary`), and renders live so it re-themes in light/dark.
   - Typography scale: display heading through small/mono, each row labeled with its utility classes.
   - Spacing scale and border-radius tokens (`--radius` derived sm/md/lg/xl/2xl) rendered as visual blocks.
   - Elevation: `shadow-card`, `shadow-neon`, `quest-card` utility samples.

2. **Atomic Components**
   - Live interactive examples: Button (all variants + sizes + disabled/loading), Input, Badge variants, Card, Switch, plus Checkbox and Separator for completeness.
   - Each example sits in a two-column "preview / code" block: rendered component on top (or left on wide screens) and a syntax-styled `<pre>` code snippet with a copy-to-clipboard button showing the import + usage.

3. **UI Patterns**
   - Three composed, non-interactive replicas built from the same atoms: a Quest/Task Card (checkbox, title, badges, subtask list), a Settings Row (label + description + Switch), and the XP progress strip.
   - Note: these are self-contained demo replicas inside the design-system route — the real `quest-app.tsx` components stay untouched so live app behavior can't regress.

4. **AI-Native Contribution Model**
   - Prose section explaining the token + Tailwind utility + shadcn convention contract, and why it lets AI agents (Cursor, Lovable) generate strictly-themed components with zero design drift. Include a short "rules for contributors/agents" list (semantic tokens only, no raw hex, variants via cva, etc.).

## Footer link

- In `src/components/quest-app.tsx` footer (line ~99), add a `<Link to="/design-system">Design System</Link>` next to the existing "Planner v1 — built for optimal planning" text, styled as a muted hover-to-neon link.

## Technical notes

- New reusable-but-local helpers inside a `src/components/design-system/` folder (`SwatchGrid`, `CodeBlock`, `ComponentSection`) to keep the route file readable.
- Accessibility: single `<h1>`, sequential `<h2>`/`<h3>`, `<nav aria-label="Design system sections">`, skip-to-content link, visible focus rings, `aria-live` confirmation on copy.
- Responsive: sidebar hidden below `md`, content max-width ~1100px, code blocks scroll horizontally instead of overflowing.
