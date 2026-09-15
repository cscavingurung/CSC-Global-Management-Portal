import { useState, useMemo } from 'react';
import { Search, X, UserCheck, ChevronDown } from 'lucide-react';
import { IntakeStudent, Counselor } from '../types';
import { MOCK_COUNSELORS } from '../mockData';
import AssignCounselorModal from './AssignCounselorModal';

interface StudentListProps {
  students: IntakeStudent[];
  onAssign: (studentId: string, counselorName: string) => void;
  branches?: string[];
  showBranchFilter?: boolean;
}

type StatusFilter = 'all' | 'New' | 'Assigned';

export default function StudentList({ students, onAssign, branches, showBranchFilter }: StudentListProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [branchFilter, setBranchFilter] = useState<string>('all');
  const [assignStudent, setAssignStudent] = useState<IntakeStudent | null>(null);

  const filtered = useMemo(() => {
    return students.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
      const matchesBranch = !showBranchFilter || branchFilter === 'all' || s.branch === branchFilter;
      return matchesSearch && matchesStatus && matchesBranch;
    });
  }, [students, search, statusFilter, branchFilter, showBranchFilter]);

  const statusOptions: { value: StatusFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'New', label: 'New' },
    { value: 'Assigned', label: 'Assigned' },
  ];

  return (
    <div className="space-y-5">
      {/* Search & filter bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email"
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

        <div className="flex gap-1 bg-white border border-grey-border rounded-lg p-1">
          {statusOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setStatusFilter(opt.value)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                statusFilter === opt.value
                  ? 'bg-navy text-white'
                  : 'text-gray-500 hover:text-navy hover:bg-grey-bg'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
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
              <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Submitted</th>
              <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Status</th>
              {showBranchFilter && <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Branch</th>}
              <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Counselor</th>
              <th className="text-right text-xs font-semibold text-gray-500 px-5 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr key={s.id} className="border-b border-grey-border last:border-0 hover:bg-grey-bg/50 transition-colors">
                <td className="px-5 py-3.5">
                  <p className="text-sm font-medium text-navy">{s.name}</p>
                  <p className="text-xs text-gray-400">{s.email}</p>
                </td>
                <td className="px-5 py-3.5 text-sm text-gray-600">{s.phone}</td>
                <td className="px-5 py-3.5 text-sm text-gray-600">{s.country}</td>
                <td className="px-5 py-3.5 text-sm text-gray-600">{s.purpose}</td>
                <td className="px-5 py-3.5 text-sm text-gray-500 whitespace-nowrap">{s.submittedAt}</td>
                <td className="px-5 py-3.5">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                    s.status === 'New' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {s.status}
                  </span>
                </td>
                {showBranchFilter && <td className="px-5 py-3.5 text-sm text-gray-600">{s.branch}</td>}
                <td className="px-5 py-3.5 text-sm text-gray-600">
                  {s.assignedCounselor || <span className="text-gray-300">—</span>}
                </td>
                <td className="px-5 py-3.5 text-right">
                  {s.status === 'New' ? (
                    <button
                      onClick={() => setAssignStudent(s)}
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-navy hover:text-navy-light transition-colors"
                    >
                      <UserCheck size={15} />
                      Assign
                    </button>
                  ) : (
                    <button
                      onClick={() => setAssignStudent(s)}
                      className="text-sm text-gray-400 hover:text-navy transition-colors"
                    >
                      Reassign
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-sm text-gray-400">No students found.</div>
        )}
      </div>

      {/* Card list — mobile */}
      <div className="lg:hidden space-y-3">
        {filtered.map((s) => (
          <div key={s.id} className="bg-white rounded-xl border border-grey-border p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-navy">{s.name}</p>
                <p className="text-xs text-gray-400">{s.email}</p>
              </div>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 ml-2 ${
                s.status === 'New' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
              }`}>
                {s.status}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 mb-3">
              <p>Phone: <span className="text-gray-700">{s.phone}</span></p>
              <p>Country: <span className="text-gray-700">{s.country}</span></p>
              <p>Purpose: <span className="text-gray-700">{s.purpose}</span></p>
              <p>Submitted: <span className="text-gray-700">{s.submittedAt}</span></p>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-grey-border">
              <p className="text-xs text-gray-500">
                {s.assignedCounselor ? `Counselor: ${s.assignedCounselor}` : 'No counselor assigned'}
              </p>
              <button
                onClick={() => setAssignStudent(s)}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-navy hover:text-navy-light transition-colors"
              >
                <UserCheck size={15} />
                {s.status === 'New' ? 'Assign' : 'Reassign'}
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="py-12 text-center text-sm text-gray-400">No students found.</div>
        )}
      </div>

      {/* Assign modal */}
      {assignStudent && (
        <AssignCounselorModal
          student={assignStudent}
          counselors={MOCK_COUNSELORS}
          onClose={() => setAssignStudent(null)}
          onConfirm={(counselorName) => {
            onAssign(assignStudent.id, counselorName);
            setAssignStudent(null);
          }}
        />
      )}
    </div>
  );
}
