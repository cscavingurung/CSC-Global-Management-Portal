# CSC Global Management Portal

A role-based management portal for an education/visa consultancy (branded "CSC Global" at login, with sample data referencing "Everest Visa"). It tracks students end-to-end: intake → counselor assignment → consultation → visa application → status → commissions, across multiple branches.

## Stack

- **React 18** + **TypeScript**, built with **Vite 5**
- **Tailwind CSS 3** for styling, **lucide-react** for icons
- **@supabase/supabase-js**: most roles are wired to live Supabase tables — remaining static bits (commissions, partners) still run on in-memory mock data.
  - Counselor: `counselorStudents` state (Assigned/Upcoming Students, Consulted Students, Overview) ↔ `counselor_students` table, via `src/lib/counselorStudentsApi.ts`. Rows are created for real when a Receptionist assigns a student to a counselor (`handleAssign` in `src/App.tsx`) — there's no separate "create" UI for this table.
  - Receptionist: `students` state (New Intake, Students list, Assign Counselor, Overview) ↔ `students` table via `src/lib/studentsApi.ts`; the counselor roster (`counselors` state — availability/assigned-count shown on Assign Counselor and Overview) ↔ `counselors` table via `src/lib/counselorsApi.ts`, full CRUD. A roster row is created/deleted automatically when a Super Admin or Branch Manager adds/removes a Counselor-role staff member in Staff Management (which also prompts for a "Specialization Country" — see `StaffManagement.tsx`), and `activeAssignments` increments each time `handleAssign` creates a `counselor_students` row for them.
  - Application Officer: `applications` state (Overview, Applications list, Status Updates) ↔ `applications` table via `src/lib/applicationsApi.ts` (`statusHistory` stored as a `jsonb` column) — also read by other roles' Applications views and the Counselor's "My Students' Applications" panel, since it's the same shared state. A row is created for real when a Counselor marks a consultation's outcome as "Proceeding" (`handleUpdateCounselorStudent` in `src/App.tsx`, status starts at `Preparation`) — there's no separate "create" UI for this table.
  - Branch Manager Overview: the four stat cards (Total Students This Month / Active Consultations / Applications In Progress / Decided This Month) are computed live by `computeBranchOverviewStats()` in `src/branchLiveStats.ts`, filtering the real `students`/`counselorStudents`/`applications` state by the signed-in manager's `branch` — no trend indicator, since there's no stored prior-period baseline to compare against. `counselor_students` rows carry no `branch` of their own, so "Active Consultations" is scoped by looking up the assigned counselor's `branch` via their `staff` record (matched by name). "Today's Activity" is derived live from the branch-scoped `branch_manager`-role notifications created alongside New Intake / Assign Counselor / Consultation Ready (see `createBranchManagerNotification` in `src/notifications.ts`) — there's no notification for application status changes yet, so the "Status Changes" filter has no entries. The "Needs Attention" panel is already covered by the students/counselors/applications tables above.
  - Super Admin Overview: the same four stat cards as Branch Manager, but company-wide — computed live by `computeCompanyOverviewStats()` in `src/branchLiveStats.ts` from the same `students`/`counselorStudents`/`applications` state, with no branch filtering (every real row already belongs to some real branch under real login, so summing everything is the company total) and no trend indicator, same as Branch Manager's cards. The Branch Performance Comparison table and the "All Branches" page (add/delete, plus manager auto-assignment when a Branch Manager is added/removed in Staff) ↔ `branches` table via `src/lib/branchesApi.ts` — but `branches` only holds identity (name/location/manager); its per-branch numbers (staff count, active students, apps in progress, granted/refused) are computed live by `computeBranchLiveStats()` in `src/branchLiveStats.ts`, filtering the real `staff`/`students`/`applications` state by branch name, so they can't drift out of sync. This only produces non-zero numbers for a branch name that real data actually uses — every `staff`/`students`/`applications` row's `branch` is whatever was entered through the app (New Intake, Add Staff, etc.), so a newly created branch needs matching data entered against that same name before its live numbers populate. `src/lib/branchOverviewApi.ts` (which used to read `branch_stats`/`activity_feed` for both overview pages) has been deleted — nothing in the app reads or writes either of those two tables anymore.
  - Staff (shared by Super Admin and Branch Manager): `staff` state ↔ `staff` table via `src/lib/staffApi.ts`, full CRUD (add/update status/remove).
  - **Branch scoping**: every role except Super Admin only ever sees their own branch's data — `src/App.tsx` pre-filters before handing state down as `branchStudents`/`branchApplications`/`branchCounselors`/`branchStaff` (each a `useMemo` keyed on `user`), rather than relying on `StudentList`/`ApplicationsList`'s own `showBranchFilter` prop (which only renders a branch-picker dropdown for Super Admin and does nothing to scope the data itself). `counselors` (the roster) carries no `branch` field of its own, so it's scoped by looking up each counselor's `branch` via their `staff` record (matched by name) — same technique `computeBranchOverviewStats()` uses. This feeds Receptionist's Students/Overview, Branch Manager's Students/Applications/Staff/Overview, and Application Officer's Applications/Status Updates — Super Admin always gets the unfiltered company-wide lists (with its own `showBranchFilter` dropdown to narrow by branch manually).
  - Notifications (the bell, shared by every role): `notifications` state ↔ `notifications` table via `src/lib/notificationsApi.ts` — the three UI actions that create a notification (`createIntakeNotification`/`createAssignmentNotification`/`createConsultationReadyNotification` in `src/notifications.ts`) now insert into Supabase too, and marking one/all read writes through. Combined with realtime, a notification created in one session appears live in another session's bell.
  - `supabase/` has one SQL file per data domain (`counselor.sql`, `receptionist.sql`, `application_officer.sql`, `branch_manager.sql`, `staff.sql`, `super_admin.sql`, `notifications.sql`), each with schema + realtime setup — run each in the Supabase SQL Editor as that area comes online. `src/lib/supabaseClient.ts` reads `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` from a local `.env` (see `.env.example`) — without them the app logs a warning and those lists load empty. Seed data is commented out (`/* ... */`) everywhere except `branch_manager.sql`'s `branch_stats` and `activity_feed` tables, which stay seeded since nothing in the app writes to them (view-only).
  - **Realtime**: `students`, `counselors`, `counselor_students`, `applications`, `branch_stats`, `activity_feed`, `staff`, `branches` and `notifications` are all added to the `supabase_realtime` publication in their SQL files and subscribed to via `src/lib/realtimeSubscribe.ts` — any INSERT/UPDATE/DELETE on those tables (from this app, another open session, or a direct database edit) re-fetches and pushes live to every open session, not just the one that made the change.
