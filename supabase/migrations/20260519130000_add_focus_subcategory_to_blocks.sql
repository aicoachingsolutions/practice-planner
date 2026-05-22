-- Add placement_zone and focus_subcategory_tag_slug to practice_blocks
-- placement_zone: persisted so we don't have to re-derive from name/template_id on every read
-- focus_subcategory_tag_slug: coach-pinned sub-focus (e.g. "pick_and_roll") for the block

alter table public.practice_blocks
  add column if not exists placement_zone text,
  add column if not exists focus_subcategory_tag_slug text;

alter table public.practice_blocks
  drop constraint if exists practice_blocks_placement_zone_check;

alter table public.practice_blocks
  add constraint practice_blocks_placement_zone_check
  check (
    placement_zone is null
    or placement_zone in ('warmup', 'offense', 'defense', 'situational', 'end_practice', 'general')
  );

create index if not exists practice_blocks_placement_zone_idx
  on public.practice_blocks (placement_zone)
  where placement_zone is not null;

create index if not exists practice_blocks_focus_subcategory_idx
  on public.practice_blocks (focus_subcategory_tag_slug)
  where focus_subcategory_tag_slug is not null;
