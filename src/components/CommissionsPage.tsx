import { useState, useMemo } from 'react';
import { Search, X, Edit, DollarSign, CheckCircle } from 'lucide-react';
import { CommissionRecord, CommissionStatus, ApplicationStatus } from '../types';

interface CommissionsPageProps {
  commissions: CommissionRecord[];
  onUpdateCommission: (id: string, updates: Partial<CommissionRecord>) => void;
}

const APP_STATUS_STYLES: Record<ApplicationStatus, string> = {
  Preparation: 'bg-gray-100 text-gray-600',
  Lodgement: 'bg-navy text-white',
  Success: 'bg-green-100 text-green-700',
  Refused: 'bg-red-100 text-red-700',
};

export default function CommissionsPage({ commissions, onUpdateCommission }: CommissionsPageProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | CommissionStatus>('all');
  const [editTarget, setEditTarget] = useState<CommissionRecord | null>(null);
  const [editAmount, setEditAmount] = useState('');
  const [editStatus, setEditStatus] = useState<CommissionStatus>('Pending');
  const [showToast, setShowToast] = useState(false);

  const filtered = useMemo(() => {
    return commissions.filter((c) => {
      const matchesSearch = c.studentName.toLowerCase().includes(search.toLowerCase()) ||
        c.consultant.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || c.commissionStatus === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [commissions, search, statusFilter]);

  const totalPending = commissions.filter((c) => c.commissionStatus === 'Pending').reduce((sum, c) => sum + c.amount, 0);
  const totalPaid = commissions.filter((c) => c.commissionStatus === 'Paid').reduce((sum, c) => sum + c.amount, 0);

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editTarget) {
      onUpdateCommission(editTarget.id, {
        amount: Number(editAmount),
        commissionStatus: editStatus,
      });
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2500);
      setEditTarget(null);
    }
  };

  const openEdit = (c: CommissionRecord) => {
    setEditTarget(c);
    setEditAmount(String(c.amount));
    setEditStatus(c.commissionStatus);
  };

  return (
    <div className="space-y-5">
      {/* Summary tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat-card">
          <div className="w-10 h-10 rounded-lg bg-navy/5 flex items-center justify-center mb-3">
            <DollarSign className="text-navy" size={20} />
          </div>
          <p className="text-2xl font-bold text-navy">${totalPending.toLocaleString()}</p>
          <p className="text-sm text-gray-500 mt-0.5">Pending Commissions</p>
        </div>
        <div className="stat-card">
          <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center mb-3">
            <CheckCircle className="text-green-600" size={20} />
          </div>
          <p className="text-2xl font-bold text-green-600">${totalPaid.toLocaleString()}</p>
          <p className="text-sm text-gray-500 mt-0.5">Paid Commissions</p>
        </div>
        <div className="stat-card">
          <div className="w-10 h-10 rounded-lg bg-navy/5 flex items-center justify-center mb-3">
            <DollarSign className="text-navy" size={20} />
          </div>
          <p className="text-2xl font-bold text-navy">${(totalPending + totalPaid).toLocaleString()}</p>
          <p className="text-sm text-gray-500 mt-0.5">Total Commissions</p>
        </div>
      </div>

      {/* Search & filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student or consultant"
            className="w-full pl-10 pr-4 py-2.5 border border-grey-border rounded-lg text-sm bg-white focus:outline-none focus:border-navy-light focus:ring-1 focus:ring-navy-light transition-colors"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-navy">
              <X size={16} />
            </button>
          )}
        </div>
        <div className="flex gap-1 bg-white border border-grey-border rounded-lg p-1">
          {(['all', 'Pending', 'Paid'] as const).map((opt) => (
            <button
              key={opt}
              onClick={() => setStatusFilter(opt)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                statusFilter === opt ? 'bg-navy text-white' : 'text-gray-500 hover:text-navy hover:bg-grey-bg'
              }`}
            >
              {opt === 'all' ? 'All' : opt}
            </button>
          ))}
        </div>
      </div>

      {/* Table — desktop */}
      <div className="hidden lg:block bg-white rounded-xl border border-grey-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-grey-border bg-grey-bg">
              <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Student</th>
              <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Branch</th>
              <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Consultant</th>
              <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">App Status</th>
              <th className="text-right text-xs font-semibold text-gray-500 px-5 py-3">Amount</th>
              <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Commission</th>
              <th className="text-right text-xs font-semibold text-gray-500 px-5 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id} className="border-b border-grey-border last:border-0 hover:bg-grey-bg/50 transition-colors">
                <td className="px-5 py-3.5 text-sm font-medium text-navy">{c.studentName}</td>
                <td className="px-5 py-3.5 text-sm text-gray-600">{c.branch}</td>
                <td className="px-5 py-3.5 text-sm text-gray-600">{c.consultant}</td>
                <td className="px-5 py-3.5">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${APP_STATUS_STYLES[c.applicationStatus]}`}>
                    {c.applicationStatus}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-sm font-semibold text-navy text-right">
                  ${c.amount.toLocaleString()}
                </td>
                <td className="px-5 py-3.5">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                    c.commissionStatus === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                  }`}>
                    {c.commissionStatus}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-right">
                  <button
                    onClick={() => openEdit(c)}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-navy hover:text-navy-light transition-colors"
                  >
                    <Edit size={15} />
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-sm text-gray-400">No commissions found.</div>
        )}
      </div>

      {/* Card list — mobile */}
      <div className="lg:hidden space-y-3">
        {filtered.map((c) => (
          <div key={c.id} className="bg-white rounded-xl border border-grey-border p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-sm font-semibold text-navy">{c.studentName}</p>
                <p className="text-xs text-gray-400">{c.consultant} · {c.branch}</p>
              </div>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                c.commissionStatus === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
              }`}>
                {c.commissionStatus}
              </span>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-grey-border">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${APP_STATUS_STYLES[c.applicationStatus]}`}>
                {c.applicationStatus}
              </span>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-navy">${c.amount.toLocaleString()}</span>
                <button onClick={() => openEdit(c)} className="text-sm font-medium text-navy hover:text-navy-light">
                  <Edit size={15} />
                </button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="py-12 text-center text-sm text-gray-400">No commissions found.</div>
        )}
      </div>

      {/* Edit modal */}
      {editTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-navy-dark/50 backdrop-blur-sm" onClick={() => setEditTarget(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-navy">Edit Commission</h2>
              <button onClick={() => setEditTarget(null)} className="text-gray-400 hover:text-navy transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="bg-grey-bg rounded-xl p-4 space-y-2">
                <p className="text-xs text-gray-400">Student</p>
                <p className="text-sm font-medium text-navy">{editTarget.studentName}</p>
                <p className="text-xs text-gray-400 mt-2">Consultant</p>
                <p className="text-sm font-medium text-navy">{editTarget.consultant}</p>
                <p className="text-xs text-gray-400 mt-2">Branch</p>
                <p className="text-sm font-medium text-navy">{editTarget.branch}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-navy mb-1.5">Commission Amount ($)</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                  className="w-full px-4 py-2.5 border border-grey-border rounded-lg text-sm focus:outline-none focus:border-navy-light focus:ring-1 focus:ring-navy-light transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy mb-1.5">Commission Status</label>
                <div className="flex gap-2">
                  {(['Pending', 'Paid'] as CommissionStatus[]).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setEditStatus(opt)}
                      className={`flex-1 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                        editStatus === opt
                          ? opt === 'Paid'
                            ? 'bg-green-100 text-green-700 border-green-200'
                            : 'bg-orange-100 text-orange-700 border-orange-200'
                          : 'border-grey-border text-gray-500 hover:bg-grey-bg'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditTarget(null)}
                  className="flex-1 py-2.5 border border-grey-border rounded-lg text-sm font-medium text-navy hover:bg-grey-bg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-navy text-white rounded-lg text-sm font-semibold hover:bg-navy-light transition-colors active:scale-[0.98]"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success toast */}
      {showToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] bg-green-600 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 text-sm font-medium animate-fade-in">
          <CheckCircle size={18} />
          Commission updated
        </div>
      )}
    </div>
  );
}
