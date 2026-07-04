# Product Architecture — Digital Invitations & Event Guest Management

> **Status:** Living document  
> **Last updated:** July 2026  
> **Purpose:** Guide next development steps for a **managed SaaS** (not self-serve signup)

---

## 1. Product overview

### What the platform does

A **white-label / managed** platform for digital wedding and event invitations. The platform owner (you) sells **custom-quoted service tiers**, sets up each client manually after offline payment, and delivers:

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
- Keeps **your** business model simple: custom quotes via direct contact, turnkey delivery, no open signup abuse

---

## 2. User roles

### Platform owner / admin

- Creates Supabase Auth users for paying clients
- Creates events and assigns `user_id`
- Sends login credentials + links to client
- (Later) Tracks agreed service tier, internal notes, client profiles — **not** public checkout or fixed pricing
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

### A. Visitor flow (landing → custom inquiry)

```
Landing (/) → See service tiers (no fixed prices)
     → Contact you (email, phone, WhatsApp, form)
     → Direct conversation about design, features and price
     → Agreement reached manually
     → Client pays outside the app (bank transfer, invoice, etc.)
     → You onboard in Supabase (Auth user + event)
     → Client receives login + public invitation link
```

- No signup on the site
- No public pricing page or online checkout at this stage
- CTA: “Contact for offer” / “Request quote” — not “Buy now”
- Agreed package tier and price tracked manually (CRM, spreadsheet, notes) until internal tooling exists

### B. Admin flow (after agreement & payment outside app)

```
1. Agree with client on tier, design, features and price (offline)
2. Client pays outside the app (no Stripe/checkout in platform)
3. Create Auth user in Supabase (Authentication → Users → Add user)
4. Ensure public signup is disabled (Auth → Providers → Email → sign ups OFF)
5. Create event row (name, slug, user_id = client UUID, is_published when ready)
6. Optional: create tables, seed guest list if client provided names
7. Send client:
   - Login URL: /login
   - Email + temporary password
   - Public invitation URL: /{slug}
8. Client changes password (optional, via Supabase reset email if enabled)
```

See [ADMIN_RUNBOOK.md](./ADMIN_RUNBOOK.md) for the full checklist.

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
| `/` | Public | Marketing landing — service tiers, **no fixed prices**, contact CTA |
| `/contact` | Public | Optional inquiry form or contact details (can be section on `/` instead) |
| `/login` | Public | Login only |
| `/dashboard` | Auth | Overview: client’s events summary |
| `/dashboard/events` | Auth | List events (if multi-event clients) |
| `/dashboard/events/[eventId]` | Auth | Event detail, RSVP stats |
| `/dashboard/events/[eventId]/guests` | Auth | Guest list, export (later) |
| `/dashboard/events/[eventId]/seating` | Auth | Tables + drag-and-drop |
| `/[slug]` | Public | Public invitation + RSVP |

**Not a priority now:** `/pricing` (no public price list), Stripe, or any in-app payment flow.

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

#### `packages` (internal reference — not public pricing)

Service tiers for **your** sales conversations and optional future feature gating. Not displayed with fixed prices on the website at this stage.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid / bigint | PK |
| `slug` | text | `basic`, `rsvp`, `premium` |
| `name` | text | Display name (marketing copy) |
| `max_guests` | integer | Optional limit per event |
| `seating_enabled` | boolean | Premium tier |
| `features` | jsonb | Feature flags |
| `internal_notes` | text | Optional — scope, upsells, custom terms |

Price is agreed **per client offline** — no `price_cents` on public site; optional internal field later if needed for invoicing.

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

1. **Production RLS hardening** — apply production RLS SQL; remove permissive policies
2. **Marketing landing (`/`)** — value proposition, **service tiers without fixed prices**, contact CTA
3. **Contact path** — `/contact` page or prominent section on landing (email / WhatsApp / form)
4. **Remove test routes** — `/test/events`
5. **Admin onboarding** — [ADMIN_RUNBOOK.md](./ADMIN_RUNBOOK.md) (done; keep updated)
6. **Split dashboard routes** — optional refactor to `/dashboard/events/[eventId]/...`
7. **Assign / publish events** — `user_id` backfill, `is_published = true` when delivering
8. **Error/empty states** — no events, no guests, full table

**Explicitly not next priority:** public `/pricing` page, Stripe, online checkout, self-serve purchase flow.

### Later / pro features 📦