- Originally scaffolded via [Bolt](https://bolt.new) (see `.bolt/config.json`, `.bolt/prompt`) — project convention is to use the `@/` import alias for `src/` and to keep UI production-quality (Tailwind + lucide-react only, no extra UI libs unless necessary)

## How it works

`src/App.tsx` is the single stateful root: it holds all app data (students, counselor students, applications, staff, branches, commissions) in `useState`, seeded from `src/mockData.ts`, and passes handlers down as props — there is no router, context, or global store. Navigation is a simple `activeKey` string switched in `renderPage()`.

- **Auth**: `Login.tsx` checks the entered email/password against the live `staff` table (no role picker — the role/branch/name come from whichever `StaffMember` row matches). A match must also have `status: 'Active'`; otherwise login is rejected with an inline error. `StaffMember` (`src/types.ts`) carries the `password` field, set when a Super Admin or Branch Manager adds a staff member via `StaffManagement.tsx`'s "Add Staff" form — that form only creates Receptionist/Counselor/Application Officer/Branch Manager rows, so Super Admin/Marketing/Finance accounts have no in-app creation flow and must be inserted directly in Supabase (see the bootstrap example in `supabase/staff.sql`). `STAFF_ROLE_TO_ROLE` (`src/mockData.ts`) maps a `StaffMember`'s Title-Case `role` to the app's internal snake_case `Role`. Both the Add Staff form and `Login.tsx` validate email/password format against the same shared regexes (`EMAIL_PATTERN`, `PASSWORD_PATTERN` — 9–15 characters, at least one letter and one number — in `src/validation.ts`). Passwords are still stored and compared in plaintext (no hashing, no Supabase Auth) — fine for this mock-data demo, not production-ready.
- **Special route**: visiting `/intake` renders `NewIntakeForm` standalone (outside the dashboard shell), presumably meant as a public-facing intake form.
- **Roles** (`src/types.ts`): `super_admin`, `marketing`, `finance`, `branch_manager`, `receptionist`, `counselor`, `application_officer`. Each role gets a distinct nav menu (`NAV_CONFIG` in `mockData.ts`) and a distinct overview page.
- **Data model** (`src/types.ts`): `IntakeStudent` → `CounselorStudent` (consultation status/notes) → `ApplicationRecord` (status history: Preparation → Lodgement → Success/Refused) → `CommissionRecord`. Also `StaffMember` and `Branch`.
- **Notifications**: `AppNotification` (`src/types.ts`) is live Supabase state (`notifications` in `App.tsx`, fetched from the `notifications` table with realtime). Three UI actions create them via factories in `src/notifications.ts`, then insert into Supabase — submitting New Intake (`createIntakeNotification`, role-scoped to receptionists at that branch), confirming an assignment in `AssignCounselorModal` (`createAssignmentNotification`, targeted at that one named counselor), and setting a completed consultation's outcome to "Proceeding" in `StudentDetailDrawer` (`createConsultationReadyNotification`, scoped to application officers at *the completing counselor's own branch* — `handleUpdateCounselorStudent` has no link back to the original `IntakeStudent`'s branch, so it falls back to `user.branch`). `NotificationBell.tsx` (rendered in `DashboardShell.tsx`'s header) filters the full list per-viewer via `isNotificationVisibleTo`.
- **Branch namespace mismatch**: `MOCK_USERS`/`MOCK_STAFF` branches (`Parramatta`, `Sydney CBD`, `Head Office`) are a *role/login* namespace, separate from the six *company branch entities* in `MOCK_BRANCHES` (`Chitwan`, `Butwal`, `Kamaladi`, `New Baneshwor`, `Putalisadak`, `Kumaripati`). `MOCK_STUDENTS` branches were realigned to the six real branch names; most of `MOCK_APPLICATIONS` is intentionally tagged `Sydney CBD` (for the Application Officer/Branch Manager Overview pages, which are scoped to that role-namespace branch), with a few entries (`a8`–`a10`) tagged to real branch names so the Super Admin's cross-branch "Branches Needing Attention" panel has real signal. A live-triggered branch-scoped notification won't always visibly reach a demo account in the other namespace — a data-seeding artifact, not a notification-logic bug.

