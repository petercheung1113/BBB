"use client";

import { createFileRoute, Link } from "@tanstack/react-router";
import { Beaker, Sparkles, Star, Trophy } from "lucide-react";
import { AppShell, PageTitle } from "@/components/app-shell";
import { Mascot, SpeechBubble } from "@/components/mascot";
import { ShapeBuddy } from "@/components/shape-buddy";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { starsFromLesson, useProgress } from "@/lib/progress";
import { SHAPE_LIST } from "@/lib/shapes";

export const Route = createFileRoute("/castles/shapes")({ component: ShapesCastle });

function ShapesCastle() {
  const lessons = useProgress((s) => s.lessons);

  return (
    <AppShell>
      <section className="enter rounded-2xl border-2 border-ink/8 bg-card p-5 shadow-card sm:p-6">
        <Badge variant="sun">圖形城堡</Badge>
        <h1 className="mt-2 font-display text-3xl font-semibold">八座圖形島</h1>
        <p className="mt-2 max-w-xl text-ink-soft">
          從最熟悉的正方形開始，或直接跳去你正在學的圖形。每座島五站慢慢闖就好。
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm">
            <Link to="/lab">
              <Beaker className="size-4" />
              實驗場
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to="/practice">
              <Sparkles className="size-4" />
              挑戰
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to="/arena">
              <Trophy className="size-4" />
              擂台
            </Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link to="/">← 王國地圖</Link>
          </Button>
        </div>
      </section>

      <div className="mt-6 flex items-start gap-3">
        <Mascot mood="cheer" className="hidden h-20 w-20 shrink-0 sm:block" />
        <SpeechBubble className="max-w-xl">
          別急着背公式——先問『為什麼』，再動手實驗；剪一剪、搬一搬，答案通常自己蹦出來。
        </SpeechBubble>
      </div>

      <PageTitle className="mt-8" kicker="島嶼地圖" title="選一座島開始" />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {SHAPE_LIST.map((shape, i) => {
          const mark = lessons[shape.id];
          const stars = mark ? starsFromLesson(mark) : 0;
          return (
            <Link
              key={shape.id}
              to="/shapes/$shapeId"
              params={{ shapeId: shape.id }}
              className="enter group block rounded-xl border-2 border-ink/8 bg-card p-3 shadow-card transition-transform duration-150 hover:-translate-y-0.5 active:scale-[0.98]"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <div
                className="grid aspect-square place-items-center rounded-lg"
                style={{ background: `color-mix(in oklab, ${shape.color} 22%, white)` }}
              >
                <ShapeBuddy id={shape.id} className="h-[78%] w-[78%]" />
              </div>
              <div className="mt-3 flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-display text-lg font-semibold leading-tight">{shape.name}</p>
                  <p className="truncate text-xs text-muted">
                    {shape.nickname} · {shape.level}
                  </p>
                </div>
                <span className="flex items-center gap-0.5 font-display text-xs tabular-nums text-coral">
                  <Star className="size-3.5 fill-coral text-coral" />
                  {stars}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </AppShell>
  );
}
