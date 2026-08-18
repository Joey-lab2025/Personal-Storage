create table if not exists job_candidates (
 id uuid primary key default gen_random_uuid(), source text not null default 'boss', source_url text not null, source_job_id text,
 company_name text not null default '', job_title text not null default '', location text not null default '', salary text not null default '', summary text not null default '',
 quick_score integer not null default 0 check(quick_score between 0 and 100), is_shortlisted boolean not null default false,
 captured_date date not null default current_date, first_seen_at timestamptz not null default now(), last_seen_at timestamptz not null default now(), created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create unique index if not exists job_candidates_source_url_uidx on job_candidates(source_url);
create index if not exists job_candidates_daily_top_idx on job_candidates(captured_date, is_shortlisted, quick_score desc);
alter table job_candidates enable row level security;
drop policy if exists "Authenticated job candidates" on job_candidates;
create policy "Authenticated job candidates" on job_candidates for all to authenticated using(true) with check(true);
