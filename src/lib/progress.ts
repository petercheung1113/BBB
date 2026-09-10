"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { FRACTION_STATION_IDS, type FractionStationId } from "@/lib/fractions";
import { SHAPE_IDS, type ShapeId } from "@/lib/shapes";

export type LessonMark = {
  meet: boolean;
  peri: boolean;
  area: boolean;
  lab: boolean;
  quiz: number;
};

export type QuizBest = {
  score: number;
  total: number;
};

type SectionKey = "meet" | "peri" | "area" | "lab";

type ProgressState = {
  nickname: string;
  onboarded: boolean;
  lessons: Record<ShapeId, LessonMark>;
  quizBest: Record<string, QuizBest>;
  /** Fraction castle stations completed (1 star each). */
  fractions: Partial<Record<FractionStationId, boolean>>;
  setNickname: (name: string) => void;
  finishOnboarding: (name: string) => void;
  markSection: (id: ShapeId, key: SectionKey) => void;
  markLessonQuiz: (id: ShapeId, score: number) => void;
  saveQuiz: (pack: string, score: number, total: number) => void;
  markFractionStation: (id: FractionStationId) => void;
  resetAll: () => void;
};

function emptyLessons(): Record<ShapeId, LessonMark> {
  return Object.fromEntries(
    SHAPE_IDS.map((id) => [
      id,
      { meet: false, peri: false, area: false, lab: false, quiz: 0 },
    ]),
  ) as Record<ShapeId, LessonMark>;
}

/** Max 5 stars per island: meet + peri + area + lab + quiz (≥2 correct). */
export function starsFromLesson(m: LessonMark): number {
  return (
    (m.meet ? 1 : 0) +
    (m.peri ? 1 : 0) +
    (m.area ? 1 : 0) +
    (m.lab ? 1 : 0) +
    (m.quiz >= 2 ? 1 : 0)
  );
}

export function fractionStars(fractions: Partial<Record<FractionStationId, boolean>>): number {
  let n = 0;
  for (const id of FRACTION_STATION_IDS) {
    if (fractions[id]) n += 1;
  }
  return n;
}

export const useProgress = create<ProgressState>()(
  persist(
    (set) => ({
      nickname: "",
      onboarded: false,
      lessons: emptyLessons(),
      quizBest: {},
      fractions: {},
      setNickname: (nickname) => set({ nickname }),
      finishOnboarding: (name) =>
        set({
          nickname: name.trim() || "小探險家",
          onboarded: true,
        }),
      markSection: (id, key) =>
        set((s) => {
          const prev = s.lessons[id] ?? {
            meet: false,
            peri: false,
            area: false,
            lab: false,
            quiz: 0,
          };
          return {
            lessons: {
              ...s.lessons,
              [id]: { ...prev, lab: prev.lab ?? false, [key]: true },
            },
          };
        }),
      markLessonQuiz: (id, score) =>
        set((s) => {
          const prev = s.lessons[id] ?? {
            meet: false,
            peri: false,
            area: false,
            lab: false,
            quiz: 0,
          };
          return {
            lessons: {
              ...s.lessons,
              [id]: {
                ...prev,
                lab: prev.lab ?? false,
                quiz: Math.max(prev.quiz ?? 0, score),
              },
            },
          };
        }),
      saveQuiz: (pack, score, total) =>
        set((s) => {
          const prev = s.quizBest[pack];
          if (prev && prev.score >= score) return s;
          return { quizBest: { ...s.quizBest, [pack]: { score, total } } };
        }),
      markFractionStation: (id) =>
        set((s) => ({
          fractions: { ...s.fractions, [id]: true },
        })),
      resetAll: () =>
        set({
          nickname: "",
          onboarded: false,
          lessons: emptyLessons(),
          quizBest: {},
          fractions: {},
        }),
    }),
    { name: "shape-kingdom-progress" },
  ),
);

export function totalStars(
  lessons: Record<ShapeId, LessonMark>,
  quizBest: Record<string, QuizBest>,
  fractions: Partial<Record<FractionStationId, boolean>> = {},
) {
  let n = 0;
  for (const id of SHAPE_IDS) n += starsFromLesson(lessons[id] ?? emptyLessons()[id]);
  for (const q of Object.values(quizBest)) {
    if (q.total > 0 && q.score === q.total) n += 2;
    else if (q.total > 0 && q.score / q.total >= 0.7) n += 1;
  }
  n += fractionStars(fractions);
  return n;
}
