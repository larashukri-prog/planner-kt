import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, Check, Database, Layers, RefreshCw, Server, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

/* ============================ Motion demos ============================ */

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const on = () => setReduced(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return reduced;
}

/** The product's signature motion: gradient progress + celebration at 100%. */
export function XPBarDemo() {
  const [percent, setPercent] = useState(25);
  const [celebrate, setCelebrate] = useState(false);
  const reduced = usePrefersReducedMotion();

  const bump = () => {
    setPercent((p) => {
      const next = Math.min(100, p + 25);
      if (p < 100 && next === 100) {
        setCelebrate(true);
        window.setTimeout(() => setCelebrate(false), 900);
      }
      return next;
    });
  };

  const fillStyle = {
    background: "linear-gradient(90deg, var(--color-neon) 0%, var(--color-neon-2) 100%)",
  };

  return (
    <div className="flex w-full min-w-0 flex-col gap-4">
      <motion.section
        animate={celebrate && !reduced ? { scale: [1, 1.02, 1] } : { scale: 1 }}
        transition={{ duration: 0.45 }}
        className="w-full"
      >
        <div className="mb-2 flex items-center justify-between">
          <span className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-neon-text">
            <Sparkles className="size-3.5" aria-hidden="true" />
            Daily XP
          </span>
          <span className="font-mono text-[11px] text-muted-foreground">{percent / 25}/4</span>
        </div>

        <div
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Daily quest completion"
          className="relative h-9 w-full overflow-hidden rounded-full border border-border bg-secondary/40 shadow-inner"
        >
          <motion.div
            aria-hidden="true"
            initial={false}
            animate={{ width: `${percent}%` }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
            className="absolute inset-y-0 left-0 rounded-full opacity-60 blur-md"
            style={fillStyle}
          />
          <motion.div
            aria-hidden="true"
            initial={false}
            animate={{ width: `${percent}%` }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
            className="absolute inset-y-0 left-0 overflow-hidden rounded-full"
            style={{ ...fillStyle, boxShadow: "var(--shadow-neon)" }}
          >
            {!reduced ? (
              <motion.div
                aria-hidden="true"
                className="absolute inset-y-0 w-1/3"
                style={{
                  background:
                    "linear-gradient(90deg, transparent 0%, color-mix(in oklab, white 35%, transparent) 50%, transparent 100%)",
                }}
                animate={{ x: ["-100%", "350%"] }}
                transition={{ duration: 2.4, ease: "linear", repeat: Infinity }}
              />
            ) : null}
          </motion.div>

          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span
              className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em]"
              style={{
                color: percent < 55 ? "var(--color-foreground)" : "var(--color-neon-foreground)",
                textShadow:
                  percent < 55 ? "none" : "0 0 8px color-mix(in oklab, var(--color-neon) 60%, transparent)",
              }}
            >
              {celebrate ? "Campaign cleared!" : `Daily Completion: ${percent}% XP`}
            </span>
          </div>

          <AnimatePresence>
            {celebrate && !reduced
              ? Array.from({ length: 6 }).map((_, i) => (
                  <motion.span
                    key={i}
                    aria-hidden="true"
                    initial={{ opacity: 0, scale: 0.4, y: 0 }}
                    animate={{ opacity: [0, 1, 0], scale: [0.4, 1.2, 0.6], y: [-2, -18, -28] }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.7, delay: i * 0.04, ease: "easeOut" }}
                    className="pointer-events-none absolute top-1/2 size-1.5 rounded-full bg-neon"
                    style={{ left: `${12 + i * 14}%` }}
                  />
                ))
              : null}
          </AnimatePresence>
        </div>
      </motion.section>

      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" onClick={bump} disabled={percent === 100}>
          +25% XP
        </Button>
        <Button size="sm" variant="outline" onClick={() => setPercent(0)}>
          Reset
        </Button>
      </div>

      <div className="rounded-md border border-border bg-muted/40 px-3 py-2.5">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          Gradient tokens
        </p>
        <dl className="mt-2 flex flex-col gap-1 font-mono text-[11px]">
          <div className="flex items-center gap-2">
            <span className="size-3 shrink-0 rounded-sm bg-neon" aria-hidden="true" />
            <dt className="text-foreground">--neon</dt>
            <dd className="truncate text-muted-foreground">teal · fill start</dd>
          </div>
          <div className="flex items-center gap-2">
            <span className="size-3 shrink-0 rounded-sm bg-neon-2" aria-hidden="true" />
            <dt className="text-foreground">--neon-2</dt>
            <dd className="truncate text-muted-foreground">magenta-pink · fill end</dd>
          </div>
        </dl>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          The same pair drives <code className="font-mono">--gradient-neon</code>, the app logo tile
          and <code className="font-mono">--shadow-neon</code> — one token edit re-skins every
          accent surface, in both themes.
        </p>
      </div>
    </div>
  );
}


