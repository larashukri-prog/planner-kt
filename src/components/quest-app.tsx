import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion, LayoutGroup } from "framer-motion";

import {
  ArrowRight, Check, Inbox, Plus, Sparkles, Swords, Trash2, Trophy, User,
  ChevronDown, X, Flame, Layers, Hourglass, Sun, Moon, Calendar, Coffee,
} from "lucide-react";
import { useTheme } from "@/lib/use-theme";
import { useTasks } from "@/lib/use-tasks";
import { useDailySpawn } from "@/lib/use-daily-spawn";
import { track, trackOncePerSession } from "@/lib/use-analytics";
import { signOut } from "@/lib/use-auth";
import { LogOut } from "lucide-react";
import type { OwnerId, Task, TaskStatus } from "@/lib/quest-types";
import { renderWithLinks } from "@/lib/linkify";
import { cn } from "@/lib/utils";

type View = "board" | "done";

const ZONES: { id: Exclude<TaskStatus, "inbox" | "completed">; label: string; sub: string; icon: typeof Flame; tint: string; textTint: string }[] = [
  { id: "now",   label: "NOW",   sub: "Active quests",  icon: Flame,     tint: "var(--color-zone-now)",   textTint: "var(--color-zone-now-text)" },
  { id: "next",  label: "LATER",  sub: "On deck",        icon: Layers,    tint: "var(--color-zone-next)",  textTint: "var(--color-zone-next-text)" },
  { id: "later", label: "FUTURE", sub: "Backlog vault",  icon: Hourglass, tint: "var(--color-zone-later)", textTint: "var(--color-zone-later-text)" },
];

export default function QuestApp() {
  const t = useTasks();
  useDailySpawn({ tasks: t.tasks, addRecurringTask: t.addRecurringTask, updateTask: t.updateTask, deleteTask: t.deleteTask });
  useTheme();
  const [view, setView] = useState<View>("board");
  const [dragId, setDragId] = useState<string | null>(null);

  useEffect(() => {
    trackOncePerSession("app_opened");
  }, []);


  const filtered = t.tasks.filter((x) => x.ownerId === t.workspace);
  const inbox = filtered.filter((x) => x.status === "inbox");
  const completed = filtered.filter((x) => x.status === "completed").sort((a, b) => (b.completedAt ?? 0) - (a.completedAt ?? 0));
  const activeCount = filtered.filter((x) => x.status !== "completed").length;

  return (
    <div className="min-h-screen w-full text-foreground">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 md:px-8 md:py-10">
        <Header
          view={view}
          onView={setView}
          activeCount={activeCount}
          doneCount={completed.length}
        />

        <TemplateChips onCreate={t.addTask} />
        <QuickAddBar onAdd={t.addTask} />

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
                onUpdate={t.updateTask}
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
          <span className="font-mono">Planner v1</span> — built for optimal planning
          <span className="mx-2 opacity-40">·</span>
          <Link
            to="/design-system"
            className="underline underline-offset-4 transition-colors hover:text-neon"
          >
            Design System
          </Link>
        </footer>

      </div>
    </div>
  );
}

/* ----------------------------- Header ----------------------------- */

