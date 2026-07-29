import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Check, Moon, Sun, Swords } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CodeBlock, Example, Section, SubHeading, Swatch } from "@/components/design-system/parts";
import { useTheme } from "@/lib/use-theme";
import { cn } from "@/lib/utils";

const TITLE = "Design System — Planner-KT";
const DESCRIPTION =
  "Living documentation for Planner-KT: design tokens, a 4px base grid, WCAG 2.1 AA atomic components, data-dense enterprise UI patterns, and the AI-native contribution model.";

export const Route = createFileRoute("/design-system")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
    ],
  }),
  component: DesignSystemPage,
});

const NAV = [
  { id: "foundations", label: "Foundations & Tokens" },
  { id: "atoms", label: "Atomic Components" },
  { id: "patterns", label: "Enterprise UI Patterns" },
  { id: "ai", label: "AI Contribution Model" },
];

const CORE_COLORS = [
  { name: "Background", token: "--background", className: "bg-background", border: true },
  { name: "Foreground", token: "--foreground", className: "bg-foreground" },
  { name: "Card", token: "--card", className: "bg-card", border: true },
  { name: "Primary", token: "--primary", className: "bg-primary" },
  { name: "Secondary", token: "--secondary", className: "bg-secondary" },
  { name: "Muted", token: "--muted", className: "bg-muted", border: true },
  { name: "Accent", token: "--accent", className: "bg-accent" },
  { name: "Destructive", token: "--destructive", className: "bg-destructive" },
  { name: "Border", token: "--border", className: "bg-border" },
];

const BRAND_COLORS = [
  { name: "Neon", token: "--neon", className: "bg-neon" },
  { name: "Neon 2", token: "--neon-2", className: "bg-neon-2" },
  { name: "Neon 3", token: "--neon-3", className: "bg-neon-3" },
  { name: "Zone · Now", token: "--zone-now", className: "bg-zone-now" },
  { name: "Zone · Later", token: "--zone-next", className: "bg-zone-next" },
  { name: "Zone · Future", token: "--zone-later", className: "bg-zone-later" },
  { name: "Inbox", token: "--inbox", className: "bg-inbox" },
];

const TYPE_SCALE = [
  { label: "Display", cls: "text-4xl font-bold tracking-tight", sample: "Planner-KT" },
  { label: "Heading 1", cls: "text-2xl font-bold tracking-tight", sample: "Quest Board" },
  { label: "Heading 2", cls: "text-lg font-semibold", sample: "Now / Later / Future" },
  { label: "Body", cls: "text-sm", sample: "Capture a quest, sort it, and ship it." },
  { label: "Small", cls: "text-xs text-muted-foreground", sample: "Subtask · due in 2 days" },
  {
    label: "Mono / label",
    cls: "font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground",
    sample: "Active quests",
  },
];

const SPACING = [1, 2, 3, 4, 6, 8, 12];

/** 4px base grid steps — token, rem and px, used across every spacing decision. */
const GRID_STEPS = [1, 2, 3, 4, 5, 6, 8, 10, 12, 16];

const RADII = [
  { name: "sm", cls: "rounded-sm" },
  { name: "md", cls: "rounded-md" },
  { name: "lg", cls: "rounded-lg" },
  { name: "xl", cls: "rounded-xl" },
  { name: "2xl", cls: "rounded-2xl" },
  { name: "full", cls: "rounded-full" },
];

const GRID_ROWS = [
  { title: "Morning Armor", zone: "Now", due: "Today", xp: 40 },
  { title: "Workout", zone: "Now", due: "Today", xp: 60 },
  { title: "Restock Fuel", zone: "Later", due: "Fri", xp: 20 },
];

function useScrollSpy(ids: string[]) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-96px 0px -60% 0px", threshold: 0 },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [ids.join("|")]);
  return active;
}

