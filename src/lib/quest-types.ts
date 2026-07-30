export type TaskStatus = "inbox" | "now" | "next" | "later" | "completed";
export type OwnerId = "solo" | "family";

export interface Subtask {
  id: string;
  text: string;
  isCompleted: boolean;
}

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  subtasks: Subtask[];
  category: string;
  ownerId: OwnerId;
  createdAt: number;
  completedAt: number | null;
  recurringKey?: string;
  dueDate?: number | null;
  escalatedAt?: number | null;
}

export const uid = () =>
  globalThis.crypto?.randomUUID?.() ??
  Math.random().toString(36).slice(2) + Date.now().toString(36);
