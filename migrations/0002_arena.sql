-- Shape Kingdom BBB arena rooms (Kahoot-style). Shared across Vercel isolates via Neon.
CREATE TABLE IF NOT EXISTS arena_rooms (
  code TEXT PRIMARY KEY,
  host_token TEXT NOT NULL,
  phase TEXT NOT NULL,
  question_index INT NOT NULL DEFAULT 0,
  deck JSONB NOT NULL,
  ends_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS arena_players (
  room_code TEXT NOT NULL,
  player_id TEXT NOT NULL,
  nickname TEXT NOT NULL,
  score INT NOT NULL DEFAULT 0,
  last_answer_q INT NOT NULL DEFAULT -1,
  last_choice INT NULL,
  avatar JSONB NOT NULL DEFAULT '{}'::jsonb,
  PRIMARY KEY (room_code, player_id)
);

CREATE INDEX IF NOT EXISTS arena_rooms_created_at_idx ON arena_rooms (created_at);
CREATE INDEX IF NOT EXISTS arena_players_room_code_idx ON arena_players (room_code);
