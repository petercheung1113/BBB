"use client";

import { useEffect, useState } from "react";
import { Mascot } from "@/components/mascot";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProgress } from "@/lib/progress";

export function Onboarding() {
  const onboarded = useProgress((s) => s.onboarded);
  const finish = useProgress((s) => s.finishOnboarding);
  const [name, setName] = useState("");
  const [hello, setHello] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  if (!ready || onboarded) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/45 p-4 sm:items-center">
      <div className="enter w-full max-w-md overflow-hidden rounded-2xl border-2 border-ink/10 bg-paper shadow-card">
        <div className="bg-paper px-5 pt-6">
          <Mascot mood={hello ? "cheer" : "wave"} className="mx-auto h-40 w-40" />
        </div>
        <div className="p-5">
          {!hello ? (
            <>
              <p className="font-display text-xs font-semibold tracking-wider text-coral">歡迎來到</p>
              <h2 className="mt-1 font-display text-2xl font-semibold">形狀王國</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                我是星仔，王國的小巫師。這裏有正方形、三角形、圓形……我們一起學它們的特徵、周界和面積，還有公式為什麼這樣算！
              </p>
              <label className="mt-4 block text-sm font-medium">你叫什麼名字？</label>
              <Input
                className="mt-2"
                value={name}
                maxLength={12}
                placeholder="例如：小明"
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") setHello(true);
                }}
              />
              <div className="mt-4 flex gap-2">
                <Button type="button" className="flex-1" onClick={() => setHello(true)}>
                  下一步
                </Button>
                <Button type="button" variant="ghost" onClick={() => finish("小探險家")}>
                  先看看
                </Button>
              </div>
            </>
          ) : (
            <>
              <h2 className="font-display text-2xl font-semibold">
                你好，{name.trim() || "小探險家"}！
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                點下面的圖形島開始學習；想動手調一調邊長，去「實驗場」；準備好了就去「挑戰」考一考自己。
              </p>
              <Button
                type="button"
                className="mt-5 w-full"
                size="lg"
                onClick={() => finish(name.trim() || "小探險家")}
              >
                出發探險
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
