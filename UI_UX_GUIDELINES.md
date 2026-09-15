# UI/UX Guidelines

This is the design reference for the CSC Global Management Portal. It documents the patterns already in use across the app so new pages and features stay visually and behaviorally consistent. When adding something new, look here first — and if you establish a new pattern, add it here too.

## Design tokens

Defined in `tailwind.config.js`:

| Token | Value | Use |
|---|---|---|
| `navy` | `#16283D` | Primary brand color — sidebar, primary buttons, headings, active states |
| `navy-light` | `#3B5A78` | Hover state for navy elements, active nav item background |
| `navy-dark` | `#0F1C2E` | Modal/drawer backdrop (`bg-navy-dark/50`) |
| `grey-bg` | `#F9FAFB` | Page background, subtle recessed panels (info boxes inside drawers) |
| `grey-border` | `#E5E7EB` | All hairline borders — cards, table dividers, inputs |

Font: **Inter** (loaded in `index.css`), fallback `IBM Plex Sans, system-ui, sans-serif`.

Beyond these, use plain Tailwind grays/greens/oranges/reds/blues/purples as described below — don't invent new custom colors without adding them to `tailwind.config.js`.

## Layout shell

- `DashboardShell.tsx` is the only page frame. It's `h-screen overflow-hidden`, with a sidebar that is **always `fixed`** to the viewport (never let it sit in normal flow — that lets it stretch with page content, which is a bug we've hit before). Content sits in a `flex-1 flex flex-col lg:ml-64` column so it clears the fixed sidebar on desktop.
- Only `<main>` scrolls (`overflow-y-auto`); the sidebar and top header stay put.
- Page content root is always `<div className="space-y-5">` (or `space-y-6` for overview/dashboard-style pages with a welcome banner) — vertical rhythm between sections is consistent at 5–6.

## Reusable component classes (`index.css`)

- `.stat-card` — white card, `rounded-xl border-grey-border p-6`, hover shadow. Use for dashboard metric tiles and summary tiles at the top of list pages.
- `.nav-item` / `.nav-item-active` / `.nav-item-inactive` — sidebar nav buttons.
- `.role-badge` — navy pill badge for the user's role in the top bar.
- `.animate-fade-in` — used for toasts sliding in from the bottom.

## Status, type & badge colors

Badges are always `text-xs font-medium px-2.5 py-1 rounded-full` (or `px-2 py-0.5` in tighter mobile cards). Color meaning is consistent across the whole app — reuse it, don't invent new mappings for the same concepts:

| Meaning | Classes |
|---|---|
| Success / Complete / Paid / Active / Free (capacity) | `bg-green-100 text-green-700` |
| Pending / In Progress / Awaiting / Receivable | `bg-orange-100 text-orange-700` |
| Refused / Busy (at capacity) / destructive | `bg-red-100 text-red-700` |
| New / informational / secondary role | `bg-blue-100 text-blue-700` |
| Special category tag (e.g. Branch Manager, University) | `bg-purple-100 text-purple-700` |
| Primary / default / lodged | `bg-navy text-white` |

## Chips vs. buttons

- **Segmented filters** (status/type filters above a list, e.g. All/New/Assigned): a grouped pill-bar — `flex gap-1 bg-white border border-grey-border rounded-lg p-1`, each option `px-3 py-1.5 rounded-md text-sm font-medium`, active = `bg-navy text-white`, inactive = `text-gray-500 hover:text-navy hover:bg-grey-bg`.
- **Toggle chips inside a form** (e.g. partner Type, commission Receivable/Received): small individual rounded-full pills, not full-width buttons — `px-4 py-1.5 rounded-full border text-sm font-medium`, active fills with a semantic color (see badge table above) + matching border, inactive is `border-grey-border text-gray-500 hover:bg-grey-bg`. Never make these `flex-1`/full-width — that's a modal-era pattern we moved away from.
- **Removable tag chips** (e.g. course list): `inline-flex items-center gap-1.5 bg-grey-bg text-navy text-xs font-medium px-2.5 py-1 rounded-full` with a small `X` button inside.

## Buttons

- **Primary action** (Add X, Save Changes, Submit): `bg-navy text-white font-semibold rounded-lg hover:bg-navy-light transition-colors active:scale-[0.98]`.
- **Secondary / Cancel**: `border border-grey-border rounded-lg text-navy font-medium hover:bg-grey-bg`.
- **Destructive** (Delete/Remove confirm): `bg-red-600 text-white hover:bg-red-700`.
- **Inline text action** (Edit/Assign/Remove links in a table row): icon + label, no border/background, `text-sm font-medium text-navy hover:text-navy-light` (or `text-red-500 hover:text-red-600` for destructive row actions).
- Icons come from `lucide-react` only. Size 15–16px for inline/row actions, 18–24px for nav/header icons.

## Lists: table (desktop) + cards (mobile)

Every list page follows the same responsive split — never build a table-only or card-only list page:

```
<div className="hidden lg:block ..."><table>...</table></div>
<div className="lg:hidden space-y-3">{items.map(card)}</div>
```

