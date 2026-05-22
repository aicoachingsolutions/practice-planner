create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'drill_source_type') then
    create type public.drill_source_type as enum ('coach', 'system', 'copied');
  end if;

  if not exists (select 1 from pg_type where typname = 'drill_type') then
    create type public.drill_type as enum (
      'individual',
      'small_group',
      'team',
      'warmup',
      'competitive',
      'scrimmage',
      'conditioning'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'frequency_rule') then
    create type public.frequency_rule as enum (
      'none',
      'every_practice',
      'weekly_1',
      'weekly_2',
      'weekly_3'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'practice_type') then
    create type public.practice_type as enum ('offense', 'defense', 'balanced', 'custom');
  end if;

  if not exists (select 1 from pg_type where typname = 'plan_type') then
    create type public.plan_type as enum ('free', 'trial', 'paid');
  end if;
end
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.sport_configs (
  sport_key text primary key,
  display_name text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint sport_configs_sport_key_format check (sport_key ~ '^[a-z0-9_]+$')
);

create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  sport_key text not null references public.sport_configs (sport_key),
  description text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.seasons (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams (id) on delete cascade,
  name text not null,
  start_date date,
  end_date date,
  is_active boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint seasons_date_order check (end_date is null or start_date is null or end_date >= start_date)
);

create table if not exists public.sport_tags (
  id uuid primary key default gen_random_uuid(),
  sport_key text not null references public.sport_configs (sport_key) on delete cascade,
  tag_name text not null,
  tag_slug text not null,
  category text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint sport_tags_unique unique (sport_key, tag_slug, category)
);

create table if not exists public.practice_block_templates (
  id uuid primary key default gen_random_uuid(),
  sport_key text not null references public.sport_configs (sport_key) on delete cascade,
  template_key text not null,
  display_name text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint practice_block_templates_unique unique (sport_key, template_key)
);

create table if not exists public.drills (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid references auth.users (id) on delete cascade,
  sport_key text not null references public.sport_configs (sport_key),
  source_type public.drill_source_type not null,
  copied_from_drill_id uuid references public.drills (id) on delete set null,
  name text not null,
  drill_type public.drill_type not null,
  default_duration_minutes integer not null default 10,
  priority integer not null default 3,
  frequency public.frequency_rule not null default 'none',
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint drills_default_duration_positive check (default_duration_minutes > 0),
  constraint drills_priority_range check (priority between 1 and 5),
  constraint drills_source_owner_check check (
    (source_type = 'system' and owner_user_id is null)
    or (source_type in ('coach', 'copied') and owner_user_id is not null)
  )
);

