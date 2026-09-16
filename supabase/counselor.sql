-- Run this in the Supabase SQL Editor (Project → SQL Editor → New query) to create the
-- table for the Counselor role: `counselor_students` (Assigned/Upcoming Students,
-- Consulted Students, and Overview screens). Wired into the app — see src/App.tsx and
-- src/lib/counselorStudentsApi.ts. Realtime is enabled below, so INSERT/UPDATE/DELETE
-- changes push live to every open session — see src/lib/realtimeSubscribe.ts.
--
-- Caveat: the app's login is still fake (no real Supabase Auth wired up yet), so these
-- policies allow anyone holding the anon/public key to read and write this table. That's
-- the only way it can work without also wiring real auth — fine for this mock-data demo,
-- not something to use with real student data in production.

create table if not exists counselor_students (
  id text primary key,
  name text not null,
  phone text not null,
  email text not null,
  country text not null,
  purpose text not null,
  submitted_at text not null,
  assigned_date text not null,
  assigned_counselor text not null,
  consultation_status text not null check (consultation_status in ('Awaiting Consultation', 'In Progress', 'Consultation Complete')),
  consultation_notes text not null default '',
  completed_date text,
  outcome text not null check (outcome in ('Pending', 'Proceeding', 'Not Proceeding'))
);

alter table counselor_students enable row level security;

create policy "Allow anon read" on counselor_students for select using (true);
create policy "Allow anon insert" on counselor_students for insert with check (true);
create policy "Allow anon update" on counselor_students for update using (true);

-- Seed data (optional) — commented out since real rows are created automatically when a
-- Receptionist assigns a student to a counselor (see handleAssign in src/App.tsx).
-- Uncomment (remove the /* and */) if you ever want sample rows to test against.
/*
insert into counselor_students (id, name, phone, email, country, purpose, submitted_at, assigned_date, assigned_counselor, consultation_status, consultation_notes, completed_date, outcome) values
  ('cs1', 'Arjun Mehta', '+61 412 345 678', 'arjun.mehta@gmail.com', 'Australia', 'Study', '2026-09-14 09:15 AM', '2026-09-14', 'David Chen', 'Awaiting Consultation', '', null, 'Pending'),
  ('cs2', 'Mohammed Ali', '+61 445 123 456', 'm.ali@yahoo.com', 'United Kingdom', 'Work', '2026-09-13 03:20 PM', '2026-09-13', 'David Chen', 'In Progress', 'Client interested in skilled migration pathway. Needs IELTS assessment. Discussed employer sponsorship options.', null, 'Pending'),
  ('cs3', 'Emily Park', '+61 401 222 333', 'emily.park@gmail.com', 'New Zealand', 'Work', '2026-09-12 10:30 AM', '2026-09-12', 'David Chen', 'Consultation Complete', 'Client has valid job offer from Sydney employer. Recommended 482 visa (temporary skill shortage). All documents verified and ready for lodgement.', '2026-09-13', 'Proceeding'),
  ('cs4', 'Ravi Gupta', '+61 433 777 888', 'ravi.gupta@outlook.com', 'Canada', 'PR', '2026-09-11 02:15 PM', '2026-09-11', 'David Chen', 'In Progress', 'Client seeking permanent residency via Express Entry. Reviewed education credentials and work experience. Need to arrange WES assessment.', null, 'Pending'),
  ('cs5', 'Anna Lee', '+61 415 555 999', 'anna.lee@gmail.com', 'Australia', 'Study', '2026-09-11 09:00 AM', '2026-09-11', 'David Chen', 'Awaiting Consultation', '', null, 'Pending'),
  ('cs6', 'Sara Khan', '+61 478 456 789', 'sara.khan@gmail.com', 'USA', 'Tourist', '2026-09-13 01:10 PM', '2026-09-13', 'David Chen', 'Consultation Complete', 'Client applying for US B1/B2 tourist visa. Travel planned for December. Documents collected: passport, bank statements, employment letter.', '2026-09-14', 'Not Proceeding')
on conflict (id) do nothing;
*/

-- Enable realtime broadcasting (INSERT/UPDATE/DELETE). Safe to re-run — the exception
-- handler skips it if the table is already in the publication.
do $$
begin
  execute 'alter publication supabase_realtime add table counselor_students';
exception when duplicate_object then null;
end $$;
