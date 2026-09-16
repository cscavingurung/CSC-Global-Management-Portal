import { supabase } from './supabaseClient';
import { ApplicationRecord } from '../types';

interface ApplicationRow {
  id: string;
  name: string;
  phone: string;
  email: string;
  country: string;
  purpose: string;
  counselor: string;
  consultation_date: string;
  consultation_notes: string;
  status: ApplicationRecord['status'];
  status_history: ApplicationRecord['statusHistory'];
  branch: string;
}

function fromRow(row: ApplicationRow): ApplicationRecord {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    email: row.email,
    country: row.country,
    purpose: row.purpose,
    counselor: row.counselor,
    consultationDate: row.consultation_date,
    consultationNotes: row.consultation_notes,
    status: row.status,
    statusHistory: row.status_history,
    branch: row.branch,
  };
}

function toRowUpdates(updates: Partial<ApplicationRecord>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (updates.name !== undefined) row.name = updates.name;
  if (updates.phone !== undefined) row.phone = updates.phone;
  if (updates.email !== undefined) row.email = updates.email;
  if (updates.country !== undefined) row.country = updates.country;
  if (updates.purpose !== undefined) row.purpose = updates.purpose;
  if (updates.counselor !== undefined) row.counselor = updates.counselor;
  if (updates.consultationDate !== undefined) row.consultation_date = updates.consultationDate;
  if (updates.consultationNotes !== undefined) row.consultation_notes = updates.consultationNotes;
  if (updates.status !== undefined) row.status = updates.status;
  if (updates.statusHistory !== undefined) row.status_history = updates.statusHistory;
  if (updates.branch !== undefined) row.branch = updates.branch;
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

export async function updateApplication(id: string, updates: Partial<ApplicationRecord>): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from('applications').update(toRowUpdates(updates)).eq('id', id);
  if (error) throw error;
}
