"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Check, RotateCcw, Star, X } from "lucide-react";
import { Mascot, SpeechBubble } from "@/components/mascot";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FractionBar,
  FractionCircle,
  FractionGlyph,
  UnequalCake,
} from "@/components/fractions/visuals";
import {
  CHALLENGE_QUESTIONS,
  type FractionStationId,
} from "@/lib/fractions";
import { useProgress } from "@/lib/progress";
import { cn } from "@/lib/utils";

export function FairShareStation({ onComplete }: { onComplete: () => void }) {
  const rounds = useMemo(
    () => [
      { fair: 0, options: [[1, 1], [2, 1]] as number[][], prompt: "兩人分蛋糕，哪一盤切得公平？" },
      { fair: 1, options: [[3, 1], [1, 1, 1]] as number[][], prompt: "三人分，哪一盤每份一樣大？" },
      { fair: 0, options: [[1, 1, 1, 1], [2, 1, 1]] as number[][], prompt: "四人分，哪一盤是等份？" },
    ],
    [],
  );
  const [ri, setRi] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [status, setStatus] = useState<"idle" | "right" | "wrong">("idle");
  const [done, setDone] = useState(false);
  const round = rounds[ri]!;

  function check(i: number) {
    if (status !== "idle") return;
    setPicked(i);
    const ok = i === round.fair;
    setStatus(ok ? "right" : "wrong");
    if (ok) {
      window.setTimeout(() => {
        if (ri + 1 >= rounds.length) {
          setDone(true);
          onComplete();
        } else {
          setRi((x) => x + 1);
          setPicked(null);
          setStatus("idle");
        }
      }, 700);
    }
  }

  if (done) {
    return (
      <DoneCard
        title="太棒了！你懂得『等份』了"
        speech="公平＝每份一樣大。分數就是在談等份哦！"
      />
    );
  }

  return (
    <StationFrame
      speech={
        status === "wrong"
          ? "看看每塊大小——公平的切法，每份要一樣大呀！"
          : status === "right"
            ? "對啦！等份才叫平分～"
            : round.prompt
      }
      mood={status === "right" ? "cheer" : status === "wrong" ? "think" : "wave"}
    >
      <div className="flex flex-wrap items-center justify-center gap-4">
        {round.options.map((ratios, i) => (
          <div key={i} className="text-center">
            <UnequalCake
              ratios={ratios}
              selected={picked === i}
              onSelect={() => check(i)}
            />
            <p className="mt-2 font-display text-sm text-ink-soft">選項 {i + 1}</p>
          </div>
        ))}
      </div>
      {status === "wrong" ? (
        <Button type="button" variant="outline" className="mt-4" onClick={() => { setPicked(null); setStatus("idle"); }}>
          再試一次
        </Button>
      ) : null}
    </StationFrame>
  );
}

