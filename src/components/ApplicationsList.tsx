import { useState, useMemo } from 'react';
import { Search, X, ChevronRight, ChevronDown } from 'lucide-react';
import { ApplicationRecord, MockUser, Partner } from '../types';
import ClientProfile from './ClientProfile';
import DateRangeFilter from './DateRangeFilter';
import { matchesDateRange } from '../dateFilter';
import { getClientStage, getClientStatusLabel, getStatusTone, STATUS_TONE_STYLES, ClientStage } from '../clientPipeline';

interface ApplicationsListProps {
  applications: ApplicationRecord[];
  onUpdateApplication: (id: string, updates: Partial<ApplicationRecord>) => void;
  partners: Partner[];
  currentUser: MockUser;
  branches?: string[];
  showBranchFilter?: boolean;
  /** Restricts the list to one stage (Offer/Visa) and hides the stage filter + column —
   * used when this list is reached via a stage-specific sidebar item rather than the
   * combined view. Withdrawn clients still show up under whichever stage they were in. */
  stageScope?: ClientStage;
}

type StageFilter = 'all' | ClientStage | 'Withdrawn';

const STAGE_FILTER_OPTIONS: { value: StageFilter; label: string }[] = [
  { value: 'all', label: 'All Stages' },
  { value: 'Offer', label: 'Offer Stage' },
  { value: 'Visa', label: 'Visa Stage' },
  { value: 'Withdrawn', label: 'Withdrawn' },
];

export default function ApplicationsList({ applications, onUpdateApplication, branches, showBranchFilter, partners, currentUser, stageScope }: ApplicationsListProps) {
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState<StageFilter>('all');
  const [branchFilter, setBranchFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedApp, setSelectedApp] = useState<ApplicationRecord | null>(null);

  const filtered = useMemo(() => {
    return applications.filter((a) => {
      const matchesSearch = a.name.toLowerCase().includes(search.toLowerCase());
      const matchesScope = !stageScope || getClientStage(a) === stageScope;
      const matchesStage =
        stageScope !== undefined ||
        stageFilter === 'all' ||
        (stageFilter === 'Withdrawn' ? a.withdrawn : !a.withdrawn && getClientStage(a) === stageFilter);
      const matchesBranch = !showBranchFilter || branchFilter === 'all' || a.branch === branchFilter;
      const matchesDate = matchesDateRange(a.consultationDate, dateFrom, dateTo);
      return matchesSearch && matchesScope && matchesStage && matchesBranch && matchesDate;
    });
  }, [applications, search, stageScope, stageFilter, branchFilter, showBranchFilter, dateFrom, dateTo]);

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
            placeholder="Search by name"
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

        {!stageScope && (
          <div className="relative">
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value as StageFilter)}
              className="w-full sm:w-auto appearance-none bg-white border border-grey-border rounded-lg pl-3 pr-9 py-2.5 text-sm font-medium text-navy focus:outline-none focus:border-navy-light focus:ring-1 focus:ring-navy-light transition-colors"
            >
              {STAGE_FILTER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
          </div>
        )}
        {showBranchFilter && branches && (
          <div className="relative">
            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="appearance-none bg-white border border-grey-border rounded-lg pl-3 pr-9 py-2.5 text-sm font-medium text-navy focus:outline-none focus:border-navy-light focus:ring-1 focus:ring-navy-light transition-colors"
            >
              <option value="all">All Branches</option>
              {branches.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
          </div>
        )}
        <DateRangeFilter from={dateFrom} to={dateTo} onFromChange={setDateFrom} onToChange={setDateTo} />
      </div>

      {/* Table — desktop */}
      <div className="hidden lg:block bg-white rounded-xl border border-grey-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-grey-border bg-grey-bg">
              <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Name</th>
              <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Phone</th>
              <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Country</th>
              <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Purpose</th>
              <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Counselor</th>
              <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Consultation</th>
              {showBranchFilter && <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Branch</th>}
              {!stageScope && <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Stage</th>}
              <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Status</th>
              <th className="text-right text-xs font-semibold text-gray-500 px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((a) => (
              <tr
                key={a.id}
                onClick={() => setSelectedApp(a)}
                className="border-b border-grey-border last:border-0 hover:bg-grey-bg/50 transition-colors cursor-pointer"
              >
                <td className="px-5 py-3.5">
                  <p className="text-sm font-medium text-navy">{a.name}</p>
                  <p className="text-xs text-gray-400">{a.email}</p>
                </td>
                <td className="px-5 py-3.5 text-sm text-gray-600">{a.phone}</td>
                <td className="px-5 py-3.5 text-sm text-gray-600">{a.country}</td>
                <td className="px-5 py-3.5 text-sm text-gray-600">{a.purpose}</td>
                <td className="px-5 py-3.5 text-sm text-gray-600">{a.counselor}</td>
                <td className="px-5 py-3.5 text-sm text-gray-500 whitespace-nowrap">{a.consultationDate}</td>
                {showBranchFilter && <td className="px-5 py-3.5 text-sm text-gray-600">{a.branch}</td>}
                {!stageScope && <td className="px-5 py-3.5 text-sm text-gray-600">{a.withdrawn ? '—' : getClientStage(a)}</td>}
                <td className="px-5 py-3.5">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_TONE_STYLES[getStatusTone(a)]}`}>
                    {getClientStatusLabel(a)}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-right">
                  <ChevronRight className="text-gray-300 inline" size={18} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-sm text-gray-400">No applications found.</div>
        )}
      </div>

      {/* Card list — mobile */}
      <div className="lg:hidden space-y-3">
        {filtered.map((a) => (
          <button
            key={a.id}
            onClick={() => setSelectedApp(a)}
            className="w-full text-left bg-white rounded-xl border border-grey-border p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-navy">{a.name}</p>
                <p className="text-xs text-gray-400">{a.email}</p>
              </div>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 ml-2 ${STATUS_TONE_STYLES[getStatusTone(a)]}`}>
                {getClientStatusLabel(a)}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 mb-3">
              <p>Country: <span className="text-gray-700">{a.country}</span></p>
              <p>Purpose: <span className="text-gray-700">{a.purpose}</span></p>
              <p>Counselor: <span className="text-gray-700">{a.counselor}</span></p>
              {stageScope ? (
                <p>Consultation: <span className="text-gray-700">{a.consultationDate}</span></p>
              ) : (
                <p>Stage: <span className="text-gray-700">{a.withdrawn ? '—' : getClientStage(a)}</span></p>
              )}
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-grey-border">
              <p className="text-xs text-gray-400">Tap to view details</p>
              <ChevronRight className="text-gray-300" size={16} />
            </div>
          </button>
        ))}
        {filtered.length === 0 && (
          <div className="py-12 text-center text-sm text-gray-400">No applications found.</div>
        )}
      </div>

      {/* Client profile */}
      {selectedApp && (
        <ClientProfile
          application={selectedApp}
          partners={partners}
          currentUser={currentUser}
          onClose={() => setSelectedApp(null)}
          onUpdate={(updates) => {
            onUpdateApplication(selectedApp.id, updates);
            setSelectedApp({ ...selectedApp, ...updates });
          }}
        />
      )}
    </div>
  );
}