- Desktop table: white card wrapper `rounded-xl border-grey-border overflow-hidden`, header row `bg-grey-bg`, `text-xs font-semibold text-gray-500`, body rows `border-b border-grey-border last:border-0 hover:bg-grey-bg/50`.
- Mobile cards: `bg-white rounded-xl border border-grey-border p-4`, primary line bold navy, secondary line `text-xs text-gray-400`.
- Empty state (both breakpoints): `py-12 text-center text-sm text-gray-400`, one line, no icon needed for a simple "No X found."

## Modals vs. drawers — when to use which

This distinction matters and is now consistent across the app:

- **Modal** (centered, `fixed inset-0 flex items-center justify-center p-4`, card `max-w-md rounded-2xl shadow-xl p-6`): use for **creating something new** (Add Branch, Add Staff, Add Partner, Add University) and for **confirmation dialogs** (delete, logout). These are short-lived, single-purpose interactions.
- **Drawer** (slide-in from the right, `fixed inset-0 flex justify-end`, panel `w-full sm:max-w-md bg-white shadow-2xl h-full`): use for **viewing or editing an existing record's details** (Branch detail, Staff detail, Student detail, Application detail, Edit Partner, Edit Commission). Drawers keep context (you can see it's *this specific record*) and support longer content without feeling cramped.
- Both share the same dimmed backdrop: `absolute inset-0 bg-navy-dark/50 backdrop-blur-sm`, closable by clicking it.
- **Drawer layout is a fixed 3-row flex column, not one scrolling block**: the panel itself is `flex flex-col h-full` — header `flex-shrink-0`, a middle content region `flex-1 overflow-y-auto`, and (if there are actions) a footer `flex-shrink-0 border-t border-grey-border px-5 py-4`. Only the middle region scrolls; header and action buttons always stay pinned in view, however long the content gets. Do **not** put `overflow-y-auto` on the outer panel itself with a `sticky top-0` header — that was the old pattern and it lets the action buttons scroll out of view on longer forms.
- A drawer's header: `flex items-center justify-between px-5 py-4 border-b border-grey-border flex-shrink-0`, with an icon + title on the left and a close `X` on the right.
- A drawer's action footer (Save/Cancel, or a standalone action) sits in that same `flex-shrink-0` bottom row, pinned to the bottom of the viewport regardless of scroll position.
- If a detail drawer supports deletion, the delete action also lives in that pinned footer, below the Save/Cancel row, as its own outlined red button (`border-red-200 text-red-600 hover:bg-red-50`) — not mixed into the Save/Cancel row. See `AllBranches.tsx` and `PartnersPage.tsx`.

## Confirmation dialogs

Any destructive or session-ending action (delete branch/staff/partner, logout) gets a confirmation modal, never fires immediately on click:

```
icon in a colored rounded-xl circle (red-50/red-500 for destructive, navy/5 + navy for neutral like logout)
centered title: "Delete X?" / "Log out?"
one line of consequence text
[Cancel] [Confirm] — Cancel is the bordered/neutral button, Confirm is red (destructive) or navy (neutral)
```

## Forms

- Every field: `<label className="block text-sm font-medium text-navy mb-1.5">` then a full-width input `px-4 py-2.5 border border-grey-border rounded-lg text-sm focus:outline-none focus:border-navy-light focus:ring-1 focus:ring-navy-light`.
- Icon-prefixed inputs (search, contact fields): icon absolutely positioned `left-3.5 top-1/2 -translate-y-1/2 text-gray-400`, input gets `pl-10`.
- When a form is used for both **Add** and **Edit** (e.g. Partners), extract the shared fields into one sub-component and drive the two entry points (modal for add, drawer for edit) from the same field component — don't duplicate the JSX.
- A read-only "context" block at the top of an edit form (e.g. student/branch/consultant on the Commission edit drawer) is a grey recessed panel: `bg-grey-bg rounded-xl p-4 space-y-2`.

## Toasts

Bottom-centered, auto-dismissing after ~2.5s: `fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] bg-green-600 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 text-sm font-medium animate-fade-in`. Always paired with a checkmark icon. Used for successful add/update/delete actions — not for errors (there's no error-toast pattern yet; form validation relies on native `required`/`type` HTML validation).

## Search & filter bar

Standard header row above any list: `flex flex-col sm:flex-row gap-3` containing (in order) a search input (`flex-1`, icon-prefixed, with a clear `X` when non-empty), then any segmented filter chip-bar, then the primary "Add X" button pinned to the right on desktop (wraps below on mobile).

## Responsive rules

- `lg` (1024px) is the one breakpoint that matters for layout switches (sidebar fixed vs. drawer-over-content, table vs. card list). Don't introduce new custom breakpoints.
- Side gutters and stacking below `lg` are handled by the existing flex/grid + `flex-col sm:flex-row` patterns — follow the nearest existing page rather than inventing new responsive logic.

## Icons

`lucide-react` only, per the project's `.bolt/prompt` convention. Pick one icon per concept and reuse it everywhere that concept appears (e.g. `Landmark` for partners/universities, `Trash2` for delete, `Edit` for edit, `Building2` for branches, `GraduationCap` for students). Check `DashboardShell.tsx`'s `ICON_MAP` before introducing a new nav icon.
