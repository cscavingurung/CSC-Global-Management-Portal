-- Run this in the Supabase SQL Editor (Project → SQL Editor → New query) to create the
-- table backing the Super Admin's "All Branches" page and the Branch Performance
-- Comparison table on the Super Admin Overview page: `branches` — the six real company
-- branches (distinct from the "Sydney CBD" role-namespace branch used by other roles'
-- demo accounts — see receptionist.sql's header comment). Wired into the app — see
-- src/App.tsx and src/lib/branchesApi.ts. Realtime is enabled below, so INSERT/UPDATE/DELETE
-- changes push live to every open session — see src/lib/realtimeSubscribe.ts.
--
-- Note: this table only holds each branch's identity (name/location/manager). Its
-- performance numbers (staff count, active students, applications in progress,
-- granted/refused) are NOT stored here — they're computed live from the real staff /
-- students / applications tables, filtered by branch name (see src/branchLiveStats.ts),
-- so they can never drift out of sync.
--
-- Caveat: the app's login is still fake (no real Supabase Auth wired up yet), so these
-- policies allow anyone holding the anon/public key to read and write this table. That's
-- the only way it can work without also wiring real auth — fine for this mock-data demo.

create table if not exists branches (
  id text primary key,
  name text not null,
  location text not null,
  manager text
);

-- Safe to re-run against a table created by an earlier version of this file, which stored
-- performance numbers as columns here — those are now computed live instead (see above).
alter table branches drop column if exists staff_count;
alter table branches drop column if exists active_students;
alter table branches drop column if exists applications_in_progress;
alter table branches drop column if exists visas_granted;
alter table branches drop column if exists visas_refused;

alter table branches enable row level security;

create policy "Allow anon read" on branches for select using (true);
create policy "Allow anon insert" on branches for insert with check (true);
create policy "Allow anon update" on branches for update using (true);
create policy "Allow anon delete" on branches for delete using (true);

-- Seed data (optional) — commented out since real branches will be entered through the
-- app's Add Branch form. Uncomment (remove the /* and */) if you ever want sample rows to
-- test against.
/*
insert into branches (id, name, location, manager) values
  ('b1', 'Chitwan', 'Chitwan', 'Bishal Adhikari'),
  ('b2', 'Butwal', 'Butwal', 'Suresh Karki'),
  ('b3', 'Kamaladi', 'Kamaladi', 'Sibendra Subedi'),
  ('b4', 'New Baneshwor', 'New Baneshwor', 'Bidhya Basnet'),
  ('b5', 'Putalisadak', 'Putalisadak', 'Samjhana Khanal'),
  ('b6', 'Kumaripati', 'Kumaripati', 'Dilli Pokharel')
on conflict (id) do nothing;
*/

-- Enable realtime broadcasting (INSERT/UPDATE/DELETE). Safe to re-run — the exception
-- handler skips it if the table is already in the publication.
do $$
begin
  execute 'alter publication supabase_realtime add table branches';
exception when duplicate_object then null;
end $$;
