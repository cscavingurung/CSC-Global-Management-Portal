import { useState, useEffect } from 'react';
import {
  Search, X, ArrowLeft, Plus, Check, CheckCircle, XCircle,
  FileText, Calendar, Building2, ChevronRight, AlertTriangle,
} from 'lucide-react';
import {
  ApplicationRecord, ApplicationStatus, StatusHistoryEntry,
  VisaApplication, VisaStatus, DocumentItem,
} from '../types';

interface VisaPageProps {
  applications: ApplicationRecord[];
  onUpdateApplication: (id: string, updates: Partial<ApplicationRecord>) => void;
  preselectedId?: string | null;
  onClearPreselect?: () => void;
}

const VISA_STATUS_STYLES: Record<VisaStatus, string> = {
  Preparing: 'bg-gray-100 text-gray-600',
  Lodged: 'bg-navy/10 text-navy',
  Granted: 'bg-green-100 text-green-700',
  Refused: 'bg-red-100 text-red-700',
};

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
    'Character References',
  ],
  Tourist: [
    'Passport',
    'Bank Statements',
    'Travel Itinerary',
    'Hotel Bookings',
    'Employment / Study Letter',
    'Passport Photographs',
    'Invitation Letter (if applicable)',
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
    'Passport',
    'Police Clearance Certificate',
    'Financial Evidence (Bank Statements)',
    'English Test Results (IELTS/PTE)',
  ];
  return names.map((name, i) => ({ id: `vdoc${Date.now()}${i}`, name, ready: false }));
}

// ─── Visa Detail View ─────────────────────────────────────────────────────────

interface VisaDetailViewProps {
  application: ApplicationRecord;
  onUpdate: (updates: Partial<ApplicationRecord>) => void;
  onBack: () => void;
}

