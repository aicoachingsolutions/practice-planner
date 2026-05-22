alter table public.practice_blocks
  add column if not exists start_minute integer,
  add column if not exists item_type text;

with ordered as (
  select
    id,
    coalesce(
      sum(coalesce(planned_duration_minutes, 0)) over (
        partition by practice_id
        order by block_order
        rows between unbounded preceding and 1 preceding
      ),
      0
    ) as computed_start
  from public.practice_blocks
)
update public.practice_blocks pb
set start_minute = o.computed_start
from ordered o
where pb.id = o.id
  and pb.start_minute is null;

update public.practice_blocks
set item_type =
  case
    when item_type is not null then item_type
    when lower(block_name) like '%warmup%' then 'warmup'
    else 'drill_gap'
  end
where item_type is null;

alter table public.practice_blocks
  alter column start_minute set default 0,
  alter column start_minute set not null,
  alter column item_type set default 'drill_gap',
  alter column item_type set not null;

alter table public.practice_blocks
  drop constraint if exists practice_blocks_start_minute_non_negative,
  add constraint practice_blocks_start_minute_non_negative check (start_minute >= 0),
  drop constraint if exists practice_blocks_item_type_check,
  add constraint practice_blocks_item_type_check check (item_type in ('warmup', 'focus_anchor', 'drill_gap'));
