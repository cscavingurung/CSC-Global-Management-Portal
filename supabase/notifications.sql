-- Run this in the Supabase SQL Editor (Project → SQL Editor → New query) to create the
-- table backing the in-app notification bell: `notifications` — shared across every role
-- (visibility is filtered client-side per viewer via isNotificationVisibleTo() in
-- src/notifications.ts). Wired into the app — see src/App.tsx and
-- src/lib/notificationsApi.ts. Realtime is enabled below, so a notification created by one
-- session (e.g. a receptionist submitting a New Intake) appears live in the bell for anyone
-- else it's addressed to, without a refresh — see src/lib/realtimeSubscribe.ts.
--
-- Caveat: the app's login is still fake (no real Supabase Auth wired up yet), so these
-- policies allow anyone holding the anon/public key to read and write this table. That's
-- the only way it can work without also wiring real auth — fine for this mock-data demo.

create table if not exists notifications (
  id text primary key,
  trigger text not null check (trigger in ('new-intake', 'assigned-to-counselor', 'consultation-ready')),
  student_name text not null,
  message_before text not null default '',
  message_after text not null default '',
  created_at timestamptz not null default now(),
  read boolean not null default false,
  navigate_to text not null,
  role text not null check (role in ('super_admin', 'marketing', 'finance', 'branch_manager', 'receptionist', 'counselor', 'application_officer')),
  branch text,
  recipient_name text
);

alter table notifications enable row level security;

create policy "Allow anon read" on notifications for select using (true);
create policy "Allow anon insert" on notifications for insert with check (true);
create policy "Allow anon update" on notifications for update using (true);

-- Seed data (optional) — commented out since real notifications are created automatically
-- by the app's own actions (New Intake, Assign Counselor, marking a consultation
-- "Proceeding"). Uncomment (remove the /* and */) if you ever want sample rows to test against.
/*
insert into notifications (id, trigger, student_name, message_before, message_after, created_at, read, navigate_to, role, branch, recipient_name) values
  ('notif-seed-1', 'new-intake', 'Lina Zhang', 'New intake from ', ' — Canada, PR', now() - interval '8 minutes', false, 'assign-counselor', 'receptionist', 'Sydney CBD', null),
  ('notif-seed-2', 'new-intake', 'Arjun Mehta', 'New intake from ', ' — Australia, Study', now() - interval '32 minutes', false, 'assign-counselor', 'receptionist', 'Sydney CBD', null),
  ('notif-seed-3', 'assigned-to-counselor', 'Mohammed Ali', '', ' assigned to you — United Kingdom, Work', now() - interval '15 minutes', false, 'my-students', 'counselor', null, 'David Chen'),
  ('notif-seed-4', 'assigned-to-counselor', 'Emily Park', '', ' assigned to you — New Zealand, Work', now() - interval '70 minutes', true, 'my-students', 'counselor', null, 'David Chen'),
  ('notif-seed-5', 'consultation-ready', 'Deepak Thapa', '', ' ready for application — consultation complete', now() - interval '1440 minutes', true, 'applications', 'application_officer', 'Sydney CBD', null)
on conflict (id) do nothing;
*/

-- Enable realtime broadcasting (INSERT/UPDATE/DELETE). Safe to re-run — the exception
-- handler skips it if the table is already in the publication.
do $$
begin
  execute 'alter publication supabase_realtime add table notifications';
exception when duplicate_object then null;
end $$;
