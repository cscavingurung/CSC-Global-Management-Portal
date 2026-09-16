import { supabase } from './supabaseClient';
import { IntakeStudent } from '../types';

interface StudentRow {
  id: string;
  name: string;
  phone: string;
  email: string;
  country: string;
  purpose: string;
  preferred_date: string;
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
    preferredDate: row.preferred_date,
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
    preferred_date: student.preferredDate,
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
  if (updates.preferredDate !== undefined) row.preferred_date = updates.preferredDate;
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
