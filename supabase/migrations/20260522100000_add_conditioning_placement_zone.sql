-- Add 'conditioning' as a valid placement_zone everywhere the constraint is enforced.
-- A coach builds conditioning drills and can designate conditioning time in a practice.
-- Purely additive — existing rows are unaffected.

-- drills
alter table public.drills
  drop constraint if exists drills_placement_zone_check;
alter table public.drills
  add constraint drills_placement_zone_check
  check (placement_zone in ('warmup', 'offense', 'defense', 'situational', 'conditioning', 'end_practice', 'general'));

-- practice_template_blocks
alter table public.practice_template_blocks
  drop constraint if exists practice_template_blocks_placement_zone_check;
alter table public.practice_template_blocks
  add constraint practice_template_blocks_placement_zone_check
  check (placement_zone in ('warmup', 'offense', 'defense', 'situational', 'conditioning', 'end_practice', 'general'));

-- practice_blocks
alter table public.practice_blocks
  drop constraint if exists practice_blocks_placement_zone_check;
alter table public.practice_blocks
  add constraint practice_blocks_placement_zone_check
  check (
    placement_zone is null
    or placement_zone in ('warmup', 'offense', 'defense', 'situational', 'conditioning', 'end_practice', 'general')
  );
