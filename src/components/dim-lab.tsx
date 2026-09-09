"use client";

import { ShapeDiagram } from "@/components/shape-diagram";
import { Slider } from "@/components/ui/slider";
import {
  areaOf,
  perimeterOf,
  pluggedFormula,
  type Dims,
  type ShapeDef,
} from "@/lib/shapes";
import { fmt } from "@/lib/utils";

export function DimLab({
  shape,
  dims,
  onChange,
  showGrid = false,
}: {
  shape: ShapeDef;
  dims: Dims;
  onChange: (next: Dims) => void;
  showGrid?: boolean;
}) {
  const peri = perimeterOf(shape.id, dims);
  const area = areaOf(shape.id, dims);

  return (
    <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
      <div className="rounded-lg bg-paper-2/70 p-3">
        <ShapeDiagram id={shape.id} dims={dims} showHeight showGrid={showGrid} />
      </div>
      <div className="flex flex-col gap-4">
        {shape.lab.map((field) => {
          const v = dims[field.key] ?? field.min;
          return (
            <label key={field.key} className="block">
              <div className="mb-2 flex items-baseline justify-between gap-3">
                <span className="font-display text-sm font-semibold">{field.label}</span>
                <span className="font-display tabular-nums text-coral">
                  {fmt(v)} {field.unit}
                </span>
              </div>
              <Slider
                min={field.min}
                max={field.max}
                step={field.step}
                value={[v]}
                onValueChange={([nv]) => onChange({ ...dims, [field.key]: nv })}
                aria-label={field.label}
              />
            </label>
          );
        })}
        <div className="mt-1 grid gap-2">
          <FormulaChip
            title="周界"
            formula={shape.perimeter.formula}
            plugged={pluggedFormula(shape.id, dims, "perimeter")}
            value={`${fmt(peri)} 厘米`}
          />
          <FormulaChip
            title="面積"
            formula={shape.area.formula}
            plugged={pluggedFormula(shape.id, dims, "area")}
            value={`${fmt(area)} 平方厘米`}
          />
        </div>
      </div>
    </div>
  );
}

function FormulaChip({
  title,
  formula,
  plugged,
  value,
}: {
  title: string;
  formula: string;
  plugged: string;
  value: string;
}) {
  return (
    <div className="rounded-md border-2 border-ink/8 bg-card px-3 py-2.5">
      <p className="text-xs font-medium text-muted">{title}</p>
      <p className="font-display text-sm text-ink-soft">{formula}</p>
      <p className="mt-0.5 font-display text-sm">
        = {plugged} = <span className="text-coral">{value}</span>
      </p>
    </div>
  );
}
