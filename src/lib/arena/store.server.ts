/**
 * In-memory arena rooms (globalThis Map). Multi-instance / Neon persistence can come later.
 */
import { buildArenaDeck } from "@/lib/arena/pack";
import type {
  ArenaAvatar,
  ArenaDeckQuestion,
  ArenaPhase,
  ArenaPlayerPublic,
  ArenaPublicState,
} from "@/lib/arena/types";
import {
  DEFAULT_ARENA_AVATAR,
  isArenaAvatar,
  randomArenaAvatar,
} from "@/lib/arena/types";

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const CODE_LEN = 4;
const MAX_PLAYERS = 40;
const ROOM_TTL_MS = 2 * 60 * 60 * 1000;

type PlayerRecord = {
  playerId: string;
  nickname: string;
  score: number;
  lastAnswerQ: number;
  lastChoice: number | null;
  avatar: ArenaAvatar;
};

type RoomRecord = {
  code: string;
  hostToken: string;
  phase: ArenaPhase;
  questionIndex: number;
  deck: ArenaDeckQuestion[];
  endsAt: number | null;
  createdAt: number;
  updatedAt: number;
  players: Map<string, PlayerRecord>;
};

type ArenaStore = {
  rooms: Map<string, RoomRecord>;
};

const globalRef = globalThis as typeof globalThis & {
  __arenaMemoryStore__?: ArenaStore;
};

function getStore(): ArenaStore {
  globalRef.__arenaMemoryStore__ ??= { rooms: new Map() };
  return globalRef.__arenaMemoryStore__;
}

function randomCode(): string {
  let out = "";
  const bytes = crypto.getRandomValues(new Uint8Array(CODE_LEN));
  for (let i = 0; i < CODE_LEN; i += 1) {
    out += CODE_ALPHABET[bytes[i]! % CODE_ALPHABET.length]!;
  }
  return out;
}

function randomId(): string {
  return crypto.randomUUID().replace(/-/g, "");
}

function clamp01(n: number): number {
  if (n < 0) return 0;
  if (n > 1) return 1;
  return n;
}

function scoreCorrect(endsAtMs: number, answeredAtMs: number, timeLimitSec: number): number {
  const remainingFraction = clamp01((endsAtMs - answeredAtMs) / (timeLimitSec * 1000));
  return Math.round(1000 + 500 * remainingFraction);
}

function pruneOldRooms(store: ArenaStore) {
  const cutoff = Date.now() - ROOM_TTL_MS;
  for (const [code, room] of store.rooms) {
    if (room.createdAt < cutoff) store.rooms.delete(code);
  }
}

function maybeAutoReveal(room: RoomRecord): RoomRecord {
  if (room.phase !== "question") return room;
  if (room.endsAt == null || Date.now() < room.endsAt) return room;
  room.phase = "reveal";
  room.endsAt = null;
  room.updatedAt = Date.now();
  return room;
}

function buildPublicState(
  room: RoomRecord,
  opts?: { playerId?: string },
): ArenaPublicState {
  const deck = room.deck;
  const questionIndex = room.questionIndex;
  const phase = room.phase;
  const q = deck[questionIndex] ?? null;

  let question: ArenaPublicState["question"] = null;
  let correctIndex: number | null = null;
  let explain: string | null = null;
  let endsAt: number | null = null;

  if (phase === "question" && q) {
    question = {
      id: q.id,
      prompt: q.prompt,
      options: q.options,
      timeLimitSec: q.timeLimitSec,
    };
    endsAt = room.endsAt;
  } else if (phase === "reveal" && q) {
    question = {
      id: q.id,
      prompt: q.prompt,
      options: q.options,
      timeLimitSec: q.timeLimitSec,
    };
    correctIndex = q.answer;
    explain = q.explain;
  } else if (phase === "finished" && q) {
    correctIndex = q.answer;
  }

  const playersList = [...room.players.values()];
  const publicPlayers: ArenaPlayerPublic[] = playersList
    .map((p) => ({
      id: p.playerId,
      nickname: p.nickname,
      score: Number(p.score) || 0,
      avatar: p.avatar ?? { ...DEFAULT_ARENA_AVATAR },
    }))
    .sort((a, b) => b.score - a.score || a.nickname.localeCompare(b.nickname, "zh-Hant"));

  const state: ArenaPublicState = {
    code: room.code,
    phase,
    questionIndex,
    questionCount: deck.length,
    question,
    correctIndex,
    explain,
    endsAt,
    players: publicPlayers,
  };

  if (opts?.playerId) {
    const me = room.players.get(opts.playerId);
    if (me) {
      const answeredThis =
        phase === "question" || phase === "reveal"
          ? me.lastAnswerQ === questionIndex
          : false;
      state.youAnswered = answeredThis;
      state.yourChoice =
        answeredThis && me.lastChoice != null ? Number(me.lastChoice) : null;
    }
  }

  return state;
}

