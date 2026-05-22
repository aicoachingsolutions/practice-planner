create table if not exists public.practice_templates (
  id uuid primary key default gen_random_uuid(),
  sport_key text not null references public.sport_configs (sport_key) on delete cascade,
  template_key text not null,
  display_name text not null,
  description text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint practice_templates_unique unique (sport_key, template_key),
  constraint practice_templates_template_key_format check (template_key ~ '^[a-z0-9_]+$')
);

create table if not exists public.practice_template_blocks (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.practice_templates (id) on delete cascade,
  block_key text not null,
  block_name text not null,
  block_order integer not null,
  default_duration_minutes integer,
  item_type text not null default 'drill_gap',
  is_optional boolean not null default false,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint practice_template_blocks_unique_key unique (template_id, block_key),
  constraint practice_template_blocks_unique_order unique (template_id, block_order),
  constraint practice_template_blocks_block_key_format check (block_key ~ '^[a-z0-9_]+$'),
  constraint practice_template_blocks_order_non_negative check (block_order >= 0),
  constraint practice_template_blocks_duration_positive check (
    default_duration_minutes is null or default_duration_minutes > 0
  ),
  constraint practice_template_blocks_item_type_check check (
    item_type in ('warmup', 'focus_anchor', 'drill_gap')
  )
);

create index if not exists practice_templates_sport_key_idx
  on public.practice_templates (sport_key);

create index if not exists practice_templates_active_sort_idx
  on public.practice_templates (sport_key, is_active, sort_order);

create index if not exists practice_template_blocks_template_id_idx
  on public.practice_template_blocks (template_id);

drop trigger if exists set_practice_templates_updated_at on public.practice_templates;
create trigger set_practice_templates_updated_at
before update on public.practice_templates
for each row
execute function public.set_updated_at();

drop trigger if exists set_practice_template_blocks_updated_at on public.practice_template_blocks;
create trigger set_practice_template_blocks_updated_at
before update on public.practice_template_blocks
for each row
execute function public.set_updated_at();
