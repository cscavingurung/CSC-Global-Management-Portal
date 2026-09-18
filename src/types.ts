export type Role =
  | 'super_admin'
  | 'marketing'
  | 'finance'
  | 'branch_manager'
  | 'receptionist'
  | 'counselor'
  | 'application_officer';

export interface MockUser {
  name: string;
  role: Role;
  branch: string;
  email: string;
}

export interface NavItem {
  key: string;
  label: string;
  icon: string;
  viewOnly?: boolean;
}

export type NavConfig = Record<Role, NavItem[]>;

export interface IntakeStudent {
  id: string;
  name: string;
  phone: string;
  email: string;
  country: string;
  purpose: string;
  dob: string;
  gender: string;
  maritalStatus: string;
  academicQualification: string;
  ieltsPte: string;
  workExperience: string;
  submittedAt: string;
  status: 'New' | 'Assigned';
  assignedCounselor: string | null;
  branch: string;
}

export type CounselorAvailability = 'Available' | 'In Session' | 'Away';

export interface Counselor {
  id: string;
  name: string;
  country: string;
  activeAssignments: number;
  availability: CounselorAvailability;
}

export type ConsultationStatus = 'Awaiting Consultation' | 'In Progress' | 'Follow Up' | 'Consultation Complete';

export type ConsultationOutcome = 'Pending' | 'Proceeding' | 'Not Proceeding';

export interface CounselorStudent {
  id: string;
  name: string;
  phone: string;
  email: string;
  country: string;
  purpose: string;
  dob: string;
  gender: string;
  maritalStatus: string;
  academicQualification: string;
  ieltsPte: string;
  workExperience: string;
  submittedAt: string;
  assignedDate: string;
  assignedCounselor: string;
  consultationStatus: ConsultationStatus;
  consultationNotes: string;
  followUpDate: string | null;
  completedDate: string | null;
  outcome: ConsultationOutcome;
}

// Stage 1 — one attempt at a single institution. A client can have several of these (one
// per institution); a Rejected attempt stays in the array as history rather than being
// removed, and the officer can add a new attempt (Re-apply) to try a different institution.
// Reaching 'Fee Paid' closes this attempt out and unlocks the visa stage.
export type OfferStatus = 'Enrolled' | 'Applied to Institution' | 'Offer Received' | 'Rejected' | 'Fee Paid';

export interface OfferApplication {
  id: string;
  institution: string;
  status: OfferStatus;
  /** Set when status moves to 'Applied to Institution'. */
  appliedDate?: string;
  /** Set when status reaches 'Offer Received' or 'Rejected'. */
  outcomeDate?: string;
  /** Set when status reaches 'Fee Paid'. */
  feePaidDate?: string;
  /** Date the current status was entered — powers "days in current status" staleness checks. */
  statusUpdatedAt: string;
  notes?: string;
}

// Stage 2 — unlocked once an OfferApplication reaches 'Fee Paid'. Fixed 4-item checklist
// only (no file uploads). The checklist must be complete before advancing past
// 'Preparing Documents'.
export interface VisaChecklist {
  noc: boolean;
  medical: boolean;
  financial: boolean;
  policeReport: boolean;
}

export type VisaStageStatus = 'Preparing Documents' | 'File Ready for Visa' | 'Visa Applied' | 'Visa Approved' | 'Visa Refused';

export interface VisaApplication {
  status: VisaStageStatus;
  checklist: VisaChecklist;
  /** Set when status moves to 'Visa Applied'. */
  appliedDate?: string;
  /** Set when status reaches 'Visa Approved' or 'Visa Refused'. */
  outcomeDate?: string;
  /** Date the current status was entered — powers "days in current status" staleness checks. */
  statusUpdatedAt: string;
  notes: string;
  /** Set via the "Request Refund" action after a Visa Refused outcome. */
  refundRequested?: boolean;
  refundRequestedDate?: string;
}

// Internal staff communication log entry on a client's profile — visible to any staff role,
// editable by everyone except the front desk (view-only).
export interface ClientNote {
  id: string;
  text: string;
  authorName: string;
  authorRole: Role;
  createdAt: string;
}

export interface ApplicationRecord {
  id: string;
  name: string;
  phone: string;
  email: string;
  country: string;
  purpose: string;
  dob?: string;
  gender?: string;
  maritalStatus?: string;
  academicQualification?: string;
  ieltsPte?: string;
  workExperience?: string;
  counselor: string;
  consultationDate: string;
  consultationNotes: string;
  branch: string;
  offerApplications: OfferApplication[];
  visaApplication: VisaApplication | null;
  /** The only way a client exits the pipeline — never automatic on a rejected/refused outcome. */
  withdrawn: boolean;
  withdrawnDate?: string;
  notes: ClientNote[];
}

export type StaffRole =
  | 'Receptionist'
  | 'Counselor'
  | 'VA Officer'
  | 'Branch Manager'
  | 'Super Admin'
  | 'Marketing'
  | 'Finance';
export type StaffStatus = 'Active' | 'Inactive';

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  password: string;
  role: StaffRole;
  status: StaffStatus;
  branch: string;
}

export interface ActivityEntry {
  id: string;
  message: string;
  timestamp: string;
  type: 'assignment' | 'status' | 'intake' | 'consultation';
}

export interface Branch {
  id: string;
  name: string;
  location: string;
  manager: string | null;
}

export type PartnerType = 'College' | 'University';

export interface PartnerCourse {
  name: string;
  price: number;
}

export interface Partner {
  id: string;
  name: string;
  type: PartnerType;
  commissionRate: number;
  courses: PartnerCourse[];
}

export type CommissionStatus = 'Pending' | 'Paid';

export interface CommissionRecord {
  id: string;
  studentName: string;
  branch: string;
  consultant: string;
  partner: string;
  fullFee: number;
  commissionRate: number;
  commissionStatus: CommissionStatus;
}

export type NotificationTrigger = 'new-intake' | 'assigned-to-counselor' | 'consultation-ready';

export interface AppNotification {
  id: string;
  trigger: NotificationTrigger;
  studentName: string;
  // Full message is `${messageBefore}${studentName}${messageAfter}`, split so the
  // student's name alone can be rendered in bold.
  messageBefore: string;
  messageAfter: string;
  createdAt: Date;
  read: boolean;
  navigateTo: string;
  /** Which role this notification is addressed to. */
  role: Role;
  /** Set for role+branch-scoped notifications (receptionist, application officer). */
  branch?: string;
  /** Set for notifications addressed to one specific person (counselor). */
  recipientName?: string;
}
