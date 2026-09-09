"use client";

import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { DimLab } from "@/components/dim-lab";
import { Mascot, SpeechBubble } from "@/components/mascot";
import { ProofPlayer } from "@/components/proof-player";
import { QuizPlayer } from "@/components/quiz-player";
import { ShapeBuddy } from "@/components/shape-buddy";
import { ShapeDiagram } from "@/components/shape-diagram";
import { SpeakButton } from "@/components/speak-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useProgress } from "@/lib/progress";
import { type ShapeDef } from "@/lib/shapes";
import { cn } from "@/lib/utils";

const STATIONS = ["認識", "周界", "面積", "實驗", "通關"] as const;

export function LessonView({ shape }: { shape: ShapeDef }) {
  const [step, setStep] = useState(0);
  const [dims, setDims] = useState(shape.defaults);
  const mark = useProgress((s) => s.markSection);

  function go(next: number) {
    if (step === 0) mark(shape.id, "meet");
    if (step === 1) mark(shape.id, "peri");
    if (step === 2) mark(shape.id, "area");
    if (step === 3) mark(shape.id, "lab");
    setStep(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link to="/">
            <ArrowLeft className="size-4" />
            返回王國
          </Link>
        </Button>
        <Badge variant="sun">{shape.level}</Badge>
      </div>

      <div className="mb-6 flex items-end gap-3">
        <div
          className="grid size-16 place-items-center rounded-lg"
          style={{ background: `${shape.color}33` }}
        >
          <ShapeBuddy id={shape.id} className="size-14" />
        </div>
        <div>
          <p className="font-display text-sm text-coral">{shape.nickname}</p>
          <h1 className="font-display text-3xl font-semibold">{shape.name}</h1>
          <p className="text-ink-soft">{shape.tagline}</p>
        </div>
      </div>

      <ol className="mb-6 flex gap-1 overflow-x-auto pb-1">
        {STATIONS.map((name, i) => (
          <li key={name} className="flex-1 min-w-16">
            <button
              type="button"
              onClick={() => go(i)}
              className={cn(
                "w-full rounded-full px-2 py-2 font-display text-xs font-semibold",
                i === step ? "bg-ink text-paper" : "bg-card text-muted",
              )}
            >
              {i + 1}. {name}
            </button>
          </li>
        ))}
      </ol>

      {step === 0 ? <Meet shape={shape} /> : null}
      {step === 1 ? <Peri shape={shape} /> : null}
      {step === 2 ? <Area shape={shape} /> : null}
      {step === 3 ? <DimLab shape={shape} dims={dims} onChange={setDims} showGrid /> : null}
      {step === 4 ? <QuizPlayer pack={shape.id} /> : null}

      {step < 4 ? (
        <div className="mt-8 flex justify-between gap-3">
          <Button type="button" variant="outline" disabled={step === 0} onClick={() => go(step - 1)}>
            <ArrowLeft className="size-4" />
            上一站
          </Button>
          <Button type="button" onClick={() => go(step + 1)}>
            下一站
            <ArrowRight className="size-4" />
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function Meet({ shape }: { shape: ShapeDef }) {
  return (
    <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
      <Card>
        <CardContent className="pt-5">
          <ShapeDiagram id={shape.id} dims={shape.defaults} />
          <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <Info label="邊" value={shape.sides} />
            <Info label="角" value={shape.angles} />
          </div>
        </CardContent>
      </Card>
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <Mascot mood="wave" className="h-20 w-20 shrink-0" />
          <SpeechBubble>
            先記住我長什麼樣子。見到這些特徵，就能把我認出來。
            <SpeakButton text={`我是${shape.name}。${shape.tagline}。${shape.properties[0]}`} />
          </SpeechBubble>
        </div>
        <ul className="space-y-2">
          {shape.properties.map((p) => (
            <li key={p} className="flex gap-2 rounded-md bg-card px-3 py-2.5 text-sm leading-relaxed shadow-soft">
              <Check className="mt-0.5 size-4 shrink-0 text-leaf" />
              {p}
            </li>
          ))}
        </ul>
        <div>
          <p className="mb-2 font-display text-sm font-semibold">生活裏哪裏見到？</p>
          <div className="flex flex-wrap gap-2">
            {shape.realWorld.map((w) => (
              <Badge key={w} variant="outline">
                {w}
              </Badge>
            ))}
          </div>
        </div>
        <p className="rounded-md bg-sun/35 px-3 py-2 text-sm text-ink-soft">{shape.funFact}</p>
      </div>
    </div>
  );
}

function Peri({ shape }: { shape: ShapeDef }) {
  return (
    <div className="space-y-5">
      <Card>
        <CardContent className="pt-5">
          <ShapeDiagram id={shape.id} dims={shape.defaults} highlight="outline" />
        </CardContent>
      </Card>
      <FormulaBlock
        title="周界公式"
        formula={shape.perimeter.formula}
        spoken={shape.perimeter.spoken}
        why={shape.perimeter.why}
        example={shape.perimeter.example}
      />
    </div>
  );
}

function Area({ shape }: { shape: ShapeDef }) {
  return (
    <div className="space-y-5">
      <ProofPlayer id={shape.id} />
      <FormulaBlock
        title="面積公式"
        formula={shape.area.formula}
        extra={shape.area.formulaAlt}
        spoken={shape.area.spoken}
        why={shape.area.why}
        example={shape.area.example}
      />
      <div>
        <p className="mb-2 font-display text-sm font-semibold">小心這些小陷阱</p>
        <ul className="space-y-2">
          {shape.mistakes.map((m) => (
            <li key={m} className="rounded-md border-2 border-coral/20 bg-coral/8 px-3 py-2 text-sm text-ink-soft">
              {m}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function FormulaBlock({
  title,
  formula,
  extra,
  spoken,
  why,
  example,
}: {
  title: string;
  formula: string;
  extra?: string;
  spoken: string;
  why: string[];
  example: { given: string; steps: string[]; result: string };
}) {
  return (
    <Card>
      <CardContent className="space-y-4 pt-5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="text-xs font-medium text-muted">{title}</p>
            <p className="font-display text-2xl font-semibold text-coral">{formula}</p>
            {extra ? <p className="mt-1 font-display text-base text-ink-soft">也可以：{extra}</p> : null}
          </div>
          <SpeakButton text={spoken} />
        </div>
        <ol className="space-y-2">
          {why.map((w, i) => (
            <li key={w} className="flex gap-3 text-sm leading-relaxed">
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-sun font-display text-xs font-semibold">
                {i + 1}
              </span>
              {w}
            </li>
          ))}
        </ol>
        <div className="rounded-md bg-paper-2 px-4 py-3">
          <p className="font-display text-sm font-semibold">例題：{example.given}</p>
          <ol className="mt-2 space-y-1 font-display text-sm text-ink-soft">
            {example.steps.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
          <p className="mt-2 font-display text-base font-semibold text-leaf-hot">答案 {example.result}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-paper-2 px-3 py-2">
      <p className="text-xs text-muted">{label}</p>
      <p className="font-display text-sm font-semibold">{value}</p>
    </div>
  );
}
