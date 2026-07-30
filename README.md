# Planner-KT

A frictionless, dopamine-friendly task planner designed as an assistive tool for neurodivergent college students. Built around a low-cognitive-load "Quest Log" game-menu aesthetic, it helps users capture tasks instantly, sort them into time-based buckets, and build a visible record of daily wins.

**Live demo:** [https://planner-kt.lovable.app/](https://planner-kt.lovable.app/)

---

## Project Overview

Planner-KT is a single-page React application optimized for ADHD-friendly executive functioning. It replaces traditional task management with:

- **Instant capture** — a prominent Google-style brain-dump input for quick task entry.
- **Time-based buckets** — tasks flow into **Inbox**, **Now**, **Later**, and **Future**.
- **A "Done Today" wall** — completed quests stack chronologically for positive reinforcement.
- **Recurring life prompts** — an automated Daily Spawn Engine surfaces routines like morning care, workouts, laundry, grocery restocking, and local exploration without manual daily setup.
- **Visual feedback** — animated checkboxes, progress bars, and celebratory effects make completion satisfying.

The app is built as a modern, accessible, polished product suitable for evaluation as a college-life assistive technology.

---

## Key Architecture Features

### Design Tokens

- A semantic OKLCH color system in `src/styles.css`.
- The palette supports both light and dark modes while keeping neon accents vivid and readable.
- Separate **life-maintenance** tokens (laundry, food, body) use low-chroma, low-anxiety cues so routine tasks never feel like alarms.

### Custom Hooks

- `useTasks` — persists tasks, syncs with Supabase, and exposes CRUD operations with optimistic updates.
- `useDailySpawn` — the Daily Spawn Engine that creates recurring prompts each day and resets existing ones instead of duplicating them (the Anti-Guilt Rule).
- `useTheme` — system-aware light/dark mode toggle.
- `useAuth` — Supabase authentication session management.
- `useAnalytics` — PostHog event tracking for product insights.

### WCAG 2.1 AA Accessibility

- Automated `axe-core` scans return zero violations in both light and dark themes.
- Semantic HTML with a single `<h1>` per page, logical heading hierarchy, and `<main>` landmarks.
- Visible `focus-visible` rings on all interactive elements.
- `aria-label` coverage on every icon-only control.
- Contrast-safe text tokens for every neon accent.

### Component Primitives

- Built on Radix UI primitives (Checkbox, Dialog, Tooltip, Select, etc.) via the shadcn/ui pattern.
- Lucide icons throughout.
- Framer Motion drives satisfying micro-interactions (card sort, delete collapse, completion flash, XP bar fill).

---

## Tech Stack

- **Framework:** React 19 + TanStack Start
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS v4 + `tw-animate-css`
- **Build Tool:** Vite 8
- **State:** React hooks + Supabase real-time sync
- **Animation:** Framer Motion
- **Icons:** Lucide React
- **Backend / Auth:** Supabase
- **Analytics:** PostHog
- **Linting:** ESLint + Prettier

---

## Local Setup

```bash
# 1. Clone the repository
git clone <repo-url>
cd planner-kt

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

The app will be available at `http://localhost:8080`.

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start the Vite development server |
| `npm run build` | Create an optimized production build |
| `npm run lint` | Run ESLint across the project |
| `npm run preview` | Preview the production build locally |
| `npm run format` | Format the codebase with Prettier |

> **Note:** The project was developed with `bun`, but all scripts are standard npm-compatible commands. You can also use `pnpm` or `yarn` if you prefer.

### Environment Variables

The project expects Supabase credentials for backend sync and PostHog for analytics. For local development, copy `.env` values from your Lovable Cloud / backend settings:

```text
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
VITE_SUPABASE_PROJECT_ID=
```

These are already configured in the deployed environment.

---

## Daily Spawn Engine & Anti-Guilt Rule

The middle layer (`src/lib/use-daily-spawn.ts`) runs an ambient timer that checks for daily rollover. When a recurring quest is scheduled for today, it does **not** duplicate an uncompleted version from a previous day. Instead, it resets the existing task's subtasks and bumps its timestamp — the **Anti-Guilt Rule**. This prevents task clutter and removes the shame of yesterday's unfinished chores.

Recurring schedules include:

- 🛡️ Morning Armor — daily
- 💪 Workout — daily, with optional Rest Day mode
- 🧺 Laundry Loop — Fridays
- 🛒 Restock Fuel — Tuesdays and Saturdays
- 🗺️ Explore Burlington — every other day

---

## Project Structure

```text
src/
├── components/
│   ├── auth-screen.tsx        # Sign-in / sign-up UI
│   ├── design-system/
│   │   ├── demos.tsx          # Interactive pattern demos
│   │   └── parts.tsx          # Design system building blocks
│   └── quest-app.tsx          # Main dashboard application
├── lib/
│   ├── quest-types.ts         # Task and subtask TypeScript types
│   ├── use-analytics.ts       # PostHog tracking
│   ├── use-auth.ts            # Supabase auth
│   ├── use-daily-spawn.ts     # Daily Spawn Engine
│   ├── use-tasks.ts           # Task CRUD + sync
│   ├── use-theme.ts           # Light/dark mode
│   ├── utils.ts               # cn() helper and utilities
│   └── linkify.tsx            # Auto-detect URLs in task text
├── routes/
│   ├── __root.tsx             # Root layout and <head> metadata
│   ├── auth.tsx               # Auth route
│   ├── design-system.tsx      # /design-system documentation
│   └── index.tsx              # Home dashboard
├── styles.css                 # Semantic OKLCH tokens + Tailwind config
└── ...
```

---

## License

This is a student assistive-technology project created in Lovable. All rights reserved unless otherwise specified.

---

Built with care for the way ADHD brains actually work.
