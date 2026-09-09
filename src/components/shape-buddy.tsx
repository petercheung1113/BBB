import type { ShapeId } from "@/lib/shapes";

const FACE = (
  <>
    <ellipse cx="-7" cy="-2" rx="4.2" ry="5" fill="#fff" />
    <ellipse cx="7" cy="-2" rx="4.2" ry="5" fill="#fff" />
    <circle cx="-6" cy="-1" r="2.1" fill="#2c2118" />
    <circle cx="8" cy="-1" r="2.1" fill="#2c2118" />
    <circle cx="-5.2" cy="-2.1" r="0.7" fill="#fff" />
    <circle cx="8.8" cy="-2.1" r="0.7" fill="#fff" />
    <path d="M-6 8 Q0 13 6 8" fill="none" stroke="#2c2118" strokeWidth="1.6" strokeLinecap="round" />
    <circle cx="-11" cy="6" r="2.2" fill="#ff9aa0" opacity="0.7" />
    <circle cx="11" cy="6" r="2.2" fill="#ff9aa0" opacity="0.7" />
  </>
);

export function ShapeBuddy({
  id,
  className,
}: {
  id: ShapeId;
  className?: string;
}) {
  const color = `var(--color-${short(id)})`;
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
      <defs>
        <filter id={`s-${id}`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="2" floodOpacity="0.18" />
        </filter>
      </defs>
      <g filter={`url(#s-${id})`}>{body(id, color)}</g>
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

function body(id: ShapeId, fill: string) {
  switch (id) {
    case "square":
      return (
        <g>
          <rect x="22" y="22" width="76" height="76" rx="10" fill={fill} />
          <g transform="translate(60 58)">{FACE}</g>
        </g>
      );
    case "rectangle":
      return (
        <g>
          <rect x="14" y="34" width="92" height="54" rx="10" fill={fill} />
          <g transform="translate(60 60)">{FACE}</g>
        </g>
      );
    case "triangle":
      return (
        <g>
          <polygon points="60,16 108,100 12,100" fill={fill} />
          <g transform="translate(60 72)">{FACE}</g>
        </g>
      );
    case "circle":
      return (
        <g>
          <circle cx="60" cy="60" r="42" fill={fill} />
          <g transform="translate(60 58)">{FACE}</g>
        </g>
      );
    case "parallelogram":
      return (
        <g>
          <polygon points="32,32 108,32 88,92 12,92" fill={fill} />
          <g transform="translate(60 60)">{FACE}</g>
        </g>
      );
    case "rhombus":
      return (
        <g>
          <polygon points="60,12 108,60 60,108 12,60" fill={fill} />
          <g transform="translate(60 58)">{FACE}</g>
        </g>
      );
    case "trapezoid":
      return (
        <g>
          <polygon points="34,34 86,34 110,94 10,94" fill={fill} />
          <g transform="translate(60 66)">{FACE}</g>
        </g>
      );
    case "hexagon":
      return (
        <g>
          <polygon points="60,14 102,37 102,83 60,106 18,83 18,37" fill={fill} />
          <g transform="translate(60 58)">{FACE}</g>
        </g>
      );
  }
}
