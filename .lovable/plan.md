Plan: Rename every occurrence of the recurring quest "Explore Burlington" to "Explore College Town"

Scope
- User-facing title: "🗺️ Explore Burlington" → "🗺️ Explore College Town"
- Internal recurringKey: "explore-burlington" → "explore-college-town" (for consistency everywhere it is identified)

Files to edit
1. src/lib/use-daily-spawn.ts
   - Line 56: key "explore-burlington" → "explore-college-town"
   - Line 57: title "🗺️ Explore Burlington" → "🗺️ Explore College Town"
2. src/components/quest-app.tsx
   - Line 413: template title "Explore Burlington" → "Explore College Town"
3. src/routes/design-system.tsx
   - Lines 290-291: recurring key + title
   - Line 1625: demo title
4. README.md
   - Line 122: bullet text "🗺️ Explore Burlington" → "🗺️ Explore College Town"

Verification
- Re-run rg "Burlington" and rg "explore-burlington" to confirm zero remaining occurrences.
- Re-run rg "Explore College Town" and rg "explore-college-town" to confirm all replacements landed.
- Optionally run bun run build to make sure the rename compiles cleanly.