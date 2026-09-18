import {
  ArrowLeft, User, Phone, Mail, Globe, Target, CalendarDays,
  Cake, Users, Heart, GraduationCap, BookOpen, Briefcase, FileText,
  Building2, Calendar, CheckCircle, XCircle, UserX,
} from 'lucide-react';
import { ApplicationRecord } from '../types';
import {
  getClientStatusLabel, getStatusTone, STATUS_TONE_STYLES, OFFER_STATUS_STYLES, VISA_STATUS_STYLES,
  isVisaUnlocked, checklistCompleteCount,
} from '../clientPipeline';

interface ApplicationDetailDrawerProps {
  application: ApplicationRecord;
  onClose: () => void;
}

// Read-only view for Branch Manager / Super Admin / Finance — the stage-by-stage editing
// workflow (add institution, tick documents, move statuses) lives in ClientProfile and is
// the Application Officer's job; this is visibility only.
export default function ApplicationDetailDrawer({ application, onClose }: ApplicationDetailDrawerProps) {
  const statusLabel = getClientStatusLabel(application);
  const tone = getStatusTone(application);
  const unlocked = isVisaUnlocked(application);
  const visa = application.visaApplication;
  const initials = application.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

  const detailRows = [
    { icon: Phone, label: 'Phone', value: application.phone },
    { icon: Mail, label: 'Email', value: application.email },
    { icon: Globe, label: 'Country of Interest', value: application.country },
    { icon: Target, label: 'Purpose', value: application.purpose },
    ...(application.dob ? [{ icon: Cake, label: 'Date of Birth', value: application.dob }] : []),
    ...(application.gender ? [{ icon: Users, label: 'Gender', value: application.gender }] : []),
    ...(application.maritalStatus ? [{ icon: Heart, label: 'Marital Status', value: application.maritalStatus }] : []),
    ...(application.academicQualification ? [{ icon: GraduationCap, label: 'Academic Qualification', value: application.academicQualification }] : []),
    ...(application.ieltsPte ? [{ icon: BookOpen, label: 'IELTS / PTE', value: application.ieltsPte }] : []),
    ...(application.workExperience ? [{ icon: Briefcase, label: 'Work Experience', value: application.workExperience }] : []),
    { icon: CalendarDays, label: 'Consultation Date', value: application.consultationDate },
    { icon: User, label: 'Counselor', value: application.counselor },
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
        <h1 className="text-base font-semibold text-navy">Application Profile</h1>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-5 py-6 space-y-5">

          {/* Profile header + details */}
          <div className="bg-white rounded-2xl border border-grey-border p-6">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="w-16 h-16 rounded-full bg-navy/10 flex items-center justify-center flex-shrink-0">
                <span className="text-xl font-semibold text-navy">{initials}</span>
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-semibold text-navy truncate">{application.name}</h2>
                <div className="flex items-center gap-2 flex-wrap mt-1.5">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_TONE_STYLES[tone]}`}>
                    {statusLabel}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-grey-border">
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
                        <p className="text-sm font-medium text-navy truncate">{row.value}</p>
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
          </div>

          {application.withdrawn && (
            <div className="bg-gray-100 border border-grey-border rounded-2xl px-5 py-4 flex items-center gap-3">
              <UserX className="text-gray-500 flex-shrink-0" size={18} />
              <p className="text-sm text-gray-600">
                This client was marked as withdrawn{application.withdrawnDate ? ` on ${application.withdrawnDate}` : ''}.
              </p>
            </div>
          )}

          {/* Offer application history */}
          <div className="bg-white rounded-2xl border border-grey-border p-6">
            <h3 className="text-sm font-semibold text-navy mb-4">Offer Application History</h3>
            {application.offerApplications.length === 0 ? (
              <p className="text-sm text-gray-400">No offer applications yet.</p>
            ) : (
              <div className="space-y-3">
                {[...application.offerApplications].reverse().map((o) => (
                  <div key={o.id} className="flex items-center gap-3 border border-grey-border rounded-xl px-4 py-3">
                    <div className="w-9 h-9 rounded-lg bg-navy/10 flex items-center justify-center flex-shrink-0">
                      <Building2 className="text-navy" size={16} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-navy truncate">{o.institution}</p>
                      {o.appliedDate && <p className="text-xs text-gray-400">Applied {o.appliedDate}</p>}
                    </div>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 ${OFFER_STATUS_STYLES[o.status]}`}>{o.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Visa application */}
          {unlocked && (
            <div className="bg-white rounded-2xl border border-grey-border p-6">
              <h3 className="text-sm font-semibold text-navy mb-4">Visa Application</h3>
              {!visa ? (
                <p className="text-sm text-gray-400">Not started yet.</p>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${VISA_STATUS_STYLES[visa.status]}`}>{visa.status}</span>
                    <span className="text-xs text-gray-500">{checklistCompleteCount(visa.checklist)} of 4 documents complete</span>
                  </div>
                  {(visa.appliedDate || visa.outcomeDate) && (
                    <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                      {visa.appliedDate && <span className="flex items-center gap-1.5"><Calendar size={13} />Applied: {visa.appliedDate}</span>}
                      {visa.outcomeDate && (
                        <span className={`flex items-center gap-1.5 font-medium ${visa.status === 'Visa Approved' ? 'text-green-700' : 'text-red-700'}`}>
                          {visa.status === 'Visa Approved' ? <CheckCircle size={13} /> : <XCircle size={13} />}
                          Outcome: {visa.outcomeDate}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
