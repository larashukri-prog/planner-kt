import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./use-auth";
import type { OwnerId, Subtask, Task, TaskStatus } from "./quest-types";
import { uid } from "./quest-types";

const WORKSPACE_KEY = "questlog.workspace.v1";
const LEGACY_TASKS_KEY = "questlog.tasks.v1";

type TaskRow = {
  id: string;
  user_id: string;
  title: string;
  status: TaskStatus;
  subtasks: Subtask[] | null;
  category: string | null;
  owner_id: string;
  recurring_key: string | null;
  due_date: string | null;
  created_at: string;
  completed_at: string | null;
};

function rowToTask(r: TaskRow): Task {
  return {
    id: r.id,
    title: r.title,
    status: r.status,
    subtasks: Array.isArray(r.subtasks) ? r.subtasks : [],
    category: r.category ?? "champlain",
    ownerId: (r.owner_id as OwnerId) ?? "solo",
    createdAt: new Date(r.created_at).getTime(),
    completedAt: r.completed_at ? new Date(r.completed_at).getTime() : null,
    recurringKey: r.recurring_key ?? undefined,
    dueDate: r.due_date ? new Date(r.due_date).getTime() : null,
  };
}

function taskToInsert(t: Task, userId: string): Record<string, unknown> {
  return {
    id: t.id,
    user_id: userId,
    title: t.title,
    status: t.status,
    subtasks: t.subtasks as unknown,
    category: t.category,
    owner_id: t.ownerId,
    recurring_key: t.recurringKey ?? null,
    due_date: t.dueDate ? new Date(t.dueDate).toISOString() : null,
    created_at: new Date(t.createdAt).toISOString(),
    completed_at: t.completedAt ? new Date(t.completedAt).toISOString() : null,
  };
}

function patchToUpdate(patch: Partial<Task>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (patch.title !== undefined) out.title = patch.title;
  if (patch.status !== undefined) out.status = patch.status;
  if (patch.subtasks !== undefined) out.subtasks = patch.subtasks;
  if (patch.category !== undefined) out.category = patch.category;
  if (patch.ownerId !== undefined) out.owner_id = patch.ownerId;
  if (patch.recurringKey !== undefined) out.recurring_key = patch.recurringKey ?? null;
  if (patch.dueDate !== undefined) out.due_date = patch.dueDate ? new Date(patch.dueDate).toISOString() : null;
  if (patch.completedAt !== undefined)
    out.completed_at = patch.completedAt ? new Date(patch.completedAt).toISOString() : null;
  if (patch.createdAt !== undefined) out.created_at = new Date(patch.createdAt).toISOString();
  return out;
}

async function importLegacyTasks(userId: string): Promise<Task[]> {
  if (typeof window === "undefined") return [];
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(LEGACY_TASKS_KEY);
  } catch {
    return [];
  }
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as Task[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      window.localStorage.removeItem(LEGACY_TASKS_KEY);
      return [];
    }
    const rows = parsed.map((t) =>
      taskToInsert(
        { ...t, id: uid(), subtasks: t.subtasks ?? [], category: t.category ?? "champlain", ownerId: t.ownerId ?? "solo" },
        userId,
      ),
    );
    const { data, error } = await (supabase.from("tasks") as any).insert(rows).select("*");
    if (error) {
      console.error("[tasks] legacy import failed", error);
      return [];
    }
    window.localStorage.removeItem(LEGACY_TASKS_KEY);
    return (data as TaskRow[]).map(rowToTask);
  } catch (e) {
    console.error("[tasks] legacy parse failed", e);
    return [];
  }
}