function VisaDetailView({ application, onUpdate, onBack }: VisaDetailViewProps) {
  const [pendingStatus, setPendingStatus] = useState<VisaStatus | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [customDoc, setCustomDoc] = useState('');

  const visa = application.visaApplication;
  const acceptedCollegeApps = (application.collegeApplications ?? []).filter(
    (ca) => ca.status === 'Accepted'
  );

  const initials = application.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

  useEffect(() => {
    if (showToast) {
      const t = setTimeout(() => setShowToast(false), 3000);
      return () => clearTimeout(t);
    }
  }, [showToast]);

  const startVisaApplication = () => {
    const newVisa: VisaApplication = {
      status: 'Preparing',
      documents: getDefaultVisaDocs(application.purpose),
      notes: '',
    };
    onUpdate({ visaApplication: newVisa });
  };

  const toggleDoc = (docId: string) => {
    if (!visa) return;
    onUpdate({
      visaApplication: {
        ...visa,
        documents: visa.documents.map((d) => (d.id === docId ? { ...d, ready: !d.ready } : d)),
      },
    });
  };

  const addCustomDoc = () => {
    if (!visa || !customDoc.trim()) return;
    const trimmed = customDoc.trim();
    const newDoc: DocumentItem = { id: `vdoc${Date.now()}`, name: trimmed, ready: false };
    onUpdate({ visaApplication: { ...visa, documents: [...visa.documents, newDoc] } });
    setCustomDoc('');
  };

  const updateNotes = (notes: string) => {
    if (!visa) return;
    onUpdate({ visaApplication: { ...visa, notes } });
  };

  const applyStatusChange = (newStatus: VisaStatus) => {
    if (!visa) return;
    const today = new Date().toISOString().slice(0, 10);
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const historyDate = `${monthNames[now.getMonth()]} ${now.getDate()}`;

    const updatedVisa: VisaApplication = {
      ...visa,
      status: newStatus,
      lodgementDate: newStatus === 'Lodged' ? today : visa.lodgementDate,
      outcomeDate: (newStatus === 'Granted' || newStatus === 'Refused') ? today : visa.outcomeDate,
    };

    const appStatusMap: Partial<Record<VisaStatus, ApplicationStatus>> = {
      Lodged: 'Lodgement',
      Granted: 'Success',
      Refused: 'Refused',
    };
    const newAppStatus = appStatusMap[newStatus];
    const historyEntry: StatusHistoryEntry | null = newAppStatus
      ? { status: newAppStatus, date: historyDate }
      : null;

    const updates: Partial<ApplicationRecord> = { visaApplication: updatedVisa };
    if (newAppStatus) {
      updates.status = newAppStatus;
      updates.statusHistory = historyEntry
        ? [...application.statusHistory, historyEntry]
        : application.statusHistory;
    }

    onUpdate(updates);
    setToastMessage(`Visa ${newStatus === 'Lodged' ? 'lodged' : newStatus === 'Granted' ? 'granted' : 'marked as ' + newStatus}`);
    setShowToast(true);
    setPendingStatus(null);
  };

  const handleStatusClick = (newStatus: VisaStatus) => {
    if (!visa || newStatus === visa.status) return;
    if (newStatus === 'Granted' || newStatus === 'Refused') {
      setPendingStatus(newStatus);
    } else {
      applyStatusChange(newStatus);
    }
  };

  const readyCount = visa?.documents.filter((d) => d.ready).length ?? 0;
  const totalDocs = visa?.documents.length ?? 0;

  return (
    <div className="fixed inset-y-0 left-0 right-0 lg:left-64 z-50 bg-grey-bg flex flex-col">
      {/* Top bar */}
      <div className="flex-shrink-0 bg-white border-b border-grey-border px-5 py-4 flex items-center gap-3">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-navy hover:text-navy-light transition-colors"
        >
          <ArrowLeft size={18} />
          Back
        </button>
        <span className="text-gray-300">|</span>
        <h1 className="text-base font-semibold text-navy truncate">
          Visa Application — {application.name}
        </h1>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-5 py-6 space-y-5">

          {/* Student profile */}
          <div className="bg-white rounded-2xl border border-grey-border p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-navy/10 flex items-center justify-center flex-shrink-0">
                <span className="text-lg font-semibold text-navy">{initials}</span>
              </div>
              <div className="min-w-0">
                <h2 className="text-base font-semibold text-navy">{application.name}</h2>
                <p className="text-sm text-gray-500">{application.country} · {application.purpose}</p>
                <p className="text-xs text-gray-400">{application.email}</p>
              </div>
              {visa && (
                <div className="ml-auto flex-shrink-0">
                  <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${VISA_STATUS_STYLES[visa.status]}`}>
                    {visa.status}
                  </span>
                </div>
              )}
            </div>

            {/* Accepted college(s) */}
            {acceptedCollegeApps.length > 0 && (
              <div className="mt-5 pt-5 border-t border-grey-border space-y-2">
                <p className="text-xs font-medium text-gray-500 mb-2">Accepted Offer{acceptedCollegeApps.length > 1 ? 's' : ''}</p>
                {acceptedCollegeApps.map((ca) => (
                  <div key={ca.id} className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                      <Building2 className="text-green-600" size={14} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-navy truncate">{ca.institution}</p>
                      <p className="text-xs text-gray-500 truncate">{ca.course}</p>
                    </div>
                    <span className="ml-auto text-xs font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-full flex-shrink-0">
                      Accepted
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* No visa application started yet */}
          {!visa && (
            <div className="bg-white rounded-2xl border border-grey-border py-14 text-center">
              <div className="w-12 h-12 bg-grey-bg rounded-xl flex items-center justify-center mx-auto mb-3">
                <FileText className="text-gray-400" size={22} />
              </div>
              <p className="text-sm font-medium text-navy">Visa application not started</p>
              <p className="text-xs text-gray-400 mt-1 mb-5">
                Start the visa process to track documents and lodgement
              </p>
              <button
                onClick={startVisaApplication}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-navy text-white rounded-lg text-sm font-semibold hover:bg-navy-light transition-colors"
              >
                <Plus size={16} />
                Start Visa Application
              </button>
            </div>
          )}

          {/* Visa application tracking */}
          {visa && (
            <>
              {/* Status */}
              <div className="bg-white rounded-2xl border border-grey-border p-6">
                <h3 className="text-sm font-semibold text-navy mb-4">Visa Status</h3>

                {/* Status stepper */}
                <div className="flex items-center gap-2 mb-5">
                  {(['Preparing', 'Lodged'] as VisaStatus[]).map((s, i) => {
                    const steps: VisaStatus[] = ['Preparing', 'Lodged', 'Granted'];
                    const currentIdx = steps.indexOf(visa.status === 'Refused' ? 'Lodged' : visa.status);
                    const stepIdx = i;
                    const isDone = stepIdx < currentIdx || (stepIdx === currentIdx && visa.status !== 'Preparing');
                    const isCurrent = stepIdx === currentIdx && visa.status === s;
                    return (
                      <div key={s} className="flex items-center gap-2 flex-1">
                        <div className={`flex items-center gap-2 flex-1 ${i > 0 ? 'flex-col items-start' : ''}`}>
                          <div className="flex items-center gap-2 w-full">
                            {i > 0 && (
                              <div className={`h-px flex-1 ${isDone ? 'bg-navy' : 'bg-gray-200'}`} />
                            )}
                            <div
                              className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-colors ${
                                isDone
                                  ? 'bg-navy border-navy'
                                  : isCurrent
                                  ? 'border-navy bg-white'
                                  : 'border-gray-200 bg-white'
                              }`}
                            >
                              {isDone ? (
                                <Check className="text-white" size={13} />
                              ) : (
                                <span className={`text-xs font-bold ${isCurrent ? 'text-navy' : 'text-gray-300'}`}>
                                  {i + 1}
                                </span>
                              )}
                            </div>
                          </div>
                          <span className={`text-xs font-medium mt-1 ${isCurrent ? 'text-navy' : isDone ? 'text-navy' : 'text-gray-400'}`}>
                            {s}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  {/* Outcome */}
                  <div className="flex items-center gap-2 flex-1">
                    <div className="h-px flex-1 bg-gray-200" />
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-colors ${
                        visa.status === 'Granted'
                          ? 'bg-green-500 border-green-500'
                          : visa.status === 'Refused'
                          ? 'bg-red-500 border-red-500'
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      {visa.status === 'Granted' ? (
                        <Check className="text-white" size={13} />
                      ) : visa.status === 'Refused' ? (
                        <X className="text-white" size={13} />
                      ) : (
                        <span className="text-xs font-bold text-gray-300">3</span>
                      )}
                    </div>
                  </div>
                  <span className={`text-xs font-medium mt-1 ${
                    visa.status === 'Granted' ? 'text-green-600' :
                    visa.status === 'Refused' ? 'text-red-600' : 'text-gray-400'
                  }`}>
                    Outcome
                  </span>
                </div>

                {/* Key dates */}
                {(visa.lodgementDate || visa.outcomeDate) && (
                  <div className="flex flex-wrap gap-4 mb-5 pb-5 border-b border-grey-border text-xs text-gray-500">
                    {visa.lodgementDate && (
                      <span className="flex items-center gap-1.5">
                        <Calendar size={13} />
                        Lodged: <span className="font-medium text-navy">{visa.lodgementDate}</span>
                      </span>
                    )}
                    {visa.outcomeDate && (
                      <span className={`flex items-center gap-1.5 font-medium ${
                        visa.status === 'Granted' ? 'text-green-700' : 'text-red-700'
                      }`}>
                        <CheckCircle size={13} />
                        Outcome: {visa.outcomeDate}
                      </span>
                    )}
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex flex-wrap gap-2">
                  {visa.status === 'Preparing' && (
                    <button
                      onClick={() => handleStatusClick('Lodged')}
                      className="flex items-center gap-1.5 px-4 py-2 bg-navy text-white rounded-lg text-sm font-semibold hover:bg-navy-light transition-colors"
                    >
                      <FileText size={15} />
                      Mark as Lodged
                    </button>
                  )}
                  {visa.status === 'Lodged' && (
                    <>
                      <button
                        onClick={() => handleStatusClick('Granted')}
                        className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors"
                      >
                        <CheckCircle size={15} />
                        Mark as Granted
                      </button>
                      <button
                        onClick={() => handleStatusClick('Refused')}
                        className="flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors"
                      >
                        <XCircle size={15} />
                        Mark as Refused
                      </button>
                    </>
                  )}
                  {(visa.status === 'Granted' || visa.status === 'Refused') && (
                    <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold ${
                      visa.status === 'Granted' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                    }`}>
                      {visa.status === 'Granted' ? <CheckCircle size={15} /> : <XCircle size={15} />}
                      Visa {visa.status}
                    </span>
                  )}
                </div>
              </div>

              {/* Documents */}
              <div className="bg-white rounded-2xl border border-grey-border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-navy">Required Documents</h3>
                  <span className="text-xs text-gray-500">{readyCount}/{totalDocs} ready</span>
                </div>

                {totalDocs > 0 && (
                  <div className="mb-4">
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          readyCount === totalDocs ? 'bg-green-500' : 'bg-navy'
                        }`}
                        style={{ width: `${totalDocs > 0 ? (readyCount / totalDocs) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {visa.documents.map((doc) => (
                    <label key={doc.id} className="flex items-center gap-3 cursor-pointer group">
                      <div
                        onClick={() => toggleDoc(doc.id)}
                        className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${
                          doc.ready
                            ? 'bg-green-500 border-green-500'
                            : 'border-gray-300 group-hover:border-navy-light'
                        }`}
                      >
                        {doc.ready && <Check className="text-white" size={10} />}
                      </div>
                      <span className={`text-sm transition-colors ${doc.ready ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                        {doc.name}
                      </span>
                    </label>
                  ))}
                </div>

                {/* Add custom doc */}
                <div className="flex gap-2 mt-4 pt-4 border-t border-grey-border">
                  <input
                    type="text"
                    value={customDoc}
                    onChange={(e) => setCustomDoc(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addCustomDoc()}
                    placeholder="Add custom document..."
                    className="flex-1 border border-grey-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-navy-light focus:ring-1 focus:ring-navy-light"
                  />
                  <button
                    onClick={addCustomDoc}
                    className="px-3 py-2 bg-grey-bg border border-grey-border text-navy rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Notes */}
              <div className="bg-white rounded-2xl border border-grey-border p-6">
                <h3 className="text-sm font-semibold text-navy mb-3">Notes</h3>
                <textarea
                  value={visa.notes}
                  onChange={(e) => updateNotes(e.target.value)}
                  rows={3}
                  placeholder="Visa-related notes, special conditions, reminders..."
                  className="w-full border border-grey-border rounded-lg px-3 py-2.5 text-sm resize-none focus:outline-none focus:border-navy-light focus:ring-1 focus:ring-navy-light"
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Outcome confirmation dialog */}
      {pendingStatus && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-navy-dark/60" onClick={() => setPendingStatus(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 ${
              pendingStatus === 'Granted' ? 'bg-green-50' : 'bg-red-50'
            }`}>
              <AlertTriangle
                className={pendingStatus === 'Granted' ? 'text-green-600' : 'text-red-600'}
                size={26}
              />
            </div>
            <h3 className="text-base font-semibold text-navy text-center mb-2">
              Mark visa as {pendingStatus}?
            </h3>
            <p className="text-sm text-gray-500 text-center mb-6">
              This will also update the application status to{' '}
              <strong>{pendingStatus === 'Granted' ? 'Success' : 'Refused'}</strong>.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setPendingStatus(null)}
                className="flex-1 py-2.5 border border-grey-border rounded-lg text-sm font-medium text-navy hover:bg-grey-bg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => applyStatusChange(pendingStatus)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors ${
                  pendingStatus === 'Granted' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
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

// ─── Main Visa Page ───────────────────────────────────────────────────────────

export default function VisaPage({ applications, onUpdateApplication, preselectedId, onClearPreselect }: VisaPageProps) {
  const [search, setSearch] = useState('');
  const [selectedApp, setSelectedApp] = useState<ApplicationRecord | null>(null);

  // Show applications that have at least one accepted offer OR already have a visa application
  const visaApps = applications.filter(
    (a) =>
      (a.collegeApplications ?? []).some((ca) => ca.status === 'Accepted') ||
      a.visaApplication !== null
  );

  const filtered = visaApps.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase())
  );

  // Auto-open student when navigated from Offer page
  useEffect(() => {
    if (preselectedId) {
      const app = applications.find((a) => a.id === preselectedId);
      if (app) {
        setSelectedApp(app);
        onClearPreselect?.();
      }
    }
  }, [preselectedId, applications, onClearPreselect]);

  if (selectedApp) {
    return (
      <VisaDetailView
        application={selectedApp}
        onUpdate={(updates) => {
          onUpdateApplication(selectedApp.id, updates);
          setSelectedApp((prev) => (prev ? { ...prev, ...updates } : null));
        }}
        onBack={() => setSelectedApp(null)}
      />
    );
  }

  return (
    <div className="space-y-5">
      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email"
          className="w-full pl-10 pr-9 py-2.5 border border-grey-border rounded-lg text-sm bg-white focus:outline-none focus:border-navy-light focus:ring-1 focus:ring-navy-light transition-colors"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-navy"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden lg:block bg-white rounded-xl border border-grey-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-grey-border bg-grey-bg">
              <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Student</th>
              <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Purpose</th>
              <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Accepted Institution</th>
              <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Visa Status</th>
              <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Documents</th>
              <th className="text-right text-xs font-semibold text-gray-500 px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((a) => {
              const accepted = (a.collegeApplications ?? []).filter((ca) => ca.status === 'Accepted');
              const visa = a.visaApplication;
              const readyDocs = visa?.documents.filter((d) => d.ready).length ?? 0;
              const totalDocs = visa?.documents.length ?? 0;
              return (
                <tr
                  key={a.id}
                  onClick={() => setSelectedApp(a)}
                  className="border-b border-grey-border last:border-0 hover:bg-grey-bg/50 transition-colors cursor-pointer"
                >
                  <td className="px-5 py-3.5">
                    <p className="text-sm font-medium text-navy">{a.name}</p>
                    <p className="text-xs text-gray-400">{a.email}</p>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-600">{a.purpose}</td>
                  <td className="px-5 py-3.5">
                    {accepted.length > 0 ? (
                      <div>
                        <p className="text-sm text-navy font-medium truncate max-w-[180px]">{accepted[0].institution}</p>
                        {accepted.length > 1 && (
                          <p className="text-xs text-gray-400">+{accepted.length - 1} more</p>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    {visa ? (
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${VISA_STATUS_STYLES[visa.status]}`}>
                        {visa.status}
                      </span>
                    ) : (
                      <span className="text-xs text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full font-medium">
                        Not Started
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    {visa ? (
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${readyDocs === totalDocs && totalDocs > 0 ? 'bg-green-500' : 'bg-navy'}`}
                            style={{ width: `${totalDocs > 0 ? (readyDocs / totalDocs) * 100 : 0}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">{readyDocs}/{totalDocs}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <ChevronRight className="text-gray-300 inline" size={18} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && visaApps.length === 0 && (
          <div className="py-16 text-center">
            <div className="w-12 h-12 bg-grey-bg rounded-xl flex items-center justify-center mx-auto mb-3">
              <FileText className="text-gray-400" size={22} />
            </div>
            <p className="text-sm font-medium text-navy">No visa cases yet</p>
            <p className="text-xs text-gray-400 mt-1">
              Students appear here once a college offer is accepted on the Offer page
            </p>
          </div>
        )}
        {filtered.length === 0 && visaApps.length > 0 && (
          <div className="py-12 text-center text-sm text-gray-400">No results found.</div>
        )}
      </div>

      {/* Mobile cards */}
      <div className="lg:hidden space-y-3">
        {filtered.map((a) => {
          const accepted = (a.collegeApplications ?? []).filter((ca) => ca.status === 'Accepted');
          const visa = a.visaApplication;
          return (
            <button
              key={a.id}
              onClick={() => setSelectedApp(a)}
              className="w-full text-left bg-white rounded-xl border border-grey-border p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-navy">{a.name}</p>
                  <p className="text-xs text-gray-400">{a.email}</p>
                </div>
                {visa ? (
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 ml-2 ${VISA_STATUS_STYLES[visa.status]}`}>
                    {visa.status}
                  </span>
                ) : (
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 flex-shrink-0 ml-2">
                    Not Started
                  </span>
                )}
              </div>
              {accepted.length > 0 && (
                <p className="text-xs text-gray-600 truncate mb-1">
                  <Building2 className="inline mr-1 text-green-600" size={12} />
                  {accepted[0].institution}
                </p>
              )}
              <p className="text-xs text-gray-500">{a.purpose} · {a.country}</p>
            </button>
          );
        })}
        {filtered.length === 0 && visaApps.length === 0 && (
          <div className="py-12 text-center text-sm text-gray-400">
            No visa cases yet. Accept an offer on the Offer page first.
          </div>
        )}
      </div>
    </div>
  );
}
