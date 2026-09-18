import { useState, useMemo } from 'react';
import { Search, X, Eye, CalendarDays, FileText, ChevronDown } from 'lucide-react';
import { CounselorStudent, ApplicationRecord, OfferStatus, VisaStageStatus } from '../types';
import StudentProfile from './StudentProfile';
import DateRangeFilter from './DateRangeFilter';
import { matchesDateRange } from '../dateFilter';
import { getActiveOfferApplication, OFFER_STATUS_STYLES, VISA_STATUS_STYLES } from '../clientPipeline';

interface ConsultationsPageProps {
  students: CounselorStudent[];
  applications: ApplicationRecord[];
  onUpdateStudent: (id: string, updates: Partial<CounselorStudent>) => void;
}

type OfferFilter = 'all' | 'none' | OfferStatus;
type VisaFilter = 'all' | 'none' | VisaStageStatus;

const OFFER_FILTER_OPTIONS: { value: OfferFilter; label: string }[] = [
  { value: 'all', label: 'All Offer Statuses' },
  { value: 'none', label: 'No Application Yet' },
  { value: 'Enrolled', label: 'Enrolled' },
  { value: 'Applied to Institution', label: 'Applied to Institution' },
  { value: 'Offer Received', label: 'Offer Received' },
  { value: 'Rejected', label: 'Rejected' },
];

const VISA_FILTER_OPTIONS: { value: VisaFilter; label: string }[] = [
  { value: 'all', label: 'All Visa Statuses' },
  { value: 'none', label: 'No Application Yet' },
  { value: 'Preparing Documents', label: 'Preparing Documents' },
  { value: 'Ready for Visa', label: 'Ready for Visa' },
  { value: 'Visa Applied', label: 'Visa Applied' },
  { value: 'Visa Approved', label: 'Visa Approved' },
  { value: 'Visa Refused', label: 'Visa Refused' },
];

function getOfferStatus(app: ApplicationRecord | undefined): 'none' | OfferStatus {
  const active = app ? getActiveOfferApplication(app) : null;
  return active ? active.status : 'none';
}

function getVisaStatus(app: ApplicationRecord | undefined): 'none' | VisaStageStatus {
  return app?.visaApplication ? app.visaApplication.status : 'none';
}

