import { BANK, questionsFor, type ChoiceQ } from "@/lib/quiz";
import type { ArenaDeckQuestion } from "@/lib/arena/types";

const DEFAULT_TIME_LIMIT_SEC = 20;
const DECK_SIZE = 8;

function toDeckItem(q: ChoiceQ): ArenaDeckQuestion {
  return {
    id: q.id,
    prompt: q.prompt,
    options: q.options,
    answer: q.answer,
    explain: q.explain,
    timeLimitSec: DEFAULT_TIME_LIMIT_SEC,
  };
}

/**
 * Build a Kahoot-style choice deck: prefer mixed-pack choice items, then fill
 * from the BANK. Client+server safe (no DB / secrets).
 */
export function buildArenaDeck(): ArenaDeckQuestion[] {
  const seen = new Set<string>();
  const out: ArenaDeckQuestion[] = [];

  const push = (q: ChoiceQ) => {
    if (seen.has(q.id) || out.length >= DECK_SIZE) return;
    seen.add(q.id);
    out.push(toDeckItem(q));
  };

  for (const q of questionsFor("mixed")) {
    if (q.kind === "choice") push(q);
  }
  for (const q of BANK) {
    if (q.kind === "choice") push(q);
  }

  return out;
}
