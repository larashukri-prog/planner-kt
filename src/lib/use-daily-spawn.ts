import { useEffect, useRef } from "react";
import type { Task, TaskStatus } from "./quest-types";
import { uid } from "./quest-types";

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
    subtasks: ["Shower", "Brush Teeth", "Wash Face", "Skincare", "Hair"],
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
  const hasLoadedRef = useRef(false);
  const tickFnRef = useRef<() => void>(() => {});

  useEffect(() => {
    tasksRef.current = tasks;
    if (!hasLoadedRef.current && tasks.length > 0) {
      hasLoadedRef.current = true;
      tickFnRef.current();
    }
  }, [tasks]);

  useEffect(() => {
    const runTick = () => {
      if (typeof window === "undefined") return;
      if (!hasLoadedRef.current) return;

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

        const matches = activeSolo.filter(
          (t) =>
            t.recurringKey === entry.key ||
            (!t.recurringKey && normalizeTitle(t.title) === normEntry),
        );

        if (matches.length > 0) {
          matches.sort((a, b) => a.createdAt - b.createdAt);
          const keep = matches[0];
          for (let i = 1; i < matches.length; i++) deleteTask(matches[i].id);

          if (!keep.recurringKey) {
            updateTask(keep.id, { recurringKey: entry.key, title: entry.title });
          }

          // Remove obsolete combined subtasks superseded by template updates.
          const OBSOLETE_SUBTASKS: Record<string, string[]> = {
            "morning-armor": ["wash face & skincare"],
          };
          const obsolete = new Set(
            (OBSOLETE_SUBTASKS[entry.key] ?? []).map((s) => s.toLowerCase()),
          );
          const prunedSubtasks = keep.subtasks.filter(
            (s) => !obsolete.has(s.text.trim().toLowerCase()),
          );
          if (prunedSubtasks.length !== keep.subtasks.length) {
            updateTask(keep.id, { subtasks: prunedSubtasks });
            keep.subtasks = prunedSubtasks;
          }

          const existingTexts = new Set(
            keep.subtasks.map((s) => s.text.trim().toLowerCase()),
          );
          const missing = entry.subtasks.filter(
            (text) => !existingTexts.has(text.trim().toLowerCase()),
          );
          if (missing.length > 0) {
            updateTask(keep.id, {
              subtasks: [
                ...keep.subtasks,
                ...missing.map((text) => ({ id: uid(), text, isCompleted: false })),
              ],
            });
          }

          // Anti-Guilt refresh: on rollover days the entry is scheduled for, reset subtasks + bump timestamp.
          if (dateChanged && entry.shouldSpawn(today)) {
            const refreshed = (missing.length > 0
              ? [
                  ...keep.subtasks,
                  ...missing.map((text) => ({ id: uid(), text, isCompleted: false })),
                ]
              : keep.subtasks
            ).map((s) => ({ ...s, isCompleted: false }));
            updateTask(keep.id, {
              subtasks: refreshed,
              createdAt: Date.now(),
            });
          }
        } else if (entry.shouldSpawn(today)) {
          // No active instance — spawn a fresh one whenever it's a scheduled day,
          // regardless of dateChanged (covers "completed yesterday" + first-of-day load).
          addRecurringTask({
            title: entry.title,
            subtasks: entry.subtasks,
            status: entry.zone,
            recurringKey: entry.key,
          });
        }
      }

      // Auto-Escalation Engine — runs once per day rollover.
      if (dateChanged) {
        const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
        for (const task of current) {
          if (task.status === "completed") continue;
          if (task.dueDate == null) continue;
          if (task.status === "now") continue;
          const daysUntil = Math.ceil((task.dueDate - todayMidnight) / 86400000);
          if ((task.status === "later" || task.status === "next") && daysUntil <= 2) {
            updateTask(task.id, { status: "now", escalatedAt: Date.now() });
          } else if (task.status === "later" && daysUntil <= 7) {
            updateTask(task.id, { status: "next", escalatedAt: Date.now() });
          }
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

    tickFnRef.current = runTick;

    // Grace period: if no tasks have loaded after 1500ms (e.g. brand-new account
    // with zero rows), allow the tick to run so first-day spawns still happen.
    const graceTimer = window.setTimeout(() => {
      if (!hasLoadedRef.current) {
        hasLoadedRef.current = true;
        runTick();
      }
    }, 1500);

    if (hasLoadedRef.current) runTick();
    const id = window.setInterval(runTick, 60_000);
    return () => {
      window.clearInterval(id);
      window.clearTimeout(graceTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

