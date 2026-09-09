import { createFileRoute } from "@tanstack/react-router";
import { handleArena } from "@/lib/arena/api.server";

const handle = ({ request }: { request: Request }) => handleArena(request);

export const Route = createFileRoute("/api/arena")({
  server: { handlers: { GET: handle, POST: handle } },
});
