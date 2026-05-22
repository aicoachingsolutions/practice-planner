-- Replace additional tag "scrimmage" with "trapping".
insert into public.sport_tags (sport_key, tag_name, tag_slug, category)
select
  sc.sport_key,
  'trapping',
  'trapping',
  'sport_specific'
from public.sport_configs sc
on conflict (sport_key, tag_slug, category) do update
set
  tag_name = excluded.tag_name,
  updated_at = timezone('utc', now());

delete from public.sport_tags
where tag_slug = 'scrimmage'
  and category in ('sport_specific', 'universal');
