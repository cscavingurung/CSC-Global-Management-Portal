import {
  GraduationCap, CalendarDays, FileText, CheckCircle, XCircle,
  TrendingUp, TrendingDown, UserCheck, RefreshCw, UserPlus, ClipboardList,
  type LucideIcon,
} from 'lucide-react';
import { BRANCH_MANAGER_STATS, MOCK_ACTIVITY_FEED } from '../mockData';
import { ActivityEntry } from '../types';

const ICON_MAP: Record<string, LucideIcon> = {
  GraduationCap,
  CalendarDays,
  FileText,
  CheckCircle,
  XCircle,
};

const ACTIVITY_ICONS: Record<ActivityEntry['type'], LucideIcon> = {
  assignment: UserCheck,
  status: RefreshCw,
  intake: UserPlus,
  consultation: ClipboardList,
};

const ACTIVITY_COLORS: Record<ActivityEntry['type'], string> = {
  assignment: 'bg-blue-50 text-blue-600',
  status: 'bg-navy/5 text-navy',
  intake: 'bg-green-50 text-green-600',
  consultation: 'bg-orange-50 text-orange-600',
};

export default function BranchManagerOverview() {
  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="bg-navy rounded-2xl p-6 lg:p-8 text-white">
        <h2 className="text-xl lg:text-2xl font-semibold">Branch Overview</h2>
        <p className="text-white/60 text-sm mt-1">
          Sydney CBD — here's what's happening across your branch today.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {BRANCH_MANAGER_STATS.map((stat) => {
          const Icon = ICON_MAP[stat.icon];
          return (
            <div key={stat.label} className="stat-card">
              <div className="flex items-start justify-between mb-4">
                <div className="w-11 h-11 rounded-lg bg-navy/5 flex items-center justify-center">
                  <Icon className="text-navy" size={22} />
                </div>
                <div className={`flex items-center gap-1 text-xs font-medium ${stat.trendUp ? 'text-green-600' : 'text-orange-600'}`}>
                  {stat.trendUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                </div>
              </div>
              <p className="text-3xl font-bold text-navy">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
              <p className={`text-xs mt-2 ${stat.trendUp ? 'text-green-600' : 'text-orange-600'}`}>
                {stat.trend}
              </p>
            </div>
          );
        })}
      </div>

      {/* Recent activity feed */}
      <div className="stat-card">
        <h3 className="text-base font-semibold text-navy mb-4">Recent Activity</h3>
        <div className="space-y-1">
          {MOCK_ACTIVITY_FEED.map((entry, idx) => {
            const Icon = ACTIVITY_ICONS[entry.type];
            const colorClass = ACTIVITY_COLORS[entry.type];
            return (
              <div
                key={entry.id}
                className="flex items-center gap-3 py-3 border-b border-grey-border last:border-0"
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                  <Icon size={17} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-navy">{entry.message}</p>
                </div>
                <span className="text-xs text-gray-400 flex-shrink-0">{entry.timestamp}</span>
                {idx === 0 && (
                  <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
