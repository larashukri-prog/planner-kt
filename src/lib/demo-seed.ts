import { supabase } from "@/integrations/supabase/client";
import { uid } from "./quest-types";
import type { TaskStatus } from "./quest-types";

const SEED_FLAG = "questlog.demoSeeded.v1";

function subtasks(items: string[]) {
  return items.map((text) => ({ id: uid(), text, isCompleted: false }));
}

type SeedRow = {
  title: string;
  status: TaskStatus;
  subtasks: string[];
  recurring_key?: string;
  minutesAgo: number;
  completed?: boolean;
};

const SEED: SeedRow[] = [
  {
    title: "🛡️ Morning Routine",
    status: "now",
    subtasks: ["Shower", "Brush Teeth", "Wash Face", "Skincare", "Hair"],
    recurring_key: "morning-armor",
    minutesAgo: 240,
  },
  {
    title: "⚔️ Level Design Deep Dive",
    status: "now",
    subtasks: ["Open the brief", "Block out one room", "Export a screenshot"],
    minutesAgo: 200,
  },
  {
    title: "🧺 Laundry Loop",
    status: "next",
    subtasks: ["Gather clothes", "Start washer", "Move to dryer", "Put away"],
    recurring_key: "laundry-loop",
    minutesAgo: 180,
  },
  {
    title: "🗺️ Explore College Town",
    status: "later",
    subtasks: ["Pick a local spot", "Leave the dorm for 30+ minutes"],
    recurring_key: "explore-college-town",
    minutesAgo: 160,
  },
  {
    title: "💪 Workout",
    status: "completed",
    subtasks: ["Warmup", "Free weights", "Chug water"],
    recurring_key: "workout",
    minutesAgo: 120,
    completed: true,
  },
  {
    title: "📚 Read one chapter of the design reader",
    status: "completed",
    subtasks: [],
    minutesAgo: 90,
    completed: true,
  },
];

/**
 * Seed a fresh guest (anonymous) account with a small set of sample quests
 * so Demo Mode looks alive immediately. Runs at most once per browser.
 */
export async function seedDemoTasks(userId: string): Promise<void> {
  try {
    if (typeof window !== "undefined" && window.localStorage.getItem(SEED_FLAG)) return;
  } catch {
    // localStorage unavailable — continue, worst case we re-seed
  }

  const now = Date.now();
  const rows = SEED.map((s) => {
    const created = new Date(now - s.minutesAgo * 60_000).toISOString();
    return {
      id: uid(),
      user_id: userId,
      title: s.title,
      status: s.status,
      subtasks: subtasks(s.subtasks) as unknown as never,
      category: "champlain",
      owner_id: "solo",
      recurring_key: s.recurring_key ?? null,
      due_date: null,
      created_at: created,
      completed_at: s.completed ? new Date(now - (s.minutesAgo - 30) * 60_000).toISOString() : null,
    };
  });

  const { error } = await supabase.from("tasks").insert(rows);
  if (error) throw error;

  try {
    window.localStorage.setItem(SEED_FLAG, "1");
  } catch {
    // ignore
  }
}
