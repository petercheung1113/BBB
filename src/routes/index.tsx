"use client";

import { createFileRoute, Link } from "@tanstack/react-router";
import { Beaker, Sparkles, Star, Trophy } from "lucide-react";
import { AppShell, PageTitle } from "@/components/app-shell";
import { Mascot, SpeechBubble } from "@/components/mascot";
import { Onboarding } from "@/components/onboarding";
import { ShapeBuddy } from "@/components/shape-buddy";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { starsFromLesson, useProgress } from "@/lib/progress";
import { SHAPE_LIST } from "@/lib/shapes";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const nickname = useProgress((s) => s.nickname);
  const lessons = useProgress((s) => s.lessons);

  return (
    <AppShell>
      <Onboarding />
      <section className="enter relative overflow-hidden rounded-2xl border-2 border-ink/8 bg-card shadow-card">
        <img
          src="/characters/kingdom.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-55"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-paper via-paper/88 to-paper/35" />
        <div className="relative grid gap-4 p-5 sm:grid-cols-[1fr_auto] sm:items-center sm:p-8">
          <div>
            <Badge variant="sun">小學圖形探險</Badge>
            <h1 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">
              {nickname ? `${nickname}，歡迎回來` : "歡迎來到形狀王國"}
            </h1>
            <p className="mt-3 max-w-md text-ink-soft">
              認識圖形的特徵，學會周界和面積，更重要的是弄懂公式為什麼這樣算。點一座島，開始今天的探險。
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button asChild size="lg" className="bg-coral text-paper hover:bg-coral/90">
                <Link to="/arena">
                  <Trophy className="size-4" />
                  開房擂台
                </Link>
              </Button>
              <Button asChild size="lg">
                <Link to="/practice">
                  <Sparkles className="size-4" />
                  去挑戰
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/lab">
                  <Beaker className="size-4" />
                  動手實驗
                </Link>
              </Button>
            </div>
          </div>
          <div className="flex items-end justify-center">
            <Mascot mood="wave" className="floaty h-40 w-40 sm:h-52 sm:w-52" />
          </div>
        </div>
      </section>

      <div className="mt-8 flex items-start gap-3">
        <Mascot mood="think" className="hidden h-20 w-20 shrink-0 sm:block" />
        <SpeechBubble className="max-w-xl">
          每座島五站慢慢闖就好。別急着背公式——先問『為什麼』，再動手實驗；剪一剪、搬一搬，答案通常自己蹦出來。
        </SpeechBubble>
      </div>

      <PageTitle className="mt-10" kicker="王國地圖" title="八座圖形島" subtitle="從最熟悉的正方形開始，或直接跳去你正在學的圖形。" />

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
                  <p className="truncate text-xs text-muted">{shape.nickname} · {shape.level}</p>
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
