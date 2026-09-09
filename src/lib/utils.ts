import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const PI = 3.14;

export function fmt(n: number): string {
  if (!Number.isFinite(n)) return "—";
  const r = Math.round(n * 100) / 100;
  if (Number.isInteger(r)) return String(r);
  return r
    .toFixed(2)
    .replace(/0+$/, "")
    .replace(/\.$/, "");
}

export function nearlyEqual(a: number, b: number, eps = 0.06): boolean {
  return Math.abs(a - b) <= eps;
}

export function parseNumber(raw: string): number | null {
  const t = raw
    .trim()
    .replace(/,/g, "")
    .replace(/cm²|cm2|平方厘米|厘米|cm/gi, "")
    .replace(/\s/g, "");
  if (!t) return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}
