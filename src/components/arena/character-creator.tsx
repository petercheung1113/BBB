"use client";

import type { ReactNode } from "react";
import { AvatarBadge, accessoryLabel, hatLabel, speciesLabel } from "@/components/arena/avatar-badge";
import {
  ARENA_AVATAR_ACCESSORIES,
  ARENA_AVATAR_COLORS,
  ARENA_AVATAR_HATS,
  ARENA_AVATAR_SPECIES,
  DEFAULT_ARENA_AVATAR,
  type ArenaAvatar,
} from "@/lib/arena/types";
import { cn } from "@/lib/utils";

type Props = {
  value: ArenaAvatar;
  onChange: (next: ArenaAvatar) => void;
  className?: string;
};

function Chip({
  selected,
  onClick,
  children,
  className,
  label,
}: {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
  className?: string;
  label: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        "inline-flex h-11 min-w-11 items-center justify-center rounded-full border-2 font-display text-lg transition active:scale-95",
        selected
          ? "border-ink bg-ink text-paper shadow-pop"
          : "border-ink/12 bg-card text-ink hover:bg-paper-2",
        className,
      )}
    >
      {children}
    </button>
  );
}

const SPECIES_EMOJI: Record<ArenaAvatar["species"], string> = {
  fox: "🦊",
  cat: "🐱",
  robot: "🤖",
  blob: "🫧",
  star: "⭐",
};

const HAT_EMOJI: Record<ArenaAvatar["hat"], string> = {
  none: "🚫",
  wizard: "🧙",
  cap: "🧢",
  crown: "👑",
};

const ACC_EMOJI: Record<ArenaAvatar["accessory"], string> = {
  none: "🚫",
  scarf: "🧣",
  glasses: "👓",
  cape: "🦸",
};

export function CharacterCreator({ value, onChange, className }: Props) {
  const patch = (partial: Partial<ArenaAvatar>) => onChange({ ...value, ...partial });

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-col items-center gap-2 rounded-2xl border-2 border-ink/8 bg-paper-2/50 px-4 py-5">
        <p className="font-display text-xs font-semibold text-muted">你的角色預覽</p>
        <AvatarBadge avatar={value} size="xl" title="角色預覽" />
        <p className="font-display text-sm text-ink-soft">
          {speciesLabel(value.species)} · {hatLabel(value.hat)} · {accessoryLabel(value.accessory)}
        </p>
        <button
          type="button"
          className="text-xs font-display text-coral underline-offset-2 hover:underline"
          onClick={() => onChange({ ...DEFAULT_ARENA_AVATAR })}
        >
          用星仔造型（狐狸＋巫師帽）
        </button>
      </div>

      <fieldset className="space-y-2">
        <legend className="font-display text-sm font-semibold">種族</legend>
        <div className="flex flex-wrap gap-2">
          {ARENA_AVATAR_SPECIES.map((s) => (
            <Chip
              key={s}
              label={speciesLabel(s)}
              selected={value.species === s}
              onClick={() => patch({ species: s })}
            >
              {SPECIES_EMOJI[s]}
            </Chip>
          ))}
        </div>
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="font-display text-sm font-semibold">顏色</legend>
        <div className="flex flex-wrap gap-2">
          {ARENA_AVATAR_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              aria-label={`顏色 ${c}`}
              aria-pressed={value.color === c}
              onClick={() => patch({ color: c })}
              className={cn(
                "h-10 w-10 rounded-full border-2 transition active:scale-95",
                value.color === c ? "border-ink shadow-pop scale-110" : "border-ink/15",
              )}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="font-display text-sm font-semibold">帽子</legend>
        <div className="flex flex-wrap gap-2">
          {ARENA_AVATAR_HATS.map((h) => (
            <Chip
              key={h}
              label={hatLabel(h)}
              selected={value.hat === h}
              onClick={() => patch({ hat: h })}
            >
              {HAT_EMOJI[h]}
            </Chip>
          ))}
        </div>
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="font-display text-sm font-semibold">配件</legend>
        <div className="flex flex-wrap gap-2">
          {ARENA_AVATAR_ACCESSORIES.map((a) => (
            <Chip
              key={a}
              label={accessoryLabel(a)}
              selected={value.accessory === a}
              onClick={() => patch({ accessory: a })}
            >
              {ACC_EMOJI[a]}
            </Chip>
          ))}
        </div>
      </fieldset>
    </div>
  );
}
