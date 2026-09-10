"use client";

import { AvatarBadge } from "@/components/arena/avatar-badge";
import type { ArenaPlayerPublic } from "@/lib/arena/types";
import { cn } from "@/lib/utils";

type Props = {
  players: ArenaPlayerPublic[];
  highlightId?: string | null;
  className?: string;
};

function ConfettiBits() {
  // Pure CSS confetti — no deps. Positions are fixed percentages for mobile.
  const bits = [
    { left: "8%", delay: "0s", color: "#f05a3a", rot: "12deg" },
    { left: "18%", delay: "0.15s", color: "#f0c43a", rot: "-20deg" },
    { left: "28%", delay: "0.05s", color: "#2f9e62", rot: "40deg" },
    { left: "42%", delay: "0.25s", color: "#7ec8e3", rot: "-8deg" },
    { left: "55%", delay: "0.1s", color: "#e86a9a", rot: "25deg" },
    { left: "68%", delay: "0.3s", color: "#5b7ae0", rot: "-30deg" },
    { left: "78%", delay: "0.18s", color: "#f0c43a", rot: "15deg" },
    { left: "88%", delay: "0.08s", color: "#f05a3a", rot: "-12deg" },
    { left: "12%", delay: "0.4s", color: "#6bb83a", rot: "5deg" },
    { left: "72%", delay: "0.35s", color: "#e8893a", rot: "-18deg" },
  ];
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {bits.map((b, i) => (
        <span
          key={i}
          className="arena-confetti-bit"
          style={{
            left: b.left,
            animationDelay: b.delay,
            backgroundColor: b.color,
            ["--arena-rot" as string]: b.rot,
          }}
        />
      ))}
    </div>
  );
}

function Platform({
  player,
  place,
  highlight,
}: {
  player: ArenaPlayerPublic;
  place: 1 | 2 | 3;
  highlight?: boolean;
}) {
  const heights = { 1: "h-28 sm:h-32", 2: "h-20 sm:h-24", 3: "h-16 sm:h-20" } as const;
  const colors = {
    1: "bg-sun/80 border-sun",
    2: "bg-sky-deep/40 border-sky-deep",
    3: "bg-coral/30 border-coral/60",
  } as const;
  const medals = { 1: "🥇", 2: "🥈", 3: "🥉" } as const;
  const order = { 1: "order-2", 2: "order-1", 3: "order-3" } as const;
  const delay = { 1: "arena-podium-enter-1", 2: "arena-podium-enter-2", 3: "arena-podium-enter-3" };

  return (
    <div
      className={cn(
        "flex w-[30%] max-w-[7.5rem] flex-col items-center",
        order[place],
        delay[place],
      )}
    >
      <div className="mb-2 flex flex-col items-center gap-1">
        <span className="text-2xl leading-none sm:text-3xl">{medals[place]}</span>
        <AvatarBadge avatar={player.avatar} size={place === 1 ? "lg" : "md"} />
        <p
          className={cn(
            "max-w-full truncate px-1 text-center font-display text-sm font-bold sm:text-base",
            highlight && "text-coral",
          )}
        >
          {player.nickname}
        </p>
        <p className="font-display text-xs tabular-nums text-ink-soft sm:text-sm">
          {player.score} 分
        </p>
      </div>
      <div
        className={cn(
          "flex w-full items-start justify-center rounded-t-xl border-2 border-b-0 pt-2 font-display text-2xl font-bold text-ink/70",
          heights[place],
          colors[place],
        )}
      >
        {place}
      </div>
    </div>
  );
}

export function Podium({ players, highlightId, className }: Props) {
  const top = players.slice(0, 3);
  const rest = players.slice(3);
  const first = top[0];
  const second = top[1];
  const third = top[2];

  return (
    <div className={cn("relative space-y-5", className)}>
      <div className="relative overflow-hidden rounded-2xl border-2 border-ink/8 bg-gradient-to-b from-sun/25 via-paper to-card px-3 pb-0 pt-6 sm:px-6">
        <ConfettiBits />
        <h3 className="relative z-[1] mb-4 text-center font-display text-2xl font-bold sm:text-3xl">
          🏆 頒獎典禮
        </h3>
        <p className="relative z-[1] mb-6 text-center text-sm text-ink-soft">最終排行榜</p>

        {players.length === 0 ? (
          <p className="relative z-[1] pb-8 text-center text-sm text-muted">還沒有選手分數</p>
        ) : (
          <div className="relative z-[1] flex items-end justify-center gap-2 sm:gap-4">
            {second ? (
              <Platform
                player={second}
                place={2}
                highlight={second.id === highlightId}
              />
            ) : (
              <div className="order-1 w-[30%]" />
            )}
            {first ? (
              <Platform player={first} place={1} highlight={first.id === highlightId} />
            ) : null}
            {third ? (
              <Platform player={third} place={3} highlight={third.id === highlightId} />
            ) : (
              <div className="order-3 w-[30%]" />
            )}
          </div>
        )}
      </div>

      {rest.length > 0 ? (
        <ul className="divide-y divide-ink/8 overflow-hidden rounded-xl border-2 border-ink/8 bg-card">
          {rest.map((p, idx) => (
            <li
              key={p.id}
              className={cn(
                "arena-list-enter flex items-center justify-between gap-3 px-4 py-3 font-display",
                p.id === highlightId && "bg-sun/30",
              )}
              style={{ animationDelay: `${0.45 + idx * 0.06}s` }}
            >
              <span className="flex min-w-0 items-center gap-3">
                <span className="w-8 shrink-0 text-center text-lg font-bold text-coral">
                  {idx + 4}
                </span>
                <AvatarBadge avatar={p.avatar} size="sm" />
                <span className="truncate font-semibold">{p.nickname}</span>
              </span>
              <span className="tabular-nums text-ink-soft">{p.score}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
