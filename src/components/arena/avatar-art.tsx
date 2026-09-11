"use client";

import type { ArenaAvatar } from "@/lib/arena/types";
import { cn } from "@/lib/utils";

const SPECIES_SRC: Record<ArenaAvatar["species"], string> = {
  fox: "/arena-avatars/fox.png",
  cat: "/arena-avatars/cat.png",
  robot: "/arena-avatars/robot.png",
  blob: "/arena-avatars/blob.png",
  star: "/arena-avatars/star.png",
};

const HAT_SRC: Record<Exclude<ArenaAvatar["hat"], "none">, string> = {
  wizard: "/arena-avatars/hat-wizard.png",
  cap: "/arena-avatars/hat-cap.png",
  crown: "/arena-avatars/hat-crown.png",
};

const INK = "#2a2118";

function mixHex(hex: string, toward: string, amount: number): string {
  const parse = (h: string) => {
    const n = h.replace("#", "");
    const full =
      n.length === 3
        ? n
            .split("")
            .map((c) => c + c)
            .join("")
        : n;
    return [
      parseInt(full.slice(0, 2), 16),
      parseInt(full.slice(2, 4), 16),
      parseInt(full.slice(4, 6), 16),
    ] as const;
  };
  const [r1, g1, b1] = parse(hex);
  const [r2, g2, b2] = parse(toward);
  const r = Math.round(r1 + (r2 - r1) * amount);
  const g = Math.round(g1 + (g2 - g1) * amount);
  const b = Math.round(b1 + (b2 - b1) * amount);
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

/** Approximate hue shift so the ring color also tints the character a bit. */
function hueFilter(hex: string): string {
  const n = hex.replace("#", "");
  const full =
    n.length === 3
      ? n
          .split("")
          .map((c) => c + c)
          .join("")
      : n;
  const r = parseInt(full.slice(0, 2), 16) / 255;
  const g = parseInt(full.slice(2, 4), 16) / 255;
  const b = parseInt(full.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  // Base art is roughly orange (~30deg). Shift toward chosen hue.
  const delta = Math.round(h - 30);
  return `hue-rotate(${delta}deg) saturate(1.15)`;
}

function ScarfOverlay({ color }: { color: string }) {
  const scarf = mixHex(color, "#ffffff", 0.1);
  const stripe = mixHex(color, "#000000", 0.2);
  return (
    <svg
      viewBox="0 0 120 120"
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden
    >
      <path
        d="M28 78 Q45 92 60 90 Q75 92 92 78 Q88 98 60 100 Q32 98 28 78 Z"
        fill={scarf}
        stroke={INK}
        strokeWidth={2.4}
        strokeLinejoin="round"
      />
      <path
        d="M72 92 L86 112 L78 114 L70 98 Z"
        fill={stripe}
        stroke={INK}
        strokeWidth={2}
        strokeLinejoin="round"
      />
      <path
        d="M66 94 L74 114 L66 116 L60 98 Z"
        fill={scarf}
        stroke={INK}
        strokeWidth={2}
        strokeLinejoin="round"
      />
    </svg>
  );
}

function GlassesOverlay() {
  return (
    <svg
      viewBox="0 0 120 120"
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden
    >
      <g stroke={INK} strokeWidth={2.6} fill="none">
        <circle cx={46} cy={58} r={12} />
        <circle cx={74} cy={58} r={12} />
        <line x1={58} y1={58} x2={62} y2={58} />
        <line x1={34} y1={56} x2={28} y2={54} />
        <line x1={86} y1={56} x2={92} y2={54} />
      </g>
      <circle cx={46} cy={58} r={12} fill="#7ec8e3" opacity={0.22} />
      <circle cx={74} cy={58} r={12} fill="#7ec8e3" opacity={0.22} />
    </svg>
  );
}

function CapeOverlay({ color }: { color: string }) {
  const cape = mixHex(color, "#5b1a8a", 0.35);
  return (
    <svg
      viewBox="0 0 120 120"
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden
      style={{ zIndex: 0 }}
    >
      <path
        d="M28 55 Q20 70 22 105 Q40 95 60 100 Q80 95 98 105 Q100 70 92 55 Q76 62 60 60 Q44 62 28 55 Z"
        fill={cape}
        stroke={INK}
        strokeWidth={2.6}
        strokeLinejoin="round"
        opacity={0.95}
      />
    </svg>
  );
}

/**
 * Designed animal mascots (PNG) + hat PNGs + SVG accessories.
 * Not emoji — custom Kahoot / anime style art in /public/arena-avatars/.
 */
export function AvatarArt({
  avatar,
  className,
}: {
  avatar: ArenaAvatar;
  className?: string;
}) {
  const { species, color, hat, accessory } = avatar;
  const bg = mixHex(color, "#ffffff", 0.55);

  return (
    <span
      className={cn("relative block h-full w-full overflow-hidden rounded-full", className)}
      style={{ backgroundColor: bg }}
    >
      {accessory === "cape" ? <CapeOverlay color={color} /> : null}

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={SPECIES_SRC[species]}
        alt=""
        draggable={false}
        className="relative z-[1] h-full w-full object-cover object-center select-none"
        style={{ filter: hueFilter(color) }}
      />

      {hat !== "none" ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={HAT_SRC[hat]}
          alt=""
          draggable={false}
          className={cn(
            "pointer-events-none absolute z-[3] select-none object-contain",
            hat === "wizard" && "left-[12%] top-[-6%] h-[58%] w-[76%]",
            hat === "cap" && "left-[14%] top-[-2%] h-[48%] w-[72%]",
            hat === "crown" && "left-[18%] top-[-4%] h-[46%] w-[64%]",
          )}
        />
      ) : null}

      {accessory === "scarf" ? (
        <span className="absolute inset-0 z-[4]">
          <ScarfOverlay color={color} />
        </span>
      ) : null}
      {accessory === "glasses" ? (
        <span className="absolute inset-0 z-[4]">
          <GlassesOverlay />
        </span>
      ) : null}
    </span>
  );
}

/** Slash-circle icon for “none” hat/accessory chips (no emoji). */
export function NoneIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn("h-6 w-6", className)}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <circle
        cx={12}
        cy={12}
        r={9}
        fill="none"
        stroke="currentColor"
        strokeWidth={2.2}
      />
      <line
        x1={7}
        y1={17}
        x2={17}
        y2={7}
        stroke="currentColor"
        strokeWidth={2.2}
        strokeLinecap="round"
      />
    </svg>
  );
}
