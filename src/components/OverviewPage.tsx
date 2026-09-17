import { FileText, UserPlus, CheckCircle, Clock, TrendingUp, TrendingDown, type LucideIcon } from 'lucide-react';
import { OVERVIEW_STATS, type StatCard } from '../mockData';
import { CounselorStudent, ConsultationStatus } from '../types';

const ICON_MAP: Record<string, LucideIcon> = {
  FileText,
  UserPlus,
  CheckCircle,
  Clock,
};

const CONSULTATION_STATUS_STYLES: Record<ConsultationStatus, string> = {
  'Awaiting Consultation': 'bg-orange-100 text-orange-700',
  'In Progress': 'bg-blue-100 text-blue-700',
  'Follow Up': 'bg-purple-100 text-purple-700',
  'Consultation Complete': 'bg-green-100 text-green-700',
};

interface OverviewPageProps {
  upcomingConsultations: CounselorStudent[];
}

export default function OverviewPage({ upcomingConsultations }: OverviewPageProps) {
  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="bg-navy rounded-2xl p-6 lg:p-8 text-white">
        <h2 className="text-xl lg:text-2xl font-semibold">Welcome back</h2>
        <p className="text-white/60 text-sm mt-1">
          Here's what's happening across your consultancy today.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {OVERVIEW_STATS.map((stat: StatCard) => {
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

      {/* Recent activity placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="stat-card">
          <h3 className="text-base font-semibold text-navy mb-4">Recent Applications</h3>
          <div className="space-y-3">
            {[
              { name: 'Arjun Mehta', type: 'Student Visa — Australia', status: 'In Review', color: 'bg-blue-100 text-blue-700' },
              { name: 'Lina Zhang', type: 'Skilled Migration — Canada', status: 'Lodged', color: 'bg-green-100 text-green-700' },
              { name: 'Mohammed Ali', type: 'Tourist Visa — USA', status: 'Granted', color: 'bg-green-100 text-green-700' },
              { name: 'Sara Khan', type: 'Partner Visa — Australia', status: 'Pending', color: 'bg-orange-100 text-orange-700' },
            ].map((app) => (
              <div key={app.name} className="flex items-center justify-between py-2.5 border-b border-grey-border last:border-0">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-navy truncate">{app.name}</p>
                  <p className="text-xs text-gray-500 truncate">{app.type}</p>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 ${app.color}`}>
                  {app.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="stat-card">
          <h3 className="text-base font-semibold text-navy mb-4">Upcoming Consultations</h3>
          {upcomingConsultations.length > 0 ? (
            <div className="space-y-3">
              {upcomingConsultations.slice(0, 5).map((s) => (
                <div key={s.id} className="flex items-center justify-between py-2.5 border-b border-grey-border last:border-0">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-navy truncate">{s.name}</p>
                    <p className="text-xs text-gray-500 truncate">{s.assignedCounselor} · {s.country} — {s.purpose}</p>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 ${CONSULTATION_STATUS_STYLES[s.consultationStatus]}`}>
                    {s.consultationStatus}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-6">No upcoming consultations.</p>
          )}
        </div>
      </div>
    </div>
  );
}
