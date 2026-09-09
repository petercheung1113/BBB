import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type MascotMood = "wave" | "cheer" | "think";

const SRC: Record<MascotMood, string> = {
  wave: "/characters/starry-wave.jpg",
  cheer: "/characters/starry-cheer.jpg",
  think: "/characters/starry-think.jpg",
};

export function Mascot({
  mood = "wave",
  className,
  alt = "星仔",
}: {
  mood?: MascotMood;
  className?: string;
  alt?: string;
}) {
  return (
    <span
      className={cn(
        "relative inline-block overflow-hidden rounded-full border-2 border-ink/10 bg-paper shadow-pop",
        className,
      )}
    >
      <img
        src={SRC[mood]}
        alt={alt}
        className="pointer-events-none h-full w-full scale-110 select-none object-cover object-[center_40%]"
        draggable={false}
      />
    </span>
  );
}

export function SpeechBubble({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative rounded-xl border-2 border-ink/10 bg-card px-4 py-3 text-sm leading-relaxed text-ink shadow-soft",
        className,
      )}
    >
      {children}
      <span className="absolute -left-2 bottom-5 size-4 rotate-45 border-b-2 border-l-2 border-ink/10 bg-card" />
    </div>
  );
}
