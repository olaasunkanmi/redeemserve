import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/vendors")({
  beforeLoad: () => {
    throw redirect({ to: "/dashboard" });
  },
});