/** Tactile press + success flash, expressed only with Tailwind transition utilities. */
export function TactileButtonsDemo() {
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!done) return;
    const t = window.setTimeout(() => setDone(false), 1200);
    return () => window.clearTimeout(t);
  }, [done]);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        className="inline-flex h-11 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none motion-reduce:hover:translate-y-0"
      >
        Hover / press me
      </button>

      <button
        type="button"
        onClick={() => setDone(true)}
        aria-pressed={done}
        className={cn(
          "inline-flex h-11 items-center gap-2 rounded-md border px-4 text-sm font-medium transition-all duration-[320ms] ease-out active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none",
          done
            ? "scale-95 border-neon bg-neon/15 text-neon-text"
            : "border-border bg-card text-foreground hover:border-neon/60 hover:bg-accent",
        )}
      >
        <span
          className={cn(
            "grid size-5 place-items-center rounded-full border transition-colors duration-200",
            done ? "border-neon bg-neon text-background" : "border-muted-foreground/60",
          )}
          aria-hidden="true"
        >
          {done ? <Check className="size-3.5" /> : null}
        </span>
        {done ? "Quest complete" : "Complete quest"}
      </button>
    </div>
  );
}

/** Skeleton → content swap that mirrors the real card geometry. */
export function SkeletonDemo() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!loading) return;
    const t = window.setTimeout(() => setLoading(false), 1200);
    return () => window.clearTimeout(t);
  }, [loading]);

  return (
    <div className="flex w-full min-w-0 flex-col gap-3">
      <div aria-busy={loading} aria-live="polite" className="min-w-0">
        {loading ? (
          <div className="quest-card flex gap-3 p-4" aria-hidden="true">
            <div className="size-8 shrink-0 animate-pulse rounded-full bg-muted" />
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <div className="h-4 w-3/5 animate-pulse rounded bg-muted" />
              <div className="h-3 w-4/5 animate-pulse rounded bg-muted" />
              <div className="h-5 w-16 animate-pulse rounded-full bg-muted" />
            </div>
          </div>
        ) : (
          <div className="quest-card flex animate-fade-in gap-3 p-4">
            <div className="grid size-8 shrink-0 place-items-center rounded-full border border-neon/50 bg-neon/10">
              <Sparkles className="size-4 text-neon-text" aria-hidden="true" />
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <p className="truncate text-sm font-semibold">Morning Armor</p>
              <p className="truncate text-xs text-muted-foreground">
                Wash face · Skincare · Meds · Water
              </p>
              <Badge variant="secondary" className="w-fit">
                Now
              </Badge>
            </div>
          </div>
        )}
      </div>

      <Button size="sm" variant="outline" onClick={() => setLoading(true)} disabled={loading}>
        <RefreshCw className={cn("size-3.5", loading && "animate-spin")} aria-hidden="true" />
        Replay loading state
      </Button>
    </div>
  );
}

