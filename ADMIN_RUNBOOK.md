# Admin Runbook — Managed Digital Invitation Platform

> **Audience:** Platform owner (you)  
> **Purpose:** Step-by-step guide to onboard paying clients manually  
> **Related doc:** [PRODUCT_ARCHITECTURE.md](./PRODUCT_ARCHITECTURE.md)

There is **no public signup**. Every client is created by you in Supabase after payment.

---

## Quick reference

| Item | Value |
|------|-------|
| Client login | `https://YOUR-DOMAIN.com/login` |
| Client dashboard | `https://YOUR-DOMAIN.com/dashboard` |
| Public invitation | `https://YOUR-DOMAIN.com/{slug}` |
| Supabase Auth | Dashboard → Authentication → Users |
| Supabase SQL | Dashboard → SQL Editor |
| `events.user_id` type | **UUID** (must match `auth.users.id`) |
| `events.id` type | **bigint** (auto-generated) |

Replace `YOUR-DOMAIN.com` with your production URL (e.g. Vercel domain). For local testing use `http://localhost:3000`.

---

## 1. New client onboarding checklist

Use this checklist for every new paying client:

- [ ] Payment received / contract confirmed
- [ ] Package noted (Basic / RSVP / Premium)
- [ ] Client contact email collected
- [ ] Supabase Auth user created (**Auto Confirm** enabled)
- [ ] User UID copied from Supabase
- [ ] Event created with correct `name`, `slug`, and `user_id`
- [ ] Optional: tables created (Premium / seating package)
- [ ] Client login tested (`/login` → `/dashboard`)
- [ ] Event visible on dashboard with correct name
- [ ] Public RSVP link tested (`/{slug}`)
- [ ] Test RSVP submitted (going + not going)
- [ ] RSVP stats update on dashboard
- [ ] Seating tested (if package includes it)
- [ ] Credentials + links sent to client
- [ ] Client confirmed receipt (optional but recommended)

---

## 2. How to create a client in Supabase Auth

### Step-by-step

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → your project
2. Go to **Authentication** → **Users**
3. Click **Add user** → **Create new user**
4. Fill in:
   - **Email** — client's login email (e.g. `ana.marko@email.com`)
   - **Password** — strong temporary password (save it securely)
   - **Auto Confirm User** — **ON** (required so they can log in immediately)
5. Click **Create user**
6. Click the new user row and copy **User UID** (UUID format, e.g. `a1b2c3d4-e5f6-7890-abcd-ef1234567890`)

### One-time platform setting (verify once)

**Authentication** → **Providers** → **Email**:

- **Enable Email provider** — ON
- **Enable sign ups** — **OFF** (no public registration)

---

## 3. How to create an event for that client

You can create an event via **SQL Editor** (recommended for admin) or let the client create it from the dashboard after first login.

### Option A — SQL Editor (recommended for managed setup)

```sql
insert into public.events (name, slug, user_id)
values (
  'Ana & Marko',
  'ana-marko-2026',
  'PASTE-CLIENT-USER-UID-HERE'  -- UUID from auth.users
);
```

### Option B — Client creates from dashboard

1. Client logs in at `/login`
2. Uses **New event** form on `/dashboard`
3. App automatically sets `user_id` to their authenticated user id

Use Option A when you want full control before delivery. Use Option B if the client should name their own event.

### Slug rules

- Lowercase letters, numbers, hyphens only
- Examples: `ana-marko-2026`, `petar-marina-wedding`
- Must be **unique** across all events
- Becomes the public URL: `/{slug}`

---

## 4. How to assign `user_id` correctly

### Rules

| Rule | Detail |
|------|--------|
| **Type** | Must be **UUID**, not a number |
| **Source** | Copy from **Authentication → Users → User UID** |
| **Match** | Must exactly match the client's `auth.users.id` |
| **Required** | Event without `user_id` will **not** appear on client's dashboard |

### Assign on new event (insert)

```sql
insert into public.events (name, slug, user_id)
values ('Event Name', 'event-slug', 'CLIENT-UUID-HERE');
```

### Fix existing event (update)

```sql
update public.events
set user_id = 'CLIENT-UUID-HERE'
where slug = 'ana-marko-2026';
```

### Verify assignment

