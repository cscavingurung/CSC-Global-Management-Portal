import { supabase } from './supabaseClient';
import { ApplicationRecord, CollegeApplication, VisaApplication } from '../types';

interface ApplicationRow {
  id: string;
  name: string;
  phone: string;
  email: string;
  country: string;
  purpose: string;
  dob: string | null;
  gender: string | null;
  marital_status: string | null;
  academic_qualification: string | null;
  ielts_pte: string | null;
  work_experience: string | null;
  counselor: string;
  consultation_date: string;
  consultation_notes: string;
  status: ApplicationRecord['status'];
  status_history: ApplicationRecord['statusHistory'];
  branch: string;
  college_applications: CollegeApplication[] | null;
  visa_application: VisaApplication | null;
}

function fromRow(row: ApplicationRow): ApplicationRecord {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    email: row.email,
    country: row.country,
    purpose: row.purpose,
    dob: row.dob ?? undefined,
    gender: row.gender ?? undefined,
    maritalStatus: row.marital_status ?? undefined,
    academicQualification: row.academic_qualification ?? undefined,
    ieltsPte: row.ielts_pte ?? undefined,
    workExperience: row.work_experience ?? undefined,
    counselor: row.counselor,
    consultationDate: row.consultation_date,
    consultationNotes: row.consultation_notes,
    status: row.status,
    statusHistory: row.status_history,
    branch: row.branch,
    collegeApplications: row.college_applications ?? [],
    visaApplication: row.visa_application ?? null,
  };
}

function toRow(a: ApplicationRecord): ApplicationRow {
  return {
    id: a.id,
    name: a.name,
    phone: a.phone,
    email: a.email,
    country: a.country,
    purpose: a.purpose,
    dob: a.dob ?? null,
    gender: a.gender ?? null,
    marital_status: a.maritalStatus ?? null,
    academic_qualification: a.academicQualification ?? null,
    ielts_pte: a.ieltsPte ?? null,
    work_experience: a.workExperience ?? null,
    counselor: a.counselor,
    consultation_date: a.consultationDate,
    consultation_notes: a.consultationNotes,
    status: a.status,
    status_history: a.statusHistory,
    branch: a.branch,
    college_applications: a.collegeApplications,
    visa_application: a.visaApplication,
  };
}

function toRowUpdates(updates: Partial<ApplicationRecord>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (updates.name !== undefined) row.name = updates.name;
  if (updates.phone !== undefined) row.phone = updates.phone;
  if (updates.email !== undefined) row.email = updates.email;
  if (updates.country !== undefined) row.country = updates.country;
  if (updates.purpose !== undefined) row.purpose = updates.purpose;
  if (updates.dob !== undefined) row.dob = updates.dob;
  if (updates.gender !== undefined) row.gender = updates.gender;
  if (updates.maritalStatus !== undefined) row.marital_status = updates.maritalStatus;
  if (updates.academicQualification !== undefined) row.academic_qualification = updates.academicQualification;
  if (updates.ieltsPte !== undefined) row.ielts_pte = updates.ieltsPte;
  if (updates.workExperience !== undefined) row.work_experience = updates.workExperience;
  if (updates.counselor !== undefined) row.counselor = updates.counselor;
  if (updates.consultationDate !== undefined) row.consultation_date = updates.consultationDate;
  if (updates.consultationNotes !== undefined) row.consultation_notes = updates.consultationNotes;
  if (updates.status !== undefined) row.status = updates.status;
  if (updates.statusHistory !== undefined) row.status_history = updates.statusHistory;
  if (updates.branch !== undefined) row.branch = updates.branch;
  if (updates.collegeApplications !== undefined) row.college_applications = updates.collegeApplications;
  if (updates.visaApplication !== undefined) row.visa_application = updates.visaApplication;
  return row;
}

export async function fetchApplications(): Promise<ApplicationRecord[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .order('consultation_date', { ascending: false });
  if (error) throw error;
  return (data as ApplicationRow[]).map(fromRow);
}

export async function insertApplication(application: ApplicationRecord): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from('applications').insert(toRow(application));
  if (error) throw error;
}

export async function updateApplication(id: string, updates: Partial<ApplicationRecord>): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from('applications').update(toRowUpdates(updates)).eq('id', id);
  if (error) throw error;
}
