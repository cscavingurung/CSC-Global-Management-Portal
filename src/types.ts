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
  completedDate: string | null;
  outcome: ConsultationOutcome;
}

export type ApplicationStatus = 'Preparation' | 'Lodgement' | 'Success' | 'Refused';

export interface StatusHistoryEntry {
  status: ApplicationStatus;
  date: string;
}

export interface ApplicationRecord {
  id: string;
  name: string;
  phone: string;
  email: string;
  country: string;
  purpose: string;
  counselor: string;
  consultationDate: string;
  consultationNotes: string;
  status: ApplicationStatus;
  statusHistory: StatusHistoryEntry[];
  branch: string;
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
