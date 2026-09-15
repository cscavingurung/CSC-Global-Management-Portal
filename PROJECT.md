# CSC Global Management Portal

A role-based management portal for an education/visa consultancy (branded "CSC Global" at login, with sample data referencing "Everest Visa"). It tracks students end-to-end: intake → counselor assignment → consultation → visa application → status → commissions, across multiple branches.

## Stack

- **React 18** + **TypeScript**, built with **Vite 5**
- **Tailwind CSS 3** for styling, **lucide-react** for icons
- **@supabase/supabase-js** is installed but not yet used anywhere in `src/` — the app currently runs entirely on in-memory mock data (no backend/auth is wired up)
- Originally scaffolded via [Bolt](https://bolt.new) (see `.bolt/config.json`, `.bolt/prompt`) — project convention is to use the `@/` import alias for `src/` and to keep UI production-quality (Tailwind + lucide-react only, no extra UI libs unless necessary)

## How it works

`src/App.tsx` is the single stateful root: it holds all app data (students, counselor students, applications, staff, branches, commissions) in `useState`, seeded from `src/mockData.ts`, and passes handlers down as props — there is no router, context, or global store. Navigation is a simple `activeKey` string switched in `renderPage()`.

- **Auth**: `Login.tsx` is a fake login — picking a role from a dropdown logs you in as a preset `MOCK_USER` for that role (no real credential check).
- **Special route**: visiting `/intake` renders `NewIntakeForm` standalone (outside the dashboard shell), presumably meant as a public-facing intake form.
- **Roles** (`src/types.ts`): `super_admin`, `marketing`, `finance`, `branch_manager`, `receptionist`, `counselor`, `application_officer`. Each role gets a distinct nav menu (`NAV_CONFIG` in `mockData.ts`) and a distinct overview page.
- **Data model** (`src/types.ts`): `IntakeStudent` → `CounselorStudent` (consultation status/notes) → `ApplicationRecord` (status history: Preparation → Lodgement → Success/Refused) → `CommissionRecord`. Also `StaffMember` and `Branch`.

## Structure

```
src/
  App.tsx                 # root state + routing switch
  types.ts                # shared domain types
  mockData.ts             # seed data, nav config, role→user map
  components/
    Login.tsx              # fake role-picker login
    DashboardShell.tsx      # sidebar/topbar layout wrapper
    OverviewPage.tsx / BranchManagerOverview.tsx / SuperAdminOverview.tsx
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

- No backend: everything resets on page reload (in-memory `useState` only); Supabase is a dependency but unintegrated.
- No routing library: page/view switching is manual `activeKey` string matching, and `/intake` detection is a raw `window.location.pathname` check.
- No real authentication/authorization: login is a role picker, not a credential check.
- Several nav items likely render `ComingSoon` (placeholder) — check `NAV_CONFIG` vs. `renderPage()` in `App.tsx` for which keys aren't implemented yet.
- No test setup (no test runner/config present).
