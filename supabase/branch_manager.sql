-- Run this in the Supabase SQL Editor (Project → SQL Editor → New query) to create the
-- tables for the Branch Manager Overview page:
--   - `branch_stats` (the four stat cards: Total Students This Month, Active Consultations,
--     Applications In Progress, Decided This Month) — one row per branch.
--   - `activity_feed` ("Today's Activity" panel) — global feed, filtered client-side to
--     today's entries and by type.
-- Wired into the app — see src/App.tsx and src/lib/branchOverviewApi.ts. The rest of the
-- Branch Manager Overview page (Needs Attention, the student/counselor/application data
-- behind it) already reads from the students / counselors / applications tables — see
-- receptionist.sql, counselor.sql and application_officer.sql.
--
-- Caveat: the app's login is still fake (no real Supabase Auth wired up yet), so these
-- policies allow anyone holding the anon/public key to read and write these tables. That's
-- the only way it can work without also wiring real auth — fine for this mock-data demo.
--
-- Both tables have realtime enabled below, so INSERT/UPDATE/DELETE changes push live to
-- every open session — see src/lib/realtimeSubscribe.ts.

create table if not exists branch_stats (
  branch text primary key,
  total_students_this_month integer not null default 0,
  total_students_trend text not null default '',
  total_students_trend_up boolean not null default true,
  active_consultations integer not null default 0,
  active_consultations_trend text not null default '',
  active_consultations_trend_up boolean not null default true,
  applications_in_progress integer not null default 0,
  applications_in_progress_trend text not null default '',
  applications_in_progress_trend_up boolean not null default true,
  decided_granted integer not null default 0,
  decided_refused integer not null default 0
);

alter table branch_stats enable row level security;

create policy "Allow anon read" on branch_stats for select using (true);
create policy "Allow anon insert" on branch_stats for insert with check (true);
create policy "Allow anon update" on branch_stats for update using (true);

-- Seed data matching the app's previous mock data (BRANCH_MANAGER_STATS /
-- BRANCH_DECIDED_THIS_MONTH in src/mockData.ts). 'Sydney CBD' is the role-namespace branch
-- used by the Branch Manager demo account (see receptionist.sql's header comment); the other
-- six rows match the real company branches in MOCK_BRANCHES, so the Super Admin Overview's
-- stat cards (which sum every real branch's row via fetchAggregatedBranchStats) have
-- meaningful company-wide totals.
insert into branch_stats (
  branch, total_students_this_month, total_students_trend, total_students_trend_up,
  active_consultations, active_consultations_trend, active_consultations_trend_up,
  applications_in_progress, applications_in_progress_trend, applications_in_progress_trend_up,
  decided_granted, decided_refused
) values
  ('Sydney CBD', 38, '+8% vs last month', true, 14, '+3 this week', true, 22, '+5 new this week', true, 9, 3),
  ('Chitwan', 45, '+6% vs last month', true, 16, '+2 this week', true, 12, '+3 new this week', true, 18, 2),
  ('Butwal', 32, '+4% vs last month', true, 11, '+1 this week', true, 8, '+2 new this week', true, 14, 2),
  ('Kamaladi', 38, '+3% vs last month', true, 13, '+2 this week', true, 10, '+2 new this week', true, 11, 8),
  ('New Baneshwor', 28, '+5% vs last month', true, 9, '+1 this week', true, 6, '+1 new this week', true, 9, 1),
  ('Putalisadak', 52, '+7% vs last month', true, 18, '+3 this week', true, 15, '+4 new this week', true, 22, 2),
  ('Kumaripati', 68, '+9% vs last month', true, 24, '+4 this week', true, 20, '+5 new this week', true, 31, 3)
on conflict (branch) do nothing;

create table if not exists activity_feed (
  id text primary key,
  message text not null,
  timestamp text not null,
  type text not null check (type in ('assignment', 'status', 'intake', 'consultation')),
  sort_order integer not null
);

alter table activity_feed enable row level security;

create policy "Allow anon read" on activity_feed for select using (true);
create policy "Allow anon insert" on activity_feed for insert with check (true);
create policy "Allow anon update" on activity_feed for update using (true);

-- Seed data matching the app's previous mock data (MOCK_ACTIVITY_FEED in src/mockData.ts).
-- sort_order preserves the original most-recent-first ordering (timestamps are relative
-- display strings, not real dates, so they can't be sorted directly).
insert into activity_feed (id, message, timestamp, type, sort_order) values
  ('act1', 'Student Deepak Thapa assigned to Sita Gurung', '2 min ago', 'assignment', 1),
  ('act2', 'Application for Priya Karki moved to Lodgement', '15 min ago', 'status', 2),
  ('act3', 'New intake: Anna Lee submitted the intake form', '1 hour ago', 'intake', 3),
  ('act4', 'David Chen completed consultation for Emily Park', '2 hours ago', 'consultation', 4),
  ('act5', 'Application for Deepak Thapa marked as Success', '3 hours ago', 'status', 5),
  ('act6', 'Student Arjun Mehta assigned to Ramesh Thapa', '5 hours ago', 'assignment', 6),
  ('act7', 'New intake: Sara Khan submitted the intake form', '6 hours ago', 'intake', 7),
  ('act9', 'Student Ravi Gupta assigned to Bikash Rai', '7 hours ago', 'assignment', 8),
  ('act10', 'New intake: Lina Zhang submitted the intake form', '8 hours ago', 'intake', 9),
  ('act11', 'Application for Ravi Gupta moved to Lodgement', '9 hours ago', 'status', 10),
  ('act12', 'Sita Gurung completed consultation for Deepak Thapa', '10 hours ago', 'consultation', 11),
  ('act13', 'Student Mohammed Ali assigned to Ramesh Thapa', '11 hours ago', 'assignment', 12),
  ('act14', 'Application for Anna Lee moved to Lodgement', '12 hours ago', 'status', 13),
  ('act8', 'Application for Lina Zhang marked as Refused', '1 day ago', 'status', 14)
on conflict (id) do nothing;

-- Enable realtime broadcasting (INSERT/UPDATE/DELETE) for both tables. Safe to re-run —
-- the exception handler skips a table that's already in the publication.
do $$
begin
  execute 'alter publication supabase_realtime add table branch_stats';
exception when duplicate_object then null;
end $$;

do $$
begin
  execute 'alter publication supabase_realtime add table activity_feed';
exception when duplicate_object then null;
end $$;