```sql
select e.id, e.name, e.slug, e.user_id, u.email
from public.events e
left join auth.users u on u.id = e.user_id
where e.slug = 'ana-marko-2026';
```

Expected: one row with correct `user_id` and matching client email.

---

## 5. How to test client login

1. Open `https://YOUR-DOMAIN.com/login` (or `http://localhost:3000/login`)
2. Enter the **client email** and **temporary password**
3. Click **Sign in**
4. You should land on `/dashboard`
5. Confirm:
   - Client email shown in header
   - **Your events** lists the assigned event(s) only
   - RSVP stats visible (may be 0 before any RSVPs)
   - **Sign out** button works → redirects to `/login`
6. Try opening `/dashboard` in incognito **without** login → should redirect to `/login`

---

## 6. How to test public RSVP link

1. Open `https://YOUR-DOMAIN.com/{slug}` (e.g. `/ana-marko-2026`)
2. Confirm:
   - Event name displays
   - RSVP form shows (name + Going / Not going)
   - No login required
3. Submit a test RSVP:
   - Enter a test name (e.g. `Test Guest`)
   - Click **Going**
   - Success message appears
4. Log in as client on `/dashboard`
5. Confirm RSVP count updated (Going: 1)
6. Repeat with **Not going** to verify both statuses work
7. Optional: submit from phone / incognito to simulate real guest

---

## 7. What links and credentials to send to the client

Send the client **only what they need**:

| Item | Example |
|------|---------|
| Dashboard login URL | `https://YOUR-DOMAIN.com/login` |
| Public invitation link | `https://YOUR-DOMAIN.com/ana-marko-2026` |
| Login email | `ana.marko@email.com` |
| Temporary password | (the one you set in Supabase) |

### Do NOT send

- Supabase dashboard access
- Service role key or anon key
- Other clients' slugs or credentials
- Internal SQL or admin notes

### What the client can do after login

- View RSVP statistics (going / not going / pending)
- See guest list (via going guests + stats)
- Create tables and manage seating (drag & drop)
- Create additional events (if allowed by their package)

### What guests do

- Open the **public invitation link** only
- Submit RSVP — no account needed

---

## 8. Common mistakes

### `user_id` missing

**Symptom:** Client logs in but dashboard shows "No events yet" even though event exists in Supabase.

**Cause:** Event was created without `user_id`, or `user_id` is NULL.

**Fix:**

```sql
update public.events
set user_id = 'CLIENT-UUID-HERE'
where id = 2;  -- or where slug = 'your-slug'
```

---

### `user_id` wrong type

**Symptom:** SQL error like `invalid input syntax for type uuid: "2"`.

**Cause:** `user_id` set to event id (`2`) instead of Auth user UUID.

**Fix:** Use UUID from **Authentication → Users → User UID**, not the event's numeric id.

```sql
-- WRONG
user_id = '2'

-- CORRECT
user_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
```

---

### Event not visible in dashboard

**Checklist:**

1. Is client logged in with the correct email?
2. Does `events.user_id` match that user's UUID?
3. Run verify query (section 4)
4. Are RLS policies applied? (migration `20260319240000_events_user_id_auth.sql`)
5. Did client create event while logged in as someone else?

---

### Slug duplicate

**Symptom:** Error on event create: `duplicate key value violates unique constraint`.

**Cause:** Another event already uses that slug.

**Fix:**

- Choose a different slug (e.g. `ana-marko-2026` → `ana-marko-june-2026`)
- Or delete/rename the conflicting event in Supabase if it was a test

**Prevention:** Use `{names}-{year}` or `{names}-{month}-{year}` pattern.

---

### Public RSVP not working

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| 404 on `/{slug}` | Wrong slug or typo | Check `select slug from events where slug = '...'` |
| `permission denied for table guests` | Missing INSERT policy | Run guests RLS SQL from migrations |
| Form submits but no error / no data | RLS blocking insert silently | Check Supabase logs → Database |
| Event name shows but submit fails | Anon key or env misconfigured | Verify `.env.local` / Vercel env vars |

**Verify event exists publicly:**

```sql
select id, name, slug from public.events where slug = 'your-slug';
```

**Verify guest insert works** — submit test RSVP and check:

```sql
select * from public.guests where event_id = (
  select id from public.events where slug = 'your-slug'
);
```

---

### Seating not working

