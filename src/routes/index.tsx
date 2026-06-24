import { createFileRoute, Navigate } from "@tanstack/react-router";
import QuestApp from "@/components/quest-app";
import { useAuth } from "@/lib/use-auth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Planner-KT — dopamine-friendly task planner" },
      { name: "description", content: "A frictionless, dopamine-friendly task planner for ADHD brains. Capture, prioritize, and ship." },
      { property: "og:title", content: "Planner-KT — dopamine-friendly task planner" },
      { property: "og:description", content: "Capture quests instantly. Sort into Now / Later / Future. Build a trophy room of wins." },
    ],
  }),
  component: Index,
});

function Index() {
  const { session, loading } = useAuth();
  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center text-muted-foreground">
        <div className="font-mono text-xs uppercase tracking-[0.18em]">Loading…</div>
      </div>
    );
  }
  if (!session) return <Navigate to="/auth" />;
  return <QuestApp />;
}
