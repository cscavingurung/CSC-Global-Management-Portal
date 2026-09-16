import { useMemo } from 'react';
import { FileText, Send, CheckCircle2, AlertTriangle, type LucideIcon } from 'lucide-react';
import { ApplicationRecord, ApplicationStatus } from '../types';
import { daysBetween, daysInCurrentStatus as computeDaysInCurrentStatus, latestStatusHistoryDate, monthKey, parseHistoryDate } from '../applicationHistory';

interface ApplicationOfficerOverviewProps {
  branch: string;
  applications: ApplicationRecord[];
}

const STATUS_STYLES: Record<ApplicationStatus, string> = {
  Preparation: 'bg-gray-100 text-gray-600',
  Lodgement: 'bg-navy/10 text-navy',
  Success: 'bg-green-100 text-green-700',
  Refused: 'bg-red-100 text-red-700',
};

const STALE_THRESHOLD_DAYS = 7;

interface StatCardDef {
  key: string;
  icon: LucideIcon;
  value: string;
  label: string;
  trend: string;
}

interface ActionRow {
  id: string;
  name: string;
  country: string;
  purpose: string;
  daysInStatus: number;
  notYetStarted: boolean;
}

interface ActivityRow {
  key: string;
  name: string;
  from: ApplicationStatus;
  to: ApplicationStatus;
  date: Date;
}

function formatRelativeDay(date: Date, now: Date): string {
  const days = daysBetween(date, now);
  if (days <= 0) return 'Today';
  if (days === 1) return '1 day ago';
  return `${days} days ago`;
}

