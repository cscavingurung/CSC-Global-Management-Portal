-- Run this in the Supabase SQL Editor (Project → SQL Editor → New query) to create the
-- table for the Application Officer role: `applications` (Overview, Applications list,
-- Status Updates screens). Wired into the app — see src/App.tsx and
-- src/lib/applicationsApi.ts. Also read (not written) by the Counselor's "My Students'
-- Applications" panel and by other roles' Applications views. Realtime is enabled below,
-- so INSERT/UPDATE/DELETE changes push live to every open session — see
-- src/lib/realtimeSubscribe.ts.
--
-- Caveat: the app's login is still fake (no real Supabase Auth wired up yet), so these
-- policies allow anyone holding the anon/public key to read and write this table. That's
-- the only way it can work without also wiring real auth — fine for this mock-data demo,
-- not something to use with real application data in production.

create table if not exists applications (
  id text primary key,
  name text not null,
  phone text not null,
  email text not null,
  country text not null,
  purpose text not null,
  counselor text not null,
  consultation_date text not null,
  consultation_notes text not null default '',
  status text not null check (status in ('Preparation', 'Lodgement', 'Success', 'Refused')),
  status_history jsonb not null default '[]'::jsonb,
  branch text not null
);

alter table applications enable row level security;

create policy "Allow anon read" on applications for select using (true);
create policy "Allow anon insert" on applications for insert with check (true);
create policy "Allow anon update" on applications for update using (true);

-- Seed data (optional) — commented out since real applications are created automatically
-- when a Counselor marks a consultation's outcome as "Proceeding" (see
-- handleUpdateCounselorStudent in src/App.tsx). Uncomment (remove the /* and */) if you
-- ever want sample rows to test against.
/*
insert into applications (id, name, phone, email, country, purpose, counselor, consultation_date, consultation_notes, status, status_history, branch) values
  ('a1', 'Emily Park', '+61 401 222 333', 'emily.park@gmail.com', 'New Zealand', 'Work', 'David Chen', '2026-09-13', 'Client has valid job offer from Sydney employer. Recommended 482 visa (temporary skill shortage). All documents verified and ready for lodgement.', 'Lodgement', '[{"status":"Preparation","date":"Sept 13"},{"status":"Lodgement","date":"Sept 14"}]'::jsonb, 'Sydney CBD'),
  ('a2', 'Sara Khan', '+61 478 456 789', 'sara.khan@gmail.com', 'USA', 'Tourist', 'David Chen', '2026-09-14', 'Client applying for US B1/B2 tourist visa. Travel planned for December. Documents collected: passport, bank statements, employment letter.', 'Preparation', '[{"status":"Preparation","date":"Sept 14"}]'::jsonb, 'Sydney CBD'),
  ('a3', 'Deepak Thapa', '+61 489 654 321', 'deepak.t@gmail.com', 'Australia', 'Study', 'Sita Gurung', '2026-09-10', 'Client applying for student visa (subclass 500). Confirmed university offer from University of Sydney. Financial documents in order.', 'Success', '[{"status":"Preparation","date":"Sept 10"},{"status":"Lodgement","date":"Sept 12"},{"status":"Success","date":"Sept 14"}]'::jsonb, 'Sydney CBD'),
  ('a4', 'Ravi Gupta', '+61 433 777 888', 'ravi.gupta@outlook.com', 'Canada', 'PR', 'David Chen', '2026-09-08', 'Client seeking permanent residency via Express Entry. Reviewed education credentials and work experience. Need to arrange WES assessment.', 'Lodgement', '[{"status":"Preparation","date":"Sept 8"},{"status":"Lodgement","date":"Sept 11"}]'::jsonb, 'Sydney CBD'),
  ('a5', 'Arjun Mehta', '+61 412 345 678', 'arjun.mehta@gmail.com', 'Australia', 'Study', 'Ramesh Thapa', '2026-09-09', 'Student visa application. Client has offer from Monash University. Need to arrange OSHC health insurance and financial evidence.', 'Preparation', '[{"status":"Preparation","date":"Sept 9"}]'::jsonb, 'Sydney CBD'),
  ('a6', 'Lina Zhang', '+61 423 987 654', 'lina.zhang@outlook.com', 'Canada', 'PR', 'Bikash Rai', '2026-09-05', 'Express Entry profile being prepared. Client has CLB 8 in IELTS. Awaiting WES credential assessment results.', 'Refused', '[{"status":"Preparation","date":"Sept 5"},{"status":"Lodgement","date":"Sept 8"},{"status":"Refused","date":"Sept 13"}]'::jsonb, 'Sydney CBD'),
  ('a7', 'Mohammed Ali', '+61 445 123 456', 'm.ali@yahoo.com', 'United Kingdom', 'Work', 'David Chen', '2026-09-07', 'Client interested in skilled migration pathway. Needs IELTS assessment. Discussed employer sponsorship options.', 'Preparation', '[{"status":"Preparation","date":"Sept 7"}]'::jsonb, 'Sydney CBD'),
  ('a8', 'Anna Lee', '+61 415 555 999', 'anna.lee@gmail.com', 'Australia', 'Study', 'Ramesh Thapa', '2026-09-06', 'Student visa application. Client has offer from University of Melbourne. Awaiting financial documents from sponsor.', 'Lodgement', '[{"status":"Preparation","date":"Sept 6"},{"status":"Lodgement","date":"Sept 10"}]'::jsonb, 'New Baneshwor'),
  ('a9', 'Priya Karki', '+61 422 111 222', 'priya.karki@gmail.com', 'Canada', 'PR', 'Bikash Rai', '2026-09-03', 'Express Entry profile under preparation. Awaiting updated language test results before proceeding.', 'Preparation', '[{"status":"Preparation","date":"Sept 4"}]'::jsonb, 'Kamaladi'),
  ('a10', 'Suman Rai', '+61 433 222 111', 'suman.rai@gmail.com', 'USA', 'Tourist', 'Milan Gurung', '2026-09-05', 'Tourist visa application. Awaiting bank statements and travel itinerary from client.', 'Preparation', '[{"status":"Preparation","date":"Sept 6"}]'::jsonb, 'Putalisadak')
on conflict (id) do nothing;
*/

-- Enable realtime broadcasting (INSERT/UPDATE/DELETE). Safe to re-run — the exception
-- handler skips it if the table is already in the publication.
do $$
begin
  execute 'alter publication supabase_realtime add table applications';
exception when duplicate_object then null;
end $$;