| Symptom | Fix |
|---------|-----|
| Cannot add table | Run `tables` RLS migrations; check `event_id` is bigint |
| `invalid input syntax for type uuid: "2"` on table create | Run bigint tables migration (`20260319230000_tables_use_bigint_ids.sql`) |
| Guest drag does not save | Ensure `guests_update` policy exists; client must own the event |
| Stats show 0 but RSVPs exist | Run `guests_select` policy for authenticated users |

---

## 9. Pre-delivery checklist

Complete **before** sending credentials to the client:

### Auth & access
- [ ] Client user exists in Supabase Auth
- [ ] Auto Confirm is enabled for that user
- [ ] Public signup is disabled globally
- [ ] You can log in as client on production URL

### Event setup
- [ ] Event name is correct (as client requested)
- [ ] Slug is correct and shareable
- [ ] `user_id` assigned and verified with SQL query
- [ ] No test/draft events visible that shouldn't be there

### Public page
- [ ] `/{slug}` loads on production URL
- [ ] Event name displays correctly
- [ ] Test RSVP (going) succeeds
- [ ] Test RSVP (not going) succeeds
- [ ] Test RSVPs appear on client dashboard

### Dashboard
- [ ] Client sees exactly their event(s)
- [ ] RSVP counts are accurate
- [ ] Seating works (if Premium package)
- [ ] Sign out works

### Delivery
- [ ] Credentials documented securely (password manager / encrypted note)
- [ ] Client message drafted (section 10)
- [ ] Client knows public link is for guests, login link is for them only

### Cleanup
- [ ] Remove test guest rows if desired:
  ```sql
  delete from public.guests
  where name in ('Test Guest', 'test')
    and event_id = (select id from events where slug = 'your-slug');
  ```
- [ ] Remove `/test/events` from production if still deployed (dev only)

---

## 10. Client delivery template

Copy, fill in the placeholders, and send via email or WhatsApp.

---

**Subject:** Your digital invitation dashboard is ready

---

Hi **[Client Name]**,

Your digital invitation is set up and ready to use.

### Your dashboard (for you only)

Use this to track RSVPs and manage seating:

**Login:** https://YOUR-DOMAIN.com/login

- **Email:** `[client@email.com]`
- **Temporary password:** `[temporary-password]`

We recommend changing your password after first login. If you need a password reset, contact us.

### Public invitation link (share with guests)

Send this link to your guests. They do not need to log in — they only confirm whether they are coming:

**Invitation link:** https://YOUR-DOMAIN.com/[slug]

You can share it via WhatsApp, email, SMS, or print it as a QR code.

### What you can do in the dashboard

- See who confirmed **Going** or **Not going**
- View RSVP statistics in real time
- Arrange seating by table (drag & drop)

### What your guests do

1. Open the invitation link
2. Enter their name
3. Click **Going** or **Not going**

### Need help?

Contact us at **[your-support-email-or-phone]**.

Congratulations again,  
**[Your Name / Business Name]**

---

## Appendix A — Useful SQL queries

### List all clients and their events

```sql
select
  u.email,
  u.id as user_id,
  e.id as event_id,
  e.name as event_name,
  e.slug
from auth.users u
left join public.events e on e.user_id = u.id
order by u.email, e.name;
```

### RSVP summary for an event

```sql
select
  status,
  count(*) as count
from public.guests
where event_id = (select id from public.events where slug = 'your-slug')
group by status;
```

### Find events with no owner

```sql
select id, name, slug, user_id
from public.events
where user_id is null;
```

---

## Appendix B — Package-specific notes

| Package | Admin setup |
|---------|-------------|
| **Basic** | Event + public page only; RSVP may be disabled manually if needed |
| **RSVP** | Standard flow — event + public RSVP + dashboard stats |
| **Premium** | Also create initial tables or instruct client how to add tables in dashboard |

---

## Appendix C — Environment checklist (production)

Before onboarding real clients on production:

- [ ] `NEXT_PUBLIC_SUPABASE_URL` set on Vercel
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` set on Vercel
- [ ] Do **not** expose `SUPABASE_SERVICE_ROLE_KEY` to the browser
- [ ] All SQL migrations applied in Supabase SQL Editor
- [ ] Custom domain configured (optional)

---

*Update this runbook when routes, auth rules, or onboarding steps change.*
