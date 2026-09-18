import { useState } from 'react';
import {
  ArrowLeft, Plus, Check, CheckCircle, XCircle, X, ChevronDown,
  AlertTriangle, Building2, Calendar, FileText, UserX,
  Phone, Mail, Globe, Target, CalendarDays, User, Cake,
  Users, Heart, GraduationCap, BookOpen, Briefcase,
} from 'lucide-react';
import {
  ApplicationRecord, OfferApplication, OfferStatus, VisaApplication, VisaStageStatus, Partner,
} from '../types';
import {
  getActiveOfferApplication, isVisaUnlocked, isChecklistComplete, checklistCompleteCount,
  getClientStatusLabel, getStatusTone, STATUS_TONE_STYLES, OFFER_STATUS_STYLES, VISA_STATUS_STYLES, today,
} from '../clientPipeline';

interface ClientProfileProps {
  application: ApplicationRecord;
  partners: Partner[];
  onClose: () => void;
  onUpdate: (updates: Partial<ApplicationRecord>) => void;
}

type Tab = 'details' | 'application';

const CHECKLIST_ITEMS: { key: keyof VisaApplication['checklist']; label: string }[] = [
  { key: 'noc', label: 'NOC' },
  { key: 'medical', label: 'Medical' },
  { key: 'financial', label: 'Financial Documents' },
  { key: 'policeReport', label: 'Police Report' },
];

// ─── Add Offer Application Modal ──────────────────────────────────────────────

