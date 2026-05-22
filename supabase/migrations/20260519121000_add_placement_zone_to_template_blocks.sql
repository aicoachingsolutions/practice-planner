-- Add placement_zone and allows_subcategory_focus to practice_template_blocks
-- placement_zone: tells auto-build which drill zone fills this block
-- allows_subcategory_focus: whether the coach can pin a sub-focus tag for this block (offense/defense only)

alter table public.practice_template_blocks
  add column if not exists placement_zone text not null default 'general',
  add column if not exists allows_subcategory_focus boolean not null default false;

alter table public.practice_template_blocks
  drop constraint if exists practice_template_blocks_placement_zone_check;

alter table public.practice_template_blocks
  add constraint practice_template_blocks_placement_zone_check
  check (placement_zone in ('warmup', 'offense', 'defense', 'situational', 'end_practice', 'general'));

create index if not exists practice_template_blocks_placement_zone_idx
  on public.practice_template_blocks (placement_zone);
