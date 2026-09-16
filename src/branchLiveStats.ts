import { StaffMember, IntakeStudent, ApplicationRecord } from './types';

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