const DEMO_NICKNAMES = ["測試甲", "測試乙", "測試丙"] as const;

export async function createRoom(): Promise<{
  code: string;
  hostToken: string;
  state: ArenaPublicState;
}> {
  const store = getStore();
  pruneOldRooms(store);
  const deck = buildArenaDeck();
  if (deck.length === 0) throw new Error("arena deck empty");

  let code = "";
  let hostToken = "";
  let inserted = false;
  for (let attempt = 0; attempt < 12; attempt += 1) {
    code = randomCode();
    if (store.rooms.has(code)) continue;
    hostToken = randomId();
    const now = Date.now();
    store.rooms.set(code, {
      code,
      hostToken,
      phase: "lobby",
      questionIndex: 0,
      deck,
      endsAt: null,
      createdAt: now,
      updatedAt: now,
      players: new Map(),
    });
    inserted = true;
    break;
  }
  if (!inserted) throw new Error("could not allocate room code");

  const room = store.rooms.get(code)!;
  return { code, hostToken, state: buildPublicState(room) };
}

export async function joinRoom(
  code: string,
  nicknameRaw: string,
  avatarRaw?: unknown,
): Promise<{ playerId: string; state: ArenaPublicState }> {
  const nickname = nicknameRaw.trim();
  if (nickname.length < 1 || nickname.length > 12) {
    throw Object.assign(new Error("暱稱需 1–12 字"), { status: 400 });
  }
  const normalized = code.trim().toUpperCase();
  if (!/^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{4}$/.test(normalized)) {
    throw Object.assign(new Error("房間代碼無效"), { status: 400 });
  }

  let avatar: ArenaAvatar;
  if (avatarRaw == null) {
    avatar = { ...DEFAULT_ARENA_AVATAR };
  } else if (isArenaAvatar(avatarRaw)) {
    avatar = { ...avatarRaw };
  } else {
    throw Object.assign(new Error("角色設定無效"), { status: 400 });
  }

  const store = getStore();
  pruneOldRooms(store);
  const room = store.rooms.get(normalized);
  if (!room) throw Object.assign(new Error("找不到房間"), { status: 404 });
  maybeAutoReveal(room);

  if (room.phase !== "lobby") {
    throw Object.assign(new Error("比賽已開始，無法加入"), { status: 409 });
  }

  if (room.players.size >= MAX_PLAYERS) {
    throw Object.assign(new Error("房間已滿（最多 40 人）"), { status: 409 });
  }

  const playerId = randomId();
  room.players.set(playerId, {
    playerId,
    nickname,
    score: 0,
    lastAnswerQ: -1,
    lastChoice: null,
    avatar,
  });
  room.updatedAt = Date.now();

  return { playerId, state: buildPublicState(room, { playerId }) };
}

/** Host-only: inject fake players so a teacher can try Start without a second phone. */
export async function addDemoPlayers(
  code: string,
  hostToken: string,
  count = 2,
): Promise<ArenaPublicState> {
  const n = Math.max(1, Math.min(3, Math.floor(Number(count) || 2)));
  const store = getStore();
  const normalized = code.trim().toUpperCase();
  const room = store.rooms.get(normalized);
  if (!room) throw Object.assign(new Error("找不到房間"), { status: 404 });
  if (room.hostToken !== hostToken) {
    throw Object.assign(new Error("主持人憑證無效"), { status: 403 });
  }
  if (room.phase !== "lobby") {
    throw Object.assign(new Error("只能在大廳加入測試選手"), { status: 409 });
  }

  if (room.players.size >= MAX_PLAYERS) {
    return buildPublicState(room);
  }

  const taken = new Set([...room.players.values()].map((p) => p.nickname));
  let added = 0;
  for (const nick of DEMO_NICKNAMES) {
    if (added >= n) break;
    if (room.players.size >= MAX_PLAYERS) break;
    if (taken.has(nick)) continue;
    const playerId = randomId();
    room.players.set(playerId, {
      playerId,
      nickname: nick,
      score: 0,
      lastAnswerQ: -1,
      lastChoice: null,
      avatar: randomArenaAvatar(Date.now() + added * 97 + nick.length * 13),
    });
    taken.add(nick);
    added += 1;
  }

  if (added > 0) room.updatedAt = Date.now();
  return buildPublicState(room);
}