function Header({
  view, onView, activeCount, doneCount,
}: {
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
          <h1 className="font-display text-xl font-semibold leading-tight tracking-tight">Planner-KT&nbsp;</h1>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            {activeCount} active · {doneCount} cleared
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <ViewToggle view={view} onView={onView} />
        <ThemeToggle />
        <button
          onClick={() => { void signOut(); }}
          aria-label="Sign out"
          title="Sign out"
          className="grid h-9 w-9 place-items-center rounded-xl border border-border bg-card/60 backdrop-blur transition-colors hover:bg-card"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  return (
    <motion.button
      onClick={toggleTheme}
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.05 }}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="relative grid h-9 w-9 place-items-center rounded-xl border border-border bg-card/60 backdrop-blur transition-colors hover:bg-card"
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.span
            key="moon"
            initial={{ opacity: 0, rotate: -90, scale: 0.6 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 90, scale: 0.6 }}
            transition={{ duration: 0.2 }}
            className="grid place-items-center"
            style={{ color: "var(--color-neon)" }}
          >
            <Moon className="h-4 w-4" strokeWidth={2.2} />
          </motion.span>
        ) : (
          <motion.span
            key="sun"
            initial={{ opacity: 0, rotate: 90, scale: 0.6 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: -90, scale: 0.6 }}
            transition={{ duration: 0.2 }}
            className="grid place-items-center"
            style={{ color: "var(--color-zone-now)" }}
          >
            <Sun className="h-4 w-4" strokeWidth={2.2} />
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
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


/* --------------------------- QuickAddBar --------------------------- */

function QuickAddBar({ onAdd }: { onAdd: (title: string) => void }) {
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
    track("manual_task_created");
    setValue("");
    setPulse(true);
    setTimeout(() => setPulse(false), 400);
  };

  const hasValue = value.trim().length > 0;
  return (
    <motion.form
      onSubmit={submit}
      animate={pulse ? { scale: [1, 1.01, 1] } : {}}
      transition={{ duration: 0.35 }}
      className="relative flex items-center gap-2 rounded-full border border-border bg-card py-1.5 pl-2 pr-1.5 shadow-md transition-all duration-200 focus-within:shadow-lg focus-within:ring-2 focus-within:ring-primary/50"
    >
      <Plus className="h-5 w-5 shrink-0 text-black dark:text-white" strokeWidth={2.5} />
      <input
        ref={ref}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Brain dump a quest. Press Enter. No tags. No deadlines."
        className="min-w-0 flex-1 bg-transparent px-1 text-base font-medium outline-none placeholder:text-sm placeholder:font-normal placeholder:text-muted-foreground placeholder:opacity-60 md:text-lg"
      />
      <kbd className="hidden rounded-md border border-border bg-card/70 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground md:inline">
        ↵
      </kbd>
      <button
        type="submit"
        disabled={!hasValue}
        className="flex shrink-0 items-center rounded-full bg-[var(--color-neon)] px-4 py-2 text-xs font-semibold text-[var(--color-neon-foreground)] transition-all hover:brightness-110 disabled:opacity-40"
        style={{ boxShadow: hasValue ? "var(--shadow-neon)" : "none" }}
      >
        Add
      </button>
    </motion.form>
  );
}

/* -------------------------- Template Chips -------------------------- */

const QUEST_TEMPLATES = [
  
  { icon: "🧺", label: "Laundry Loop", title: "Laundry", subtasks: ["Gather clothes", "Start washer", "Move to dryer", "Put in basket", "Put away"], tint: "oklch(0.7 0.16 230)" },
  { icon: "🛒", label: "Restock Fuel", title: "Grocery Run", subtasks: ["Check fridge & pantry", "Make list", "Go to store", "Unload and put away"], tint: "oklch(0.72 0.18 140)" },
  { icon: "🧹", label: "15-Min Reset", title: "Room Reset", subtasks: ["Pick up floor", "Clear surfaces", "Make bed", "Empty trash", "Quick vacuum"], tint: "oklch(0.7 0.16 25)" },
  { icon: "⚔️", label: "Deep Dive", title: "Academic Deep Dive", subtasks: ["Gather materials", "Set timer (90 min)", "No phone zone", "Review notes", "Reward break"], tint: "oklch(0.82 0.2 180)" },
  { icon: "🗺️", label: "Explore", title: "Explore Burlington", subtasks: ["Pick a spot", "Check bus schedule", "Pack bag", "Go adventure"], tint: "oklch(0.7 0.18 290)" },
];

