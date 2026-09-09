"use client";

import { useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Check, Lightbulb, RotateCcw, X } from "lucide-react";
import { Mascot, SpeechBubble } from "@/components/mascot";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { questionsFor } from "@/lib/quiz";
import { useProgress } from "@/lib/progress";
import { SHAPES, type ShapeId } from "@/lib/shapes";
import { cn, nearlyEqual, parseNumber } from "@/lib/utils";

export function QuizPlayer({ pack }: { pack: string }) {
  const questions = useMemo(() => questionsFor(pack), [pack]);
  const saveQuiz = useProgress((s) => s.saveQuiz);
  const markLessonQuiz = useProgress((s) => s.markLessonQuiz);
  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const scoreRef = useRef(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [typed, setTyped] = useState("");
  const [status, setStatus] = useState<"idle" | "right" | "wrong">("idle");
  const [hintOn, setHintOn] = useState(false);
  const [done, setDone] = useState(false);
  const [finishedScore, setFinishedScore] = useState(0);
  const [shake, setShake] = useState(false);

  const q = questions[i];
  const total = questions.length;

  if (!q) {
    return (
      <p className="text-ink-soft">
        這組挑戰還沒準備好。
        <Link to="/practice" className="ml-2 text-coral">
          返回
        </Link>
      </p>
    );
  }

  function grade() {
    if (status !== "idle") return;
    let ok = false;
    if (q.kind === "choice") {
      if (picked === null) return;
      ok = picked === q.answer;
    } else {
      const n = parseNumber(typed);
      if (n === null) return;
      ok = nearlyEqual(n, q.answer);
    }
    setStatus(ok ? "right" : "wrong");
    if (ok) {
      // Keep ref in sync so finish can read the latest score without waiting on re-render.
      scoreRef.current += 1;
      setScore(scoreRef.current);
    } else {
      setShake(true);
      window.setTimeout(() => setShake(false), 400);
    }
  }

  function next() {
    if (i + 1 >= total) {
      // grade() already bumped scoreRef when status became "right"; use that as the source of truth.
      const finalScore = scoreRef.current;
      saveQuiz(pack, finalScore, total);
      if (pack in SHAPES) markLessonQuiz(pack as ShapeId, finalScore);
      setFinishedScore(finalScore);
      setDone(true);
      return;
    }
    setI((v) => v + 1);
    setPicked(null);
    setTyped("");
    setStatus("idle");
    setHintOn(false);
  }

  if (done) {
    const pct = Math.round((finishedScore / total) * 100);
    const mood = pct >= 70 ? "cheer" : "think";
    const line =
      pct === 100
        ? "全對！你是形狀王國的小博士！"
        : pct >= 70
          ? "很厲害！再練一次會更穩。"
          : "沒關係，我們再看一次公式，然後回來挑戰。";
    return (
      <div className="enter mx-auto max-w-lg text-center">
        <Mascot mood={mood} className="mx-auto h-44 w-44" />
        <h2 className="mt-2 font-display text-2xl font-semibold">挑戰結束</h2>
        <p className="mt-2 text-ink-soft">{line}</p>
        <p className="mt-4 font-display text-4xl font-semibold tabular-nums text-coral">
          {finishedScore}
          <span className="text-xl text-muted"> / {total}</span>
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button
            type="button"
            onClick={() => {
              setI(0);
              scoreRef.current = 0;
              setScore(0);
              setFinishedScore(0);
              setPicked(null);
              setTyped("");
              setStatus("idle");
              setDone(false);
              setHintOn(false);
            }}
          >
            <RotateCcw className="size-4" />
            再玩一次
          </Button>
          <Button asChild variant="outline">
            <Link to="/practice">回到挑戰廣場</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="font-display text-sm text-muted">
          第 {i + 1} 題　／　共 {total} 題
        </p>
        <p className="font-display text-sm tabular-nums text-coral">得分 {score}</p>
      </div>
      <Progress value={((i + (status === "idle" ? 0 : 1)) / total) * 100} />

      <div className={cn("mt-6 rounded-xl border-2 border-ink/8 bg-card p-5 shadow-card", shake && "shake")}>
        <p className="font-display text-xl font-semibold leading-snug">{q.prompt}</p>
        {q.kind === "choice" ? (
          <div className="mt-5 grid gap-2">
            {q.options.map((opt, idx) => {
              const chosen = picked === idx;
              const reveal = status !== "idle";
              const isAns = idx === q.answer;
              return (
                <button
                  key={opt}
                  type="button"
                  disabled={status !== "idle"}
                  onClick={() => setPicked(idx)}
                  className={cn(
                    "min-h-12 rounded-lg border-2 px-4 py-3 text-left font-display text-base transition-colors",
                    chosen && status === "idle" && "border-coral bg-coral/10",
                    !chosen && status === "idle" && "border-ink/10 bg-paper hover:border-coral/40",
                    reveal && isAns && "border-leaf bg-leaf/15",
                    reveal && chosen && !isAns && "border-coral bg-coral/12",
                  )}
                >
                  <span className="mr-2 inline-flex size-7 items-center justify-center rounded-full bg-ink/8 text-sm">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  {opt}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="mt-5">
            <label className="text-sm text-muted">輸入答案（{q.unit}）</label>
            <div className="mt-2 flex gap-2">
              <Input
                inputMode="decimal"
                value={typed}
                disabled={status !== "idle"}
                onChange={(e) => setTyped(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") grade();
                }}
                placeholder="例如 24"
                className="font-display text-lg tabular-nums"
              />
              <span className="flex items-center whitespace-nowrap font-display text-sm text-muted">
                {q.unit}
              </span>
            </div>
          </div>
        )}

        {hintOn ? (
          <p className="mt-4 rounded-md bg-sun/40 px-3 py-2 text-sm text-ink-soft">
            <Lightbulb className="mr-1 inline size-4 text-ink" />
            {q.hint}
          </p>
        ) : null}

        {status !== "idle" ? (
          <div
            className={cn(
              "mt-4 flex items-start gap-3 rounded-md px-3 py-3 text-sm",
              status === "right" ? "bg-leaf/12 text-leaf-hot" : "bg-coral/10 text-coral",
            )}
          >
            {status === "right" ? <Check className="mt-0.5 size-5 shrink-0" /> : <X className="mt-0.5 size-5 shrink-0" />}
            <div>
              <p className="font-display font-semibold">{status === "right" ? "答對了！" : "再看一看"}</p>
              <p className="mt-1 leading-relaxed text-ink-soft">{q.explain}</p>
            </div>
          </div>
        ) : null}

        <div className="mt-5 flex flex-wrap gap-2">
          {status === "idle" ? (
            <>
              <Button type="button" onClick={grade} disabled={q.kind === "choice" ? picked === null : typed.trim() === ""}>
                確定
              </Button>
              <Button type="button" variant="ghost" onClick={() => setHintOn(true)}>
                提示
              </Button>
            </>
          ) : (
            <Button type="button" variant="leaf" onClick={next}>
              {i + 1 >= total ? "看成績" : "下一題"}
            </Button>
          )}
        </div>
      </div>

      <div className="mt-6 flex items-end gap-3">
        <Mascot mood={status === "right" ? "cheer" : status === "wrong" ? "think" : "wave"} className="h-24 w-24 shrink-0" />
        <SpeechBubble className="mb-4 max-w-sm">
          {status === "right"
            ? "太棒了！繼續加油！"
            : status === "wrong"
              ? "沒關係，讀一讀解釋，下一題會更好。"
              : "慢慢想，也可以先看提示。"}
        </SpeechBubble>
      </div>
    </div>
  );
}
