"use client";

import { createFileRoute } from "@tanstack/react-router";
import { Trophy, Users } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AppShell, PageTitle } from "@/components/app-shell";
import { AvatarBadge } from "@/components/arena/avatar-badge";
import { Podium } from "@/components/arena/podium";
import { Mascot, SpeechBubble } from "@/components/mascot";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  addDemoPlayers,
  createRoom,
  fetchState,
  nextPhase,
  startGame,
} from "@/lib/arena/client";
import type { ArenaPublicState } from "@/lib/arena/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/arena")({ component: ArenaHostPage });

const HOST_KEY = "arena-host";

type HostSession = { code: string; hostToken: string };

function loadHost(): HostSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(HOST_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as HostSession;
    if (parsed?.code && parsed?.hostToken) return parsed;
  } catch {
    /* ignore */
  }
  return null;
}

function saveHost(session: HostSession | null) {
  if (typeof window === "undefined") return;
  if (!session) sessionStorage.removeItem(HOST_KEY);
  else sessionStorage.setItem(HOST_KEY, JSON.stringify(session));
}

/** Map technical / English errors to short zh-Hant messages. */
function friendlyError(err: unknown, fallback: string): string {
  const msg = err instanceof Error ? err.message : String(err ?? "");
  if (!msg) return fallback;
  if (/開房逾時|伺服器可能未就緒/.test(msg)) return msg;
  if (/擂台 API 未部署/.test(msg)) return msg;
  if (/404|not found|<!doctype|<html/i.test(msg)) {
    return "擂台 API 未部署（404）。請確認 Vercel 已連 BBB 最新 main 並 Redeploy。";
  }
  if (/timeout|aborterror|failed to fetch|networkerror|load failed/i.test(msg)) {
    return "連線逾時，請再試一次（伺服器可能未就緒）";
  }
  if (/DATABASE_URL|Neon|共用資料庫/i.test(msg)) {
    return msg;
  }
  if (/arena deck empty|could not allocate/i.test(msg)) {
    return "開房失敗，請再試一次";
  }
  if (/ECONNREFUSED|ENOTFOUND|fetch failed/i.test(msg)) {
    return "無法連上伺服器，請稍後再試";
  }
  return msg;
}

function useCountdown(endsAt: number | null) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (endsAt == null) return;
    const id = window.setInterval(() => setNow(Date.now()), 200);
    return () => window.clearInterval(id);
  }, [endsAt]);
  if (endsAt == null) return null;
  return Math.max(0, Math.ceil((endsAt - now) / 1000));
}

