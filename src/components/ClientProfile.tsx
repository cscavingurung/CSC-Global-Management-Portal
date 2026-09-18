import { useState, useEffect } from 'react';
import {
  ArrowLeft, Plus, Check, CheckCircle, XCircle, X, ChevronDown,
  AlertTriangle, Building2, Calendar, FileText, Trash2, ChevronRight,
  Phone, Mail, Globe, Target, CalendarDays, User, Cake,
  Users, Heart, GraduationCap, BookOpen, Briefcase,
} from 'lucide-react';
import {
  ApplicationRecord, ApplicationStatus, StatusHistoryEntry,
  CollegeApplication, CollegeAppStatus, DocumentItem,
  Partner, VisaApplication, VisaStatus,
} from '../types';

interface ClientProfileProps {
  application: ApplicationRecord;
  partners: Partner[];
  onClose: () => void;
  onUpdate: (updates: Partial<ApplicationRecord>) => void;
}

type Tab = 'details' | 'college' | 'visa';

// ─── Constants ────────────────────────────────────────────────────────────────

const APP_STATUS_STYLES: Record<ApplicationStatus, string> = {
  Preparation: 'bg-gray-100 text-gray-600 border-gray-200',
  Lodgement:   'bg-navy/10 text-navy border-navy/20',
  Success:     'bg-green-100 text-green-700 border-green-200',
  Refused:     'bg-red-100 text-red-700 border-red-200',
};

const COLLEGE_STATUS_STYLES: Record<CollegeAppStatus, string> = {
  'Preparing Documents': 'bg-gray-100 text-gray-600',
  'Offer Received':      'bg-sky-100 text-sky-700',
  'Accepted':            'bg-green-100 text-green-700',
  'Declined':            'bg-red-100 text-red-700',
};

const VISA_STATUS_STYLES: Record<VisaStatus, string> = {
  Preparing: 'bg-gray-100 text-gray-600',
  Lodged:    'bg-navy/10 text-navy',
  Granted:   'bg-green-100 text-green-700',
  Refused:   'bg-red-100 text-red-700',
};

const DEFAULT_COLLEGE_DOCS = [
  'Passport Copy',
  'Academic Transcripts',
  'English Test Results (IELTS/PTE)',
  'Statement of Purpose',
  'Bank Statements',
  'Work Experience Letter',
];

const VISA_DOCS_BY_PURPOSE: Record<string, string[]> = {
  Study: [
    'Passport',
    'Confirmation of Enrolment (CoE)',
    'Overseas Student Health Cover (OSHC)',
    'Academic Transcripts',
    'English Test Results (IELTS/PTE)',
    'Financial Evidence (Bank Statements)',
    'Statement of Purpose',
    'Police Clearance Certificate',
    'Passport Photographs',
  ],
  Work: [
    'Passport',
    'Job Offer Letter',
    'Skills Assessment',
    'English Test Results (IELTS/PTE)',
    'Employment References',
    'Police Clearance Certificate',
    'Medical Examination',
    'Financial Evidence (Bank Statements)',
  ],
  PR: [
    'Passport',
    'Skills Assessment',
    'English Test Results (IELTS/PTE)',
    'Employment References',
    'Police Clearance Certificate',
    'Medical Examination',
    'Financial Evidence (Bank Statements)',
    'Birth Certificate',
  ],
  Tourist: [
    'Passport',
    'Bank Statements',
    'Travel Itinerary',
    'Hotel Bookings',
    'Employment / Study Letter',
    'Passport Photographs',
  ],
  SOWP: [
    'Passport',
    "Partner's Visa / Work Permit",
    'Marriage Certificate',
    'Police Clearance Certificate',
    'Financial Evidence (Bank Statements)',
    'Medical Examination',
  ],
};

function getDefaultVisaDocs(purpose: string): DocumentItem[] {
  const names = VISA_DOCS_BY_PURPOSE[purpose] ?? [
    'Passport', 'Police Clearance Certificate', 'Financial Evidence (Bank Statements)',
  ];
  return names.map((name, i) => ({ id: `vdoc${Date.now()}${i}`, name, ready: false }));
}

// ─── Add College Application Modal ────────────────────────────────────────────

