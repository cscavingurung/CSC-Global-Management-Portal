import { useState, type ReactNode } from 'react';
import {
  ArrowLeft, Check, X, ChevronDown,
  AlertTriangle, Building2, FileText, UserX,
  Phone, Mail, Globe, Target, User, Cake,
  Users, Heart, GraduationCap, BookOpen, Briefcase,
  ListChecks, MessageSquare, Banknote, type LucideIcon,
} from 'lucide-react';
import {
  ApplicationRecord, OfferApplication, VisaApplication, Partner, MockUser, ClientNote,
} from '../types';
import {
  getActiveOfferApplication, isChecklistComplete, checklistCompleteCount,
  getClientStatusLabel, getStatusTone, STATUS_TONE_STYLES, OFFER_STATUS_STYLES,
  PIPELINE_STEPS, getPipelineStep, canEditClientProfile, today,
} from '../clientPipeline';
import { ROLE_LABELS, ROLE_BADGE_STYLES } from '../mockData';

interface ClientProfileProps {
  application: ApplicationRecord;
  partners: Partner[];
  currentUser: MockUser;
  onClose: () => void;
  onUpdate: (updates: Partial<ApplicationRecord>) => void;
}

const CHECKLIST_ITEMS: { key: keyof VisaApplication['checklist']; label: string }[] = [
  { key: 'noc', label: 'NOC' },
  { key: 'medical', label: 'Medical' },
  { key: 'financial', label: 'Financial Documents' },
  { key: 'policeReport', label: 'Police Report' },
];

// ─── Small reusable pieces ─────────────────────────────────────────────────────

