alter table public.drills
  add column if not exists placement_zone text not null default 'general';

update public.drills
set placement_zone = case
  when primary_goal_slug = 'warmup'    then 'warmup'
  when primary_goal_slug = 'offense'   then 'offense'
  when primary_goal_slug = 'defense'   then 'defense'
  when primary_goal_slug in ('scrimmage', 'situational') then 'situational'
  else 'general'
end;

alter table public.drills
  add constraint drills_placement_zone_check
  check (placement_zone in ('warmup', 'offense', 'defense', 'situational', 'end_practice', 'general'));
