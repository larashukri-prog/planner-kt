## Goal

Wire `posthog-js` into the app to track Executive Functioning engagement, fire-and-forget, with safe fallback when env vars are missing.

## Steps

1. **Install dependency**
   - `bun add posthog-js`

2. **Initialize PostHog (root)**
   - In `src/routes/__root.tsx`, inside `RootComponent`, add a `useEffect` that runs once on the client and calls `posthog.init(...)` only if `import.meta.env.VITE_PUBLIC_POSTHOG_KEY` is set.
   - Host defaults to `https://us.i.posthog.com` via `VITE_PUBLIC_POSTHOG_HOST`.
   - Guard against SSR (`typeof window !== "undefined"`) and double-init (`posthog.__loaded`).
   - If the key is missing, log a single dev-only notice and continue — no crash.

3. **Create `useAnalytics` hook** at `src/lib/use-analytics.ts`
   - Exports a `track(event, props?)` function that wraps `posthog.capture` in a `try/catch` and a `queueMicrotask` so it never blocks the caller.
   - No-ops cleanly when PostHog isn't initialized.
   - Also exports `trackOncePerSession(event, props?)` using `sessionStorage` so "app_opened" fires once per browser session.

4. **Wire the 4 events** in `src/components/quest-app.tsx`
   - **`app_opened`** — in `QuestApp` (the app's top-level component; there is no separate `Dashboard`), call `trackOncePerSession('app_opened')` from a mount `useEffect`.
   - **`manual_task_created`** — in `QuickAddBar.submit`, call `track('manual_task_created')` right after `onAdd(value)`.
   - **`template_quest_used`** — in `TemplateChips.handleClick`, call `track('template_quest_used', { quest_name: tpl.label })`.
   - **`task_completed`** — in `TaskCard.handleComplete`, call `track('task_completed', { has_subtasks: task.subtasks.length > 0, time_in_zone_ms: Date.now() - task.createdAt })` before the existing `setTimeout` so it never delays the completion animation. (Using `time_in_zone_ms` as a number is easier to chart in PostHog than a formatted string; happy to switch to a string if you prefer.)

5. **Document env vars**
   - No `.env` committed; the user adds `VITE_PUBLIC_POSTHOG_KEY` (and optional `VITE_PUBLIC_POSTHOG_HOST`) locally / in deployment. App runs normally without them.

## Files touched

- `package.json` (via bun add)
- `src/routes/__root.tsx` — init effect
- `src/lib/use-analytics.ts` — new utility
- `src/components/quest-app.tsx` — 4 capture call sites

## Out of scope

- User identification (`posthog.identify`) — no auth in this app yet.
- Autocapture / pageview tracking config beyond defaults.
- Server-side events.