function Badge({ className, children }: { className: string; children: ReactNode }) {
  return <span className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${className}`}>{children}</span>;
}

function SectionCard({
  title, icon: Icon, action, children,
}: { title: string; icon: LucideIcon; action?: ReactNode; children: ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-grey-border p-6">
      <div className="flex items-center justify-between mb-4 gap-3">
        <div className="flex items-center gap-2">
          <Icon className="text-navy" size={17} />
          <h3 className="text-sm font-semibold text-navy">{title}</h3>
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function ConfirmDialog({
  tone, title, message, confirmLabel, onCancel, onConfirm,
}: { tone: 'positive' | 'negative'; title: string; message: string; confirmLabel?: string; onCancel: () => void; onConfirm: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-navy-dark/60" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 ${tone === 'positive' ? 'bg-green-50' : 'bg-red-50'}`}>
          <AlertTriangle className={tone === 'positive' ? 'text-green-600' : 'text-red-600'} size={26} />
        </div>
        <h3 className="text-base font-semibold text-navy text-center mb-2">{title}</h3>
        <p className="text-sm text-gray-500 text-center mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 border border-grey-border rounded-lg text-sm font-medium text-navy hover:bg-grey-bg transition-colors">Cancel</button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors ${tone === 'positive' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
          >
            {confirmLabel ?? 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Apply / Re-apply to Institution modal ─────────────────────────────────────

function ApplyToInstitutionModal({
  partners, onAdd, onClose,
}: { partners: Partner[]; onAdd: (o: OfferApplication) => void; onClose: () => void }) {
  const [institution, setInstitution] = useState('');
  const [customInstitution, setCustomInstitution] = useState('');
  const [notes, setNotes] = useState('');

  const institutionName = institution === '__custom__' ? customInstitution : institution;

  const handleSubmit = () => {
    if (!institutionName.trim()) return;
    onAdd({
      id: `o${Date.now()}`,
      institution: institutionName.trim(),
      status: 'Enrolled',
      statusUpdatedAt: today(),
      notes: notes.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-navy-dark/60" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-grey-border flex-shrink-0">
          <h3 className="text-base font-semibold text-navy">Apply to Institution</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-navy transition-colors"><X size={20} /></button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Institution</label>
            <div className="relative">
              <select
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                className="w-full appearance-none border border-grey-border rounded-lg px-3 py-2.5 text-sm text-navy bg-white focus:outline-none focus:border-navy-light focus:ring-1 focus:ring-navy-light pr-9"
              >
                <option value="">Select institution...</option>
                {partners.map((p) => <option key={p.id} value={p.name}>{p.name} ({p.type})</option>)}
                <option value="__custom__">Other (type manually)</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
            </div>
            {institution === '__custom__' && (
              <input type="text" value={customInstitution} onChange={(e) => setCustomInstitution(e.target.value)} placeholder="Enter institution name" className="mt-2 w-full border border-grey-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-navy-light focus:ring-1 focus:ring-navy-light" />
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Notes (optional)</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Special requirements or notes..." className="w-full border border-grey-border rounded-lg px-3 py-2.5 text-sm resize-none focus:outline-none focus:border-navy-light" />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-grey-border flex gap-3 flex-shrink-0">
          <button onClick={onClose} className="flex-1 py-2.5 border border-grey-border rounded-lg text-sm font-medium text-navy hover:bg-grey-bg transition-colors">Cancel</button>
          <button onClick={handleSubmit} disabled={!institutionName.trim()} className="flex-1 py-2.5 bg-navy text-white rounded-lg text-sm font-semibold hover:bg-navy-light disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Status Tracker (bottom-left) ──────────────────────────────────────────────

type ActionKind = 'advance' | 'confirm-positive' | 'confirm-negative' | 'apply-modal' | 'reapply-modal' | 'refund';

interface StatusAction {
  value: string;
  label: string;
  kind: ActionKind;
  disabled?: boolean;
  disabledReason?: string;
}

function getAvailableActions(application: ApplicationRecord): StatusAction[] {
  const visa = application.visaApplication;
  if (visa) {
    switch (visa.status) {
      case 'Preparing Documents': {
        const done = isChecklistComplete(visa.checklist);
        return [{ value: 'file-ready', label: 'Mark File Ready for Visa', kind: 'advance', disabled: !done, disabledReason: 'Complete all 4 checklist items first' }];
      }
      case 'File Ready for Visa':
        return [{ value: 'visa-applied', label: 'Mark Visa Applied', kind: 'advance' }];
      case 'Visa Applied':
        return [
          { value: 'visa-approved', label: 'Mark Visa Approved', kind: 'confirm-positive' },
          { value: 'visa-refused', label: 'Mark Visa Refused', kind: 'confirm-negative' },
        ];
      case 'Visa Refused': {
        const actions: StatusAction[] = [];
        if (!visa.refundRequested) actions.push({ value: 'refund', label: 'Request Refund', kind: 'refund' });
        actions.push({ value: 'reapply', label: 'Re-apply to a New Institution', kind: 'reapply-modal' });
        return actions;
      }
      default:
        return [];
    }
  }

  const active = getActiveOfferApplication(application);
  if (!active) return [{ value: 'apply', label: 'Apply to Institution', kind: 'apply-modal' }];

  switch (active.status) {
    case 'Enrolled':
      return [{ value: 'applied', label: 'Mark Applied to Institution', kind: 'advance' }];
    case 'Applied to Institution':
      return [
        { value: 'offer-received', label: 'Mark Offer Received', kind: 'confirm-positive' },
        { value: 'offer-rejected', label: 'Mark Rejected', kind: 'confirm-negative' },
      ];
    case 'Offer Received':
      return [{ value: 'fee-paid', label: 'Mark Fee Paid', kind: 'confirm-positive' }];
    case 'Rejected':
      return [{ value: 'reapply', label: 'Re-apply to a New Institution', kind: 'reapply-modal' }];
    case 'Fee Paid':
    default:
      return [];
  }
}

function StatusTracker({
  application, partners, canEdit, onUpdate,
}: { application: ApplicationRecord; partners: Partner[]; canEdit: boolean; onUpdate: (u: Partial<ApplicationRecord>) => void }) {
  const [selectedValue, setSelectedValue] = useState('');
  const [pendingAction, setPendingAction] = useState<StatusAction | null>(null);
  const [showApplyModal, setShowApplyModal] = useState(false);

  const { index: stepIndex, negative } = getPipelineStep(application);
  const visa = application.visaApplication;
  const active = getActiveOfferApplication(application);
  const attempts = application.offerApplications;

  const actions = getAvailableActions(application);
  const effectiveValue = actions.some((a) => a.value === selectedValue) ? selectedValue : (actions[0]?.value ?? '');
  const selectedAction = actions.find((a) => a.value === effectiveValue) ?? null;

  const updateOffer = (id: string, updates: Partial<OfferApplication>) =>
    onUpdate({ offerApplications: attempts.map((o) => (o.id === id ? { ...o, ...updates } : o)) });

  const performAction = (value: string) => {
    const date = today();
    switch (value) {
      case 'applied':
        if (active) updateOffer(active.id, { status: 'Applied to Institution', statusUpdatedAt: date, appliedDate: date });
        break;
      case 'offer-received':
        if (active) updateOffer(active.id, { status: 'Offer Received', statusUpdatedAt: date, outcomeDate: date });
        break;
      case 'offer-rejected':
        if (active) updateOffer(active.id, { status: 'Rejected', statusUpdatedAt: date, outcomeDate: date });
        break;
      case 'fee-paid':
        if (active) {
          onUpdate({
            offerApplications: attempts.map((o) => (o.id === active.id ? { ...o, status: 'Fee Paid', statusUpdatedAt: date, feePaidDate: date } : o)),
            visaApplication: { status: 'Preparing Documents', statusUpdatedAt: date, checklist: { noc: false, medical: false, financial: false, policeReport: false }, notes: '' },
          });
        }
        break;
      case 'file-ready':
        if (visa) onUpdate({ visaApplication: { ...visa, status: 'File Ready for Visa', statusUpdatedAt: date } });
        break;
      case 'visa-applied':
        if (visa) onUpdate({ visaApplication: { ...visa, status: 'Visa Applied', statusUpdatedAt: date, appliedDate: date } });
        break;
      case 'visa-approved':
        if (visa) onUpdate({ visaApplication: { ...visa, status: 'Visa Approved', statusUpdatedAt: date, outcomeDate: date } });
        break;
      case 'visa-refused':
        if (visa) onUpdate({ visaApplication: { ...visa, status: 'Visa Refused', statusUpdatedAt: date, outcomeDate: date } });
        break;
      case 'refund':
        if (visa) onUpdate({ visaApplication: { ...visa, refundRequested: true, refundRequestedDate: date } });
        break;
    }
    setPendingAction(null);
  };

  const handleAddOffer = (o: OfferApplication) => {
    const resetVisa = application.visaApplication?.status === 'Visa Refused';
    onUpdate({
      offerApplications: [...attempts, o],
      ...(resetVisa ? { visaApplication: null } : {}),
    });
    setShowApplyModal(false);
  };

  const handleUpdateStatusClick = () => {
    if (!selectedAction || selectedAction.disabled) return;
    if (selectedAction.kind === 'apply-modal' || selectedAction.kind === 'reapply-modal') { setShowApplyModal(true); return; }
    if (selectedAction.kind === 'confirm-positive' || selectedAction.kind === 'confirm-negative') { setPendingAction(selectedAction); return; }
    performAction(selectedAction.value);
  };

  return (
    <>
      {/* Past offer attempts — kept as simple read-only history above the tracker */}
      {attempts.length > 0 && (
        <div className="mb-5 pb-5 border-b border-grey-border space-y-2.5">
          {[...attempts].reverse().map((o) => (
            <div key={o.id} className="flex items-center gap-2.5">
              <Building2 className="text-gray-400 flex-shrink-0" size={14} />
              <span className="text-sm text-navy truncate flex-1">{o.institution}</span>
              <Badge className={OFFER_STATUS_STYLES[o.status]}>{o.status}</Badge>
            </div>
          ))}
        </div>
      )}

      {/* Vertical stepper */}
      <div className="space-y-0">
        {PIPELINE_STEPS.map((step, i) => {
          const isDone = i < stepIndex;
          const isCurrent = i === stepIndex;
          const isCurrentNegative = isCurrent && negative;
          const label =
            step.key === 'offer_outcome' && isCurrentNegative ? 'Offer Rejected'
            : step.key === 'visa_outcome' && isCurrentNegative ? 'Visa Refused'
            : step.label;
          const isLast = i === PIPELINE_STEPS.length - 1;
          return (
            <div key={step.key} className="flex gap-3">
              <div className="flex flex-col items-center flex-shrink-0">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  isDone ? 'bg-navy border-navy'
                  : isCurrentNegative ? 'bg-red-500 border-red-500'
                  : isCurrent ? 'bg-white border-navy'
                  : 'bg-white border-gray-200'
                }`}>
                  {isDone ? <Check className="text-white" size={13} />
                    : isCurrentNegative ? <X className="text-white" size={13} />
                    : <span className={`w-2 h-2 rounded-full ${isCurrent ? 'bg-navy' : 'bg-gray-200'}`} />}
                </div>
                {!isLast && <div className={`w-px flex-1 min-h-[18px] ${isDone ? 'bg-navy' : 'bg-gray-200'}`} />}
              </div>
              <div className="pb-4">
                <p className={`text-sm font-medium ${isCurrentNegative ? 'text-red-600' : isDone || isCurrent ? 'text-navy' : 'text-gray-400'}`}>{label}</p>
                {isCurrent && step.key === 'preparing_docs' && visa && (
                  <div className="mt-2.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-500">Document checklist</span>
                      <span className={`text-xs font-semibold ${isChecklistComplete(visa.checklist) ? 'text-green-600' : 'text-gray-500'}`}>
                        {checklistCompleteCount(visa.checklist)} of 4 complete
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      {CHECKLIST_ITEMS.map((item) => (
                        <label key={item.key} className={`flex items-center gap-2.5 ${canEdit ? 'cursor-pointer group' : ''}`}>
                          <div
                            onClick={canEdit ? () => onUpdate({ visaApplication: { ...visa, checklist: { ...visa.checklist, [item.key]: !visa.checklist[item.key] } } }) : undefined}
                            className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${visa.checklist[item.key] ? 'bg-green-500 border-green-500' : `border-gray-300 ${canEdit ? 'group-hover:border-navy-light' : ''}`}`}
                          >
                            {visa.checklist[item.key] && <Check className="text-white" size={10} />}
                          </div>
                          <span className={`text-sm ${visa.checklist[item.key] ? 'text-gray-400 line-through' : 'text-gray-700'}`}>{item.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
                {isCurrent && isCurrentNegative && visa?.refundRequested && (
                  <div className="mt-2"><Badge className="bg-gray-100 text-gray-600"><Banknote size={11} className="mr-1" />Refund Requested</Badge></div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Dropdown + Update Status — hidden entirely for view-only roles */}
      {canEdit && (
        actions.length > 0 ? (
          <div className="mt-2 pt-4 border-t border-grey-border space-y-2.5">
            <div className="relative">
              <select
                value={effectiveValue}
                onChange={(e) => setSelectedValue(e.target.value)}
                className="w-full appearance-none border border-grey-border rounded-lg px-3 py-2.5 text-sm text-navy bg-white focus:outline-none focus:border-navy-light focus:ring-1 focus:ring-navy-light pr-9"
              >
                {actions.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
            </div>
            <button
              onClick={handleUpdateStatusClick}
              disabled={!selectedAction || selectedAction.disabled}
              className="w-full py-2.5 bg-navy text-white rounded-lg text-sm font-semibold hover:bg-navy-light disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Update Status
            </button>
            {selectedAction?.disabled && selectedAction.disabledReason && (
              <p className="text-xs text-amber-600">{selectedAction.disabledReason}</p>
            )}
          </div>
        ) : (
          <p className="mt-2 pt-4 border-t border-grey-border text-xs text-gray-400">This case is complete — no further action needed.</p>
        )
      )}

      {showApplyModal && (
        <ApplyToInstitutionModal partners={partners} onAdd={handleAddOffer} onClose={() => setShowApplyModal(false)} />
      )}

      {pendingAction && (
        <ConfirmDialog
          tone={pendingAction.kind === 'confirm-positive' ? 'positive' : 'negative'}
          title={`${pendingAction.label}?`}
          message="This updates the client's status and cannot be easily reversed."
          onCancel={() => setPendingAction(null)}
          onConfirm={() => performAction(pendingAction.value)}
        />
      )}
    </>
  );
}

// ─── Branch Staff Notes (bottom-right) ─────────────────────────────────────────

function BranchNotes({
  notes, canEdit, currentUser, onUpdate,
}: { notes: ClientNote[]; canEdit: boolean; currentUser: MockUser; onUpdate: (u: Partial<ApplicationRecord>) => void }) {
  const [draft, setDraft] = useState('');
  const feed = [...notes].reverse();

  const handleAddNote = () => {
    const text = draft.trim();
    if (!text) return;
    const newNote: ClientNote = {
      id: `note${Date.now()}`,
      text,
      authorName: currentUser.name,
      authorRole: currentUser.role,
      createdAt: today(),
    };
    onUpdate({ notes: [...notes, newNote] });
    setDraft('');
  };

  return (
    <>
      {feed.length > 0 ? (
        <div className="max-h-80 overflow-y-auto space-y-3 pr-1">
          {feed.map((n) => (
            <div key={n.id} className="border border-grey-border rounded-xl p-3.5">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="text-sm font-semibold text-navy">{n.authorName}</span>
                <Badge className={ROLE_BADGE_STYLES[n.authorRole]}>{ROLE_LABELS[n.authorRole]}</Badge>
                <span className="text-xs text-gray-400 ml-auto">{n.createdAt}</span>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">{n.text}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-400 py-6 text-center">No notes yet.</p>
      )}

      {canEdit && (
        <div className="mt-4 pt-4 border-t border-grey-border space-y-2.5">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={3}
            placeholder="Add an internal note for other staff..."
            className="w-full border border-grey-border rounded-lg px-3 py-2.5 text-sm resize-none focus:outline-none focus:border-navy-light focus:ring-1 focus:ring-navy-light"
          />
          <div className="flex justify-end">
            <button
              onClick={handleAddNote}
              disabled={!draft.trim()}
              className="px-4 py-2 bg-navy text-white rounded-lg text-sm font-semibold hover:bg-navy-light disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Add Note
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Client Details (top, full width) ──────────────────────────────────────────

function ClientDetails({ application }: { application: ApplicationRecord }) {
  const detailRows = [
    { icon: Phone,         label: 'Phone',                  value: application.phone },
    { icon: Mail,          label: 'Email',                  value: application.email },
    { icon: Globe,         label: 'Country of Interest',    value: application.country },
    { icon: Target,        label: 'Purpose',                value: application.purpose },
    { icon: Cake,          label: 'Date of Birth',          value: application.dob },
    { icon: Users,         label: 'Gender',                 value: application.gender },
    { icon: Heart,         label: 'Marital Status',         value: application.maritalStatus },
    { icon: GraduationCap, label: 'Academic Qualification', value: application.academicQualification },
    { icon: BookOpen,      label: 'IELTS / PTE',            value: application.ieltsPte },
    { icon: Briefcase,     label: 'Work Experience',        value: application.workExperience },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {detailRows.map((row) => {
        const Icon = row.icon;
        return (
          <div key={row.label} className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-grey-bg flex items-center justify-center flex-shrink-0">
              <Icon className="text-navy" size={15} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-gray-400">{row.label}</p>
              <p className={`text-sm font-medium truncate ${row.value ? 'text-navy' : 'text-gray-300'}`}>{row.value || '—'}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main ClientProfile ───────────────────────────────────────────────────────

export default function ClientProfile({ application, partners, currentUser, onClose, onUpdate }: ClientProfileProps) {
  const [confirmWithdraw, setConfirmWithdraw] = useState(false);
  const initials = application.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
  const statusLabel = getClientStatusLabel(application);
  const tone = getStatusTone(application);
  const canEdit = canEditClientProfile(currentUser.role);

  return (
    <div className="fixed inset-y-0 left-0 right-0 lg:left-64 z-50 bg-grey-bg flex flex-col">
      {/* Top bar */}
      <div className="flex-shrink-0 bg-white border-b border-grey-border px-5 py-4 flex items-center gap-3">
        <button onClick={onClose} className="inline-flex items-center gap-1.5 text-sm font-medium text-navy hover:text-navy-light transition-colors flex-shrink-0">
          <ArrowLeft size={18} />Back
        </button>
        <span className="text-gray-300">|</span>
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-8 h-8 rounded-full bg-navy/10 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-semibold text-navy">{initials}</span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-navy truncate">{application.name}</p>
            <p className="text-xs text-gray-400 truncate">{application.country} · {application.purpose}</p>
          </div>
        </div>
        <Badge className={STATUS_TONE_STYLES[tone]}>{statusLabel}</Badge>
        {canEdit && !application.withdrawn && (
          <button
            onClick={() => setConfirmWithdraw(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-500 border border-grey-border hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-colors flex-shrink-0"
          >
            <UserX size={14} />Mark as withdrawn
          </button>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-5 py-6">
        <div className="max-w-6xl mx-auto space-y-5">

          {application.withdrawn && (
            <div className="bg-gray-100 border border-grey-border rounded-2xl px-5 py-4 flex items-center gap-3">
              <UserX className="text-gray-500 flex-shrink-0" size={18} />
              <p className="text-sm text-gray-600">
                This client was marked as withdrawn{application.withdrawnDate ? ` on ${application.withdrawnDate}` : ''}. Their history is preserved below.
              </p>
            </div>
          )}

          {/* Top: Client Details — full width */}
          <SectionCard title="Client Details" icon={User}>
            <ClientDetails application={application} />
            {application.consultationNotes && (
              <div className="mt-4 pt-4 border-t border-grey-border">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-grey-bg flex items-center justify-center flex-shrink-0">
                    <FileText className="text-navy" size={15} />
                  </div>
                  <p className="text-xs text-gray-400">Consultation Notes</p>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed pl-11">{application.consultationNotes}</p>
              </div>
            )}
          </SectionCard>

          {/* Bottom: Status Tracker (left) + Branch Staff Notes (right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-4">
              <SectionCard title="Status Tracker" icon={ListChecks}>
                <StatusTracker application={application} partners={partners} canEdit={canEdit} onUpdate={onUpdate} />
              </SectionCard>
            </div>
            <div className="lg:col-span-8">
              <SectionCard title="Branch Staff Notes" icon={MessageSquare}>
                <BranchNotes notes={application.notes} canEdit={canEdit} currentUser={currentUser} onUpdate={onUpdate} />
              </SectionCard>
            </div>
          </div>

        </div>
      </div>

      {confirmWithdraw && (
        <ConfirmDialog
          tone="negative"
          title={`Mark ${application.name} as withdrawn?`}
          message="This is the only way a client exits the pipeline. Their history is kept, but no further action can be taken on their case."
          confirmLabel="Confirm"
          onCancel={() => setConfirmWithdraw(false)}
          onConfirm={() => { onUpdate({ withdrawn: true, withdrawnDate: today() }); setConfirmWithdraw(false); }}
        />
      )}
    </div>
  );
}
