export type ArenaPhase = "lobby" | "question" | "reveal" | "finished";

export type ArenaPlayerPublic = { id: string; nickname: string; score: number };

export type ArenaQuestionPublic = {
  id: string;
  prompt: string;
  options: string[];
  timeLimitSec: number;
};

export type ArenaPublicState = {
  code: string;
  phase: ArenaPhase;
  questionIndex: number;
  questionCount: number;
  /** null in lobby/finished; during question NEVER include correctIndex */
  question: ArenaQuestionPublic | null;
  /** only during reveal/finished for current q */
  correctIndex: number | null;
  /** reveal only */
  explain: string | null;
  /** epoch ms when question ends */
  endsAt: number | null;
  /** sorted by score desc */
  players: ArenaPlayerPublic[];
  youAnswered?: boolean;
  yourChoice?: number | null;
};

/** Full deck item stored server-side (includes answer). */
export type ArenaDeckQuestion = {
  id: string;
  prompt: string;
  options: string[];
  answer: number;
  explain: string;
  timeLimitSec: number;
};
