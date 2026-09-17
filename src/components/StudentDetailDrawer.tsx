import { useState, useEffect } from 'react';
import {
  ArrowLeft, User, Phone, Mail, Globe, Target, CalendarDays,
  Send, CheckCircle, XCircle, Lock, Calendar,
  Cake, Users, Heart, GraduationCap, Languages, Briefcase,
} from 'lucide-react';
import { CounselorStudent, ConsultationStatus, ConsultationOutcome } from '../types';

interface StudentDetailDrawerProps {
  student: CounselorStudent;
  onClose: () => void;
  onUpdate: (updates: Partial<CounselorStudent>) => void;
}

const STATUS_OPTIONS: ConsultationStatus[] = ['Awaiting Consultation', 'In Progress', 'Follow Up', 'Consultation Complete'];

const STATUS_STYLES: Record<ConsultationStatus, string> = {
  'Awaiting Consultation': 'bg-orange-100 text-orange-700 border-orange-200',
  'In Progress': 'bg-blue-100 text-blue-700 border-blue-200',
  'Follow Up': 'bg-purple-100 text-purple-700 border-purple-200',
  'Consultation Complete': 'bg-green-100 text-green-700 border-green-200',
};

export default function StudentDetailDrawer({ student, onClose, onUpdate }: StudentDetailDrawerProps) {
  const [status, setStatus] = useState<ConsultationStatus>(student.consultationStatus);
  const [outcome, setOutcome] = useState<ConsultationOutcome>(student.outcome);
  const [followUpDate, setFollowUpDate] = useState(student.followUpDate ?? '');
  const [inputDate, setInputDate] = useState(student.followUpDate ?? '');
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

  const handleStatusChange = (newStatus: ConsultationStatus) => {
    setStatus(newStatus);
    const updates: Partial<CounselorStudent> = { consultationStatus: newStatus };
    if (newStatus === 'Consultation Complete' && !student.completedDate) {
      updates.completedDate = new Date().toISOString().split('T')[0];
    }
    onUpdate(updates);
  };

  const handleConfirmFollowUp = () => {
    onUpdate({ followUpDate: inputDate || null });
    setToastMessage('Follow-up date confirmed');
    setShowToast(true);
    setTimeout(() => onClose(), 1000);
  };

  const handleOutcomeChange = (newOutcome: ConsultationOutcome) => {
    if (outcome !== 'Pending') return;
    setOutcome(newOutcome);
    onUpdate({ outcome: newOutcome });
    setToastMessage(newOutcome === 'Proceeding' ? 'Sent to VA Officer' : 'Marked as not proceeding');
    setShowToast(true);
    setTimeout(() => onClose(), 1000);
  };

  const initials = student.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

  const detailRows = [
    { icon: Phone, label: 'Phone', value: student.phone },
    { icon: Mail, label: 'Email', value: student.email },
    { icon: Globe, label: 'Country of Interest', value: student.country },
    { icon: Target, label: 'Purpose', value: student.purpose },
    { icon: Cake, label: 'Date of Birth', value: student.dob },
    { icon: Users, label: 'Gender', value: student.gender },
    { icon: Heart, label: 'Marital Status', value: student.maritalStatus },
    { icon: GraduationCap, label: 'Academic Qualification', value: student.academicQualification },
    { icon: Languages, label: 'IELTS/PTE', value: student.ieltsPte },
    { icon: Briefcase, label: 'Work Experience', value: student.workExperience },
    { icon: CalendarDays, label: 'Submitted', value: student.submittedAt },
    { icon: CalendarDays, label: 'Assigned', value: student.assignedDate },
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
        <h1 className="text-base font-semibold text-navy">Client Profile</h1>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-5 py-6 space-y-5">

          {/* Profile header + contact details */}
          <div className="bg-white rounded-2xl border border-grey-border p-6">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="w-16 h-16 rounded-full bg-navy/10 flex items-center justify-center flex-shrink-0">
                <span className="text-xl font-semibold text-navy">{initials}</span>
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-semibold text-navy truncate">{student.name}</h2>
                <div className="flex items-center gap-2 flex-wrap mt-1.5">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${STATUS_STYLES[status]}`}>
                    {status}
                  </span>
                  {outcome !== 'Pending' && (
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${
                      outcome === 'Proceeding' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      <Lock size={11} />
                      {outcome}
                    </span>
                  )}
                  {followUpDate && status === 'Follow Up' && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-purple-50 text-purple-700">
                      <Calendar size={11} />
                      Returns {new Date(followUpDate + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-grey-border">
              <div className="flex items-center gap-2 mb-4">
                <User className="text-navy" size={17} />
                <h3 className="text-sm font-semibold text-navy">Contact & Application Details</h3>
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

          {/* Consultation status */}
          <div className="bg-white rounded-2xl border border-grey-border p-6">
            <h3 className="text-sm font-semibold text-navy mb-4">Consultation Status</h3>
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

          {/* Follow-up date — shown when status is Follow Up */}
          {status === 'Follow Up' && (
            <div className="bg-white rounded-2xl border border-grey-border p-6">
              <h3 className="text-sm font-semibold text-navy mb-4">Next Visit Date</h3>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                <input
                  type="date"
                  value={inputDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setInputDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-grey-border rounded-lg text-sm focus:outline-none focus:border-navy-light focus:ring-1 focus:ring-navy-light transition-colors"
                />
              </div>
              {inputDate && (
                <p className="text-xs text-purple-600 mt-2">
                  Client returning on {new Date(inputDate + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              )}
              <button
                type="button"
                onClick={handleConfirmFollowUp}
                disabled={!inputDate || inputDate === followUpDate}
                className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 enabled:cursor-pointer"
              >
                <CheckCircle size={15} />
                Confirm Follow Up
              </button>
            </div>
          )}

          {/* Outcome decision — shown when Consultation Complete */}
          {status === 'Consultation Complete' && (
            <div className="bg-white rounded-2xl border border-grey-border p-6">
              <h3 className="text-sm font-semibold text-navy mb-4">Will the client proceed?</h3>
              {outcome === 'Pending' ? (
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => handleOutcomeChange('Proceeding')}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors border-grey-border text-gray-500 hover:bg-green-50 hover:text-green-700 hover:border-green-200"
                  >
                    <Send size={15} />
                    Proceeding
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOutcomeChange('Not Proceeding')}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors border-grey-border text-gray-500 hover:bg-red-50 hover:text-red-700 hover:border-red-200"
                  >
                    <XCircle size={15} />
                    Not Proceeding
                  </button>
                </div>
              ) : (
                <div className={`flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg border text-sm font-medium ${
                  outcome === 'Proceeding'
                    ? 'bg-green-100 text-green-700 border-green-200'
                    : 'bg-red-100 text-red-700 border-red-200'
                }`}>
                  {outcome === 'Proceeding' ? <Send size={15} /> : <XCircle size={15} />}
                  {outcome}
                  <Lock size={13} className="ml-auto opacity-60" />
                </div>
              )}
              <p className="text-xs text-gray-400 mt-2">
                {outcome === 'Pending' && 'No decision made yet.'}
                {outcome === 'Proceeding' && 'Sent to VA Officer. This decision is final and can\'t be changed.'}
                {outcome === 'Not Proceeding' && 'Client will not be moving forward. This decision is final and can\'t be changed.'}
              </p>
            </div>
          )}

        </div>
      </div>

      {/* Toast */}
      {showToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] bg-green-600 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 text-sm font-medium">
          <CheckCircle size={18} />
          {toastMessage}
        </div>
      )}
    </div>
  );
}
