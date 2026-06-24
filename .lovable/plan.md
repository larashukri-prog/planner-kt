## Plan

1. **Extract the auth UI into a shared component**
   - Move the current sign-in/sign-up screen logic out of `src/routes/auth.tsx` into a reusable component.
   - Keep `src/routes/auth.tsx` as the canonical `/auth` page route.

2. **Add a defensive `/auth` fallback in the root not-found boundary**
   - If the router falls into the root 404 while the current path is `/auth` or `/auth/`, render the shared auth screen instead of the 404 page.
   - This directly addresses the live preview behavior where `/auth` is displaying the app’s root 404 even though the route exists in source.

3. **Keep normal 404 behavior everywhere else**
   - All other unknown paths will still show the existing 404 page.

4. **Verify**
   - Re-check the live preview at `/auth` and confirm it renders the Planner-KT sign-in screen, not “Page not found”.
   - Confirm `/` still redirects unauthenticated users to the auth screen.