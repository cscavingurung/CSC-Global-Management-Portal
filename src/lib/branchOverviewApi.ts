import { supabase } from './supabaseClient';
import { ActivityEntry } from '../types';

export interface BranchStats {
  totalStudents: { value: number; trend: string; trendUp: boolean };
  activeConsultations: { value: number; trend: string; trendUp: boolean };
  applicationsInProgress: { value: number; trend: string; trendUp: boolean };
  decidedGranted: number;
  decidedRefused: number;
}

export const DEFAULT_BRANCH_STATS: BranchStats = {
  totalStudents: { value: 0, trend: '', trendUp: true },
  activeConsultations: { value: 0, trend: '', trendUp: true },
  applicationsInProgress: { value: 0, trend: '', trendUp: true },
  decidedGranted: 0,
  decidedRefused: 0,
};

interface BranchStatsRow {
  branch: string;
  total_students_this_month: number;
  total_students_trend: string;
  total_students_trend_up: boolean;
  active_consultations: number;
  active_consultations_trend: string;
  active_consultations_trend_up: boolean;
  applications_in_progress: number;
  applications_in_progress_trend: string;
  applications_in_progress_trend_up: boolean;
  decided_granted: number;
  decided_refused: number;
}

function fromStatsRow(row: BranchStatsRow): BranchStats {
  return {
    totalStudents: {
      value: row.total_students_this_month,
      trend: row.total_students_trend,
      trendUp: row.total_students_trend_up,
    },
    activeConsultations: {
      value: row.active_consultations,
      trend: row.active_consultations_trend,
      trendUp: row.active_consultations_trend_up,
    },
    applicationsInProgress: {
      value: row.applications_in_progress,
      trend: row.applications_in_progress_trend,
      trendUp: row.applications_in_progress_trend_up,
    },
    decidedGranted: row.decided_granted,
    decidedRefused: row.decided_refused,
  };
}

export async function fetchBranchStats(branch: string): Promise<BranchStats> {
  if (!supabase) return DEFAULT_BRANCH_STATS;
  const { data, error } = await supabase.from('branch_stats').select('*').eq('branch', branch).maybeSingle();
  if (error) throw error;
  return data ? fromStatsRow(data as BranchStatsRow) : DEFAULT_BRANCH_STATS;
}

export interface AggregatedBranchStats extends BranchStats {
  branchCount: number;
}

export const DEFAULT_AGGREGATED_BRANCH_STATS: AggregatedBranchStats = {
  ...DEFAULT_BRANCH_STATS,
  branchCount: 0,
};

// Company-wide version of fetchBranchStats — sums every branch's row (restricted to the
// given branch names, since branch_stats also carries the role-namespace "Sydney CBD" row
// used by the Branch Manager demo account, which isn't one of the real company branches).
export async function fetchAggregatedBranchStats(branchNames: string[]): Promise<AggregatedBranchStats> {
  if (!supabase || branchNames.length === 0) return DEFAULT_AGGREGATED_BRANCH_STATS;
  const { data, error } = await supabase.from('branch_stats').select('*').in('branch', branchNames);
  if (error) throw error;
  const rows = data as BranchStatsRow[];
  if (rows.length === 0) return DEFAULT_AGGREGATED_BRANCH_STATS;

  const sum = (key: 'total_students_this_month' | 'active_consultations' | 'applications_in_progress' | 'decided_granted' | 'decided_refused') =>
    rows.reduce((s, r) => s + r[key], 0);
  const upCount = (key: 'total_students_trend_up' | 'active_consultations_trend_up' | 'applications_in_progress_trend_up') =>
    rows.filter((r) => r[key]).length;

  const totalStudentsUp = upCount('total_students_trend_up');
  const activeConsultationsUp = upCount('active_consultations_trend_up');
  const applicationsUp = upCount('applications_in_progress_trend_up');

  return {
    totalStudents: {
      value: sum('total_students_this_month'),
      trend: `${totalStudentsUp} of ${rows.length} branches trending up`,
      trendUp: totalStudentsUp >= rows.length / 2,
    },
    activeConsultations: {
      value: sum('active_consultations'),
      trend: `${activeConsultationsUp} of ${rows.length} branches trending up`,
      trendUp: activeConsultationsUp >= rows.length / 2,
    },
    applicationsInProgress: {
      value: sum('applications_in_progress'),
      trend: `${applicationsUp} of ${rows.length} branches trending up`,
      trendUp: applicationsUp >= rows.length / 2,
    },
    decidedGranted: sum('decided_granted'),
    decidedRefused: sum('decided_refused'),
    branchCount: rows.length,
  };
}

interface ActivityFeedRow {
  id: string;
  message: string;
  timestamp: string;
  type: ActivityEntry['type'];
  sort_order: number;
}

export async function fetchActivityFeed(): Promise<ActivityEntry[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('activity_feed')
    .select('id, message, timestamp, type, sort_order')
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return (data as ActivityFeedRow[]).map((row) => ({
    id: row.id,
    message: row.message,
    timestamp: row.timestamp,
    type: row.type,
  }));
}