export async function getPublicState(
  code: string,
  opts?: { playerId?: string; hostToken?: string },
): Promise<ArenaPublicState> {
  const store = getStore();
  if (Math.random() < 0.05) pruneOldRooms(store);
  const room = store.rooms.get(code.trim().toUpperCase());
  if (!room) throw Object.assign(new Error("找不到房間"), { status: 404 });
  void opts?.hostToken;
  maybeAutoReveal(room);
  return buildPublicState(room, { playerId: opts?.playerId });
}

/** Start from lobby. Empty lobby is allowed (solo teacher preview). */
export async function startGame(code: string, hostToken: string): Promise<ArenaPublicState> {
  const store = getStore();
  const normalized = code.trim().toUpperCase();
  const room = store.rooms.get(normalized);
  if (!room) throw Object.assign(new Error("找不到房間"), { status: 404 });
  if (room.hostToken !== hostToken) {
    throw Object.assign(new Error("主持人憑證無效"), { status: 403 });
  }
  if (room.phase !== "lobby") {
    throw Object.assign(new Error("只能從大廳開始比賽"), { status: 409 });
  }

  const first = room.deck[0];
  if (!first) throw Object.assign(new Error("題庫空白"), { status: 500 });

  room.phase = "question";
  room.questionIndex = 0;
  room.endsAt = Date.now() + first.timeLimitSec * 1000;
  room.updatedAt = Date.now();
  return buildPublicState(room);
}

export async function submitAnswer(
  code: string,
  playerId: string,
  choiceIndex: number,
): Promise<ArenaPublicState> {
  if (!Number.isInteger(choiceIndex) || choiceIndex < 0) {
    throw Object.assign(new Error("選項無效"), { status: 400 });
  }

  const store = getStore();
  const normalized = code.trim().toUpperCase();
  const room = store.rooms.get(normalized);
  if (!room) throw Object.assign(new Error("找不到房間"), { status: 404 });
  maybeAutoReveal(room);

  if (room.phase !== "question") {
    return buildPublicState(room, { playerId });
  }

  const me = room.players.get(playerId);
  if (!me) throw Object.assign(new Error("找不到玩家"), { status: 404 });

  const qIndex = room.questionIndex;
  if (me.lastAnswerQ === qIndex) {
    return buildPublicState(room, { playerId });
  }

  const q = room.deck[qIndex];
  if (!q) throw Object.assign(new Error("題目不存在"), { status: 500 });
  if (choiceIndex >= q.options.length) {
    throw Object.assign(new Error("選項無效"), { status: 400 });
  }

  const endsAtMs = room.endsAt ?? Date.now();
  const now = Date.now();
  let points = 0;
  if (now > endsAtMs) {
    points = 0;
  } else if (choiceIndex === q.answer) {
    points = scoreCorrect(endsAtMs, now, q.timeLimitSec);
  }

  me.score += points;
  me.lastAnswerQ = qIndex;
  me.lastChoice = choiceIndex;
  room.updatedAt = Date.now();

  maybeAutoReveal(room);
  return buildPublicState(room, { playerId });
}

export async function nextPhase(code: string, hostToken: string): Promise<ArenaPublicState> {
  const store = getStore();
  const normalized = code.trim().toUpperCase();
  const room = store.rooms.get(normalized);
  if (!room) throw Object.assign(new Error("找不到房間"), { status: 404 });
  if (room.hostToken !== hostToken) {
    throw Object.assign(new Error("主持人憑證無效"), { status: 403 });
  }

  maybeAutoReveal(room);
  const deck = room.deck;

  if (room.phase === "question") {
    room.phase = "reveal";
    room.endsAt = null;
    room.updatedAt = Date.now();
  } else if (room.phase === "reveal") {
    const nextIndex = room.questionIndex + 1;
    if (nextIndex >= deck.length) {
      room.phase = "finished";
      room.endsAt = null;
      room.updatedAt = Date.now();
    } else {
      const nextQ = deck[nextIndex]!;
      room.phase = "question";
      room.questionIndex = nextIndex;
      room.endsAt = Date.now() + nextQ.timeLimitSec * 1000;
      room.updatedAt = Date.now();
    }
  } else if (room.phase === "finished") {
    // no-op
  } else {
    throw Object.assign(new Error("大廳中無法換題"), { status: 409 });
  }

  return buildPublicState(room);
}
