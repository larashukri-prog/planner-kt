import { createFileRoute } from "@tanstack/react-router";
import { AuthScreen } from "@/components/auth-screen";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Planner-KT" },
      {
        name: "description",
        content:
          "Sign in to Planner-KT to sync your quests, priorities, and wins across all your devices.",
      },
    ],
  }),
  component: AuthScreen,
});
