"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ShapeId } from "@/lib/shapes";

type Step = { title: string; body: string };

const PROOFS: Record<ShapeId, Step[]> = {
  square: [
    { title: "把地面鋪上小格子", body: "面積就是圖形蓋住多少個 1 厘米 × 1 厘米的小正方形。" },
    { title: "數一數有幾行、每行幾格", body: "邊長是幾，就有幾行、每行幾格。例如邊長 4，就是 4 × 4 = 16 格。" },
    { title: "所以面積 = 邊長 × 邊長", body: "不用真的一格格數，把邊長乘自己就得到總格數。" },
  ],
  rectangle: [
    { title: "同樣先鋪格子", body: "長告訴我們每行有幾格，闊告訴我們有幾行。" },
    { title: "總格數 = 每行 × 行數", body: "例如長 6、闊 3，就是 3 行、每行 6 格，一共 18 格。" },
    { title: "所以面積 = 長 × 闊", body: "周界是走一圈的長度；面積才是這些格子加起來的地。" },
  ],
  triangle: [
    { title: "先看一個三角形", body: "底是你選的那條邊，高是從對面頂點垂直落到這條底的距離。" },
    { title: "再拿一個一模一樣的，倒過來", body: "兩個相同的三角形可以緊緊拼成一個平行四邊形（看起來像被推斜的長方形）。" },
    { title: "平行四邊形面積是底 × 高", body: "兩個三角形平分這塊地，所以一個只要一半：底 × 高 ÷ 2。" },
  ],
  circle: [
    { title: "把圓像蛋糕一樣切開", body: "切成很多薄薄的扇形。扇形愈薄，下一步就愈像長方形。" },
    { title: "一上一下排成一列", body: "排好之後，外形接近長方形：闊大約是半徑 r，長大約是圓周的一半 πr。" },
    { title: "長 × 闊 = πr × r", body: "所以圓面積 = π × 半徑 × 半徑。π 大約是 3.14。" },
  ],
  parallelogram: [
    { title: "平行四邊形看起來是斜的", body: "但裏面的『地』其實和一個長方形一樣多。" },
    { title: "剪下左邊的直角三角形", body: "把它搬到右邊貼上。邊沒有少，只是搬家。" },
    { title: "變成了長方形", body: "長方形的長就是底，闊就是高，面積不變。所以面積 = 底 × 高。記住：高要垂直量，不是沿着斜邊。" },
  ],
  rhombus: [
    { title: "菱形四邊相等，像推斜的正方形", body: "它也是平行四邊形，所以可以用底 × 高。" },
    { title: "兩條對角線互相垂直平分", body: "它們把菱形分成四個直角三角形，像一個十字。" },
    { title: "拼成長方形", body: "長和闊正好是兩條對角線的一半，面積 = 對角線① × 對角線② ÷ 2。" },
  ],
  trapezoid: [
    { title: "梯形只有一對平行邊", body: "短的叫上底，長的叫下底，中間直直的距離是高。" },
    { title: "再拿一個一模一樣的，倒過來拼", body: "兩個梯形會變成一個平行四邊形，底是『上底 + 下底』。" },
    { title: "一個只要一半", body: "平行四邊形面積 = (上底 + 下底) × 高，所以一個梯形要再除以 2。也可以想成『平均底』乘高。" },
  ],
  hexagon: [
    { title: "從中心連到六個頂點", body: "正六邊形會被分成 6 個完全一樣的等邊三角形。" },
    { title: "每個三角形的邊長 = 六邊形的邊長", body: "先算一個等邊三角形的面積（底 × 高 ÷ 2），再乘 6。" },
    { title: "這就是面積的原理", body: "不必死記 2.598。看見蜂巢，就想起『六個三角形手拉手』。" },
  ],
};

export function ProofPlayer({ id }: { id: ShapeId }) {
  const steps = PROOFS[id];
  const [i, setI] = useState(0);
  const step = steps[i];

  return (
    <div className="overflow-hidden rounded-lg border-2 border-ink/8 bg-paper-2/60">
      <div className="relative min-h-52 bg-card px-3 pt-4 sm:min-h-60">
        <ProofScene id={id} step={i} />
        <div className="absolute right-3 top-3 rounded-full bg-ink/80 px-2.5 py-0.5 font-display text-xs text-paper">
          {i + 1} / {steps.length}
        </div>
      </div>
      <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1">
          <p className="font-display text-base font-semibold">{step.title}</p>
          <p className="mt-1 text-sm leading-relaxed text-ink-soft">{step.body}</p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="上一步"
            disabled={i === 0}
            onClick={() => setI((v) => Math.max(0, v - 1))}
          >
            <ChevronLeft />
          </Button>
          <Button
            type="button"
            variant="leaf"
            size="icon"
            aria-label="下一步"
            disabled={i === steps.length - 1}
            onClick={() => setI((v) => Math.min(steps.length - 1, v + 1))}
          >
            <ChevronRight />
          </Button>
        </div>
      </div>
    </div>
  );
}

