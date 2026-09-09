import { z } from "zod";
import {
  createRoom,
  getPublicState,
  joinRoom,
  nextPhase,
  startGame,
  submitAnswer,
} from "@/lib/arena/store.server";

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}

function statusOf(err: unknown): number {
  if (err && typeof err === "object" && "status" in err) {
    const s = (err as { status?: unknown }).status;
    if (typeof s === "number") return s;
  }
  return 500;
}

function messageOf(err: unknown): string {
  if (err instanceof Error) return err.message;
  return "arena failed";
}

const CODE = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{4}$/);

const createSchema = z.object({ op: z.literal("create") });
const joinSchema = z.object({
  op: z.literal("join"),
  code: CODE,
  nickname: z.string().trim().min(1).max(12),
});
const startSchema = z.object({
  op: z.literal("start"),
  code: CODE,
  hostToken: z.string().min(8).max(128),
});
const answerSchema = z.object({
  op: z.literal("answer"),
  code: CODE,
  playerId: z.string().min(8).max(128),
  choiceIndex: z.number().int().min(0).max(15),
});
const nextSchema = z.object({
  op: z.literal("next"),
  code: CODE,
  hostToken: z.string().min(8).max(128),
});

const postSchema = z.discriminatedUnion("op", [
  createSchema,
  joinSchema,
  startSchema,
  answerSchema,
  nextSchema,
]);

async function handleGet(url: URL): Promise<Response> {
  const parsed = z
    .object({
      code: CODE,
      playerId: z.string().min(8).max(128).optional(),
      hostToken: z.string().min(8).max(128).optional(),
    })
    .safeParse({
      code: url.searchParams.get("code"),
      playerId: url.searchParams.get("playerId") ?? undefined,
      hostToken: url.searchParams.get("hostToken") ?? undefined,
    });
  if (!parsed.success) return json({ error: "invalid query" }, 400);
  const state = await getPublicState(parsed.data.code, {
    playerId: parsed.data.playerId,
    hostToken: parsed.data.hostToken,
  });
  return json(state);
}

async function handlePost(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "invalid JSON" }, 400);
  }
  const parsed = postSchema.safeParse(body);
  if (!parsed.success) return json({ error: "invalid request" }, 400);
  const msg = parsed.data;

  switch (msg.op) {
    case "create": {
      const result = await createRoom();
      return json(result);
    }
    case "join": {
      const result = await joinRoom(msg.code, msg.nickname);
      return json(result);
    }
    case "start": {
      const state = await startGame(msg.code, msg.hostToken);
      return json({ state });
    }
    case "answer": {
      const state = await submitAnswer(msg.code, msg.playerId, msg.choiceIndex);
      return json({ state });
    }
    case "next": {
      const state = await nextPhase(msg.code, msg.hostToken);
      return json({ state });
    }
    default:
      return json({ error: "unknown op" }, 400);
  }
}

/** Request entrypoint for /api/arena (GET poll, POST create|join|start|answer|next). */
export async function handleArena(request: Request): Promise<Response> {
  try {
    if (request.method === "GET") return await handleGet(new URL(request.url));
    if (request.method === "POST") return await handlePost(request);
    return json({ error: "method not allowed" }, 405);
  } catch (error) {
    const status = statusOf(error);
    if (status >= 500) console.error("[arena] error:", error);
    return json({ error: messageOf(error) }, status);
  }
}
