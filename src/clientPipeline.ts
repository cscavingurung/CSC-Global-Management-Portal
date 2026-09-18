import { ApplicationRecord, OfferApplication, OfferStatus, VisaStageStatus } from './types';

export type ClientStage = 'Offer' | 'Visa';

export type StatusTone = 'progress' | 'positive' | 'negative' | 'early' | 'withdrawn';

export function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function daysBetween(from: Date, to: Date): number {
  return Math.round((to.getTime() - from.getTime()) / (24 * 60 * 60 * 1000));
}

export function monthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

// The most recent offer attempt that hasn't been rejected — the one the officer is actively
// working. Falls back to the most recent attempt overall (which will be Rejected) so a fully
// rejected history still has something to point at.
export function getActiveOfferApplication(app: ApplicationRecord): OfferApplication | null {
  const attempts = app.offerApplications;
  if (attempts.length === 0) return null;
  const active = [...attempts].reverse().find((a) => a.status !== 'Rejected');
  return active ?? attempts[attempts.length - 1];
}

// Visa unlocks once any attempt has an offer in hand — no separate "accept" step.
export function isVisaUnlocked(app: ApplicationRecord): boolean {
  return app.offerApplications.some((a) => a.status === 'Offer Received');
}

export function getClientStage(app: ApplicationRecord): ClientStage {
  return isVisaUnlocked(app) ? 'Visa' : 'Offer';
}

export function getClientStatusLabel(app: ApplicationRecord): string {
  if (app.withdrawn) return 'Withdrawn';
  if (getClientStage(app) === 'Visa') {
    return app.visaApplication ? app.visaApplication.status : 'Ready to Start Visa';
  }
  const active = getActiveOfferApplication(app);
  return active ? active.status : 'Not Started';
}

export function getStatusTone(app: ApplicationRecord): StatusTone {
  if (app.withdrawn) return 'withdrawn';
  const label = getClientStatusLabel(app);
  if (label === 'Offer Received' || label === 'Visa Approved') return 'positive';
  if (label === 'Rejected' || label === 'Visa Refused') return 'negative';
  if (label === 'Enrolled' || label === 'Preparing Documents' || label === 'Not Started' || label === 'Ready to Start Visa') return 'early';
  return 'progress';
}

export const STATUS_TONE_STYLES: Record<StatusTone, string> = {
  progress: 'bg-navy/10 text-navy',
  positive: 'bg-green-100 text-green-700',
  negative: 'bg-red-100 text-red-700',
  early: 'bg-gray-100 text-gray-600',
  withdrawn: 'bg-gray-100 text-gray-500',
};

// Per-status pill colors — centralized so every screen that shows an offer/visa status
// (officer views, the read-only branch/counselor views) renders it identically.
export const OFFER_STATUS_STYLES: Record<OfferStatus, string> = {
  Enrolled: 'bg-gray-100 text-gray-600',
  'Applied to Institution': 'bg-navy/10 text-navy',
  'Offer Received': 'bg-green-100 text-green-700',
  Rejected: 'bg-red-100 text-red-700',
};

export const VISA_STATUS_STYLES: Record<VisaStageStatus, string> = {
  'Preparing Documents': 'bg-gray-100 text-gray-600',
  'Ready for Visa': 'bg-navy/10 text-navy',
  'Visa Applied': 'bg-navy/10 text-navy',
  'Visa Approved': 'bg-green-100 text-green-700',
  'Visa Refused': 'bg-red-100 text-red-700',
};

export function isClientInProgress(app: ApplicationRecord): boolean {
  if (app.withdrawn) return false;
  const visa = app.visaApplication;
  if (visa && (visa.status === 'Visa Approved' || visa.status === 'Visa Refused')) return false;
  return true;
}

export function isVisaApproved(app: ApplicationRecord): boolean {
  return app.visaApplication?.status === 'Visa Approved';
}

export function isVisaRefused(app: ApplicationRecord): boolean {
  return app.visaApplication?.status === 'Visa Refused';
}

export function checklistCompleteCount(checklist: { noc: boolean; medical: boolean; financial: boolean; policeReport: boolean }): number {
  return [checklist.noc, checklist.medical, checklist.financial, checklist.policeReport].filter(Boolean).length;
}

export function isChecklistComplete(checklist: { noc: boolean; medical: boolean; financial: boolean; policeReport: boolean }): boolean {
  return checklistCompleteCount(checklist) === 4;
}

// Days spent in whichever status is currently active for the client (offer attempt or visa
// case, whichever stage they're in) — used for "needs attention" / staleness views.
export function daysInCurrentStatus(app: ApplicationRecord, now: Date): number {
  const stage = getClientStage(app);
  const updatedAt = stage === 'Visa' ? app.visaApplication?.statusUpdatedAt : getActiveOfferApplication(app)?.statusUpdatedAt;
  if (!updatedAt) return 0;
  const d = new Date(updatedAt);
  if (isNaN(d.getTime())) return 0;
  return Math.max(0, daysBetween(d, now));
}

// The latest tracked date on a single client's record, or null if nothing has happened yet.
export function latestActivityDateForApp(app: ApplicationRecord): Date | null {
  const dates: Date[] = [];
  app.offerApplications.forEach((o) => dates.push(new Date(o.statusUpdatedAt)));
  if (app.visaApplication) dates.push(new Date(app.visaApplication.statusUpdatedAt));
  if (app.withdrawnDate) dates.push(new Date(app.withdrawnDate));
  const valid = dates.filter((d) => !isNaN(d.getTime()));
  if (valid.length === 0) return null;
  return valid.reduce((latest, d) => (d > latest ? d : latest), valid[0]);
}

// Treat the latest of any tracked date across a set of applications as "now" — the mock
// dataset has no live clock, so the latest timestamp anchors "this month" / day counts.
export function latestActivityDate(applications: ApplicationRecord[]): Date {
  const valid = applications.map(latestActivityDateForApp).filter((d): d is Date => d !== null);
  if (valid.length === 0) return new Date();
  return valid.reduce((latest, d) => (d > latest ? d : latest), valid[0]);
}

export interface ActivityEvent {
  key: string;
  name: string;
  description: string;
  date: Date;
}

// Flat "reached status" feed across every client — replaces the old from→to transition log,
// which relied on a full statusHistory array this model no longer keeps.
export function recentActivity(applications: ApplicationRecord[], limit = 5): ActivityEvent[] {
  const events: ActivityEvent[] = [];
  applications.forEach((a) => {
    a.offerApplications.forEach((o, i) => {
      const d = new Date(o.statusUpdatedAt);
      if (isNaN(d.getTime())) return;
      events.push({ key: `${a.id}-offer-${i}`, name: a.name, description: `${o.status} — ${o.institution}`, date: d });
    });
    if (a.visaApplication) {
      const d = new Date(a.visaApplication.statusUpdatedAt);
      if (!isNaN(d.getTime())) {
        events.push({ key: `${a.id}-visa`, name: a.name, description: `Visa: ${a.visaApplication.status}`, date: d });
      }
    }
    if (a.withdrawn && a.withdrawnDate) {
      const d = new Date(a.withdrawnDate);
      if (!isNaN(d.getTime())) {
        events.push({ key: `${a.id}-withdrawn`, name: a.name, description: 'Withdrawn from pipeline', date: d });
      }
    }
  });
  return events.sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, limit);
}

export const VISA_STAGE_STATUSES: VisaStageStatus[] = [
  'Preparing Documents', 'Ready for Visa', 'Visa Applied', 'Visa Approved', 'Visa Refused',
];
