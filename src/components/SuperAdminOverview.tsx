import {
  GraduationCap, FileText, CheckCircle, XCircle, Building2, Users,
  TrendingUp, TrendingDown, type LucideIcon,
} from 'lucide-react';
import { SUPER_ADMIN_STATS, MOCK_BRANCHES } from '../mockData';
import { Branch } from '../types';

const ICON_MAP: Record<string, LucideIcon> = {
  GraduationCap,
  FileText,
  CheckCircle,
  XCircle,
  Building2,
  Users,
};

export default function SuperAdminOverview() {
  const maxStudents = Math.max(...MOCK_BRANCHES.map((b) => b.activeStudents));

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="bg-navy rounded-2xl p-6 lg:p-8 text-white">
        <h2 className="text-xl lg:text-2xl font-semibold">Company Overview</h2>
        <p className="text-white/60 text-sm mt-1">
          All branches — here's what's happening across Everest Visa Consultants.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {SUPER_ADMIN_STATS.map((stat) => {
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

      {/* Branch comparison table */}
      <div className="stat-card">
        <h3 className="text-base font-semibold text-navy mb-1">Branch Performance Comparison</h3>
        <p className="text-xs text-gray-400 mb-5">Key metrics across all branches</p>

        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-grey-border">
                <th className="text-left text-xs font-semibold text-gray-500 py-2.5">Branch</th>
                <th className="text-left text-xs font-semibold text-gray-500 py-2.5">Manager</th>
                <th className="text-right text-xs font-semibold text-gray-500 py-2.5">Staff</th>
                <th className="text-left text-xs font-semibold text-gray-500 py-2.5 pl-4">Active Students</th>
                <th className="text-right text-xs font-semibold text-gray-500 py-2.5">Apps In Progress</th>
                <th className="text-right text-xs font-semibold text-gray-500 py-2.5">Visas Granted</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_BRANCHES.map((b: Branch) => (
                <tr key={b.id} className="border-b border-grey-border last:border-0">
                  <td className="py-3 text-sm font-medium text-navy">{b.name}</td>
                  <td className="py-3 text-sm text-gray-600">{b.manager || 'Unassigned'}</td>
                  <td className="py-3 text-sm text-gray-600 text-right">{b.staffCount}</td>
                  <td className="py-3 pl-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 max-w-[120px] h-2 bg-grey-bg rounded-full overflow-hidden">
                        <div
                          className="h-full bg-navy rounded-full"
                          style={{ width: `${(b.activeStudents / maxStudents) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-navy w-8">{b.activeStudents}</span>
                    </div>
                  </td>
                  <td className="py-3 text-sm text-gray-600 text-right">{b.applicationsInProgress}</td>
                  <td className="py-3 text-sm text-green-600 font-medium text-right">{b.visasGranted}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="lg:hidden space-y-3">
          {MOCK_BRANCHES.map((b: Branch) => (
            <div key={b.id} className="border border-grey-border rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-navy">{b.name}</p>
                <span className="text-xs text-gray-400">{b.manager || 'Unassigned'}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                <p>Staff: <span className="text-gray-700 font-medium">{b.staffCount}</span></p>
                <p>Students: <span className="text-gray-700 font-medium">{b.activeStudents}</span></p>
                <p>In Progress: <span className="text-gray-700 font-medium">{b.applicationsInProgress}</span></p>
                <p>Granted: <span className="text-green-600 font-medium">{b.visasGranted}</span></p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
