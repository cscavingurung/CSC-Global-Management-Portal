import { useState, useMemo } from 'react';
import { Search, X, Eye, CalendarDays, FileText } from 'lucide-react';
import { CounselorStudent } from '../types';
import StudentProfile from './StudentProfile';
import DateRangeFilter from './DateRangeFilter';
import { matchesDateRange } from '../dateFilter';

interface ConsultationsPageProps {
  students: CounselorStudent[];
  onUpdateStudent: (id: string, updates: Partial<CounselorStudent>) => void;
}

export default function ConsultationsPage({ students, onUpdateStudent }: ConsultationsPageProps) {
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [viewStudent, setViewStudent] = useState<CounselorStudent | null>(null);

  const completed = useMemo(() => {
    return students
      .filter((s) => s.outcome === 'Proceeding')
      .filter((s) => s.name.toLowerCase().includes(search.toLowerCase()))
      .filter((s) => matchesDateRange(s.completedDate, dateFrom, dateTo));
  }, [students, search, dateFrom, dateTo]);

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
          {completed.map((s) => (
            <div
              key={s.id}
              className="bg-white rounded-xl border border-grey-border p-4 flex items-center gap-4"
            >
              <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                <CalendarDays className="text-green-600" size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-navy truncate">{s.name}</p>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 bg-green-100 text-green-700">
                    Proceeding
                  </span>
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
          ))}
        </div>
      ) : search || dateFrom || dateTo ? (
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