function DesignSystemPage() {
  const { theme, toggleTheme } = useTheme();
  const active = useScrollSpy(NAV.map((n) => n.id));

  return (
    <div className="min-h-screen w-full text-foreground">
      <a
        href="#ds-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-sm focus:text-primary-foreground"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 md:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
              <Swords className="size-4" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold tracking-tight">Planner-KT</p>
              <p className="truncate font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Design System
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/">
                <ArrowLeft className="size-4" />
                <span className="hidden sm:inline">Back to app</span>
              </Link>
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
              {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </Button>
          </div>
        </div>

        {/* Mobile nav chips */}
        <nav
          aria-label="Design system sections"
          className="flex gap-2 overflow-x-auto border-t border-border px-4 py-2 scrollbar-quest md:hidden"
        >
          {NAV.map((n) => (
            <a
              key={n.id}
              href={`#${n.id}`}
              className={cn(
                "shrink-0 rounded-full border border-border px-3 py-1 text-xs transition-colors",
                active === n.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              {n.label}
            </a>
          ))}
        </nav>
      </header>

      <div className="mx-auto flex max-w-6xl gap-10 px-4 py-10 md:px-8">
        {/* Desktop sidebar */}
        <nav
          aria-label="Design system sections"
          className="sticky top-28 hidden h-fit w-56 shrink-0 md:block"
        >
          <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            On this page
          </p>
          <ul className="flex flex-col gap-1 border-l border-border">
            {NAV.map((n) => (
              <li key={n.id}>
                <a
                  href={`#${n.id}`}
                  aria-current={active === n.id ? "true" : undefined}
                  className={cn(
                    "-ml-px block border-l-2 py-1.5 pl-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                    active === n.id
                      ? "border-primary font-medium text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground",
                  )}
                >
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <main id="ds-content" className="flex min-w-0 flex-1 flex-col gap-16">
          <div>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              Planner-KT Design System
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              A living, tokenized UI architecture. Every color, radius, and component variant is
              defined once in <code className="font-mono text-foreground">src/styles.css</code> and
              consumed through semantic Tailwind utilities — so the app stays visually consistent in
              both themes, no matter who (or what) writes the next component.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge variant="secondary">Tailwind v4</Badge>
              <Badge variant="secondary">shadcn/ui</Badge>
              <Badge variant="secondary">OKLCH tokens</Badge>
              <Badge variant="secondary">Light + Dark</Badge>
            </div>
          </div>

          {/* 1. Foundations */}
          <Section
            id="foundations"
            eyebrow="01 — Foundations"
            title="Foundations & Tokens"
            description="Semantic tokens are the single source of truth. Components never reference raw hex values; they reference roles like primary or muted, which resolve per theme."
          >
            <div>
              <SubHeading>Core palette</SubHeading>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {CORE_COLORS.map((c) => (
                  <Swatch key={c.token} {...c} />
                ))}
              </div>
            </div>

            <div>
              <SubHeading>Brand & zone accents</SubHeading>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {BRAND_COLORS.map((c) => (
                  <Swatch key={c.token} {...c} />
                ))}
              </div>
            </div>

            <div>
              <SubHeading>Typography scale</SubHeading>
              <div className="quest-card mt-3 divide-y divide-border">
                {TYPE_SCALE.map((t) => (
                  <div
                    key={t.label}
                    className="grid grid-cols-[minmax(0,1fr)] gap-1 px-4 py-3 sm:grid-cols-[10rem_minmax(0,1fr)] sm:items-center sm:gap-4"
                  >
                    <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                      {t.label}
                    </span>
                    <span className={cn("min-w-0 truncate", t.cls)}>{t.sample}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <SubHeading>Spacing scale</SubHeading>
                <div className="quest-card mt-3 flex flex-col gap-2 p-4">
                  {SPACING.map((s) => (
                    <div key={s} className="flex items-center gap-3">
                      <span className="w-12 shrink-0 font-mono text-[10px] text-muted-foreground">
                        {s} · {s * 0.25}rem
                      </span>
                      <div
                        className="h-3 rounded-sm bg-primary/70"
                        style={{ width: `${s * 0.25}rem` }}
                        aria-hidden="true"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <SubHeading>Radius & elevation</SubHeading>
                <div className="quest-card mt-3 flex flex-col gap-4 p-4">
                  <div className="flex flex-wrap gap-3">
                    {RADII.map((r) => (
                      <div key={r.name} className="flex flex-col items-center gap-1">
                        <div
                          className={cn("size-12 border border-border bg-secondary", r.cls)}
                          aria-hidden="true"
                        />
                        <span className="font-mono text-[10px] text-muted-foreground">
                          {r.name}
                        </span>
                      </div>
                    ))}
                  </div>
                  <Separator />
                  <div className="flex flex-wrap gap-3">
                    <div className="quest-card grid h-16 w-32 place-items-center text-xs">
                      quest-card
                    </div>
                    <div className="glow-neon grid h-16 w-32 place-items-center rounded-lg text-xs">
                      glow-neon
                    </div>
                    <div className="grid h-16 w-32 place-items-center rounded-lg border border-border text-xs text-neon">
                      text-neon
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <SubHeading>The 4px base grid</SubHeading>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                Every padding, gap, row height, and icon size in Planner-KT resolves to a multiple
                of <strong className="text-foreground">4px</strong>. That single constraint is what
                lets a comfortable board view and a compact, high-density data view sit in the same
                product without optical drift — only the multiplier changes, never the rhythm.
              </p>

              <div className="mt-4 grid gap-6 lg:grid-cols-2">
                <div className="quest-card p-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                    Grid ruler · 4px increments
                  </p>
                  <div
                    className="mt-3 flex flex-col gap-2 rounded-md p-2"
                    style={{
                      backgroundImage:
                        "repeating-linear-gradient(to right, color-mix(in oklab, var(--border) 90%, transparent) 0 1px, transparent 1px 4px)",
                    }}
                  >
                    {GRID_STEPS.map((s) => (
                      <div key={s} className="flex items-center gap-3">
                        <span className="w-24 shrink-0 font-mono text-[10px] text-muted-foreground">
                          p-{s} · {s * 4}px
                        </span>
                        <div
                          className="h-2.5 rounded-[2px] bg-primary/70"
                          style={{ width: `${s * 4}px` }}
                          aria-hidden="true"
                        />
                      </div>
                    ))}
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">
                    Tailwind&apos;s numeric scale is already 4px-based (
                    <code className="font-mono text-foreground">1 = 4px</code>), so the grid is
                    enforced by the utility names themselves — there is no arbitrary
                    <code className="ml-1 font-mono text-foreground">p-[13px]</code> to review.
                  </p>
                </div>

                <div className="flex flex-col gap-4">
                  <DensitySample
                    label="Standard density"
                    meta="py-3 · gap-3 · 44px row — touch-target compliant"
                    rowClass="gap-3 py-3"
                    titleClass="text-sm"
                  />
                  <DensitySample
                    label="High data density"
                    meta="py-1 · gap-2 · 28px row — table and audit views"
                    rowClass="gap-2 py-1"
                    titleClass="text-xs"
                    compact
                  />
                </div>
              </div>
            </div>



            <CodeBlock
              label="src/styles.css"
              code={`:root {
  --radius: 0.75rem;
  --primary: oklch(0.55 0.18 200);
  --neon: oklch(0.78 0.2 195);
}

@theme inline {
  --color-primary: var(--primary);
  --color-neon: var(--neon);
  --radius-lg: var(--radius);
}`}
            />
          </Section>

          {/* 2. Atoms */}
          <Section
            id="atoms"
            eyebrow="02 — Atoms"
            title="Atomic Components"
            description="Every atom is a shadcn/ui primitive whose variants are declared with class-variance-authority. Import from @/components/ui and compose — never restyle with ad-hoc colors."
          >
            <Example
              title="Button"
              code={`import { Button } from "@/components/ui/button";

<Button>Add quest</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Delete</Button>
<Button variant="link">Link</Button>
<Button size="sm">Small</Button>
<Button disabled>Disabled</Button>`}
            >
              <Button>Add quest</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Delete</Button>
              <Button variant="link">Link</Button>
              <Button size="sm">Small</Button>
              <Button size="lg">Large</Button>
              <Button disabled>Disabled</Button>
            </Example>

            <Example
              title="Input & Label"
              code={`import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

<Label htmlFor="quest">Quest title</Label>
<Input id="quest" placeholder="Brain dump a quest…" />
<Input disabled placeholder="Disabled" />`}
              className="flex-col !items-stretch"
            >
              <div className="flex w-full flex-col gap-1.5">
                <Label htmlFor="ds-quest">Quest title</Label>
                <Input id="ds-quest" placeholder="Brain dump a quest…" />
              </div>
              <Input disabled placeholder="Disabled" />
            </Example>

            <Example
              title="Badge"
              code={`import { Badge } from "@/components/ui/badge";

<Badge>Now</Badge>
<Badge variant="secondary">Later</Badge>
<Badge variant="outline">Future</Badge>
<Badge variant="destructive">Overdue</Badge>`}
            >
              <Badge>Now</Badge>
              <Badge variant="secondary">Later</Badge>
              <Badge variant="outline">Future</Badge>
              <Badge variant="destructive">Overdue</Badge>
            </Example>

            <Example
              title="Switch & Checkbox"
              code={`import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";

<Switch id="recurring" defaultChecked />
<Checkbox id="subtask" />`}
            >
              <div className="flex items-center gap-2">
                <Switch id="ds-switch" defaultChecked />
                <Label htmlFor="ds-switch">Recurring</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="ds-check" />
                <Label htmlFor="ds-check">Subtask done</Label>
              </div>
            </Example>

            <Example
              title="Card"
              code={`import { Card, CardHeader, CardTitle,
  CardDescription, CardContent } from "@/components/ui/card";

<Card>
  <CardHeader>
    <CardTitle>Morning Armor</CardTitle>
    <CardDescription>Daily recurring quest</CardDescription>
  </CardHeader>
  <CardContent>3 of 5 subtasks complete</CardContent>
</Card>`}
              className="!block"
            >
              <Card className="w-full">
                <CardHeader>
                  <CardTitle>Morning Armor</CardTitle>
                  <CardDescription>Daily recurring quest</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  3 of 5 subtasks complete
                </CardContent>
              </Card>
            </Example>
          </Section>

          {/* 3. Patterns */}
          <Section
            id="patterns"
            eyebrow="03 — Patterns"
            title="UI Patterns"
            description="Atoms composed into the recurring layouts that make up the app surface. These are static replicas of production patterns, safe to read and copy."
          >
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="flex flex-col gap-3">
                <SubHeading>Quest card</SubHeading>
                <QuestCardDemo />
              </div>
              <div className="flex flex-col gap-3">
                <SubHeading>Settings row</SubHeading>
                <div className="quest-card divide-y divide-border">
                  <SettingsRowDemo
                    title="Auto-escalation"
                    description="Promote quests as their due date approaches."
                    defaultChecked
                  />
                  <SettingsRowDemo
                    title="Daily spawn engine"
                    description="Recreate recurring quests each morning."
                    defaultChecked
                  />
                  <SettingsRowDemo
                    title="Celebration effects"
                    description="Sparkle burst when the XP bar hits 100%."
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <SubHeading>Daily XP progress strip</SubHeading>
              <div className="quest-card p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    Daily XP
                  </span>
                  <span className="font-mono text-xs text-neon">68%</span>
                </div>
                <div
                  className="h-3 w-full overflow-hidden rounded-full bg-muted"
                  role="progressbar"
                  aria-valuenow={68}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Daily XP progress example"
                >
                  <div className="h-full w-[68%] rounded-full bg-neon" />
                </div>
              </div>
            </div>

            <CodeBlock
              label="pattern"
              code={`<article className="quest-card p-4">
  <header className="flex items-start gap-3">
    <CompleteCheckbox />
    <h3 className="min-w-0 flex-1 truncate text-sm font-semibold">
      {task.title}
    </h3>
    <Badge variant="secondary">{task.status}</Badge>
  </header>
</article>`}
            />
          </Section>

          {/* 4. AI */}
          <Section
            id="ai"
            eyebrow="04 — Process"
            title="AI-Native Contribution Model"
            description="The design system is written to be machine-legible first."
          >
            <div className="quest-card flex flex-col gap-4 p-5 text-sm leading-relaxed text-muted-foreground">
              <p>
                Planner-KT has no bespoke CSS layer and no component library fork. The entire visual
                language is expressed as{" "}
                <strong className="text-foreground">semantic design tokens</strong> in{" "}
                <code className="font-mono text-foreground">src/styles.css</code>, surfaced as
                Tailwind utility classes, and consumed through{" "}
                <strong className="text-foreground">shadcn/ui conventions</strong> — primitives
                whose variants are declared once with class-variance-authority.
              </p>
              <p>
                That constraint is what makes the system AI-native. An agent such as Cursor or
                Lovable can read a handful of token definitions and a single component file, then
                generate an entirely new screen that already matches the product: correct contrast in
                both themes, correct radii, correct elevation, correct interaction states. There is
                no tacit design knowledge locked in a Figma file and no opportunity to invent a
                one-off shade of blue, so{" "}
                <strong className="text-foreground">design drift approaches zero</strong> even as
                contribution velocity goes up.
              </p>
              <p>
                Reviews get cheaper too: a diff that introduces a raw hex value, an inline style, or
                a new shadow is immediately and mechanically wrong, whether a human or a model wrote
                it.
              </p>

              <Separator />

              <div>
                <SubHeading>Contribution rules — for humans and agents</SubHeading>
                <ul className="mt-3 flex flex-col gap-2">
                  {[
                    "Use semantic tokens only (bg-primary, text-muted-foreground). Never text-white, bg-black, or bg-[#hex].",
                    "New colors are added to src/styles.css for both :root and .dark before being used.",
                    "Component variants belong in a cva() block, not in conditional className strings at the call site.",
                    "Compose from @/components/ui primitives before writing a new one.",
                    "Every interactive element needs a visible focus-visible ring and an accessible name.",
                    "Layout uses grid/flex with min-w-0 and shrink-0 so rows survive mobile widths.",
                  ].map((rule) => (
                    <li key={rule} className="flex gap-2.5">
                      <Check className="mt-0.5 size-4 shrink-0 text-neon" aria-hidden="true" />
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Section>

          <footer className="border-t border-border pt-6 text-center text-xs text-muted-foreground">
            <span className="font-mono">Planner-KT</span> — design system documentation ·{" "}
            <Link to="/" className="underline underline-offset-4 hover:text-foreground">
              Back to the app
            </Link>
          </footer>
        </main>
      </div>
    </div>
  );
}

/* ------------------------------- Patterns ------------------------------- */

function QuestCardDemo() {
  const [done, setDone] = useState([true, false, false]);
  return (
    <article className="quest-card p-4">
      <header className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3">
        <span
          className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border-2 border-neon/70"
          aria-hidden="true"
        >
          <Check className="size-3 text-neon" />
        </span>
        <div className="min-w-0">
          <h4 className="truncate text-sm font-semibold">🛡️ Morning Armor</h4>
          <p className="truncate text-xs text-muted-foreground">Daily · spawns at 5am</p>
        </div>
        <Badge variant="secondary" className="shrink-0">
          Now
        </Badge>
      </header>
      <ul className="mt-3 flex flex-col gap-2">
        {["Wash face", "Skincare", "Make bed"].map((s, i) => (
          <li key={s} className="flex items-center gap-2">
            <Checkbox
              id={`ds-sub-${i}`}
              checked={done[i]}
              onCheckedChange={(v) =>
                setDone((d) => d.map((x, j) => (j === i ? v === true : x)))
              }
            />
            <Label
              htmlFor={`ds-sub-${i}`}
              className={cn(
                "text-xs font-normal",
                done[i] && "text-muted-foreground line-through",
              )}
            >
              {s}
            </Label>
          </li>
        ))}
      </ul>
    </article>
  );
}

function SettingsRowDemo({
  title,
  description,
  defaultChecked,
}: {
  title: string;
  description: string;
  defaultChecked?: boolean;
}) {
  const id = `ds-setting-${title.replace(/\s+/g, "-").toLowerCase()}`;
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-3">
      <div className="min-w-0">
        <Label htmlFor={id} className="text-sm font-medium">
          {title}
        </Label>
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch id={id} defaultChecked={defaultChecked} className="shrink-0" />
    </div>
  );
}
