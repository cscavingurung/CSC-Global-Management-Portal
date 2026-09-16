-- Run this in the Supabase SQL Editor (Project → SQL Editor → New query) to create the
-- table backing Staff Management: `staff` (shared by the Super Admin and Branch Manager
-- roles' Staff screens). Wired into the app — see src/App.tsx and src/lib/staffApi.ts.
-- Realtime is enabled below, so INSERT/UPDATE/DELETE changes push live to every open
-- session — see src/lib/realtimeSubscribe.ts.
--
-- Caveat: the app's login is still fake (no real Supabase Auth wired up yet), so these
-- policies allow anyone holding the anon/public key to read and write this table — plaintext
-- passwords included, matching the app's existing fake-login convention. Fine for this
-- mock-data demo, not something to use with real staff credentials in production.

create table if not exists staff (
  id text primary key,
  name text not null,
  email text not null,
  password text not null,
  role text not null check (role in ('Receptionist', 'Counselor', 'Application Officer', 'Branch Manager')),
  status text not null check (status in ('Active', 'Inactive')),
  branch text not null
);

alter table staff enable row level security;

create policy "Allow anon read" on staff for select using (true);
create policy "Allow anon insert" on staff for insert with check (true);
create policy "Allow anon update" on staff for update using (true);
create policy "Allow anon delete" on staff for delete using (true);

-- Seed data (optional) — commented out since real staff will be entered through the app's
-- Add Staff form. Uncomment (remove the /* and */) if you ever want sample rows to test against.
/*
insert into staff (id, name, email, password, role, status, branch) values
  ('st1', 'Jessica Wong', 'jessica@everestvisa.com', 'Passw0rd1', 'Receptionist', 'Active', 'Sydney CBD'),
  ('st2', 'Ramesh Thapa', 'ramesh@everestvisa.com', 'Passw0rd1', 'Counselor', 'Active', 'Sydney CBD'),
  ('st3', 'Sita Gurung', 'sita@everestvisa.com', 'Passw0rd1', 'Counselor', 'Active', 'Sydney CBD'),
  ('st4', 'Niraj Maharjan', 'niraj@everestvisa.com', 'Passw0rd1', 'Counselor', 'Inactive', 'Sydney CBD'),
  ('st5', 'Maria Santos', 'maria@everestvisa.com', 'Passw0rd1', 'Application Officer', 'Active', 'Sydney CBD'),
  ('st6', 'John Smith', 'john@everestvisa.com', 'Passw0rd1', 'Application Officer', 'Active', 'Sydney CBD')
on conflict (id) do nothing;
*/

-- Enable realtime broadcasting (INSERT/UPDATE/DELETE). Safe to re-run — the exception
-- handler skips it if the table is already in the publication.
do $$
begin
  execute 'alter publication supabase_realtime add table staff';
exception when duplicate_object then null;
end $$;
