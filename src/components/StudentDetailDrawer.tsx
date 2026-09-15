import { useState, useEffect } from 'react';
import {
  X, User, Phone, Mail, Globe, Target, CalendarDays, FileText,
  Send, CheckCircle, ClipboardList,
} from 'lucide-react';
import { CounselorStudent, ConsultationStatus } from '../types';

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
  const [showToast, setShowToast] = useState(false);

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

  const handleSendToApplication = () => {
    onUpdate({ sentToApplication: true });
    setShowToast(true);
    setTimeout(() => onClose(), 1500);
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
      <div className="relative w-full sm:max-w-md bg-white shadow-2xl h-full overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-grey-border sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <ClipboardList className="text-navy" size={20} />
            <h2 className="text-base font-semibold text-navy">Student Details</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-navy transition-colors">
            <X size={20} />
          </button>
        </div>

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

        {/* Handoff button */}
        <div className="px-5 pb-5 mt-auto">
          {status === 'Consultation Complete' && !student.sentToApplication && (
            <button
              onClick={handleSendToApplication}
              className="w-full flex items-center justify-center gap-2 bg-navy text-white font-semibold py-2.5 rounded-lg text-sm hover:bg-navy-light transition-colors active:scale-[0.98]"
            >
              <Send size={16} />
              Mark Consultation Complete & Send to Application
            </button>
          )}
          {student.sentToApplication && (
            <div className="w-full flex items-center justify-center gap-2 bg-green-50 text-green-700 font-medium py-2.5 rounded-lg text-sm border border-green-200">
              <CheckCircle size={16} />
              Sent to Application Officer
            </div>
          )}
        </div>
      </div>

      {/* Success toast */}
      {showToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] bg-green-600 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 text-sm font-medium animate-fade-in">
          <CheckCircle size={18} />
          Sent to Application Officer
        </div>
      )}
    </div>
  );
}
