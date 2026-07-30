import { useState, type ReactNode } from "react";
import { Blocks, Check, Copy, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

/* ------------------------------ Code block ------------------------------ */

export function CodeBlock({ code, label }: { code: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div className="relative overflow-hidden rounded-lg border border-border bg-muted/40">
      <div className="flex items-center justify-between gap-2 border-b border-border/70 px-3 py-1.5">
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          {label ?? "tsx"}
        </span>
        <button
          type="button"
          onClick={copy}
          aria-label="Copy code to clipboard"
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto px-3 py-3 text-[12px] leading-relaxed scrollbar-quest">
        <code className="font-mono text-foreground/85">{code}</code>
      </pre>
      <span aria-live="polite" className="sr-only">
        {copied ? "Code copied to clipboard" : ""}
      </span>
    </div>
  );
}

/* ------------------------------- Sections ------------------------------- */

export function Section({
  id,
  eyebrow,
  title,
  description,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="scroll-mt-28 pt-2">
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-neon-text">{eyebrow}</p>
      <h2 id={`${id}-heading`} className="mt-2 text-2xl font-bold tracking-tight md:text-3xl">
        {title}
      </h2>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{description}</p>
      <div className="mt-6 flex flex-col gap-6">{children}</div>
    </section>
  );
}

export function SubHeading({ children }: { children: ReactNode }) {
  return (
    <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
      {children}
    </h3>
  );
}

/** Preview + code pair. Stacks on mobile, side-by-side on large screens. */
export function Example({
  title,
  code,
  children,
  className,
  a11y,
  api,
}: {
  title: string;
  code: string;
  children: ReactNode;
  className?: string;
  /** Accessibility contract note — rendered as a WCAG 2.1 AA meta line. */
  a11y?: string;
  /** Composable API note — how the primitive is meant to be extended. */
  api?: string;
}) {
  return (
    <div className="quest-card overflow-hidden">
      <div className="flex items-center justify-between border-b border-border/70 px-4 py-2.5">
        <h3 className="text-sm font-semibold">{title}</h3>
        {a11y ? (
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            <ShieldCheck className="size-3 text-neon-text" aria-hidden="true" />
            WCAG 2.1 AA
          </span>
        ) : null}
      </div>
      <div className="grid gap-4 p-4 lg:grid-cols-2">
        <div className={cn("flex min-w-0 flex-wrap items-center gap-3", className)}>{children}</div>
        <div className="min-w-0">
          <CodeBlock code={code} />
        </div>
      </div>
      {(a11y || api) && (
        <dl className="flex flex-col gap-2 border-t border-border/70 px-4 py-3 text-xs text-muted-foreground">
          {a11y ? (
            <div className="flex gap-2">
              <dt className="shrink-0">
                <ShieldCheck className="mt-0.5 size-3.5 text-neon-text" aria-hidden="true" />
                <span className="sr-only">Accessibility</span>
              </dt>
              <dd className="min-w-0">{a11y}</dd>
            </div>
          ) : null}
          {api ? (
            <div className="flex gap-2">
              <dt className="shrink-0">
                <Blocks className="mt-0.5 size-3.5 text-neon-text" aria-hidden="true" />
                <span className="sr-only">Composable API</span>
              </dt>
              <dd className="min-w-0">{api}</dd>
            </div>
          ) : null}
        </dl>
      )}
    </div>
  );
}

/* -------------------------------- Swatch -------------------------------- */

export function Swatch({
  name,
  token,
  className,
  border,
}: {
  name: string;
  token: string;
  className: string;
  border?: boolean;
}) {
  return (
    <div className="quest-card overflow-hidden">
      <div
        className={cn("h-16 w-full", className, border && "border-b border-border")}
        aria-hidden="true"
      />
      <div className="px-3 py-2">
        <p className="truncate text-xs font-semibold">{name}</p>
        <p className="truncate font-mono text-[10px] text-muted-foreground">{token}</p>
      </div>
    </div>
  );
}
