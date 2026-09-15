import { useState } from 'react';
import { CheckCircle, AlertTriangle } from 'lucide-react';
import { ApplicationRecord, ApplicationStatus, StatusHistoryEntry } from '../types';

interface StatusUpdatesKanbanProps {
  applications: ApplicationRecord[];
  onUpdateApplication: (id: string, updates: Partial<ApplicationRecord>) => void;
}

const COLUMNS: { status: ApplicationStatus; label: string; dotColor: string; headerColor: string }[] = [
  { status: 'Preparation', label: 'Preparation', dotColor: 'bg-gray-400', headerColor: 'text-gray-600' },
  { status: 'Lodgement', label: 'Lodgement', dotColor: 'bg-navy', headerColor: 'text-navy' },
  { status: 'Success', label: 'Success', dotColor: 'bg-green-500', headerColor: 'text-green-600' },
  { status: 'Refused', label: 'Refused', dotColor: 'bg-red-500', headerColor: 'text-red-600' },
];

const TERMINAL_STATUSES: ApplicationStatus[] = ['Success', 'Refused'];

export default function StatusUpdatesKanban({ applications, onUpdateApplication }: StatusUpdatesKanbanProps) {
  const [pendingMove, setPendingMove] = useState<{ app: ApplicationRecord; newStatus: ApplicationStatus } | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [dropdownOpenFor, setDropdownOpenFor] = useState<string | null>(null);

  const showToastMessage = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  const applyMove = (app: ApplicationRecord, newStatus: ApplicationStatus) => {
    const now = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const historyEntry: StatusHistoryEntry = { status: newStatus, date: now };
    onUpdateApplication(app.id, {
      status: newStatus,
      statusHistory: [...app.statusHistory, historyEntry],
    });
    showToastMessage(`${app.name} moved to ${newStatus}`);
  };

  const handleMove = (app: ApplicationRecord, newStatus: ApplicationStatus) => {
    if (newStatus === app.status) return;
    setDropdownOpenFor(null);
    if (TERMINAL_STATUSES.includes(newStatus)) {
      setPendingMove({ app, newStatus });
    } else {
      applyMove(app, newStatus);
    }
  };

  const confirmMove = () => {
    if (pendingMove) {
      applyMove(pendingMove.app, pendingMove.newStatus);
      setPendingMove(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Kanban board */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {COLUMNS.map((col) => {
          const colApps = applications.filter((a) => a.status === col.status);
          return (
            <div key={col.status} className="bg-grey-bg rounded-xl border border-grey-border flex flex-col min-h-[200px]">
              {/* Column header */}
              <div className="px-4 py-3 border-b border-grey-border flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${col.dotColor}`} />
                <h3 className={`text-sm font-semibold ${col.headerColor}`}>{col.label}</h3>
                <span className="ml-auto text-xs font-medium text-gray-400 bg-white px-2 py-0.5 rounded-full">
                  {colApps.length}
                </span>
              </div>

              {/* Cards */}
              <div className="p-3 space-y-2.5 flex-1">
                {colApps.map((app) => (
                  <div key={app.id} className="bg-white rounded-lg border border-grey-border p-3.5 group">
                    <div className="flex items-start justify-between mb-2">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-navy truncate">{app.name}</p>
                        <p className="text-xs text-gray-400 truncate">{app.country} — {app.purpose}</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mb-3">Counselor: {app.counselor}</p>

                    {/* Move dropdown */}
                    <div className="relative">
                      <button
                        onClick={() => setDropdownOpenFor(dropdownOpenFor === app.id ? null : app.id)}
                        className="w-full text-xs font-medium text-navy border border-grey-border rounded-md py-1.5 px-2.5 hover:bg-grey-bg transition-colors flex items-center justify-between"
                      >
                        <span>Move to...</span>
                        <span className="text-gray-400">{dropdownOpenFor === app.id ? '▲' : '▼'}</span>
                      </button>
                      {dropdownOpenFor === app.id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setDropdownOpenFor(null)} />
                          <div className="absolute z-20 mt-1 w-full bg-white border border-grey-border rounded-lg shadow-lg overflow-hidden">
                            {COLUMNS.map((target) => (
                              <button
                                key={target.status}
                                onClick={() => handleMove(app, target.status)}
                                disabled={target.status === app.status}
                                className={`w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors text-left ${
                                  target.status === app.status
                                    ? 'text-gray-300 cursor-not-allowed'
                                    : 'text-navy hover:bg-grey-bg'
                                }`}
                              >
                                <span className={`w-2 h-2 rounded-full ${target.dotColor}`} />
                                {target.label}
                                {target.status === app.status && <span className="ml-auto text-gray-300">(current)</span>}
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
                {colApps.length === 0 && (
                  <div className="py-8 text-center text-xs text-gray-400">No applications</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Terminal status confirmation dialog */}
      {pendingMove && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-navy-dark/60" onClick={() => setPendingMove(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 ${
              pendingMove.newStatus === 'Success' ? 'bg-green-50' : 'bg-red-50'
            }`}>
              <AlertTriangle className={pendingMove.newStatus === 'Success' ? 'text-green-600' : 'text-red-600'} size={26} />
            </div>
            <h3 className="text-base font-semibold text-navy text-center mb-2">
              Move {pendingMove.app.name} to {pendingMove.newStatus}?
            </h3>
            <p className="text-sm text-gray-500 text-center mb-6">
              This is usually a final status and cannot be easily reversed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setPendingMove(null)}
                className="flex-1 py-2.5 border border-grey-border rounded-lg text-sm font-medium text-navy hover:bg-grey-bg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmMove}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors ${
                  pendingMove.newStatus === 'Success' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success toast */}
      {showToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[70] bg-green-600 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 text-sm font-medium animate-fade-in">
          <CheckCircle size={18} />
          {toastMessage}
        </div>
      )}
    </div>
  );
}
