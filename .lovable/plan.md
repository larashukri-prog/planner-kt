## Goal
Auto-detect http/https URLs in task titles and subtask text and render them as safe clickable links — purely a render-time change.

## Files
- New: `src/lib/linkify.tsx` — pure helper `renderWithLinks(text: string): ReactNode[]` that splits on a URL regex and returns text + `<a>` nodes.
- Edit: `src/components/quest-app.tsx` — use the helper in three render sites:
  - Inbox card title (line ~393): `<p>{task.title}</p>` → `{renderWithLinks(task.title)}`
  - TaskCard title (line ~699): same swap
  - SubtaskList item text (line ~983): `{s.text}` → `{renderWithLinks(s.text)}`

No changes to types, state, persistence, Supabase, spawn engine, or analytics.

## Helper details
- Regex: `/(https?:\/\/[^\s<]+[^\s<.,:;!?')\]}])/gi` (trims common trailing punctuation).
- Returns an array of strings and `<a>` elements, each `<a>` keyed by index.
- `<a>` props:
  - `href={url}`, `target="_blank"`, `rel="noopener noreferrer"`
  - `onClick={(e) => e.stopPropagation()}` so clicking a link in the TaskCard header doesn't toggle expand
  - ClassName: `inline-flex max-w-full items-center gap-0.5 align-bottom text-[var(--color-neon)] underline decoration-dotted underline-offset-2 hover:decoration-solid`
  - Display text wrapped in a `<span class="truncate max-w-[18ch] md:max-w-[28ch] overflow-hidden align-bottom">` so long URLs ellipsis-truncate without breaking layout
  - Trailing `<ExternalLink className="h-3 w-3 shrink-0 opacity-70" aria-hidden />` from `lucide-react`
- Title strings already use `line-clamp-2`, so links inside titles inherit clamping; the truncating span ensures a single very long URL still fits.

## Out of scope
Data layer, validation, autolinking on save, markdown — none of these change.