export function NumDenStation({ onComplete }: { onComplete: () => void }) {
  const [mode, setMode] = useState<"learn" | "quiz">("learn");
  const [num, setNum] = useState(2);
  const [den, setDen] = useState(5);
  const [q, setQ] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [done, setDone] = useState(false);

  const quizzes = [
    { prompt: "3/4 的分母是？", choices: ["3", "4"], answer: 1 },
    { prompt: "5/8 的分子是？", choices: ["5", "8"], answer: 0 },
    { prompt: "分母告訴我們？", choices: ["分成幾等份", "取了幾份"], answer: 0 },
  ];

  if (done) {
    return (
      <DoneCard
        title="分子分母搞懂啦！"
        speech="記住：分母在下面＝分幾份；分子在上面＝取幾份。"
      />
    );
  }

  if (mode === "learn") {
    return (
      <StationFrame
        speech="試試調分子和分母，看看塗色怎麼變。分母＝分幾份，分子＝取幾份。"
        mood="think"
      >
        <div className="grid gap-6 sm:grid-cols-2 sm:items-center">
          <div className="flex flex-col items-center gap-3">
            <FractionCircle parts={den} shaded={Math.min(num, den)} accent="#f0c43a" />
            <FractionBar parts={den} shaded={Math.min(num, den)} accent="#f05a3a" />
          </div>
          <div className="space-y-4 rounded-xl border-2 border-ink/8 bg-card p-4">
            <div className="flex items-center justify-center gap-4">
              <FractionGlyph num={num} den={den} />
              <div className="text-sm text-ink-soft">
                <p>
                  <span className="font-display font-semibold text-coral">分子 {num}</span>
                  ：取了 {num} 份
                </p>
                <p className="mt-1">
                  <span className="font-display font-semibold text-coral">分母 {den}</span>
                  ：分成 {den} 等份
                </p>
              </div>
            </div>
            <label className="block text-sm font-medium">
              分子（取幾份）
              <input
                type="range"
                min={0}
                max={den}
                value={num}
                onChange={(e) => setNum(Number(e.target.value))}
                className="mt-2 w-full accent-[var(--color-coral)]"
              />
            </label>
            <label className="block text-sm font-medium">
              分母（分幾份）
              <input
                type="range"
                min={2}
                max={8}
                value={den}
                onChange={(e) => {
                  const d = Number(e.target.value);
                  setDen(d);
                  setNum((n) => Math.min(n, d));
                }}
                className="mt-2 w-full accent-[var(--color-coral)]"
              />
            </label>
            <Button type="button" className="w-full" onClick={() => setMode("quiz")}>
              懂了，小測驗！
            </Button>
          </div>
        </div>
      </StationFrame>
    );
  }

  const item = quizzes[q]!;
  return (
    <StationFrame speech={item.prompt} mood={picked === item.answer ? "cheer" : "wave"}>
      <div className="flex flex-wrap gap-2">
        {item.choices.map((c, i) => {
          const show = picked !== null;
          const ok = i === item.answer;
          return (
            <Button
              key={c}
              type="button"
              variant={show && ok ? "leaf" : show && picked === i ? "outline" : "outline"}
              className={cn(show && ok && "ring-2 ring-leaf", show && picked === i && !ok && "opacity-60")}
              disabled={picked !== null}
              onClick={() => {
                setPicked(i);
                if (i === item.answer) {
                  window.setTimeout(() => {
                    if (q + 1 >= quizzes.length) {
                      setDone(true);
                      onComplete();
                    } else {
                      setQ((x) => x + 1);
                      setPicked(null);
                    }
                  }, 650);
                }
              }}
            >
              {c}
            </Button>
          );
        })}
      </div>
      {picked !== null && picked !== item.answer ? (
        <Button type="button" variant="ghost" className="mt-3" onClick={() => setPicked(null)}>
          再想一想
        </Button>
      ) : null}
    </StationFrame>
  );
}

export function UnitFractionStation({ onComplete }: { onComplete: () => void }) {
  const dens = [2, 3, 4, 6, 8];
  const [picked, setPicked] = useState<number | null>(null);
  const [round, setRound] = useState(0);
  const [done, setDone] = useState(false);

  const prompts = [
    { ask: "哪一塊最大？", answer: 2, hint: "分母愈小，單位分數愈大。" },
    { ask: "哪一塊最小？", answer: 8, hint: "分母愈大，每一份愈小。" },
    { ask: "選出 1/3", answer: 3, hint: "分成 3 等份，取 1 份。" },
  ];
  const p = prompts[round]!;

  if (done) {
    return (
      <DoneCard
        title="單位分數比較會了！"
        speech="同一整塊：1/2 > 1/3 > 1/4。分母變大，每份變小～"
      />
    );
  }

  return (
    <StationFrame
      speech={`${p.ask}（同樣大小的圓餅）`}
      mood={picked === p.answer ? "cheer" : "think"}
    >
      <div className="flex flex-wrap items-end justify-center gap-4">
        {dens.map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => {
              if (picked !== null) return;
              setPicked(d);
              if (d === p.answer) {
                window.setTimeout(() => {
                  if (round + 1 >= prompts.length) {
                    setDone(true);
                    onComplete();
                  } else {
                    setRound((x) => x + 1);
                    setPicked(null);
                  }
                }, 700);
              }
            }}
            className={cn(
              "rounded-xl border-2 p-2 transition-transform active:scale-[0.98]",
              picked === d
                ? d === p.answer
                  ? "border-leaf bg-leaf/10"
                  : "border-coral bg-coral/10"
                : "border-ink/8 bg-card hover:-translate-y-0.5",
            )}
          >
            <FractionCircle parts={d} shaded={1} size={100} accent="#5a7af0" />
            <p className="mt-1 text-center font-display text-sm">
              <FractionGlyph num={1} den={d} className="text-base" />
            </p>
          </button>
        ))}
      </div>
      {picked !== null && picked !== p.answer ? (
        <div className="mt-4 text-center">
          <p className="text-sm text-ink-soft">{p.hint}</p>
          <Button type="button" variant="outline" className="mt-2" onClick={() => setPicked(null)}>
            再試
          </Button>
        </div>
      ) : null}
    </StationFrame>
  );
}