function TemplateChips({ onCreate }: { onCreate: (title: string, subtasks: string[]) => void }) {
  const [clickedId, setClickedId] = useState<string | null>(null);

  const handleClick = (tpl: (typeof QUEST_TEMPLATES)[number]) => {
    onCreate(tpl.title, tpl.subtasks);
    track("template_quest_used", { quest_name: tpl.label });
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
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [sortingIds, setSortingIds] = useState<Map<string, 'left' | 'right'>>(new Map());

  const handleDelete = (id: string) => {
    if (deletingIds.has(id)) return;
    setDeletingIds((prev) => new Set(prev).add(id));
    setTimeout(() => {
      onDelete(id);
    }, 200);
  };

  const handleSort = (id: string, status: TaskStatus, direction: 'left' | 'right') => {
    if (sortingIds.has(id) || deletingIds.has(id)) return;
    setSortingIds((prev) => new Map(prev).set(id, direction));
    setTimeout(() => {
      onMove(id, status);
      setSortingIds((prev) => {
        const next = new Map(prev);
        next.delete(id);
        return next;
      });
    }, 250);
  };

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
            {items.map((task) => {
              const isDeleting = deletingIds.has(task.id);
              const sorting = sortingIds.get(task.id);
              return (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95, y: -8 }}
                  animate={{ opacity: isDeleting ? 0 : sorting ? 0 : 1, scale: isDeleting ? 0.95 : sorting ? 0.95 : 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, x: -20 }}
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  draggable
                  onDragStart={() => setDragId(task.id)}
                  onDragEnd={() => setDragId(null)}
                  className={cn(
                    "group relative min-w-[240px] max-w-[280px] shrink-0 cursor-grab rounded-lg border border-border bg-card/70 p-3 active:cursor-grabbing transition-all duration-200 ease-out",
                    isDeleting && "pointer-events-none opacity-0 scale-95 max-h-0 py-0 my-0 overflow-hidden",
                    sorting === 'left' && "!-translate-x-[120%] opacity-0 scale-95 pointer-events-none transition-all duration-[250ms] ease-in-out",
                    sorting === 'right' && "!translate-x-[120%] opacity-0 scale-95 pointer-events-none transition-all duration-[250ms] ease-in-out"
                  )}
                  style={{ outline: dragId === task.id ? "1px solid var(--color-inbox)" : undefined }}
                >
                  <p className="line-clamp-2 text-sm font-medium leading-snug">{renderWithLinks(task.title)}</p>
                  <div className="mt-3 flex items-center gap-1">
                    <ZoneQuickButton label="Now"    tint="var(--color-zone-now)"   textTint="var(--color-zone-now-text)"   direction="left"  onClick={() => handleSort(task.id, "now", "left")} />
                    <ZoneQuickButton label="Later"  tint="var(--color-zone-next)"  textTint="var(--color-zone-next-text)"  direction="right" onClick={() => handleSort(task.id, "next", "right")} />
                    <ZoneQuickButton label="Future" tint="var(--color-zone-later)" textTint="var(--color-zone-later-text)" direction="right" onClick={() => handleSort(task.id, "later", "right")} />
                    <button
                      onClick={() => handleDelete(task.id)}
                      aria-label="Delete"
                      className="ml-auto grid h-7 w-7 place-items-center rounded text-muted-foreground opacity-100 transition-opacity hover:text-destructive md:opacity-0 md:group-hover:opacity-100"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </LayoutGroup>
      </div>
    </section>
  );
}

function ZoneQuickButton({ label, tint, textTint, direction, onClick }: { label: string; tint: string; textTint: string; direction: 'left' | 'right'; onClick: () => void }) {
  return (
    <motion.button
      whileTap={{ scale: 0.92 }}
      onClick={onClick}
      className="rounded-md border border-border px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
      style={{ borderColor: `color-mix(in oklab, ${tint} 35%, var(--color-border))` }}
    >
      <span style={{ color: textTint }}>{direction === 'left' ? '←' : '→'}</span> {label}
    </motion.button>
  );
}

/* ----------------------------- ZoneBoard ----------------------------- */

function ZoneBoard({
  tasks, onMove, onDelete, onAddSubtask, onToggleSubtask, onRemoveSubtask, onUpdate, dragId, setDragId,
}: {
  tasks: Task[];
  onMove: (id: string, s: TaskStatus) => void;
  onDelete: (id: string) => void;
  onAddSubtask: (taskId: string, text: string) => void;
  onToggleSubtask: (taskId: string, subId: string) => void;
  onRemoveSubtask: (taskId: string, subId: string) => void;
  onUpdate: (id: string, patch: Partial<Task>) => void;
  dragId: string | null;
  setDragId: (s: string | null) => void;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);

  const handleScroll = () => {
    const el = scrollerRef.current;
    if (!el) return;
    const center = el.scrollLeft + el.clientWidth / 2;
    const children = Array.from(el.children) as HTMLElement[];
    let bestIdx = 0;
    let bestDist = Infinity;
    children.forEach((c, i) => {
      const mid = c.offsetLeft + c.offsetWidth / 2;
      const d = Math.abs(mid - center);
      if (d < bestDist) { bestDist = d; bestIdx = i; }
    });
    setActiveIdx(bestIdx);
  };

  const scrollToIndex = (i: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    const child = el.children[i] as HTMLElement | undefined;
    if (!child) return;
    el.scrollTo({ left: child.offsetLeft - (el.clientWidth - child.offsetWidth) / 2, behavior: "smooth" });
  };

  return (
    <div>
      <div
        ref={scrollerRef}
        onScroll={handleScroll}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth -mx-4 px-4 pb-2 scrollbar-quest md:grid md:grid-cols-3 md:gap-4 md:overflow-visible md:px-0 md:mx-0"
      >
        <LayoutGroup>
          {ZONES.map((z) => {
            const priority = (k?: string) => (k === "morning-armor" ? 0 : k === "workout" ? 1 : 2);
            const items = tasks
              .filter((t) => t.status === z.id)
              .sort((a, b) => priority(a.recurringKey) - priority(b.recurringKey));
            return (
              <div
                key={z.id}
                className="snap-center shrink-0 w-[85vw] first:ml-1 last:mr-1 md:ml-0 md:mr-0 md:w-full md:min-w-0 md:snap-align-none"
              >
                <ZoneColumn
                  zone={z}
                  items={items}
                  onMove={onMove}
                  onDelete={onDelete}
                  onAddSubtask={onAddSubtask}
                  onToggleSubtask={onToggleSubtask}
                  onRemoveSubtask={onRemoveSubtask}
                  onUpdate={onUpdate}
                  dragId={dragId}
                  setDragId={setDragId}
                />
              </div>
            );
          })}
        </LayoutGroup>
      </div>

      <div className="mt-3 flex justify-center gap-2 md:hidden">
        {ZONES.map((z, i) => (
          <button
            key={z.id}
            type="button"
            aria-label={`Show ${z.label}`}
            onClick={() => scrollToIndex(i)}
            className="h-1.5 rounded-full transition-all duration-300"
            style={{
              width: i === activeIdx ? 22 : 6,
              background: i === activeIdx
                ? z.tint
                : "color-mix(in oklab, var(--color-foreground) 25%, transparent)",
              opacity: i === activeIdx ? 1 : 0.55,
            }}
          />
        ))}
      </div>
    </div>
  );
}


function ZoneColumn({
  zone, items, onMove, onDelete, onAddSubtask, onToggleSubtask, onRemoveSubtask, onUpdate, dragId, setDragId,
}: {
  zone: (typeof ZONES)[number];
  items: Task[];
  onMove: (id: string, s: TaskStatus) => void;
  onDelete: (id: string) => void;
  onAddSubtask: (taskId: string, text: string) => void;
  onToggleSubtask: (taskId: string, subId: string) => void;
  onRemoveSubtask: (taskId: string, subId: string) => void;
  onUpdate: (id: string, patch: Partial<Task>) => void;
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
        {items.length === 0 && (
          <div className="grid flex-1 place-items-center rounded-lg border border-dashed border-border/60 py-10 text-center text-[11px] text-muted-foreground">
            Drop a quest here
          </div>
        )}
        <AnimatePresence>

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
              onUpdate={onUpdate}
              setDragId={setDragId}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ----------------------------- TaskCard ----------------------------- */

function toLocalMidnight(ms: number): number {
  const d = new Date(ms);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}
function dateInputValue(ms: number): string {
  const d = new Date(ms);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function parseDateInput(v: string): number | null {
  if (!v) return null;
  const [y, m, d] = v.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d).getTime();
}
function formatDueLabel(due: number): { text: string; overdue: boolean } {
  const today = new Date();
  const todayMid = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const days = Math.ceil((due - todayMid) / 86400000);
  if (days < 0) return { text: "Overdue", overdue: true };
  if (days === 0) return { text: "Today", overdue: false };
  if (days === 1) return { text: "Tomorrow", overdue: false };
  if (days <= 7) return { text: `in ${days}d`, overdue: false };
  const d = new Date(due);
  return { text: `${d.getMonth() + 1}/${d.getDate()}`, overdue: false };
}

function TaskCard({
  task, zoneTint, onMove, onDelete, onAddSubtask, onToggleSubtask, onRemoveSubtask, onUpdate, setDragId,
}: {
  task: Task;
  zoneTint: string;
  onMove: (id: string, s: TaskStatus) => void;
  onDelete: (id: string) => void;
  onAddSubtask: (taskId: string, text: string) => void;
  onToggleSubtask: (taskId: string, subId: string) => void;
  onRemoveSubtask: (taskId: string, subId: string) => void;
  onUpdate: (id: string, patch: Partial<Task>) => void;
  setDragId: (s: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [subInput, setSubInput] = useState("");
  const [completing, setCompleting] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pendingDate, setPendingDate] = useState<string>("");
  const total = task.subtasks.length;
  const done = task.subtasks.filter((s) => s.isCompleted).length;
  const pct = total === 0 ? 0 : (done / total) * 100;
  const allDone = total > 0 && done === total;
  const readyToClaim = total === 0 || allDone;

  // Escalation glow: active for 24h after auto-escalation.
  const escalatedFresh =
    !!task.escalatedAt && Date.now() - task.escalatedAt < 86400000;
  const escalationClass = escalatedFresh
    ? task.status === "now"
      ? "escalated-act"
      : "escalated-warn"
    : "";

  const clearEscalation = () => {
    if (task.escalatedAt) onUpdate(task.id, { escalatedAt: null });
  };

  const isWorkout = task.recurringKey === "workout";
  const isRestDay = task.title.includes("[Rest Day]");

  const handleComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (completing) return;
    track("task_completed", {
      has_subtasks: task.subtasks.length > 0,
      time_in_zone_ms: Date.now() - task.createdAt,
    });
    if (isWorkout && !isRestDay) {
      track("workout_completed");
    }
    setCompleting(true);
    window.setTimeout(() => onMove(task.id, "completed"), 320);
  };

  const handleRestDay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (completing) return;
    track("rest_day_logged");
    setCompleting(true);
    const restTitle = task.title.includes("[Rest Day]")
      ? task.title
      : `${task.title} — [Rest Day]`;
    window.setTimeout(() => {
      onUpdate(task.id, { title: restTitle });
      onMove(task.id, "completed");
    }, 320);
  };

  const dueLabel = task.dueDate ? formatDueLabel(task.dueDate) : null;

  return (
    <motion.div
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
      className={`group relative cursor-grab overflow-hidden rounded-lg border border-border bg-card/80 active:cursor-grabbing ${escalationClass}`}
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
          onClick={() => { setOpen((o) => !o); clearEscalation(); }}
          className="min-w-0 flex-1 text-left"
        >
          <p className="line-clamp-2 text-sm font-medium leading-snug">{renderWithLinks(task.title)}</p>
          {dueLabel && (
            <span
              className={`mt-1.5 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${
                dueLabel.overdue
                  ? "border-destructive/50 bg-destructive/10 text-destructive"
                  : "border-border bg-muted text-muted-foreground"
              }`}
            >
              <Calendar className="h-3 w-3" />
              {dueLabel.text}
            </span>
          )}
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
        {isWorkout && task.status === "now" && !completing && (() => { const d = new Date().getDay(); return d === 2 || d === 4 || d === 6; })() && (
          <button
            type="button"
            onClick={handleRestDay}
            className="mt-0.5 inline-flex items-center gap-1 rounded-full border border-amber-500/40 bg-amber-500/5 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-amber-600 transition-colors hover:bg-amber-500/10 dark:text-amber-300"
            aria-label="Log as rest day"
            title="Rest Day"
          >
            <Coffee className="h-3 w-3" />
            Rest
          </button>
        )}
        <motion.button
          type="button"
          onClick={() => { setOpen((o) => !o); clearEscalation(); }}
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

              {/* Due date control — not shown for recurring tasks */}
              {!task.recurringKey && (
              <div className="flex items-center gap-2">
                {task.dueDate && !showDatePicker ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setPendingDate(task.dueDate ? dateInputValue(task.dueDate) : dateInputValue(Date.now()));
                        setShowDatePicker(true);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-md border border-border px-2 py-1 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <Calendar className="h-3.5 w-3.5" />
                      Due {new Date(task.dueDate).toLocaleDateString()}
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdate(task.id, { dueDate: null, escalatedAt: null })}
                      className="rounded p-1 text-muted-foreground transition-colors hover:text-destructive"
                      aria-label="Clear due date"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </>
                ) : showDatePicker ? (
                  <input
                    type="date"
                    autoFocus
                    value={pendingDate}
                    min={dateInputValue(Date.now())}
                    onChange={(e) => setPendingDate(e.target.value)}
                    onBlur={() => {
                      const ms = parseDateInput(pendingDate);
                      onUpdate(task.id, {
                        dueDate: ms ? toLocalMidnight(ms) : null,
                        escalatedAt: null,
                      });
                      setShowDatePicker(false);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        (e.target as HTMLInputElement).blur();
                      } else if (e.key === "Escape") {
                        e.preventDefault();
                        setShowDatePicker(false);
                      }
                    }}
                    className="rounded-md border border-border bg-background px-2 py-1 text-[11px] text-foreground outline-none"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setPendingDate(dateInputValue(Date.now()));
                      setShowDatePicker(true);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-border px-2 py-1 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <Calendar className="h-3.5 w-3.5" />
                    Add date
                  </button>
                )}
              </div>
              )}

              <div className="flex items-center justify-between pt-1">
                <div className="flex gap-1">
                  {(["now", "next", "later", "inbox"] as TaskStatus[])
                    .filter((s) => s !== task.status)
                    .map((s) => (
                      <button
                        key={s}
                        onClick={() => { onMove(task.id, s); clearEscalation(); }}
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
  onCheck, tint, pulse, completing,
}: {
  onCheck: (e: React.MouseEvent) => void;
  tint: string;
  pulse: boolean;
  completing: boolean;
}) {
  const glow = "var(--color-neon-3)";
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.82 }}
      whileHover={{ scale: 1.1 }}
      onClick={onCheck}
      aria-label={pulse ? "Claim reward" : "Complete quest"}
      animate={
        completing
          ? {
              scale: [1, 1.35, 1],
              backgroundColor: glow,
              boxShadow: `0 0 22px 4px color-mix(in oklab, ${glow} 70%, transparent)`,
            }
          : pulse
            ? {
                scale: [1, 1.06, 1],
                boxShadow: [
                  `0 0 0 0 color-mix(in oklab, ${glow} 0%, transparent)`,
                  `0 0 14px 2px color-mix(in oklab, ${glow} 55%, transparent)`,
                  `0 0 0 0 color-mix(in oklab, ${glow} 0%, transparent)`,
                ],
              }
            : { scale: 1, boxShadow: "0 0 0 0 rgba(0,0,0,0)" }
      }
      transition={
        completing
          ? { duration: 0.32 }
          : pulse
            ? { duration: 1.6, repeat: Infinity, ease: "easeInOut" }
            : { duration: 0.2 }
      }
      className="relative mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 transition-colors"
      style={{
        borderColor: pulse || completing ? glow : `color-mix(in oklab, ${tint} 65%, var(--color-border))`,
        background: completing ? glow : pulse ? `color-mix(in oklab, ${glow} 18%, transparent)` : "transparent",
      }}
    >
      <AnimatePresence>
        {completing && (
          <motion.div
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 22 }}
          >
            <Check className="h-4 w-4 text-[var(--color-neon-foreground)]" strokeWidth={4} />
          </motion.div>
        )}
      </AnimatePresence>
      {!completing && pulse && (
        <Check
          className="h-3.5 w-3.5"
          strokeWidth={3.5}
          style={{ color: glow }}
        />
      )}
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
              {renderWithLinks(s.text)}
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
          <h2 className="font-display text-lg font-semibold leading-tight">Done Today</h2>
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
      className="relative bg-transparent px-4 py-4 md:px-5"
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

