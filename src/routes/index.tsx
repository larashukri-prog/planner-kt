import { createFileRoute } from "@tanstack/react-router";
import QuestApp from "@/components/quest-app";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Quest Log — Executive Functioning for ADHD Brains" },
      { name: "description", content: "A frictionless, dopamine-friendly task quest log for ADHD brains. Capture, prioritize, and ship." },
      { property: "og:title", content: "Quest Log — Executive Functioning for ADHD Brains" },
      { property: "og:description", content: "Capture quests instantly. Sort into Now / Next / Later. Build a trophy room of wins." },
    ],
  }),
  component: Index,
});

function Index() {
  return <QuestApp />;
}