export function ShadeStation({ onComplete }: { onComplete: () => void }) {
  const tasks = useMemo(
    () => [
      { parts: 4, target: 1, kind: "bar" as const, say: "塗出 1/4" },
      { parts: 6, target: 3, kind: "circle" as const, say: "塗出 3/6（一半）" },
      { parts: 5, target: 2, kind: "bar" as const, say: "塗出 2/5" },
      { parts: 8, target: 6, kind: "circle" as const, say: "塗出 6/8" },
    ],
    [],
  );
  const [ti, setTi] = useState(0);
  const [shaded, setShaded] = useState<Set<number>>(() => new Set());
  const [msg, setMsg] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const task = tasks[ti]!;

  function toggle(i: number) {
    setMsg(null);
    setShaded((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  function check() {
    if (shaded.size === task.target) {
      setMsg("正確！");
      window.setTimeout(() => {
        if (ti + 1 >= tasks.length) {
          setDone(true);
          onComplete();
        } else {
          setTi((x) => x + 1);
          setShaded(new Set());
          setMsg(null);
        }
      }, 650);
    } else {
      setMsg(`現在塗了 ${shaded.size} 份，目標是 ${task.target} 份哦。`);
    }
  }

  if (done) {
    return (
      <DoneCard title="塗色分數過關！" speech="分子就是你塗了幾份，分母是總共幾等份。" />
    );
  }

  return (
    <StationFrame speech={`${task.say}——點格子／扇形來塗色，再按檢查。`} mood={msg === "正確！" ? "cheer" : "wave"}>
      <div className="flex flex-col items-center gap-4">
        <Badge variant="sun">
          目標 <FractionGlyph num={task.target} den={task.parts} className="mx-1 text-sm" />
        </Badge>
        {task.kind === "bar" ? (
          <FractionBar parts={task.parts} shadedSet={shaded} onToggle={toggle} />
        ) : (
          <FractionCircle parts={task.parts} shadedSet={shaded} onToggle={toggle} size={180} />
        )}
        <div className="flex gap-2">
          <Button type="button" onClick={check}>
            <Check className="size-4" />
            檢查
          </Button>
          <Button type="button" variant="outline" onClick={() => { setShaded(new Set()); setMsg(null); }}>
            <RotateCcw className="size-4" />
            清空
          </Button>
        </div>
        {msg ? (
          <p className={cn("text-sm", msg === "正確！" ? "text-leaf-hot" : "text-coral")}>{msg}</p>
        ) : null}
      </div>
    </StationFrame>
  );
}

export function ChallengeStation({ onComplete }: { onComplete: () => void }) {
  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const q = CHALLENGE_QUESTIONS[i]!;
  const total = CHALLENGE_QUESTIONS.length;
  const pass = finalScore >= Math.ceil(total * 0.6);

  if (done) {
    return (
      <DoneCard
        title={pass ? `挑戰完成！${finalScore}/${total}` : `再練練：${finalScore}/${total}`}
        speech={
          pass
            ? "認識分數概念過關啦！之後再學加減也不怕～"
            : "沒關係，回前面車站再玩一輪，星星會等你。"
        }
        extra={
          !pass ? (
            <Button
              type="button"
              className="mt-3"
              onClick={() => {
                setI(0);
                setScore(0);
                setPicked(null);
                setDone(false);
                setFinalScore(0);
              }}
            >
              再挑戰一次
            </Button>
          ) : null
        }
      />
    );
  }

  return (
    <StationFrame
      speech={q.prompt}
      mood={picked === q.answer ? "cheer" : picked !== null ? "think" : "wave"}
    >
      <div className="mb-3 flex items-center justify-between text-sm text-muted">
        <span>
          第 {i + 1} / {total} 題
        </span>
        <span className="font-display tabular-nums text-coral">得分 {score}</span>
      </div>
      <div className="grid gap-2">
        {q.choices.map((c, idx) => {
          const show = picked !== null;
          const ok = idx === q.answer;
          return (
            <button
              key={c}
              type="button"
              disabled={picked !== null}
              onClick={() => {
                setPicked(idx);
                const right = idx === q.answer;
                const nextScore = score + (right ? 1 : 0);
                if (right) setScore(nextScore);
                window.setTimeout(() => {
                  if (i + 1 >= total) {
                    setFinalScore(nextScore);
                    setDone(true);
                    if (nextScore >= Math.ceil(total * 0.6)) onComplete();
                  } else {
                    setI((x) => x + 1);
                    setPicked(null);
                  }
                }, 900);
              }}
              className={cn(
                "flex items-center gap-2 rounded-xl border-2 px-4 py-3 text-left font-display text-sm transition-colors",
                !show && "border-ink/8 bg-card hover:border-coral/40",
                show && ok && "border-leaf bg-leaf/15",
                show && picked === idx && !ok && "border-coral bg-coral/10",
                show && picked !== idx && !ok && "opacity-50",
              )}
            >
              {show && ok ? <Check className="size-4 text-leaf-hot" /> : null}
              {show && picked === idx && !ok ? <X className="size-4 text-coral" /> : null}
              {c}
            </button>
          );
        })}
      </div>
      {picked !== null ? (
        <p className="mt-3 text-sm text-ink-soft">{q.explain}</p>
      ) : null}
    </StationFrame>
  );
}

export function FractionStationView({ stationId }: { stationId: FractionStationId }) {
  const markFractionStation = useProgress((s) => s.markFractionStation);
  const onComplete = () => markFractionStation(stationId);

  switch (stationId) {
    case "fair-share":
      return <FairShareStation onComplete={onComplete} />;
    case "num-den":
      return <NumDenStation onComplete={onComplete} />;
    case "unit":
      return <UnitFractionStation onComplete={onComplete} />;
    case "shade":
      return <ShadeStation onComplete={onComplete} />;
    case "challenge":
      return <ChallengeStation onComplete={onComplete} />;
    default:
      return null;
  }
}

function StationFrame({
  speech,
  mood,
  children,
}: {
  speech: string;
  mood: "wave" | "cheer" | "think";
  children: ReactNode;
}) {
  return (
    <div>
      <div className="mb-6 flex items-start gap-3">
        <Mascot mood={mood} className="h-16 w-16 shrink-0 sm:h-20 sm:w-20" />
        <SpeechBubble className="max-w-xl">{speech}</SpeechBubble>
      </div>
      <div className="rounded-2xl border-2 border-ink/8 bg-card p-4 shadow-card sm:p-6">{children}</div>
      <div className="mt-4">
        <Button asChild variant="ghost" size="sm">
          <Link to="/castles/fractions">← 回到分數城堡</Link>
        </Button>
      </div>
    </div>
  );
}

function DoneCard({
  title,
  speech,
  extra,
}: {
  title: string;
  speech: string;
  extra?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border-2 border-ink/8 bg-card p-6 text-center shadow-card">
      <Mascot mood="cheer" className="mx-auto h-28 w-28" />
      <h2 className="mt-4 font-display text-2xl font-semibold">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-ink-soft">{speech}</p>
      <div className="mt-2 flex justify-center gap-1 text-coral">
        <Star className="size-5 fill-coral" />
        <Star className="size-5 fill-coral" />
        <Star className="size-5 fill-coral" />
      </div>
      {extra}
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        <Button asChild>
          <Link to="/castles/fractions">回分數城堡</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/">回王國地圖</Link>
        </Button>
      </div>
    </div>
  );
}
