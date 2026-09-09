"use client";

import { Link } from "@tanstack/react-router";
import { Beaker, Compass, Sparkles, Star } from "lucide-react";
import type { ReactNode } from "react";
import { totalStars, useProgress } from "@/lib/progress";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: ReactNode }) {
  const nickname = useProgress((s) => s.nickname);
  const lessons = useProgress((s) => s.lessons);
  const quizBest = useProgress((s) => s.quizBest);
  const stars = totalStars(lessons, quizBest);

  return (
    <div className="relative min-h-dvh overflow-x-hidden bg-sky text-ink">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <span className="cloud cloud-a floaty-slow left-[8%] top-8" />
        <span className="cloud cloud-a floaty right-[12%] top-16 scale-75" />
        <span className="cloud cloud-a floaty-slow left-[55%] top-6 scale-50 opacity-70" />
      </div>
      <header className="relative z-20 border-b-2 border-ink/8 bg-paper/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-3 px-4">
          <Link to="/" className="flex min-w-0 items-center gap-2">
            <span className="grid size-9 place-items-center rounded-full bg-sun shadow-pop">
              <Sparkles className="size-4 text-ink" />
            </span>
            <span className="truncate font-display text-lg font-semibold tracking-tight">形狀王國</span>
          </Link>
          <nav className="hidden items-center gap-1 sm:flex">
            <NavLink to="/">王國</NavLink>
            <NavLink to="/lab">實驗場</NavLink>
            <NavLink to="/practice">挑戰</NavLink>
          </nav>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-full bg-sun/70 px-2.5 py-1 font-display text-sm font-semibold">
              <Star className="size-4 fill-coral text-coral" />
              <span className="tabular-nums">{stars}</span>
            </div>
            <span className="hidden max-w-28 truncate text-sm text-ink-soft sm:inline">
              {nickname || "小探險家"}
            </span>
          </div>
        </div>
      </header>
      <main className="relative z-10 mx-auto w-full max-w-5xl px-4 pb-28 pt-6 sm:pb-12">{children}</main>
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t-2 border-ink/8 bg-paper/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md sm:hidden">
        <div className="mx-auto grid max-w-md grid-cols-3 px-2 py-2">
          <Tab to="/" icon={<Compass className="size-5" />} label="王國" />
          <Tab to="/lab" icon={<Beaker className="size-5" />} label="實驗場" />
          <Tab to="/practice" icon={<Star className="size-5" />} label="挑戰" />
        </div>
      </nav>
    </div>
  );
}

function NavLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      className="rounded-full px-3 py-1.5 font-display text-sm font-medium text-ink-soft hover:bg-ink/6 hover:text-ink"
      activeProps={{ className: "bg-ink text-paper hover:bg-ink hover:text-paper" }}
    >
      {children}
    </Link>
  );
}

function Tab({ to, icon, label }: { to: string; icon: ReactNode; label: string }) {
  return (
    <Link
      to={to}
      className="flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-lg text-muted"
      activeProps={{ className: "text-coral" }}
    >
      {icon}
      <span className="font-display text-[11px] font-semibold">{label}</span>
    </Link>
  );
}

export function PageTitle({
  kicker,
  title,
  subtitle,
  className,
}: {
  kicker?: string;
  title: string;
  subtitle?: string;
  className?: string;
}) {
  return (
    <div className={cn("mb-6", className)}>
      {kicker ? (
        <p className="mb-1 font-display text-xs font-semibold uppercase tracking-wider text-coral">{kicker}</p>
      ) : null}
      <h1 className="font-display text-3xl font-semibold text-ink">{title}</h1>
      {subtitle ? <p className="mt-2 max-w-2xl text-ink-soft">{subtitle}</p> : null}
    </div>
  );
}
