import { supabase } from './supabaseClient';
import { Counselor } from '../types';

interface CounselorRow {
  id: string;
  name: string;
  country: string;
  active_assignments: number;
  availability: Counselor['availability'];
}

function fromRow(row: CounselorRow): Counselor {
  return {
    id: row.id,
    name: row.name,
    country: row.country,
    activeAssignments: row.active_assignments,
    availability: row.availability,
  };
}

export async function fetchCounselors(): Promise<Counselor[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('counselors')
    .select('*')
    .order('name', { ascending: true });
  if (error) throw error;
  return (data as CounselorRow[]).map(fromRow);
}
