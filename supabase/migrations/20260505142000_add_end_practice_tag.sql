-- Add "end practice" as an Additional tag (non-universal).
insert into public.sport_tags (sport_key, tag_name, tag_slug, category)
select
  sc.sport_key,
  'end practice',
  'end_practice',
  'sport_specific'
from public.sport_configs sc
on conflict (sport_key, tag_slug, category) do update
set
  tag_name = excluded.tag_name,
  updated_at = timezone('utc', now());
