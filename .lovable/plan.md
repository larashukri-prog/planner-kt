Plan: Prepare the project for a clean GitHub export

1. Create a professional README.md
   - Project Overview: describe Planner-KT as an assistive, dopamine-friendly task planner for neurodivergent college students, with a "Quest Log" game-menu aesthetic.
   - Key Architecture Features: document the OKLCH semantic design-token system, custom hooks (useTasks, useDailySpawn, useTheme, useAuth), WCAG 2.1 AA accessibility compliance, and the component primitive layer (Badge, Checkbox, Dialog, etc.).
   - Tech Stack: React 19, TypeScript, TanStack Start, Tailwind CSS v4, Framer Motion, Lucide, Supabase, PostHog.
   - Local Setup: npm install, npm run dev, npm run build, npm run lint, npm run preview (note the project uses Vite and TanStack Start).
   - Live Demo: link to https://planner-kt.lovable.app/.
   - Add a short section on the "Daily Spawn Engine" / recurring life prompts and the Anti-Guilt Rule.

2. Complete .gitignore
   - Ensure node_modules, .env, .env.local, .DS_Store, dist/, build/, .output, .vinxi, and .tanstack/** are excluded.
   - The current .gitignore already covers most of these but is missing an explicit `.env` entry (only `.env.local` is covered by `*.local`). Add `.env` explicitly.

3. Verify package.json scripts
   - Confirm dev, build, lint, preview scripts exist. They do: dev (vite dev), build (vite build), lint (eslint .), preview (vite preview).
   - Verify the package name and version are appropriate for a public repo. Current name is "tanstack_start_ts"; optionally rename to "planner-kt" for a cleaner export.
   - No new dependency installs are required for this export task.

4. Optional clean-up
   - Add a LICENSE placeholder or omit if not requested.
   - Ensure no sensitive secrets are in source files before export (already true; .env is auto-generated and excluded).

After the edits, run a build check to confirm the repo still compiles cleanly and is ready for cloning.