"use client";

import { createFileRoute, Link } from "@tanstack/react-router";
import { Star } from "lucide-react";
import { AppShell, PageTitle } from "@/components/app-shell";
import { Mascot, SpeechBubble } from "@/components/mascot";
import { Badge } from "@/components/ui/badge";
import { PACK_META, QUIZ_PACKS } from "@/lib/quiz";
import { useProgress } from "@/lib/progress";

export const Route = createFileRoute("/practice")({ component: PracticeHome });

function PracticeHome() {
  const quizBest = useProgress((s) => s.quizBest);

  return (
    <AppShell>
      <div className="flex items-end gap-3">
        <Mascot mood="cheer" className="h-28 w-28 shrink-0" />
        <SpeechBubble className="mb-6 max-w-lg">
          選一場挑戰吧！答完會立刻看到解釋。全對的話，王國會記住你的星星。
        </SpeechBubble>
      </div>
      <PageTitle kicker="挑戰廣場" title="考考自己" subtitle="由認圖形開始，再到周界、面積，最後挑戰『為什麼這樣算』。" />
      <div className="grid gap-3 sm:grid-cols-2">
        {QUIZ_PACKS.map((pack) => {
          const meta = PACK_META[pack];
          const best = quizBest[pack];
          return (
            <Link
              key={pack}
              to="/practice/$pack"
              params={{ pack }}
              className="rounded-xl border-2 border-ink/8 bg-card p-5 shadow-card transition-transform duration-150 hover:-translate-y-0.5"
            >
              <div className="mb-3 size-10 rounded-full" style={{ background: meta.accent }} />
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-display text-xl font-semibold">{meta.title}</h2>
                  <p className="mt-1 text-sm text-muted">{meta.blurb}</p>
                </div>
                {best ? (
                  <Badge variant="sun">
                    <Star className="mr-1 size-3 fill-coral text-coral" />
                    {best.score}/{best.total}
                  </Badge>
                ) : (
                  <Badge variant="outline">尚未挑戰</Badge>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </AppShell>
  );
}
