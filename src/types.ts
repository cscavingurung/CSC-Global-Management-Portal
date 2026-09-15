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
  preferredDate: string;
  submittedAt: string;
  status: 'New' | 'Assigned';
  assignedCounselor: string | null;
  branch: string;
}

export interface Counselor {
  id: string;
  name: string;
  country: string;
  activeAssignments: number;
  capacity: number;
}

export type ConsultationStatus = 'Awaiting Consultation' | 'In Progress' | 'Consultation Complete';

export type ConsultationOutcome = 'Pending' | 'Proceeding' | 'Not Proceeding';

export interface CounselorStudent {
  id: string;
  name: string;
  phone: string;
  email: string;
  country: string;
  purpose: string;
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

export type StaffRole = 'Receptionist' | 'Counselor' | 'Application Officer' | 'Branch Manager';
export type StaffStatus = 'Active' | 'Inactive';

export interface StaffMember {
  id: string;
  name: string;
  email: string;
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
  staffCount: number;
  activeStudents: number;
  applicationsInProgress: number;
  visasGranted: number;
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
