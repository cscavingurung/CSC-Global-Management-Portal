import { supabase } from './supabaseClient';
import { CounselorStudent } from '../types';

interface CounselorStudentRow {
  id: string;
  name: string;
  phone: string;
  email: string;
  country: string;
  purpose: string;
  submitted_at: string;
  assigned_date: string;
  assigned_counselor: string;
  consultation_status: CounselorStudent['consultationStatus'];
  consultation_notes: string;
  completed_date: string | null;
  outcome: CounselorStudent['outcome'];
}

function fromRow(row: CounselorStudentRow): CounselorStudent {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    email: row.email,
    country: row.country,
    purpose: row.purpose,
    submittedAt: row.submitted_at,
    assignedDate: row.assigned_date,
    assignedCounselor: row.assigned_counselor,
    consultationStatus: row.consultation_status,
    consultationNotes: row.consultation_notes,
    completedDate: row.completed_date,
    outcome: row.outcome,
  };
}

function toRowUpdates(updates: Partial<CounselorStudent>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (updates.name !== undefined) row.name = updates.name;
  if (updates.phone !== undefined) row.phone = updates.phone;
  if (updates.email !== undefined) row.email = updates.email;
  if (updates.country !== undefined) row.country = updates.country;
  if (updates.purpose !== undefined) row.purpose = updates.purpose;
  if (updates.submittedAt !== undefined) row.submitted_at = updates.submittedAt;
  if (updates.assignedDate !== undefined) row.assigned_date = updates.assignedDate;
  if (updates.assignedCounselor !== undefined) row.assigned_counselor = updates.assignedCounselor;
  if (updates.consultationStatus !== undefined) row.consultation_status = updates.consultationStatus;
  if (updates.consultationNotes !== undefined) row.consultation_notes = updates.consultationNotes;
  if (updates.completedDate !== undefined) row.completed_date = updates.completedDate;
  if (updates.outcome !== undefined) row.outcome = updates.outcome;
  return row;
}

function toRow(cs: CounselorStudent): CounselorStudentRow {
  return {
    id: cs.id,
    name: cs.name,
    phone: cs.phone,
    email: cs.email,
    country: cs.country,
    purpose: cs.purpose,
    submitted_at: cs.submittedAt,
    assigned_date: cs.assignedDate,
    assigned_counselor: cs.assignedCounselor,
    consultation_status: cs.consultationStatus,
    consultation_notes: cs.consultationNotes,
    completed_date: cs.completedDate,
    outcome: cs.outcome,
  };
}

export async function insertCounselorStudent(counselorStudent: CounselorStudent): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from('counselor_students').insert(toRow(counselorStudent));
  if (error) throw error;
}

export async function fetchCounselorStudents(): Promise<CounselorStudent[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('counselor_students')
    .select('*')
    .order('assigned_date', { ascending: true });
  if (error) throw error;
  return (data as CounselorStudentRow[]).map(fromRow);
}

export async function updateCounselorStudent(id: string, updates: Partial<CounselorStudent>): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from('counselor_students').update(toRowUpdates(updates)).eq('id', id);
  if (error) throw error;
}
