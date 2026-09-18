import { useState } from 'react';
import { CheckCircle, AlertTriangle } from 'lucide-react';
import { ApplicationRecord, OfferApplication, OfferStatus, VisaApplication, VisaStageStatus } from '../types';
import { getActiveOfferApplication, isVisaUnlocked, isChecklistComplete, today } from '../clientPipeline';

interface StatusUpdatesKanbanProps {
  applications: ApplicationRecord[];
  onUpdateApplication: (id: string, updates: Partial<ApplicationRecord>) => void;
}

type BoardTab = 'offer' | 'visa';

const OFFER_COLUMNS: { status: OfferStatus; label: string; dotColor: string; headerColor: string }[] = [
  { status: 'Enrolled', label: 'Enrolled', dotColor: 'bg-gray-400', headerColor: 'text-gray-600' },
  { status: 'Applied to Institution', label: 'Applied to Institution', dotColor: 'bg-navy', headerColor: 'text-navy' },
  { status: 'Offer Received', label: 'Offer Received', dotColor: 'bg-green-500', headerColor: 'text-green-600' },
  { status: 'Rejected', label: 'Rejected', dotColor: 'bg-red-500', headerColor: 'text-red-600' },
];

const VISA_COLUMNS: { status: VisaStageStatus; label: string; dotColor: string; headerColor: string }[] = [
  { status: 'Preparing Documents', label: 'Preparing Documents', dotColor: 'bg-gray-400', headerColor: 'text-gray-600' },
  { status: 'Ready for Visa', label: 'Ready for Visa', dotColor: 'bg-navy', headerColor: 'text-navy' },
  { status: 'Visa Applied', label: 'Visa Applied', dotColor: 'bg-navy', headerColor: 'text-navy' },
  { status: 'Visa Approved', label: 'Visa Approved', dotColor: 'bg-green-500', headerColor: 'text-green-600' },
  { status: 'Visa Refused', label: 'Visa Refused', dotColor: 'bg-red-500', headerColor: 'text-red-600' },
];

const OFFER_TERMINAL: OfferStatus[] = ['Offer Received', 'Rejected'];
const VISA_TERMINAL: VisaStageStatus[] = ['Visa Approved', 'Visa Refused'];

interface OfferCardData { app: ApplicationRecord; offerApp: OfferApplication }

