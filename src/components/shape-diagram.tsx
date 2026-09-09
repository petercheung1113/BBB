import { fmt } from "@/lib/utils";
import type { Dims, ShapeId } from "@/lib/shapes";

type Props = {
  id: ShapeId;
  dims: Dims;
  showLabels?: boolean;
  showHeight?: boolean;
  showGrid?: boolean;
  highlight?: "outline" | "fill" | "height" | "none";
};

const VB = { w: 360, h: 240, pad: 36 };

export function ShapeDiagram({
  id,
  dims,
  showLabels = true,
  showHeight = false,
  showGrid = false,
  highlight = "fill",
}: Props) {
  const color = `var(--color-${short(id)})`;
  const ink = `var(--color-${short(id)}-ink)`;
  return (
    <svg viewBox={`0 0 ${VB.w} ${VB.h}`} className="h-auto w-full" role="img" aria-label="圖形示意">
      <rect width={VB.w} height={VB.h} fill="transparent" />
      {showGrid ? <Grid /> : null}
      {draw(id, dims, color, ink, showLabels, showHeight, highlight)}
    </svg>
  );
}

function short(id: ShapeId) {
  const map: Record<ShapeId, string> = {
    square: "sq",
    rectangle: "rect",
    triangle: "tri",
    circle: "circ",
    parallelogram: "para",
    rhombus: "rhom",
    trapezoid: "trap",
    hexagon: "hex",
  };
  return map[id];
}

function Grid() {
  const cells = [];
  for (let x = 20; x < VB.w; x += 16) {
    cells.push(
      <line key={`v${x}`} x1={x} y1={16} x2={x} y2={VB.h - 16} stroke="rgb(44 33 24 / 0.08)" />,
    );
  }
  for (let y = 16; y < VB.h; y += 16) {
    cells.push(
      <line key={`h${y}`} x1={20} y1={y} x2={VB.w - 20} y2={y} stroke="rgb(44 33 24 / 0.08)" />,
    );
  }
  return <g>{cells}</g>;
}

function Label({ x, y, children }: { x: number; y: number; children: string }) {
  return (
    <text
      x={x}
      y={y}
      textAnchor="middle"
      className="font-display"
      fill="var(--color-ink)"
      fontSize="13"
      fontWeight="600"
    >
      {children}
    </text>
  );
}

function scaleBox(w: number, h: number) {
  const maxW = VB.w - VB.pad * 2;
  const maxH = VB.h - VB.pad * 2 - 8;
  const s = Math.min(maxW / Math.max(w, 1), maxH / Math.max(h, 1), 22);
  const pw = w * s;
  const ph = h * s;
  const x = (VB.w - pw) / 2;
  const y = (VB.h - ph) / 2 + 6;
  return { s, pw, ph, x, y };
}

function draw(
  id: ShapeId,
  d: Dims,
  fill: string,
  ink: string,
  labels: boolean,
  height: boolean,
  highlight: Props["highlight"],
) {
  const stroke = highlight === "outline" ? ink : "rgb(44 33 24 / 0.22)";
  const sw = highlight === "outline" ? 5 : 2.5;
  const opacity = highlight === "none" ? 0.35 : 1;

  switch (id) {
    case "square": {
      const side = d.side ?? 5;
      const { pw, ph, x, y } = scaleBox(side, side);
      return (
        <g opacity={opacity}>
          <rect x={x} y={y} width={pw} height={ph} rx="6" fill={fill} stroke={stroke} strokeWidth={sw} />
          {labels ? (
            <>
              <Label x={x + pw / 2} y={y - 8}>{`邊長 ${fmt(side)} cm`}</Label>
              <Label x={x + pw / 2} y={y + ph + 20}>{`${fmt(side)} × ${fmt(side)} 格`}</Label>
            </>
          ) : null}
        </g>
      );
    }
    case "rectangle": {
      const L = d.length ?? 8;
      const W = d.width ?? 4;
      const { pw, ph, x, y } = scaleBox(L, W);
      return (
        <g opacity={opacity}>
          <rect x={x} y={y} width={pw} height={ph} rx="6" fill={fill} stroke={stroke} strokeWidth={sw} />
          {labels ? (
            <>
              <Label x={x + pw / 2} y={y - 8}>{`長 ${fmt(L)} cm`}</Label>
              <Label x={x - 4} y={y + ph / 2}>
                {""}
              </Label>
              <text
                x={x - 10}
                y={y + ph / 2}
                textAnchor="end"
                dominantBaseline="middle"
                className="font-display"
                fill="var(--color-ink)"
                fontSize="13"
                fontWeight="600"
              >
                {`闊 ${fmt(W)}`}
              </text>
            </>
          ) : null}
        </g>
      );
    }
    case "triangle": {
      const b = d.base ?? 8;
      const h = d.height ?? 5;
      const { pw, ph, x, y } = scaleBox(b, h);
      const p1 = `${x + pw / 2},${y}`;
      const p2 = `${x + pw},${y + ph}`;
      const p3 = `${x},${y + ph}`;
      return (
        <g opacity={opacity}>
          <polygon points={`${p1} ${p2} ${p3}`} fill={fill} stroke={stroke} strokeWidth={sw} />
          {height || labels ? (
            <line
              x1={x + pw / 2}
              y1={y}
              x2={x + pw / 2}
              y2={y + ph}
              stroke={ink}
              strokeWidth="2"
              strokeDasharray="5 4"
            />
          ) : null}
          {labels ? (
            <>
              <Label x={x + pw / 2} y={y + ph + 20}>{`底 ${fmt(b)} cm`}</Label>
              <text
                x={x + pw / 2 + 10}
                y={y + ph / 2}
                className="font-display"
                fill={ink}
                fontSize="13"
                fontWeight="600"
              >
                {`高 ${fmt(h)}`}
              </text>
            </>
          ) : null}
        </g>
      );
    }
    case "circle": {
      const r = d.radius ?? 4;
      const { s } = scaleBox(r * 2, r * 2);
      const cx = VB.w / 2;
      const cy = VB.h / 2 + 4;
      const pr = r * s;
      return (
        <g opacity={opacity}>
          <circle cx={cx} cy={cy} r={pr} fill={fill} stroke={stroke} strokeWidth={sw} />
          <line x1={cx} y1={cy} x2={cx + pr} y2={cy} stroke={ink} strokeWidth="2.5" />
          <circle cx={cx} cy={cy} r="3.5" fill={ink} />
          {labels ? (
            <>
              <Label x={cx + pr / 2} y={cy - 8}>{`半徑 ${fmt(r)} cm`}</Label>
              <Label x={cx} y={cy + pr + 22}>{`直徑 ${fmt(r * 2)} cm`}</Label>
            </>
          ) : null}
        </g>
      );
    }
    case "parallelogram": {
      const b = d.base ?? 9;
      const h = d.height ?? 5;
      const { pw, ph, x, y } = scaleBox(b + 2, h);
      const skew = Math.min(pw * 0.28, 46);
      return (
        <g opacity={opacity}>
          <polygon
            points={`${x + skew},${y} ${x + pw},${y} ${x + pw - skew},${y + ph} ${x},${y + ph}`}
            fill={fill}
            stroke={stroke}
            strokeWidth={sw}
          />
          <line
            x1={x + skew}
            y1={y}
            x2={x + skew}
            y2={y + ph}
            stroke={ink}
            strokeWidth="2"
            strokeDasharray="5 4"
          />
          {labels ? (
            <>
              <Label x={x + pw / 2} y={y + ph + 20}>{`底 ${fmt(b)} cm`}</Label>
              <text
                x={x + skew + 8}
                y={y + ph / 2}
                className="font-display"
                fill={ink}
                fontSize="13"
                fontWeight="600"
              >
                {`高 ${fmt(h)}`}
              </text>
            </>
          ) : null}
        </g>
      );
    }
    case "rhombus": {
      const d1 = d.diag1 ?? 8;
      const d2 = d.diag2 ?? 6;
      const { pw, ph, x, y } = scaleBox(d1, d2);
      const cx = x + pw / 2;
      const cy = y + ph / 2;
      return (
        <g opacity={opacity}>
          <polygon
            points={`${cx},${y} ${x + pw},${cy} ${cx},${y + ph} ${x},${cy}`}
            fill={fill}
            stroke={stroke}
            strokeWidth={sw}
          />
          <line x1={x} y1={cy} x2={x + pw} y2={cy} stroke={ink} strokeWidth="1.8" strokeDasharray="4 3" />
          <line x1={cx} y1={y} x2={cx} y2={y + ph} stroke={ink} strokeWidth="1.8" strokeDasharray="4 3" />
          {labels ? (
            <>
              <Label x={cx} y={y - 8}>{`對角線 ${fmt(d2)}`}</Label>
              <Label x={cx} y={y + ph + 20}>{`對角線 ${fmt(d1)} cm`}</Label>
            </>
          ) : null}
        </g>
      );
    }
    case "trapezoid": {
      const top = d.top ?? 5;
      const bot = d.bottom ?? 10;
      const h = d.height ?? 4;
      const maxB = Math.max(top, bot);
      const { pw, ph, x, y } = scaleBox(maxB, h);
      const topW = (top / maxB) * pw;
      const botW = (bot / maxB) * pw;
      const tx = x + (pw - topW) / 2;
      const bx = x + (pw - botW) / 2;
      return (
        <g opacity={opacity}>
          <polygon
            points={`${tx},${y} ${tx + topW},${y} ${bx + botW},${y + ph} ${bx},${y + ph}`}
            fill={fill}
            stroke={stroke}
            strokeWidth={sw}
          />
          <line
            x1={tx}
            y1={y}
            x2={tx}
            y2={y + ph}
            stroke={ink}
            strokeWidth="2"
            strokeDasharray="5 4"
          />
          {labels ? (
            <>
              <Label x={tx + topW / 2} y={y - 8}>{`上底 ${fmt(top)}`}</Label>
              <Label x={bx + botW / 2} y={y + ph + 20}>{`下底 ${fmt(bot)} cm`}</Label>
              <text
                x={tx + 8}
                y={y + ph / 2}
                className="font-display"
                fill={ink}
                fontSize="13"
                fontWeight="600"
              >
                {`高 ${fmt(h)}`}
              </text>
            </>
          ) : null}
        </g>
      );
    }
    case "hexagon": {
      const side = d.side ?? 4;
      const { s } = scaleBox(side * 2, side * 1.732);
      const cx = VB.w / 2;
      const cy = VB.h / 2 + 4;
      const r = side * s;
      const pts = Array.from({ length: 6 }, (_, i) => {
        const a = (Math.PI / 180) * (60 * i - 30);
        return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
      }).join(" ");
      const spokes = Array.from({ length: 6 }, (_, i) => {
        const a = (Math.PI / 180) * (60 * i - 30);
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={cx + r * Math.cos(a)}
            y2={cy + r * Math.sin(a)}
            stroke="rgb(255 255 255 / 0.45)"
            strokeWidth="1.4"
          />
        );
      });
      return (
        <g opacity={opacity}>
          <polygon points={pts} fill={fill} stroke={stroke} strokeWidth={sw} />
          {spokes}
          {labels ? <Label x={cx} y={cy + r + 18}>{`邊長 ${fmt(side)} cm`}</Label> : null}
        </g>
      );
    }
  }
}
