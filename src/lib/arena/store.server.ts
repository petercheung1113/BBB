/**
 * Server-authoritative Kahoot-style arena rooms over Postgres (Neon / PGLite).
 * Schema is ensured on first use (IF NOT EXISTS), memoized on globalThis like
 * the signaling relay pattern.
 */
import { getSql, type Sql } from "@/lib/db";
import { buildArenaDeck } from "@/lib/arena/pack";
import type {
  ArenaDeckQuestion,
  ArenaPhase,
  ArenaPlayerPublic,
  ArenaPublicState,
} from "@/lib/arena/types";

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const CODE_LEN = 4;
const MAX_PLAYERS = 40;
const ROOM_TTL_HOURS = 2;

type RoomRow = {
  code: string;
  host_token: string;
  phase: ArenaPhase;
  question_index: number;
  deck: ArenaDeckQuestion[] | string;
  ends_at: Date | string | null;
  created_at: Date | string;
  updated_at: Date | string;
};

type PlayerRow = {
  room_code: string;
  player_id: string;
  nickname: string;
  score: number;
  last_answer_q: number;
  last_choice: number | null;
};

const globalRef = globalThis as typeof globalThis & {
  __arenaSchemaPromise__?: Promise<void>;
};

function ensureSchema(sql: Sql): Promise<void> {
  globalRef.__arenaSchemaPromise__ ??= (async () => {
    await sql.query(
      `CREATE TABLE IF NOT EXISTS arena_rooms (
         code TEXT PRIMARY KEY,
         host_token TEXT NOT NULL,
         phase TEXT NOT NULL,
         question_index INT NOT NULL DEFAULT 0,
         deck JSONB NOT NULL,
         ends_at TIMESTAMPTZ NULL,
         created_at TIMESTAMPTZ DEFAULT now(),
         updated_at TIMESTAMPTZ DEFAULT now()
       )`,
    );
    await sql.query(
      `CREATE TABLE IF NOT EXISTS arena_players (
         room_code TEXT NOT NULL,
         player_id TEXT NOT NULL,
         nickname TEXT NOT NULL,
         score INT NOT NULL DEFAULT 0,
         last_answer_q INT NOT NULL DEFAULT -1,
         last_choice INT NULL,
         PRIMARY KEY (room_code, player_id)
       )`,
    );
  })().catch((err) => {
    globalRef.__arenaSchemaPromise__ = undefined;
    throw err;
  });
  return globalRef.__arenaSchemaPromise__;
}

