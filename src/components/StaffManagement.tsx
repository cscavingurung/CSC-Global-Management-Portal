import { useState, useMemo } from 'react';
import {
  UserPlus, Trash2, Search, X, Mail, Briefcase, Circle,
  ChevronDown,
} from 'lucide-react';
import { StaffMember, StaffRole, StaffStatus } from '../types';

interface StaffManagementProps {
  staff: StaffMember[];
  onAddStaff: (member: StaffMember) => void;
  onUpdateStaff: (id: string, updates: Partial<StaffMember>) => void;
  onRemoveStaff: (id: string) => void;
  branches?: string[];
  showBranchFilter?: boolean;
}

const ROLE_STYLES: Record<StaffRole, string> = {
  Receptionist: 'bg-blue-100 text-blue-700',
  Counselor: 'bg-green-100 text-green-700',
  'Application Officer': 'bg-navy text-white',
  'Branch Manager': 'bg-purple-100 text-purple-700',
};

export default function StaffManagement({ staff, onAddStaff, onUpdateStaff, onRemoveStaff, branches, showBranchFilter }: StaffManagementProps) {
  const [search, setSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<StaffMember | null>(null);
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [newStaff, setNewStaff] = useState({ name: '', email: '', role: 'Receptionist' as StaffRole, branch: (branches && branches[0]) || 'Sydney CBD' });

  const selectedStaff = staff.find((s) => s.id === selectedStaffId) ?? null;

  const filtered = useMemo(() => {
    return staff.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase());
      const matchesBranch = !showBranchFilter || branchFilter === 'all' || s.branch === branchFilter;
      return matchesSearch && matchesBranch;
    });
  }, [staff, search, branchFilter, showBranchFilter]);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const member: StaffMember = {
      id: `st${Date.now()}`,
      name: newStaff.name,
      email: newStaff.email,
      role: newStaff.role,
      status: 'Active',
      branch: newStaff.branch,
    };
    onAddStaff(member);
    setNewStaff({ name: '', email: '', role: 'Receptionist', branch: (branches && branches[0]) || 'Sydney CBD' });
    setShowAddForm(false);
  };

  const handleConfirmRemove = () => {
    if (removeTarget) {
      onRemoveStaff(removeTarget.id);
      setRemoveTarget(null);
      if (selectedStaffId === removeTarget.id) setSelectedStaffId(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header bar */}
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
        <button
          onClick={() => setShowAddForm(true)}
          className="inline-flex items-center justify-center gap-2 bg-navy text-white font-semibold px-4 py-2.5 rounded-lg text-sm hover:bg-navy-light transition-colors active:scale-[0.98] whitespace-nowrap"
        >
          <UserPlus size={16} />
          Add Staff
        </button>
      </div>

      {/* Table — desktop */}
      <div className="hidden lg:block bg-white rounded-xl border border-grey-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-grey-border bg-grey-bg">
              <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Name</th>
              <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Role</th>
              <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Email</th>
              {showBranchFilter && <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Branch</th>}
              <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Status</th>
              <th className="text-right text-xs font-semibold text-gray-500 px-5 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr
                key={s.id}
                onClick={() => setSelectedStaffId(s.id)}
                className="border-b border-grey-border last:border-0 hover:bg-grey-bg/50 transition-colors cursor-pointer"
              >
                <td className="px-5 py-3.5">
                  <p className="text-sm font-medium text-navy">{s.name}</p>
                </td>
                <td className="px-5 py-3.5">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${ROLE_STYLES[s.role]}`}>
                    {s.role}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-sm text-gray-600">{s.email}</td>
                {showBranchFilter && <td className="px-5 py-3.5 text-sm text-gray-600">{s.branch}</td>}
                <td className="px-5 py-3.5">
                  <span className="inline-flex items-center gap-1.5 text-sm">
                    <Circle
                      size={8}
                      className={s.status === 'Active' ? 'text-green-500 fill-green-500' : 'text-gray-300 fill-gray-300'}
                    />
                    <span className={s.status === 'Active' ? 'text-gray-600' : 'text-gray-400'}>
                      {s.status}
                    </span>
                  </span>
                </td>
                <td className="px-5 py-3.5 text-right">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setRemoveTarget(s);
                    }}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-red-500 hover:text-red-600 transition-colors"
                  >
                    <Trash2 size={15} />
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-sm text-gray-400">No staff found.</div>
        )}
      </div>

      {/* Card list — mobile */}
      <div className="lg:hidden space-y-3">
        {filtered.map((s) => (
          <div
            key={s.id}
            onClick={() => setSelectedStaffId(s.id)}
            className="bg-white rounded-xl border border-grey-border p-4 cursor-pointer"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-navy">{s.name}</p>
                <p className="text-xs text-gray-400">{s.email}</p>
              </div>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 ml-2 ${ROLE_STYLES[s.role]}`}>
                {s.role}
              </span>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-grey-border">
              <span className="inline-flex items-center gap-1.5 text-sm">
                <Circle
                  size={8}
                  className={s.status === 'Active' ? 'text-green-500 fill-green-500' : 'text-gray-300 fill-gray-300'}
                />
                <span className={s.status === 'Active' ? 'text-gray-600' : 'text-gray-400'}>
                  {s.status}
                </span>
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setRemoveTarget(s);
                }}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-red-500 hover:text-red-600 transition-colors"
              >
                <Trash2 size={15} />
                Remove
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="py-12 text-center text-sm text-gray-400">No staff found.</div>
        )}
      </div>

      {/* Add staff modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-navy-dark/50 backdrop-blur-sm" onClick={() => setShowAddForm(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-navy">Add Staff Member</h2>
              <button onClick={() => setShowAddForm(false)} className="text-gray-400 hover:text-navy transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-navy mb-1.5">Name</label>
                <input
                  type="text"
                  required
                  value={newStaff.name}
                  onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                  placeholder="Full name"
                  className="w-full px-4 py-2.5 border border-grey-border rounded-lg text-sm focus:outline-none focus:border-navy-light focus:ring-1 focus:ring-navy-light transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy mb-1.5">Email</label>
                <input
                  type="email"
                  required
                  value={newStaff.email}
                  onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                  placeholder="name@everestvisa.com"
                  className="w-full px-4 py-2.5 border border-grey-border rounded-lg text-sm focus:outline-none focus:border-navy-light focus:ring-1 focus:ring-navy-light transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy mb-1.5">Role</label>
                <div className="relative">
                  <select
                    value={newStaff.role}
                    onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value as StaffRole })}
                    className="w-full px-4 py-2.5 border border-grey-border rounded-lg text-sm focus:outline-none focus:border-navy-light focus:ring-1 focus:ring-navy-light transition-colors appearance-none bg-white"
                  >
                    <option value="Receptionist">Receptionist</option>
                    <option value="Counselor">Counselor</option>
                    <option value="Application Officer">Application Officer</option>
                    {showBranchFilter && <option value="Branch Manager">Branch Manager</option>}
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                </div>
              </div>
              {showBranchFilter && branches && (
                <div>
                  <label className="block text-sm font-medium text-navy mb-1.5">Branch</label>
                  <div className="relative">
                    <select
                      value={newStaff.branch}
                      onChange={(e) => setNewStaff({ ...newStaff, branch: e.target.value })}
                      className="w-full px-4 py-2.5 border border-grey-border rounded-lg text-sm focus:outline-none focus:border-navy-light focus:ring-1 focus:ring-navy-light transition-colors appearance-none bg-white"
                    >
                      {branches.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                  </div>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 py-2.5 border border-grey-border rounded-lg text-sm font-medium text-navy hover:bg-grey-bg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-navy text-white rounded-lg text-sm font-semibold hover:bg-navy-light transition-colors active:scale-[0.98]"
                >
                  Add Staff
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Remove confirmation dialog */}
      {removeTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-navy-dark/50 backdrop-blur-sm" onClick={() => setRemoveTarget(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
            <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="text-red-500" size={26} />
            </div>
            <h3 className="text-base font-semibold text-navy text-center mb-2">
              Remove {removeTarget.name}?
            </h3>
            <p className="text-sm text-gray-500 text-center mb-6">
              Remove {removeTarget.name} from this branch? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setRemoveTarget(null)}
                className="flex-1 py-2.5 border border-grey-border rounded-lg text-sm font-medium text-navy hover:bg-grey-bg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRemove}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Staff info side panel */}
      {selectedStaff && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-navy-dark/50 backdrop-blur-sm" onClick={() => setSelectedStaffId(null)} />
          <div className="relative w-full sm:max-w-sm bg-white shadow-2xl h-full overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-grey-border sticky top-0 bg-white z-10">
              <h2 className="text-base font-semibold text-navy">Staff Details</h2>
              <button onClick={() => setSelectedStaffId(null)} className="text-gray-400 hover:text-navy transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="px-5 py-5">
              {/* Avatar */}
              <div className="flex flex-col items-center mb-6">
                <div className="w-16 h-16 rounded-full bg-navy/10 flex items-center justify-center mb-3">
                  <span className="text-xl font-semibold text-navy">
                    {selectedStaff.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                  </span>
                </div>
                <p className="text-base font-semibold text-navy">{selectedStaff.name}</p>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full mt-1.5 ${ROLE_STYLES[selectedStaff.role]}`}>
                  {selectedStaff.role}
                </span>
              </div>

              {/* Info rows */}
              <div className="bg-grey-bg rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center flex-shrink-0">
                    <Mail className="text-navy" size={15} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-400">Email</p>
                    <p className="text-sm font-medium text-navy truncate">{selectedStaff.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center flex-shrink-0">
                    <Briefcase className="text-navy" size={15} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-400">Branch</p>
                    <p className="text-sm font-medium text-navy">{selectedStaff.branch}</p>
                  </div>
                </div>
              </div>

              {/* Status control */}
              <div className="mt-5">
                <label className="block text-sm font-medium text-navy mb-1.5">Status</label>
                <div className="flex gap-2">
                  {(['Active', 'Inactive'] as StaffStatus[]).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => onUpdateStaff(selectedStaff.id, { status: opt })}
                      className={`px-4 py-1.5 rounded-full border text-sm font-medium transition-colors ${
                        selectedStaff.status === opt
                          ? opt === 'Active'
                            ? 'bg-green-100 text-green-700 border-green-200'
                            : 'bg-gray-100 text-gray-600 border-gray-200'
                          : 'border-grey-border text-gray-500 hover:bg-grey-bg'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
