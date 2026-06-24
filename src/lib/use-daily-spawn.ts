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

type Params = {
  tasks: Task[];
  addRecurringTask: (input: {
    title: string;
    subtasks: string[];
    status: TaskStatus;
    recurringKey: string;
  }) => void;
  updateTask: (id: string, patch: Partial<Task>) => void;
};

export function useDailySpawn({ tasks, addRecurringTask, updateTask }: Params) {
  // Keep latest tasks reference without re-binding the interval.
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
      if (lastKey === todayKey) return;

      const current = tasksRef.current;
      for (const entry of RECURRING_QUESTS) {
        if (!entry.shouldSpawn(today)) continue;

        const existing = current.find(
          (t) =>
            t.recurringKey === entry.key &&
            t.status !== "completed" &&
            t.ownerId === "solo",
        );

        if (existing) {
          // Refresh: reset subtasks, bump createdAt. Do NOT touch status.
          updateTask(existing.id, {
            subtasks: existing.subtasks.map((s) => ({ ...s, isCompleted: false })),
            createdAt: Date.now(),
          });
        } else {
          addRecurringTask({
            title: entry.title,
            subtasks: entry.subtasks,
            status: entry.zone,
            recurringKey: entry.key,
          });
        }
      }

      try {
        window.localStorage.setItem(TICK_KEY, todayKey);
      } catch {
        /* ignore */
      }
    };

    runTick();
    const id = window.setInterval(runTick, 60_000);
    return () => window.clearInterval(id);
    // Intentionally empty deps — engine runs on mount + 60s interval,
    // reads latest tasks via ref. Avoids re-running on every task edit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
