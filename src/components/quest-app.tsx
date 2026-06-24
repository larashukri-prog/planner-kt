import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, LayoutGroup } from "framer-motion";
import {
  Check, Inbox, Plus, Sparkles, Swords, Trash2, Trophy, Users, User,
  ChevronDown, X, Flame, Layers, Hourglass,
} from "lucide-react";
import { useTasks } from "@/lib/use-tasks";
import type { OwnerId, Task, TaskStatus } from "@/lib/quest-types";

type View = "board" | "done";

const ZONES: { id: Exclude<TaskStatus, "inbox" | "completed">; label: string; sub: string; icon: typeof Flame; tint: string }[] = [
  { id: "now",   label: "NOW",   sub: "Active quests",  icon: Flame,     tint: "var(--color-zone-now)" },
  { id: "next",  label: "NEXT",  sub: "On deck",        icon: Layers,    tint: "var(--color-zone-next)" },
  { id: "later", label: "LATER", sub: "Backlog vault",  icon: Hourglass, tint: "var(--color-zone-later)" },
];

export default function QuestApp() {
  const t = useTasks();
  const [view, setView] = useState<View>("board");
  const [dragId, setDragId] = useState<string | null>(null);

  const filtered = t.tasks.filter((x) => x.ownerId === t.workspace);
  const inbox = filtered.filter((x) => x.status === "inbox");
  const completed = filtered.filter((x) => x.status === "completed").sort((a, b) => (b.completedAt ?? 0) - (a.completedAt ?? 0));
  const activeCount = filtered.filter((x) => x.status !== "completed").length;

  return (
    <div className="min-h-screen w-full text-foreground">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 md:px-8 md:py-10">
        <Header
          workspace={t.workspace}
          onWorkspace={t.setWorkspace}
          view={view}
          onView={setView}
          activeCount={activeCount}
          doneCount={completed.length}
        />

        <TemplateChips onCreate={t.addTask} workspace={t.workspace} />
        <QuickAddBar onAdd={t.addTask} workspace={t.workspace} />

        <AnimatePresence mode="wait">
          {view === "board" ? (
            <motion.div
              key="board"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22 }}
              className="flex flex-col gap-6"
            >
              <InboxStrip
                items={inbox}
                onMove={t.moveTask}
                onDelete={t.deleteTask}
                dragId={dragId}
                setDragId={setDragId}
              />
              <DailyXPBar tasks={filtered} />
              <ZoneBoard
                tasks={filtered}
                onMove={t.moveTask}
                onDelete={t.deleteTask}
                onAddSubtask={t.addSubtask}
                onToggleSubtask={t.toggleSubtask}
                onRemoveSubtask={t.removeSubtask}
                dragId={dragId}
                setDragId={setDragId}
              />

            </motion.div>
          ) : (
            <motion.div
              key="done"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22 }}
            >
              <DoneWall items={completed} onMove={t.moveTask} onDelete={t.deleteTask} />
            </motion.div>
          )}
        </AnimatePresence>

        <footer className="pt-6 pb-2 text-center text-xs text-muted-foreground">
          <span className="font-mono">Quest Log v1</span> — built for the way your brain works.
        </footer>
      </div>
    </div>
  );
}

/* ----------------------------- Header ----------------------------- */

function Header({
  workspace, onWorkspace, view, onView, activeCount, doneCount,
}: {
  workspace: OwnerId;
  onWorkspace: (w: OwnerId) => void;
  view: View;
  onView: (v: View) => void;
  activeCount: number;
  doneCount: number;
}) {
  return (
    <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-[var(--color-neon)] to-[var(--color-neon-2)] shadow-[var(--shadow-neon)]">
            <Swords className="h-5 w-5 text-[var(--color-neon-foreground)]" strokeWidth={2.5} />
          </div>
        </div>
        <div>
          <h1 className="font-display text-xl font-semibold leading-tight tracking-tight">Quest Log</h1>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            {activeCount} active · {doneCount} cleared
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <ViewToggle view={view} onView={onView} />
        <WorkspaceToggle workspace={workspace} onWorkspace={onWorkspace} />
      </div>
    </header>
  );
}