async function withDb<T>(fn: (sql: Sql) => Promise<T>): Promise<T> {
  const sql = await getSql();
  await ensureSchema(sql);
  return fn(sql);
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

function parseDeck(raw: ArenaDeckQuestion[] | string): ArenaDeckQuestion[] {
  if (typeof raw === "string") return JSON.parse(raw) as ArenaDeckQuestion[];
  return raw;
}

function toEpochMs(value: Date | string | null | undefined): number | null {
  if (value == null) return null;
  if (value instanceof Date) return value.getTime();
  const t = Date.parse(String(value));
  return Number.isFinite(t) ? t : null;
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

async function pruneOldRooms(sql: Sql) {
  await sql.query(
    `DELETE FROM arena_players WHERE room_code IN (
       SELECT code FROM arena_rooms WHERE created_at < now() - make_interval(hours => $1)
     )`,
    [ROOM_TTL_HOURS],
  );
  await sql.query(
    `DELETE FROM arena_rooms WHERE created_at < now() - make_interval(hours => $1)`,
    [ROOM_TTL_HOURS],
  );
}

async function loadRoom(sql: Sql, code: string): Promise<RoomRow | null> {
  const rows = await sql.query<RoomRow>(
    `SELECT code, host_token, phase, question_index, deck, ends_at, created_at, updated_at
     FROM arena_rooms WHERE code = $1`,
    [code.toUpperCase()],
  );
  return rows[0] ?? null;
}

async function loadPlayers(sql: Sql, code: string): Promise<PlayerRow[]> {
  return sql.query<PlayerRow>(
    `SELECT room_code, player_id, nickname, score, last_answer_q, last_choice
     FROM arena_players WHERE room_code = $1`,
    [code.toUpperCase()],
  );
}

async function persistReveal(sql: Sql, code: string) {
  await sql.query(
    `UPDATE arena_rooms
     SET phase = 'reveal', ends_at = NULL, updated_at = now()
     WHERE code = $1 AND phase = 'question'`,
    [code.toUpperCase()],
  );
}

/**
 * If the question timer elapsed, transition lobby→… wait, only question→reveal.
 */
async function maybeAutoReveal(sql: Sql, room: RoomRow): Promise<RoomRow> {
  if (room.phase !== "question") return room;
  const endsAt = toEpochMs(room.ends_at);
  if (endsAt == null || Date.now() < endsAt) return room;
  await persistReveal(sql, room.code);
  const refreshed = await loadRoom(sql, room.code);
  return refreshed ?? { ...room, phase: "reveal", ends_at: null };
}

function buildPublicState(
  room: RoomRow,
  players: PlayerRow[],
  opts?: { playerId?: string },
): ArenaPublicState {
  const deck = parseDeck(room.deck);
  const questionIndex = room.question_index;
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
    endsAt = toEpochMs(room.ends_at);
    // NEVER leak answer during question
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

  const publicPlayers: ArenaPlayerPublic[] = players
    .map((p) => ({
      id: p.player_id,
      nickname: p.nickname,
      score: Number(p.score) || 0,
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
    const me = players.find((p) => p.player_id === opts.playerId);
    if (me) {
      const answeredThis =
        phase === "question" || phase === "reveal"
          ? me.last_answer_q === questionIndex
          : false;
      state.youAnswered = answeredThis;
      state.yourChoice =
        answeredThis && me.last_choice != null ? Number(me.last_choice) : null;
    }
  }

  return state;
}

export async function createRoom(): Promise<{
  code: string;
  hostToken: string;
  state: ArenaPublicState;
}> {
  return withDb(async (sql) => {
    await pruneOldRooms(sql);
    const deck = buildArenaDeck();
    if (deck.length === 0) throw new Error("arena deck empty");

    let code = "";
    let hostToken = "";
    let inserted = false;
    for (let attempt = 0; attempt < 12; attempt += 1) {
      code = randomCode();
      hostToken = randomId();
      try {
        await sql.query(
          `INSERT INTO arena_rooms (code, host_token, phase, question_index, deck, ends_at)
           VALUES ($1, $2, 'lobby', 0, $3::jsonb, NULL)`,
          [code, hostToken, JSON.stringify(deck)],
        );
        inserted = true;
        break;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.toLowerCase().includes("unique") || msg.toLowerCase().includes("duplicate")) {
          continue;
        }
        throw err;
      }
    }
    if (!inserted) throw new Error("could not allocate room code");

    const room = await loadRoom(sql, code);
    if (!room) throw new Error("room missing after create");
    return { code, hostToken, state: buildPublicState(room, []) };
  });
}

export async function joinRoom(
  code: string,
  nicknameRaw: string,
): Promise<{ playerId: string; state: ArenaPublicState }> {
  const nickname = nicknameRaw.trim();
  if (nickname.length < 1 || nickname.length > 12) {
    throw Object.assign(new Error("暱稱需 1–12 字"), { status: 400 });
  }
  const normalized = code.trim().toUpperCase();
  if (!/^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{4}$/.test(normalized)) {
    throw Object.assign(new Error("房間代碼無效"), { status: 400 });
  }

  return withDb(async (sql) => {
    await pruneOldRooms(sql);
    let room = await loadRoom(sql, normalized);
    if (!room) throw Object.assign(new Error("找不到房間"), { status: 404 });
    room = await maybeAutoReveal(sql, room);

    if (room.phase !== "lobby") {
      throw Object.assign(new Error("比賽已開始，無法加入"), { status: 409 });
    }

    const existing = await loadPlayers(sql, normalized);
    if (existing.length >= MAX_PLAYERS) {
      throw Object.assign(new Error("房間已滿（最多 40 人）"), { status: 409 });
    }

    const playerId = randomId();
    await sql.query(
      `INSERT INTO arena_players (room_code, player_id, nickname, score, last_answer_q, last_choice)
       VALUES ($1, $2, $3, 0, -1, NULL)`,
      [normalized, playerId, nickname],
    );
    await sql.query(`UPDATE arena_rooms SET updated_at = now() WHERE code = $1`, [normalized]);

    const players = await loadPlayers(sql, normalized);
    return { playerId, state: buildPublicState(room, players, { playerId }) };
  });
}

export async function getPublicState(
  code: string,
  opts?: { playerId?: string; hostToken?: string },
): Promise<ArenaPublicState> {
  return withDb(async (sql) => {
    if (Math.random() < 0.05) await pruneOldRooms(sql);
    let room = await loadRoom(sql, code.trim().toUpperCase());
    if (!room) throw Object.assign(new Error("找不到房間"), { status: 404 });
    // hostToken is accepted for symmetry / future auth; not required to read
    void opts?.hostToken;
    room = await maybeAutoReveal(sql, room);
    const players = await loadPlayers(sql, room.code);
    return buildPublicState(room, players, { playerId: opts?.playerId });
  });
}

export async function startGame(code: string, hostToken: string): Promise<ArenaPublicState> {
  return withDb(async (sql) => {
    const normalized = code.trim().toUpperCase();
    const room = await loadRoom(sql, normalized);
    if (!room) throw Object.assign(new Error("找不到房間"), { status: 404 });
    if (room.host_token !== hostToken) {
      throw Object.assign(new Error("主持人憑證無效"), { status: 403 });
    }
    if (room.phase !== "lobby") {
      throw Object.assign(new Error("只能從大廳開始比賽"), { status: 409 });
    }

    const deck = parseDeck(room.deck);
    const first = deck[0];
    if (!first) throw Object.assign(new Error("題庫空白"), { status: 500 });

    const endsAtMs = Date.now() + first.timeLimitSec * 1000;
    await sql.query(
      `UPDATE arena_rooms
       SET phase = 'question',
           question_index = 0,
           ends_at = $2::timestamptz,
           updated_at = now()
       WHERE code = $1`,
      [normalized, new Date(endsAtMs).toISOString()],
    );

    const refreshed = await loadRoom(sql, normalized);
    if (!refreshed) throw new Error("room missing");
    const players = await loadPlayers(sql, normalized);
    return buildPublicState(refreshed, players);
  });
}

export async function submitAnswer(
  code: string,
  playerId: string,
  choiceIndex: number,
): Promise<ArenaPublicState> {
  if (!Number.isInteger(choiceIndex) || choiceIndex < 0) {
    throw Object.assign(new Error("選項無效"), { status: 400 });
  }

  return withDb(async (sql) => {
    const normalized = code.trim().toUpperCase();
    let room = await loadRoom(sql, normalized);
    if (!room) throw Object.assign(new Error("找不到房間"), { status: 404 });
    room = await maybeAutoReveal(sql, room);

    if (room.phase !== "question") {
      // late / wrong phase — still return state; treat as no-op lock
      const players = await loadPlayers(sql, normalized);
      return buildPublicState(room, players, { playerId });
    }

    const players = await loadPlayers(sql, normalized);
    const me = players.find((p) => p.player_id === playerId);
    if (!me) throw Object.assign(new Error("找不到玩家"), { status: 404 });

    const qIndex = room.question_index;
    if (me.last_answer_q === qIndex) {
      // first answer locks; ignore duplicates
      return buildPublicState(room, players, { playerId });
    }

    const deck = parseDeck(room.deck);
    const q = deck[qIndex];
    if (!q) throw Object.assign(new Error("題目不存在"), { status: 500 });
    if (choiceIndex >= q.options.length) {
      throw Object.assign(new Error("選項無效"), { status: 400 });
    }

    const endsAtMs = toEpochMs(room.ends_at) ?? Date.now();
    const now = Date.now();
    let points = 0;
    if (now > endsAtMs) {
      points = 0; // late
    } else if (choiceIndex === q.answer) {
      points = scoreCorrect(endsAtMs, now, q.timeLimitSec);
    }

    await sql.query(
      `UPDATE arena_players
       SET score = score + $4,
           last_answer_q = $3,
           last_choice = $5
       WHERE room_code = $1 AND player_id = $2 AND last_answer_q <> $3`,
      [normalized, playerId, qIndex, points, choiceIndex],
    );
    await sql.query(`UPDATE arena_rooms SET updated_at = now() WHERE code = $1`, [normalized]);

    // If timer elapsed during scoring, reveal
    room = await maybeAutoReveal(sql, room);
    const refreshedPlayers = await loadPlayers(sql, normalized);
    return buildPublicState(room, refreshedPlayers, { playerId });
  });
}

export async function nextPhase(code: string, hostToken: string): Promise<ArenaPublicState> {
  return withDb(async (sql) => {
    const normalized = code.trim().toUpperCase();
    let room = await loadRoom(sql, normalized);
    if (!room) throw Object.assign(new Error("找不到房間"), { status: 404 });
    if (room.host_token !== hostToken) {
      throw Object.assign(new Error("主持人憑證無效"), { status: 403 });
    }

    room = await maybeAutoReveal(sql, room);
    const deck = parseDeck(room.deck);

    if (room.phase === "question") {
      await persistReveal(sql, normalized);
    } else if (room.phase === "reveal") {
      const nextIndex = room.question_index + 1;
      if (nextIndex >= deck.length) {
        await sql.query(
          `UPDATE arena_rooms
           SET phase = 'finished', ends_at = NULL, updated_at = now()
           WHERE code = $1`,
          [normalized],
        );
      } else {
        const nextQ = deck[nextIndex]!;
        const endsAtMs = Date.now() + nextQ.timeLimitSec * 1000;
        await sql.query(
          `UPDATE arena_rooms
           SET phase = 'question',
               question_index = $2,
               ends_at = $3::timestamptz,
               updated_at = now()
           WHERE code = $1`,
          [normalized, nextIndex, new Date(endsAtMs).toISOString()],
        );
      }
    } else if (room.phase === "finished") {
      // no-op
    } else {
      throw Object.assign(new Error("大廳中無法換題"), { status: 409 });
    }

    const refreshed = await loadRoom(sql, normalized);
    if (!refreshed) throw new Error("room missing");
    const players = await loadPlayers(sql, normalized);
    return buildPublicState(refreshed, players);
  });
}
