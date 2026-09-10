import type { ArenaPublicState } from "@/lib/arena/types";

const FETCH_TIMEOUT_MS = 12_000;
const TIMEOUT_MSG = "開房逾時，請再試一次（伺服器可能未就緒）";

async function fetchWithTimeout(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error(TIMEOUT_MSG);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

async function post<T>(body: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetchWithTimeout("/api/arena", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (err) {
    if (err instanceof Error && err.message === TIMEOUT_MSG) throw err;
    throw new Error(TIMEOUT_MSG);
  }
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
  let res: Response;
  try {
    res = await fetchWithTimeout(`/api/arena?${params.toString()}`, {
      cache: "no-store",
    });
  } catch (err) {
    if (err instanceof Error && err.message === TIMEOUT_MSG) throw err;
    throw new Error(TIMEOUT_MSG);
  }
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

export async function addDemoPlayers(
  code: string,
  hostToken: string,
  count?: number,
): Promise<ArenaPublicState> {
  const { state } = await post<{ state: ArenaPublicState }>({
    op: "demoJoin",
    code,
    hostToken,
    ...(count != null ? { count } : {}),
  });
  return state;
}
