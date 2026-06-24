import { useEffect, useRef } from "react";
import type { Task, TaskStatus } from "./quest-types";

const TICK_KEY = "questlog.lastSpawnDate.v1";

type Recurring = {
  key: string;
  title: string;
  subtasks: string[];
  zone: Extract<TaskStatus, "now" | "next">;
  shouldSpawn: (today: Date) => boolean;
};

function dayOfYear(d: Date): number {
  const jan1 = new Date(d.getFullYear(), 0, 1);
  return Math.floor((d.getTime() - jan1.getTime()) / 86400000);
}

const RECURRING_QUESTS: Recurring[] = [
  {
    key: "morning-armor",
    title: "🛡️ Morning Routine",
    subtasks: ["Shower", "Brush Teeth", "Wash Face & Skincare"],
    zone: "now",
    shouldSpawn: () => true,
  },
  {
    key: "laundry-loop",
    title: "🧺 Laundry Loop",
    subtasks: ["Gather clothes", "Start washer", "Move to dryer", "Put away"],
    zone: "now",
    shouldSpawn: (today) => today.getDay() === 5,
  },
  {
    key: "restock-fuel",
    title: "🛒 Restock Fuel",
    subtasks: ["Check fridge/pantry", "Walk to grocery store", "Grab essentials"],
    zone: "now",
    shouldSpawn: (today) => today.getDay() === 2 || today.getDay() === 6,
  },
  {
    key: "explore-burlington",
    title: "🗺️ Explore Burlington",
    subtasks: [
      "Pick a local spot (Church St, Lake Champlain, or a new coffee shop)",
      "Leave the dorm for 30+ minutes",
      "Take a mental break",
    ],
    zone: "next",
    shouldSpawn: (today) => dayOfYear(today) % 2 === 0,
  },
];

function localDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function normalizeTitle(s: string): string {
  // strip leading non-letter chars (emoji + whitespace) and lowercase
  return s.replace(/^[^\p{L}\p{N}]+/u, "").trim().toLowerCase();
}

type Params = {
  tasks: Task[];
  addRecurringTask: (input: {
    title: string;
    subtasks: string[];
    status: TaskStatus;
    recurringKey: string;
  }) => void;
  updateTask: (id: string, patch: Partial<Task>) => void;
  deleteTask: (id: string) => void;
};

export function useDailySpawn({ tasks, addRecurringTask, updateTask, deleteTask }: Params) {
  const tasksRef = useRef(tasks);
  useEffect(() => {
    tasksRef.current = tasks;
  }, [tasks]);

  useEffect(() => {
    const runTick = () => {
      if (typeof window === "undefined") return;
      const today = new Date();
      const todayKey = localDateKey(today);
      let lastKey: string | null = null;
      try {
        lastKey = window.localStorage.getItem(TICK_KEY);
      } catch {
        return;
      }
      const dateChanged = lastKey !== todayKey;
      const current = tasksRef.current;

      for (const entry of RECURRING_QUESTS) {
        const activeSolo = current.filter(
          (t) => t.status !== "completed" && t.ownerId === "solo",
        );
        const normEntry = normalizeTitle(entry.title);

        // Gather all candidates: tagged with this recurringKey OR title-matching orphans.
        const matches = activeSolo.filter(
          (t) =>
            t.recurringKey === entry.key ||
            (!t.recurringKey && normalizeTitle(t.title) === normEntry),
        );

        if (matches.length > 0) {
          // Keep the oldest, drop the rest.
          matches.sort((a, b) => a.createdAt - b.createdAt);
          const keep = matches[0];
          for (let i = 1; i < matches.length; i++) deleteTask(matches[i].id);

          // Adopt orphan (no recurringKey) — always safe.
          if (!keep.recurringKey) {
            updateTask(keep.id, { recurringKey: entry.key, title: entry.title });
          }

          // Refresh subtasks only when the calendar day rolls over.
          if (dateChanged && entry.shouldSpawn(today)) {
            updateTask(keep.id, {
              subtasks: keep.subtasks.map((s) => ({ ...s, isCompleted: false })),
              createdAt: Date.now(),
            });
          }
        } else if (dateChanged && entry.shouldSpawn(today)) {
          addRecurringTask({
            title: entry.title,
            subtasks: entry.subtasks,
            status: entry.zone,
            recurringKey: entry.key,
          });
        }
      }

      if (dateChanged) {
        try {
          window.localStorage.setItem(TICK_KEY, todayKey);
        } catch {
          /* ignore */
        }
      }
    };

    runTick();
    const id = window.setInterval(runTick, 60_000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