export default function StatusUpdatesKanban({ applications, onUpdateApplication }: StatusUpdatesKanbanProps) {
  const [tab, setTab] = useState<BoardTab>('offer');
  const [pendingOfferMove, setPendingOfferMove] = useState<{ card: OfferCardData; newStatus: OfferStatus } | null>(null);
  const [pendingVisaMove, setPendingVisaMove] = useState<{ app: ApplicationRecord; newStatus: VisaStageStatus } | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [dropdownOpenFor, setDropdownOpenFor] = useState<string | null>(null);

  const showToastMessage = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  // ─── Offer board ───────────────────────────────────────────────────────────

  const activeOfferCards: OfferCardData[] = applications
    .filter((a) => !a.withdrawn)
    .map((a) => {
      const offerApp = getActiveOfferApplication(a);
      return offerApp ? { app: a, offerApp } : null;
    })
    .filter((c): c is OfferCardData => c !== null);

  const applyOfferMove = (card: OfferCardData, newStatus: OfferStatus) => {
    const date = today();
    const updates: Partial<OfferApplication> = { status: newStatus, statusUpdatedAt: date };
    if (newStatus === 'Applied to Institution') updates.appliedDate = date;
    if (newStatus === 'Offer Received' || newStatus === 'Rejected') updates.outcomeDate = date;
    onUpdateApplication(card.app.id, {
      offerApplications: card.app.offerApplications.map((o) => (o.id === card.offerApp.id ? { ...o, ...updates } : o)),
    });
    showToastMessage(`${card.app.name} moved to ${newStatus}`);
  };

  const handleOfferMove = (card: OfferCardData, newStatus: OfferStatus) => {
    if (newStatus === card.offerApp.status) return;
    setDropdownOpenFor(null);
    if (OFFER_TERMINAL.includes(newStatus)) setPendingOfferMove({ card, newStatus });
    else applyOfferMove(card, newStatus);
  };

  // ─── Visa board ────────────────────────────────────────────────────────────

  const visaCards = applications.filter((a) => !a.withdrawn && isVisaUnlocked(a) && a.visaApplication !== null);

  const applyVisaMove = (app: ApplicationRecord, newStatus: VisaStageStatus) => {
    if (!app.visaApplication) return;
    const date = today();
    const updated: VisaApplication = { ...app.visaApplication, status: newStatus, statusUpdatedAt: date };
    if (newStatus === 'Visa Applied') updated.appliedDate = date;
    if (newStatus === 'Visa Approved' || newStatus === 'Visa Refused') updated.outcomeDate = date;
    onUpdateApplication(app.id, { visaApplication: updated });
    showToastMessage(`${app.name} moved to ${newStatus}`);
  };

  const handleVisaMove = (app: ApplicationRecord, newStatus: VisaStageStatus) => {
    if (!app.visaApplication || newStatus === app.visaApplication.status) return;
    if (newStatus === 'Ready for Visa' && !isChecklistComplete(app.visaApplication.checklist)) return;
    setDropdownOpenFor(null);
    if (VISA_TERMINAL.includes(newStatus)) setPendingVisaMove({ app, newStatus });
    else applyVisaMove(app, newStatus);
  };

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="inline-flex bg-grey-bg border border-grey-border rounded-lg p-1">
        {(['offer', 'visa'] as BoardTab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${tab === t ? 'bg-white text-navy shadow-sm' : 'text-gray-500 hover:text-navy'}`}
          >
            {t === 'offer' ? 'Offer Applications' : 'Visa Applications'}
          </button>
        ))}
      </div>

      {tab === 'offer' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {OFFER_COLUMNS.map((col) => {
            const colCards = activeOfferCards.filter((c) => c.offerApp.status === col.status);
            return (
              <div key={col.status} className="bg-grey-bg rounded-xl border border-grey-border flex flex-col min-h-[200px]">
                <div className="px-4 py-3 border-b border-grey-border flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${col.dotColor}`} />
                  <h3 className={`text-sm font-semibold ${col.headerColor}`}>{col.label}</h3>
                  <span className="ml-auto text-xs font-medium text-gray-400 bg-white px-2 py-0.5 rounded-full">{colCards.length}</span>
                </div>
                <div className="p-3 space-y-2.5 flex-1">
                  {colCards.map((card) => {
                    const cardKey = `${card.app.id}-${card.offerApp.id}`;
                    return (
                      <div key={cardKey} className="bg-white rounded-lg border border-grey-border p-3.5 group">
                        <div className="min-w-0 mb-2">
                          <p className="text-sm font-semibold text-navy truncate">{card.app.name}</p>
                          <p className="text-xs text-gray-400 truncate">{card.offerApp.institution}</p>
                        </div>
                        <p className="text-xs text-gray-500 mb-3">Counselor: {card.app.counselor}</p>
                        <div className="relative">
                          <button
                            onClick={() => setDropdownOpenFor(dropdownOpenFor === cardKey ? null : cardKey)}
                            className="w-full text-xs font-medium text-navy border border-grey-border rounded-md py-1.5 px-2.5 hover:bg-grey-bg transition-colors flex items-center justify-between"
                          >
                            <span>Move to...</span>
                            <span className="text-gray-400">{dropdownOpenFor === cardKey ? '▲' : '▼'}</span>
                          </button>
                          {dropdownOpenFor === cardKey && (
                            <>
                              <div className="fixed inset-0 z-10" onClick={() => setDropdownOpenFor(null)} />
                              <div className="absolute z-20 mt-1 w-full bg-white border border-grey-border rounded-lg shadow-lg overflow-hidden">
                                {OFFER_COLUMNS.map((target) => (
                                  <button
                                    key={target.status}
                                    onClick={() => handleOfferMove(card, target.status)}
                                    disabled={target.status === card.offerApp.status}
                                    className={`w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors text-left ${target.status === card.offerApp.status ? 'text-gray-300 cursor-not-allowed' : 'text-navy hover:bg-grey-bg'}`}
                                  >
                                    <span className={`w-2 h-2 rounded-full ${target.dotColor}`} />
                                    {target.label}
                                    {target.status === card.offerApp.status && <span className="ml-auto text-gray-300">(current)</span>}
                                  </button>
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {colCards.length === 0 && <div className="py-8 text-center text-xs text-gray-400">No clients</div>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === 'visa' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
          {VISA_COLUMNS.map((col) => {
            const colApps = visaCards.filter((a) => a.visaApplication?.status === col.status);
            return (
              <div key={col.status} className="bg-grey-bg rounded-xl border border-grey-border flex flex-col min-h-[200px]">
                <div className="px-4 py-3 border-b border-grey-border flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${col.dotColor}`} />
                  <h3 className={`text-sm font-semibold ${col.headerColor}`}>{col.label}</h3>
                  <span className="ml-auto text-xs font-medium text-gray-400 bg-white px-2 py-0.5 rounded-full">{colApps.length}</span>
                </div>
                <div className="p-3 space-y-2.5 flex-1">
                  {colApps.map((app) => {
                    const checklistDone = app.visaApplication ? isChecklistComplete(app.visaApplication.checklist) : false;
                    return (
                      <div key={app.id} className="bg-white rounded-lg border border-grey-border p-3.5 group">
                        <div className="min-w-0 mb-2">
                          <p className="text-sm font-semibold text-navy truncate">{app.name}</p>
                          <p className="text-xs text-gray-400 truncate">{app.purpose} — {app.country}</p>
                        </div>
                        <p className="text-xs text-gray-500 mb-3">Counselor: {app.counselor}</p>
                        <div className="relative">
                          <button
                            onClick={() => setDropdownOpenFor(dropdownOpenFor === app.id ? null : app.id)}
                            className="w-full text-xs font-medium text-navy border border-grey-border rounded-md py-1.5 px-2.5 hover:bg-grey-bg transition-colors flex items-center justify-between"
                          >
                            <span>Move to...</span>
                            <span className="text-gray-400">{dropdownOpenFor === app.id ? '▲' : '▼'}</span>
                          </button>
                          {dropdownOpenFor === app.id && (
                            <>
                              <div className="fixed inset-0 z-10" onClick={() => setDropdownOpenFor(null)} />
                              <div className="absolute z-20 mt-1 w-full bg-white border border-grey-border rounded-lg shadow-lg overflow-hidden">
                                {VISA_COLUMNS.map((target) => {
                                  const blocked = target.status === 'Ready for Visa' && !checklistDone;
                                  const disabled = target.status === app.visaApplication?.status || blocked;
                                  return (
                                    <button
                                      key={target.status}
                                      onClick={() => handleVisaMove(app, target.status)}
                                      disabled={disabled}
                                      title={blocked ? 'Complete all 4 checklist documents first' : undefined}
                                      className={`w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors text-left ${disabled ? 'text-gray-300 cursor-not-allowed' : 'text-navy hover:bg-grey-bg'}`}
                                    >
                                      <span className={`w-2 h-2 rounded-full ${target.dotColor}`} />
                                      {target.label}
                                      {target.status === app.visaApplication?.status && <span className="ml-auto text-gray-300">(current)</span>}
                                    </button>
                                  );
                                })}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {colApps.length === 0 && <div className="py-8 text-center text-xs text-gray-400">No clients</div>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Terminal status confirmation dialogs */}
      {pendingOfferMove && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-navy-dark/60" onClick={() => setPendingOfferMove(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 ${pendingOfferMove.newStatus === 'Offer Received' ? 'bg-green-50' : 'bg-red-50'}`}>
              <AlertTriangle className={pendingOfferMove.newStatus === 'Offer Received' ? 'text-green-600' : 'text-red-600'} size={26} />
            </div>
            <h3 className="text-base font-semibold text-navy text-center mb-2">
              Move {pendingOfferMove.card.app.name} to {pendingOfferMove.newStatus}?
            </h3>
            <p className="text-sm text-gray-500 text-center mb-6">This outcome stays in the client's offer history either way.</p>
            <div className="flex gap-3">
              <button onClick={() => setPendingOfferMove(null)} className="flex-1 py-2.5 border border-grey-border rounded-lg text-sm font-medium text-navy hover:bg-grey-bg transition-colors">Cancel</button>
              <button
                onClick={() => { applyOfferMove(pendingOfferMove.card, pendingOfferMove.newStatus); setPendingOfferMove(null); }}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors ${pendingOfferMove.newStatus === 'Offer Received' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {pendingVisaMove && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-navy-dark/60" onClick={() => setPendingVisaMove(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 ${pendingVisaMove.newStatus === 'Visa Approved' ? 'bg-green-50' : 'bg-red-50'}`}>
              <AlertTriangle className={pendingVisaMove.newStatus === 'Visa Approved' ? 'text-green-600' : 'text-red-600'} size={26} />
            </div>
            <h3 className="text-base font-semibold text-navy text-center mb-2">
              Move {pendingVisaMove.app.name} to {pendingVisaMove.newStatus}?
            </h3>
            <p className="text-sm text-gray-500 text-center mb-6">This is usually a final outcome and cannot be easily reversed.</p>
            <div className="flex gap-3">
              <button onClick={() => setPendingVisaMove(null)} className="flex-1 py-2.5 border border-grey-border rounded-lg text-sm font-medium text-navy hover:bg-grey-bg transition-colors">Cancel</button>
              <button
                onClick={() => { applyVisaMove(pendingVisaMove.app, pendingVisaMove.newStatus); setPendingVisaMove(null); }}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors ${pendingVisaMove.newStatus === 'Visa Approved' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
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
