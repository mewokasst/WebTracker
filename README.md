# TaskTrack — Setup Guide (VS Code + Supabase)

## What's in this folder

```
tasktrack/
├── index.html              Login page
├── register.html           Registration page
├── dashboard.html          Dashboard (summary + shared deadlines)
├── tasks.html               My Tasks (add/edit/delete/search/filter)
├── profile.html             Profile page
├── admin.html                Admin panel (post shared deadlines)
├── schema.sql                 Run this in Supabase to create your tables
├── css/style.css              All styling (unchanged)
└── js/
    ├── supabase-config.js    Your Supabase project URL + key go here
    ├── auth.js                Login/register/logout logic
    ├── tasks.js                Task CRUD logic
    └── shared-deadlines.js     Shared deadline CRUD logic
```

---

## Step 1 — Open in VS Code

1. Unzip the project folder.
2. In VS Code: **File → Open Folder…** → select `tasktrack`.
3. Install the **Live Server** extension (by Ritwick Dey) from the Extensions tab if you don't have it — this lets you run the site locally with hot reload.

---

## Step 2 — Your Supabase project is already set up ✅

Project **mewokasst's Project** (`fuzbbxdlecympuvotygs`, region `ap-northeast-2`) already has the schema applied:
- `profiles`, `tasks`, and `shared_deadlines` tables are created
- Row-level security is enabled on all three with the policies from `schema.sql`

`js/supabase-config.js` is already filled in with this project's URL and public **anon** key — that key is meant to be public/embedded in frontend code (unlike the personal access token used to set this up, which should never be pasted anywhere and should be rotated if it ever is).

If you ever spin up a *different* Supabase project, repeat this manually: **SQL Editor → New query → paste `schema.sql` → Run**, then **Project Settings → API** to copy the new URL/anon key into `js/supabase-config.js`.

---

---

## Step 4 — (Optional but recommended) Turn off email confirmation for dev/testing

By default, Supabase makes new users confirm their email before they can log in — fine for production, annoying while you're demoing to classmates.

**Authentication → Providers → Email → toggle "Confirm email" off**, then Save.

If you leave it on, registration still works — the app just tells the user to check their inbox and click the confirmation link before logging in.

---

## Step 5 — Run it locally

1. Right-click `index.html` in VS Code's file explorer → **Open with Live Server**.
2. Your browser opens to the login page. Click **Register here** to create your first account.
3. Log in, and you should land on the Dashboard.

---

## Step 6 — Make yourself an admin (to test the Admin Panel)

1. Register a normal account first (or use one you already made).
2. In the Supabase dashboard: **Table Editor → profiles** → find the row with your user id.
3. Change the `role` cell from `student` to `admin`.
4. Log out and back in on the site — you'll now see "Admin Panel" in the sidebar, where you can post shared deadlines that appear on every student's dashboard.

---

## Step 7 — Deploy it so your independent testers can access it

Since this is a static site (plain HTML/JS talking to Supabase's API), any static host works — no server needed. Two easy free options:

**Netlify Drop** (fastest, no account needed for a quick test):
1. Go to [app.netlify.com/drop](https://app.netlify.com/drop).
2. Drag your whole `tasktrack` folder onto the page.
3. Netlify gives you a live URL like `https://random-name.netlify.app` — send this to testers.

**Vercel / GitHub Pages** work too if you'd rather connect a repo:
1. Push the `tasktrack` folder to a GitHub repo.
2. On Vercel: **New Project → import the repo → deploy** (no build step needed, it's static files).
3. On GitHub Pages: use the included workflow in `.github/workflows/pages.yml`, then open the Pages URL from **Settings → Pages**. GitHub's normal file viewer does not run HTML or CSS; use the Pages URL to view the app.

---

## About the security rules

Unlike Firebase's Firestore, Supabase is backed by Postgres, so `schema.sql` already includes row-level security (RLS) policies — there's no separate "tighten it before testing" step like there was with Firebase's test mode. The policies in `schema.sql` do this:

- **profiles**: a user can only read/update their own profile row.
- **tasks**: a user can only see, edit, or delete their own tasks.
- **shared_deadlines**: any signed-in user can read them; only accounts with `role = 'admin'` in `profiles` can post or delete them.

This is worth mentioning in your report's security/access-control section — it shows the data layer enforces access control at the database level, not just in the UI.

---

## What's already built vs. what you can extend

**Already working:** registration, login/logout, task add/edit/delete, mark complete, search, filter by status/subject, dashboard stats, shared deadlines (admin post/delete, student view), profile edit + completion-rate stat — all now running on Supabase/Postgres instead of Firebase/Firestore.

**Good stretch goals if you have time** (map to the "optional" features in the rubric — Notifications, Reports): a "due within 24 hours" visual badge, a simple bar chart of tasks-by-subject on the dashboard, CSV export of tasks.

**Left as-is deliberately** (to keep scope tight for the deadline): mobile nav is simplified/hidden below 720px width — fine to leave, or a good thing to flag as a "known limitation" if a tester tests on mobile.