function ArenaHostPage() {
  const [session, setSession] = useState<HostSession | null>(null);
  const [state, setState] = useState<ArenaPublicState | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setSession(loadHost());
  }, []);

  const refresh = useCallback(async (sess: HostSession) => {
    const next = await fetchState(sess.code, { hostToken: sess.hostToken });
    setState(next);
  }, []);

  useEffect(() => {
    if (!session) return;
    let cancelled = false;
    const tick = async () => {
      try {
        await refresh(session);
        if (!cancelled) setError(null);
      } catch (err) {
        if (!cancelled) setError(friendlyError(err, "讀取失敗"));
      }
    };
    void tick();
    const id = window.setInterval(tick, 1000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [session, refresh]);

  const joinUrl = useMemo(() => {
    if (!session || typeof window === "undefined") return "";
    return `${window.location.origin}/arena/join?code=${session.code}`;
  }, [session]);

  const qrUrl = useMemo(() => {
    if (!joinUrl) return "";
    return `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(joinUrl)}`;
  }, [joinUrl]);

  const secondsLeft = useCountdown(state?.endsAt ?? null);
  const questionKey = state?.question?.id ?? `${state?.questionIndex ?? 0}`;

  const onCreate = async () => {
    setBusy(true);
    setError(null);
    try {
      const result = await createRoom();
      const next = { code: result.code, hostToken: result.hostToken };
      saveHost(next);
      setSession(next);
      setState(result.state);
    } catch (err) {
      setError(friendlyError(err, "開房失敗"));
    } finally {
      setBusy(false);
    }
  };

  const onStart = async () => {
    if (!session) return;
    setBusy(true);
    setError(null);
    try {
      const next = await startGame(session.code, session.hostToken);
      setState(next);
    } catch (err) {
      setError(friendlyError(err, "開始失敗"));
    } finally {
      setBusy(false);
    }
  };

  const onNext = async () => {
    if (!session) return;
    setBusy(true);
    setError(null);
    try {
      const next = await nextPhase(session.code, session.hostToken);
      setState(next);
    } catch (err) {
      setError(friendlyError(err, "換題失敗"));
    } finally {
      setBusy(false);
    }
  };

  const onCopyLink = async () => {
    if (!joinUrl) return;
    try {
      await navigator.clipboard.writeText(joinUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setError("無法複製連結，請手動選取上方網址");
    }
  };

  const onDemoJoin = async () => {
    if (!session) return;
    setBusy(true);
    setError(null);
    try {
      const next = await addDemoPlayers(session.code, session.hostToken, 2);
      setState(next);
    } catch (err) {
      setError(friendlyError(err, "加入測試選手失敗"));
    } finally {
      setBusy(false);
    }
  };

  const phase = state?.phase;
  const timerUrgent = phase === "question" && secondsLeft != null && secondsLeft <= 5;

  return (
    <AppShell>
      <div className="flex items-end gap-3">
        <Mascot mood="cheer" className="h-24 w-24 shrink-0 sm:h-28 sm:w-28" />
        <SpeechBubble className="mb-4 max-w-lg">
          歡迎來到形狀擂台！投影這頁，同學掃 QR 加入。答得又快又對，分數就會飛起來～
        </SpeechBubble>
      </div>

      <PageTitle
        kicker="課堂擂台"
        title="主持人控制台"
        subtitle="開房間 → 同學加入 → 開始比賽。題目與計分由伺服器裁決，學校 Wi‑Fi 也能穩穩跑。"
      />

      {error ? (
        <p className="mb-4 rounded-lg border-2 border-coral/40 bg-coral/10 px-3 py-2 text-sm text-coral">
          {error}
        </p>
      ) : null}

      {!session ? (
        <Card>
          <CardContent className="flex flex-col items-start gap-4 p-6">
            <p className="text-ink-soft">還沒有房間。按下面大按鈕開一場新的吧！</p>
            <Button size="lg" className="bg-coral text-paper hover:bg-coral/90" onClick={onCreate} disabled={busy}>
              {busy ? "開房中…" : "開新房間"}
            </Button>
            <p className="text-xs text-muted">開房後會顯示房號、QR，以及「開始比賽／測試選手」。</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-5">
          <Card className="overflow-hidden">
            <CardContent className="grid gap-6 p-6 sm:grid-cols-[1fr_auto] sm:items-center">
              <div>
                <p className="font-display text-sm font-semibold text-muted">房間代碼</p>
                <p className="mt-1 font-display text-5xl font-bold tracking-[0.2em] text-ink sm:text-6xl">
                  {session.code}
                </p>
                <p className="mt-3 flex items-center gap-2 text-sm text-ink-soft">
                  <Users className="size-4" />
                  {state?.players.length ?? 0} 位選手
                  {phase ? (
                    <span className="rounded-full bg-ink/6 px-2 py-0.5 font-display text-xs">
                      {phaseLabel(phase)}
                    </span>
                  ) : null}
                </p>
                <p className="mt-2 break-all text-xs text-muted">{joinUrl}</p>
              </div>
              {qrUrl ? (
                <img
                  src={qrUrl}
                  alt="加入擂台 QR code"
                  width={240}
                  height={240}
                  className="mx-auto rounded-xl border-2 border-ink/10 bg-paper p-2 shadow-soft"
                />
              ) : null}
            </CardContent>
          </Card>

          {phase === "lobby" ? (
            <Card>
              <CardContent className="space-y-3 p-5">
                <p className="font-display text-sm font-semibold text-muted">開賽三步驟</p>
                <ol className="space-y-2 font-display text-base leading-relaxed text-ink">
                  <li>
                    <span className="mr-2 font-bold text-coral">①</span>
                    投影房號／QR，讓全班看得到
                  </li>
                  <li>
                    <span className="mr-2 font-bold text-coral">②</span>
                    同學掃碼加入並自訂角色
                  </li>
                  <li>
                    <span className="mr-2 font-bold text-coral">③</span>
                    人數夠了就按「開始比賽」
                  </li>
                </ol>
              </CardContent>
            </Card>
          ) : null}

          <div className="flex flex-wrap gap-2">
            {phase === "lobby" ? (
              <>
                <Button size="lg" onClick={onStart} disabled={busy}>
                  開始比賽
                  <span className="ml-2 text-xs font-normal opacity-80">
                    {(state?.players.length ?? 0) === 0
                      ? "可先獨自試玩；有人更好"
                      : `已有 ${state?.players.length} 人`}
                  </span>
                </Button>
                <Button size="lg" variant="sun" onClick={onCopyLink} disabled={!joinUrl}>
                  {copied ? "已複製" : "複製加入連結"}
                </Button>
                <Button size="lg" variant="outline" onClick={onDemoJoin} disabled={busy}>
                  加入測試選手
                </Button>
                <Button
                  size="lg"
                  variant="ghost"
                  onClick={() => {
                    saveHost(null);
                    setSession(null);
                    setState(null);
                  }}
                >
                  關閉房間
                </Button>
              </>
            ) : null}
            {phase === "question" ? (
              <Button size="lg" variant="sun" onClick={onNext} disabled={busy}>
                顯示答案
              </Button>
            ) : null}
            {phase === "reveal" ? (
              <Button size="lg" onClick={onNext} disabled={busy}>
                {state && state.questionIndex + 1 >= state.questionCount
                  ? "看總榜"
                  : "下一題"}
              </Button>
            ) : null}
            {phase === "finished" ? (
              <Button
                size="lg"
                variant="outline"
                onClick={() => {
                  saveHost(null);
                  setSession(null);
                  setState(null);
                }}
              >
                再開新房間
              </Button>
            ) : null}
          </div>

          {phase === "lobby" ? (
            <PlayerList
              players={state?.players ?? []}
              empty="還沒有選手——可掃碼加入，或按「加入測試選手」先試玩"
              animateJoin
            />
          ) : null}

          {(phase === "question" || phase === "reveal") && state?.question ? (
            <Card key={questionKey} className="arena-question-enter">
              <CardContent className="space-y-4 p-6">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-display text-sm font-semibold text-muted">
                    第 {state.questionIndex + 1} / {state.questionCount} 題
                  </p>
                  {phase === "question" && secondsLeft != null ? (
                    <p
                      className={cn(
                        "font-display text-3xl font-bold tabular-nums text-coral",
                        timerUrgent && "arena-timer-urgent",
                      )}
                    >
                      {secondsLeft}
                    </p>
                  ) : (
                    <p className="font-display text-sm font-semibold text-leaf">揭曉答案</p>
                  )}
                </div>
                <h2 className="font-display text-2xl font-semibold leading-snug sm:text-3xl">
                  {state.question.prompt}
                </h2>
                <div className="grid gap-2 sm:grid-cols-2">
                  {state.question.options.map((opt, i) => {
                    const isCorrect = phase === "reveal" && state.correctIndex === i;
                    const isWrongReveal =
                      phase === "reveal" && state.correctIndex != null && state.correctIndex !== i;
                    return (
                      <div
                        key={i}
                        className={cn(
                          "rounded-xl border-2 px-4 py-4 font-display text-lg font-semibold",
                          isCorrect
                            ? "arena-option-correct border-leaf bg-leaf/20 text-ink"
                            : isWrongReveal
                              ? "arena-option-wrong border-ink/10 bg-paper-2/60 text-ink-soft"
                              : "border-ink/10 bg-paper-2/60 text-ink-soft",
                        )}
                      >
                        <span className="mr-2 text-muted">{optionLetter(i)}.</span>
                        {opt}
                      </div>
                    );
                  })}
                </div>
                {phase === "reveal" && state.explain ? (
                  <p className="rounded-lg bg-sun/30 px-3 py-2 text-sm leading-relaxed">
                    {state.explain}
                  </p>
                ) : null}
              </CardContent>
            </Card>
          ) : null}

          {phase === "reveal" && state ? (
            <div>
              <h3 className="mb-3 flex items-center gap-2 font-display text-xl font-semibold">
                <Trophy className="size-5 text-sun" />
                目前分數
              </h3>
              <PlayerList players={state.players} empty="還沒有分數" ranked />
            </div>
          ) : null}

          {phase === "finished" && state ? (
            <Podium players={state.players} />
          ) : null}
        </div>
      )}
    </AppShell>
  );
}

function phaseLabel(phase: ArenaPublicState["phase"]) {
  switch (phase) {
    case "lobby":
      return "大廳";
    case "question":
      return "作答中";
    case "reveal":
      return "揭曉";
    case "finished":
      return "結束";
  }
}

function optionLetter(i: number) {
  return String.fromCharCode(65 + i);
}

function PlayerList({
  players,
  empty,
  ranked,
  animateJoin,
}: {
  players: ArenaPublicState["players"];
  empty: string;
  ranked?: boolean;
  animateJoin?: boolean;
}) {
  if (!players.length) {
    return <p className="text-sm text-muted">{empty}</p>;
  }
  return (
    <ul className="divide-y divide-ink/8 overflow-hidden rounded-xl border-2 border-ink/8 bg-card">
      {players.map((p, idx) => (
        <li
          key={p.id}
          className={cn(
            "flex items-center justify-between gap-3 px-4 py-3 font-display",
            animateJoin && "arena-list-enter",
          )}
          style={animateJoin ? { animationDelay: `${Math.min(idx, 12) * 0.04}s` } : undefined}
        >
          <span className="flex min-w-0 items-center gap-3">
            {ranked ? (
              <span className="w-8 shrink-0 text-center text-lg font-bold text-coral">
                {idx + 1}
              </span>
            ) : null}
            <AvatarBadge avatar={p.avatar} size="sm" title={p.nickname} />
            <span className="truncate font-semibold">{p.nickname}</span>
          </span>
          <span className="tabular-nums text-ink-soft">{p.score}</span>
        </li>
      ))}
    </ul>
  );
}