export default function ConsultationsPage({ students, applications, onUpdateStudent }: ConsultationsPageProps) {
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [offerFilter, setOfferFilter] = useState<OfferFilter>('all');
  const [visaFilter, setVisaFilter] = useState<VisaFilter>('all');
  const [viewStudent, setViewStudent] = useState<CounselorStudent | null>(null);

  // A client's downstream application isn't linked by id (it's created fresh once
  // consultation completes), so email is the only reliable key to join the two records.
  const applicationByEmail = useMemo(() => {
    const map = new Map<string, ApplicationRecord>();
    applications.forEach((a) => map.set(a.email.trim().toLowerCase(), a));
    return map;
  }, [applications]);

  const isFiltering = !!(search || dateFrom || dateTo || offerFilter !== 'all' || visaFilter !== 'all');

  const completed = useMemo(() => {
    return students
      .filter((s) => s.outcome === 'Proceeding')
      .filter((s) => s.name.toLowerCase().includes(search.toLowerCase()))
      .filter((s) => matchesDateRange(s.completedDate, dateFrom, dateTo))
      .filter((s) => offerFilter === 'all' || getOfferStatus(applicationByEmail.get(s.email.trim().toLowerCase())) === offerFilter)
      .filter((s) => visaFilter === 'all' || getVisaStatus(applicationByEmail.get(s.email.trim().toLowerCase())) === visaFilter);
  }, [students, search, dateFrom, dateTo, offerFilter, visaFilter, applicationByEmail]);

  return (
    <div className="space-y-5">
      {/* Search & filter bar */}
      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search enrolled clients"
            className="w-full pl-10 pr-4 py-2.5 border border-grey-border rounded-lg text-sm bg-white focus:outline-none focus:border-navy-light focus:ring-1 focus:ring-navy-light transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-navy"
            >
              <X size={16} />
            </button>
          )}
        </div>
        <div className="relative">
          <select
            value={offerFilter}
            onChange={(e) => setOfferFilter(e.target.value as OfferFilter)}
            className="w-full sm:w-auto appearance-none bg-white border border-grey-border rounded-lg pl-3 pr-9 py-2.5 text-sm font-medium text-navy focus:outline-none focus:border-navy-light focus:ring-1 focus:ring-navy-light transition-colors"
          >
            {OFFER_FILTER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
        </div>
        <div className="relative">
          <select
            value={visaFilter}
            onChange={(e) => setVisaFilter(e.target.value as VisaFilter)}
            className="w-full sm:w-auto appearance-none bg-white border border-grey-border rounded-lg pl-3 pr-9 py-2.5 text-sm font-medium text-navy focus:outline-none focus:border-navy-light focus:ring-1 focus:ring-navy-light transition-colors"
          >
            {VISA_FILTER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
        </div>
        <DateRangeFilter from={dateFrom} to={dateTo} onFromChange={setDateFrom} onToChange={setDateTo} />
      </div>

      {/* Summary */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <FileText size={16} className="text-navy" />
        <span>{completed.length} enrolled client{completed.length !== 1 ? 's' : ''}</span>
      </div>

      {/* List */}
      {completed.length > 0 ? (
        <div className="space-y-3">
          {completed.map((s) => {
            const app = applicationByEmail.get(s.email.trim().toLowerCase());
            const offerStatus = getOfferStatus(app);
            const visaStatus = getVisaStatus(app);
            return (
              <div
                key={s.id}
                className="bg-white rounded-xl border border-grey-border p-4 flex items-center gap-4"
              >
                <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                  <CalendarDays className="text-green-600" size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-navy truncate">{s.name}</p>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 bg-green-100 text-green-700">
                      Proceeding
                    </span>
                    {app?.withdrawn ? (
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 bg-gray-100 text-gray-500">
                        Withdrawn
                      </span>
                    ) : (
                      <>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${offerStatus === 'none' ? 'bg-gray-100 text-gray-500' : OFFER_STATUS_STYLES[offerStatus]}`}>
                          Offer: {offerStatus === 'none' ? 'Not Started' : offerStatus}
                        </span>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${visaStatus === 'none' ? 'bg-gray-100 text-gray-500' : VISA_STATUS_STYLES[visaStatus]}`}>
                          Visa: {visaStatus === 'none' ? 'Not Started' : visaStatus}
                        </span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                    <span>Completed: {s.completedDate}</span>
                    <span className="text-gray-300">·</span>
                    <span className="truncate">{s.country} — {s.purpose}</span>
                  </div>
                </div>
                <button
                  onClick={() => setViewStudent(s)}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-navy hover:text-navy-light transition-colors flex-shrink-0"
                >
                  <Eye size={15} />
                  <span className="hidden sm:inline">View Profile</span>
                </button>
              </div>
            );
          })}
        </div>
      ) : isFiltering ? (
        <div className="py-12 text-center text-sm text-gray-400">No consultations found.</div>
      ) : (
        <div className="py-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-navy/5 flex items-center justify-center mx-auto mb-4">
            <CalendarDays className="text-navy/40" size={28} />
          </div>
          <p className="text-sm text-gray-400">No enrolled clients yet.</p>
        </div>
      )}

      {/* Detail drawer */}
      {viewStudent && (
        <StudentProfile
          student={viewStudent}
          applications={applications}
          onClose={() => setViewStudent(null)}
          onUpdate={(updates) => {
            onUpdateStudent(viewStudent.id, updates);
            setViewStudent({ ...viewStudent, ...updates });
          }}
        />
      )}
    </div>
  );
}