export function useTasks() {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [tasks, setTasks] = useState<Task[]>([]);
  const [workspace, setWorkspaceState] = useState<OwnerId>(() => {
    if (typeof window === "undefined") return "solo";
    return (window.localStorage.getItem(WORKSPACE_KEY) as OwnerId) || "solo";
  });
  const tasksRef = useRef<Task[]>([]);
  tasksRef.current = tasks;

  // Initial load + realtime subscription, scoped to current user.
  useEffect(() => {
    if (!userId) {
      setTasks([]);
      return;
    }
    let cancelled = false;

    (async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: false });
      if (cancelled) return;
      if (error) {
        console.error("[tasks] load failed", error);
        return;
      }
      const loaded = (data as TaskRow[]).map(rowToTask);
      if (loaded.length === 0) {
        const imported = await importLegacyTasks(userId);
        if (!cancelled) setTasks(imported);
      } else {
        setTasks(loaded);
      }
    })();

    const channel = supabase
      .channel(`tasks-${userId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tasks", filter: `user_id=eq.${userId}` },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const t = rowToTask(payload.new as TaskRow);
            setTasks((prev) => (prev.some((x) => x.id === t.id) ? prev : [t, ...prev]));
          } else if (payload.eventType === "UPDATE") {
            const t = rowToTask(payload.new as TaskRow);
            setTasks((prev) => prev.map((x) => (x.id === t.id ? t : x)));
          } else if (payload.eventType === "DELETE") {
            const id = (payload.old as { id: string }).id;
            setTasks((prev) => prev.filter((x) => x.id !== id));
          }
        },
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [userId]);

  useEffect(() => {
    try {
      window.localStorage.setItem(WORKSPACE_KEY, workspace);
    } catch {}
  }, [workspace]);

  const setWorkspace = (w: OwnerId) => setWorkspaceState(w);

  const optimisticAdd = (t: Task) => {
    setTasks((prev) => [t, ...prev]);
    if (!userId) return;
    void (supabase.from("tasks") as any).insert(taskToInsert(t, userId)).then(({ error }: { error: unknown }) => {
      if (error) {
        console.error("[tasks] insert failed", error);
        setTasks((prev) => prev.filter((x) => x.id !== t.id));
      }
    });
  };

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
    optimisticAdd(t);
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
    optimisticAdd(t);
  };

  const updateTask = (id: string, patch: Partial<Task>) => {
    const prev = tasksRef.current.find((t) => t.id === id);
    setTasks((cur) => cur.map((t) => (t.id === id ? { ...t, ...patch } : t)));
    if (!userId) return;
    void (supabase.from("tasks") as any).update(patchToUpdate(patch)).eq("id", id).then(({ error }: { error: unknown }) => {
      if (error) {
        console.error("[tasks] update failed", error);
        if (prev) setTasks((cur) => cur.map((t) => (t.id === id ? prev : t)));
      }
    });
  };

  const moveTask = (id: string, status: TaskStatus) => {
    const completedAt = status === "completed" ? Date.now() : null;
    updateTask(id, { status, completedAt });
  };

  const deleteTask = (id: string) => {
    const prev = tasksRef.current.find((t) => t.id === id);
    setTasks((cur) => cur.filter((t) => t.id !== id));
    if (!userId) return;
    void supabase.from("tasks").delete().eq("id", id).then(({ error }: { error: unknown }) => {
      if (error) {
        console.error("[tasks] delete failed", error);
        if (prev) setTasks((cur) => [prev, ...cur]);
      }
    });
  };

  const addSubtask = (taskId: string, text: string) => {
    const task = tasksRef.current.find((t) => t.id === taskId);
    if (!task) return;
    const newSubs = [...task.subtasks, { id: uid(), text: text.trim(), isCompleted: false }];
    updateTask(taskId, { subtasks: newSubs });
  };

  const toggleSubtask = (taskId: string, subId: string) => {
    const task = tasksRef.current.find((t) => t.id === taskId);
    if (!task) return;
    const newSubs = task.subtasks.map((s) => (s.id === subId ? { ...s, isCompleted: !s.isCompleted } : s));
    updateTask(taskId, { subtasks: newSubs });
  };

  const removeSubtask = (taskId: string, subId: string) => {
    const task = tasksRef.current.find((t) => t.id === taskId);
    if (!task) return;
    updateTask(taskId, { subtasks: task.subtasks.filter((s) => s.id !== subId) });
  };

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