create table if not exists public.drill_tag_map (
  drill_id uuid not null references public.drills (id) on delete cascade,
  tag_id uuid not null references public.sport_tags (id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (drill_id, tag_id)
);

create table if not exists public.practices (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams (id) on delete cascade,
  season_id uuid references public.seasons (id) on delete set null,
  created_by uuid not null references auth.users (id) on delete cascade,
  title text not null,
  practice_date date not null,
  practice_type public.practice_type not null default 'balanced',
  total_planned_minutes integer,
  custom_focus text,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint practices_total_planned_positive check (total_planned_minutes is null or total_planned_minutes > 0)
);

create table if not exists public.practice_blocks (
  id uuid primary key default gen_random_uuid(),
  practice_id uuid not null references public.practices (id) on delete cascade,
  template_id uuid references public.practice_block_templates (id) on delete set null,
  block_name text not null,
  block_order integer not null,
  planned_duration_minutes integer,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint practice_blocks_duration_positive check (planned_duration_minutes is null or planned_duration_minutes > 0),
  constraint practice_blocks_order_positive check (block_order >= 0),
  constraint practice_blocks_unique_order unique (practice_id, block_order)
);

create table if not exists public.practice_block_drills (
  id uuid primary key default gen_random_uuid(),
  practice_block_id uuid not null references public.practice_blocks (id) on delete cascade,
  drill_id uuid references public.drills (id) on delete set null,
  segment_order integer not null,
  segment_name text,
  duration_minutes integer,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint practice_block_drills_duration_positive check (duration_minutes is null or duration_minutes > 0),
  constraint practice_block_drills_order_positive check (segment_order >= 0),
  constraint practice_block_drills_custom_segment_check check (
    drill_id is not null or nullif(trim(coalesce(segment_name, '')), '') is not null
  ),
  constraint practice_block_drills_unique_order unique (practice_block_id, segment_order)
);

create table if not exists public.drill_usage (
  id uuid primary key default gen_random_uuid(),
  drill_id uuid not null references public.drills (id) on delete cascade,
  team_id uuid not null references public.teams (id) on delete cascade,
  practice_id uuid references public.practices (id) on delete set null,
  used_on date not null,
  duration_minutes integer,
  frequency_snapshot public.frequency_rule,
  last_used_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint drill_usage_duration_positive check (duration_minutes is null or duration_minutes > 0)
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  plan_type public.plan_type not null default 'free',
  status text,
  current_period_end timestamptz,
  trial_ends_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists teams_owner_user_id_idx on public.teams (owner_user_id);
create index if not exists teams_sport_key_idx on public.teams (sport_key);
create index if not exists seasons_team_id_idx on public.seasons (team_id);
create index if not exists sport_tags_sport_key_idx on public.sport_tags (sport_key);
create index if not exists practice_block_templates_sport_key_idx on public.practice_block_templates (sport_key);
create index if not exists drills_owner_user_id_idx on public.drills (owner_user_id);
create index if not exists drills_sport_key_idx on public.drills (sport_key);
create index if not exists drills_source_type_idx on public.drills (source_type);
create index if not exists drill_tag_map_tag_id_idx on public.drill_tag_map (tag_id);
create index if not exists practices_team_id_idx on public.practices (team_id);
create index if not exists practices_season_id_idx on public.practices (season_id);
create index if not exists practices_created_by_idx on public.practices (created_by);
create index if not exists practices_practice_date_idx on public.practices (practice_date);
create index if not exists practice_blocks_practice_id_idx on public.practice_blocks (practice_id);
create index if not exists practice_block_drills_drill_id_idx on public.practice_block_drills (drill_id);
create index if not exists drill_usage_drill_id_idx on public.drill_usage (drill_id);
create index if not exists drill_usage_team_id_idx on public.drill_usage (team_id);
create index if not exists drill_usage_practice_id_idx on public.drill_usage (practice_id);

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

drop trigger if exists set_sport_configs_updated_at on public.sport_configs;
create trigger set_sport_configs_updated_at
before update on public.sport_configs
for each row
execute function public.set_updated_at();

drop trigger if exists set_teams_updated_at on public.teams;
create trigger set_teams_updated_at
before update on public.teams
for each row
execute function public.set_updated_at();

drop trigger if exists set_seasons_updated_at on public.seasons;
create trigger set_seasons_updated_at
before update on public.seasons
for each row
execute function public.set_updated_at();

drop trigger if exists set_sport_tags_updated_at on public.sport_tags;
create trigger set_sport_tags_updated_at
before update on public.sport_tags
for each row
execute function public.set_updated_at();

drop trigger if exists set_practice_block_templates_updated_at on public.practice_block_templates;
create trigger set_practice_block_templates_updated_at
before update on public.practice_block_templates
for each row
execute function public.set_updated_at();

drop trigger if exists set_drills_updated_at on public.drills;
create trigger set_drills_updated_at
before update on public.drills
for each row
execute function public.set_updated_at();

drop trigger if exists set_practices_updated_at on public.practices;
create trigger set_practices_updated_at
before update on public.practices
for each row
execute function public.set_updated_at();

drop trigger if exists set_practice_blocks_updated_at on public.practice_blocks;
create trigger set_practice_blocks_updated_at
before update on public.practice_blocks
for each row
execute function public.set_updated_at();

drop trigger if exists set_practice_block_drills_updated_at on public.practice_block_drills;
create trigger set_practice_block_drills_updated_at
before update on public.practice_block_drills
for each row
execute function public.set_updated_at();

drop trigger if exists set_drill_usage_updated_at on public.drill_usage;
create trigger set_drill_usage_updated_at
before update on public.drill_usage
for each row
execute function public.set_updated_at();

drop trigger if exists set_subscriptions_updated_at on public.subscriptions;
create trigger set_subscriptions_updated_at
before update on public.subscriptions
for each row
execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.teams enable row level security;
alter table public.seasons enable row level security;
alter table public.drills enable row level security;
alter table public.drill_tag_map enable row level security;
alter table public.practices enable row level security;
alter table public.practice_blocks enable row level security;
alter table public.practice_block_drills enable row level security;
alter table public.drill_usage enable row level security;
alter table public.subscriptions enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select
using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles
for insert
with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "teams_access_own" on public.teams;
create policy "teams_access_own"
on public.teams
for all
using (owner_user_id = auth.uid())
with check (owner_user_id = auth.uid());

drop policy if exists "seasons_access_owned_team" on public.seasons;
create policy "seasons_access_owned_team"
on public.seasons
for all
using (
  exists (
    select 1
    from public.teams t
    where t.id = seasons.team_id
      and t.owner_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.teams t
    where t.id = seasons.team_id
      and t.owner_user_id = auth.uid()
  )
);

drop policy if exists "drills_select_owned_or_system" on public.drills;
create policy "drills_select_owned_or_system"
on public.drills
for select
using (owner_user_id = auth.uid() or source_type = 'system');

drop policy if exists "drills_insert_own" on public.drills;
create policy "drills_insert_own"
on public.drills
for insert
with check (
  owner_user_id = auth.uid()
  and source_type in ('coach', 'copied')
);

drop policy if exists "drills_update_own" on public.drills;
create policy "drills_update_own"
on public.drills
for update
using (owner_user_id = auth.uid())
with check (
  owner_user_id = auth.uid()
  and source_type in ('coach', 'copied')
);

drop policy if exists "drills_delete_own" on public.drills;
create policy "drills_delete_own"
on public.drills
for delete
using (owner_user_id = auth.uid());

drop policy if exists "drill_tag_map_select_readable_drills" on public.drill_tag_map;
create policy "drill_tag_map_select_readable_drills"
on public.drill_tag_map
for select
using (
  exists (
    select 1
    from public.drills d
    where d.id = drill_tag_map.drill_id
      and (d.owner_user_id = auth.uid() or d.source_type = 'system')
  )
);

drop policy if exists "drill_tag_map_insert_owned_drills" on public.drill_tag_map;
create policy "drill_tag_map_insert_owned_drills"
on public.drill_tag_map
for insert
with check (
  exists (
    select 1
    from public.drills d
    where d.id = drill_tag_map.drill_id
      and d.owner_user_id = auth.uid()
      and d.source_type in ('coach', 'copied')
  )
);

drop policy if exists "drill_tag_map_delete_owned_drills" on public.drill_tag_map;
create policy "drill_tag_map_delete_owned_drills"
on public.drill_tag_map
for delete
using (
  exists (
    select 1
    from public.drills d
    where d.id = drill_tag_map.drill_id
      and d.owner_user_id = auth.uid()
  )
);

drop policy if exists "practices_access_owned_team" on public.practices;
create policy "practices_access_owned_team"
on public.practices
for all
using (
  exists (
    select 1
    from public.teams t
    where t.id = practices.team_id
      and t.owner_user_id = auth.uid()
  )
)
with check (
  created_by = auth.uid()
  and exists (
    select 1
    from public.teams t
    where t.id = practices.team_id
      and t.owner_user_id = auth.uid()
  )
);

drop policy if exists "practice_blocks_access_owned_practice" on public.practice_blocks;
create policy "practice_blocks_access_owned_practice"
on public.practice_blocks
for all
using (
  exists (
    select 1
    from public.practices p
    join public.teams t on t.id = p.team_id
    where p.id = practice_blocks.practice_id
      and t.owner_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.practices p
    join public.teams t on t.id = p.team_id
    where p.id = practice_blocks.practice_id
      and t.owner_user_id = auth.uid()
  )
);

drop policy if exists "practice_block_drills_access_owned_practice" on public.practice_block_drills;
create policy "practice_block_drills_access_owned_practice"
on public.practice_block_drills
for all
using (
  exists (
    select 1
    from public.practice_blocks pb
    join public.practices p on p.id = pb.practice_id
    join public.teams t on t.id = p.team_id
    where pb.id = practice_block_drills.practice_block_id
      and t.owner_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.practice_blocks pb
    join public.practices p on p.id = pb.practice_id
    join public.teams t on t.id = p.team_id
    where pb.id = practice_block_drills.practice_block_id
      and t.owner_user_id = auth.uid()
  )
);

drop policy if exists "drill_usage_access_owned_records" on public.drill_usage;
create policy "drill_usage_access_owned_records"
on public.drill_usage
for all
using (
  exists (
    select 1
    from public.teams t
    where t.id = drill_usage.team_id
      and t.owner_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.teams t
    where t.id = drill_usage.team_id
      and t.owner_user_id = auth.uid()
  )
  and (
    drill_usage.practice_id is null
    or exists (
      select 1
      from public.practices p
      join public.teams t on t.id = p.team_id
      where p.id = drill_usage.practice_id
        and t.owner_user_id = auth.uid()
    )
  )
);

drop policy if exists "subscriptions_access_own" on public.subscriptions;
create policy "subscriptions_access_own"
on public.subscriptions
for all
using (user_id = auth.uid())
with check (user_id = auth.uid());

insert into public.sport_configs (sport_key, display_name)
values
  ('basketball', 'Basketball'),
  ('soccer', 'Soccer'),
  ('baseball', 'Baseball'),
  ('softball', 'Softball'),
  ('volleyball', 'Volleyball')
on conflict (sport_key) do update
set
  display_name = excluded.display_name,
  is_active = true,
  updated_at = timezone('utc', now());

with universal_tags(tag_name, tag_slug, category) as (
  values
    ('warmup', 'warmup', 'universal'),
    ('offense', 'offense', 'universal'),
    ('defense', 'defense', 'universal'),
    ('transition', 'transition', 'universal'),
    ('individual skill', 'individual_skill', 'universal'),
    ('team skill', 'team_skill', 'universal'),
    ('competitive', 'competitive', 'universal'),
    ('conditioning', 'conditioning', 'universal'),
    ('communication', 'communication', 'universal'),
    ('situational', 'situational', 'universal'),
    ('culture / standards', 'culture_standards', 'universal'),
    ('recovery / low intensity', 'recovery_low_intensity', 'universal')
),
sport_specific_tags(sport_key, tag_name, tag_slug, category) as (
  values
    ('basketball', 'shooting', 'shooting', 'sport_specific'),
    ('basketball', 'finishing', 'finishing', 'sport_specific'),
    ('basketball', 'footwork', 'footwork', 'sport_specific'),
    ('basketball', 'ball handling', 'ball_handling', 'sport_specific'),
    ('basketball', 'passing', 'passing', 'sport_specific'),
    ('basketball', 'decision-making', 'decision_making', 'sport_specific'),
    ('basketball', 'rebounding', 'rebounding', 'sport_specific'),
    ('basketball', 'boxing out', 'boxing_out', 'sport_specific'),
    ('basketball', 'closeouts', 'closeouts', 'sport_specific'),
    ('basketball', 'help defense', 'help_defense', 'sport_specific'),
    ('basketball', 'on-ball defense', 'on_ball_defense', 'sport_specific'),
    ('basketball', 'off-ball defense', 'off_ball_defense', 'sport_specific'),
    ('basketball', 'transition offense', 'transition_offense', 'sport_specific'),
    ('basketball', 'transition defense', 'transition_defense', 'sport_specific'),
    ('basketball', 'spacing', 'spacing', 'sport_specific'),
    ('basketball', 'cutting', 'cutting', 'sport_specific'),
    ('basketball', 'screening', 'screening', 'sport_specific'),
    ('basketball', 'press', 'press', 'sport_specific'),
    ('basketball', 'press break', 'press_break', 'sport_specific'),
    ('basketball', 'zone offense', 'zone_offense', 'sport_specific'),
    ('basketball', 'zone defense', 'zone_defense', 'sport_specific'),
    ('basketball', 'man offense', 'man_offense', 'sport_specific'),
    ('basketball', 'man defense', 'man_defense', 'sport_specific'),
    ('basketball', 'free throws', 'free_throws', 'sport_specific'),
    ('basketball', 'inbounds / BLOB / SLOB', 'inbounds_blob_slob', 'sport_specific'),
    ('basketball', 'communication', 'communication', 'sport_specific'),
    ('basketball', 'conditioning', 'conditioning', 'sport_specific'),
    ('soccer', 'dribbling', 'dribbling', 'sport_specific'),
    ('soccer', 'first touch', 'first_touch', 'sport_specific'),
    ('soccer', 'passing', 'passing', 'sport_specific'),
    ('soccer', 'receiving', 'receiving', 'sport_specific'),
    ('soccer', 'possession', 'possession', 'sport_specific'),
    ('soccer', 'finishing', 'finishing', 'sport_specific'),
    ('soccer', 'shooting', 'shooting', 'sport_specific'),
    ('soccer', 'crossing', 'crossing', 'sport_specific'),
    ('soccer', 'defending', 'defending', 'sport_specific'),
    ('soccer', 'pressing', 'pressing', 'sport_specific'),
    ('soccer', 'tackling', 'tackling', 'sport_specific'),
    ('soccer', 'marking', 'marking', 'sport_specific'),
    ('soccer', 'spacing', 'spacing', 'sport_specific'),
    ('soccer', 'movement off ball', 'movement_off_ball', 'sport_specific'),
    ('soccer', 'transition attack', 'transition_attack', 'sport_specific'),
    ('soccer', 'transition defense', 'transition_defense', 'sport_specific'),
    ('soccer', 'small-sided games', 'small_sided_games', 'sport_specific'),
    ('soccer', 'set pieces', 'set_pieces', 'sport_specific'),
    ('soccer', 'goalkeeping', 'goalkeeping', 'sport_specific'),
    ('soccer', 'communication', 'communication', 'sport_specific'),
    ('soccer', 'conditioning', 'conditioning', 'sport_specific'),
    ('baseball', 'throwing', 'throwing', 'sport_specific'),
    ('baseball', 'catching', 'catching', 'sport_specific'),
    ('baseball', 'fielding', 'fielding', 'sport_specific'),
    ('baseball', 'ground balls', 'ground_balls', 'sport_specific'),
    ('baseball', 'fly balls', 'fly_balls', 'sport_specific'),
    ('baseball', 'hitting', 'hitting', 'sport_specific'),
    ('baseball', 'bunting', 'bunting', 'sport_specific'),
    ('baseball', 'base running', 'base_running', 'sport_specific'),
    ('baseball', 'sliding', 'sliding', 'sport_specific'),
    ('baseball', 'pitching', 'pitching', 'sport_specific'),
    ('baseball', 'catching position', 'catching_position', 'sport_specific'),
    ('baseball', 'cutoffs', 'cutoffs', 'sport_specific'),
    ('baseball', 'relays', 'relays', 'sport_specific'),
    ('baseball', 'rundowns', 'rundowns', 'sport_specific'),
    ('baseball', 'situational defense', 'situational_defense', 'sport_specific'),
    ('baseball', 'first-and-third defense', 'first_and_third_defense', 'sport_specific'),
    ('baseball', 'infield work', 'infield_work', 'sport_specific'),
    ('baseball', 'outfield work', 'outfield_work', 'sport_specific'),
    ('baseball', 'communication', 'communication', 'sport_specific'),
    ('baseball', 'conditioning', 'conditioning', 'sport_specific'),
    ('softball', 'throwing', 'throwing', 'sport_specific'),
    ('softball', 'catching', 'catching', 'sport_specific'),
    ('softball', 'fielding', 'fielding', 'sport_specific'),
    ('softball', 'ground balls', 'ground_balls', 'sport_specific'),
    ('softball', 'fly balls', 'fly_balls', 'sport_specific'),
    ('softball', 'hitting', 'hitting', 'sport_specific'),
    ('softball', 'bunting', 'bunting', 'sport_specific'),
    ('softball', 'base running', 'base_running', 'sport_specific'),
    ('softball', 'sliding', 'sliding', 'sport_specific'),
    ('softball', 'pitching', 'pitching', 'sport_specific'),
    ('softball', 'catching position', 'catching_position', 'sport_specific'),
    ('softball', 'cutoffs', 'cutoffs', 'sport_specific'),
    ('softball', 'relays', 'relays', 'sport_specific'),
    ('softball', 'rundowns', 'rundowns', 'sport_specific'),
    ('softball', 'situational defense', 'situational_defense', 'sport_specific'),
    ('softball', 'first-and-third defense', 'first_and_third_defense', 'sport_specific'),
    ('softball', 'infield work', 'infield_work', 'sport_specific'),
    ('softball', 'outfield work', 'outfield_work', 'sport_specific'),
    ('softball', 'communication', 'communication', 'sport_specific'),
    ('softball', 'conditioning', 'conditioning', 'sport_specific'),
    ('volleyball', 'serving', 'serving', 'sport_specific'),
    ('volleyball', 'serve receive', 'serve_receive', 'sport_specific'),
    ('volleyball', 'passing', 'passing', 'sport_specific'),
    ('volleyball', 'setting', 'setting', 'sport_specific'),
    ('volleyball', 'hitting', 'hitting', 'sport_specific'),
    ('volleyball', 'blocking', 'blocking', 'sport_specific'),
    ('volleyball', 'digging', 'digging', 'sport_specific'),
    ('volleyball', 'defensive positioning', 'defensive_positioning', 'sport_specific'),
    ('volleyball', 'transition offense', 'transition_offense', 'sport_specific'),
    ('volleyball', 'transition defense', 'transition_defense', 'sport_specific'),
    ('volleyball', 'coverage', 'coverage', 'sport_specific'),
    ('volleyball', 'rotations', 'rotations', 'sport_specific'),
    ('volleyball', 'communication', 'communication', 'sport_specific'),
    ('volleyball', 'footwork', 'footwork', 'sport_specific'),
    ('volleyball', 'conditioning', 'conditioning', 'sport_specific'),
    ('volleyball', 'out-of-system play', 'out_of_system_play', 'sport_specific')
)
insert into public.sport_tags (sport_key, tag_name, tag_slug, category)
select sc.sport_key, ut.tag_name, ut.tag_slug, ut.category
from public.sport_configs sc
cross join universal_tags ut
on conflict (sport_key, tag_slug, category) do update
set
  tag_name = excluded.tag_name,
  category = excluded.category,
  updated_at = timezone('utc', now());

with sport_specific_tags(sport_key, tag_name, tag_slug, category) as (
  values
    ('basketball', 'shooting', 'shooting', 'sport_specific'),
    ('basketball', 'finishing', 'finishing', 'sport_specific'),
    ('basketball', 'footwork', 'footwork', 'sport_specific'),
    ('basketball', 'ball handling', 'ball_handling', 'sport_specific'),
    ('basketball', 'passing', 'passing', 'sport_specific'),
    ('basketball', 'decision-making', 'decision_making', 'sport_specific'),
    ('basketball', 'rebounding', 'rebounding', 'sport_specific'),
    ('basketball', 'boxing out', 'boxing_out', 'sport_specific'),
    ('basketball', 'closeouts', 'closeouts', 'sport_specific'),
    ('basketball', 'help defense', 'help_defense', 'sport_specific'),
    ('basketball', 'on-ball defense', 'on_ball_defense', 'sport_specific'),
    ('basketball', 'off-ball defense', 'off_ball_defense', 'sport_specific'),
    ('basketball', 'transition offense', 'transition_offense', 'sport_specific'),
    ('basketball', 'transition defense', 'transition_defense', 'sport_specific'),
    ('basketball', 'spacing', 'spacing', 'sport_specific'),
    ('basketball', 'cutting', 'cutting', 'sport_specific'),
    ('basketball', 'screening', 'screening', 'sport_specific'),
    ('basketball', 'press', 'press', 'sport_specific'),
    ('basketball', 'press break', 'press_break', 'sport_specific'),
    ('basketball', 'zone offense', 'zone_offense', 'sport_specific'),
    ('basketball', 'zone defense', 'zone_defense', 'sport_specific'),
    ('basketball', 'man offense', 'man_offense', 'sport_specific'),
    ('basketball', 'man defense', 'man_defense', 'sport_specific'),
    ('basketball', 'free throws', 'free_throws', 'sport_specific'),
    ('basketball', 'inbounds / BLOB / SLOB', 'inbounds_blob_slob', 'sport_specific'),
    ('basketball', 'communication', 'communication', 'sport_specific'),
    ('basketball', 'conditioning', 'conditioning', 'sport_specific'),
    ('soccer', 'dribbling', 'dribbling', 'sport_specific'),
    ('soccer', 'first touch', 'first_touch', 'sport_specific'),
    ('soccer', 'passing', 'passing', 'sport_specific'),
    ('soccer', 'receiving', 'receiving', 'sport_specific'),
    ('soccer', 'possession', 'possession', 'sport_specific'),
    ('soccer', 'finishing', 'finishing', 'sport_specific'),
    ('soccer', 'shooting', 'shooting', 'sport_specific'),
    ('soccer', 'crossing', 'crossing', 'sport_specific'),
    ('soccer', 'defending', 'defending', 'sport_specific'),
    ('soccer', 'pressing', 'pressing', 'sport_specific'),
    ('soccer', 'tackling', 'tackling', 'sport_specific'),
    ('soccer', 'marking', 'marking', 'sport_specific'),
    ('soccer', 'spacing', 'spacing', 'sport_specific'),
    ('soccer', 'movement off ball', 'movement_off_ball', 'sport_specific'),
    ('soccer', 'transition attack', 'transition_attack', 'sport_specific'),
    ('soccer', 'transition defense', 'transition_defense', 'sport_specific'),
    ('soccer', 'small-sided games', 'small_sided_games', 'sport_specific'),
    ('soccer', 'set pieces', 'set_pieces', 'sport_specific'),
    ('soccer', 'goalkeeping', 'goalkeeping', 'sport_specific'),
    ('soccer', 'communication', 'communication', 'sport_specific'),
    ('soccer', 'conditioning', 'conditioning', 'sport_specific'),
    ('baseball', 'throwing', 'throwing', 'sport_specific'),
    ('baseball', 'catching', 'catching', 'sport_specific'),
    ('baseball', 'fielding', 'fielding', 'sport_specific'),
    ('baseball', 'ground balls', 'ground_balls', 'sport_specific'),
    ('baseball', 'fly balls', 'fly_balls', 'sport_specific'),
    ('baseball', 'hitting', 'hitting', 'sport_specific'),
    ('baseball', 'bunting', 'bunting', 'sport_specific'),
    ('baseball', 'base running', 'base_running', 'sport_specific'),
    ('baseball', 'sliding', 'sliding', 'sport_specific'),
    ('baseball', 'pitching', 'pitching', 'sport_specific'),
    ('baseball', 'catching position', 'catching_position', 'sport_specific'),
    ('baseball', 'cutoffs', 'cutoffs', 'sport_specific'),
    ('baseball', 'relays', 'relays', 'sport_specific'),
    ('baseball', 'rundowns', 'rundowns', 'sport_specific'),
    ('baseball', 'situational defense', 'situational_defense', 'sport_specific'),
    ('baseball', 'first-and-third defense', 'first_and_third_defense', 'sport_specific'),
    ('baseball', 'infield work', 'infield_work', 'sport_specific'),
    ('baseball', 'outfield work', 'outfield_work', 'sport_specific'),
    ('baseball', 'communication', 'communication', 'sport_specific'),
    ('baseball', 'conditioning', 'conditioning', 'sport_specific'),
    ('softball', 'throwing', 'throwing', 'sport_specific'),
    ('softball', 'catching', 'catching', 'sport_specific'),
    ('softball', 'fielding', 'fielding', 'sport_specific'),
    ('softball', 'ground balls', 'ground_balls', 'sport_specific'),
    ('softball', 'fly balls', 'fly_balls', 'sport_specific'),
    ('softball', 'hitting', 'hitting', 'sport_specific'),
    ('softball', 'bunting', 'bunting', 'sport_specific'),
    ('softball', 'base running', 'base_running', 'sport_specific'),
    ('softball', 'sliding', 'sliding', 'sport_specific'),
    ('softball', 'pitching', 'pitching', 'sport_specific'),
    ('softball', 'catching position', 'catching_position', 'sport_specific'),
    ('softball', 'cutoffs', 'cutoffs', 'sport_specific'),
    ('softball', 'relays', 'relays', 'sport_specific'),
    ('softball', 'rundowns', 'rundowns', 'sport_specific'),
    ('softball', 'situational defense', 'situational_defense', 'sport_specific'),
    ('softball', 'first-and-third defense', 'first_and_third_defense', 'sport_specific'),
    ('softball', 'infield work', 'infield_work', 'sport_specific'),
    ('softball', 'outfield work', 'outfield_work', 'sport_specific'),
    ('softball', 'communication', 'communication', 'sport_specific'),
    ('softball', 'conditioning', 'conditioning', 'sport_specific'),
    ('volleyball', 'serving', 'serving', 'sport_specific'),
    ('volleyball', 'serve receive', 'serve_receive', 'sport_specific'),
    ('volleyball', 'passing', 'passing', 'sport_specific'),
    ('volleyball', 'setting', 'setting', 'sport_specific'),
    ('volleyball', 'hitting', 'hitting', 'sport_specific'),
    ('volleyball', 'blocking', 'blocking', 'sport_specific'),
    ('volleyball', 'digging', 'digging', 'sport_specific'),
    ('volleyball', 'defensive positioning', 'defensive_positioning', 'sport_specific'),
    ('volleyball', 'transition offense', 'transition_offense', 'sport_specific'),
    ('volleyball', 'transition defense', 'transition_defense', 'sport_specific'),
    ('volleyball', 'coverage', 'coverage', 'sport_specific'),
    ('volleyball', 'rotations', 'rotations', 'sport_specific'),
    ('volleyball', 'communication', 'communication', 'sport_specific'),
    ('volleyball', 'footwork', 'footwork', 'sport_specific'),
    ('volleyball', 'conditioning', 'conditioning', 'sport_specific'),
    ('volleyball', 'out-of-system play', 'out_of_system_play', 'sport_specific')
)
insert into public.sport_tags (sport_key, tag_name, tag_slug, category)
select sport_key, tag_name, tag_slug, category
from sport_specific_tags
on conflict (sport_key, tag_slug, category) do update
set
  tag_name = excluded.tag_name,
  category = excluded.category,
  updated_at = timezone('utc', now());

with template_seed(template_key, display_name, sort_order) as (
  values
    ('warmup', 'Warmup', 1),
    ('offense', 'Offense', 2),
    ('defense', 'Defense', 3),
    ('transition', 'Transition', 4),
    ('situational', 'Situational', 5),
    ('conditioning', 'Conditioning', 6)
)
insert into public.practice_block_templates (sport_key, template_key, display_name, sort_order)
select sc.sport_key, ts.template_key, ts.display_name, ts.sort_order
from public.sport_configs sc
cross join template_seed ts
on conflict (sport_key, template_key) do update
set
  display_name = excluded.display_name,
  sort_order = excluded.sort_order,
  updated_at = timezone('utc', now());
