# Product Architecture — Digital Invitations & Event Guest Management

> **Status:** Living document  
> **Last updated:** July 2026  
> **Purpose:** Guide next development steps for a **managed SaaS** (not self-serve signup)

---

## 1. Product overview

### What the platform does

A **white-label / managed** platform for digital wedding and event invitations. The platform owner (you) sells packages, sets up each client manually, and delivers:

- A **public invitation page** (shareable link)
- An **RSVP form** for guests (no login)
- A **private client dashboard** with RSVP stats, guest list, and seating plan

Clients do not self-register. You control onboarding, billing, and account creation.

### Who uses it

| Actor | Description |
|-------|-------------|
| **Platform owner (you)** | Sales, onboarding, Supabase user/event setup, support |
| **Client / organizer** | Couple or event host; logs in to view stats and manage seating |
| **Guest** | Invitee; opens public link, submits RSVP only |

### Problem it solves

- Replaces paper invitations + manual RSVP tracking (phone, WhatsApp, spreadsheets)
- Gives organizers a single place to see who is coming and assign seats
- Keeps **your** business model simple: sell packages, deliver turnkey setup, no open signup abuse

---

## 2. User roles

### Platform owner / admin

- Creates Supabase Auth users for paying clients
- Creates events and assigns `user_id`
- Sends login credentials + links to client
- (Later) Manages packages, billing notes, client profiles
- Does **not** use the public app as a typical “super admin UI” in MVP — work happens in Supabase Dashboard + optional internal admin tools later

### Client / organizer

- Logs in with email/password (login only)
- Sees **only** events where `events.user_id = auth.uid()`
- Views RSVP stats, guest list, seating
- (MVP) May create additional events if allowed by package; (managed model) often only one event per client initially

### Guest

- No account
- Opens `/[slug]` public invitation URL
- Submits name + going / not going
- Cannot see dashboard or other guests’ data

---

## 3. Core user flows

### A. Visitor flow (landing → inquiry)

```
Landing (/) → Pricing (/pricing) → Contact / Pay (external: email, Stripe link, form)
     → You receive inquiry
```

- No signup on the site
- CTA: “Choose package” / “Contact us” / “Pay now”
- Package choice stored manually (spreadsheet/CRM) until `packages` table is built

### B. Admin flow (after client pays)

```
1. Create Auth user in Supabase (Authentication → Users → Add user)
2. Disable public signup (Auth → Providers → Email → sign ups OFF)
3. Create event row (name, slug, user_id = client UUID)
4. Optional: create tables, seed guest list if client provided names
5. Send client:
   - Login URL: /login
   - Email + temporary password
   - Public invitation URL: /{slug}
6. Client changes password (optional, via Supabase reset email if enabled)
```

### C. Client login flow

```
/login → email + password → Supabase Auth session
     → redirect /dashboard
     → fetch events WHERE user_id = current user
```

- Unauthenticated access to `/dashboard` → redirect `/login`
- Logged-in user on `/login` → redirect `/dashboard`

### D. Guest RSVP flow

```
Guest opens /{slug}
     → load event by slug (public read)
     → RSVP form (name, going / not going)
     → insert into guests (event_id, name, status)
     → thank-you message
```

- Guests never authenticate
- Same slug must map to exactly one event

### E. Seating management flow (client)

```
/dashboard → select event
     → view going guests + tables
     → drag guest → drop on table (or assign via UI)
     → update guests.table_id in Supabase
     → capacity enforced in UI
```

---

## 4. Pages / routes structure

### Current (built)

| Route | Access | Purpose |
|-------|--------|---------|
| `/` | Public | Default Next.js home (replace with landing) |
| `/login` | Public | Email/password login only |
| `/dashboard` | Authenticated | Events list, create event, stats, seating (monolithic MVP) |
| `/[slug]` | Public | Invitation + RSVP |
| `/test/events` | Public | Dev/test page (remove before production) |

### Planned (recommended evolution)