function AddCollegeAppModal({
  partners, onAdd, onClose,
}: { partners: Partner[]; onAdd: (ca: CollegeApplication) => void; onClose: () => void }) {
  const [institution, setInstitution] = useState('');
  const [customInstitution, setCustomInstitution] = useState('');
  const [course, setCourse] = useState('');
  const [customCourse, setCustomCourse] = useState('');
  const [appliedDate, setAppliedDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');
  const [includedDocs, setIncludedDocs] = useState<string[]>([...DEFAULT_COLLEGE_DOCS]);
  const [customDoc, setCustomDoc] = useState('');

  const selectedPartner = partners.find((p) => p.name === institution);
  const courseOptions = selectedPartner ? selectedPartner.courses.map((c) => c.name) : [];
  const institutionName = institution === '__custom__' ? customInstitution : institution;
  const courseName = courseOptions.length === 0 || course === '__custom__' ? customCourse : course;
  const allDocOptions = [...new Set([...DEFAULT_COLLEGE_DOCS, ...includedDocs])];

  const toggleDoc = (doc: string) =>
    setIncludedDocs((prev) => (prev.includes(doc) ? prev.filter((d) => d !== doc) : [...prev, doc]));

  const addCustomDoc = () => {
    const t = customDoc.trim();
    if (t && !includedDocs.includes(t)) { setIncludedDocs((p) => [...p, t]); setCustomDoc(''); }
  };

  const handleSubmit = () => {
    if (!institutionName.trim() || !courseName.trim()) return;
    onAdd({
      id: `ca${Date.now()}`,
      institution: institutionName.trim(),
      course: courseName.trim(),
      appliedDate,
      status: 'Preparing Documents',
      documents: includedDocs.map((name, i): DocumentItem => ({ id: `doc${Date.now()}${i}`, name, ready: false })),
      notes,
    });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-navy-dark/60" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-grey-border flex-shrink-0">
          <h3 className="text-base font-semibold text-navy">Add College Application</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-navy transition-colors"><X size={20} /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {/* Institution */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Institution</label>
            <div className="relative">
              <select
                value={institution}
                onChange={(e) => { setInstitution(e.target.value); setCourse(''); setCustomCourse(''); }}
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

          {/* Course */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Course</label>
            {courseOptions.length > 0 ? (
              <>
                <div className="relative">
                  <select value={course} onChange={(e) => { setCourse(e.target.value); setCustomCourse(''); }} className="w-full appearance-none border border-grey-border rounded-lg px-3 py-2.5 text-sm text-navy bg-white focus:outline-none focus:border-navy-light focus:ring-1 focus:ring-navy-light pr-9">
                    <option value="">Select course...</option>
                    {courseOptions.map((c) => <option key={c} value={c}>{c}</option>)}
                    <option value="__custom__">Other (type manually)</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                </div>
                {course === '__custom__' && (
                  <input type="text" value={customCourse} onChange={(e) => setCustomCourse(e.target.value)} placeholder="Enter course name" className="mt-2 w-full border border-grey-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-navy-light focus:ring-1 focus:ring-navy-light" />
                )}
              </>
            ) : (
              <input type="text" value={customCourse} onChange={(e) => setCustomCourse(e.target.value)} placeholder="Enter course name" className="w-full border border-grey-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-navy-light focus:ring-1 focus:ring-navy-light" />
            )}
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Application Date</label>
            <input type="date" value={appliedDate} onChange={(e) => setAppliedDate(e.target.value)} className="w-full border border-grey-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-navy-light focus:ring-1 focus:ring-navy-light" />
          </div>

          {/* Documents */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-2">Required Documents</label>
            <div className="space-y-2.5">
              {allDocOptions.map((doc) => (
                <label key={doc} className="flex items-center gap-2.5 cursor-pointer group">
                  <div onClick={() => toggleDoc(doc)} className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${includedDocs.includes(doc) ? 'bg-navy border-navy' : 'border-gray-300 group-hover:border-navy-light'}`}>
                    {includedDocs.includes(doc) && <Check className="text-white" size={10} />}
                  </div>
                  <span className="text-sm text-gray-700">{doc}</span>
                </label>
              ))}
            </div>
            <div className="flex gap-2 mt-3">
              <input type="text" value={customDoc} onChange={(e) => setCustomDoc(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addCustomDoc()} placeholder="Add custom document..." className="flex-1 border border-grey-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-navy-light" />
              <button onClick={addCustomDoc} className="px-3 py-2 bg-grey-bg border border-grey-border text-navy rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors">Add</button>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Notes (optional)</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Special requirements or notes..." className="w-full border border-grey-border rounded-lg px-3 py-2.5 text-sm resize-none focus:outline-none focus:border-navy-light" />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-grey-border flex gap-3 flex-shrink-0">
          <button onClick={onClose} className="flex-1 py-2.5 border border-grey-border rounded-lg text-sm font-medium text-navy hover:bg-grey-bg transition-colors">Cancel</button>
          <button onClick={handleSubmit} disabled={!institutionName.trim() || !courseName.trim()} className="flex-1 py-2.5 bg-navy text-white rounded-lg text-sm font-semibold hover:bg-navy-light disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            Add Application
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── College App Card ─────────────────────────────────────────────────────────

function CollegeAppCard({
  ca, onUpdate, onDelete,
}: { ca: CollegeApplication; onUpdate: (u: Partial<CollegeApplication>) => void; onDelete: () => void }) {
  const [expanded, setExpanded] = useState(true);
  const readyCount = ca.documents.filter((d) => d.ready).length;
  const totalDocs = ca.documents.length;

  const toggleDoc = (id: string) =>
    onUpdate({ documents: ca.documents.map((d) => (d.id === id ? { ...d, ready: !d.ready } : d)) });

  return (
    <div className="bg-white rounded-2xl border border-grey-border overflow-hidden">
      <div className="px-5 py-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-navy/10 flex items-center justify-center flex-shrink-0">
          <Building2 className="text-navy" size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-navy truncate">{ca.institution}</p>
          <p className="text-xs text-gray-500 truncate">{ca.course}</p>
        </div>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 ${COLLEGE_STATUS_STYLES[ca.status]}`}>{ca.status}</span>
        <button onClick={() => setExpanded(!expanded)} className="text-gray-400 hover:text-navy p-1 transition-colors">
          <ChevronDown className={`transition-transform ${expanded ? 'rotate-180' : ''}`} size={16} />
        </button>
      </div>

      {expanded && (
        <div className="border-t border-grey-border px-5 py-4 space-y-4">
          <div className="flex flex-wrap gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1.5"><Calendar size={13} />Applied: {ca.appliedDate}</span>
            {ca.offerDate && <span className="flex items-center gap-1.5 text-sky-600 font-medium"><CheckCircle size={13} />Offer: {ca.offerDate}</span>}
            <span className="flex items-center gap-1.5"><FileText size={13} />{readyCount}/{totalDocs} docs ready</span>
          </div>

          {totalDocs > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2.5">Required Documents</p>
              <div className="space-y-2.5">
                {ca.documents.map((doc) => (
                  <label key={doc.id} className="flex items-center gap-2.5 cursor-pointer group">
                    <div onClick={() => toggleDoc(doc.id)} className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${doc.ready ? 'bg-green-500 border-green-500' : 'border-gray-300 group-hover:border-navy-light'}`}>
                      {doc.ready && <Check className="text-white" size={10} />}
                    </div>
                    <span className={`text-sm transition-colors ${doc.ready ? 'text-gray-400 line-through' : 'text-gray-700'}`}>{doc.name}</span>
                  </label>
                ))}
              </div>
              <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all ${readyCount === totalDocs ? 'bg-green-500' : 'bg-navy'}`} style={{ width: `${totalDocs > 0 ? (readyCount / totalDocs) * 100 : 0}%` }} />
              </div>
            </div>
          )}

          {ca.notes && <div className="bg-grey-bg rounded-lg px-3.5 py-2.5"><p className="text-xs text-gray-500">{ca.notes}</p></div>}

          <div className="flex items-center gap-2 pt-1">
            {ca.status === 'Preparing Documents' && (
              <button onClick={() => onUpdate({ status: 'Offer Received', offerDate: new Date().toISOString().slice(0, 10) })} className="flex items-center gap-1.5 px-3.5 py-2 bg-sky-600 text-white rounded-lg text-xs font-semibold hover:bg-sky-700 transition-colors">
                <CheckCircle size={14} />Mark Offer Received
              </button>
            )}
            {ca.status === 'Offer Received' && (
              <>
                <button onClick={() => onUpdate({ status: 'Accepted' })} className="flex items-center gap-1.5 px-3.5 py-2 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700 transition-colors">
                  <CheckCircle size={14} />Accept Offer
                </button>
                <button onClick={() => onUpdate({ status: 'Declined' })} className="flex items-center gap-1.5 px-3.5 py-2 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 transition-colors">
                  <XCircle size={14} />Decline
                </button>
              </>
            )}
            {(ca.status === 'Accepted' || ca.status === 'Declined') && (
              <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg ${ca.status === 'Accepted' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {ca.status === 'Accepted' ? <CheckCircle size={13} /> : <XCircle size={13} />}
                Offer {ca.status}
              </span>
            )}
            <button onClick={onDelete} title="Remove" className="ml-auto p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
              <Trash2 size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Details Tab ──────────────────────────────────────────────────────────────

function DetailsTab({ application, onUpdate }: { application: ApplicationRecord; onUpdate: (u: Partial<ApplicationRecord>) => void }) {
  const [pendingStatus, setPendingStatus] = useState<ApplicationStatus | null>(null);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (showToast) { const t = setTimeout(() => setShowToast(false), 3000); return () => clearTimeout(t); }
  }, [showToast]);

  const applyStatus = (s: ApplicationStatus) => {
    const now = new Date();
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sept','Oct','Nov','Dec'];
    const entry: StatusHistoryEntry = { status: s, date: `${months[now.getMonth()]} ${now.getDate()}` };
    onUpdate({ status: s, statusHistory: [...application.statusHistory, entry] });
    setShowToast(true);
    setPendingStatus(null);
  };

  const handleStatus = (s: ApplicationStatus) => {
    if (s === application.status) return;
    (s === 'Success' || s === 'Refused') ? setPendingStatus(s) : applyStatus(s);
  };

  const STATUS_OPTIONS: ApplicationStatus[] = ['Preparation', 'Lodgement', 'Success', 'Refused'];

  const detailRows = [
    { icon: Phone,         label: 'Phone',                 value: application.phone },
    { icon: Mail,          label: 'Email',                 value: application.email },
    { icon: Globe,         label: 'Country of Interest',   value: application.country },
    { icon: Target,        label: 'Purpose',               value: application.purpose },
    { icon: Cake,          label: 'Date of Birth',         value: application.dob },
    { icon: Users,         label: 'Gender',                value: application.gender },
    { icon: Heart,         label: 'Marital Status',        value: application.maritalStatus },
    { icon: GraduationCap, label: 'Academic Qualification',value: application.academicQualification },
    { icon: BookOpen,      label: 'IELTS / PTE',           value: application.ieltsPte },
    { icon: Briefcase,     label: 'Work Experience',       value: application.workExperience },
    { icon: CalendarDays,  label: 'Consultation Date',     value: application.consultationDate },
    { icon: User,          label: 'Counselor',             value: application.counselor },
  ];

  return (
    <div className="space-y-5">
      {/* Client details */}
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
                  <p className={`text-sm font-medium truncate ${row.value ? 'text-navy' : 'text-gray-300'}`}>
                  {row.value || '—'}
                </p>
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

      {/* Status */}
      <div className="bg-white rounded-2xl border border-grey-border p-6">
        <h3 className="text-sm font-semibold text-navy mb-8">Application Status</h3>

        <div className="flex items-start">
          {/* Step 1 — Preparation */}
          <button onClick={() => handleStatus('Preparation')} className="flex flex-col items-center gap-2 group">
            <div className={`w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all ${
              ['Lodgement','Success','Refused'].includes(application.status)
                ? 'bg-navy border-navy'
                : application.status === 'Preparation'
                ? 'bg-gray-500 border-gray-500'
                : 'bg-white border-gray-200 group-hover:border-navy-light'
            }`}>
              {['Lodgement','Success','Refused'].includes(application.status)
                ? <Check size={15} className="text-white" />
                : <span className={`w-2.5 h-2.5 rounded-full ${application.status === 'Preparation' ? 'bg-white' : 'bg-gray-300'}`} />
              }
            </div>
            <div className="text-center">
              <p className={`text-xs font-semibold whitespace-nowrap ${application.status === 'Preparation' || ['Lodgement','Success','Refused'].includes(application.status) ? 'text-navy' : 'text-gray-400'}`}>Preparation</p>
              <p className="text-[11px] text-gray-400 whitespace-nowrap">{application.purpose} visa documents</p>
            </div>
          </button>

          {/* Connector */}
          <div className={`flex-1 h-0.5 mb-5 transition-colors ${['Lodgement','Success','Refused'].includes(application.status) ? 'bg-navy' : 'bg-gray-200'}`} />

          {/* Step 2 — Lodgement */}
          <button onClick={() => handleStatus('Lodgement')} className="flex flex-col items-center gap-2 group">
            <div className={`w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all ${
              ['Success','Refused'].includes(application.status)
                ? 'bg-navy border-navy'
                : application.status === 'Lodgement'
                ? 'bg-navy border-navy'
                : 'bg-white border-gray-200 group-hover:border-navy-light'
            }`}>
              {['Success','Refused'].includes(application.status)
                ? <Check size={15} className="text-white" />
                : <span className={`w-2.5 h-2.5 rounded-full ${application.status === 'Lodgement' ? 'bg-white' : 'bg-gray-300'}`} />
              }
            </div>
            <div className="text-center">
              <p className={`text-xs font-semibold whitespace-nowrap ${application.status === 'Lodgement' || ['Success','Refused'].includes(application.status) ? 'text-navy' : 'text-gray-400'}`}>Lodgement</p>
              <p className="text-[11px] text-gray-400 whitespace-nowrap">{application.purpose} visa submitted</p>
            </div>
          </button>

          {/* Connector */}
          <div className={`flex-1 h-0.5 mb-5 transition-colors ${
            application.status === 'Success' ? 'bg-green-500' :
            application.status === 'Refused' ? 'bg-red-500' : 'bg-gray-200'
          }`} />

          {/* Step 3 — Outcome */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex gap-2">
              <button
                onClick={() => handleStatus('Success')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold border transition-all ${
                  application.status === 'Success'
                    ? 'bg-green-600 border-green-600 text-white shadow-sm'
                    : 'border-gray-200 text-gray-400 hover:border-green-300 hover:text-green-600 hover:bg-green-50'
                }`}
              >
                {application.status === 'Success' && <CheckCircle size={13} />}
                Success
              </button>
              <button
                onClick={() => handleStatus('Refused')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold border transition-all ${
                  application.status === 'Refused'
                    ? 'bg-red-600 border-red-600 text-white shadow-sm'
                    : 'border-gray-200 text-gray-400 hover:border-red-300 hover:text-red-600 hover:bg-red-50'
                }`}
              >
                {application.status === 'Refused' && <XCircle size={13} />}
                Refused
              </button>
            </div>
            <div className="text-center">
              <p className="text-xs font-semibold text-gray-500">Visa Outcome</p>
              <p className="text-[11px] text-gray-400 whitespace-nowrap">{application.purpose} visa decision</p>
            </div>
          </div>
        </div>
      </div>

      {/* History */}
      <div className="bg-white rounded-2xl border border-grey-border p-6">
        <h3 className="text-sm font-semibold text-navy mb-4">Status History</h3>
        <div className="relative pl-6">
          <div className="absolute left-[7px] top-2 bottom-2 w-px bg-grey-border" />
          <div className="space-y-4">
            {[...application.statusHistory].reverse().map((entry, idx) => (
              <div key={idx} className="relative">
                <div className={`absolute -left-6 top-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${entry.status === 'Success' ? 'bg-green-500' : entry.status === 'Refused' ? 'bg-red-500' : entry.status === 'Lodgement' ? 'bg-navy' : 'bg-gray-400'}`} />
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-navy">{entry.status}</span>
                  <span className="text-xs text-gray-400">{entry.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {pendingStatus && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-navy-dark/60" onClick={() => setPendingStatus(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 ${pendingStatus === 'Success' ? 'bg-green-50' : 'bg-red-50'}`}>
              <AlertTriangle className={pendingStatus === 'Success' ? 'text-green-600' : 'text-red-600'} size={26} />
            </div>
            <h3 className="text-base font-semibold text-navy text-center mb-2">Mark as {pendingStatus}?</h3>
            <p className="text-sm text-gray-500 text-center mb-6">This is usually a final status and cannot be easily reversed.</p>
            <div className="flex gap-3">
              <button onClick={() => setPendingStatus(null)} className="flex-1 py-2.5 border border-grey-border rounded-lg text-sm font-medium text-navy hover:bg-grey-bg transition-colors">Cancel</button>
              <button onClick={() => applyStatus(pendingStatus)} className={`flex-1 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors ${pendingStatus === 'Success' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}>Confirm</button>
            </div>
          </div>
        </div>
      )}

      {showToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[70] bg-green-600 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 text-sm font-medium">
          <CheckCircle size={18} />Status updated
        </div>
      )}
    </div>
  );
}

// ─── College Applications Tab ─────────────────────────────────────────────────

function CollegeTab({
  application, partners, onUpdate, onGoToVisa,
}: { application: ApplicationRecord; partners: Partner[]; onUpdate: (u: Partial<ApplicationRecord>) => void; onGoToVisa: () => void }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const cas = application.collegeApplications ?? [];
  const offers   = cas.filter((ca) => ca.status === 'Offer Received').length;
  const accepted = cas.filter((ca) => ca.status === 'Accepted').length;

  const updateCA = (id: string, updates: Partial<CollegeApplication>) =>
    onUpdate({ collegeApplications: cas.map((ca) => (ca.id === id ? { ...ca, ...updates } : ca)) });

  const deleteCA = (id: string) =>
    onUpdate({ collegeApplications: cas.filter((ca) => ca.id !== id) });

  const addCA = (newCA: CollegeApplication) => {
    onUpdate({ collegeApplications: [...cas, newCA] });
    setShowAddModal(false);
  };

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Applied',  value: cas.length, color: 'text-navy' },
          { label: 'Offers',   value: offers,     color: 'text-sky-600' },
          { label: 'Accepted', value: accepted,   color: 'text-green-600' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-grey-border p-4 text-center">
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Proceed to visa banner */}
      {accepted > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-2xl px-5 py-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-green-800">{accepted} offer{accepted > 1 ? 's' : ''} accepted</p>
            <p className="text-xs text-green-600 mt-0.5">Ready to begin the visa application process</p>
          </div>
          <button onClick={onGoToVisa} className="flex items-center gap-1.5 px-4 py-2 bg-green-700 text-white rounded-lg text-sm font-semibold hover:bg-green-800 transition-colors flex-shrink-0">
            Go to Visa <ChevronRight size={15} />
          </button>
        </div>
      )}

      {/* List header + add */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-navy">Applications ({cas.length})</h3>
        <button onClick={() => setShowAddModal(true)} className="flex items-center gap-1.5 px-3.5 py-2 bg-navy text-white rounded-lg text-sm font-semibold hover:bg-navy-light transition-colors">
          <Plus size={15} />Add
        </button>
      </div>

      {cas.length === 0 ? (
        <div className="bg-white rounded-2xl border border-grey-border py-14 text-center">
          <div className="w-12 h-12 bg-grey-bg rounded-xl flex items-center justify-center mx-auto mb-3">
            <Building2 className="text-gray-400" size={22} />
          </div>
          <p className="text-sm font-medium text-navy">No college applications yet</p>
          <p className="text-xs text-gray-400 mt-1 mb-4">Add a college or university to get started</p>
          <button onClick={() => setShowAddModal(true)} className="inline-flex items-center gap-1.5 px-4 py-2 bg-navy text-white rounded-lg text-sm font-semibold hover:bg-navy-light transition-colors">
            <Plus size={16} />Add Application
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {cas.map((ca) => (
            <CollegeAppCard key={ca.id} ca={ca} onUpdate={(u) => updateCA(ca.id, u)} onDelete={() => deleteCA(ca.id)} />
          ))}
        </div>
      )}

      {showAddModal && <AddCollegeAppModal partners={partners} onAdd={addCA} onClose={() => setShowAddModal(false)} />}
    </div>
  );
}

// ─── Visa Tab ─────────────────────────────────────────────────────────────────

function VisaTab({ application, onUpdate }: { application: ApplicationRecord; onUpdate: (u: Partial<ApplicationRecord>) => void }) {
  const [pendingStatus, setPendingStatus] = useState<VisaStatus | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [customDoc, setCustomDoc] = useState('');

  useEffect(() => {
    if (showToast) { const t = setTimeout(() => setShowToast(false), 3000); return () => clearTimeout(t); }
  }, [showToast]);

  const visa = application.visaApplication;
  const acceptedOffers = (application.collegeApplications ?? []).filter((ca) => ca.status === 'Accepted');

  const startVisa = () =>
    onUpdate({ visaApplication: { status: 'Preparing', documents: getDefaultVisaDocs(application.purpose), notes: '' } });

  const toggleDoc = (id: string) => {
    if (!visa) return;
    onUpdate({ visaApplication: { ...visa, documents: visa.documents.map((d) => (d.id === id ? { ...d, ready: !d.ready } : d)) } });
  };

  const addCustomDoc = () => {
    if (!visa || !customDoc.trim()) return;
    onUpdate({ visaApplication: { ...visa, documents: [...visa.documents, { id: `vdoc${Date.now()}`, name: customDoc.trim(), ready: false }] } });
    setCustomDoc('');
  };

  const applyVisaStatus = (s: VisaStatus) => {
    if (!visa) return;
    const today = new Date().toISOString().slice(0, 10);
    const now = new Date();
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sept','Oct','Nov','Dec'];
    const histDate = `${months[now.getMonth()]} ${now.getDate()}`;

    const updatedVisa: VisaApplication = {
      ...visa, status: s,
      lodgementDate: s === 'Lodged' ? today : visa.lodgementDate,
      outcomeDate:   (s === 'Granted' || s === 'Refused') ? today : visa.outcomeDate,
    };

    const appStatusMap: Partial<Record<VisaStatus, ApplicationStatus>> = { Lodged: 'Lodgement', Granted: 'Success', Refused: 'Refused' };
    const newAppStatus = appStatusMap[s];
    const updates: Partial<ApplicationRecord> = { visaApplication: updatedVisa };
    if (newAppStatus) {
      updates.status = newAppStatus;
      updates.statusHistory = [...application.statusHistory, { status: newAppStatus, date: histDate }];
    }
    onUpdate(updates);
    setToastMessage(s === 'Lodged' ? 'Visa lodged' : s === 'Granted' ? 'Visa granted!' : 'Visa refused');
    setShowToast(true);
    setPendingStatus(null);
  };

  const handleVisaStatus = (s: VisaStatus) => {
    if (!visa || s === visa.status) return;
    (s === 'Granted' || s === 'Refused') ? setPendingStatus(s) : applyVisaStatus(s);
  };

  const readyCount = visa?.documents.filter((d) => d.ready).length ?? 0;
  const totalDocs  = visa?.documents.length ?? 0;

  if (acceptedOffers.length === 0 && !visa) {
    return (
      <div>
        <div className="bg-white rounded-2xl border border-grey-border py-16 text-center">
          <div className="w-12 h-12 bg-grey-bg rounded-xl flex items-center justify-center mx-auto mb-3">
            <FileText className="text-gray-400" size={22} />
          </div>
          <p className="text-sm font-medium text-navy">No accepted offer yet</p>
          <p className="text-xs text-gray-400 mt-1">Accept a college offer first, then start the visa process here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Accepted offers */}
      {acceptedOffers.length > 0 && (
        <div className="bg-white rounded-2xl border border-grey-border p-6">
          <p className="text-xs font-medium text-gray-500 mb-3">Accepted Offer{acceptedOffers.length > 1 ? 's' : ''}</p>
          <div className="space-y-3">
            {acceptedOffers.map((ca) => (
              <div key={ca.id} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                  <Building2 className="text-green-600" size={15} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-navy truncate">{ca.institution}</p>
                  <p className="text-xs text-gray-500 truncate">{ca.course}</p>
                </div>
                <span className="text-xs font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-full flex-shrink-0">Accepted</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Start visa */}
      {!visa && (
        <div className="bg-white rounded-2xl border border-grey-border py-14 text-center">
          <div className="w-12 h-12 bg-grey-bg rounded-xl flex items-center justify-center mx-auto mb-3">
            <FileText className="text-gray-400" size={22} />
          </div>
          <p className="text-sm font-medium text-navy">Visa application not started</p>
          <p className="text-xs text-gray-400 mt-1 mb-5">Documents will be pre-filled based on the client's purpose</p>
          <button onClick={startVisa} className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-navy text-white rounded-lg text-sm font-semibold hover:bg-navy-light transition-colors">
            <Plus size={16} />Start Visa Application
          </button>
        </div>
      )}

      {/* Visa tracking */}
      {visa && (
        <>
          <div className="bg-white rounded-2xl border border-grey-border p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-semibold text-navy">Visa Status</h3>
              <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${VISA_STATUS_STYLES[visa.status]}`}>{visa.status}</span>
            </div>

            {(visa.lodgementDate || visa.outcomeDate) && (
              <div className="flex flex-wrap gap-4 mb-5 pb-5 border-b border-grey-border text-xs text-gray-500">
                {visa.lodgementDate && <span className="flex items-center gap-1.5"><Calendar size={13} />Lodged: <span className="font-medium text-navy ml-1">{visa.lodgementDate}</span></span>}
                {visa.outcomeDate && <span className={`flex items-center gap-1.5 font-medium ${visa.status === 'Granted' ? 'text-green-700' : 'text-red-700'}`}><CheckCircle size={13} />Outcome: {visa.outcomeDate}</span>}
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {visa.status === 'Preparing' && (
                <button onClick={() => handleVisaStatus('Lodged')} className="flex items-center gap-1.5 px-4 py-2 bg-navy text-white rounded-lg text-sm font-semibold hover:bg-navy-light transition-colors">
                  <FileText size={15} />Mark as Lodged
                </button>
              )}
              {visa.status === 'Lodged' && (
                <>
                  <button onClick={() => handleVisaStatus('Granted')} className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors">
                    <CheckCircle size={15} />Mark as Granted
                  </button>
                  <button onClick={() => handleVisaStatus('Refused')} className="flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors">
                    <XCircle size={15} />Mark as Refused
                  </button>
                </>
              )}
              {(visa.status === 'Granted' || visa.status === 'Refused') && (
                <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold ${visa.status === 'Granted' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {visa.status === 'Granted' ? <CheckCircle size={15} /> : <XCircle size={15} />}
                  Visa {visa.status}
                </span>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-grey-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-navy">Required Documents</h3>
              <span className="text-xs text-gray-500">{readyCount}/{totalDocs} ready</span>
            </div>
            {totalDocs > 0 && (
              <div className="mb-4 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all ${readyCount === totalDocs ? 'bg-green-500' : 'bg-navy'}`} style={{ width: `${totalDocs > 0 ? (readyCount / totalDocs) * 100 : 0}%` }} />
              </div>
            )}
            <div className="space-y-3">
              {visa.documents.map((doc) => (
                <label key={doc.id} className="flex items-center gap-3 cursor-pointer group">
                  <div onClick={() => toggleDoc(doc.id)} className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${doc.ready ? 'bg-green-500 border-green-500' : 'border-gray-300 group-hover:border-navy-light'}`}>
                    {doc.ready && <Check className="text-white" size={10} />}
                  </div>
                  <span className={`text-sm transition-colors ${doc.ready ? 'text-gray-400 line-through' : 'text-gray-700'}`}>{doc.name}</span>
                </label>
              ))}
            </div>
            <div className="flex gap-2 mt-4 pt-4 border-t border-grey-border">
              <input type="text" value={customDoc} onChange={(e) => setCustomDoc(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addCustomDoc()} placeholder="Add custom document..." className="flex-1 border border-grey-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-navy-light" />
              <button onClick={addCustomDoc} className="px-3 py-2 bg-grey-bg border border-grey-border text-navy rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors">Add</button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-grey-border p-6">
            <h3 className="text-sm font-semibold text-navy mb-3">Notes</h3>
            <textarea value={visa.notes} onChange={(e) => onUpdate({ visaApplication: { ...visa, notes: e.target.value } })} rows={3} placeholder="Visa-related notes, conditions, reminders..." className="w-full border border-grey-border rounded-lg px-3 py-2.5 text-sm resize-none focus:outline-none focus:border-navy-light focus:ring-1 focus:ring-navy-light" />
          </div>
        </>
      )}

      {pendingStatus && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-navy-dark/60" onClick={() => setPendingStatus(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 ${pendingStatus === 'Granted' ? 'bg-green-50' : 'bg-red-50'}`}>
              <AlertTriangle className={pendingStatus === 'Granted' ? 'text-green-600' : 'text-red-600'} size={26} />
            </div>
            <h3 className="text-base font-semibold text-navy text-center mb-2">Mark visa as {pendingStatus}?</h3>
            <p className="text-sm text-gray-500 text-center mb-6">This will also update the application status to <strong>{pendingStatus === 'Granted' ? 'Success' : 'Refused'}</strong>.</p>
            <div className="flex gap-3">
              <button onClick={() => setPendingStatus(null)} className="flex-1 py-2.5 border border-grey-border rounded-lg text-sm font-medium text-navy hover:bg-grey-bg transition-colors">Cancel</button>
              <button onClick={() => applyVisaStatus(pendingStatus)} className={`flex-1 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors ${pendingStatus === 'Granted' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}>Confirm</button>
            </div>
          </div>
        </div>
      )}

      {showToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[70] bg-green-600 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 text-sm font-medium">
          <CheckCircle size={18} />{toastMessage}
        </div>
      )}
    </div>
  );
}

// ─── Main ClientProfile ───────────────────────────────────────────────────────

export default function ClientProfile({ application, partners, onClose, onUpdate }: ClientProfileProps) {
  const [tab, setTab] = useState<Tab>('details');
  const cas          = application.collegeApplications ?? [];
  const collegeCount = cas.length;
  const hasVisa      = application.visaApplication !== null;
  const hasAccepted  = cas.some((ca) => ca.status === 'Accepted');
  const initials     = application.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

  const tabs = [
    { key: 'details' as Tab,  label: 'Details',              icon: User },
    { key: 'college' as Tab,  label: 'College Applications', icon: Building2, count: collegeCount },
    { key: 'visa'    as Tab,  label: 'Visa',                 icon: FileText,  dot: hasVisa || hasAccepted },
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
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border flex-shrink-0 ${APP_STATUS_STYLES[application.status]}`}>
          {application.status}
        </span>
      </div>

      {/* Body: tab nav is static; only content area scrolls */}
      <div className="flex-1 overflow-hidden flex">
        {/* Tab nav card — does not scroll, position never shifts */}
        <div className="flex-shrink-0 pt-6 pl-6 pr-4">
          <div className="bg-white rounded-xl border border-grey-border p-2 space-y-0.5">
            {tabs.map((t) => {
              const Icon = t.icon;
              const active = tab === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left whitespace-nowrap ${active ? 'bg-navy/10 text-navy' : 'text-gray-500 hover:bg-grey-bg hover:text-navy'}`}
                >
                  <Icon size={16} className="flex-shrink-0" />
                  <span className="flex-1">{t.label}</span>
                  {'count' in t && (t as { count: number }).count > 0 && (
                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold flex-shrink-0 ${active ? 'bg-navy text-white' : 'bg-gray-100 text-gray-600'}`}>
                      {(t as { count: number }).count}
                    </span>
                  )}
                  {'dot' in t && (t as { dot: boolean }).dot && (
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${active ? 'bg-navy' : 'bg-gray-300'}`} />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content — scrolls independently; each tab unmounts/remounts so scroll resets cleanly */}
        <div className="flex-1 overflow-y-auto py-6 pr-6">
          <div className="space-y-5">
            {tab === 'details' && <DetailsTab application={application} onUpdate={onUpdate} />}
            {tab === 'college' && <CollegeTab application={application} partners={partners} onUpdate={onUpdate} onGoToVisa={() => setTab('visa')} />}
            {tab === 'visa'    && <VisaTab    application={application} onUpdate={onUpdate} />}
          </div>
        </div>
      </div>
    </div>
  );
}
