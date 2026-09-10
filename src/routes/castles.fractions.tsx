"use client";

import { createFileRoute, Link } from "@tanstack/react-router";
import { Star } from "lucide-react";
import { AppShell, PageTitle } from "@/components/app-shell";
import { Mascot, SpeechBubble } from "@/components/mascot";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FRACTION_STATIONS } from "@/lib/fractions";
import { useProgress } from "@/lib/progress";

export const Route = createFileRoute("/castles/fractions")({ component: FractionsCastle });

function FractionsCastle() {
  const fractions = useProgress((s) => s.fractions);

  return (
    <AppShell>
      <section className="enter rounded-2xl border-2 border-ink/8 bg-card p-5 shadow-card sm:p-6">
        <Badge variant="sun">分數城堡 · 小三</Badge>
        <h1 className="mt-2 font-display text-3xl font-semibold">認識分數的概念</h1>
        <p className="mt-2 max-w-xl text-ink-soft">
          先搞懂等份、分子分母和單位分數。加減異分母之後再學——這裏先把地基打穩！
        </p>
        <Button asChild variant="ghost" size="sm" className="mt-3">
          <Link to="/">← 王國地圖</Link>
        </Button>
      </section>

      <div className="mt-6 flex items-start gap-3">
        <Mascot mood="wave" className="h-20 w-20 shrink-0" />
        <SpeechBubble className="max-w-xl">
          分數不是可怕的符號，只是「把整塊公平分成幾份，再取幾份」。一站一站玩過去就會了～
        </SpeechBubble>
      </div>

      <PageTitle className="mt-8" kicker="車站列表" title="五個分數車站" subtitle="建議由上到下闖關；小挑戰在最後。" />

      <div className="grid gap-3 sm:grid-cols-2">
        {FRACTION_STATIONS.map((st, i) => {
          const done = Boolean(fractions?.[st.id]);
          return (
            <Link
              key={st.id}
              to="/castles/fractions/$stationId"
              params={{ stationId: st.id }}
              className="enter block rounded-xl border-2 border-ink/8 bg-card p-5 shadow-card transition-transform duration-150 hover:-translate-y-0.5"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <span
                  className="grid size-12 place-items-center rounded-xl text-2xl"
                  style={{ background: `color-mix(in oklab, ${st.color} 28%, white)` }}
                >
                  {st.emoji}
                </span>
                {done ? (
                  <Badge variant="leaf">
                    <Star className="mr-1 size-3 fill-current" />
                    已完成
                  </Badge>
                ) : (
                  <Badge variant="outline">第 {i + 1} 站</Badge>
                )}
              </div>
              <h2 className="font-display text-xl font-semibold">{st.name}</h2>
              <p className="mt-1 text-sm text-ink-soft">{st.blurb}</p>
            </Link>
          );
        })}
      </div>
    </AppShell>
  );
}
