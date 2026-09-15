import { useState, useEffect } from 'react';
import {
  X, User, Phone, Mail, Globe, Target, CalendarDays,
  Send, CheckCircle, XCircle, ClipboardList,
} from 'lucide-react';
import { CounselorStudent, ConsultationStatus, ConsultationOutcome } from '../types';

interface StudentDetailDrawerProps {
  student: CounselorStudent;
  onClose: () => void;
  onUpdate: (updates: Partial<CounselorStudent>) => void;
}

const STATUS_OPTIONS: ConsultationStatus[] = ['Awaiting Consultation', 'In Progress', 'Consultation Complete'];

const STATUS_STYLES: Record<ConsultationStatus, string> = {
  'Awaiting Consultation': 'bg-orange-100 text-orange-700 border-orange-200',
  'In Progress': 'bg-blue-100 text-blue-700 border-blue-200',
  'Consultation Complete': 'bg-green-100 text-green-700 border-green-200',
};

export default function StudentDetailDrawer({ student, onClose, onUpdate }: StudentDetailDrawerProps) {
  const [notes, setNotes] = useState(student.consultationNotes);
  const [status, setStatus] = useState<ConsultationStatus>(student.consultationStatus);
  const [outcome, setOutcome] = useState<ConsultationOutcome>(student.outcome);
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

  const handleStatusChange = (newStatus: ConsultationStatus) => {
    setStatus(newStatus);
    const updates: Partial<CounselorStudent> = { consultationStatus: newStatus };
    if (newStatus === 'Consultation Complete' && !student.completedDate) {
      updates.completedDate = new Date().toISOString().split('T')[0];
    }
    onUpdate(updates);
  };

  const handleNotesChange = (value: string) => {
    setNotes(value);
    onUpdate({ consultationNotes: value });
  };

  const handleOutcomeChange = (newOutcome: ConsultationOutcome) => {
    setOutcome(newOutcome);
    onUpdate({ outcome: newOutcome });
    if (newOutcome === 'Proceeding') {
      setToastMessage('Sent to Application Officer');
      setShowToast(true);
    } else if (newOutcome === 'Not Proceeding') {
      setToastMessage('Marked as not proceeding');
      setShowToast(true);
    }
  };

  const detailRows = [
    { icon: User, label: 'Name', value: student.name },
    { icon: Phone, label: 'Phone', value: student.phone },
    { icon: Mail, label: 'Email', value: student.email },
    { icon: Globe, label: 'Country of Interest', value: student.country },
    { icon: Target, label: 'Purpose', value: student.purpose },
    { icon: CalendarDays, label: 'Submitted', value: student.submittedAt },
    { icon: CalendarDays, label: 'Assigned', value: student.assignedDate },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-navy-dark/50 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className="relative w-full sm:max-w-md bg-white shadow-2xl h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-grey-border flex-shrink-0">
          <div className="flex items-center gap-2">
            <ClipboardList className="text-navy" size={20} />
            <h2 className="text-base font-semibold text-navy">Student Details</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-navy transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          {/* Student info card */}
          <div className="px-5 py-5">
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

          {/* Consultation status */}
          <div className="px-5 pb-4">
            <label className="block text-sm font-medium text-navy mb-2">Consultation Status</label>
            <div className="grid grid-cols-1 gap-2">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  onClick={() => handleStatusChange(opt)}
                  className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                    status === opt
                      ? STATUS_STYLES[opt]
                      : 'border-grey-border text-gray-500 hover:bg-grey-bg'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${status === opt ? 'bg-current' : 'bg-gray-300'}`} />
                  {opt}
                  {status === opt && <CheckCircle className="ml-auto" size={16} />}
                </button>
              ))}
            </div>
          </div>

          {/* Consultation notes */}
          <div className="px-5 pb-4">
            <label className="block text-sm font-medium text-navy mb-1.5">Consultation Notes</label>
            <textarea
              value={notes}
              onChange={(e) => handleNotesChange(e.target.value)}
              placeholder="Type your consultation notes here..."
              rows={5}
              className="w-full px-4 py-3 border border-grey-border rounded-lg text-sm focus:outline-none focus:border-navy-light focus:ring-1 focus:ring-navy-light transition-colors resize-none"
            />
          </div>
        </div>

        {/* Proceed decision */}
        {status === 'Consultation Complete' && (
          <div className="flex-shrink-0 border-t border-grey-border px-5 py-4">
            <label className="block text-sm font-medium text-navy mb-2">Will the student proceed?</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleOutcomeChange('Proceeding')}
                className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                  outcome === 'Proceeding'
                    ? 'bg-green-100 text-green-700 border-green-200'
                    : 'border-grey-border text-gray-500 hover:bg-grey-bg'
                }`}
              >
                <Send size={15} />
                Proceeding
              </button>
              <button
                type="button"
                onClick={() => handleOutcomeChange('Not Proceeding')}
                className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                  outcome === 'Not Proceeding'
                    ? 'bg-red-100 text-red-700 border-red-200'
                    : 'border-grey-border text-gray-500 hover:bg-grey-bg'
                }`}
              >
                <XCircle size={15} />
                Not Proceeding
              </button>
            </div>
            {outcome === 'Pending' && (
              <p className="text-xs text-gray-400 mt-2">No decision made yet.</p>
            )}
            {outcome === 'Proceeding' && (
              <p className="text-xs text-green-600 mt-2">Sent to Application Officer.</p>
            )}
            {outcome === 'Not Proceeding' && (
              <p className="text-xs text-gray-500 mt-2">Student will not be moving forward.</p>
            )}
          </div>
        )}
      </div>

      {/* Success toast */}
      {showToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] bg-green-600 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 text-sm font-medium animate-fade-in">
          <CheckCircle size={18} />
          {toastMessage}
        </div>
      )}
    </div>
  );
}