- `packages` table + feature flags per client (internal tier tracking)
- `client_profiles` + CRM notes (agreed price, payment status offline)
- Custom invitation themes / templates
- Email reminders to guests
- Guest import (CSV)
- Export guest list / seating PDF
- Plus-one and dietary fields
- Multi-event per client with tier-based limits
- Admin panel (internal UI instead of Supabase Dashboard)
- Public pricing page / online checkout / Stripe (**only if business model changes**)
- Custom domains per invitation
- Analytics (page views, RSVP conversion)
- i18n (HR/EN)

---

## 9. Service tiers (commercial — custom pricing)

Tiers describe **what you offer**, not fixed public prices. Each deal is quoted individually after direct contact.

### Tier 1 — Basic digital invitation

- Public invitation page (`/{slug}`)
- Event details (names, date, location — when added)
- Shareable link
- **No RSVP** or RSVP disabled
- **Sales note:** Entry tier; quote based on design complexity

### Tier 2 — RSVP

- Everything in Basic
- Guest RSVP (going / not going)
- Client dashboard: live RSVP counts + guest list
- Setup and support included
- **Sales note:** Core tier; most common starting point

### Tier 3 — Premium (RSVP + seating)

- Everything in RSVP
- Table management + capacity
- Drag-and-drop seating plan
- Higher guest/table limits (as agreed)
- Priority setup + optional custom styling
- **Sales note:** Full wedding / large event offering

**Feature matrix (for proposals — not a public price list):**

| Feature | Basic | RSVP | Premium |
|---------|-------|------|---------|
| Public page | ✅ | ✅ | ✅ |
| RSVP form | ❌ | ✅ | ✅ |
| Dashboard stats | ❌ | ✅ | ✅ |
| Seating | ❌ | ❌ | ✅ |

**Pricing model:** Agreed manually per client (call, email, invoice). Payment happens **outside the app**. Enforcement of tier limits in product later via `packages.seating_enabled`, `max_guests`, and UI hiding.

---

## 10. Implementation roadmap

Starting from **current state** (auth + dashboard + RSVP + seating working).

| Step | Task | Status |
|------|------|--------|
| **1** | Login-only auth (`/login`, no signup) | ✅ Done |
| **2** | `events.user_id` ownership column + insert on create | ✅ Done |
| **3** | Protect `/dashboard` (middleware + layout) | ✅ Done |
| **4** | Client-only data filtering (events, guests, tables) | ✅ Done (app); RLS partial |
| **5** | Admin manual workflow ([ADMIN_RUNBOOK.md](./ADMIN_RUNBOOK.md)) | ✅ Done |
| **6** | RLS/security hardening for production | 🔜 Next |
| **7** | Marketing landing (`/`) + contact CTA — **no public pricing/checkout** | 🔜 Planned |
| **8** | Deploy (Vercel + env vars + domain) | 🔜 Planned |

### Step 5 detail — Admin manual workflow

See [ADMIN_RUNBOOK.md](./ADMIN_RUNBOOK.md):

1. Receive inquiry → agree on tier, design, features and **custom price**  
2. Client pays **outside the app**  
3. Create Auth user (Auto Confirm)  
4. Create event with `user_id`; set `is_published` when ready  
5. Test `/login` and `/{slug}`  
6. Send credentials + links to client  
7. Optional: record agreed tier internally when `packages` / CRM exists  

### Step 6 detail — RLS hardening

Run and verify migrations:

- `20260319240000_events_user_id_auth.sql`
- `20260319250000_scoped_guests_tables_rls.sql`
- Replace anon `using (true)` SELECT on sensitive tables where possible
- Public RSVP: narrow INSERT policy `WITH CHECK (event_id = ...)` if using RPC, or keep slug-validated server action

### Step 7 detail — Marketing (no public pricing)

- Replace default `/` with landing: what you offer, **three service tiers by name/features**, social proof if available
- Primary CTA: contact for custom offer (email, phone, WhatsApp, or simple `/contact` form)
- **Do not** build `/pricing` with fixed prices or Stripe checkout at this stage
- No auth, no database writes on marketing pages

### Step 8 detail — Deploy

- Vercel project linked to repo
- Env: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Do **not** expose `SUPABASE_SERVICE_ROLE_KEY` unless needed server-side
- Custom domain for marketing; subpath or subdomain for app
- Remove `/test/events`

---

## 11. Cursor implementation strategy

### How to build the next features

1. **One feature at a time** — e.g. only landing page, or only RLS migration, not both in one PR  
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

1. Audit & apply production RLS SQL  
2. Build `/` marketing landing (tiers + contact CTA, no fixed prices)  
3. Optional `/contact` page or contact section on landing  
4. Refactor dashboard into nested routes (optional)  
5. Add internal `packages` / feature gating (when tier enforcement is needed in app)  
6. Deploy to Vercel  

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
