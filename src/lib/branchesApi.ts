import { supabase } from './supabaseClient';
import { Branch } from '../types';

interface BranchRow {
  id: string;
  name: string;
  location: string;
  manager: string | null;
  staff_count: number;
  active_students: number;
  applications_in_progress: number;
  visas_granted: number;
  visas_refused: number;
}

function fromRow(row: BranchRow): Branch {
  return {
    id: row.id,
    name: row.name,
    location: row.location,
    manager: row.manager,
    staffCount: row.staff_count,
    activeStudents: row.active_students,
    applicationsInProgress: row.applications_in_progress,
    visasGranted: row.visas_granted,
    visasRefused: row.visas_refused,
  };
}

function toRow(branch: Branch): BranchRow {
  return {
    id: branch.id,
    name: branch.name,
    location: branch.location,
    manager: branch.manager,
    staff_count: branch.staffCount,
    active_students: branch.activeStudents,
    applications_in_progress: branch.applicationsInProgress,
    visas_granted: branch.visasGranted,
    visas_refused: branch.visasRefused,
  };
}

function toRowUpdates(updates: Partial<Branch>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (updates.name !== undefined) row.name = updates.name;
  if (updates.location !== undefined) row.location = updates.location;
  if (updates.manager !== undefined) row.manager = updates.manager;
  if (updates.staffCount !== undefined) row.staff_count = updates.staffCount;
  if (updates.activeStudents !== undefined) row.active_students = updates.activeStudents;
  if (updates.applicationsInProgress !== undefined) row.applications_in_progress = updates.applicationsInProgress;
  if (updates.visasGranted !== undefined) row.visas_granted = updates.visasGranted;
  if (updates.visasRefused !== undefined) row.visas_refused = updates.visasRefused;
  return row;
}

export async function fetchBranches(): Promise<Branch[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.from('branches').select('*').order('name', { ascending: true });
  if (error) throw error;
  return (data as BranchRow[]).map(fromRow);
}

export async function insertBranch(branch: Branch): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from('branches').insert(toRow(branch));
  if (error) throw error;
}

export async function updateBranch(id: string, updates: Partial<Branch>): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from('branches').update(toRowUpdates(updates)).eq('id', id);
  if (error) throw error;
}

export async function deleteBranch(id: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from('branches').delete().eq('id', id);
  if (error) throw error;
}
