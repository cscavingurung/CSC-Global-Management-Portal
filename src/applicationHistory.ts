import { ApplicationRecord } from './types';

// statusHistory entries are stored as "Sept 14" with no year (see mockData.ts) — the whole
// app's mock data is fictionally set in 2026, so that's assumed here too.
export function parseHistoryDate(dateStr: string): Date | null {
  const parsed = new Date(`${dateStr}, 2026`);
  return isNaN(parsed.getTime()) ? null : parsed;
}

export function daysBetween(from: Date, to: Date): number {
  return Math.round((to.getTime() - from.getTime()) / (24 * 60 * 60 * 1000));
}

export function monthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

// Treat the latest status-change date across a set of applications as "now" — the mock
// dataset has no live clock, so the latest timestamp anchors "this month" / day counts.
export function latestStatusHistoryDate(applications: ApplicationRecord[]): Date {
  const dates = applications
    .flatMap((a) => a.statusHistory.map((h) => parseHistoryDate(h.date)))
    .filter((d): d is Date => d !== null);
  if (dates.length === 0) return new Date();
  return dates.reduce((latest, d) => (d > latest ? d : latest), dates[0]);
}

export function daysInCurrentStatus(a: ApplicationRecord, now: Date): number {
  const entry = a.statusHistory.find((h) => h.status === a.status);
  const entryDate = entry ? parseHistoryDate(entry.date) : null;
  return entryDate ? Math.max(0, daysBetween(entryDate, now)) : 0;
}
