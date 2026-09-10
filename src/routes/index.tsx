"use client";

import { createFileRoute, Link } from "@tanstack/react-router";
import { Castle, Lock, Shapes, Sparkles, Star, Trophy } from "lucide-react";
import { AppShell, PageTitle } from "@/components/app-shell";
import { Mascot, SpeechBubble } from "@/components/mascot";
import { Onboarding } from "@/components/onboarding";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FRACTION_STATION_IDS } from "@/lib/fractions";
import { fractionStars, starsFromLesson, useProgress } from "@/lib/progress";
import { SHAPE_LIST } from "@/lib/shapes";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const nickname = useProgress((s) => s.nickname);
  const lessons = useProgress((s) => s.lessons);
  const fractions = useProgress((s) => s.fractions);
  const shapeStars = SHAPE_LIST.reduce((n, s) => n + (lessons[s.id] ? starsFromLesson(lessons[s.id]!) : 0), 0);
  const fracStars = fractionStars(fractions ?? {});
  const fracDone = FRACTION_STATION_IDS.filter((id) => fractions?.[id]).length;

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
            <Badge variant="sun">形狀王國 · 多座城堡</Badge>
            <h1 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">
              {nickname ? `${nickname}，歡迎回來` : "歡迎來到形狀王國"}
            </h1>
            <p className="mt-3 max-w-md text-ink-soft">
              王國裏有好幾座主題城堡：圖形、分數……先挑一座進去探險，學懂概念再去擂台對戰！
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button asChild size="lg" className="bg-coral text-paper hover:bg-coral/90">
                <Link to="/castles/shapes">
                  <Shapes className="size-4" />
                  圖形城堡
                </Link>
              </Button>
              <Button asChild size="lg" variant="sun">
                <Link to="/castles/fractions">
                  <Castle className="size-4" />
                  分數城堡
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/arena">
                  <Trophy className="size-4" />
                  開房擂台
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
          每座城堡有自己的車站。圖形城堡認識周界面積；分數城堡先搞懂「等份、分子分母」——別急着背公式，先問為什麼！
        </SpeechBubble>
      </div>

      <PageTitle
        className="mt-10"
        kicker="王國地圖"
        title="主題城堡"
        subtitle="點一座城堡進去。灰色的表示即將開放，敬請期待。"
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <CastleCard
          to="/castles/shapes"
          title="圖形城堡"
          blurb="八座圖形島：特徵、周界、面積與公式為什麼這樣算。"
          accent="#f05a3a"
          emoji="🔶"
          stars={shapeStars}
          meta={`${SHAPE_LIST.length} 座島嶼`}
          delay={0}
        />
        <CastleCard
          to="/castles/fractions"
          title="分數城堡"
          blurb="小三・認識分數概念：平分、分子分母、單位分數與塗色。"
          accent="#f0c43a"
          emoji="🏰"
          stars={fracStars}
          meta={`${fracDone}/${FRACTION_STATION_IDS.length} 站完成`}
          delay={40}
        />
        <CastleCard
          title="長度城堡"
          blurb="量度與單位換算——即將開放。"
          accent="#3a9a6a"
          emoji="📏"
          soon
          delay={80}
        />
        <CastleCard
          title="統計城堡"
          blurb="圖表與數據小偵探——即將開放。"
          accent="#5a7af0"
          emoji="📊"
          soon
          delay={120}
        />
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        <Button asChild variant="outline">
          <Link to="/practice">
            <Sparkles className="size-4" />
            去挑戰
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/lab">動手實驗</Link>
        </Button>
      </div>
    </AppShell>
  );
}

function CastleCard({
  to,
  title,
  blurb,
  accent,
  emoji,
  stars,
  meta,
  soon,
  delay,
}: {
  to?: "/castles/shapes" | "/castles/fractions";
  title: string;
  blurb: string;
  accent: string;
  emoji: string;
  stars?: number;
  meta?: string;
  soon?: boolean;
  delay: number;
}) {
  const inner = (
    <>
      <div
        className="mb-3 grid size-14 place-items-center rounded-xl text-3xl"
        style={{ background: `color-mix(in oklab, ${accent} 28%, white)` }}
      >
        {soon ? <Lock className="size-6 text-muted" /> : <span aria-hidden>{emoji}</span>}
      </div>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h2 className="font-display text-xl font-semibold">{title}</h2>
          <p className="mt-1 text-sm text-ink-soft">{blurb}</p>
          {meta ? <p className="mt-2 text-xs text-muted">{meta}</p> : null}
        </div>
        {soon ? (
          <Badge variant="outline">即將開放</Badge>
        ) : (
          <span className="flex items-center gap-0.5 font-display text-sm tabular-nums text-coral">
            <Star className="size-3.5 fill-coral text-coral" />
            {stars ?? 0}
          </span>
        )}
      </div>
    </>
  );

  if (soon || !to) {
    return (
      <div
        className={cn(
          "enter rounded-xl border-2 border-ink/8 bg-card/70 p-5 opacity-55 shadow-card grayscale",
        )}
        style={{ animationDelay: `${delay}ms` }}
      >
        {inner}
      </div>
    );
  }

  return (
    <Link
      to={to}
      className="enter group block rounded-xl border-2 border-ink/8 bg-card p-5 shadow-card transition-transform duration-150 hover:-translate-y-0.5 active:scale-[0.98]"
      style={{ animationDelay: `${delay}ms` }}
    >
      {inner}
    </Link>
  );
}
