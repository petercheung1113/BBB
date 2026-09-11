"use client";

import { AvatarArt } from "@/components/arena/avatar-art";
import type { ArenaAvatar } from "@/lib/arena/types";
import { cn } from "@/lib/utils";

const SIZE = {
  sm: "h-8 w-8",
  md: "h-12 w-12",
  lg: "h-20 w-20",
  xl: "h-28 w-28",
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
  const ring =
    size === "sm" ? "border-2" : size === "md" ? "border-[3px]" : "border-4";

  return (
    <span
      title={title}
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full shadow-pop",
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
      <AvatarArt avatar={avatar} className="h-full w-full" />
    </span>
  );
}

/** Re-export for chip previews / convenience. */
export { AvatarArt } from "@/components/arena/avatar-art";

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