| Route | Access | Purpose |
|-------|--------|---------|
| `/` | Public | Marketing landing |
| `/pricing` | Public | 3 packages, CTAs to contact/pay |
| `/contact` | Public | Optional inquiry form |
| `/login` | Public | Login only |
| `/dashboard` | Auth | Overview: client’s events summary |
| `/dashboard/events` | Auth | List events (if multi-event clients) |
| `/dashboard/events/[eventId]` | Auth | Event detail, RSVP stats |
| `/dashboard/events/[eventId]/guests` | Auth | Guest list, export (later) |
| `/dashboard/events/[eventId]/seating` | Auth | Tables + drag-and-drop |
| `/[slug]` | Public | Public invitation + RSVP |

**Note:** Today everything lives on `/dashboard` in one page. Splitting into nested routes is a **next refactor**, not required for MVP if single-page dashboard works for clients.

---

## 5. Database architecture

### Current tables (implemented)

#### `events`

| Column | Type | Notes |
|--------|------|-------|
| `id` | bigint (identity) | PK |
| `name` | text | Display name |
| `slug` | text | Unique URL segment, e.g. `ana-marko-2026` |
| `user_id` | uuid | FK → `auth.users.id`, **client owner** |

Recommended additions (later):

| Column | Purpose |
|--------|---------|
| `package_id` | FK → `packages` |
| `event_date` | Event datetime |
| `venue` | Location text |
| `description` | Invitation copy |
| `is_published` | Hide slug until ready |
| `created_at` | Audit |

#### `guests`

| Column | Type | Notes |
|--------|------|-------|
| `id` | bigint | PK |
| `event_id` | bigint | FK → `events.id` |
| `name` | text | Guest name |
| `status` | text | `going`, `not_going`, (optional `pending`) |
| `table_id` | bigint | FK → `tables.id`, nullable |

Recommended additions (later):

| Column | Purpose |
|--------|---------|
| `email` | Optional contact |
| `plus_one` | Count or boolean |
| `dietary_notes` | Premium feature |
| `rsvp_at` | Timestamp |
| `updated_at` | Track changes |

#### `tables`

| Column | Type | Notes |
|--------|------|-------|
| `id` | bigint | PK |
| `event_id` | bigint | FK → `events.id` |
| `name` | text | e.g. “Table 1” |
| `capacity` | integer | Max seats |
| `created_at` | timestamptz | Optional |

---

### Recommended new tables (not built yet)

#### `packages`

Commercial tiers you sell on `/pricing`.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid / bigint | PK |
| `slug` | text | `basic`, `rsvp`, `premium` |
| `name` | text | Display name |
| `price_cents` | integer | Optional |
| `max_guests` | integer | Limit per event |
| `seating_enabled` | boolean | Premium |
| `features` | jsonb | Feature flags |

#### `client_profiles` (optional)

Extra data not stored on Auth user.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | PK = `auth.users.id` |
| `full_name` | text | |
| `phone` | text | |
| `company_name` | text | For corporate events |
| `package_id` | uuid | Current package |
| `notes` | text | Internal admin notes |
| `onboarded_at` | timestamptz | |

No separate relationship table needed for MVP: **`events.user_id`** is the main client ↔ event link.

### Entity relationships

```
auth.users (1) ──< (N) events
events (1) ──< (N) guests
events (1) ──< (N) tables
tables (1) ──< (N) guests   [via guests.table_id]
packages (1) ──< (N) events [later, optional]
```

---

## 6. Authentication model

### Principles

- **No public signup** — no `/signup`, no `signUp()` in app
- **Login only** — `/login` with `signInWithPassword`
- **Manual user creation** — Supabase Dashboard → Authentication → Users → Add user (Auto Confirm ON)
- **Session** — Supabase SSR cookies via `@supabase/ssr`, middleware refreshes session
- **Event ownership** — `events.user_id` = client’s `auth.users.id`

### Guests

- No Auth accounts
- Public RSVP uses **anon** key + RLS policies allowing insert (and limited select if needed) on `guests` for matching `event_id`

### Supabase Auth settings (production checklist)

- [ ] Disable “Enable sign ups” on Email provider
- [ ] Enable email provider for password login
- [ ] Optional: enforce strong passwords
- [ ] Optional: email confirmation OFF for admin-created users (use Auto Confirm)

---

## 7. Authorization and data security

### Client dashboard

