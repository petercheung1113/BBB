"use client";

import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Mascot, SpeechBubble } from "@/components/mascot";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { fetchState, joinRoom, submitAnswer } from "@/lib/arena/client";
import type { ArenaPublicState } from "@/lib/arena/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/arena_/join")({
  validateSearch: (search: Record<string, unknown>) => ({
    code: typeof search.code === "string" ? search.code.toUpperCase() : "",
  }),
  component: ArenaJoinPage,
});

const PLAYER_KEY = "arena-player";

type PlayerSession = { code: string; playerId: string; nickname: string };

function loadPlayer(): PlayerSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(PLAYER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PlayerSession;
    if (parsed?.code && parsed?.playerId) return parsed;
  } catch {
    /* ignore */
  }
  return null;
}

function savePlayer(session: PlayerSession | null) {
  if (typeof window === "undefined") return;
  if (!session) sessionStorage.removeItem(PLAYER_KEY);
  else sessionStorage.setItem(PLAYER_KEY, JSON.stringify(session));
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

function ArenaJoinPage() {
  const { code: codeFromUrl } = Route.useSearch();
  const [codeInput, setCodeInput] = useState(codeFromUrl || "");
  const [nickname, setNickname] = useState("");
  const [session, setSession] = useState<PlayerSession | null>(null);
  const [state, setState] = useState<ArenaPublicState | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const existing = loadPlayer();
    if (existing) {
      if (!codeFromUrl || existing.code === codeFromUrl.toUpperCase()) {
        setSession(existing);
        setCodeInput(existing.code);
        setNickname(existing.nickname);
      }
    } else if (codeFromUrl) {
      setCodeInput(codeFromUrl);
    }
    setHydrated(true);
  }, [codeFromUrl]);

  const refresh = useCallback(async (sess: PlayerSession) => {
    const next = await fetchState(sess.code, { playerId: sess.playerId });
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
        if (!cancelled) setError(err instanceof Error ? err.message : "讀取失敗");
      }
    };
    void tick();
    const id = window.setInterval(tick, 1000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [session, refresh]);

  const secondsLeft = useCountdown(state?.endsAt ?? null);

  const myRank = useMemo(() => {
    if (!state || !session) return null;
    const idx = state.players.findIndex((p) => p.id === session.playerId);
    return idx >= 0 ? idx + 1 : null;
  }, [state, session]);

  const myScore = useMemo(() => {
    if (!state || !session) return 0;
    return state.players.find((p) => p.id === session.playerId)?.score ?? 0;
  }, [state, session]);

  const onJoin = async () => {
    setBusy(true);
    setError(null);
    try {
      const result = await joinRoom(codeInput.trim().toUpperCase(), nickname);
      const next: PlayerSession = {
        code: result.state.code,
        playerId: result.playerId,
        nickname: nickname.trim(),
      };
      savePlayer(next);
      setSession(next);
      setState(result.state);
    } catch (err) {
      setError(err instanceof Error ? err.message : "加入失敗");
    } finally {
      setBusy(false);
    }
  };

  const onAnswer = async (choiceIndex: number) => {
    if (!session || state?.youAnswered) return;
    setBusy(true);
    setError(null);
    try {
      const next = await submitAnswer(session.code, session.playerId, choiceIndex);
      setState(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "作答失敗");
    } finally {
      setBusy(false);
    }
  };

  const phase = state?.phase;

  return (
    <AppShell>
      <div className="flex items-end gap-3">
        <Mascot
          mood={phase === "finished" ? "cheer" : phase === "question" ? "think" : "wave"}
          className="h-20 w-20 shrink-0"
        />
        <SpeechBubble className="mb-3 max-w-md text-sm">
          {!session
            ? "輸入暱稱，加入老師的形狀擂台！"
            : phase === "lobby"
              ? "已進大廳，等老師開賽～摸摸鼻子冷靜一下。"
              : phase === "question"
                ? state?.youAnswered
                  ? "答好了！等計時結束或老師揭曉。"
                  : "快快選！越快越準，分數越高！"
                : phase === "reveal"
                  ? "看答案啦！下一題準備好了嗎？"
                  : "比賽結束！看看你排第幾～"}
        </SpeechBubble>
      </div>

      {error ? (
        <p className="mb-4 rounded-lg border-2 border-coral/40 bg-coral/10 px-3 py-2 text-sm text-coral">
          {error}
        </p>
      ) : null}

      {!hydrated ? null : !session ? (
        <Card>
          <CardContent className="space-y-4 p-5">
            <div>
              <label className="mb-1 block font-display text-sm font-semibold">房間代碼</label>
              <Input
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
                placeholder="例如 AB3K"
                maxLength={4}
                className="font-display text-xl tracking-widest"
                autoCapitalize="characters"
              />
            </div>
            <div>
              <label className="mb-1 block font-display text-sm font-semibold">暱稱</label>
              <Input
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="1–12 個字"
                maxLength={12}
              />
            </div>
            <Button
              size="xl"
              className="w-full"
              disabled={busy || codeInput.trim().length !== 4 || nickname.trim().length < 1}
              onClick={onJoin}
            >
              加入
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2 rounded-xl border-2 border-ink/8 bg-card px-4 py-3">
            <div>
              <p className="text-xs text-muted">房間 {session.code}</p>
              <p className="font-display font-semibold">{session.nickname}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted">分數</p>
              <p className="font-display text-xl font-bold tabular-nums">{myScore}</p>
            </div>
          </div>

          {phase === "lobby" ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="font-display text-lg font-semibold">等待開始…</p>
                <p className="mt-2 text-sm text-muted">
                  目前 {state?.players.length ?? 0} 位選手在大廳
                </p>
              </CardContent>
            </Card>
          ) : null}

          {phase === "question" && state?.question ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="font-display text-sm font-semibold text-muted">
                  第 {state.questionIndex + 1} / {state.questionCount} 題
                </p>
                <p className="font-display text-3xl font-bold tabular-nums text-coral">
                  {secondsLeft ?? "—"}
                </p>
              </div>
              <h2 className="font-display text-xl font-semibold leading-snug">
                {state.question.prompt}
              </h2>
              <div className="grid gap-3">
                {state.question.options.map((opt, i) => {
                  const locked = !!state.youAnswered;
                  const picked = state.yourChoice === i;
                  return (
                    <button
                      key={i}
                      type="button"
                      disabled={busy || locked}
                      onClick={() => onAnswer(i)}
                      className={cn(
                        "min-h-16 rounded-xl border-2 px-4 py-4 text-left font-display text-lg font-semibold shadow-pop transition active:scale-[0.98] disabled:opacity-80",
                        picked
                          ? "border-ink bg-ink text-paper"
                          : "border-ink/12 bg-card text-ink hover:bg-paper-2",
                      )}
                    >
                      <span className="mr-2 opacity-70">{String.fromCharCode(65 + i)}.</span>
                      {opt}
                    </button>
                  );
                })}
              </div>
              {state.youAnswered ? (
                <p className="text-center font-display text-sm text-leaf">已鎖定答案 ✓</p>
              ) : null}
            </div>
          ) : null}

          {phase === "reveal" && state?.question ? (
            <Card>
              <CardContent className="space-y-3 p-5">
                <p className="font-display text-sm font-semibold text-muted">
                  第 {state.questionIndex + 1} 題揭曉
                </p>
                <p className="font-display text-lg font-semibold">{state.question.prompt}</p>
                <div className="grid gap-2">
                  {state.question.options.map((opt, i) => {
                    const correct = state.correctIndex === i;
                    const mine = state.yourChoice === i;
                    return (
                      <div
                        key={i}
                        className={cn(
                          "rounded-xl border-2 px-4 py-3 font-display font-semibold",
                          correct
                            ? "border-leaf bg-leaf/25"
                            : mine
                              ? "border-coral/50 bg-coral/10"
                              : "border-ink/8 bg-paper-2/50 text-muted",
                        )}
                      >
                        {opt}
                        {correct ? " ✓" : mine ? "（你的選擇）" : ""}
                      </div>
                    );
                  })}
                </div>
                {state.explain ? (
                  <p className="text-sm leading-relaxed text-ink-soft">{state.explain}</p>
                ) : null}
                <p className="font-display text-sm">
                  你的分數：<span className="font-bold tabular-nums">{myScore}</span>
                </p>
              </CardContent>
            </Card>
          ) : null}

          {phase === "finished" && state ? (
            <Card>
              <CardContent className="space-y-4 p-5">
                <p className="text-center font-display text-2xl font-bold">總榜出爐！</p>
                <p className="text-center text-ink-soft">
                  你是第 <span className="font-display text-2xl font-bold text-coral">{myRank ?? "—"}</span>{" "}
                  名 · {myScore} 分
                </p>
                <ul className="divide-y divide-ink/8 overflow-hidden rounded-xl border-2 border-ink/8">
                  {state.players.map((p, idx) => (
                    <li
                      key={p.id}
                      className={cn(
                        "flex justify-between px-3 py-2 font-display",
                        p.id === session.playerId && "bg-sun/30",
                      )}
                    >
                      <span>
                        {idx + 1}. {p.nickname}
                      </span>
                      <span className="tabular-nums">{p.score}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    savePlayer(null);
                    setSession(null);
                    setState(null);
                  }}
                >
                  離開
                </Button>
              </CardContent>
            </Card>
          ) : null}
        </div>
      )}
    </AppShell>
  );
}
