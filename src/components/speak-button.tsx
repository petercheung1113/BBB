"use client";

import { Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { speak } from "@/lib/speech";

export function SpeakButton({ text, label = "讀給我聽" }: { text: string; label?: string }) {
  return (
    <Button type="button" variant="ghost" size="sm" onClick={() => speak(text)} className="gap-1.5 text-ink-soft">
      <Volume2 className="size-4" />
      {label}
    </Button>
  );
}
