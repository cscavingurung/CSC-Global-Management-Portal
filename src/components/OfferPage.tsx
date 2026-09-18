import { useState } from 'react';
import {
  Search, X, Plus, ChevronRight, ChevronDown, CheckCircle, ArrowLeft,
  Trash2, Building2, Calendar, FileText, Check, XCircle,
} from 'lucide-react';
import { ApplicationRecord, CollegeApplication, CollegeAppStatus, DocumentItem, Partner } from '../types';

interface OfferPageProps {
  applications: ApplicationRecord[];
  partners: Partner[];
  onUpdateApplication: (id: string, updates: Partial<ApplicationRecord>) => void;
  onNavigateToVisa?: (applicationId: string) => void;
}

const COLLEGE_STATUS_STYLES: Record<CollegeAppStatus, string> = {
  'Preparing Documents': 'bg-gray-100 text-gray-600',
  'Offer Received': 'bg-sky-100 text-sky-700',
  'Accepted': 'bg-green-100 text-green-700',
  'Declined': 'bg-red-100 text-red-700',
};

const DEFAULT_DOCS = [
  'Passport Copy',
  'Academic Transcripts',
  'English Test Results (IELTS/PTE)',
  'Statement of Purpose',
  'Bank Statements',
  'Work Experience Letter',
];

// ─── Add College Application Modal ───────────────────────────────────────────

interface AddModalProps {
  partners: Partner[];
  onAdd: (ca: CollegeApplication) => void;
  onClose: () => void;
}

