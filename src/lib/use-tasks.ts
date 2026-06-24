import { useEffect, useState } from "react";
import type { OwnerId, Task, TaskStatus } from "./quest-types";
import { uid } from "./quest-types";

const STORAGE_KEY = "questlog.tasks.v1";
const WORKSPACE_KEY = "questlog.workspace.v1";

function load(): Task[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return seed();
    const parsed = JSON.parse(raw) as Task[];
    return Array.isArray(parsed) ? parsed : seed();
  } catch {
    return seed();
  }
}

function seed(): Task[] {
  const now = Date.now();
  return [
    {
      id: uid(),
      title: "Sketch level layout for capstone prototype",
      status: "now",
      subtasks: [
        { id: uid(), text: "Block out main room", isCompleted: true },
        { id: uid(), text: "Add enemy spawn points", isCompleted: false },
        { id: uid(), text: "Place collectibles", isCompleted: false },
      ],
      category: "champlain",
      ownerId: "solo",
      createdAt: now - 1000 * 60 * 60 * 3,
      completedAt: null,
    },
    {
      id: uid(),
      title: "Read Game Feel ch. 4",
      status: "next",
      subtasks: [],
      category: "champlain",
      ownerId: "solo",
      createdAt: now - 1000 * 60 * 60 * 2,
      completedAt: null,
    },
    {
      id: uid(),
      title: "Pitch deck for Friday playtest",
      status: "later",
      subtasks: [],
      category: "champlain",
      ownerId: "solo",
      createdAt: now - 1000 * 60 * 60,
      completedAt: null,
    },
    {
      id: uid(),
      title: "Submit C# polymorphism exercise",
      status: "completed",
      subtasks: [],
      category: "champlain",
      ownerId: "solo",
      createdAt: now - 1000 * 60 * 60 * 24,
      completedAt: now - 1000 * 60 * 60 * 4,
    },
  ];
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>(() => load());
  const [workspace, setWorkspaceState] = useState<OwnerId>(() => {
    if (typeof window === "undefined") return "solo";
    return (window.localStorage.getItem(WORKSPACE_KEY) as OwnerId) || "solo";
  });

  useEffect(() => {
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)); } catch {}
  }, [tasks]);

  useEffect(() => {
    try { window.localStorage.setItem(WORKSPACE_KEY, workspace); } catch {}
  }, [workspace]);

  const setWorkspace = (w: OwnerId) => setWorkspaceState(w);

  const addTask = (title: string, subtaskTexts?: string[]) => {
    const t: Task = {
      id: uid(),
      title: title.trim(),
      status: "inbox",
      subtasks: subtaskTexts?.map((text) => ({ id: uid(), text: text.trim(), isCompleted: false })) ?? [],
      category: "champlain",
      ownerId: workspace,
      createdAt: Date.now(),
      completedAt: null,
    };
    setTasks((prev) => [t, ...prev]);
  };

  const addRecurringTask = (input: {
    title: string;
    subtasks: string[];
    status: TaskStatus;
    recurringKey: string;
  }) => {
    const t: Task = {
      id: uid(),
      title: input.title,
      status: input.status,
      subtasks: input.subtasks.map((text) => ({ id: uid(), text, isCompleted: false })),
      category: "champlain",
      ownerId: "solo",
      createdAt: Date.now(),
      completedAt: null,
      recurringKey: input.recurringKey,
    };
    setTasks((prev) => [t, ...prev]);
  };

  const updateTask = (id: string, patch: Partial<Task>) =>
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));

  const moveTask = (id: string, status: TaskStatus) =>
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              status,
              completedAt: status === "completed" ? Date.now() : null,
            }
          : t,
      ),
    );

  const deleteTask = (id: string) =>
    setTasks((prev) => prev.filter((t) => t.id !== id));

  const addSubtask = (taskId: string, text: string) =>
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, subtasks: [...t.subtasks, { id: uid(), text: text.trim(), isCompleted: false }] }
          : t,
      ),
    );

  const toggleSubtask = (taskId: string, subId: string) =>
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              subtasks: t.subtasks.map((s) =>
                s.id === subId ? { ...s, isCompleted: !s.isCompleted } : s,
              ),
            }
          : t,
      ),
    );

  const removeSubtask = (taskId: string, subId: string) =>
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, subtasks: t.subtasks.filter((s) => s.id !== subId) } : t,
      ),
    );

  return {
    tasks,
    workspace,
    setWorkspace,
    addTask,
    addRecurringTask,
    updateTask,
    moveTask,
    deleteTask,
    addSubtask,
    toggleSubtask,
    removeSubtask,
  };
}
