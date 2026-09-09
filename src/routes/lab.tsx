"use client";

import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageTitle } from "@/components/app-shell";
import { DimLab } from "@/components/dim-lab";
import { Mascot, SpeechBubble } from "@/components/mascot";
import { ShapeBuddy } from "@/components/shape-buddy";
import { SHAPE_LIST, type ShapeId } from "@/lib/shapes";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/lab")({ component: LabPage });

function LabPage() {
  const [id, setId] = useState<ShapeId>("rectangle");
  const shape = useMemo(() => SHAPE_LIST.find((s) => s.id === id)!, [id]);
  const [dims, setDims] = useState(shape.defaults);

  function pick(next: ShapeId) {
    const s = SHAPE_LIST.find((x) => x.id === next)!;
    setId(next);
    setDims(s.defaults);
  }

  return (
    <AppShell>
      <div className="flex items-end gap-3">
        <Mascot mood="think" className="h-24 w-24 shrink-0" />
        <SpeechBubble className="mb-4 max-w-lg">
          拉動下面的尺子，圖形會跟着變。看着數字怎麼跳，公式就不再只是要背的句子。
        </SpeechBubble>
      </div>
      <PageTitle kicker="實驗場" title="拉一拉，算一算" subtitle="周界和面積會即時更新。試着把長方形拉成正方形，看看兩個公式會不會碰到一起。" />

      <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
        {SHAPE_LIST.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => pick(s.id)}
            className={cn(
              "flex min-w-20 shrink-0 flex-col items-center rounded-lg border-2 px-2 py-2",
              s.id === id ? "border-ink bg-card shadow-pop" : "border-transparent bg-card/70",
            )}
          >
            <ShapeBuddy id={s.id} className="size-12" />
            <span className="mt-1 font-display text-xs font-semibold">{s.name}</span>
          </button>
        ))}
      </div>

      <div className="rounded-xl border-2 border-ink/8 bg-card p-4 shadow-card sm:p-6">
        <h2 className="mb-4 font-display text-xl font-semibold">{shape.name}小實驗</h2>
        <DimLab shape={shape} dims={dims} onChange={setDims} showGrid />
      </div>
    </AppShell>
  );
}
