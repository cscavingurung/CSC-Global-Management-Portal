import { useState, useEffect } from 'react';
import {
  X, User, Phone, Mail, Globe, Target, CalendarDays, FileText,
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
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
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

  const detailRows = [
    { icon: User, label: 'Name', value: application.name },
    { icon: Phone, label: 'Phone', value: application.phone },
    { icon: Mail, label: 'Email', value: application.email },
    { icon: Globe, label: 'Country of Interest', value: application.country },
    { icon: Target, label: 'Purpose', value: application.purpose },
    { icon: CalendarDays, label: 'Consultation Date', value: application.consultationDate },
    { icon: User, label: 'Counselor', value: application.counselor },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-navy-dark/50 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className="relative w-full sm:max-w-md bg-white shadow-2xl h-full overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-grey-border sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <FileText className="text-navy" size={20} />
            <h2 className="text-base font-semibold text-navy">Application Details</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-navy transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Student info card */}
        <div className="px-5 py-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Student Information</p>
          <div className="bg-grey-bg rounded-xl p-4 space-y-3">
            {detailRows.map((row) => {
              const Icon = row.icon;
              return (
                <div key={row.label} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center flex-shrink-0">
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

        {/* Consultation notes (read-only) */}
        <div className="px-5 pb-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
            Counselor's Consultation Notes
          </p>
          <div className="bg-grey-bg rounded-xl p-4">
            <p className="text-sm text-gray-600 leading-relaxed">
              {application.consultationNotes || 'No notes recorded.'}
            </p>
          </div>
        </div>

        {/* Status control */}
        <div className="px-5 pb-4">
          <label className="block text-sm font-medium text-navy mb-2">Application Status</label>
          <div className="grid grid-cols-2 gap-2">
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt}
                onClick={() => handleStatusChange(opt)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                  status === opt
                    ? STATUS_STYLES[opt]
                    : 'border-grey-border text-gray-500 hover:bg-grey-bg'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${status === opt ? 'bg-current' : 'bg-gray-300'}`} />
                {opt}
                {status === opt && <CheckCircle className="ml-auto" size={15} />}
              </button>
            ))}
          </div>
        </div>

        {/* Status history timeline */}
        <div className="px-5 pb-5">
          <label className="block text-sm font-medium text-navy mb-3">Status History</label>
          <div className="relative pl-6">
            {/* Vertical line */}
            <div className="absolute left-[7px] top-2 bottom-2 w-px bg-grey-border" />

            <div className="space-y-4">
              {[...application.statusHistory].reverse().map((entry, idx) => (
                <div key={idx} className="relative">
                  {/* Dot */}
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
