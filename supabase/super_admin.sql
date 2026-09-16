-- Run this in the Supabase SQL Editor (Project → SQL Editor → New query) to create the
-- table backing the Super Admin's "All Branches" page and the Branch Performance
-- Comparison table on the Super Admin Overview page: `branches` — the six real company
-- branches (distinct from the "Sydney CBD" role-namespace branch used by other roles'
-- demo accounts — see receptionist.sql's header comment). Wired into the app — see
-- src/App.tsx and src/lib/branchesApi.ts. Realtime is enabled below, so INSERT/UPDATE/DELETE
-- changes push live to every open session — see src/lib/realtimeSubscribe.ts.
--
-- Caveat: the app's login is still fake (no real Supabase Auth wired up yet), so these
-- policies allow anyone holding the anon/public key to read and write this table. That's
-- the only way it can work without also wiring real auth — fine for this mock-data demo.

create table if not exists branches (
  id text primary key,
  name text not null,
  location text not null,
  manager text,
  staff_count integer not null default 0,
  active_students integer not null default 0,
  applications_in_progress integer not null default 0,
  visas_granted integer not null default 0,
  visas_refused integer not null default 0
);

alter table branches enable row level security;

create policy "Allow anon read" on branches for select using (true);
create policy "Allow anon insert" on branches for insert with check (true);
create policy "Allow anon update" on branches for update using (true);
create policy "Allow anon delete" on branches for delete using (true);

-- Seed data matching the app's previous mock data (MOCK_BRANCHES in src/mockData.ts).
insert into branches (id, name, location, manager, staff_count, active_students, applications_in_progress, visas_granted, visas_refused) values
  ('b1', 'Chitwan', 'Chitwan', 'Bishal Adhikari', 8, 45, 12, 18, 2),
  ('b2', 'Butwal', 'Butwal', 'Suresh Karki', 6, 32, 8, 14, 2),
  ('b3', 'Kamaladi', 'Kamaladi', 'Sibendra Subedi', 7, 38, 10, 11, 8),
  ('b4', 'New Baneshwor', 'New Baneshwor', 'Bidhya Basnet', 5, 28, 6, 9, 1),
  ('b5', 'Putalisadak', 'Putalisadak', 'Samjhana Khanal', 9, 52, 15, 22, 2),
  ('b6', 'Kumaripati', 'Kumaripati', 'Dilli Pokharel', 12, 68, 20, 31, 3)
on conflict (id) do nothing;

-- Enable realtime broadcasting (INSERT/UPDATE/DELETE). Safe to re-run — the exception
-- handler skips it if the table is already in the publication.
do $$
begin
  execute 'alter publication supabase_realtime add table branches';
exception when duplicate_object then null;
end $$;
