alter table public.drills
add column if not exists primary_goal_slug text;

with main_goal_map as (
  select
    dtm.drill_id,
    st.tag_slug,
    row_number() over (
      partition by dtm.drill_id
      order by case st.tag_slug
        when 'warmup' then 1
        when 'offense' then 2
        when 'defense' then 3
        when 'scrimmage' then 4
        when 'communication' then 5
        when 'conditioning' then 6
        when 'competitive' then 7
        else 99
      end
    ) as row_num
  from public.drill_tag_map dtm
  join public.sport_tags st on st.id = dtm.tag_id
  where st.category = 'universal'
    and st.tag_slug in ('warmup', 'offense', 'defense', 'scrimmage', 'communication', 'conditioning', 'competitive')
)
update public.drills d
set primary_goal_slug = coalesce(
  (
    select mgm.tag_slug
    from main_goal_map mgm
    where mgm.drill_id = d.id
      and mgm.row_num = 1
  ),
  case
    when d.drill_type = 'warmup' then 'warmup'
    when d.drill_type = 'conditioning' then 'conditioning'
    when d.drill_type = 'scrimmage' then 'scrimmage'
    else 'competitive'
  end
)
where d.primary_goal_slug is null;

delete from public.drill_tag_map dtm
using public.sport_tags st
where st.id = dtm.tag_id
  and st.category = 'universal'
  and st.tag_slug in ('warmup', 'offense', 'defense', 'scrimmage', 'communication', 'conditioning', 'competitive');

alter table public.drills
alter column primary_goal_slug set not null;

alter table public.drills
drop constraint if exists drills_primary_goal_slug_check;

alter table public.drills
add constraint drills_primary_goal_slug_check
check (primary_goal_slug in ('warmup', 'offense', 'defense', 'scrimmage', 'communication', 'conditioning', 'competitive'));

create index if not exists drills_primary_goal_slug_idx
on public.drills (primary_goal_slug);
