import { useState, useEffect } from 'react';
import {
  ArrowLeft, User, Phone, Mail, Globe, Target, CalendarDays,
  CheckCircle, AlertTriangle,
} from 'lucide-react';
import { ApplicationRecord, ApplicationStatus, StatusHistoryEntry } from '../types';

interface ApplicationDetailDrawerProps {
  application: ApplicationRecord;
  onClose: () => void;
  onUpdate: (updates: Partial<ApplicationRecord>) => void;
}

const STATUS_OPTIONS: ApplicationStatus[] = ['Preparation', 'Lodgement', 'Success', 'Refused'];

const STATUS_STYLES: Record<ApplicationStatus, string> = {
  Preparation: 'bg-gray-100 text-gray-600 border-gray-200',
  Lodgement: 'bg-navy/10 text-navy border-navy/20',
  Success: 'bg-green-100 text-green-700 border-green-200',
  Refused: 'bg-red-100 text-red-700 border-red-200',
};

const TERMINAL_STATUSES: ApplicationStatus[] = ['Success', 'Refused'];

export default function ApplicationDetailDrawer({ application, onClose, onUpdate }: ApplicationDetailDrawerProps) {
  const [status, setStatus] = useState<ApplicationStatus>(application.status);
  const [pendingStatus, setPendingStatus] = useState<ApplicationStatus | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const applyStatusChange = (newStatus: ApplicationStatus) => {
    const now = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const historyEntry: StatusHistoryEntry = { status: newStatus, date: now };
    setStatus(newStatus);
    onUpdate({
      status: newStatus,
      statusHistory: [...application.statusHistory, historyEntry],
    });
    setToastMessage(`Status updated to ${newStatus}`);
    setShowToast(true);
  };

  const handleStatusChange = (newStatus: ApplicationStatus) => {
    if (newStatus === status) return;
    if (TERMINAL_STATUSES.includes(newStatus)) {
      setPendingStatus(newStatus);
    } else {
      applyStatusChange(newStatus);
    }
  };

  const confirmTerminalStatus = () => {
    if (pendingStatus) {
      applyStatusChange(pendingStatus);
      setPendingStatus(null);
    }
  };

  const initials = application.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

  const detailRows = [
    { icon: Phone, label: 'Phone', value: application.phone },
    { icon: Mail, label: 'Email', value: application.email },
    { icon: Globe, label: 'Country of Interest', value: application.country },
    { icon: Target, label: 'Purpose', value: application.purpose },
    { icon: CalendarDays, label: 'Consultation Date', value: application.consultationDate },
    { icon: User, label: 'Counselor', value: application.counselor },
  ];

  return (
    <div className="fixed inset-y-0 left-0 right-0 lg:left-64 z-50 bg-grey-bg flex flex-col">
      {/* Top bar */}
      <div className="flex-shrink-0 bg-white border-b border-grey-border px-5 py-4 flex items-center gap-3">
        <button
          onClick={onClose}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-navy hover:text-navy-light transition-colors"
        >
          <ArrowLeft size={18} />
          Back
        </button>
        <span className="text-gray-300">|</span>
        <h1 className="text-base font-semibold text-navy">Application Profile</h1>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-5 py-6 space-y-5">

          {/* Profile header + details */}
          <div className="bg-white rounded-2xl border border-grey-border p-6">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="w-16 h-16 rounded-full bg-navy/10 flex items-center justify-center flex-shrink-0">
                <span className="text-xl font-semibold text-navy">{initials}</span>
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-semibold text-navy truncate">{application.name}</h2>
                <div className="flex items-center gap-2 flex-wrap mt-1.5">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${STATUS_STYLES[status]}`}>
                    {status}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-grey-border">
              <div className="flex items-center gap-2 mb-4">
                <User className="text-navy" size={17} />
                <h3 className="text-sm font-semibold text-navy">Client & Application Details</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {detailRows.map((row) => {
                  const Icon = row.icon;
                  return (
                    <div key={row.label} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-grey-bg flex items-center justify-center flex-shrink-0">
                        <Icon className="text-navy" size={15} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-gray-400">{row.label}</p>
                        <p className="text-sm font-medium text-navy truncate">{row.value}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Application status */}
          <div className="bg-white rounded-2xl border border-grey-border p-6">
            <h3 className="text-sm font-semibold text-navy mb-4">Application Status</h3>
            <div className="grid grid-cols-2 gap-2">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  onClick={() => handleStatusChange(opt)}
                  className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                    status === opt ? STATUS_STYLES[opt] : 'border-grey-border text-gray-500 hover:bg-grey-bg'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${status === opt ? 'bg-current' : 'bg-gray-300'}`} />
                  <span className="truncate">{opt}</span>
                  {status === opt && <CheckCircle className="ml-auto flex-shrink-0" size={15} />}
                </button>
              ))}
            </div>
          </div>

          {/* Status history */}
          <div className="bg-white rounded-2xl border border-grey-border p-6">
            <h3 className="text-sm font-semibold text-navy mb-4">Status History</h3>
            <div className="relative pl-6">
              <div className="absolute left-[7px] top-2 bottom-2 w-px bg-grey-border" />
              <div className="space-y-4">
                {[...application.statusHistory].reverse().map((entry, idx) => (
                  <div key={idx} className="relative">
                    <div className={`absolute -left-6 top-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${
                      entry.status === 'Success' ? 'bg-green-500'
                      : entry.status === 'Refused' ? 'bg-red-500'
                      : entry.status === 'Lodgement' ? 'bg-navy'
                      : 'bg-gray-400'
                    }`} />
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-navy">{entry.status}</span>
                      <span className="text-xs text-gray-400">{entry.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Terminal status confirmation dialog */}
      {pendingStatus && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-navy-dark/60" onClick={() => setPendingStatus(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 ${
              pendingStatus === 'Success' ? 'bg-green-50' : 'bg-red-50'
            }`}>
              <AlertTriangle className={pendingStatus === 'Success' ? 'text-green-600' : 'text-red-600'} size={26} />
            </div>
            <h3 className="text-base font-semibold text-navy text-center mb-2">
              Mark this application as {pendingStatus}?
            </h3>
            <p className="text-sm text-gray-500 text-center mb-6">
              This is usually a final status and cannot be easily reversed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setPendingStatus(null)}
                className="flex-1 py-2.5 border border-grey-border rounded-lg text-sm font-medium text-navy hover:bg-grey-bg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmTerminalStatus}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors ${
                  pendingStatus === 'Success' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {showToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[70] bg-green-600 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 text-sm font-medium">
          <CheckCircle size={18} />
          {toastMessage}
        </div>
      )}
    </div>
  );
}
