import type { ArenaAvatar, ArenaPublicState } from "@/lib/arena/types";
import {
  arenaAnswer,
  arenaCreate,
  arenaDemoJoin,
  arenaFetchState,
  arenaJoin,
  arenaNext,
  arenaStart,
} from "@/lib/arena/actions";

const FETCH_TIMEOUT_MS = 12_000;
const TIMEOUT_MSG = "開房逾時，請再試一次（伺服器可能未就緒）";

async function withTimeout<T>(promise: Promise<T>): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(TIMEOUT_MSG)), FETCH_TIMEOUT_MS);
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    if (timer != null) clearTimeout(timer);
  }
}

function surfaceError(err: unknown, fallback: string): never {
  let msg = "";
  if (err instanceof Error) {
    msg = err.message || "";
    if (err.name === "AbortError") msg = TIMEOUT_MSG;
  } else if (typeof err === "string") {
    msg = err;
  } else if (err && typeof err === "object") {
    const o = err as { message?: unknown; error?: unknown; status?: unknown };
    if (typeof o.message === "string" && o.message) msg = o.message;
    else if (typeof o.error === "string" && o.error) msg = o.error;
    else {
      try {
        msg = JSON.stringify(err);
      } catch {
        msg = String(err);
      }
    }
    if (typeof o.status === "number") msg = `${msg} (${o.status})`;
  } else {
    msg = String(err ?? "");
  }
  if (!msg || msg === "{}" || msg === "undefined" || msg === "null") {
    msg = fallback;
  }
  if (/timeout|aborterror|failed to fetch|networkerror|load failed/i.test(msg)) {
    throw new Error(TIMEOUT_MSG);
  }
  if (/<!doctype|<html|not found|\b404\b/i.test(msg)) {
    throw new Error(
      "擂台 API 未部署（404）。請確認 Vercel 已連 BBB 最新 main 並 Redeploy。",
    );
  }
  throw new Error(msg);
}

export async function createRoom(): Promise<{
  code: string;
  hostToken: string;
  state: ArenaPublicState;
}> {
  try {
    return await withTimeout(arenaCreate());
  } catch (err) {
    if (err instanceof Error && err.message === TIMEOUT_MSG) throw err;
    surfaceError(err, "開房失敗");
  }
}

export async function joinRoom(
  code: string,
  nickname: string,
  avatar?: ArenaAvatar,
): Promise<{ playerId: string; state: ArenaPublicState }> {
  try {
    return await withTimeout(
      arenaJoin({
        data: {
          code,
          nickname,
          ...(avatar ? { avatar } : {}),
        },
      }),
    );
  } catch (err) {
    if (err instanceof Error && err.message === TIMEOUT_MSG) throw err;
    surfaceError(err, "加入失敗");
  }
}

export async function fetchState(
  code: string,
  opts?: { playerId?: string; hostToken?: string },
): Promise<ArenaPublicState> {
  try {
    return await withTimeout(
      arenaFetchState({
        data: {
          code,
          playerId: opts?.playerId,
          hostToken: opts?.hostToken,
        },
      }),
    );
  } catch (err) {
    if (err instanceof Error && err.message === TIMEOUT_MSG) throw err;
    surfaceError(err, "讀取失敗");
  }
}

export async function startGame(
  code: string,
  hostToken: string,
): Promise<ArenaPublicState> {
  try {
    return await withTimeout(arenaStart({ data: { code, hostToken } }));
  } catch (err) {
    if (err instanceof Error && err.message === TIMEOUT_MSG) throw err;
    surfaceError(err, "開始失敗");
  }
}

export async function submitAnswer(
  code: string,
  playerId: string,
  choiceIndex: number,
): Promise<ArenaPublicState> {
  try {
    return await withTimeout(
      arenaAnswer({ data: { code, playerId, choiceIndex } }),
    );
  } catch (err) {
    if (err instanceof Error && err.message === TIMEOUT_MSG) throw err;
    surfaceError(err, "作答失敗");
  }
}

export async function nextPhase(
  code: string,
  hostToken: string,
): Promise<ArenaPublicState> {
  try {
    return await withTimeout(arenaNext({ data: { code, hostToken } }));
  } catch (err) {
    if (err instanceof Error && err.message === TIMEOUT_MSG) throw err;
    surfaceError(err, "換題失敗");
  }
}

export async function addDemoPlayers(
  code: string,
  hostToken: string,
  count?: number,
): Promise<ArenaPublicState> {
  try {
    return await withTimeout(
      arenaDemoJoin({
        data: {
          code,
          hostToken,
          ...(count != null ? { count } : {}),
        },
      }),
    );
  } catch (err) {
    if (err instanceof Error && err.message === TIMEOUT_MSG) throw err;
    surfaceError(err, "加入測試選手失敗");
  }
}
