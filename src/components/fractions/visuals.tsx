"use client";

import { cn } from "@/lib/utils";

const FILL = "#f05a3a";
const EMPTY = "#fff7ea";
const STROKE = "rgba(34,28,24,0.18)";

/** Horizontal bar split into n equal parts; first k shaded (or custom mask). */
export function FractionBar({
  parts,
  shaded,
  shadedSet,
  onToggle,
  className,
  accent = FILL,
}: {
  parts: number;
  shaded?: number;
  shadedSet?: Set<number>;
  onToggle?: (i: number) => void;
  className?: string;
  accent?: string;
}) {
  const w = 240;
  const h = 56;
  const gap = 3;
  const cell = (w - gap * (parts - 1)) / parts;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={cn("w-full max-w-sm", className)} aria-hidden>
      {Array.from({ length: parts }, (_, i) => {
        const on = shadedSet ? shadedSet.has(i) : i < (shaded ?? 0);
        const x = i * (cell + gap);
        return (
          <rect
            key={i}
            x={x}
            y={4}
            width={cell}
            height={h - 8}
            rx={8}
            fill={on ? accent : EMPTY}
            stroke={STROKE}
            strokeWidth={2}
            className={onToggle ? "cursor-pointer" : undefined}
            onClick={onToggle ? () => onToggle(i) : undefined}
          />
        );
      })}
    </svg>
  );
}

/** Pizza / circle slice fraction. */
export function FractionCircle({
  parts,
  shaded,
  shadedSet,
  onToggle,
  className,
  accent = FILL,
  size = 160,
}: {
  parts: number;
  shaded?: number;
  shadedSet?: Set<number>;
  onToggle?: (i: number) => void;
  className?: string;
  accent?: string;
  size?: number;
}) {
  const r = size / 2 - 4;
  const cx = size / 2;
  const cy = size / 2;
  const slices = Array.from({ length: parts }, (_, i) => {
    const a0 = (i / parts) * Math.PI * 2 - Math.PI / 2;
    const a1 = ((i + 1) / parts) * Math.PI * 2 - Math.PI / 2;
    const x0 = cx + r * Math.cos(a0);
    const y0 = cy + r * Math.sin(a0);
    const x1 = cx + r * Math.cos(a1);
    const y1 = cy + r * Math.sin(a1);
    const large = parts === 1 ? 1 : 0;
    const d =
      parts === 1
        ? `M ${cx} ${cy} m 0 ${-r} a ${r} ${r} 0 1 1 0 ${r * 2} a ${r} ${r} 0 1 1 0 ${-r * 2}`
        : `M ${cx} ${cy} L ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1} Z`;
    const on = shadedSet ? shadedSet.has(i) : i < (shaded ?? 0);
    return (
      <path
        key={i}
        d={d}
        fill={on ? accent : EMPTY}
        stroke={STROKE}
        strokeWidth={2}
        className={onToggle ? "cursor-pointer" : undefined}
        onClick={onToggle ? () => onToggle(i) : undefined}
      />
    );
  });
  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      className={cn("mx-auto", className)}
      aria-hidden
    >
      {slices}
    </svg>
  );
}

/** Unequal cake slices for fair-share demos. */
export function UnequalCake({
  ratios,
  highlight,
  selected,
  onSelect,
  className,
}: {
  ratios: number[];
  highlight?: boolean;
  selected?: boolean;
  onSelect?: () => void;
  className?: string;
}) {
  const size = 140;
  const r = size / 2 - 4;
  const cx = size / 2;
  const cy = size / 2;
  const total = ratios.reduce((a, b) => a + b, 0);
  let angle = -Math.PI / 2;
  const colors = ["#f05a3a", "#f0c43a", "#3a9a6a", "#5a7af0", "#c05af0"];
  const paths = ratios.map((ratio, i) => {
    const sweep = (ratio / total) * Math.PI * 2;
    const a0 = angle;
    const a1 = angle + sweep;
    angle = a1;
    const x0 = cx + r * Math.cos(a0);
    const y0 = cy + r * Math.sin(a0);
    const x1 = cx + r * Math.cos(a1);
    const y1 = cy + r * Math.sin(a1);
    const large = sweep > Math.PI ? 1 : 0;
    const d = `M ${cx} ${cy} L ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1} Z`;
    return <path key={i} d={d} fill={colors[i % colors.length]} stroke={STROKE} strokeWidth={2} />;
  });
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "rounded-2xl border-2 p-2 transition-transform active:scale-[0.98]",
        selected ? "border-coral bg-coral/10 shadow-pop" : "border-ink/8 bg-card",
        highlight && selected ? "ring-2 ring-leaf" : "",
        className,
      )}
    >
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} aria-hidden>
        {paths}
      </svg>
    </button>
  );
}

export function FractionGlyph({
  num,
  den,
  className,
}: {
  num: number | string;
  den: number | string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex flex-col items-center font-display text-2xl font-semibold leading-none tabular-nums",
        className,
      )}
    >
      <span>{num}</span>
      <span className="my-0.5 h-0.5 w-8 bg-ink" />
      <span>{den}</span>
    </span>
  );
}
