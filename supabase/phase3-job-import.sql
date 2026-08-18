alter table jobs add column if not exists source_job_id text;
alter table jobs add column if not exists job_fingerprint text;
alter table jobs add column if not exists experience_requirement text not null default '';
alter table jobs add column if not exists education_requirement text not null default '';
alter table jobs add column if not exists company_industry text not null default '';
alter table jobs add column if not exists company_size text not null default '';
alter table jobs add column if not exists recruiter_name text not null default '';
alter table jobs add column if not exists recruiter_title text not null default '';
alter table jobs add column if not exists category text not null default 'skip';
alter table jobs add column if not exists hard_filter_warning jsonb not null default '{}';
alter table jobs add column if not exists captured_at timestamptz not null default now();
alter table jobs add column if not exists last_seen_at timestamptz not null default now();
alter table jobs add column if not exists job_description_updated_at timestamptz;
alter table jobs drop constraint if exists jobs_status_check;
alter table jobs add constraint jobs_status_check check(status in ('new','analyzed','priority','consider','resume_generated','applied','ignored','archived'));
create unique index if not exists jobs_fingerprint_uidx on jobs(job_fingerprint) where job_fingerprint is not null;
create index if not exists jobs_category_score_idx on jobs(category, match_score desc);
create index if not exists jobs_captured_at_idx on jobs(captured_at desc);

create table if not exists job_preferences (
  id uuid primary key default gen_random_uuid(),
  target_titles text[] not null default '{}', preferred_cities text[] not null default '{}',
  minimum_salary integer, max_experience_years integer,
  preferred_industries text[] not null default '{}', excluded_industries text[] not null default '{}',
  excluded_companies text[] not null default '{}', included_keywords text[] not null default '{}', excluded_keywords text[] not null default '{}',
  auto_skip_score integer not null default 65 check(auto_skip_score between 0 and 100),
  auto_priority_score integer not null default 85 check(auto_priority_score between 0 and 100),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
alter table job_preferences enable row level security;
drop policy if exists "Authenticated job preferences" on job_preferences;
create policy "Authenticated job preferences" on job_preferences for all to authenticated using(true) with check(true);