- Middleware + layout: unauthenticated → `/login`
- All dashboard queries: `events.user_id = auth.uid()`
- Guests/tables: filter by `event_id IN (client’s event ids)` — **already in app code**
- Server actions: verify ownership before insert/update (create table, assign guest)

### Public RSVP

- Read event by `slug` (public)
- Insert guest row with `event_id` for that event only
- Must **not** expose other events or full guest lists publicly

### RLS policy strategy

| Table | anon | authenticated (client) |
|-------|------|------------------------|
| `events` | SELECT by slug only (public page) OR via service role | SELECT/INSERT/UPDATE/DELETE own rows (`user_id = auth.uid()`) |
| `guests` | INSERT for RSVP; no broad SELECT | SELECT/UPDATE guests for own events only |
| `tables` | No access | CRUD for own events only |

**Current state:** Mix of permissive dev policies (`using (true)`) and newer scoped policies in migrations. **Before production:** audit all policies, remove overly permissive anon SELECT on dashboard data.

### Security rules (non-negotiable)

1. Client never sees another client’s events
2. Guest cannot access `/dashboard`
3. Slug must not leak sequential IDs or private data
4. Service role key only on server, never in browser
5. Remove `/test/events` before deploy

---

## 8. MVP vs later features

### Already built ✅

- Next.js App Router + Supabase connection
- `events`, `guests`, `tables` tables
- Event creation on dashboard
- Public RSVP page `/[slug]`
- RSVP stats (going / not going / pending)
- Seating: create tables, assign guests, drag-and-drop
- Login-only auth (`/login`, no signup)
- Protected `/dashboard`
- Events filtered by `user_id`
- Logout button
- Guest/table data scoped to client’s events (app layer + partial RLS)

### Next priority 🔜

1. **Production RLS audit** — replace permissive policies
2. **Landing page (`/`)** — value prop, package teaser, CTA
3. **Pricing page (`/pricing`)** — 3 packages, contact/pay links
4. **Remove test routes** — `/test/events`
5. **Admin onboarding checklist** — internal doc or Notion for manual client setup
6. **Split dashboard routes** — optional refactor to `/dashboard/events/[eventId]/...`
7. **Assign existing events to clients** — SQL/script for `user_id` backfill
8. **Error/empty states** — no events, no guests, full table

### Later / pro features 📦

- `packages` table + feature flags per client
- `client_profiles` + CRM notes
- Custom invitation themes / templates
- Email reminders to guests
- Guest import (CSV)
- Export guest list / seating PDF
- Plus-one and dietary fields
- Multi-event per client with package limits
- Admin panel (internal UI instead of Supabase Dashboard)
- Stripe integration for payments
- Custom domains per invitation
- Analytics (page views, RSVP conversion)
- i18n (HR/EN)

---

## 9. Package structure (commercial)

### Package 1 — Basic digital invitation

- Public invitation page (`/{slug}`)
- Event details (names, date, location — when added)
- Shareable link
- **No RSVP** or RSVP disabled
- **Price positioning:** Entry tier

### Package 2 — RSVP

- Everything in Basic
- Guest RSVP (going / not going)
- Client dashboard: live RSVP counts + guest list
- Email support for setup
- **Price positioning:** Core tier (likely best seller)

### Package 3 — Premium (RSVP + seating)

- Everything in RSVP
- Table management + capacity
- Drag-and-drop seating plan
- Higher guest/table limits
- Priority setup + optional custom styling
- **Price positioning:** Premium / weddings

**Implementation mapping:**

| Feature | Basic | RSVP | Premium |
|---------|-------|------|---------|
| Public page | ✅ | ✅ | ✅ |
| RSVP form | ❌ | ✅ | ✅ |
| Dashboard stats | ❌ | ✅ | ✅ |
| Seating | ❌ | ❌ | ✅ |

Enforcement later via `packages.seating_enabled`, `max_guests`, and UI hiding.

---

## 10. Implementation roadmap

Starting from **current state** (auth + dashboard + RSVP + seating working).

