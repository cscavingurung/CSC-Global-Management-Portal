-- Run this in the Supabase SQL Editor (Project → SQL Editor → New query) to create the
-- tables for the Receptionist role:
--   - `students` (New Intake / Students / Assign Counselor / Overview screens)
--   - `counselors` (the counselor roster shown on Assign Counselor / Overview — availability
--     and assigned-student counts)
-- Both are wired into the app — see src/App.tsx, src/lib/studentsApi.ts, src/lib/counselorsApi.ts.
-- Both also have realtime enabled below, so INSERT/UPDATE/DELETE changes (from this app or
-- made directly in the database) push live to every open session — see
-- src/lib/realtimeSubscribe.ts.
--
-- Caveat: the app's login is still fake (no real Supabase Auth wired up yet), so these
-- policies allow anyone holding the anon/public key to read and write these tables. That's
-- the only way it can work without also wiring real auth — fine for this mock-data demo,
-- not something to use with real student data in production.

create table if not exists students (
  id text primary key,
  name text not null,
  phone text not null,
  email text not null,
  country text not null,
  purpose text not null,
  preferred_date text not null,
  submitted_at text not null,
  status text not null check (status in ('New', 'Assigned')),
  assigned_counselor text,
  branch text not null
);

alter table students enable row level security;

create policy "Allow anon read" on students for select using (true);
create policy "Allow anon insert" on students for insert with check (true);
create policy "Allow anon update" on students for update using (true);

-- Seed data (optional) — commented out since real data will be entered through the app.
-- Uncomment (remove the /* and */) if you ever want sample rows to test against.
/*
insert into students (id, name, phone, email, country, purpose, preferred_date, submitted_at, status, assigned_counselor, branch) values
  ('s1', 'Arjun Mehta', '+61 412 345 678', 'arjun.mehta@gmail.com', 'Australia', 'Study', '2026-09-16T10:00', '2026-09-14 09:15 AM', 'New', null, 'Chitwan'),
  ('s2', 'Lina Zhang', '+61 423 987 654', 'lina.zhang@outlook.com', 'Canada', 'PR', '2026-09-18T14:00', '2026-09-14 08:42 AM', 'New', null, 'Butwal'),
  ('s3', 'Mohammed Ali', '+61 445 123 456', 'm.ali@yahoo.com', 'United Kingdom', 'Work', '2026-09-17T11:30', '2026-09-13 03:20 PM', 'Assigned', 'Ramesh Thapa', 'Kamaladi'),
  ('s4', 'Sara Khan', '+61 478 456 789', 'sara.khan@gmail.com', 'USA', 'Tourist', '2026-09-20T09:00', '2026-09-13 01:10 PM', 'New', null, 'Putalisadak'),
  ('s5', 'Deepak Thapa', '+61 489 654 321', 'deepak.t@gmail.com', 'Australia', 'Study', '2026-09-19T15:00', '2026-09-12 11:45 AM', 'Assigned', 'Sita Gurung', 'New Baneshwor'),
  ('s6', 'Emily Park', '+61 401 222 333', 'emily.park@gmail.com', 'New Zealand', 'Work', '2026-09-21T13:00', '2026-09-12 10:30 AM', 'New', null, 'Butwal'),
  ('s7', 'Ravi Gupta', '+61 433 777 888', 'ravi.gupta@outlook.com', 'Canada', 'PR', '2026-09-18T16:00', '2026-09-11 02:15 PM', 'Assigned', 'Bikash Rai', 'Butwal'),
  ('s8', 'Anna Lee', '+61 415 555 999', 'anna.lee@gmail.com', 'Australia', 'Study', '2026-09-22T10:30', '2026-09-11 09:00 AM', 'New', null, 'Butwal')
on conflict (id) do nothing;
*/

create table if not exists counselors (
  id text primary key,
  name text not null,
  country text not null,
  active_assignments integer not null default 0,
  availability text not null check (availability in ('Available', 'In Session', 'Away'))
);

alter table counselors enable row level security;

create policy "Allow anon read" on counselors for select using (true);
create policy "Allow anon insert" on counselors for insert with check (true);
create policy "Allow anon update" on counselors for update using (true);
create policy "Allow anon delete" on counselors for delete using (true);

-- Seed data (optional) — commented out since real counselor roster entries are created
-- automatically when a Branch Manager or Super Admin adds a Counselor via Staff Management
-- (see handleAddStaff in src/App.tsx). Uncomment if you ever want sample rows to test against.
/*
insert into counselors (id, name, country, active_assignments, availability) values
  ('c1', 'Ramesh Thapa', 'Australia', 12, 'Available'),
  ('c2', 'Sita Gurung', 'Canada', 8, 'In Session'),
  ('c3', 'Bikash Rai', 'United Kingdom', 15, 'Available'),
  ('c4', 'Anjali Shrestha', 'USA', 6, 'Away'),
  ('c5', 'Niraj Maharjan', 'New Zealand', 10, 'In Session'),
  ('c6', 'Milan Gurung', 'Australia', 10, 'Available')
on conflict (id) do nothing;
*/

-- Enable realtime broadcasting (INSERT/UPDATE/DELETE) for both tables. Safe to re-run —
-- the exception handler skips a table that's already in the publication.
do $$
begin
  execute 'alter publication supabase_realtime add table students';
exception when duplicate_object then null;
end $$;

do $$
begin
  execute 'alter publication supabase_realtime add table counselors';
exception when duplicate_object then null;
end $$;
