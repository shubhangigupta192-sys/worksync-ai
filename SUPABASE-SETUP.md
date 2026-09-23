# WorkSync AI — Free Database & Real Login Setup (Supabase)

This guide turns on **real email/password authentication** using Supabase's free tier.
No credit card needed. Takes ~15 minutes.

Your app already has all the code for this — it automatically switches from demo mode
to database mode as soon as the environment variables below exist.

---

## Step 1 — Create the free database (2 min)

1. Go to **https://supabase.com** → **Start your project** → sign in with GitHub.
2. Click **New project**.
   - Name: `worksync-ai`
   - Database Password: click **Generate** and **copy it somewhere safe**
   - Region: closest to you (e.g., Mumbai `ap-south-1`)
3. Wait ~2 minutes for provisioning.

## Step 2 — Create the tables (2 min)

1. In your project, open **SQL Editor** (left sidebar) → **New query**.
2. Open `supabase/schema.sql` from this repo, copy **everything**, paste it, click **Run**.
3. Open `supabase/seed.sql`, copy everything, paste, **Run**.
   - This inserts the demo departments/employees so the app has data.

✅ Check: **Table Editor** (left sidebar) should now show ~9 tables with data.

## Step 3 — Create the login users (3 min)

The seed data creates *employees*, but login accounts are separate (they live in
Supabase Auth). Create one per role:

1. Go to **Authentication → Users → Add user → Create new user**.
2. Create these three (tick **Auto Confirm User**):

| Email | Password | For role |
|---|---|---|
| `admin@worksync.com` | `Admin@123` | HR Admin — full access, reviews, task assignment |
| `supervisor@worksync.com` | `Super@123` | Supervisor — task board, verification, analytics |
| `employee@worksync.com` | `Employee@123` | Frontline — own tasks only |

## Step 4 — Tell the app about the database (2 min)

1. In Supabase: **Project Settings → API**. Copy two values:
   - **Project URL**
   - **anon public key**
2. In the project folder `C:\Users\hp\.gemini\antigravity\scratch\hr-ai-prototype`,
   create a file named `.env.local` with:

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT-ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

3. Restart the dev server (stop it, then `npm run dev`).

✅ Check: the login page now uses your email/password. Sign in with
`admin@worksync.com` / `Admin@123`.

## Step 5 — Connect employees to login accounts (1 line each)

For the dashboard to show a logged-in user's name/role, the `profiles` table links
auth users to employee records:

1. In **Authentication → Users**, copy the **User UID** of `admin@worksync.com`.
2. In **SQL Editor**, run (repeat per user):

```sql
update profiles set role = 'admin' where id = 'PASTE-UID-HERE';
```

(Do the same with `'supervisor'` / `'employee'` for the other accounts. If the
`profiles` table has an `employee_id` column, also set it to the matching employee
from the seed data so "My Tasks" resolves to the right person.)

## Step 6 — Deploy for a shareable link (optional, 5 min)

1. Push the repo to GitHub (already done — `shubhangigupta192-sys/worksync-ai`).
2. Go to **https://vercel.com** → sign in with GitHub → **Add New Project** → import `worksync-ai`.
3. Under **Environment Variables**, add the same two `NEXT_PUBLIC_SUPABASE_*` values.
4. Click **Deploy** → you get a free public URL like `worksync-ai.vercel.app`.

---

## How the app decides demo vs. real mode

- No `.env.local` (or placeholder URL) → **demo mode**: role buttons set a cookie,
  data lives in server memory, resets on restart.
- Valid `.env.local` → **database mode**: real Supabase Auth sign-in, data persists
  in Postgres, Row-Level Security policies from `schema.sql` are enforced.

Both modes run the same rule-based AI engines — the demo is real code, just
in-memory data.

## Cost

Supabase free tier: 500 MB database, 50,000 monthly active users, 2 projects —
far beyond what this prototype needs. No credit card. Vercel free (Hobby) tier
covers the hosting.
