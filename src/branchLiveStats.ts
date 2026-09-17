import { StaffMember, IntakeStudent, ApplicationRecord, CounselorStudent } from './types';
import { parseSubmittedAt } from './dateTime';

export interface BranchLiveStats {
  staffCount: number;
  activeStudents: number;
  applicationsInProgress: number;
  visasGranted: number;
  visasRefused: number;
}

// Computes a branch's numbers live from the real students/staff/applications data, matched
// by branch name, instead of relying on stored counts — always accurate, no sync required.
export function computeBranchLiveStats(
  branchName: string,
  staff: StaffMember[],
  students: IntakeStudent[],
  applications: ApplicationRecord[]
): BranchLiveStats {
  const branchApplications = applications.filter((a) => a.branch === branchName);
  return {
    staffCount: staff.filter((s) => s.branch === branchName).length,
    activeStudents: students.filter((s) => s.branch === branchName).length,
    applicationsInProgress: branchApplications.filter((a) => a.status === 'Preparation' || a.status === 'Lodgement').length,
    visasGranted: branchApplications.filter((a) => a.status === 'Success').length,
    visasRefused: branchApplications.filter((a) => a.status === 'Refused').length,
  };
}

export interface BranchOverviewStats {
  totalStudentsThisMonth: number;
  activeConsultations: number;
  applicationsInProgress: number;
  decidedGranted: number;
  decidedRefused: number;
}

// Live version of the Branch Manager Overview's four stat cards — replaces the seeded,
// never-updated `branch_stats` table. counselor_students rows carry no branch of their
// own, so "Active Consultations" is scoped by looking up the assigned counselor's branch
// via their staff record (matched by name).
export function computeBranchOverviewStats(
  branchName: string,
  students: IntakeStudent[],
  counselorStudents: CounselorStudent[],
  applications: ApplicationRecord[],
  staff: StaffMember[]
): BranchOverviewStats {
  const now = new Date();
  const totalStudentsThisMonth = students.filter((s) => {
    if (s.branch !== branchName) return false;
    const submitted = parseSubmittedAt(s.submittedAt);
    return !!submitted && submitted.getFullYear() === now.getFullYear() && submitted.getMonth() === now.getMonth();
  }).length;

  const counselorBranchByName = new Map(staff.filter((s) => s.role === 'Counselor').map((s) => [s.name, s.branch]));
  const activeConsultations = counselorStudents.filter(
    (cs) => cs.consultationStatus !== 'Consultation Complete' && counselorBranchByName.get(cs.assignedCounselor) === branchName
  ).length;

  const branchApplications = applications.filter((a) => a.branch === branchName);
  return {
    totalStudentsThisMonth,
    activeConsultations,
    applicationsInProgress: branchApplications.filter((a) => a.status === 'Preparation' || a.status === 'Lodgement').length,
    decidedGranted: branchApplications.filter((a) => a.status === 'Success').length,
    decidedRefused: branchApplications.filter((a) => a.status === 'Refused').length,
  };
}
