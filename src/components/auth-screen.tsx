import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Swords } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";

export function AuthScreen() {
  const navigate = useNavigate();
  const { session, loading } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && session) navigate({ to: "/" });
  }, [session, loading, navigate]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      navigate({ to: "/" });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-10">
        <div className="mb-8 flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-[var(--color-neon)] to-[var(--color-neon-2)] shadow-[var(--shadow-neon)]">
            <Swords className="h-5 w-5 text-[var(--color-neon-foreground)]" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="font-display text-2xl font-semibold tracking-tight">
              Planner-KT — Sign In
            </h1>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              {mode === "signup" ? "Start your quest log" : "Welcome back"}
            </p>
          </div>
        </div>

        <main className="quest-card p-6">
          <div className="mb-5 flex rounded-xl border border-border bg-card/60 p-1">
            {(["signin", "signup"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className="flex-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
                style={{
                  background: mode === m ? "var(--color-neon)" : "transparent",
                  color:
                    mode === m ? "var(--color-neon-foreground)" : "var(--color-muted-foreground)",
                }}
              >
                {m === "signin" ? "Sign in" : "Sign up"}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="flex flex-col gap-3">
            <label className="flex flex-col gap-1">
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                Email
              </span>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-[var(--color-neon)]"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                Password
              </span>
              <input
                type="password"
                required
                minLength={6}
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-[var(--color-neon)]"
              />
            </label>

            {err && (
              <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive-text">
                {err}
              </p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="mt-2 rounded-lg bg-[var(--color-neon)] px-4 py-2.5 text-sm font-semibold text-[var(--color-neon-foreground)] shadow-[var(--shadow-neon)] transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {busy ? "…" : mode === "signup" ? "Create account" : "Sign in"}
            </button>
          </form>
        </main>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Your quests sync privately across devices. Only you can see them.
        </p>
      </div>
    </div>
  );
}
