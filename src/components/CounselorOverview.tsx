import { useMemo } from 'react';
import { GraduationCap, Clock, CheckCircle, FileText, type LucideIcon } from 'lucide-react';
import { ApplicationRecord, ApplicationStatus, ConsultationStatus, CounselorStudent } from '../types';
import { parseSubmittedAt, dateKey } from '../dateTime';

interface CounselorOverviewProps {
  counselorName: string;
  counselorStudents: CounselorStudent[];
  applications: ApplicationRecord[];
}

const CONSULTATION_STATUS_STYLES: Record<ConsultationStatus, string> = {
  'Awaiting Consultation': 'bg-orange-100 text-orange-700',
  'In Progress': 'bg-blue-100 text-blue-700',
  'Follow Up': 'bg-purple-100 text-purple-700',
  'Consultation Complete': 'bg-green-100 text-green-700',
};

const APPLICATION_STATUS_STYLES: Record<ApplicationStatus, string> = {
  Preparation: 'bg-gray-100 text-gray-600',
  Lodgement: 'bg-navy text-white',
  Success: 'bg-green-100 text-green-700',
  Refused: 'bg-red-100 text-red-700',
};

interface StatCardDef {
  key: string;
  icon: LucideIcon;
  value: string;
  label: string;
  trend: string;
}

function monthKey(dateStr: string): string {
  return dateStr.slice(0, 7);
}

function prevMonthKey(dateStr: string): string {
  const [y, m] = dateStr.split('-').map(Number);
  const d = new Date(y, m - 2, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

// statusHistory entries are stored as "Sept 14" with no year (see mockData.ts) — the whole
// app's mock data is fictionally set in 2026, so that's assumed here too.
function latestHistoryDate(app: ApplicationRecord): Date | null {
  const last = app.statusHistory[app.statusHistory.length - 1];
  if (!last) return null;
  const parsed = new Date(`${last.date}, 2026`);
  return isNaN(parsed.getTime()) ? null : parsed;
}

export default function CounselorOverview({ counselorName, counselorStudents, applications }: CounselorOverviewProps) {
  const myStudents = useMemo(
    () => counselorStudents.filter((s) => s.assignedCounselor === counselorName),
    [counselorStudents, counselorName]
  );

  const myApplications = useMemo(
    () =>
      applications
        .filter((a) => a.counselor === counselorName)
        .map((a) => ({ app: a, date: latestHistoryDate(a) }))
        .sort((a, b) => (b.date?.getTime() ?? 0) - (a.date?.getTime() ?? 0))
        .map((x) => x.app),
    [applications, counselorName]
  );

  const myConsultations = useMemo(
    () =>
      myStudents
        .filter((s) => s.consultationStatus !== 'Consultation Complete')
        .sort((a, b) => (a.assignedDate < b.assignedDate ? -1 : a.assignedDate > b.assignedDate ? 1 : 0)),
    [myStudents]
  );

  // Treat the most recent submission among this counselor's students as "now" — the mock
  // dataset has no live clock, so the latest timestamp anchors "this month" / wait times.
  const now = useMemo(() => {
    const timestamps = myStudents.map((s) => parseSubmittedAt(s.submittedAt)).filter((d): d is Date => d !== null);
    if (timestamps.length === 0) return new Date();
    return timestamps.reduce((latest, d) => (d > latest ? d : latest), timestamps[0]);
  }, [myStudents]);

  const stats = useMemo<StatCardDef[]>(() => {
    const awaiting = myStudents.filter((s) => s.consultationStatus === 'Awaiting Consultation');
    const inProgress = myStudents.filter((s) => s.consultationStatus === 'In Progress');
    const awaitingOver24h = awaiting.filter((s) => {
      const submitted = parseSubmittedAt(s.submittedAt);
      return submitted !== null && now.getTime() - submitted.getTime() > 24 * 60 * 60 * 1000;
    }).length;

    const nowKey = dateKey(now);
    const completed = myStudents.filter((s) => s.consultationStatus === 'Consultation Complete' && s.completedDate);
    const completedThisMonth = completed.filter((s) => monthKey(s.completedDate as string) === monthKey(nowKey)).length;
    const completedLastMonth = completed.filter((s) => monthKey(s.completedDate as string) === prevMonthKey(nowKey)).length;
    const completedDiff = completedThisMonth - completedLastMonth;
    const completedTrend =
      completedDiff > 0 ? `+${completedDiff} vs last month` : completedDiff < 0 ? `${completedDiff} vs last month` : 'Same as last month';

    const inLodgement = myApplications.filter((a) => a.status === 'Lodgement').length;

    return [
      {
        key: 'my-students',
        icon: GraduationCap,
        value: String(myStudents.length),
        label: 'My Students',
        trend: `${inProgress.length} in progress`,
      },
      {
        key: 'awaiting',
        icon: Clock,
        value: String(awaiting.length),
        label: 'Awaiting Consultation',
        trend: awaitingOver24h === 0 ? 'None waiting over 24 hrs' : `${awaitingOver24h} waiting over 24 hrs`,
      },
      {
        key: 'completed',
        icon: CheckCircle,
        value: String(completedThisMonth),
        label: 'Completed This Month',
        trend: completedTrend,
      },
      {
        key: 'in-application',
        icon: FileText,
        value: String(myApplications.length),
        label: 'In Application',
        trend: inLodgement === 0 ? 'None in lodgement' : `${inLodgement} in lodgement`,
      },
    ];
  }, [myStudents, myApplications, now]);

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="bg-navy rounded-2xl p-6 lg:p-8 text-white">
        <h2 className="text-xl lg:text-2xl font-semibold">Welcome back</h2>
        <p className="text-white/60 text-sm mt-1">Here's your caseload today.</p>
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

      {/* Consultations + applications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="stat-card">
          <h3 className="text-base font-semibold text-navy mb-4">Upcoming Students</h3>
          {myConsultations.length > 0 ? (
            <div className="space-y-0">
              {myConsultations.map((s) => (
                <div key={s.id} className="flex items-center justify-between py-2.5 border-b border-grey-border last:border-0">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-navy truncate">{s.name}</p>
                    <p className="text-xs text-gray-500 truncate">{s.country} — {s.purpose}</p>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 ml-2 ${CONSULTATION_STATUS_STYLES[s.consultationStatus]}`}>
                    {s.consultationStatus}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-6">No pending consultations.</p>
          )}
        </div>

        <div className="stat-card">
          <h3 className="text-base font-semibold text-navy mb-4">My Clients' Applications</h3>
          {myApplications.length > 0 ? (
            <div className="space-y-0">
              {myApplications.map((a) => (
                <div key={a.id} className="flex items-center justify-between py-2.5 border-b border-grey-border last:border-0">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-navy truncate">{a.name}</p>
                    <p className="text-xs text-gray-500 truncate">{a.country} — {a.purpose}</p>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 ml-2 ${APPLICATION_STATUS_STYLES[a.status]}`}>
                    {a.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-6">No students in application stage.</p>
          )}
        </div>
      </div>
    </div>
  );
}
