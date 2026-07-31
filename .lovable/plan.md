## Goal

Let anyone try Planner-KT instantly from the sign-in page — one tap creates a throwaway guest session, seeds a few sample quests, and drops them on the dashboard.

## What the user sees

- On `/auth`, below the sign-in form and a subtle "or" divider: a full-width secondary button, **Try Demo Mode** (ghost/outline styling with the neon border so it reads as secondary to the primary Sign in button, 44px target, visible focus ring, `aria-label="Try demo mode as a guest"`).
- Tapping it shows a brief "Spinning up your demo…" state, then lands on `/` with a board that already looks alive:
  - **Now**: Morning Armor (with its subtasks), one academic quest
  - **Later**: a life-maintenance quest (Laundry Loop)
  - **Future**: Explore College Town
  - **Done Wall**: two quests already completed today, so XP bar shows real progress
- A small dismissible banner at the top of the dashboard while in demo mode: "Demo mode — your quests are saved to a guest account on this device. Create an account to keep them." with a "Create account" link back to `/auth`.

## Technical approach

1. **Backend**: enable anonymous sign-ins via the auth config tool. Existing `tasks` RLS policies already scope to `auth.uid()` and grant `authenticated` — anonymous users get a real `auth.uid()`, so no policy or grant changes are needed.
2. **Sign-in**: `supabase.auth.signInAnonymously()` in a new handler in `src/components/auth-screen.tsx`; on success, seed then `navigate({ to: "/" })`.
3. **Seeding**: new `src/lib/demo-seed.ts` exporting `seedDemoTasks(userId)` — a single client-side `supabase.from("tasks").insert([...])` of ~6 rows built from the existing `Task` shape in `src/lib/quest-types.ts` (correct `status`, `subtasks`, `recurring_key`, `completed_at` for the done ones). Runs under the guest's own session, so RLS is satisfied. Guarded so it never runs twice.
4. **Demo detection**: `user.is_anonymous` from the Supabase user object, surfaced through `src/lib/use-auth.ts` as `isGuest`; the dashboard banner reads it.
5. **Analytics**: fire a `Demo Mode Started` PostHog event through the existing `use-analytics` hook.
6. **Error handling**: if anonymous sign-in fails, show the same inline error style already used by the form.

## Notes

- Guest data lives in the database under a real anonymous user and persists as long as that browser keeps the session; it is not recoverable after clearing storage. The banner states this.
- No new routes; no change to the daily spawn engine (it will run normally for the guest on top of the seeded quests, and the Anti-Guilt Rule prevents duplicates of Morning Armor).
