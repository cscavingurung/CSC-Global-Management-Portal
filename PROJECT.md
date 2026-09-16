# CSC Global Management Portal

A role-based management portal for an education/visa consultancy (branded "CSC Global" at login, with sample data referencing "Everest Visa"). It tracks students end-to-end: intake → counselor assignment → consultation → visa application → status → commissions, across multiple branches.

## Stack

- **React 18** + **TypeScript**, built with **Vite 5**
- **Tailwind CSS 3** for styling, **lucide-react** for icons
- **@supabase/supabase-js**: most roles are wired to live Supabase tables — remaining static bits (commissions, partners) still run on in-memory mock data.
  - Counselor: `counselorStudents` state (Assigned/Upcoming Students, Consulted Students, Overview) ↔ `counselor_students` table, via `src/lib/counselorStudentsApi.ts`.
  - Receptionist: `students` state (New Intake, Students list, Assign Counselor, Overview) ↔ `students` table via `src/lib/studentsApi.ts`; the counselor roster (`counselors` state — availability/assigned-count shown on Assign Counselor and Overview) ↔ `counselors` table via `src/lib/counselorsApi.ts` (read-only from the app).
  - Application Officer: `applications` state (Overview, Applications list, Status Updates) ↔ `applications` table via `src/lib/applicationsApi.ts` (`statusHistory` stored as a `jsonb` column) — also read by other roles' Applications views and the Counselor's "My Students' Applications" panel, since it's the same shared state.
  - Branch Manager Overview: the four stat cards ↔ `branch_stats` table (one row per branch) and "Today's Activity" ↔ `activity_feed` table, both via `src/lib/branchOverviewApi.ts`; the "Needs Attention" panel is already covered by the students/counselors/applications tables above.
  - Super Admin Overview: the same four stat cards (Total Students This Month / Active Consultations / Applications In Progress / Decided This Month) as Branch Manager, but company-wide — `fetchAggregatedBranchStats()` sums every real branch's `branch_stats` row (matched against the live `branches` state's names, excluding the `Sydney CBD` role-namespace row). `branch_stats` is seeded with a row per real branch in `branch_manager.sql` for this reason. The Branch Performance Comparison table and the "All Branches" page (add/delete, plus manager auto-assignment when a Branch Manager is added/removed in Staff) ↔ `branches` table via `src/lib/branchesApi.ts`.
  - Staff (shared by Super Admin and Branch Manager): `staff` state ↔ `staff` table via `src/lib/staffApi.ts`, full CRUD (add/update status/remove).
  - Notifications (the bell, shared by every role): `notifications` state ↔ `notifications` table via `src/lib/notificationsApi.ts` — the three UI actions that create a notification (`createIntakeNotification`/`createAssignmentNotification`/`createConsultationReadyNotification` in `src/notifications.ts`) now insert into Supabase too, and marking one/all read writes through. Combined with realtime, a notification created in one session appears live in another session's bell.
  - `supabase/` has one SQL file per data domain (`counselor.sql`, `receptionist.sql`, `application_officer.sql`, `branch_manager.sql`, `staff.sql`, `super_admin.sql`, `notifications.sql`), each with schema + seed data — run each in the Supabase SQL Editor as that area comes online. `src/lib/supabaseClient.ts` reads `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` from a local `.env` (see `.env.example`) — without them the app logs a warning and those lists load empty.
  - **Realtime**: `students`, `counselors`, `counselor_students`, `applications`, `branch_stats`, `activity_feed`, `staff`, `branches` and `notifications` are all added to the `supabase_realtime` publication in their SQL files and subscribed to via `src/lib/realtimeSubscribe.ts` — any INSERT/UPDATE/DELETE on those tables (from this app, another open session, or a direct database edit) re-fetches and pushes live to every open session, not just the one that made the change.
- Originally scaffolded via [Bolt](https://bolt.new) (see `.bolt/config.json`, `.bolt/prompt`) — project convention is to use the `@/` import alias for `src/` and to keep UI production-quality (Tailwind + lucide-react only, no extra UI libs unless necessary)

## How it works

`src/App.tsx` is the single stateful root: it holds all app data (students, counselor students, applications, staff, branches, commissions) in `useState`, seeded from `src/mockData.ts`, and passes handlers down as props — there is no router, context, or global store. Navigation is a simple `activeKey` string switched in `renderPage()`.

- **Auth**: `Login.tsx` is a fake login — picking a role from a dropdown logs you in as a preset `MOCK_USER` for that role (no real credential check; the entered email/password are not validated against `StaffMember` records yet). `StaffMember` (`src/types.ts`) does carry a `password` field, set when a Super Admin or Branch Manager adds a staff member via `StaffManagement.tsx`'s "Add Staff" form. Both that form and `Login.tsx` validate email/password format against the same shared regexes (`EMAIL_PATTERN`, `PASSWORD_PATTERN` — 9–15 characters, at least one letter and one number — in `src/validation.ts`), so a real password would always satisfy the login form's shape, but nothing yet actually checks the entered value against a stored `StaffMember`; that's the natural next step if real login is wired up.
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
  notifications.ts        # notification factories, formatRelativeTime(), isNotificationVisibleTo()
  lib/
    supabaseClient.ts      # Supabase client, initialized from VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY
    counselorStudentsApi.ts # fetch/update counselor_students table (camelCase <-> snake_case mapping)
    studentsApi.ts          # fetch/insert/update students table (camelCase <-> snake_case mapping)
    counselorsApi.ts        # fetch counselors table (read-only)
    applicationsApi.ts      # fetch/update applications table (camelCase <-> snake_case mapping)
    staffApi.ts              # fetch/insert/update/delete staff table
    branchOverviewApi.ts     # fetch branch_stats (per-branch and company-wide aggregate) and activity_feed (read-only)
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
- No real authentication/authorization: login is a role picker, not a credential check.
- Several nav items likely render `ComingSoon` (placeholder) — check `NAV_CONFIG` vs. `renderPage()` in `App.tsx` for which keys aren't implemented yet.
- No test setup (no test runner/config present).
