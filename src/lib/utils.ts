/**
 * utils.ts
 * Shared utility functions.
 */

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function formatBB(amount: number): string {
  if (Number.isInteger(amount)) return `${amount} BB`;
  return `${amount.toFixed(1)} BB`;
}

export function formatPct(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export function formatAccuracy(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export function formatTime(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}
