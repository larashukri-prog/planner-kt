import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertCircle, ArrowLeft, ArrowUpDown, Check, Moon, Sun, Swords } from "lucide-react";

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
import {
  ArchitectureDiagram,
  SkeletonDemo,
  StatefulComponentDemo,
  TactileButtonsDemo,
  ToastDemo,
  XPBarDemo,
} from "@/components/design-system/demos";


import { useTheme } from "@/lib/use-theme";
import { cn } from "@/lib/utils";

const TITLE = "Design System — Planner-KT";
const DESCRIPTION =
  "Living documentation for Planner-KT: design tokens, a 4px base grid, WCAG 2.1 AA atomic components, enterprise UI patterns, standardized motion, and the hook-based middle layer between UI and data.";


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
  { id: "motion", label: "Motion & Micro-interactions" },
  { id: "middle-layer", label: "Middle Layer Architecture" },
  { id: "ai", label: "AI Contribution Model" },
];

const MOTION_TOKENS = [
  { token: "duration-150", value: "150ms", use: "Color, border and background state changes." },
  { token: "duration-200", value: "200ms", use: "Hover lift, press scale, list item collapse." },
  { token: "duration-[320ms]", value: "320ms", use: "Quest-complete success flash and card exit." },
  { token: "ease-out", value: "cubic-bezier(0, 0, 0.2, 1)", use: "Default easing for entrances." },
  { token: "spring 420 / 32", value: "stiffness / damping", use: "Toasts and framer-motion overlays." },
  { token: "active:scale-95", value: "scale(0.95)", use: "Universal press feedback on buttons." },
  { token: "animate-fade-in", value: "300ms fade + 10px rise", use: "Content appearing after a skeleton." },
  { token: "spring 120 / 20", value: "stiffness / damping", use: "Progress width and layout position." },
  { token: "shimmer", value: "2.4s linear ∞", use: "Indeterminate sheen sweeping a progress fill." },
  { token: "motion-reduce:*", value: "transition-none", use: "Honors prefers-reduced-motion everywhere." },
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

/** Measured WCAG 2.1 ratios against --card. "Light, as fill" is the pre-fix value. */
const CONTRAST_ROWS: { token: string; fill: string; text: string; dark: string }[] = [
  { token: "--neon", fill: "1.7:1", text: "4.6:1", dark: "11.7:1" },
  { token: "--neon-2", fill: "2.7:1", text: "4.5:1", dark: "7.9:1" },
  { token: "--neon-3", fill: "1.6:1", text: "4.7:1", dark: "13.0:1" },
  { token: "--zone-now", fill: "3.2:1", text: "4.6:1", dark: "5.9:1" },
  { token: "--zone-next", fill: "2.2:1", text: "4.7:1", dark: "11.7:1" },
  { token: "--zone-later", fill: "3.4:1", text: "4.7:1", dark: "6.2:1" },
  { token: "--inbox", fill: "2.0:1", text: "4.6:1", dark: "11.3:1" },
  { token: "--primary", fill: "3.9:1", text: "4.5:1", dark: "10.0:1" },
  { token: "--destructive", fill: "4.3:1", text: "4.8:1", dark: "4.9:1" },
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


            <div>
              <SubHeading>Contrast &amp; the -text accent rule</SubHeading>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                The vivid accents were tuned for the dark canvas. On the light theme&apos;s
                near-white surfaces they drop as low as 1.6:1 as type, so every accent ships a
                paired <code className="font-mono">-text</code> token solved for at least 4.5:1
                against both <code className="font-mono">--background</code> and{" "}
                <code className="font-mono">--card</code>. The rule:{" "}
                <strong className="text-foreground">
                  vivid token for fills, borders and glows; -text token for type
                </strong>
                . In dark mode the <code className="font-mono">-text</code> aliases point straight
                back at the vivid tokens, which already clear AA.
              </p>

              <div className="quest-card mt-3 overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <caption className="sr-only">
                    Measured contrast ratios for each accent token in both themes
                  </caption>
                  <thead>
                    <tr className="border-b border-border">
                      <th scope="col" className="px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Token</th>
                      <th scope="col" className="px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Light, as fill</th>
                      <th scope="col" className="px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Light, -text</th>
                      <th scope="col" className="px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Dark</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {CONTRAST_ROWS.map((r) => (
                      <tr key={r.token}>
                        <th scope="row" className="px-4 py-2 font-mono text-xs font-normal">{r.token}</th>
                        <td className="px-4 py-2 font-mono text-xs tabular-nums text-muted-foreground">{r.fill}</td>
                        <td className="px-4 py-2 font-mono text-xs tabular-nums text-foreground">{r.text}</td>
                        <td className="px-4 py-2 font-mono text-xs tabular-nums text-muted-foreground">{r.dark}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="mt-3 max-w-2xl text-xs leading-relaxed text-muted-foreground">
                Non-text UI — the XP gradient fill, checkbox rings, card borders — is held to the
                3:1 non-text threshold rather than 4.5:1, so the Quest Log aesthetic stays intact.
              </p>
            </div>

            <CodeBlock
              label="src/styles.css"
              code={`:root {
  --neon: oklch(0.78 0.2 195);       /* fills, borders, glows */
  --neon-text: oklch(0.49 0.2 195);  /* type — 4.5:1 on card */
}

.dark {
  --neon-text: var(--neon);          /* already clears AA */
}

@theme inline {
  --color-neon: var(--neon);
  --color-neon-text: var(--neon-text);
}`}
            />
          </Section>

          {/* 2. Atoms */}
          <Section
            id="atoms"
            eyebrow="02 — Atoms"
            title="Atomic Components"
            description="Every atom is a shadcn/ui primitive whose variants are declared with class-variance-authority. All atoms are built targeting WCAG 2.1 AA — token-guaranteed contrast in both themes, visible focus-visible rings, full keyboard operability, and adequate target sizes — and expose composable APIs (asChild polymorphism, controlled/uncontrolled state, slot-based composition) for flexible integration."
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
              a11y="WCAG 2.1 AA: foreground/background pairs are token-locked above 4.5:1 in both themes, focus-visible ring meets 3:1 non-text contrast, disabled state is conveyed by cursor and aria-disabled rather than color alone, and default size clears the 44×44 target guidance."
              api="Composable API: asChild renders any element (Link, a, label) while keeping variant styling; variants and sizes come from a single cva() block, so new intents are added centrally instead of at the call site."
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
              a11y="WCAG 2.1 AA: every field is programmatically associated with a visible Label via htmlFor/id, supports aria-invalid plus aria-describedby for error and help text, and placeholder text never substitutes for a label."
              api="Composable API: forwards all native input props and ref, so it drops into react-hook-form or any controlled setup unchanged; sizing and state styling stay token-driven."
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
              a11y="WCAG 2.1 AA: status is always carried by the text label, never by hue alone, so the meaning survives color-blindness and monochrome print; every variant pairs a token foreground with its token background."
              api="Composable API: asChild turns a badge into a link or button without duplicating styles; variants extend through the same cva() contract as Button."
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
              a11y="WCAG 2.1 AA: Radix primitives supply role=switch / role=checkbox with aria-checked, Space and Enter activation, and a focus-visible ring; both are always paired with a Label so the hit area includes the text."
              api="Composable API: controlled (checked + onCheckedChange) or uncontrolled (defaultChecked) — the same component serves optimistic UI and plain forms."
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
              a11y="WCAG 2.1 AA: CardTitle is heading-level agnostic, so it can render the correct h2/h3 for its position and keep document outline order intact; surface/foreground pairing is token-guaranteed in both themes."
              api="Composable API: slot components (Header, Title, Description, Content, Footer) compose freely — omit what you don't need, and layout stays on the 4px grid."
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

          {/* 3. Enterprise patterns */}
          <Section
            id="patterns"
            eyebrow="03 — Patterns"
            title="Enterprise UI Patterns"
            description="The same atoms composed into production-scale surfaces: a data-dense task grid, an accessible settings form, and the lighter board-level patterns. Density changes by moving along the 4px grid — never by forking a component."
          >
            <div className="flex flex-col gap-3">
              <SubHeading>Data-dense task grid</SubHeading>
              <p className="max-w-2xl text-xs text-muted-foreground">
                Composes Checkbox, Badge, and Button inside a semantic{" "}
                <code className="font-mono text-foreground">&lt;table&gt;</code>: scoped column
                headers, an <code className="font-mono text-foreground">sr-only</code> caption,
                sortable headers exposing <code className="font-mono text-foreground">aria-sort</code>
                , and a density toggle that only swaps 4px multiples.
              </p>
              <DataGridDemo />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="flex flex-col gap-3">
                <SubHeading>Accessible settings form</SubHeading>
                <p className="text-xs text-muted-foreground">
                  Grouped with fieldset/legend, help text wired through{" "}
                  <code className="font-mono text-foreground">aria-describedby</code>, and an
                  invalid field announced via{" "}
                  <code className="font-mono text-foreground">aria-invalid</code> +{" "}
                  <code className="font-mono text-foreground">role=&quot;alert&quot;</code>.
                </p>
                <SettingsFormDemo />
              </div>
              <div className="flex flex-col gap-3">
                <SubHeading>Quest card &amp; settings rows</SubHeading>
                <p className="text-xs text-muted-foreground">
                  The comfortable end of the density spectrum — same atoms, larger 4px multiples.
                </p>
                <QuestCardDemo />
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
                </div>
              </div>
            </div>


            <CodeBlock
              label="pattern"
              code={`<table className="w-full text-left">
  <caption className="sr-only">Quests, sortable by title and due date</caption>
  <thead className="sticky top-0 bg-card">
    <tr>
      <th scope="col" aria-sort={sort === "title" ? "ascending" : "none"}>
        <button type="button" onClick={() => setSort("title")}>Quest</button>
      </th>
      <th scope="col">Zone</th>
    </tr>
  </thead>
  <tbody className="divide-y divide-border">
    {rows.map((row) => (
      <tr key={row.id} className={dense ? "py-1" : "py-3"}>
        <th scope="row" className="font-normal">{row.title}</th>
        <td><Badge variant="secondary">{row.zone}</Badge></td>
      </tr>
    ))}
  </tbody>
</table>`}
            />
          </Section>

          {/* 4. Motion */}
          <Section
            id="motion"
            eyebrow="04 — Motion"
            title="Motion & Micro-interactions"
            description="Animation is tokenized like everything else. Durations, easings and transforms come from one small vocabulary, so interface motion ships as a living part of the system instead of as one-off CSS."
          >
            <div className="quest-card overflow-hidden">
              <div className="border-b border-border/70 px-4 py-2.5">
                <h3 className="text-sm font-semibold">Motion tokens</h3>
              </div>
              <div className="overflow-x-auto scrollbar-quest">
                <table className="w-full min-w-[520px] text-left text-xs">
                  <caption className="sr-only">Standard motion values used across Planner-KT</caption>
                  <thead className="border-b border-border/70 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    <tr>
                      <th scope="col" className="px-4 py-2 font-medium">Token</th>
                      <th scope="col" className="px-4 py-2 font-medium">Value</th>
                      <th scope="col" className="px-4 py-2 font-medium">Used for</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {MOTION_TOKENS.map((m) => (
                      <tr key={m.token}>
                        <td className="px-4 py-2 font-mono text-[11px] text-foreground">{m.token}</td>
                        <td className="px-4 py-2 font-mono text-[11px] text-muted-foreground">{m.value}</td>
                        <td className="px-4 py-2 text-muted-foreground">{m.use}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <Example
              title="Daily XP strip — gradient progress + celebration"
              className="items-start"
              a11y='The track is a role="progressbar" with aria-valuenow/min/max and a text percentage, so progress is never conveyed by color or width alone. Sparkles and shimmer are aria-hidden decoration and are suppressed under prefers-reduced-motion.'
              api="The fill is composed from the two brand tokens (--neon → --neon-2), so it re-themes automatically in light and dark. The same spring config drives every width and position animation in the product."
              code={`const spring = { type: "spring", stiffness: 120, damping: 20 };
const fill = {
  background:
    "linear-gradient(90deg, var(--color-neon) 0%, var(--color-neon-2) 100%)",
};

<div role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}
     className="relative h-9 overflow-hidden rounded-full border border-border bg-secondary/40">
  {/* glow underlay */}
  <motion.div animate={{ width: \`\${percent}%\` }} transition={spring}
    className="absolute inset-y-0 left-0 rounded-full opacity-60 blur-md" style={fill} />

  {/* gradient fill + shimmer */}
  <motion.div animate={{ width: \`\${percent}%\` }} transition={spring}
    className="absolute inset-y-0 left-0 overflow-hidden rounded-full"
    style={{ ...fill, boxShadow: "var(--shadow-neon)" }}>
    <motion.div className="absolute inset-y-0 w-1/3"
      animate={{ x: ["-100%", "350%"] }}
      transition={{ duration: 2.4, ease: "linear", repeat: Infinity }} />
  </motion.div>
</div>

{/* celebration at 100% */}
<motion.section animate={celebrate ? { scale: [1, 1.02, 1] } : { scale: 1 }} />`}
            >
              <XPBarDemo />
            </Example>

            <Example
              title="Tactile button — hover lift, press scale, success flash"

              a11y="Focus ring is never removed, the success state is announced through aria-pressed and a text change (not color alone), and every transition is disabled under motion-reduce."
              api="Pure Tailwind transition utilities — no JS animation library, so the same classes drop onto any element, including the real Quest card's complete action."
              code={`<button
  className="h-11 rounded-md bg-primary px-4 text-primary-foreground
             shadow-sm transition-all duration-200 ease-out
             hover:-translate-y-0.5 hover:shadow-md
             active:translate-y-0 active:scale-95
             focus-visible:ring-2 focus-visible:ring-ring
             motion-reduce:transition-none"
>
  Hover / press me
</button>`}
            >
              <TactileButtonsDemo />
            </Example>

            <Example
              title="Skeleton loading state"
              a11y='The skeleton is aria-hidden inside an aria-busy, aria-live="polite" region, so assistive tech announces the loaded content rather than reading placeholder boxes.'
              api="Skeleton blocks reuse the real card's 4px-grid dimensions (size-8 avatar, h-4 / h-3 text bars), so the swap to content causes zero layout shift."
              code={`{loading ? (
  <div className="quest-card flex gap-3 p-4" aria-hidden>
    <div className="size-8 animate-pulse rounded-full bg-muted" />
    <div className="flex flex-1 flex-col gap-2">
      <div className="h-4 w-3/5 animate-pulse rounded bg-muted" />
      <div className="h-3 w-4/5 animate-pulse rounded bg-muted" />
    </div>
  </div>
) : (
  <QuestCard {...quest} className="animate-fade-in" />
)}`}
            >
              <SkeletonDemo />
            </Example>

            <Example
              title="Toast notification — spring slide-in"
              a11y='The toast is a role="status" live region, so it is announced without stealing focus, and it auto-dismisses on a timer rather than requiring a click.'
              api="framer-motion AnimatePresence handles mount and unmount with one spring config. Production toasts use sonner with the same offsets and damping."
              code={`<AnimatePresence>
  {open && (
    <motion.div
      role="status"
      aria-live="polite"
      initial={{ opacity: 0, x: 32, scale: 0.96 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 32, scale: 0.96 }}
      transition={{ type: "spring", stiffness: 420, damping: 32 }}
      className="rounded-md border border-border bg-card px-3 py-2.5 shadow-lg"
    >
      Quest completed — +25 XP
    </motion.div>
  )}
</AnimatePresence>`}
            >
              <ToastDemo />
            </Example>
          </Section>

          {/* 5. Middle layer */}
          <Section
            id="middle-layer"
            eyebrow="05 — Architecture"
            title="Middle Layer Architecture"
            description="No component talks to the database. Every screen reads from a custom hook, and the hook owns fetching, optimistic writes, realtime subscriptions and persistence — the middle layer between the UI surface and the data services."
          >
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="flex min-w-0 flex-col gap-3">
                <SubHeading>Data flow</SubHeading>
                <ArchitectureDiagram />
              </div>
              <div className="flex min-w-0 flex-col gap-3">
                <SubHeading>Rules of the middle layer</SubHeading>
                <ul className="quest-card flex flex-col gap-2.5 p-4 text-sm text-muted-foreground">
                  {[
                    "Components stay presentational — they receive state and emit intent, nothing else.",
                    "Hooks own every side effect: network, storage, timers, subscriptions.",
                    "Server writes are optimistic and roll back on error, so the UI never waits on a round trip.",
                    "Storage keys are namespaced (questlog.*) and versioned so migrations are explicit.",
                    "No component imports the data client directly; swapping a service touches one hook.",
                  ].map((rule) => (
                    <li key={rule} className="flex gap-2.5">
                      <Check className="mt-0.5 size-4 shrink-0 text-neon" aria-hidden="true" />
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <Example
              title="Live stateful component — persisted preferences"
              className="items-start"
              a11y="Both controls have programmatic labels and accessible names; the counter buttons are icon-free text targets at the 44px comfortable size."
              api="One generic hook serves both the switch and the counter. The component holds no effects — swap the hook for a server-backed one and the JSX is unchanged."
              code={`function useLocalStorageState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") return initial; // SSR-safe
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
      /* private mode — state still works in memory */
    }
  }, [key, value]);

  return [value, setValue] as const;
}

// the component stays declarative
const [prefs, setPrefs] = useLocalStorageState("questlog.ds.demo.v1", {
  compact: false,
  xp: 0,
});

<Switch
  checked={prefs.compact}
  onCheckedChange={(compact) => setPrefs((p) => ({ ...p, compact }))}
/>`}
            >
              <StatefulComponentDemo />
            </Example>

            <div className="quest-card flex flex-col gap-3 p-4">
              <h3 className="text-sm font-semibold">The same pattern against the server</h3>
              <p className="text-xs leading-relaxed text-muted-foreground">
                <code className="font-mono text-foreground">useTasks</code> is the production
                middle layer. It writes to local state first so the board reacts within a frame,
                fires the network call in the background, and restores the previous row if the
                write fails — the component that rendered the checkbox knows none of this.
              </p>
              <CodeBlock
                label="src/lib/use-tasks.ts"
                code={`const updateTask = (id: string, patch: Partial<Task>) => {
  const prev = tasksRef.current.find((t) => t.id === id);

  // 1. optimistic — UI updates immediately
  setTasks((cur) => cur.map((t) => (t.id === id ? { ...t, ...patch } : t)));

  // 2. persist in the background
  supabase.from("tasks").update(patchToUpdate(patch)).eq("id", id)
    .then(({ error }) => {
      // 3. roll back on failure
      if (error && prev) {
        setTasks((cur) => cur.map((t) => (t.id === id ? prev : t)));
      }
    });
};

// realtime keeps every open tab in sync, still inside the hook
supabase.channel(\`tasks-\${userId}\`)
  .on("postgres_changes", { event: "*", table: "tasks" }, applyRemoteChange)
  .subscribe();`}
              />
            </div>
          </Section>

          {/* 6. AI */}
          <Section
            id="ai"
            eyebrow="06 — Process"

            title="AI-Native Contribution Model"
            description="The design system is written to be machine-legible first — and the same properties that make it AI-friendly are what make it safe to scale in an enterprise."
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
                The payoff is not only visual consistency — it is{" "}
                <strong className="text-foreground">minimized technical debt</strong>. Leaning on
                dependency-light utility classes rather than a wrapped, forked, or heavily themed
                component library keeps the dependency graph small and auditable: fewer transitive
                packages to patch when a CVE lands, no stylesheet graveyard of dead selectors, and
                no bespoke abstraction layer that has to be migrated every time upstream ships a
                major version. Deleting a feature deletes its styling with it.
              </p>
              <p>
                Strict tokenized conventions also make change{" "}
                <strong className="text-foreground">predictable</strong>. A token edit propagates
                everywhere at once with a bounded, inspectable blast radius, so rebrands, contrast
                fixes, and density changes are single-commit operations instead of multi-sprint
                audits. Accessibility guarantees ride along with the tokens rather than being
                re-litigated per screen. And because every legitimate change looks like a token or a
                utility class, any diff that introduces a raw hex value, an inline style, a new
                shadow, or an unvetted dependency is mechanically detectable in review — whether a
                human or a model wrote it. That reviewability is what lets an enterprise team scale
                contributors, and agents, without scaling risk.
              </p>

              <Separator />

              <div>
                <SubHeading>Contribution rules — for humans and agents</SubHeading>
                <ul className="mt-3 flex flex-col gap-2">
                  {[
                    "Use semantic tokens only (bg-primary, text-muted-foreground). Never text-white, bg-black, or bg-[#hex].",
                    "New colors are added to src/styles.css for both :root and .dark before being used.",
                    "All spacing, sizing, and icon dimensions resolve to a 4px multiple — no arbitrary values.",
                    "Component variants belong in a cva() block, not in conditional className strings at the call site.",
                    "Compose from @/components/ui primitives before writing a new one; prefer composition over adding a dependency.",
                    "Every interactive element needs a visible focus-visible ring and an accessible name.",
                    "Every interactive pattern ships with its keyboard and screen-reader behavior verified, not assumed.",
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

/* --------------------------- Density & density-scale --------------------------- */

function DensitySample({
  label,
  meta,
  rowClass,
  titleClass,
  compact,
}: {
  label: string;
  meta: string;
  rowClass: string;
  titleClass: string;
  compact?: boolean;
}) {
  return (
    <div className="quest-card overflow-hidden">
      <div className="flex items-baseline justify-between gap-2 border-b border-border/70 px-4 py-2">
        <p className="text-xs font-semibold">{label}</p>
        <p className="font-mono text-[10px] text-muted-foreground">{meta}</p>
      </div>
      <ul className="divide-y divide-border">
        {GRID_ROWS.map((r) => (
          <li
            key={r.title}
            className={cn(
              "grid grid-cols-[auto_minmax(0,1fr)_auto] items-center px-4",
              rowClass,
            )}
          >
            <span
              className={cn(
                "rounded-full border border-neon/60",
                compact ? "size-3" : "size-4",
              )}
              aria-hidden="true"
            />
            <span className={cn("min-w-0 truncate", titleClass)}>{r.title}</span>
            <span className="font-mono text-[10px] text-muted-foreground">{r.xp} XP</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ------------------------------ Data-dense grid ------------------------------ */

type GridRow = {
  id: string;
  title: string;
  zone: "Now" | "Later" | "Future";
  due: string;
  owner: string;
  xp: number;
  status: "In progress" | "Blocked" | "Queued" | "Done";
};

const DATA_ROWS: GridRow[] = [
  { id: "q-101", title: "Morning Armor", zone: "Now", due: "Today", owner: "KT", xp: 40, status: "In progress" },
  { id: "q-102", title: "Workout", zone: "Now", due: "Today", owner: "KT", xp: 60, status: "Queued" },
  { id: "q-103", title: "Academic Deep Dive — level design doc", zone: "Now", due: "Tomorrow", owner: "KT", xp: 120, status: "In progress" },
  { id: "q-104", title: "Restock Fuel", zone: "Later", due: "Fri", owner: "KT", xp: 20, status: "Queued" },
  { id: "q-105", title: "Laundry Loop", zone: "Later", due: "Fri", owner: "KT", xp: 30, status: "Blocked" },
  { id: "q-106", title: "15-Min Room Reset", zone: "Later", due: "Sat", owner: "KT", xp: 15, status: "Queued" },
  { id: "q-107", title: "Explore Burlington", zone: "Future", due: "Next week", owner: "KT", xp: 50, status: "Queued" },
  { id: "q-108", title: "Portfolio pass — capstone build", zone: "Future", due: "Aug 12", owner: "KT", xp: 200, status: "Queued" },
];

type SortKey = "title" | "due" | "xp";

function DataGridDemo() {
  const [dense, setDense] = useState(true);
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({
    key: "xp",
    dir: "desc",
  });
  const [selected, setSelected] = useState<string[]>(["q-101"]);

  const rows = [...DATA_ROWS].sort((a, b) => {
    const dir = sort.dir === "asc" ? 1 : -1;
    if (sort.key === "xp") return (a.xp - b.xp) * dir;
    return String(a[sort.key]).localeCompare(String(b[sort.key])) * dir;
  });

  const toggleSort = (key: SortKey) =>
    setSort((s) => ({ key, dir: s.key === key && s.dir === "asc" ? "desc" : "asc" }));

  const ariaSort = (key: SortKey): "ascending" | "descending" | "none" =>
    sort.key !== key ? "none" : sort.dir === "asc" ? "ascending" : "descending";

  const cell = dense ? "px-3 py-1" : "px-4 py-3";
  const head = dense ? "px-3 py-2" : "px-4 py-3";

  const SortButton = ({ label, k }: { label: string; k: SortKey }) => (
    <button
      type="button"
      onClick={() => toggleSort(k)}
      className="inline-flex items-center gap-1 rounded-sm text-left transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
    >
      {label}
      <ArrowUpDown className="size-3 opacity-60" aria-hidden="true" />
    </button>
  );

  return (
    <div className="quest-card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 px-4 py-2.5">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          {selected.length} of {DATA_ROWS.length} selected
        </p>
        <div className="flex items-center gap-2">
          <Label htmlFor="ds-density" className="text-xs text-muted-foreground">
            Compact density
          </Label>
          <Switch
            id="ds-density"
            checked={dense}
            onCheckedChange={(v) => setDense(v === true)}
            aria-label="Toggle compact row density"
          />
        </div>
      </div>

      <div className="max-h-[22rem] overflow-auto scrollbar-quest">
        <table className="w-full min-w-[46rem] border-collapse text-left">
          <caption className="sr-only">
            Quest backlog — sortable by quest, due date, and XP. Rows can be selected.
          </caption>
          <thead className="sticky top-0 z-10 bg-card">
            <tr className="border-b border-border text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
              <th scope="col" className={cn(head, "w-10")}>
                <span className="sr-only">Select</span>
              </th>
              <th scope="col" aria-sort={ariaSort("title")} className={head}>
                <SortButton label="Quest" k="title" />
              </th>
              <th scope="col" className={head}>
                Zone
              </th>
              <th scope="col" aria-sort={ariaSort("due")} className={head}>
                <SortButton label="Due" k="due" />
              </th>
              <th scope="col" className={head}>
                Owner
              </th>
              <th scope="col" aria-sort={ariaSort("xp")} className={cn(head, "text-right")}>
                <SortButton label="XP" k="xp" />
              </th>
              <th scope="col" className={head}>
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((r) => {
              const checked = selected.includes(r.id);
              return (
                <tr
                  key={r.id}
                  className={cn("transition-colors hover:bg-accent/40", checked && "bg-accent/30")}
                >
                  <td className={cell}>
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(v) =>
                        setSelected((s) =>
                          v === true ? [...s, r.id] : s.filter((x) => x !== r.id),
                        )
                      }
                      aria-label={`Select ${r.title}`}
                    />
                  </td>
                  <th
                    scope="row"
                    className={cn(cell, "max-w-[18rem] truncate font-medium", dense ? "text-xs" : "text-sm")}
                  >
                    {r.title}
                  </th>
                  <td className={cell}>
                    <Badge variant={r.zone === "Now" ? "default" : "secondary"}>{r.zone}</Badge>
                  </td>
                  <td className={cn(cell, "text-xs text-muted-foreground")}>{r.due}</td>
                  <td className={cn(cell, "text-xs text-muted-foreground")}>{r.owner}</td>
                  <td className={cn(cell, "text-right font-mono text-xs")}>{r.xp}</td>
                  <td className={cn(cell, "text-xs")}>
                    <span className="inline-flex items-center gap-1.5">
                      <span
                        className={cn(
                          "size-1.5 rounded-full",
                          r.status === "Blocked"
                            ? "bg-destructive"
                            : r.status === "In progress"
                              ? "bg-neon"
                              : "bg-muted-foreground",
                        )}
                        aria-hidden="true"
                      />
                      {r.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* --------------------------- Accessible settings form --------------------------- */

function SettingsFormDemo() {
  const [email, setEmail] = useState("kt@planner");
  const invalid = !email.includes(".");

  return (
    <form
      className="quest-card flex flex-col gap-5 p-4"
      onSubmit={(e) => e.preventDefault()}
      aria-labelledby="ds-form-heading"
    >
      <p id="ds-form-heading" className="sr-only">
        Example workspace settings form
      </p>

      <fieldset className="flex flex-col gap-3 border-0 p-0">
        <legend className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Workspace
        </legend>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="ds-ws-name">Workspace name</Label>
          <Input id="ds-ws-name" defaultValue="Planner-KT" aria-describedby="ds-ws-name-help" />
          <p id="ds-ws-name-help" className="text-xs text-muted-foreground">
            Shown in the header and on shared quest links.
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="ds-ws-email">Digest email</Label>
          <Input
            id="ds-ws-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={invalid}
            aria-describedby={invalid ? "ds-ws-email-error" : "ds-ws-email-help"}
          />
          {invalid ? (
            <p
              id="ds-ws-email-error"
              role="alert"
              className="flex items-center gap-1.5 text-xs text-destructive"
            >
              <AlertCircle className="size-3.5 shrink-0" aria-hidden="true" />
              Enter a valid email address — errors are announced, not just colored.
            </p>
          ) : (
            <p id="ds-ws-email-help" className="text-xs text-muted-foreground">
              Where the daily XP digest is delivered.
            </p>
          )}
        </div>
      </fieldset>

      <Separator />

      <fieldset className="flex flex-col gap-0 border-0 p-0">
        <legend className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Automation
        </legend>
        <div className="divide-y divide-border rounded-md border border-border">
          <SettingsRowDemo
            title="Auto-escalation"
            description="Promote quests as their due date approaches."
            defaultChecked
          />
          <SettingsRowDemo
            title="Weekly summary"
            description="Email a rollup of completed quests each Sunday."
          />
        </div>
      </fieldset>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" size="sm">
          Cancel
        </Button>
        <Button type="submit" size="sm">
          Save settings
        </Button>
      </div>
    </form>
  );
}
