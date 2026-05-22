-- Seed default practice templates for each sport
-- One "standard" template per sport with placement-zone-aware blocks

insert into public.practice_templates (sport_key, template_key, display_name, description, sort_order, is_active)
values
  ('basketball', 'standard', 'Basketball — Standard', 'Warmup → offense focus → defense focus → optional situations/inbounds/scrimmage → end.', 1, true),
  ('soccer',     'standard', 'Soccer — Standard',     'Warmup → offense focus → defense focus → optional set pieces/transition/scrimmage → end.', 1, true),
  ('volleyball', 'standard', 'Volleyball — Standard', 'Warmup → offense focus → defense focus → optional situations/scrimmage → end.', 1, true),
  ('baseball',   'standard', 'Baseball — Standard',   'Warmup → defense focus → offense focus → optional situations/scrimmage → end.', 1, true),
  ('softball',   'standard', 'Softball — Standard',   'Warmup → defense focus → offense focus → optional situations/scrimmage → end.', 1, true)
on conflict (sport_key, template_key) do update
  set display_name = excluded.display_name,
      description = excluded.description,
      sort_order = excluded.sort_order,
      is_active = excluded.is_active,
      updated_at = timezone('utc', now());

-- Block definitions per sport. Joined to templates by (sport_key, template_key).
with block_seed (sport_key, template_key, block_key, block_name, block_order, default_duration_minutes, item_type, placement_zone, is_optional, allows_subcategory_focus) as (
  values
    -- BASKETBALL
    ('basketball', 'standard', 'warmup',         'Warmup',                   1, 10, 'warmup',       'warmup',       false, false),
    ('basketball', 'standard', 'offense_focus',  'Offense focus',            2, 20, 'focus_anchor', 'offense',      false, true),
    ('basketball', 'standard', 'defense_focus',  'Defense focus',            3, 20, 'focus_anchor', 'defense',      false, true),
    ('basketball', 'standard', 'situations',     'Special situations',       4, 10, 'focus_anchor', 'situational',  true,  true),
    ('basketball', 'standard', 'inbounds',       'Inbounds / SLOB / BLOB',   5,  8, 'focus_anchor', 'situational',  true,  false),
    ('basketball', 'standard', 'scrimmage',      'Scrimmage',                6, 15, 'focus_anchor', 'general',      true,  false),
    ('basketball', 'standard', 'end_practice',   'End of practice',          7,  5, 'focus_anchor', 'end_practice', false, false),

    -- SOCCER
    ('soccer',     'standard', 'warmup',         'Warmup',                   1, 10, 'warmup',       'warmup',       false, false),
    ('soccer',     'standard', 'offense_focus',  'Offense focus',            2, 20, 'focus_anchor', 'offense',      false, true),
    ('soccer',     'standard', 'defense_focus',  'Defense focus',            3, 20, 'focus_anchor', 'defense',      false, true),
    ('soccer',     'standard', 'set_pieces',     'Set pieces',               4, 10, 'focus_anchor', 'situational',  true,  false),
    ('soccer',     'standard', 'transition',     'Transition work',          5, 10, 'focus_anchor', 'general',      true,  true),
    ('soccer',     'standard', 'scrimmage',      'Scrimmage',                6, 20, 'focus_anchor', 'general',      true,  false),
    ('soccer',     'standard', 'end_practice',   'End of practice',          7,  5, 'focus_anchor', 'end_practice', false, false),

    -- VOLLEYBALL
    ('volleyball', 'standard', 'warmup',         'Warmup',                   1, 10, 'warmup',       'warmup',       false, false),
    ('volleyball', 'standard', 'offense_focus',  'Offense focus',            2, 20, 'focus_anchor', 'offense',      false, true),
    ('volleyball', 'standard', 'defense_focus',  'Defense focus',            3, 20, 'focus_anchor', 'defense',      false, true),
    ('volleyball', 'standard', 'situations',     'Situational play',         4, 12, 'focus_anchor', 'situational',  true,  true),
    ('volleyball', 'standard', 'scrimmage',      'Scrimmage',                5, 20, 'focus_anchor', 'general',      true,  false),
    ('volleyball', 'standard', 'end_practice',   'End of practice',          6,  5, 'focus_anchor', 'end_practice', false, false),

    -- BASEBALL
    ('baseball',   'standard', 'warmup',         'Warmup',                   1, 12, 'warmup',       'warmup',       false, false),
    ('baseball',   'standard', 'defense_focus',  'Defense focus',            2, 25, 'focus_anchor', 'defense',      false, true),
    ('baseball',   'standard', 'offense_focus',  'Offense focus',            3, 20, 'focus_anchor', 'offense',      false, true),
    ('baseball',   'standard', 'situations',     'Situational defense',      4, 15, 'focus_anchor', 'situational',  true,  true),
    ('baseball',   'standard', 'scrimmage',      'Scrimmage / sim innings',  5, 20, 'focus_anchor', 'general',      true,  false),
    ('baseball',   'standard', 'end_practice',   'End of practice',          6,  5, 'focus_anchor', 'end_practice', false, false),

    -- SOFTBALL
    ('softball',   'standard', 'warmup',         'Warmup',                   1, 12, 'warmup',       'warmup',       false, false),
    ('softball',   'standard', 'defense_focus',  'Defense focus',            2, 25, 'focus_anchor', 'defense',      false, true),
    ('softball',   'standard', 'offense_focus',  'Offense focus',            3, 20, 'focus_anchor', 'offense',      false, true),
    ('softball',   'standard', 'situations',     'Situational defense',      4, 15, 'focus_anchor', 'situational',  true,  true),
    ('softball',   'standard', 'scrimmage',      'Scrimmage / sim innings',  5, 20, 'focus_anchor', 'general',      true,  false),
    ('softball',   'standard', 'end_practice',   'End of practice',          6,  5, 'focus_anchor', 'end_practice', false, false)
)
insert into public.practice_template_blocks (
  template_id, block_key, block_name, block_order,
  default_duration_minutes, item_type, placement_zone, is_optional, allows_subcategory_focus
)
select
  pt.id,
  bs.block_key,
  bs.block_name,
  bs.block_order,
  bs.default_duration_minutes,
  bs.item_type,
  bs.placement_zone,
  bs.is_optional,
  bs.allows_subcategory_focus
from block_seed bs
join public.practice_templates pt
  on pt.sport_key = bs.sport_key
  and pt.template_key = bs.template_key
on conflict (template_id, block_key) do update
  set block_name = excluded.block_name,
      block_order = excluded.block_order,
      default_duration_minutes = excluded.default_duration_minutes,
      item_type = excluded.item_type,
      placement_zone = excluded.placement_zone,
      is_optional = excluded.is_optional,
      allows_subcategory_focus = excluded.allows_subcategory_focus,
      updated_at = timezone('utc', now());