function ViewToggle({ view, onView }: { view: View; onView: (v: View) => void }) {
  const items: { id: View; label: string; icon: typeof Sparkles }[] = [
    { id: "board", label: "Board", icon: Sparkles },
    { id: "done",  label: "Done Wall", icon: Trophy },
  ];
  return (
    <div className="relative flex rounded-xl border border-border bg-card/60 p-1 backdrop-blur">
      {items.map((it) => {
        const active = view === it.id;
        const Icon = it.icon;
        return (
          <button
            key={it.id}
            onClick={() => onView(it.id)}
            className="relative z-10 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
            style={{ color: active ? "var(--color-neon-foreground)" : "var(--color-muted-foreground)" }}
          >
            {active && (
              <motion.span
                layoutId="view-pill"
                className="absolute inset-0 -z-10 rounded-lg bg-[var(--color-neon)]"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <Icon className="h-3.5 w-3.5" />
            {it.label}
          </button>
        );
      })}
    </div>
  );
}

function WorkspaceToggle({ workspace, onWorkspace }: { workspace: OwnerId; onWorkspace: (w: OwnerId) => void }) {
  const items: { id: OwnerId; label: string; icon: typeof User }[] = [
    { id: "solo",   label: "My Quests",  icon: User },
    { id: "family", label: "Family Hub", icon: Users },
  ];
  return (
    <div className="relative flex rounded-xl border border-border bg-card/60 p-1 backdrop-blur">
      {items.map((it) => {
        const active = workspace === it.id;
        const Icon = it.icon;
        return (
          <button
            key={it.id}
            onClick={() => onWorkspace(it.id)}
            className="relative z-10 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
            style={{ color: active ? "var(--color-neon-foreground)" : "var(--color-muted-foreground)" }}
          >
            {active && (
              <motion.span
                layoutId="ws-pill"
                className="absolute inset-0 -z-10 rounded-lg"
                style={{ background: "var(--color-neon-3)" }}
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <Icon className="h-3.5 w-3.5" />
            {it.label}
          </button>
        );
      })}
    </div>
  );
}

/* --------------------------- QuickAddBar --------------------------- */

function QuickAddBar({ onAdd, workspace }: { onAdd: (title: string) => void; workspace: OwnerId }) {
  const [value, setValue] = useState("");
  const ref = useRef<HTMLInputElement>(null);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
        e.preventDefault();
        ref.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;
    onAdd(value);
    setValue("");
    setPulse(true);
    setTimeout(() => setPulse(false), 400);
  };

  return (
    <motion.form
      onSubmit={submit}
      animate={pulse ? { scale: [1, 1.01, 1] } : {}}
      transition={{ duration: 0.35 }}
      className="quest-card relative flex items-center gap-3 px-4 py-3 md:px-5 md:py-4"
    >
      <div
        className="grid h-9 w-9 shrink-0 place-items-center rounded-lg"
        style={{ background: "color-mix(in oklab, var(--color-inbox) 18%, transparent)", color: "var(--color-inbox)" }}
      >
        <Inbox className="h-4 w-4" />
      </div>
      <input
        ref={ref}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={
          workspace === "family"
            ? "Drop it in the Family Hub — groceries, plans, anything…"
            : "Brain dump a quest. Press Enter. No tags. No deadlines."
        }
        className="flex-1 bg-transparent text-base font-medium outline-none placeholder:font-normal placeholder:text-muted-foreground md:text-lg"
      />
      <kbd className="hidden rounded-md border border-border bg-secondary/60 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground md:inline">
        /
      </kbd>
      <button
        type="submit"
        disabled={!value.trim()}
        className="flex items-center gap-1.5 rounded-lg bg-[var(--color-neon)] px-3 py-1.5 text-xs font-semibold text-[var(--color-neon-foreground)] transition-all hover:brightness-110 disabled:opacity-40"
        style={{ boxShadow: value.trim() ? "var(--shadow-neon)" : "none" }}
      >
        <Plus className="h-3.5 w-3.5" strokeWidth={3} />
        Capture
      </button>
    </motion.form>
  );
}

/* -------------------------- Template Chips -------------------------- */

const QUEST_TEMPLATES = [
  { icon: "🛡️", label: "Morning Armor", title: "Morning Routine", subtasks: ["Shower", "Brush Teeth", "Wash Face", "Skincare", "Deodorant", "Perfume"], tint: "oklch(0.72 0.18 85)" },
  { icon: "🧺", label: "Laundry Loop", title: "Laundry", subtasks: ["Gather clothes", "Start washer", "Move to dryer", "Put in basket", "Put away"], tint: "oklch(0.7 0.16 230)" },
  { icon: "🛒", label: "Restock Fuel", title: "Grocery Run", subtasks: ["Check fridge & pantry", "Make list", "Go to store", "Unload and put away"], tint: "oklch(0.72 0.18 140)" },
  { icon: "🧹", label: "15-Min Reset", title: "Room Reset", subtasks: ["Pick up floor", "Clear surfaces", "Make bed", "Empty trash", "Quick vacuum"], tint: "oklch(0.7 0.16 25)" },
  { icon: "⚔️", label: "Deep Dive", title: "Academic Deep Dive", subtasks: ["Gather materials", "Set timer (90 min)", "No phone zone", "Review notes", "Reward break"], tint: "oklch(0.82 0.2 180)" },
  { icon: "🗺️", label: "Explore", title: "Explore Burlington", subtasks: ["Pick a spot", "Check bus schedule", "Pack bag", "Go adventure"], tint: "oklch(0.7 0.18 290)" },
];

function TemplateChips({ onCreate, workspace }: { onCreate: (title: string, subtasks: string[]) => void; workspace: OwnerId }) {
  const [clickedId, setClickedId] = useState<string | null>(null);

  const handleClick = (tpl: (typeof QUEST_TEMPLATES)[number]) => {
    onCreate(tpl.title, tpl.subtasks);
    setClickedId(tpl.label);
    setTimeout(() => setClickedId((cur) => (cur === tpl.label ? null : cur)), 600);
  };

  return (
    <div className="flex flex-col gap-2">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        1-Click Quests
      </p>
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-quest">
        {QUEST_TEMPLATES.map((tpl) => {
          const isClicked = clickedId === tpl.label;
          return (
            <motion.button
              key={tpl.label}
              whileHover={{ scale: 1.05, y: -1 }}
              whileTap={{ scale: 0.88 }}
              animate={isClicked ? { scale: [1, 1.12, 1], y: [0, -3, 0] } : {}}
              transition={{ type: "spring", stiffness: 400, damping: 18 }}
              onClick={() => handleClick(tpl)}
              className="group relative flex shrink-0 items-center gap-2 rounded-full border border-border bg-card/70 px-3.5 py-2 text-sm font-medium backdrop-blur-sm transition-colors hover:border-[var(--color-neon)]/40 hover:bg-card"
              style={{ boxShadow: isClicked ? `0 0 0 1px ${tpl.tint}, 0 6px 20px -8px ${tpl.tint}` : "none" }}
            >
              <span
                className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs transition-transform duration-200 group-hover:scale-110"
                style={{ background: `color-mix(in oklab, ${tpl.tint} 18%, transparent)` }}
              >
                {tpl.icon}
              </span>
              <span className="whitespace-nowrap">{tpl.label}</span>
              {isClicked && (
                <motion.span
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="font-mono text-[10px] font-semibold uppercase tracking-wider"
                  style={{ color: tpl.tint }}
                >
                  Created!
                </motion.span>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

/* ----------------------------- Inbox ----------------------------- */

function InboxStrip({
  items, onMove, onDelete, dragId, setDragId,
}: {
  items: Task[];
  onMove: (id: string, s: TaskStatus) => void;
  onDelete: (id: string) => void;
  dragId: string | null;
  setDragId: (s: string | null) => void;
}) {
  if (items.length === 0) return null;
  return (
    <section className="quest-card px-4 py-4 md:px-5">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Inbox className="h-3.5 w-3.5" style={{ color: "var(--color-inbox)" }} />
          <h2 className="font-mono text-[11px] uppercase tracking-[0.2em]" style={{ color: "var(--color-inbox)" }}>
            Inbox · {items.length}
          </h2>
        </div>
        <span className="text-[11px] text-muted-foreground">Sort when ready — no rush.</span>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-quest">
        <LayoutGroup>
          <AnimatePresence initial={false}>
            {items.map((task) => (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, scale: 0.95, y: -8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, x: -20 }}
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
                draggable
                onDragStart={() => setDragId(task.id)}
                onDragEnd={() => setDragId(null)}
                className="group relative min-w-[240px] max-w-[280px] shrink-0 cursor-grab rounded-lg border border-border bg-card/70 p-3 active:cursor-grabbing"
                style={{ outline: dragId === task.id ? "1px solid var(--color-inbox)" : undefined }}
              >
                <p className="line-clamp-2 text-sm font-medium leading-snug">{task.title}</p>
                <div className="mt-3 flex items-center gap-1">
                  <ZoneQuickButton label="Now"   tint="var(--color-zone-now)"   onClick={() => onMove(task.id, "now")} />
                  <ZoneQuickButton label="Next"  tint="var(--color-zone-next)"  onClick={() => onMove(task.id, "next")} />
                  <ZoneQuickButton label="Later" tint="var(--color-zone-later)" onClick={() => onMove(task.id, "later")} />
                  <button
                    onClick={() => onDelete(task.id)}
                    aria-label="Delete"
                    className="ml-auto rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </LayoutGroup>
      </div>
    </section>
  );
}

function ZoneQuickButton({ label, tint, onClick }: { label: string; tint: string; onClick: () => void }) {
  return (
    <motion.button
      whileTap={{ scale: 0.92 }}
      onClick={onClick}
      className="rounded-md border border-border px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
      style={{ borderColor: `color-mix(in oklab, ${tint} 35%, var(--color-border))` }}
    >
      <span style={{ color: tint }}>→</span> {label}
    </motion.button>
  );
}

/* ----------------------------- ZoneBoard ----------------------------- */

function ZoneBoard({
  tasks, onMove, onDelete, onAddSubtask, onToggleSubtask, onRemoveSubtask, dragId, setDragId,
}: {
  tasks: Task[];
  onMove: (id: string, s: TaskStatus) => void;
  onDelete: (id: string) => void;
  onAddSubtask: (taskId: string, text: string) => void;
  onToggleSubtask: (taskId: string, subId: string) => void;
  onRemoveSubtask: (taskId: string, subId: string) => void;
  dragId: string | null;
  setDragId: (s: string | null) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <LayoutGroup>
        {ZONES.map((z) => {
          const items = tasks.filter((t) => t.status === z.id);
          return (
            <ZoneColumn
              key={z.id}
              zone={z}
              items={items}
              onMove={onMove}
              onDelete={onDelete}
              onAddSubtask={onAddSubtask}
              onToggleSubtask={onToggleSubtask}
              onRemoveSubtask={onRemoveSubtask}
              dragId={dragId}
              setDragId={setDragId}
            />
          );
        })}
      </LayoutGroup>
    </div>
  );
}

function ZoneColumn({
  zone, items, onMove, onDelete, onAddSubtask, onToggleSubtask, onRemoveSubtask, dragId, setDragId,
}: {
  zone: (typeof ZONES)[number];
  items: Task[];
  onMove: (id: string, s: TaskStatus) => void;
  onDelete: (id: string) => void;
  onAddSubtask: (taskId: string, text: string) => void;
  onToggleSubtask: (taskId: string, subId: string) => void;
  onRemoveSubtask: (taskId: string, subId: string) => void;
  dragId: string | null;
  setDragId: (s: string | null) => void;
}) {
  const [over, setOver] = useState(false);
  const Icon = zone.icon;

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={() => {
        setOver(false);
        if (dragId) onMove(dragId, zone.id);
        setDragId(null);
      }}
      className="quest-card flex min-h-[400px] flex-col p-4 transition-all"
      style={{
        outline: over ? `1px dashed ${zone.tint}` : "none",
        outlineOffset: 4,
        background: over
          ? `linear-gradient(180deg, color-mix(in oklab, ${zone.tint} 14%, var(--color-card)) 0%, var(--color-card) 100%)`
          : undefined,
      }}
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="grid h-7 w-7 place-items-center rounded-md"
            style={{ background: `color-mix(in oklab, ${zone.tint} 16%, transparent)`, color: zone.tint }}
          >
            <Icon className="h-3.5 w-3.5" />
          </div>
          <div>
            <h3 className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em]" style={{ color: zone.tint }}>
              {zone.label}
            </h3>
            <p className="text-[11px] text-muted-foreground">{zone.sub}</p>
          </div>
        </div>
        <span className="font-mono text-xs text-muted-foreground">{items.length}</span>
      </div>

      <div className="flex flex-1 flex-col gap-2">
        <AnimatePresence initial={false}>
          {items.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="grid flex-1 place-items-center rounded-lg border border-dashed border-border/60 py-10 text-center text-[11px] text-muted-foreground"
            >
              Drop a quest here
            </motion.div>
          )}
          {items.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              zoneTint={zone.tint}
              onMove={onMove}
              onDelete={onDelete}
              onAddSubtask={onAddSubtask}
              onToggleSubtask={onToggleSubtask}
              onRemoveSubtask={onRemoveSubtask}
              setDragId={setDragId}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ----------------------------- TaskCard ----------------------------- */

function TaskCard({
  task, zoneTint, onMove, onDelete, onAddSubtask, onToggleSubtask, onRemoveSubtask, setDragId,
}: {
  task: Task;
  zoneTint: string;
  onMove: (id: string, s: TaskStatus) => void;
  onDelete: (id: string) => void;
  onAddSubtask: (taskId: string, text: string) => void;
  onToggleSubtask: (taskId: string, subId: string) => void;
  onRemoveSubtask: (taskId: string, subId: string) => void;
  setDragId: (s: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [subInput, setSubInput] = useState("");
  const [completing, setCompleting] = useState(false);
  const total = task.subtasks.length;
  const done = task.subtasks.filter((s) => s.isCompleted).length;
  const pct = total === 0 ? 0 : (done / total) * 100;
  const allDone = total > 0 && done === total;
  const readyToClaim = total === 0 || allDone;

  const handleComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (completing) return;
    setCompleting(true);
    // Let the success flash play, then unmount via status change
    window.setTimeout(() => onMove(task.id, "completed"), 320);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={
        completing
          ? {
              opacity: 1,
              scale: [1, 1.03, 0.96],
              backgroundColor: [
                "rgba(0,0,0,0)",
                "color-mix(in oklab, var(--color-neon-3) 55%, transparent)",
                "color-mix(in oklab, var(--color-neon-3) 25%, transparent)",
              ],
              boxShadow: [
                "0 0 0 0 rgba(0,0,0,0)",
                "0 0 32px 4px color-mix(in oklab, var(--color-neon-3) 55%, transparent)",
                "0 0 0 0 rgba(0,0,0,0)",
              ],
            }
          : { opacity: 1, y: 0, scale: 1 }
      }
      exit={{ opacity: 0, scale: 0.9, x: 30, transition: { duration: 0.2 } }}
      transition={
        completing
          ? { duration: 0.32, ease: [0.4, 0, 0.2, 1] }
          : { type: "spring", stiffness: 380, damping: 32 }
      }
      draggable={!completing}
      onDragStart={() => setDragId(task.id)}
      onDragEnd={() => setDragId(null)}
      className="group relative cursor-grab overflow-hidden rounded-lg border border-border bg-card/80 active:cursor-grabbing"
      style={{ borderLeft: `2px solid ${zoneTint}` }}
    >
      <div className="flex w-full items-start gap-3 px-3 py-2.5">
        <CompleteCheckbox
          onCheck={handleComplete}
          tint={zoneTint}
          pulse={readyToClaim}
          completing={completing}
        />
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="min-w-0 flex-1 text-left"
        >
          <p className="line-clamp-2 text-sm font-medium leading-snug">{task.title}</p>
          {total > 0 && (
            <div className="mt-2 flex items-center gap-2">
              <div className="h-1 flex-1 overflow-hidden rounded-full bg-secondary">
                <motion.div
                  initial={false}
                  animate={{ width: `${pct}%` }}
                  transition={{ type: "spring", stiffness: 200, damping: 25 }}
                  className="h-full rounded-full"
                  style={{ background: allDone ? "var(--color-neon-3)" : zoneTint }}
                />
              </div>
              <span className="font-mono text-[10px] text-muted-foreground">{done}/{total}</span>
            </div>
          )}
        </button>
        <motion.button
          type="button"
          onClick={() => setOpen((o) => !o)}
          animate={{ rotate: open ? 180 : 0 }}
          className="mt-0.5 text-muted-foreground"
          aria-label={open ? "Collapse" : "Expand"}
        >
          <ChevronDown className="h-4 w-4" />
        </motion.button>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="expand"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden border-t border-border/60"
          >
            <div className="space-y-2 px-3 py-3">
              <MicroStepList
                subtasks={task.subtasks}
                tint={zoneTint}
                onToggle={(sid) => onToggleSubtask(task.id, sid)}
                onRemove={(sid) => onRemoveSubtask(task.id, sid)}
              />
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!subInput.trim()) return;
                  onAddSubtask(task.id, subInput);
                  setSubInput("");
                }}
                className="flex items-center gap-2 rounded-md border border-dashed border-border px-2 py-1.5"
              >
                <Plus className="h-3.5 w-3.5 text-muted-foreground" />
                <input
                  value={subInput}
                  onChange={(e) => setSubInput(e.target.value)}
                  placeholder="Add a micro-step…"
                  className="flex-1 bg-transparent text-xs outline-none placeholder:text-muted-foreground"
                />
              </form>

              <div className="flex items-center justify-between pt-1">
                <div className="flex gap-1">
                  {(["now", "next", "later", "inbox"] as TaskStatus[])
                    .filter((s) => s !== task.status)
                    .map((s) => (
                      <button
                        key={s}
                        onClick={() => onMove(task.id, s)}
                        className="rounded border border-border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
                      >
                        → {s}
                      </button>
                    ))}
                </div>
                <button
                  onClick={() => onDelete(task.id)}
                  className="rounded p-1 text-muted-foreground transition-colors hover:text-destructive"
                  aria-label="Delete quest"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function CompleteCheckbox({
  checked, onCheck, tint,
}: {
  checked: boolean;
  onCheck: (e: React.MouseEvent) => void;
  tint: string;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.85 }}
      whileHover={{ scale: 1.08 }}
      onClick={onCheck}
      aria-label="Complete quest"
      className="relative mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border-2 transition-colors"
      style={{
        borderColor: checked ? tint : "color-mix(in oklab, var(--color-border) 100%, transparent)",
        background: checked ? tint : "transparent",
      }}
    >
      <AnimatePresence>
        {checked && (
          <motion.div
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 22 }}
          >
            <Check className="h-3 w-3 text-[var(--color-neon-foreground)]" strokeWidth={4} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

/* --------------------------- MicroStepList --------------------------- */

function MicroStepList({
  subtasks, tint, onToggle, onRemove,
}: {
  subtasks: Task["subtasks"];
  tint: string;
  onToggle: (subId: string) => void;
  onRemove: (subId: string) => void;
}) {
  if (subtasks.length === 0) return null;
  return (
    <ul className="space-y-1">
      <AnimatePresence initial={false}>
        {subtasks.map((s) => (
          <motion.li
            key={s.id}
            layout
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="group flex items-center gap-2 rounded-md px-1 py-1 hover:bg-secondary/40"
          >
            <SubtaskCheckbox checked={s.isCompleted} onClick={() => onToggle(s.id)} tint={tint} />
            <motion.span
              animate={{
                opacity: s.isCompleted ? 0.45 : 1,
                textDecoration: s.isCompleted ? "line-through" : "none",
              }}
              className="flex-1 text-xs"
            >
              {s.text}
            </motion.span>
            <button
              onClick={() => onRemove(s.id)}
              aria-label="Remove step"
              className="rounded p-0.5 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
            >
              <X className="h-3 w-3" />
            </button>
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  );
}

function SubtaskCheckbox({ checked, onClick, tint }: { checked: boolean; onClick: () => void; tint: string }) {
  return (
    <motion.button
      whileTap={{ scale: 0.8 }}
      whileHover={{ scale: 1.1 }}
      onClick={onClick}
      aria-label={checked ? "Mark incomplete" : "Mark complete"}
      className="relative grid h-4 w-4 shrink-0 place-items-center rounded border-[1.5px] transition-colors"
      style={{
        borderColor: checked ? tint : "var(--color-border)",
        background: checked ? tint : "transparent",
      }}
    >
      <AnimatePresence>
        {checked && (
          <>
            <motion.span
              initial={{ scale: 0, opacity: 0.6 }}
              animate={{ scale: 2.4, opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 rounded-full"
              style={{ background: tint }}
            />
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: "spring", stiffness: 600, damping: 20 }}
            >
              <Check className="h-2.5 w-2.5 text-[var(--color-neon-foreground)]" strokeWidth={4} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

/* ----------------------------- DoneWall ----------------------------- */

function DoneWall({
  items, onMove, onDelete,
}: {
  items: Task[];
  onMove: (id: string, s: TaskStatus) => void;
  onDelete: (id: string) => void;
}) {
  const groups = groupByDay(items);
  return (
    <section className="quest-card p-4 md:p-6">
      <div className="mb-5 flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br from-[var(--color-neon-3)] to-[var(--color-neon)] text-[var(--color-neon-foreground)] shadow-[var(--shadow-neon)]">
          <Trophy className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-display text-lg font-semibold leading-tight">Trophy Room</h2>
          <p className="text-xs text-muted-foreground">
            {items.length === 0 ? "Nothing here yet — that's about to change." : `${items.length} cleared. Look at this.`}
          </p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="grid place-items-center rounded-lg border border-dashed border-border/60 py-16 text-center text-sm text-muted-foreground">
          <Trophy className="mb-3 h-8 w-8 opacity-30" />
          Knock out a quest. We'll mount it here.
        </div>
      ) : (
        <div className="space-y-6">
          {groups.map((g) => (
            <div key={g.label}>
              <h3 className="mb-2 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                {g.label} · {g.items.length}
              </h3>
              <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                <AnimatePresence initial={false}>
                  {g.items.map((t) => (
                    <motion.li
                      key={t.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="group relative flex items-center gap-3 rounded-lg border border-border bg-card/60 px-3 py-2.5"
                    >
                      <div
                        className="grid h-7 w-7 shrink-0 place-items-center rounded-md"
                        style={{
                          background: "color-mix(in oklab, var(--color-neon-3) 18%, transparent)",
                          color: "var(--color-neon-3)",
                        }}
                      >
                        <Check className="h-3.5 w-3.5" strokeWidth={3.5} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium" style={{ textDecoration: "line-through", opacity: 0.85 }}>
                          {t.title}
                        </p>
                        <p className="font-mono text-[10px] text-muted-foreground">
                          {t.completedAt ? new Date(t.completedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <button
                          onClick={() => onMove(t.id, "next")}
                          className="rounded border border-border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground"
                        >
                          undo
                        </button>
                        <button
                          onClick={() => onDelete(t.id)}
                          aria-label="Delete"
                          className="rounded p-1 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function groupByDay(items: Task[]) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
  const map = new Map<string, Task[]>();
  for (const t of items) {
    if (!t.completedAt) continue;
    const d = new Date(t.completedAt); d.setHours(0, 0, 0, 0);
    let label: string;
    if (d.getTime() === today.getTime()) label = "Today";
    else if (d.getTime() === yesterday.getTime()) label = "Yesterday";
    else label = d.toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" });
    if (!map.has(label)) map.set(label, []);
    map.get(label)!.push(t);
  }
  return Array.from(map.entries()).map(([label, items]) => ({ label, items }));
}

/* ----------------------------- DailyXPBar ----------------------------- */

function isToday(ts: number | null | undefined) {
  if (!ts) return false;
  const d = new Date(ts);
  const n = new Date();
  return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth() && d.getDate() === n.getDate();
}

function DailyXPBar({ tasks }: { tasks: Task[] }) {
  const completedToday = tasks.filter((t) => t.status === "completed" && isToday(t.completedAt));
  const nowCount = tasks.filter((t) => t.status === "now").length;
  const denominator = nowCount + completedToday.length;
  const percent = denominator === 0 ? 0 : Math.round((completedToday.length / denominator) * 100);

  const prev = useRef(percent);
  const [celebrate, setCelebrate] = useState(false);
  const [showCleared, setShowCleared] = useState(false);

  useEffect(() => {
    if (prev.current < 100 && percent === 100) {
      setCelebrate(true);
      setShowCleared(true);
      const a = setTimeout(() => setCelebrate(false), 750);
      const b = setTimeout(() => setShowCleared(false), 1600);
      prev.current = percent;
      return () => { clearTimeout(a); clearTimeout(b); };
    }
    prev.current = percent;
  }, [percent]);

  const empty = denominator === 0;
  const sparkles = Array.from({ length: 6 });

  return (
    <motion.section
      animate={celebrate ? { scale: [1, 1.02, 1] } : { scale: 1 }}
      transition={{ duration: 0.45 }}
      className="quest-card relative px-4 py-4 md:px-5"
    >
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5" style={{ color: "var(--color-neon)" }} />
          <h2 className="font-mono text-[11px] uppercase tracking-[0.22em]" style={{ color: "var(--color-neon)" }}>
            Daily XP
          </h2>
        </div>
        <span className="font-mono text-[11px] text-muted-foreground">
          {empty ? "—" : `${completedToday.length}/${denominator}`}
        </span>
      </div>

      <div className="relative h-9 w-full overflow-hidden rounded-full border border-border bg-secondary/40 shadow-inner">
        {/* Glow underlay */}
        {!empty && (
          <motion.div
            aria-hidden
            initial={false}
            animate={{ width: `${percent}%` }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
            className="absolute inset-y-0 left-0 rounded-full opacity-60 blur-md"
            style={{
              background: "linear-gradient(90deg, var(--color-neon) 0%, var(--color-neon-2) 100%)",
            }}
          />
        )}
        {/* Fill */}
        {!empty && (
          <motion.div
            initial={false}
            animate={{ width: `${percent}%` }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
            className="absolute inset-y-0 left-0 overflow-hidden rounded-full"
            style={{
              background: "linear-gradient(90deg, var(--color-neon) 0%, var(--color-neon-2) 100%)",
              boxShadow: "var(--shadow-neon)",
            }}
          >
            {/* Shimmer */}
            <motion.div
              aria-hidden
              className="absolute inset-y-0 w-1/3"
              style={{
                background:
                  "linear-gradient(90deg, transparent 0%, color-mix(in oklab, white 35%, transparent) 50%, transparent 100%)",
              }}
              animate={{ x: ["-100%", "350%"] }}
              transition={{ duration: 2.4, ease: "linear", repeat: Infinity }}
            />
          </motion.div>
        )}

        {/* Centered label */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span
            className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em]"
            style={{
              color: empty ? "var(--color-muted-foreground)" : "var(--color-neon-foreground)",
              textShadow: empty ? "none" : "0 0 8px color-mix(in oklab, var(--color-neon) 60%, transparent)",
            }}
          >
            {empty
              ? "Ready for today's campaign."
              : showCleared
                ? "Campaign cleared!"
                : `Daily Completion: ${percent}% XP`}
          </span>
        </div>

        {/* Sparkles on 100% */}
        <AnimatePresence>
          {celebrate &&
            sparkles.map((_, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, scale: 0.4, y: 0 }}
                animate={{ opacity: [0, 1, 0], scale: [0.4, 1.2, 0.6], y: [-2, -18, -28] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.7, delay: i * 0.04, ease: "easeOut" }}
                className="pointer-events-none absolute top-1/2 h-1.5 w-1.5 rounded-full"
                style={{
                  left: `${10 + i * 14}%`,
                  background: "var(--color-neon)",
                  boxShadow: "0 0 10px var(--color-neon), 0 0 20px var(--color-neon-2)",
                }}
              />
            ))}
        </AnimatePresence>
      </div>
    </motion.section>
  );
}