function AddOfferModal({
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
          <h3 className="text-base font-semibold text-navy">Add Offer Application</h3>
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
            Add
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Offer Application Card ───────────────────────────────────────────────────

function OfferCard({
  offerApp, isActive, onUpdate,
}: { offerApp: OfferApplication; isActive: boolean; onUpdate: (u: Partial<OfferApplication>) => void }) {
  const [pending, setPending] = useState<OfferStatus | null>(null);

  const apply = (status: OfferStatus) => {
    const date = today();
    if (status === 'Applied to Institution') onUpdate({ status, statusUpdatedAt: date, appliedDate: date });
    else onUpdate({ status, statusUpdatedAt: date, outcomeDate: date });
    setPending(null);
  };

  const handleClick = (status: OfferStatus) => {
    if (status === 'Offer Received' || status === 'Rejected') setPending(status);
    else apply(status);
  };

  return (
    <div className="bg-white rounded-2xl border border-grey-border overflow-hidden">
      <div className="px-5 py-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-navy/10 flex items-center justify-center flex-shrink-0">
          <Building2 className="text-navy" size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-navy truncate">{offerApp.institution}</p>
          {offerApp.appliedDate && <p className="text-xs text-gray-500">Applied {offerApp.appliedDate}</p>}
        </div>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 ${OFFER_STATUS_STYLES[offerApp.status]}`}>{offerApp.status}</span>
      </div>

      {offerApp.notes && (
        <div className="px-5 pb-3">
          <div className="bg-grey-bg rounded-lg px-3.5 py-2.5"><p className="text-xs text-gray-500">{offerApp.notes}</p></div>
        </div>
      )}

      {isActive && offerApp.status !== 'Rejected' && offerApp.status !== 'Offer Received' && (
        <div className="border-t border-grey-border px-5 py-3.5 flex items-center gap-2">
          {offerApp.status === 'Enrolled' && (
            <button onClick={() => handleClick('Applied to Institution')} className="flex items-center gap-1.5 px-3.5 py-2 bg-navy text-white rounded-lg text-xs font-semibold hover:bg-navy-light transition-colors">
              <FileText size={14} />Mark Applied to Institution
            </button>
          )}
          {offerApp.status === 'Applied to Institution' && (
            <>
              <button onClick={() => handleClick('Offer Received')} className="flex items-center gap-1.5 px-3.5 py-2 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700 transition-colors">
                <CheckCircle size={14} />Mark Offer Received
              </button>
              <button onClick={() => handleClick('Rejected')} className="flex items-center gap-1.5 px-3.5 py-2 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 transition-colors">
                <XCircle size={14} />Mark Rejected
              </button>
            </>
          )}
        </div>
      )}

      {pending && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-navy-dark/60" onClick={() => setPending(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 ${pending === 'Offer Received' ? 'bg-green-50' : 'bg-red-50'}`}>
              <AlertTriangle className={pending === 'Offer Received' ? 'text-green-600' : 'text-red-600'} size={26} />
            </div>
            <h3 className="text-base font-semibold text-navy text-center mb-2">Mark {offerApp.institution} as {pending}?</h3>
            <p className="text-sm text-gray-500 text-center mb-6">This outcome stays in the client's offer history either way.</p>
            <div className="flex gap-3">
              <button onClick={() => setPending(null)} className="flex-1 py-2.5 border border-grey-border rounded-lg text-sm font-medium text-navy hover:bg-grey-bg transition-colors">Cancel</button>
              <button onClick={() => apply(pending)} className={`flex-1 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors ${pending === 'Offer Received' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}>Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Visa Panel ────────────────────────────────────────────────────────────────

function VisaPanel({ application, onUpdate }: { application: ApplicationRecord; onUpdate: (u: Partial<ApplicationRecord>) => void }) {
  const [pending, setPending] = useState<VisaStageStatus | null>(null);
  const visa = application.visaApplication;

  const start = () => onUpdate({
    visaApplication: { status: 'Preparing Documents', statusUpdatedAt: today(), checklist: { noc: false, medical: false, financial: false, policeReport: false }, notes: '' },
  });

  const toggleChecklistItem = (key: keyof VisaApplication['checklist']) => {
    if (!visa) return;
    onUpdate({ visaApplication: { ...visa, checklist: { ...visa.checklist, [key]: !visa.checklist[key] } } });
  };

  const apply = (status: VisaStageStatus) => {
    if (!visa) return;
    const date = today();
    const updated: VisaApplication = { ...visa, status, statusUpdatedAt: date };
    if (status === 'Visa Applied') updated.appliedDate = date;
    if (status === 'Visa Approved' || status === 'Visa Refused') updated.outcomeDate = date;
    onUpdate({ visaApplication: updated });
    setPending(null);
  };

  const handleClick = (status: VisaStageStatus) => {
    if (status === 'Visa Approved' || status === 'Visa Refused') setPending(status);
    else apply(status);
  };

  if (!visa) {
    return (
      <div className="bg-white rounded-2xl border border-grey-border py-14 text-center">
        <div className="w-12 h-12 bg-grey-bg rounded-xl flex items-center justify-center mx-auto mb-3">
          <FileText className="text-gray-400" size={22} />
        </div>
        <p className="text-sm font-medium text-navy">Visa stage unlocked</p>
        <p className="text-xs text-gray-400 mt-1 mb-5">An offer has been received — start the visa application when ready</p>
        <button onClick={start} className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-navy text-white rounded-lg text-sm font-semibold hover:bg-navy-light transition-colors">
          <Plus size={16} />Start Visa Application
        </button>
      </div>
    );
  }

  const completeCount = checklistCompleteCount(visa.checklist);
  const checklistDone = isChecklistComplete(visa.checklist);

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl border border-grey-border p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-semibold text-navy">Visa Application</h3>
          <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${VISA_STATUS_STYLES[visa.status]}`}>{visa.status}</span>
        </div>

        {(visa.appliedDate || visa.outcomeDate) && (
          <div className="flex flex-wrap gap-4 mb-5 pb-5 border-b border-grey-border text-xs text-gray-500">
            {visa.appliedDate && <span className="flex items-center gap-1.5"><Calendar size={13} />Applied: <span className="font-medium text-navy ml-1">{visa.appliedDate}</span></span>}
            {visa.outcomeDate && <span className={`flex items-center gap-1.5 font-medium ${visa.status === 'Visa Approved' ? 'text-green-700' : 'text-red-700'}`}><CheckCircle size={13} />Outcome: {visa.outcomeDate}</span>}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          {visa.status === 'Preparing Documents' && (
            <>
              <button
                onClick={() => handleClick('Ready for Visa')}
                disabled={!checklistDone}
                className="flex items-center gap-1.5 px-4 py-2 bg-navy text-white rounded-lg text-sm font-semibold hover:bg-navy-light disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <CheckCircle size={15} />Mark Ready for Visa
              </button>
              {!checklistDone && <span className="text-xs text-amber-600">Complete all 4 documents to continue</span>}
            </>
          )}
          {visa.status === 'Ready for Visa' && (
            <button onClick={() => handleClick('Visa Applied')} className="flex items-center gap-1.5 px-4 py-2 bg-navy text-white rounded-lg text-sm font-semibold hover:bg-navy-light transition-colors">
              <FileText size={15} />Mark Visa Applied
            </button>
          )}
          {visa.status === 'Visa Applied' && (
            <>
              <button onClick={() => handleClick('Visa Approved')} className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors">
                <CheckCircle size={15} />Mark Visa Approved
              </button>
              <button onClick={() => handleClick('Visa Refused')} className="flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors">
                <XCircle size={15} />Mark Visa Refused
              </button>
            </>
          )}
          {(visa.status === 'Visa Approved' || visa.status === 'Visa Refused') && (
            <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold ${visa.status === 'Visa Approved' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {visa.status === 'Visa Approved' ? <CheckCircle size={15} /> : <XCircle size={15} />}
              {visa.status}
            </span>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-grey-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-navy">Document Checklist</h3>
          <span className={`text-xs font-semibold ${checklistDone ? 'text-green-600' : 'text-gray-500'}`}>{completeCount} of 4 complete</span>
        </div>
        <div className="mb-4 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all ${checklistDone ? 'bg-green-500' : 'bg-navy'}`} style={{ width: `${(completeCount / 4) * 100}%` }} />
        </div>
        <div className="space-y-3">
          {CHECKLIST_ITEMS.map((item) => (
            <label key={item.key} className="flex items-center gap-3 cursor-pointer group">
              <div onClick={() => toggleChecklistItem(item.key)} className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${visa.checklist[item.key] ? 'bg-green-500 border-green-500' : 'border-gray-300 group-hover:border-navy-light'}`}>
                {visa.checklist[item.key] && <Check className="text-white" size={10} />}
              </div>
              <span className={`text-sm transition-colors ${visa.checklist[item.key] ? 'text-gray-400 line-through' : 'text-gray-700'}`}>{item.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-grey-border p-6">
        <h3 className="text-sm font-semibold text-navy mb-3">Notes</h3>
        <textarea value={visa.notes} onChange={(e) => onUpdate({ visaApplication: { ...visa, notes: e.target.value } })} rows={3} placeholder="Visa-related notes, conditions, reminders..." className="w-full border border-grey-border rounded-lg px-3 py-2.5 text-sm resize-none focus:outline-none focus:border-navy-light focus:ring-1 focus:ring-navy-light" />
      </div>

      {pending && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-navy-dark/60" onClick={() => setPending(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 ${pending === 'Visa Approved' ? 'bg-green-50' : 'bg-red-50'}`}>
              <AlertTriangle className={pending === 'Visa Approved' ? 'text-green-600' : 'text-red-600'} size={26} />
            </div>
            <h3 className="text-base font-semibold text-navy text-center mb-2">Mark visa as {pending}?</h3>
            <p className="text-sm text-gray-500 text-center mb-6">This is usually a final outcome and cannot be easily reversed.</p>
            <div className="flex gap-3">
              <button onClick={() => setPending(null)} className="flex-1 py-2.5 border border-grey-border rounded-lg text-sm font-medium text-navy hover:bg-grey-bg transition-colors">Cancel</button>
              <button onClick={() => apply(pending)} className={`flex-1 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors ${pending === 'Visa Approved' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}>Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Application Tab ───────────────────────────────────────────────────────────

function ApplicationTab({
  application, partners, onUpdate,
}: { application: ApplicationRecord; partners: Partner[]; onUpdate: (u: Partial<ApplicationRecord>) => void }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const offers = application.offerApplications;
  const active = getActiveOfferApplication(application);
  const unlocked = isVisaUnlocked(application);

  const updateOffer = (id: string, updates: Partial<OfferApplication>) =>
    onUpdate({ offerApplications: offers.map((o) => (o.id === id ? { ...o, ...updates } : o)) });

  const addOffer = (o: OfferApplication) => {
    onUpdate({ offerApplications: [...offers, o] });
    setShowAddModal(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-navy">Offer Application History ({offers.length})</h3>
        <button onClick={() => setShowAddModal(true)} className="flex items-center gap-1.5 px-3.5 py-2 bg-navy text-white rounded-lg text-sm font-semibold hover:bg-navy-light transition-colors">
          <Plus size={15} />Add Institution
        </button>
      </div>

      {offers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-grey-border py-14 text-center">
          <div className="w-12 h-12 bg-grey-bg rounded-xl flex items-center justify-center mx-auto mb-3">
            <Building2 className="text-gray-400" size={22} />
          </div>
          <p className="text-sm font-medium text-navy">No offer applications yet</p>
          <p className="text-xs text-gray-400 mt-1 mb-4">Add an institution to get started</p>
          <button onClick={() => setShowAddModal(true)} className="inline-flex items-center gap-1.5 px-4 py-2 bg-navy text-white rounded-lg text-sm font-semibold hover:bg-navy-light transition-colors">
            <Plus size={16} />Add Institution
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {[...offers].reverse().map((o) => (
            <OfferCard key={o.id} offerApp={o} isActive={o.id === active?.id} onUpdate={(u) => updateOffer(o.id, u)} />
          ))}
        </div>
      )}

      {showAddModal && <AddOfferModal partners={partners} onAdd={addOffer} onClose={() => setShowAddModal(false)} />}

      {unlocked && (
        <div className="pt-2">
          <h3 className="text-sm font-semibold text-navy mb-3">Visa Application</h3>
          <VisaPanel application={application} onUpdate={onUpdate} />
        </div>
      )}
    </div>
  );
}

// ─── Details Tab ───────────────────────────────────────────────────────────────

function DetailsTab({ application }: { application: ApplicationRecord }) {
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
    { icon: CalendarDays,  label: 'Consultation Date',      value: application.consultationDate },
    { icon: User,          label: 'Counselor',              value: application.counselor },
  ];

  return (
    <div className="bg-white rounded-2xl border border-grey-border p-6">
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
                <p className={`text-sm font-medium truncate ${row.value ? 'text-navy' : 'text-gray-300'}`}>{row.value || '—'}</p>
              </div>
            </div>
          );
        })}
      </div>
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
    </div>
  );
}

// ─── Main ClientProfile ───────────────────────────────────────────────────────

export default function ClientProfile({ application, partners, onClose, onUpdate }: ClientProfileProps) {
  const [tab, setTab] = useState<Tab>('application');
  const [confirmWithdraw, setConfirmWithdraw] = useState(false);
  const initials = application.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
  const statusLabel = getClientStatusLabel(application);
  const tone = getStatusTone(application);

  const tabs: { key: Tab; label: string; icon: typeof User; count?: number }[] = [
    { key: 'details' as Tab,     label: 'Details',     icon: User },
    { key: 'application' as Tab, label: 'Application',  icon: FileText, count: application.offerApplications.length },
  ];

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
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${STATUS_TONE_STYLES[tone]}`}>
          {statusLabel}
        </span>
        {!application.withdrawn && (
          <button
            onClick={() => setConfirmWithdraw(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-500 border border-grey-border hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-colors flex-shrink-0"
          >
            <UserX size={14} />Mark as withdrawn
          </button>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-hidden flex">
        <div className="flex-shrink-0 pt-6 pl-6 pr-4">
          <div className="bg-white rounded-xl border border-grey-border p-2 space-y-0.5">
            {tabs.map((t) => {
              const Icon = t.icon;
              const isActiveTab = tab === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left whitespace-nowrap ${isActiveTab ? 'bg-navy/10 text-navy' : 'text-gray-500 hover:bg-grey-bg hover:text-navy'}`}
                >
                  <Icon size={16} className="flex-shrink-0" />
                  <span className="flex-1">{t.label}</span>
                  {typeof t.count === 'number' && t.count > 0 && (
                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold flex-shrink-0 ${isActiveTab ? 'bg-navy text-white' : 'bg-gray-100 text-gray-600'}`}>
                      {t.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-6 pr-6">
          <div className="space-y-5">
            {application.withdrawn && (
              <div className="bg-gray-100 border border-grey-border rounded-2xl px-5 py-4 flex items-center gap-3">
                <UserX className="text-gray-500 flex-shrink-0" size={18} />
                <p className="text-sm text-gray-600">
                  This client was marked as withdrawn{application.withdrawnDate ? ` on ${application.withdrawnDate}` : ''}. Their history is preserved below.
                </p>
              </div>
            )}
            {tab === 'details' && <DetailsTab application={application} />}
            {tab === 'application' && <ApplicationTab application={application} partners={partners} onUpdate={onUpdate} />}
          </div>
        </div>
      </div>

      {confirmWithdraw && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-navy-dark/60" onClick={() => setConfirmWithdraw(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 bg-gray-100">
              <UserX className="text-gray-600" size={26} />
            </div>
            <h3 className="text-base font-semibold text-navy text-center mb-2">Mark {application.name} as withdrawn?</h3>
            <p className="text-sm text-gray-500 text-center mb-6">This is the only way a client exits the pipeline. Their history is kept, but no further action can be taken on their case.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmWithdraw(false)} className="flex-1 py-2.5 border border-grey-border rounded-lg text-sm font-medium text-navy hover:bg-grey-bg transition-colors">Cancel</button>
              <button
                onClick={() => { onUpdate({ withdrawn: true, withdrawnDate: today() }); setConfirmWithdraw(false); }}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white bg-gray-600 hover:bg-gray-700 transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
