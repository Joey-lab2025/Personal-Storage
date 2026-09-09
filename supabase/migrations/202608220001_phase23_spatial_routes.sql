alter table public.routes
  add column if not exists route_type text not null default 'editorial' check (route_type in ('editorial','user','generated')),
  add column if not exists created_by uuid references auth.users(id) on delete cascade,
  add column if not exists visibility text not null default 'public' check (visibility in ('private','public','unlisted')),
  add column if not exists transport_mode text not null default 'walking' check (transport_mode in ('walking','transit','driving','cycling')),
  add column if not exists estimated_duration integer check (estimated_duration is null or estimated_duration >= 0),
  add column if not exists estimated_distance integer check (estimated_distance is null or estimated_distance >= 0),
  add column if not exists start_latitude double precision,
  add column if not exists start_longitude double precision,
  add column if not exists end_latitude double precision,
  add column if not exists end_longitude double precision,
  add column if not exists is_round_trip boolean not null default false,
  add column if not exists status text not null default 'saved' check (status in ('draft','saved'));

create index if not exists projects_spatial_bbox_idx on public.projects(latitude, longitude) where latitude is not null and longitude is not null;
create index if not exists routes_created_by_idx on public.routes(created_by, updated_at desc);

drop policy if exists routes_public_read on public.routes;
create policy routes_visible_read on public.routes for select using (route_type = 'editorial' or visibility = 'public' or created_by = auth.uid());
drop policy if exists route_projects_public_read on public.route_projects;
create policy route_projects_visible_read on public.route_projects for select using (exists(select 1 from public.routes r where r.id = route_id and (r.route_type = 'editorial' or r.visibility = 'public' or r.created_by = auth.uid())));
create policy routes_owner_write on public.routes for all using (created_by = auth.uid()) with check (created_by = auth.uid() and route_type <> 'editorial');
create policy route_projects_owner_write on public.route_projects for all using (exists(select 1 from public.routes r where r.id = route_id and r.created_by = auth.uid() and r.route_type <> 'editorial')) with check (exists(select 1 from public.routes r where r.id = route_id and r.created_by = auth.uid() and r.route_type <> 'editorial'));

create or replace function public.save_user_route(route_data jsonb, project_ids uuid[])
returns uuid language plpgsql security invoker set search_path = public as $$
declare new_route_id uuid; project_count integer;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  project_count := coalesce(array_length(project_ids, 1), 0);
  if project_count < 2 or project_count > 10 then raise exception 'A route requires 2 to 10 projects'; end if;
  if (select count(distinct x) from unnest(project_ids) x) <> project_count then raise exception 'Duplicate projects are not allowed'; end if;
  if exists(select 1 from unnest(project_ids) x left join public.projects p on p.id=x where p.id is null or p.latitude is null or p.longitude is null) then raise exception 'Every project requires valid coordinates'; end if;
  insert into public.routes(title,slug,description,city,cover_image,route_type,created_by,visibility,transport_mode,estimated_duration,estimated_distance,is_round_trip,status)
  values(coalesce(nullif(route_data->>'title',''), 'My Spatial Route'), coalesce(nullif(route_data->>'slug',''), gen_random_uuid()::text), route_data->>'description', route_data->>'city', route_data->>'cover_image', 'user', auth.uid(), coalesce(route_data->>'visibility','private'), coalesce(route_data->>'transport_mode','walking'), nullif(route_data->>'estimated_duration','')::integer, nullif(route_data->>'estimated_distance','')::integer, coalesce((route_data->>'is_round_trip')::boolean,false), 'saved') returning id into new_route_id;
  insert into public.route_projects(route_id,project_id,stop_order) select new_route_id,x,ordinality-1 from unnest(project_ids) with ordinality t(x,ordinality);
  return new_route_id;
end $$;
grant execute on function public.save_user_route(jsonb, uuid[]) to authenticated;
