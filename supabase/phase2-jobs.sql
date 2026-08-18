create table if not exists jobs (
 id uuid primary key default gen_random_uuid(), company_name text not null, job_title text not null, location text not null default '', salary text not null default '', job_description text not null, source text not null default 'manual', source_url text not null default '', requirements jsonb, responsibilities jsonb not null default '[]', keywords jsonb not null default '[]', match_score integer check(match_score between 0 and 100), match_analysis jsonb, status text not null default 'new' check(status in ('new','analyzed','resume_generated','applied','ignored')), created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
alter table jobs enable row level security;
do $$ begin if not exists(select 1 from pg_policies where schemaname='public' and tablename='jobs' and policyname='Authenticated jobs') then create policy "Authenticated jobs" on jobs for all to authenticated using(true) with check(true); end if; end $$;
alter table resume_versions add column if not exists job_id uuid references jobs(id) on delete cascade;
alter table resume_versions add column if not exists source_snapshot jsonb not null default '{}';
create index if not exists jobs_created_at_idx on jobs(created_at desc);
create index if not exists resume_versions_job_id_idx on resume_versions(job_id);
-- Replace the broad phase-1 policy, if present, with authenticated-only access.
drop policy if exists "authenticated versions" on resume_versions;
create policy "Authenticated resume versions" on resume_versions for all to authenticated using(true) with check(true);
