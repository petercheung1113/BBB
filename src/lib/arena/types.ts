export type ArenaPhase = "lobby" | "question" | "reveal" | "finished";

export type ArenaAvatarSpecies = "fox" | "cat" | "robot" | "blob" | "star";
export type ArenaAvatarHat = "none" | "wizard" | "cap" | "crown";
export type ArenaAvatarAccessory = "none" | "scarf" | "glasses" | "cape";

export const ARENA_AVATAR_SPECIES = [
  "fox",
  "cat",
  "robot",
  "blob",
  "star",
] as const satisfies readonly ArenaAvatarSpecies[];

export const ARENA_AVATAR_HATS = [
  "none",
  "wizard",
  "cap",
  "crown",
] as const satisfies readonly ArenaAvatarHat[];

export const ARENA_AVATAR_ACCESSORIES = [
  "none",
  "scarf",
  "glasses",
  "cape",
] as const satisfies readonly ArenaAvatarAccessory[];

/** Allowed body colors (keep palette small for mobile picker). */
export const ARENA_AVATAR_COLORS = [
  "#f05a3a", // coral — 星仔 default
  "#f0c43a", // sun
  "#2f9e62", // leaf
  "#7ec8e3", // sky
  "#e86a9a", // circ
  "#5b7ae0", // hex
  "#e8893a", // trap
  "#6bb83a", // rhom
] as const;

export type ArenaAvatarColor = (typeof ARENA_AVATAR_COLORS)[number];

/** Student-created character shown on lobby / podium chips. */
export type ArenaAvatar = {
  species: ArenaAvatarSpecies;
  /** hex color from the allowed palette */
  color: ArenaAvatarColor;
  hat: ArenaAvatarHat;
  accessory: ArenaAvatarAccessory;
};

export type ArenaPlayerPublic = {
  id: string;
  nickname: string;
  score: number;
  avatar: ArenaAvatar;
};

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

/** 星仔 default: fox wizard. */
export const DEFAULT_ARENA_AVATAR: ArenaAvatar = {
  species: "fox",
  color: "#f05a3a",
  hat: "wizard",
  accessory: "none",
};

export function isArenaAvatar(value: unknown): value is ArenaAvatar {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.species === "string" &&
    (ARENA_AVATAR_SPECIES as readonly string[]).includes(v.species) &&
    typeof v.color === "string" &&
    (ARENA_AVATAR_COLORS as readonly string[]).includes(v.color) &&
    typeof v.hat === "string" &&
    (ARENA_AVATAR_HATS as readonly string[]).includes(v.hat) &&
    typeof v.accessory === "string" &&
    (ARENA_AVATAR_ACCESSORIES as readonly string[]).includes(v.accessory)
  );
}

export function normalizeArenaAvatar(raw: unknown): ArenaAvatar {
  if (isArenaAvatar(raw)) return { ...raw };
  return { ...DEFAULT_ARENA_AVATAR };
}

export function randomArenaAvatar(seed?: number): ArenaAvatar {
  let s = seed ?? 0;
  const r =
    seed != null
      ? () => {
          s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
          return s / 0x100000000;
        }
      : Math.random;
  const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(r() * arr.length)]!;
  return {
    species: pick(ARENA_AVATAR_SPECIES),
    color: pick(ARENA_AVATAR_COLORS),
    hat: pick(ARENA_AVATAR_HATS),
    accessory: pick(ARENA_AVATAR_ACCESSORIES),
  };
}
