import { useState, useEffect } from 'react';
import { X, User, Phone, Mail, Globe, Target, Calendar, Check } from 'lucide-react';
import { IntakeStudent, Counselor } from '../types';

interface AssignCounselorModalProps {
  student: IntakeStudent;
  counselors: Counselor[];
  onClose: () => void;
  onConfirm: (counselorName: string) => void;
}

export default function AssignCounselorModal({
  student,
  counselors,
  onClose,
  onConfirm,
}: AssignCounselorModalProps) {
  const [selectedCounselor, setSelectedCounselor] = useState<string>(
    student.assignedCounselor || ''
  );
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const detailRows = [
    { icon: User, label: 'Name', value: student.name },
    { icon: Phone, label: 'Phone', value: student.phone },
    { icon: Mail, label: 'Email', value: student.email },
    { icon: Globe, label: 'Country', value: student.country },
    { icon: Target, label: 'Purpose', value: student.purpose },
    { icon: Calendar, label: 'Preferred', value: student.preferredDate },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-navy-dark/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-grey-border sticky top-0 bg-white z-10">
          <h2 className="text-base font-semibold text-navy">Assign to Counselor</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-navy transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Student details */}
        <div className="px-6 py-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
            Student Details
          </p>
          <div className="bg-grey-bg rounded-xl p-4 space-y-3">
            {detailRows.map((row) => {
              const Icon = row.icon;
              return (
                <div key={row.label} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center flex-shrink-0">
                    <Icon className="text-navy" size={15} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-400">{row.label}</p>
                    <p className="text-sm font-medium text-navy truncate">{row.value}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Counselor selection */}
        <div className="px-6 pb-6">
          <label className="block text-sm font-medium text-navy mb-1.5">Select Counselor</label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-full flex items-center justify-between pl-4 pr-3 py-2.5 border border-grey-border rounded-lg text-sm focus:outline-none focus:border-navy-light focus:ring-1 focus:ring-navy-light transition-colors bg-white"
            >
              <span className={selectedCounselor ? 'text-navy font-medium' : 'text-gray-400'}>
                {selectedCounselor || 'Choose a counselor'}
              </span>
              <ChevronDownIcon open={dropdownOpen} />
            </button>
            {dropdownOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                <div className="absolute z-20 mt-1 w-full bg-white border border-grey-border rounded-lg shadow-lg overflow-hidden max-h-60 overflow-y-auto">
                  {counselors.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setSelectedCounselor(c.name);
                        setDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors text-left ${
                        c.name === selectedCounselor
                          ? 'bg-navy text-white'
                          : 'text-navy hover:bg-grey-bg'
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="font-medium truncate">{c.name}</p>
                        <p className={`text-xs ${c.name === selectedCounselor ? 'text-white/60' : 'text-gray-400'}`}>
                          {c.branch} · {c.activeAssignments} active
                        </p>
                      </div>
                      {c.name === selectedCounselor && <Check size={16} className="flex-shrink-0 ml-2" />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-grey-border rounded-lg text-sm font-medium text-navy hover:bg-grey-bg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => selectedCounselor && onConfirm(selectedCounselor)}
            disabled={!selectedCounselor}
            className="flex-1 py-2.5 bg-navy text-white rounded-lg text-sm font-semibold hover:bg-navy-light transition-colors disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            Confirm Assignment
          </button>
        </div>
      </div>
    </div>
  );
}

function ChevronDownIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}
