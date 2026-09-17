import { supabase } from './supabaseClient';
import { IntakeStudent } from '../types';

interface StudentRow {
  id: string;
  name: string;
  phone: string;
  email: string;
  country: string;
  purpose: string;
  dob: string;
  gender: string;
  marital_status: string;
  academic_qualification: string;
  ielts_pte: string;
  work_experience: string;
  submitted_at: string;
  status: IntakeStudent['status'];
  assigned_counselor: string | null;
  branch: string;
}

function fromRow(row: StudentRow): IntakeStudent {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    email: row.email,
    country: row.country,
    purpose: row.purpose,
    dob: row.dob,
    gender: row.gender,
    maritalStatus: row.marital_status,
    academicQualification: row.academic_qualification,
    ieltsPte: row.ielts_pte,
    workExperience: row.work_experience,
    submittedAt: row.submitted_at,
    status: row.status,
    assignedCounselor: row.assigned_counselor,
    branch: row.branch,
  };
}

function toRow(student: IntakeStudent): StudentRow {
  return {
    id: student.id,
    name: student.name,
    phone: student.phone,
    email: student.email,
    country: student.country,
    purpose: student.purpose,
    dob: student.dob,
    gender: student.gender,
    marital_status: student.maritalStatus,
    academic_qualification: student.academicQualification,
    ielts_pte: student.ieltsPte,
    work_experience: student.workExperience,
    submitted_at: student.submittedAt,
    status: student.status,
    assigned_counselor: student.assignedCounselor,
    branch: student.branch,
  };
}

function toRowUpdates(updates: Partial<IntakeStudent>): Record<string, unknown> {
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
  if (updates.submittedAt !== undefined) row.submitted_at = updates.submittedAt;
  if (updates.status !== undefined) row.status = updates.status;
  if (updates.assignedCounselor !== undefined) row.assigned_counselor = updates.assignedCounselor;
  if (updates.branch !== undefined) row.branch = updates.branch;
  return row;
}

export async function fetchStudents(): Promise<IntakeStudent[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .order('submitted_at', { ascending: false });
  if (error) throw error;
  return (data as StudentRow[]).map(fromRow);
}

export async function insertStudent(student: IntakeStudent): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from('students').insert(toRow(student));
  if (error) throw error;
}

export async function updateStudent(id: string, updates: Partial<IntakeStudent>): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from('students').update(toRowUpdates(updates)).eq('id', id);
  if (error) throw error;
}