/** Local toast using framer-motion — same motion values the app's sonner toasts use. */
export function ToastDemo() {
  const [open, setOpen] = useState(false);
  const timer = useRef<number | null>(null);

  const fire = () => {
    setOpen(true);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setOpen(false), 2600);
  };

  useEffect(() => () => (timer.current ? window.clearTimeout(timer.current) : undefined), []);

  return (
    <div className="flex w-full min-w-0 flex-col gap-3">
      <Button size="sm" onClick={fire}>
        <Bell className="size-3.5" aria-hidden="true" />
        Trigger toast
      </Button>

      <div className="relative h-20 overflow-hidden rounded-lg border border-dashed border-border bg-muted/30 p-3">
        <AnimatePresence>
          {open ? (
            <motion.div
              key="toast"
              role="status"
              aria-live="polite"
              initial={{ opacity: 0, x: 32, scale: 0.96 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 32, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 420, damping: 32 }}
              className="absolute inset-x-3 top-3 flex items-center gap-3 rounded-md border border-border bg-card px-3 py-2.5 shadow-lg"
            >
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-neon/15">
                <Check className="size-3.5 text-neon-text" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">Quest completed</p>
                <p className="truncate text-xs text-muted-foreground">+25 XP added to today</p>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ========================= Middle layer demos ========================= */

const LAYERS = [
  {
    icon: Layers,
    name: "UI surface",
    modules: "quest-app.tsx · design-system/*",
    body: "Presentational only. Renders props and state, emits intent through callbacks. Imports no data client.",
  },
  {
    icon: Server,
    name: "Middle layer — custom hooks",
    modules: "use-tasks.ts · use-theme.ts · use-auth.ts · use-daily-spawn.ts",
    body: "Owns fetching, optimistic writes with rollback, realtime subscriptions, derived state, and persistence. The only place side effects live.",
  },
  {
    icon: Database,
    name: "Services",
    modules: "@/integrations/supabase/client · localStorage · PostHog",
    body: "Thin transport adapters. Generated, not hand-rolled — swapping one never reaches a component.",
  },
  {
    icon: Database,
    name: "Data",
    modules: "Postgres + Row Level Security",
    body: "Authorization is enforced at the row level, so the client can only ever read what the session owns.",
  },
];

export function ArchitectureDiagram() {
  return (
    <ol className="flex flex-col gap-0">
      {LAYERS.map((layer, i) => (
        <li key={layer.name} className="flex flex-col">
          <div className="quest-card flex gap-3 p-4">
            <span className="grid size-8 shrink-0 place-items-center rounded-md border border-border bg-muted/50">
              <layer.icon className="size-4 text-neon-text" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold">{layer.name}</p>
              <p className="mt-0.5 break-words font-mono text-[11px] text-muted-foreground">
                {layer.modules}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{layer.body}</p>
            </div>
          </div>
          {i < LAYERS.length - 1 ? (
            <span
              aria-hidden="true"
              className="mx-auto my-1 block h-4 w-px bg-border after:block after:h-1.5 after:w-1.5 after:-translate-x-[3px] after:translate-y-3 after:rotate-45 after:border-b after:border-r after:border-border"
            />
          ) : null}
        </li>
      ))}
    </ol>
  );
}

/* ---- the hook the live demo below is actually running on ---- */

function useLocalStorageState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") return initial;
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* storage unavailable (private mode) — state still works in memory */
    }
  }, [key, value]);

  return [value, setValue] as const;
}