export default function ApplicationOfficerOverview({ branch, applications }: ApplicationOfficerOverviewProps) {
  const branchApplications = useMemo(
    () => applications.filter((a) => a.branch === branch),
    [applications, branch]
  );

  const now = useMemo(() => latestStatusHistoryDate(branchApplications), [branchApplications]);

  const daysInCurrentStatus = useMemo(() => {
    return (a: ApplicationRecord): number => computeDaysInCurrentStatus(a, now);
  }, [now]);

  const preparation = useMemo(() => branchApplications.filter((a) => a.status === 'Preparation'), [branchApplications]);
  const lodgement = useMemo(() => branchApplications.filter((a) => a.status === 'Lodgement'), [branchApplications]);

  const actionRequired = useMemo<ActionRow[]>(() => {
    return preparation
      .map((a) => {
        const daysInStatus = daysInCurrentStatus(a);
        return {
          id: a.id,
          name: a.name,
          country: a.country,
          purpose: a.purpose,
          daysInStatus,
          notYetStarted: daysInStatus === 0,
        };
      })
      .sort((a, b) => {
        if (a.notYetStarted !== b.notYetStarted) return a.notYetStarted ? -1 : 1;
        return b.daysInStatus - a.daysInStatus;
      });
  }, [preparation, daysInCurrentStatus]);

  const recentActivity = useMemo<ActivityRow[]>(() => {
    const rows: ActivityRow[] = [];
    branchApplications.forEach((a) => {
      for (let i = 1; i < a.statusHistory.length; i++) {
        const date = parseHistoryDate(a.statusHistory[i].date);
        if (!date) continue;
        rows.push({
          key: `${a.id}-${i}`,
          name: a.name,
          from: a.statusHistory[i - 1].status,
          to: a.statusHistory[i].status,
          date,
        });
      }
    });
    return rows.sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 5);
  }, [branchApplications]);

  const stats = useMemo<StatCardDef[]>(() => {
    const newToday = preparation.filter((a) => daysInCurrentStatus(a) === 0).length;
    const oldestLodged = lodgement.reduce((max, a) => Math.max(max, daysInCurrentStatus(a)), 0);

    const nowMonthKey = monthKey(now);
    const decidedThisMonth = branchApplications.filter((a) => {
      if (a.status !== 'Success' && a.status !== 'Refused') return false;
      const entry = a.statusHistory.find((h) => h.status === a.status);
      const d = entry ? parseHistoryDate(entry.date) : null;
      return d !== null && monthKey(d) === nowMonthKey;
    });
    const granted = decidedThisMonth.filter((a) => a.status === 'Success').length;
    const refused = decidedThisMonth.filter((a) => a.status === 'Refused').length;

    const needingAttention = preparation.filter((a) => daysInCurrentStatus(a) >= STALE_THRESHOLD_DAYS);
    const longestStuck = needingAttention.reduce((max, a) => Math.max(max, daysInCurrentStatus(a)), 0);

    return [
      {
        key: 'preparation',
        icon: FileText,
        value: String(preparation.length),
        label: 'In Preparation',
        trend: newToday === 0 ? 'None new today' : `${newToday} new today`,
      },
      {
        key: 'lodged',
        icon: Send,
        value: String(lodgement.length),
        label: 'Lodged',
        trend: lodgement.length === 0 ? 'None awaiting decision' : `Oldest: ${oldestLodged} day${oldestLodged === 1 ? '' : 's'}`,
      },
      {
        key: 'decided',
        icon: CheckCircle2,
        value: String(decidedThisMonth.length),
        label: 'Decided This Month',
        trend: decidedThisMonth.length === 0 ? 'None decided yet' : `${granted} granted, ${refused} refused`,
      },
      {
        key: 'attention',
        icon: AlertTriangle,
        value: String(needingAttention.length),
        label: 'Needs Attention',
        trend: needingAttention.length === 0 ? 'Nothing overdue' : `Longest stuck: ${longestStuck} day${longestStuck === 1 ? '' : 's'}`,
      },
    ];
  }, [preparation, lodgement, branchApplications, now, daysInCurrentStatus]);

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="bg-navy rounded-2xl p-6 lg:p-8 text-white">
        <h2 className="text-xl lg:text-2xl font-semibold">Welcome back</h2>
        <p className="text-white/60 text-sm mt-1">Here's your application pipeline today.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.key} className="stat-card">
              <div className="flex items-start justify-between mb-4">
                <div className="w-11 h-11 rounded-lg bg-navy/5 flex items-center justify-center">
                  <Icon className="text-navy" size={22} />
                </div>
              </div>
              <p className="text-3xl font-bold text-navy">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
              <p className="text-xs mt-2 text-gray-400">{stat.trend}</p>
            </div>
          );
        })}
      </div>

      {/* Action required + recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="stat-card">
          <h3 className="text-base font-semibold text-navy mb-4">Action Required</h3>
          {actionRequired.length > 0 ? (
            <div className="space-y-0">
              {actionRequired.map((row) => {
                const stale = row.daysInStatus >= STALE_THRESHOLD_DAYS;
                return (
                  <div key={row.id} className="flex items-center justify-between py-2.5 border-b border-grey-border last:border-0">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-navy truncate">{row.name}</p>
                      <p className="text-xs text-gray-500 truncate">{row.country} — {row.purpose}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0 ml-2">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_STYLES.Preparation}`}>
                        Preparation
                      </span>
                      <span className={`text-xs ${stale ? 'text-amber-600 font-medium' : 'text-gray-400'}`}>
                        {row.notYetStarted ? 'Handed over today' : `${row.daysInStatus} day${row.daysInStatus === 1 ? '' : 's'} in Preparation`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-6">Nothing needs attention — pipeline is current.</p>
          )}
        </div>

        <div className="stat-card">
          <h3 className="text-base font-semibold text-navy mb-4">Recent Activity</h3>
          {recentActivity.length > 0 ? (
            <div className="space-y-0">
              {recentActivity.map((row) => (
                <div key={row.key} className="flex items-center justify-between py-2.5 border-b border-grey-border last:border-0">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-navy truncate mb-1">{row.name}</p>
                    <p className="flex items-center gap-1.5 text-xs">
                      <span className={`px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[row.from]}`}>{row.from}</span>
                      <span className="text-gray-300">→</span>
                      <span className={`px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[row.to]}`}>{row.to}</span>
                    </p>
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0 ml-2 whitespace-nowrap">{formatRelativeDay(row.date, now)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-6">No recent activity.</p>
          )}
        </div>
      </div>
    </div>
  );
}