function AddCollegeAppModal({ partners, onAdd, onClose }: AddModalProps) {
  const [institution, setInstitution] = useState('');
  const [customInstitution, setCustomInstitution] = useState('');
  const [course, setCourse] = useState('');
  const [customCourse, setCustomCourse] = useState('');
  const [appliedDate, setAppliedDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');
  const [includedDocs, setIncludedDocs] = useState<string[]>([...DEFAULT_DOCS]);
  const [customDoc, setCustomDoc] = useState('');

  const selectedPartner = partners.find((p) => p.name === institution);
  const courseOptions = selectedPartner ? selectedPartner.courses.map((c) => c.name) : [];

  const institutionName = institution === '__custom__' ? customInstitution : institution;
  const courseName = courseOptions.length === 0 || course === '__custom__' ? customCourse : course;

  const toggleDoc = (doc: string) => {
    setIncludedDocs((prev) =>
      prev.includes(doc) ? prev.filter((d) => d !== doc) : [...prev, doc]
    );
  };

  const addCustomDoc = () => {
    const trimmed = customDoc.trim();
    if (trimmed && !includedDocs.includes(trimmed)) {
      setIncludedDocs((prev) => [...prev, trimmed]);
      setCustomDoc('');
    }
  };

  const handleSubmit = () => {
    if (!institutionName.trim() || !courseName.trim()) return;
    const newCA: CollegeApplication = {
      id: `ca${Date.now()}`,
      institution: institutionName.trim(),
      course: courseName.trim(),
      appliedDate,
      status: 'Preparing Documents',
      documents: includedDocs.map((name, i): DocumentItem => ({
        id: `doc${Date.now()}${i}`,
        name,
        ready: false,
      })),
      notes,
    };
    onAdd(newCA);
  };

  const canSubmit = institutionName.trim() && courseName.trim();
  const allDocOptions = [...new Set([...DEFAULT_DOCS, ...includedDocs])];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-navy-dark/60" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-grey-border flex-shrink-0">
          <h3 className="text-base font-semibold text-navy">Add College Application</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-navy transition-colors">
            <X size={20} />
          </button>
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
                {partners.map((p) => (
                  <option key={p.id} value={p.name}>{p.name} ({p.type})</option>
                ))}
                <option value="__custom__">Other (type manually)</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
            </div>
            {institution === '__custom__' && (
              <input
                type="text"
                value={customInstitution}
                onChange={(e) => setCustomInstitution(e.target.value)}
                placeholder="Enter institution name"
                className="mt-2 w-full border border-grey-border rounded-lg px-3 py-2.5 text-sm text-navy focus:outline-none focus:border-navy-light focus:ring-1 focus:ring-navy-light"
              />
            )}
          </div>

          {/* Course */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Course</label>
            {courseOptions.length > 0 ? (
              <>
                <div className="relative">
                  <select
                    value={course}
                    onChange={(e) => { setCourse(e.target.value); setCustomCourse(''); }}
                    className="w-full appearance-none border border-grey-border rounded-lg px-3 py-2.5 text-sm text-navy bg-white focus:outline-none focus:border-navy-light focus:ring-1 focus:ring-navy-light pr-9"
                  >
                    <option value="">Select course...</option>
                    {courseOptions.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                    <option value="__custom__">Other (type manually)</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                </div>
                {course === '__custom__' && (
                  <input
                    type="text"
                    value={customCourse}
                    onChange={(e) => setCustomCourse(e.target.value)}
                    placeholder="Enter course name"
                    className="mt-2 w-full border border-grey-border rounded-lg px-3 py-2.5 text-sm text-navy focus:outline-none focus:border-navy-light focus:ring-1 focus:ring-navy-light"
                  />
                )}
              </>
            ) : (
              <input
                type="text"
                value={customCourse}
                onChange={(e) => setCustomCourse(e.target.value)}
                placeholder="Enter course name"
                className="w-full border border-grey-border rounded-lg px-3 py-2.5 text-sm text-navy focus:outline-none focus:border-navy-light focus:ring-1 focus:ring-navy-light"
              />
            )}
          </div>

          {/* Applied Date */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Application Date</label>
            <input
              type="date"
              value={appliedDate}
              onChange={(e) => setAppliedDate(e.target.value)}
              className="w-full border border-grey-border rounded-lg px-3 py-2.5 text-sm text-navy focus:outline-none focus:border-navy-light focus:ring-1 focus:ring-navy-light"
            />
          </div>

          {/* Required Documents */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-2">Required Documents</label>
            <div className="space-y-2.5">
              {allDocOptions.map((doc) => (
                <label key={doc} className="flex items-center gap-2.5 cursor-pointer group">
                  <div
                    onClick={() => toggleDoc(doc)}
                    className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${
                      includedDocs.includes(doc) ? 'bg-navy border-navy' : 'border-gray-300 group-hover:border-navy-light'
                    }`}
                  >
                    {includedDocs.includes(doc) && <Check className="text-white" size={10} />}
                  </div>
                  <span className="text-sm text-gray-700">{doc}</span>
                </label>
              ))}
            </div>
            <div className="flex gap-2 mt-3">
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
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Special requirements or notes..."
              className="w-full border border-grey-border rounded-lg px-3 py-2.5 text-sm resize-none focus:outline-none focus:border-navy-light focus:ring-1 focus:ring-navy-light"
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-grey-border flex gap-3 flex-shrink-0">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-grey-border rounded-lg text-sm font-medium text-navy hover:bg-grey-bg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="flex-1 py-2.5 bg-navy text-white rounded-lg text-sm font-semibold hover:bg-navy-light transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Add Application
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── College Application Card ─────────────────────────────────────────────────

interface CollegeAppCardProps {
  ca: CollegeApplication;
  onUpdate: (updates: Partial<CollegeApplication>) => void;
  onDelete: () => void;
}

function CollegeAppCard({ ca, onUpdate, onDelete }: CollegeAppCardProps) {
  const [expanded, setExpanded] = useState(true);

  const toggleDoc = (docId: string) => {
    onUpdate({
      documents: ca.documents.map((d) => (d.id === docId ? { ...d, ready: !d.ready } : d)),
    });
  };

  const readyCount = ca.documents.filter((d) => d.ready).length;
  const totalDocs = ca.documents.length;

  return (
    <div className="bg-white rounded-2xl border border-grey-border overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-navy/10 flex items-center justify-center flex-shrink-0">
          <Building2 className="text-navy" size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-navy truncate">{ca.institution}</p>
          <p className="text-xs text-gray-500 truncate">{ca.course}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${COLLEGE_STATUS_STYLES[ca.status]}`}>
            {ca.status}
          </span>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-gray-400 hover:text-navy transition-colors p-1"
          >
            <ChevronDown className={`transition-transform ${expanded ? 'rotate-180' : ''}`} size={16} />
          </button>
        </div>
      </div>

      {/* Body */}
      {expanded && (
        <div className="border-t border-grey-border px-5 py-4 space-y-4">
          {/* Meta */}
          <div className="flex flex-wrap gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1.5">
              <Calendar size={13} />
              Applied: {ca.appliedDate}
            </span>
            {ca.offerDate && (
              <span className="flex items-center gap-1.5 text-sky-600 font-medium">
                <CheckCircle size={13} />
                Offer received: {ca.offerDate}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <FileText size={13} />
              {readyCount}/{totalDocs} docs ready
            </span>
          </div>

          {/* Documents */}
          {totalDocs > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2.5">Required Documents</p>
              <div className="space-y-2.5">
                {ca.documents.map((doc) => (
                  <label key={doc.id} className="flex items-center gap-2.5 cursor-pointer group">
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
              {totalDocs > 0 && (
                <div className="mt-3">
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        readyCount === totalDocs ? 'bg-green-500' : 'bg-navy'
                      }`}
                      style={{ width: `${(readyCount / totalDocs) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          {ca.notes && (
            <div className="bg-grey-bg rounded-lg px-3.5 py-2.5">
              <p className="text-xs text-gray-500">{ca.notes}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 pt-1">
            {ca.status === 'Preparing Documents' && (
              <button
                onClick={() =>
                  onUpdate({ status: 'Offer Received', offerDate: new Date().toISOString().slice(0, 10) })
                }
                className="flex items-center gap-1.5 px-3.5 py-2 bg-sky-600 text-white rounded-lg text-xs font-semibold hover:bg-sky-700 transition-colors"
              >
                <CheckCircle size={14} />
                Mark Offer Received
              </button>
            )}
            {ca.status === 'Offer Received' && (
              <>
                <button
                  onClick={() => onUpdate({ status: 'Accepted' })}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700 transition-colors"
                >
                  <CheckCircle size={14} />
                  Accept Offer
                </button>
                <button
                  onClick={() => onUpdate({ status: 'Declined' })}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 transition-colors"
                >
                  <XCircle size={14} />
                  Decline
                </button>
              </>
            )}
            {(ca.status === 'Accepted' || ca.status === 'Declined') && (
              <span
                className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg ${
                  ca.status === 'Accepted' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}
              >
                {ca.status === 'Accepted' ? <CheckCircle size={13} /> : <XCircle size={13} />}
                Offer {ca.status}
              </span>
            )}
            <button
              onClick={onDelete}
              title="Remove"
              className="ml-auto p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Offer Detail View ────────────────────────────────────────────────────────

interface OfferDetailViewProps {
  application: ApplicationRecord;
  partners: Partner[];
  onUpdate: (updates: Partial<ApplicationRecord>) => void;
  onBack: () => void;
  onNavigateToVisa?: () => void;
}

function OfferDetailView({ application, partners, onUpdate, onBack, onNavigateToVisa }: OfferDetailViewProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const collegeApps = application.collegeApplications ?? [];

  const updateCollegeApp = (caId: string, updates: Partial<CollegeApplication>) => {
    onUpdate({
      collegeApplications: collegeApps.map((ca) => (ca.id === caId ? { ...ca, ...updates } : ca)),
    });
  };

  const deleteCollegeApp = (caId: string) => {
    onUpdate({ collegeApplications: collegeApps.filter((ca) => ca.id !== caId) });
  };

  const addCollegeApp = (newCA: CollegeApplication) => {
    onUpdate({ collegeApplications: [...collegeApps, newCA] });
    setShowAddModal(false);
  };

  const offersReceived = collegeApps.filter((ca) => ca.status === 'Offer Received').length;
  const accepted = collegeApps.filter((ca) => ca.status === 'Accepted').length;
  const initials = application.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="fixed inset-y-0 left-0 right-0 lg:left-64 z-50 bg-grey-bg flex flex-col">
      {/* Top bar */}
      <div className="flex-shrink-0 bg-white border-b border-grey-border px-5 py-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-navy hover:text-navy-light transition-colors flex-shrink-0"
          >
            <ArrowLeft size={18} />
            Back
          </button>
          <span className="text-gray-300">|</span>
          <h1 className="text-base font-semibold text-navy truncate">
            Offer Management — {application.name}
          </h1>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-navy text-white rounded-lg text-sm font-semibold hover:bg-navy-light transition-colors flex-shrink-0"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Add Application</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-5 py-6 space-y-5">

          {/* Student summary */}
          <div className="bg-white rounded-2xl border border-grey-border p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-navy/10 flex items-center justify-center flex-shrink-0">
                <span className="text-lg font-semibold text-navy">{initials}</span>
              </div>
              <div className="min-w-0">
                <h2 className="text-base font-semibold text-navy">{application.name}</h2>
                <p className="text-sm text-gray-500 truncate">
                  {application.country} · {application.purpose} · {application.counselor}
                </p>
                <p className="text-xs text-gray-400">{application.email}</p>
              </div>
            </div>
            <div className="mt-5 pt-5 border-t border-grey-border grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-navy">{collegeApps.length}</p>
                <p className="text-xs text-gray-500 mt-0.5">Applications</p>
              </div>
              <div className="border-x border-grey-border">
                <p className="text-2xl font-bold text-sky-600">{offersReceived}</p>
                <p className="text-xs text-gray-500 mt-0.5">Offers Received</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{accepted}</p>
                <p className="text-xs text-gray-500 mt-0.5">Accepted</p>
              </div>
            </div>
          </div>

          {/* Proceed to Visa banner */}
          {accepted > 0 && onNavigateToVisa && (
            <div className="bg-green-50 border border-green-200 rounded-2xl px-5 py-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-green-800">
                  {accepted} offer{accepted > 1 ? 's' : ''} accepted
                </p>
                <p className="text-xs text-green-600 mt-0.5">
                  Ready to begin the visa application process
                </p>
              </div>
              <button
                onClick={onNavigateToVisa}
                className="flex items-center gap-1.5 px-4 py-2 bg-green-700 text-white rounded-lg text-sm font-semibold hover:bg-green-800 transition-colors flex-shrink-0"
              >
                Proceed to Visa
                <ChevronRight size={15} />
              </button>
            </div>
          )}

          {/* College applications */}
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-navy">
              College Applications ({collegeApps.length})
            </h3>
          </div>

          {collegeApps.length === 0 ? (
            <div className="bg-white rounded-2xl border border-grey-border py-16 text-center">
              <div className="w-12 h-12 bg-grey-bg rounded-xl flex items-center justify-center mx-auto mb-3">
                <Building2 className="text-gray-400" size={22} />
              </div>
              <p className="text-sm font-medium text-navy">No applications yet</p>
              <p className="text-xs text-gray-400 mt-1 mb-4">
                Add a college or university application to get started
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-navy text-white rounded-lg text-sm font-semibold hover:bg-navy-light transition-colors"
              >
                <Plus size={16} />
                Add Application
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {collegeApps.map((ca) => (
                <CollegeAppCard
                  key={ca.id}
                  ca={ca}
                  onUpdate={(updates) => updateCollegeApp(ca.id, updates)}
                  onDelete={() => deleteCollegeApp(ca.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {showAddModal && (
        <AddCollegeAppModal
          partners={partners}
          onAdd={addCollegeApp}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
}

// ─── Main Offer Page ──────────────────────────────────────────────────────────

export default function OfferPage({ applications, partners, onUpdateApplication, onNavigateToVisa }: OfferPageProps) {
  const [search, setSearch] = useState('');
  const [selectedApp, setSelectedApp] = useState<ApplicationRecord | null>(null);

  const filtered = applications.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase())
  );

  if (selectedApp) {
    return (
      <OfferDetailView
        application={selectedApp}
        partners={partners}
        onUpdate={(updates) => {
          onUpdateApplication(selectedApp.id, updates);
          setSelectedApp((prev) => (prev ? { ...prev, ...updates } : null));
        }}
        onBack={() => setSelectedApp(null)}
        onNavigateToVisa={onNavigateToVisa ? () => onNavigateToVisa(selectedApp.id) : undefined}
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
              <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Country</th>
              <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Purpose</th>
              <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Counselor</th>
              <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Applied To</th>
              <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Offers</th>
              <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Accepted</th>
              <th className="text-right text-xs font-semibold text-gray-500 px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((a) => {
              const cas = a.collegeApplications ?? [];
              const offers = cas.filter((c) => c.status === 'Offer Received').length;
              const accepted = cas.filter((c) => c.status === 'Accepted').length;
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
                  <td className="px-5 py-3.5 text-sm text-gray-600">{a.country}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-600">{a.purpose}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-600">{a.counselor}</td>
                  <td className="px-5 py-3.5">
                    {cas.length > 0 ? (
                      <span className="text-sm font-medium text-navy">{cas.length}</span>
                    ) : (
                      <span className="text-xs text-gray-400">None yet</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    {offers > 0 ? (
                      <span className="inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full bg-sky-100 text-sky-700">
                        {offers} offer{offers > 1 ? 's' : ''}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    {accepted > 0 ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                        <CheckCircle size={11} />
                        {accepted}
                      </span>
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
        {filtered.length === 0 && (
          <div className="py-12 text-center text-sm text-gray-400">No applications found.</div>
        )}
      </div>

      {/* Mobile cards */}
      <div className="lg:hidden space-y-3">
        {filtered.map((a) => {
          const cas = a.collegeApplications ?? [];
          const offers = cas.filter((c) => c.status === 'Offer Received').length;
          const accepted = cas.filter((c) => c.status === 'Accepted').length;
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
                <ChevronRight className="text-gray-300 flex-shrink-0 mt-0.5" size={18} />
              </div>
              <p className="text-xs text-gray-500 mb-2">
                {a.country} · {a.purpose} · {a.counselor}
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-gray-500">{cas.length} applied</span>
                {offers > 0 && (
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-sky-100 text-sky-700">
                    {offers} offer{offers > 1 ? 's' : ''}
                  </span>
                )}
                {accepted > 0 && (
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                    {accepted} accepted
                  </span>
                )}
              </div>
            </button>
          );
        })}
        {filtered.length === 0 && (
          <div className="py-12 text-center text-sm text-gray-400">No applications found.</div>
        )}
      </div>
    </div>
  );
}