| Step | Task | Status |
|------|------|--------|
| **1** | Login-only auth (`/login`, no signup) | ✅ Done |
| **2** | `events.user_id` ownership column + insert on create | ✅ Done |
| **3** | Protect `/dashboard` (middleware + layout) | ✅ Done |
| **4** | Client-only data filtering (events, guests, tables) | ✅ Done (app); RLS partial |
| **5** | Admin manual workflow doc + Supabase checklist | 🔜 Next |
| **6** | RLS/security hardening for production | 🔜 Next |
| **7** | Landing (`/`) + pricing (`/pricing`) pages | 🔜 Planned |
| **8** | Deploy (Vercel + env vars + domain) | 🔜 Planned |

### Step 5 detail — Admin manual workflow

Document for yourself (can live in this repo as `ADMIN_RUNBOOK.md` later):

1. Receive payment / signed contract  
2. Create Auth user (Auto Confirm)  
3. Run SQL or use dashboard to create event with `user_id`  
4. Test `/login` and `/{slug}`  
5. Send credentials + links to client  
6. Optional: set `package_id` when table exists  

### Step 6 detail — RLS hardening

Run and verify migrations:

- `20260319240000_events_user_id_auth.sql`
- `20260319250000_scoped_guests_tables_rls.sql`
- Replace anon `using (true)` SELECT on sensitive tables where possible
- Public RSVP: narrow INSERT policy `WITH CHECK (event_id = ...)` if using RPC, or keep slug-validated server action

### Step 7 detail — Marketing pages

- Replace default `/` with landing
- Add `/pricing` with 3 packages → mailto / Calendly / Stripe Payment Link
- No auth, no database writes

### Step 8 detail — Deploy

- Vercel project linked to repo
- Env: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Do **not** expose `SUPABASE_SERVICE_ROLE_KEY` unless needed server-side
- Custom domain for marketing; subpath or subdomain for app
- Remove `/test/events`

---

## 11. Cursor implementation strategy

### How to build the next features

1. **One feature at a time** — e.g. only pricing page, or only RLS migration, not both in one PR  
2. **Small commits** — easy to revert if RSVP/seating breaks  
3. **Test after each change** — manual checklist:
   - Guest RSVP on `/{slug}` still works
   - Client login → sees only own events
   - Drag seating still saves `table_id`
   - Logout → cannot access dashboard  
4. **Do not rewrite working RSVP/seating** unless required for security or routing refactor — extend instead  
5. **Prefer server actions + RLS** over client-only filtering for security  
6. **Migrations in `supabase/migrations/`** — always add SQL file + note in runbook what to run in Supabase SQL Editor  
7. **Ask mode for planning, Agent mode for implementation** — use this document as source of truth  

### Suggested next Cursor tasks (in order)

1. Create `ADMIN_RUNBOOK.md` (manual client setup)  
2. Audit & apply production RLS SQL  
3. Build `/` landing page  
4. Build `/pricing` page  
5. Refactor dashboard into nested routes (optional)  
6. Add `packages` table + feature gating (when selling tiers in app)  
7. Deploy to Vercel  

---

## Appendix A — Supabase checklist (what you must configure)

If something does not work, verify in Supabase Dashboard:

| Item | Where | Action |
|------|-------|--------|
| Auth users | Authentication → Users | Manually add clients |
| Signup disabled | Auth → Providers → Email | Turn OFF sign ups |
| `user_id` column | SQL Editor | Migration `events_user_id_auth` |
| RLS policies | SQL Editor | Run all migrations in order |
| Assign old events | SQL Editor | `UPDATE events SET user_id = '...'` |
| Anon RSVP insert | SQL Editor | `guests_insert_public` policy |
| Tables/guests read for client | SQL Editor | scoped authenticated policies |

---

## Appendix B — Environment variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
# Optional server-only (avoid if possible):
# SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
```

---

## Appendix C — Glossary

| Term | Meaning |
|------|---------|
| **Slug** | URL-safe event identifier, e.g. `/ana-marko-2026` |
| **Client** | Paying organizer with login |
| **Guest** | Invite recipient, no login |
| **Managed SaaS** | You onboard clients manually; no open registration |
| **RLS** | Row Level Security in Postgres / Supabase |

---

*This document should be updated when routes, tables, or business rules change. Do not treat it as auto-generated from code — keep it aligned with product decisions.*
