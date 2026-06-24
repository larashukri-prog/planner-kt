import { createFileRoute } from "@tanstack/react-router";
import QuestApp from "@/components/quest-app";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Planner — Executive Functioning for ADHD Brains" },
      { name: "description", content: "A frictionless, dopamine-friendly task planner for ADHD brains. Capture, prioritize, and ship." },
      { property: "og:title", content: "Planner — Executive Functioning for ADHD Brains" },
      { property: "og:description", content: "Capture quests instantly. Sort into Now / Later / Future. Build a trophy room of wins." },
    ],
  }),
  component: Index,
});

function Index() {
  return <QuestApp />;
}
