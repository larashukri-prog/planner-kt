## Plan

1. **Confirm route source of truth**
   - Keep `src/routes/auth.tsx` as the `/auth` page.
   - Keep `src/routes/index.tsx` redirecting unauthenticated users to `/auth`.
   - Do not edit `src/routeTree.gen.ts` directly because it is generated.

2. **Fix the preview-host 404 behavior**
   - Inspect the app bootstrap/config files that control the published/preview route manifest.
   - Add or adjust the minimal TanStack Start routing/default not-found configuration needed so `/auth` resolves correctly on the preview host, not just on local dev.

3. **Polish metadata consistency while touching auth routing**
   - Update remaining title/meta references from `Planner` to `Planner-KT` where the current route pages still use the old name.

4. **Verify**
   - Check `/auth` and `/` locally after the change.
   - Confirm the preview route state no longer shows the root 404 for `/auth` after the next preview refresh/build.