export function StatefulComponentDemo() {
  const [prefs, setPrefs] = useLocalStorageState("questlog.ds.demo.v1", {
    compact: false,
    xp: 0,
  });

  return (
    <div className="flex w-full min-w-0 flex-col gap-4">
      <div className="quest-card flex items-center justify-between gap-4 p-4">
        <div className="min-w-0">
          <Label htmlFor="ds-ml-compact" className="text-sm font-medium">
            Compact density
          </Label>
          <p className="mt-1 text-xs text-muted-foreground">
            Persisted across reloads by the hook, not the component.
          </p>
        </div>
        <Switch
          id="ds-ml-compact"
          checked={prefs.compact}
          aria-label="Toggle compact density"
          onCheckedChange={(compact) => setPrefs((p) => ({ ...p, compact }))}
        />
      </div>

      <div className="quest-card flex items-center justify-between gap-4 p-4">
        <div className="min-w-0">
          <p className="text-sm font-medium">XP counter</p>
          <p className="mt-1 text-xs text-muted-foreground">Same hook, different slice of state.</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            aria-label="Decrease XP"
            onClick={() => setPrefs((p) => ({ ...p, xp: Math.max(0, p.xp - 25) }))}
          >
            −
          </Button>
          <span className="w-14 text-center font-mono text-sm tabular-nums">{prefs.xp} XP</span>
          <Button
            size="sm"
            aria-label="Increase XP"
            onClick={() => setPrefs((p) => ({ ...p, xp: p.xp + 25 }))}
          >
            +
          </Button>
        </div>
      </div>

      <div className="rounded-md border border-border bg-muted/40 px-3 py-2">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          localStorage · questlog.ds.demo.v1
        </p>
        <p className="mt-1 break-all font-mono text-xs text-foreground/85">
          {JSON.stringify(prefs)}
        </p>
      </div>
    </div>
  );
}

/* ===================== Recurring life prompt pattern ===================== */

const LIFE_PROMPTS = [
  {
    id: "laundry",
    title: "Laundry loop",
    cue: "bg-life-laundry",
    frequency: "Every Friday",
    sensitivity: "Flexible",
    steps: ["Gather clothes", "Start washer", "Move to dryer", "Put away"],
  },
  {
    id: "food",
    title: "Restock fuel",
    cue: "bg-life-food",
    frequency: "Tue + Sat",
    sensitivity: "Today",
    steps: ["Check fridge & pantry", "Walk to the store", "Grab essentials"],
  },
  {
    id: "body",
    title: "Workout",
    cue: "bg-life-body",
    frequency: "Daily",
    sensitivity: "Rest day available",
    steps: ["Warm up", "Free weights", "Water & rack the weights"],
  },
];

/** Recurring college-life upkeep: what, how often, how time-sensitive. */
export function RecurringLifePromptDemo() {
  const [done, setDone] = useState<Record<string, boolean>>({});

  return (
    <div className="flex w-full min-w-0 flex-col gap-3">
      {LIFE_PROMPTS.map((prompt) => (
        <section
          key={prompt.id}
          aria-labelledby={`life-${prompt.id}-title`}
          className="quest-card flex min-w-0 gap-3 overflow-hidden bg-life-surface p-4"
        >
          <span
            aria-hidden="true"
            className={cn("w-1 shrink-0 rounded-full", prompt.cue)}
          />
          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <h4 id={`life-${prompt.id}-title`} className="text-sm font-semibold">
                {prompt.title}
              </h4>
              <Badge variant="outline" className="border-life text-life-text">
                <RefreshCw className="mr-1 size-3" aria-hidden="true" />
                <span className="sr-only">Frequency: </span>
                {prompt.frequency}
              </Badge>
              <Badge variant="secondary">
                <span className="sr-only">Time sensitivity: </span>
                {prompt.sensitivity}
              </Badge>
            </div>

            <ul className="flex flex-col">
              {prompt.steps.map((step) => {
                const id = `${prompt.id}-${step}`;
                const checked = Boolean(done[id]);
                return (
                  <li key={id} className="flex min-h-11 items-center gap-3 py-3">
                    <Checkbox
                      id={id}
                      checked={checked}
                      onCheckedChange={(v) =>
                        setDone((d) => ({ ...d, [id]: v === true }))
                      }
                    />
                    <Label
                      htmlFor={id}
                      className={cn(
                        "cursor-pointer text-sm font-normal transition-colors duration-150",
                        checked && "text-muted-foreground line-through",
                      )}
                    >
                      {step}
                    </Label>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      ))}
    </div>
  );
}
