create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  resume_version_id uuid references public.resume_versions(id) on delete set null,
  company_name text not null default '', job_title text not null default '',
  recruiter_name text not null default '', recruiter_title text not null default '',
  recruiter_fingerprint text not null default '',
  greeting_text text not null default '', greeting_version text not null default 'concise',
  greeting_reasoning jsonb not null default '{"job_focus":[],"candidate_strengths":[]}'::jsonb,
  application_status text not null default 'draft' check (application_status in ('draft','ready','opened','sent','replied','interview','rejected','closed')),
  source text not null default 'manual', source_url text not null default '',
  match_score_snapshot integer, application_snapshot jsonb not null default '{}'::jsonb,
  applied_at timestamptz, notes text not null default '',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index if not exists applications_job_idx on public.applications(job_id);
create index if not exists applications_status_idx on public.applications(application_status);
create index if not exists applications_recruiter_idx on public.applications(recruiter_fingerprint);
create unique index if not exists applications_one_active_per_job on public.applications(job_id) where application_status not in ('rejected','closed');

create table if not exists public.application_feedback (
  id uuid primary key default gen_random_uuid(), application_id uuid not null references public.applications(id) on delete cascade,
  result text not null check (result in ('reply','interview','rejected','no_response')),
  notes text not null default '', created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
alter table public.applications enable row level security;
alter table public.application_feedback enable row level security;
drop policy if exists "authenticated applications" on public.applications;
create policy "authenticated applications" on public.applications for all to authenticated using (true) with check (true);
drop policy if exists "authenticated application feedback" on public.application_feedback;
create policy "authenticated application feedback" on public.application_feedback for all to authenticated using (true) with check (true);