function ProofScene({ id, step }: { id: ShapeId; step: number }) {
  switch (id) {
    case "square":
      return <GridProof cols={4} rows={4} reveal={step} />;
    case "rectangle":
      return <GridProof cols={6} rows={3} reveal={step} />;
    case "triangle":
      return <TriangleProof step={step} />;
    case "circle":
      return <CircleProof step={step} />;
    case "parallelogram":
      return <ParaProof step={step} />;
    case "rhombus":
      return <RhombusProof step={step} />;
    case "trapezoid":
      return <TrapProof step={step} />;
    case "hexagon":
      return <HexProof step={step} />;
  }
}

function GridProof({ cols, rows, reveal }: { cols: number; rows: number; reveal: number }) {
  const size = 22;
  const w = cols * size;
  const h = rows * size;
  const shown = reveal === 0 ? 0 : reveal === 1 ? cols : cols * rows;
  let n = 0;
  const cells = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      n += 1;
      cells.push(
        <rect
          key={`${r}-${c}`}
          x={c * size}
          y={r * size}
          width={size - 2}
          height={size - 2}
          rx="3"
          fill={n <= shown ? "var(--color-sun)" : "var(--color-paper-3)"}
          stroke="rgb(44 33 24 / 0.2)"
        />,
      );
    }
  }
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="mx-auto h-44 w-auto">
      {cells}
    </svg>
  );
}

function TriangleProof({ step }: { step: number }) {
  return (
    <svg viewBox="0 0 360 180" className="mx-auto h-44 w-full">
      <polygon points="40,150 160,150 40,40" fill="var(--color-tri)" stroke="var(--color-tri-ink)" strokeWidth="2.5" />
      <line x1="40" y1="40" x2="40" y2="150" stroke="var(--color-tri-ink)" strokeDasharray="4 3" />
      {step >= 1 ? (
        <polygon
          points="160,150 280,150 280,40"
          fill="var(--color-tri)"
          opacity={step >= 2 ? 0.85 : 0.5}
          stroke="var(--color-tri-ink)"
          strokeWidth="2.5"
        />
      ) : null}
      {step >= 2 ? (
        <text x="180" y="24" textAnchor="middle" className="font-display" fontSize="14" fontWeight="700" fill="var(--color-ink)">
          兩個三角形 = 一個平行四邊形
        </text>
      ) : null}
    </svg>
  );
}

function CircleProof({ step }: { step: number }) {
  const slices = 8;
  if (step === 0) {
    const lines = Array.from({ length: slices }, (_, i) => {
      const a = ((Math.PI * 2) / slices) * i - Math.PI / 2;
      return (
        <line
          key={i}
          x1="180"
          y1="90"
          x2={180 + 70 * Math.cos(a)}
          y2={90 + 70 * Math.sin(a)}
          stroke="rgb(255 255 255 / 0.7)"
          strokeWidth="1.5"
        />
      );
    });
    return (
      <svg viewBox="0 0 360 180" className="mx-auto h-44 w-full">
        <circle cx="180" cy="90" r="70" fill="var(--color-circ)" stroke="var(--color-circ-ink)" strokeWidth="2.5" />
        {lines}
        <circle cx="180" cy="90" r="3" fill="var(--color-circ-ink)" />
      </svg>
    );
  }
  const w = 28;
  const h = 70;
  const rects = Array.from({ length: slices }, (_, i) => {
    const x = 68 + i * (w + 2);
    const flip = i % 2 === 1;
    return (
      <path
        key={i}
        d={
          flip
            ? `M${x} ${90 - h / 2 + 8} L${x + w} ${90 - h / 2} L${x + w} ${90 + h / 2} L${x} ${90 + h / 2 - 8} Z`
            : `M${x} ${90 - h / 2} L${x + w} ${90 - h / 2 + 8} L${x + w} ${90 + h / 2 - 8} L${x} ${90 + h / 2} Z`
        }
        fill="var(--color-circ)"
        stroke="var(--color-circ-ink)"
        strokeWidth="1.4"
      />
    );
  });
  return (
    <svg viewBox="0 0 360 180" className="mx-auto h-44 w-full">
      {rects}
      {step >= 2 ? (
        <>
          <text x="180" y="28" textAnchor="middle" className="font-display" fontSize="14" fontWeight="700" fill="var(--color-ink)">
            長 ≈ πr　　闊 = r
          </text>
          <text x="180" y="168" textAnchor="middle" className="font-display" fontSize="13" fill="var(--color-ink-soft)">
            面積 ≈ πr × r
          </text>
        </>
      ) : null}
    </svg>
  );
}

function ParaProof({ step }: { step: number }) {
  return (
    <svg viewBox="0 0 360 180" className="mx-auto h-44 w-full">
      <polygon
        points="70,40 250,40 210,140 30,140"
        fill="var(--color-para)"
        stroke="var(--color-para-ink)"
        strokeWidth="2.5"
      />
      <line x1="70" y1="40" x2="70" y2="140" stroke="var(--color-para-ink)" strokeDasharray="4 3" />
      {step >= 1 ? (
        <polygon
          points="30,140 70,40 70,140"
          fill="var(--color-sun)"
          opacity="0.85"
          stroke="var(--color-para-ink)"
          strokeWidth="2"
        />
      ) : null}
      {step >= 2 ? (
        <polygon
          points="250,40 290,140 250,140"
          fill="var(--color-sun)"
          opacity="0.9"
          stroke="var(--color-para-ink)"
          strokeWidth="2"
        />
      ) : null}
      {step >= 2 ? (
        <text x="180" y="24" textAnchor="middle" className="font-display" fontSize="14" fontWeight="700" fill="var(--color-ink)">
          搬過去，變成長方形
        </text>
      ) : null}
    </svg>
  );
}

function RhombusProof({ step }: { step: number }) {
  return (
    <svg viewBox="0 0 360 180" className="mx-auto h-44 w-full">
      <polygon points="180,20 300,90 180,160 60,90" fill="var(--color-rhom)" stroke="var(--color-rhom-ink)" strokeWidth="2.5" />
      {step >= 1 ? (
        <>
          <line x1="60" y1="90" x2="300" y2="90" stroke="var(--color-rhom-ink)" strokeWidth="2" />
          <line x1="180" y1="20" x2="180" y2="160" stroke="var(--color-rhom-ink)" strokeWidth="2" />
        </>
      ) : null}
      {step >= 2 ? (
        <text x="180" y="176" textAnchor="middle" className="font-display" fontSize="13" fontWeight="700" fill="var(--color-ink)">
          面積 = 對角線相乘 ÷ 2
        </text>
      ) : null}
    </svg>
  );
}

function TrapProof({ step }: { step: number }) {
  return (
    <svg viewBox="0 0 360 180" className="mx-auto h-44 w-full">
      <polygon points="90,50 190,50 230,140 50,140" fill="var(--color-trap)" stroke="var(--color-trap-ink)" strokeWidth="2.5" />
      {step >= 1 ? (
        <polygon
          points="190,50 310,50 270,140 230,140"
          fill="var(--color-trap)"
          opacity="0.55"
          stroke="var(--color-trap-ink)"
          strokeWidth="2.5"
        />
      ) : null}
      {step >= 2 ? (
        <text x="180" y="28" textAnchor="middle" className="font-display" fontSize="14" fontWeight="700" fill="var(--color-ink)">
          兩個梯形 = 一個平行四邊形
        </text>
      ) : null}
    </svg>
  );
}

function HexProof({ step }: { step: number }) {
  const cx = 180;
  const cy = 90;
  const r = 70;
  const pts = Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 180) * (60 * i - 30);
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as const;
  });
  const triangles =
    step >= 1
      ? pts.map((p, i) => {
          const n = pts[(i + 1) % 6];
          return (
            <polygon
              key={i}
              points={`${cx},${cy} ${p[0]},${p[1]} ${n[0]},${n[1]}`}
              fill={i % 2 === 0 ? "var(--color-hex)" : "#8aa4f0"}
              stroke="var(--color-hex-ink)"
              strokeWidth="1.4"
            />
          );
        })
      : null;
  return (
    <svg viewBox="0 0 360 180" className="mx-auto h-44 w-full">
      {step === 0 ? (
        <polygon
          points={pts.map((p) => p.join(",")).join(" ")}
          fill="var(--color-hex)"
          stroke="var(--color-hex-ink)"
          strokeWidth="2.5"
        />
      ) : (
        triangles
      )}
      {step >= 2 ? (
        <text x="180" y="176" textAnchor="middle" className="font-display" fontSize="13" fontWeight="700" fill="var(--color-ink)">
          6 個等邊三角形
        </text>
      ) : null}
    </svg>
  );
}
