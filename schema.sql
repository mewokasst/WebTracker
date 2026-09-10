-- ===========================================================
-- TaskTrack — Supabase schema
-- Run this once in your project's SQL Editor (New query -> Run)
-- ===========================================================

-- ---------- profiles ----------
-- One row per user, extends Supabase's built-in auth.users
-- (Supabase Auth only stores email/password; app fields like
-- name/role live here instead).
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  email text not null,
  role text not null default 'student' check (role in ('student', 'admin')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Automatically create a profiles row the instant a new auth user is
-- created — runs as the table owner (security definer) so it works
-- immediately, even before email confirmation / login, bypassing RLS
-- safely because it's system-triggered, not client-initiated.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    'student'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- tasks ----------
create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  owner_uid uuid not null references auth.users (id) on delete cascade,
  title text not null,
  subject text not null default 'General',
  due_date date not null,
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  status text not null default 'pending' check (status in ('pending', 'done')),
  notes text default '',
  created_at timestamptz not null default now()
);

alter table public.tasks enable row level security;

create policy "Users manage their own tasks"
  on public.tasks for all
  using (auth.uid() = owner_uid)
  with check (auth.uid() = owner_uid);

-- ---------- shared_deadlines ----------
-- Posted by admins, readable by every logged-in student on the dashboard.
create table public.shared_deadlines (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subject_or_scope text not null default 'All Students',
  due_date date not null,
  description text default '',
  posted_by uuid references auth.users (id),
  created_at timestamptz not null default now()
);

alter table public.shared_deadlines enable row level security;

create policy "Any signed-in user can read shared deadlines"
  on public.shared_deadlines for select
  using (auth.role() = 'authenticated');

create policy "Admins can post shared deadlines"
  on public.shared_deadlines for insert
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can delete shared deadlines"
  on public.shared_deadlines for delete
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );
