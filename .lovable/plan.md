Add a global Light/Dark Mode toggle to the Quest Log app.

### 1. Theme State & Persistence
- Create `src/lib/use-theme.ts` with a `theme: "dark" | "light"` state.
- Default to `"dark"` on first load.
- Persist the choice to `localStorage` (key: `questlog.theme`).
- Expose `theme` and `toggleTheme()`.

### 2. Theme Toggle UI
- Create a small `ThemeToggle` component in `src/components/quest-app.tsx` (or inline) using Lucide `Sun` and `Moon` icons.
- Place it immediately to the right of `<WorkspaceToggle />` in the header flex row.
- Style it to match the existing pill-shaped toggle buttons (rounded-xl, border, bg-card/60, backdrop-blur).

### 3. CSS Variable Swap
- In `src/styles.css`, move the current dark palette from `:root` into a `.dark` rule.
- Define a light palette under `:root` using soft off-whites and light grays for backgrounds (`oklch(0.96 …)` / `oklch(0.98 …)`), deep charcoal for text (`oklch(0.2 …)`), and softened borders.
- Update light-mode gradients and shadows so cards remain visually separated:
  - `--gradient-bg`: subtle warm off-white radial gradient.
  - `--shadow-card`: softer but visible shadow on light surfaces.
- **Neon preservation**: Keep `--neon`, `--neon-2`, `--neon-3`, `--zone-now`, `--zone-next`, `--zone-later`, and `--inbox` at the same (or very similar) vivid values. Do not desaturate or darken the accent colors in light mode — they must remain punchy for the XP bar, quest glows, and Done Wall checkboxes.

### 4. Wiring the Class Toggle
- In `QuestApp`, read `theme` from `useTheme`.
- Add `className={cn("min-h-screen w-full", theme)}` on the outer wrapper `<div>` so either `"dark"` or `"light"` is present on the container, driving Tailwind’s `dark:` variant and the CSS variable overrides.
- Update `theme-color` meta in `__root.tsx` to match active theme (dark: `#1a1530`, light: `#f8f7fa`).

### 5. Light-mode polish for existing components
- Verify `text-foreground`, `bg-card`, `border-border`, and other semantic tokens automatically switch.
- Adjust any hardcoded transparent/black `rgba()` values in Framer Motion animations to use semantic or theme-safe equivalents so they don’t disappear or look muddy in light mode (e.g. the task completion flash background uses `rgba(0,0,0,0)` which is fine, but the color-mix references should resolve correctly).
- Ensure the `quest-card` backdrop blur and border still reads cleanly on the light gradient.

### Files to modify
- `src/styles.css` — add `.dark` rule, define `:root` light palette, keep neon vivid.
- `src/lib/use-theme.ts` — new hook.
- `src/components/quest-app.tsx` — add `ThemeToggle`, wire theme class, import `Sun`/`Moon`.
- `src/routes/__root.tsx` — dynamic `theme-color` meta tag.

### Out of scope
- No changes to task logic, spawning engine, or routing.
- No replacement of the existing semantic token system with hardcoded `slate`/`zinc` utility classes; the CSS variable approach is already the correct Tailwind pattern for this codebase.