## Structure

```
src/
  App.tsx                 # root state + routing switch
  types.ts                # shared domain types
  mockData.ts             # seed data, nav config, role→user map
  counselorStatus.ts      # shared availability badge + sort logic for counselors (no caseload cap)
  validation.ts           # shared email regex + isValidEmail()
  dateFilter.ts           # shared matchesDateRange() for date-range filters
  dateTime.ts             # shared parseSubmittedAt() / dateKey() / formatWait()
  applicationHistory.ts   # shared parseHistoryDate() / daysInCurrentStatus() / latestStatusHistoryDate() for ApplicationRecord.statusHistory
  branchLiveStats.ts      # computeBranchLiveStats() — per-branch staff/student/application counts, computed live
  notifications.ts        # notification factories, formatRelativeTime(), isNotificationVisibleTo()
  lib/
    supabaseClient.ts      # Supabase client, initialized from VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY
    counselorStudentsApi.ts # fetch/update counselor_students table (camelCase <-> snake_case mapping)
    studentsApi.ts          # fetch/insert/update students table (camelCase <-> snake_case mapping)
    counselorsApi.ts        # fetch counselors table (read-only)
    applicationsApi.ts      # fetch/update applications table (camelCase <-> snake_case mapping)
    staffApi.ts              # fetch/insert/update/delete staff table
    branchesApi.ts           # fetch/insert/update/delete branches table (camelCase <-> snake_case mapping)
    notificationsApi.ts      # fetch/insert notifications table, mark one/many read
    realtimeSubscribe.ts     # subscribeToTable() — INSERT/UPDATE/DELETE -> re-fetch, for live cross-session sync
  components/
    Login.tsx              # fake role-picker login
    DashboardShell.tsx      # sidebar/topbar layout wrapper — renders NotificationBell
    NotificationBell.tsx    # shared bell + dropdown, used by all roles
    OverviewPage.tsx / BranchManagerOverview.tsx / SuperAdminOverview.tsx / ReceptionistOverview.tsx / CounselorOverview.tsx
    AllBranches.tsx         # branch CRUD (add branch)
    NewIntakeForm.tsx       # public intake form (/intake route)
    StudentList.tsx / StudentDetailDrawer.tsx / AssignCounselorModal.tsx
    MyStudents.tsx / ConsultationsPage.tsx
    ApplicationsList.tsx / ApplicationDetailDrawer.tsx / StatusUpdatesKanban.tsx
    CommissionsPage.tsx
    StaffManagement.tsx
    ReportsPage.tsx
    ComingSoon.tsx          # placeholder for unbuilt nav items
```

~3,950 lines of TypeScript/TSX across 23 files, all in `src/` (flat components directory, no nested feature folders).

## Scripts

- `npm run dev` — Vite dev server
- `npm run build` — production build
- `npm run lint` — ESLint (flat config, `eslint.config.js`)
- `npm run typecheck` — `tsc --noEmit`
- `npm run preview` — preview a production build

## Notable gaps / likely next steps

- Partial backend: most data is live via Supabase (see Stack above), but commissions and partners still reset on page reload (in-memory `useState` only, not yet wired).
- No routing library: page/view switching is manual `activeKey` string matching, and `/intake` detection is a raw `window.location.pathname` check.
- Login checks real credentials against the `staff` table, but there's still no real authentication/authorization layer: no Supabase Auth, no password hashing, no session/token — just a plaintext-password lookup gated by RLS policies that allow the anon key to read/write `staff` freely.
- Several nav items likely render `ComingSoon` (placeholder) — check `NAV_CONFIG` vs. `renderPage()` in `App.tsx` for which keys aren't implemented yet.
- No test setup (no test runner/config present).
