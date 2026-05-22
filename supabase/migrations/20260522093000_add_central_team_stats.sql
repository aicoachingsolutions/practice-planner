create table if not exists public.team_stat_reports (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams (id) on delete cascade,
  season_id uuid references public.seasons (id) on delete set null,
  created_by uuid not null references auth.users (id) on delete cascade,
  sport_key text not null references public.sport_configs (sport_key),
  event_date date,
  opponent_name text,
  title text,
  source_type text not null default 'manual',
  source_app text not null default 'practice_planner',
  raw_text text,
  raw_payload jsonb,
  computed_summary jsonb,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint team_stat_reports_source_type_check check (
    source_type in ('manual', 'csv_upload', 'api_import', 'system_import')
  )
);

create table if not exists public.team_stat_values (
  id uuid primary key default gen_random_uuid(),
  stat_report_id uuid not null references public.team_stat_reports (id) on delete cascade,
  team_id uuid not null references public.teams (id) on delete cascade,
  sport_key text not null references public.sport_configs (sport_key),
  stat_key text not null,
  stat_label text not null,
  stat_value numeric,
  stat_unit text,
  subject_type text not null default 'team',
  subject_name text,
  period_label text,
  raw_value text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint team_stat_values_stat_key_format check (stat_key ~ '^[a-z0-9_]+$'),
  constraint team_stat_values_subject_type_check check (
    subject_type in ('team', 'opponent', 'player', 'lineup', 'unit')
  )
);

create table if not exists public.team_stat_signals (
  id uuid primary key default gen_random_uuid(),
  stat_report_id uuid not null references public.team_stat_reports (id) on delete cascade,
  team_id uuid not null references public.teams (id) on delete cascade,
  sport_key text not null references public.sport_configs (sport_key),
  signal_slug text not null,
  signal_label text not null,
  strength numeric not null default 1,
  source_stat_keys text[] not null default '{}',
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint team_stat_signals_signal_slug_format check (signal_slug ~ '^[a-z0-9_]+$'),
  constraint team_stat_signals_strength_non_negative check (strength >= 0)
);

alter table public.ai_practice_generation_runs
  add column if not exists stat_report_id uuid references public.team_stat_reports (id) on delete set null;

create index if not exists team_stat_reports_team_date_idx
  on public.team_stat_reports (team_id, event_date desc, created_at desc);
create index if not exists team_stat_reports_sport_idx
  on public.team_stat_reports (sport_key);
create index if not exists team_stat_values_report_idx
  on public.team_stat_values (stat_report_id);
create index if not exists team_stat_values_team_key_idx
  on public.team_stat_values (team_id, stat_key);
create index if not exists team_stat_signals_report_idx
  on public.team_stat_signals (stat_report_id);
create index if not exists team_stat_signals_team_signal_idx
  on public.team_stat_signals (team_id, signal_slug);
create index if not exists ai_practice_generation_runs_stat_report_idx
  on public.ai_practice_generation_runs (stat_report_id);

drop trigger if exists set_team_stat_reports_updated_at on public.team_stat_reports;
create trigger set_team_stat_reports_updated_at
before update on public.team_stat_reports
for each row
execute function public.set_updated_at();

drop trigger if exists set_team_stat_values_updated_at on public.team_stat_values;
create trigger set_team_stat_values_updated_at
before update on public.team_stat_values
for each row
execute function public.set_updated_at();

drop trigger if exists set_team_stat_signals_updated_at on public.team_stat_signals;
create trigger set_team_stat_signals_updated_at
before update on public.team_stat_signals
for each row
execute function public.set_updated_at();

alter table public.team_stat_reports enable row level security;
alter table public.team_stat_values enable row level security;
alter table public.team_stat_signals enable row level security;

drop policy if exists "team_stat_reports_access_owned_team" on public.team_stat_reports;
create policy "team_stat_reports_access_owned_team"
on public.team_stat_reports
for all
using (
  exists (
    select 1
    from public.teams t
    where t.id = team_stat_reports.team_id
      and t.owner_user_id = auth.uid()
  )
)
with check (
  created_by = auth.uid()
  and exists (
    select 1
    from public.teams t
    where t.id = team_stat_reports.team_id
      and t.owner_user_id = auth.uid()
  )
);

drop policy if exists "team_stat_values_access_owned_team" on public.team_stat_values;
create policy "team_stat_values_access_owned_team"
on public.team_stat_values
for all
using (
  exists (
    select 1
    from public.teams t
    where t.id = team_stat_values.team_id
      and t.owner_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.teams t
    where t.id = team_stat_values.team_id
      and t.owner_user_id = auth.uid()
  )
);

drop policy if exists "team_stat_signals_access_owned_team" on public.team_stat_signals;
create policy "team_stat_signals_access_owned_team"
on public.team_stat_signals
for all
using (
  exists (
    select 1
    from public.teams t
    where t.id = team_stat_signals.team_id
      and t.owner_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.teams t
    where t.id = team_stat_signals.team_id
      and t.owner_user_id = auth.uid()
  )
);
