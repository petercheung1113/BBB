"use client";

import type { ArenaAvatar } from "@/lib/arena/types";
import { cn } from "@/lib/utils";

const SPECIES_EMOJI: Record<ArenaAvatar["species"], string> = {
  fox: "🦊",
  cat: "🐱",
  robot: "🤖",
  blob: "🫧",
  star: "⭐",
};

const HAT_EMOJI: Record<Exclude<ArenaAvatar["hat"], "none">, string> = {
  wizard: "🧙",
  cap: "🧢",
  crown: "👑",
};

const ACC_EMOJI: Record<Exclude<ArenaAvatar["accessory"], "none">, string> = {
  scarf: "🧣",
  glasses: "👓",
  cape: "🦸",
};

const SIZE = {
  sm: "h-8 w-8 text-base",
  md: "h-12 w-12 text-2xl",
  lg: "h-20 w-20 text-4xl",
  xl: "h-28 w-28 text-5xl",
} as const;

type Size = keyof typeof SIZE;

export function AvatarBadge({
  avatar,
  size = "sm",
  className,
  title,
}: {
  avatar: ArenaAvatar;
  size?: Size;
  className?: string;
  title?: string;
}) {
  const hat = avatar.hat !== "none" ? HAT_EMOJI[avatar.hat] : null;
  const acc = avatar.accessory !== "none" ? ACC_EMOJI[avatar.accessory] : null;
  const ring =
    size === "sm" ? "border-2" : size === "md" ? "border-[3px]" : "border-4";

  return (
    <span
      title={title}
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center rounded-full shadow-pop",
        ring,
        "border-ink/15",
        SIZE[size],
        className,
      )}
      style={{ backgroundColor: avatar.color }}
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
      aria-label={title}
    >
      <span className="select-none leading-none drop-shadow-sm">
        {SPECIES_EMOJI[avatar.species]}
      </span>
      {hat ? (
        <span
          className={cn(
            "pointer-events-none absolute select-none leading-none",
            size === "sm" && "-top-2 right-[-2px] text-[0.65rem]",
            size === "md" && "-top-2.5 right-0 text-sm",
            size === "lg" && "-top-3 right-0 text-xl",
            size === "xl" && "-top-4 right-1 text-2xl",
          )}
        >
          {hat}
        </span>
      ) : null}
      {acc ? (
        <span
          className={cn(
            "pointer-events-none absolute select-none leading-none",
            size === "sm" && "-bottom-1 left-[-2px] text-[0.6rem]",
            size === "md" && "-bottom-1.5 left-0 text-xs",
            size === "lg" && "-bottom-2 left-0 text-lg",
            size === "xl" && "-bottom-3 left-1 text-xl",
          )}
        >
          {acc}
        </span>
      ) : null}
    </span>
  );
}

export function speciesLabel(species: ArenaAvatar["species"]): string {
  switch (species) {
    case "fox":
      return "狐狸";
    case "cat":
      return "貓咪";
    case "robot":
      return "機器人";
    case "blob":
      return "軟泥";
    case "star":
      return "星星";
  }
}

export function hatLabel(hat: ArenaAvatar["hat"]): string {
  switch (hat) {
    case "none":
      return "無帽";
    case "wizard":
      return "巫師帽";
    case "cap":
      return "棒球帽";
    case "crown":
      return "皇冠";
  }
}

export function accessoryLabel(acc: ArenaAvatar["accessory"]): string {
  switch (acc) {
    case "none":
      return "無配件";
    case "scarf":
      return "圍巾";
    case "glasses":
      return "眼鏡";
    case "cape":
      return "披風";
  }
}
