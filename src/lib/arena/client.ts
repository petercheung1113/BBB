import type { ArenaPublicState } from "@/lib/arena/types";

async function post<T>(body: unknown): Promise<T> {
  const res = await fetch("/api/arena", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await res.json().catch(() => ({}))) as { error?: string } & T;
  if (!res.ok) throw new Error(data.error || `請求失敗 (${res.status})`);
  return data;
}

export async function createRoom(): Promise<{
  code: string;
  hostToken: string;
  state: ArenaPublicState;
}> {
  return post({ op: "create" });
}

export async function joinRoom(
  code: string,
  nickname: string,
): Promise<{ playerId: string; state: ArenaPublicState }> {
  return post({ op: "join", code, nickname });
}

export async function fetchState(
  code: string,
  opts?: { playerId?: string; hostToken?: string },
): Promise<ArenaPublicState> {
  const params = new URLSearchParams({ code });
  if (opts?.playerId) params.set("playerId", opts.playerId);
  if (opts?.hostToken) params.set("hostToken", opts.hostToken);
  const res = await fetch(`/api/arena?${params.toString()}`, {
    cache: "no-store",
  });
  const data = (await res.json().catch(() => ({}))) as ArenaPublicState & {
    error?: string;
  };
  if (!res.ok) throw new Error(data.error || `讀取失敗 (${res.status})`);
  return data;
}

export async function startGame(
  code: string,
  hostToken: string,
): Promise<ArenaPublicState> {
  const { state } = await post<{ state: ArenaPublicState }>({
    op: "start",
    code,
    hostToken,
  });
  return state;
}

export async function submitAnswer(
  code: string,
  playerId: string,
  choiceIndex: number,
): Promise<ArenaPublicState> {
  const { state } = await post<{ state: ArenaPublicState }>({
    op: "answer",
    code,
    playerId,
    choiceIndex,
  });
  return state;
}

export async function nextPhase(
  code: string,
  hostToken: string,
): Promise<ArenaPublicState> {
  const { state } = await post<{ state: ArenaPublicState }>({
    op: "next",
    code,
    hostToken,
  });
  return state;
}
