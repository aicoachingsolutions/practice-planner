-- Seed 4 additional universal practice templates for every sport:
--   quick_session, game_day_shootaround, skills_day, scrimmage_day
--
-- Coaches pick from these on the practice form alongside the existing "standard" template.
-- Same content/structure for all 5 sports; sport-specific drill filling happens at auto-build time.

insert into public.practice_templates (sport_key, template_key, display_name, description, sort_order, is_active)
values
  -- Quick session
  ('basketball', 'quick_session',         'Basketball — Quick session',         'Short 45-minute practice: warmup, offense, defense, optional scrimmage, end.',                      2, true),
  ('soccer',     'quick_session',         'Soccer — Quick session',             'Short 45-minute practice: warmup, offense, defense, optional scrimmage, end.',                      2, true),
  ('volleyball', 'quick_session',         'Volleyball — Quick session',         'Short 45-minute practice: warmup, offense, defense, optional scrimmage, end.',                      2, true),
  ('baseball',   'quick_session',         'Baseball — Quick session',           'Short 45-minute practice: warmup, defense, offense, optional scrimmage, end.',                      2, true),
  ('softball',   'quick_session',         'Softball — Quick session',           'Short 45-minute practice: warmup, defense, offense, optional scrimmage, end.',                      2, true),

  -- Game day shootaround / walkthrough
  ('basketball', 'game_day_shootaround',  'Basketball — Game day shootaround',  'Light pre-game tempo: walkthrough offense and defense, optional shooting, optional situations, end.', 3, true),
  ('soccer',     'game_day_shootaround',  'Soccer — Game day walkthrough',      'Light pre-game tempo: walkthrough offense and defense, optional finishing, optional set pieces, end.', 3, true),
  ('volleyball', 'game_day_shootaround',  'Volleyball — Game day walkthrough',  'Light pre-game tempo: walkthrough offense and defense, optional serving, optional situations, end.',  3, true),
  ('baseball',   'game_day_shootaround',  'Baseball — Game day walkthrough',    'Light pre-game tempo: walkthrough defense and offense, optional BP, optional situations, end.',      3, true),
  ('softball',   'game_day_shootaround',  'Softball — Game day walkthrough',    'Light pre-game tempo: walkthrough defense and offense, optional BP, optional situations, end.',      3, true),

  -- Skills day
  ('basketball', 'skills_day',            'Basketball — Skills day',            'Skill development focus: individual skills, small group skills, optional light scrimmage, end.',     4, true),
  ('soccer',     'skills_day',            'Soccer — Skills day',                'Skill development focus: individual skills, small group skills, optional light scrimmage, end.',     4, true),
  ('volleyball', 'skills_day',            'Volleyball — Skills day',            'Skill development focus: individual skills, small group skills, optional light scrimmage, end.',     4, true),
  ('baseball',   'skills_day',            'Baseball — Skills day',              'Skill development focus: individual skills, small group skills, optional light scrimmage, end.',     4, true),
  ('softball',   'skills_day',            'Softball — Skills day',              'Skill development focus: individual skills, small group skills, optional light scrimmage, end.',     4, true),

  -- Scrimmage day
  ('basketball', 'scrimmage_day',         'Basketball — Scrimmage day',         'Competitive scrimmage focus: short situations, main scrimmage, optional close-out game, end.',       5, true),
  ('soccer',     'scrimmage_day',         'Soccer — Scrimmage day',             'Competitive scrimmage focus: short situations, main scrimmage, optional close-out game, end.',       5, true),
  ('volleyball', 'scrimmage_day',         'Volleyball — Scrimmage day',         'Competitive scrimmage focus: short situations, main scrimmage, optional close-out game, end.',       5, true),
  ('baseball',   'scrimmage_day',         'Baseball — Scrimmage day',           'Competitive scrimmage focus: short situations, simulated innings, optional close-out game, end.',   5, true),
  ('softball',   'scrimmage_day',         'Softball — Scrimmage day',           'Competitive scrimmage focus: short situations, simulated innings, optional close-out game, end.',   5, true)
on conflict (sport_key, template_key) do update
  set display_name = excluded.display_name,
      description = excluded.description,
      sort_order = excluded.sort_order,
      is_active = excluded.is_active,
      updated_at = timezone('utc', now());

-- Block definitions per template. Joined to templates by (sport_key, template_key).
with block_seed (sport_key, template_key, block_key, block_name, block_order, default_duration_minutes, item_type, placement_zone, is_optional, allows_subcategory_focus) as (
  values
    -- ============================================================
    -- QUICK SESSION (45 min default)
    -- ============================================================
    ('basketball', 'quick_session', 'warmup',        'Warmup',          1,  8, 'warmup',       'warmup',       false, false),
    ('basketball', 'quick_session', 'offense_focus', 'Offense focus',   2, 12, 'focus_anchor', 'offense',      false, true),
    ('basketball', 'quick_session', 'defense_focus', 'Defense focus',   3, 12, 'focus_anchor', 'defense',      false, true),
    ('basketball', 'quick_session', 'scrimmage',     'Scrimmage',       4, 10, 'focus_anchor', 'general',      true,  false),
    ('basketball', 'quick_session', 'end_practice',  'End of practice', 5,  3, 'focus_anchor', 'end_practice', false, false),

    ('soccer',     'quick_session', 'warmup',        'Warmup',          1,  8, 'warmup',       'warmup',       false, false),
    ('soccer',     'quick_session', 'offense_focus', 'Offense focus',   2, 12, 'focus_anchor', 'offense',      false, true),
    ('soccer',     'quick_session', 'defense_focus', 'Defense focus',   3, 12, 'focus_anchor', 'defense',      false, true),
    ('soccer',     'quick_session', 'scrimmage',     'Scrimmage',       4, 10, 'focus_anchor', 'general',      true,  false),
    ('soccer',     'quick_session', 'end_practice',  'End of practice', 5,  3, 'focus_anchor', 'end_practice', false, false),

    ('volleyball', 'quick_session', 'warmup',        'Warmup',          1,  8, 'warmup',       'warmup',       false, false),
    ('volleyball', 'quick_session', 'offense_focus', 'Offense focus',   2, 12, 'focus_anchor', 'offense',      false, true),
    ('volleyball', 'quick_session', 'defense_focus', 'Defense focus',   3, 12, 'focus_anchor', 'defense',      false, true),
    ('volleyball', 'quick_session', 'scrimmage',     'Scrimmage',       4, 10, 'focus_anchor', 'general',      true,  false),
    ('volleyball', 'quick_session', 'end_practice',  'End of practice', 5,  3, 'focus_anchor', 'end_practice', false, false),

    ('baseball',   'quick_session', 'warmup',        'Warmup',          1,  8, 'warmup',       'warmup',       false, false),
    ('baseball',   'quick_session', 'defense_focus', 'Defense focus',   2, 12, 'focus_anchor', 'defense',      false, true),
    ('baseball',   'quick_session', 'offense_focus', 'Offense focus',   3, 12, 'focus_anchor', 'offense',      false, true),
    ('baseball',   'quick_session', 'scrimmage',     'Scrimmage',       4, 10, 'focus_anchor', 'general',      true,  false),
    ('baseball',   'quick_session', 'end_practice',  'End of practice', 5,  3, 'focus_anchor', 'end_practice', false, false),

    ('softball',   'quick_session', 'warmup',        'Warmup',          1,  8, 'warmup',       'warmup',       false, false),
    ('softball',   'quick_session', 'defense_focus', 'Defense focus',   2, 12, 'focus_anchor', 'defense',      false, true),
    ('softball',   'quick_session', 'offense_focus', 'Offense focus',   3, 12, 'focus_anchor', 'offense',      false, true),
    ('softball',   'quick_session', 'scrimmage',     'Scrimmage',       4, 10, 'focus_anchor', 'general',      true,  false),
    ('softball',   'quick_session', 'end_practice',  'End of practice', 5,  3, 'focus_anchor', 'end_practice', false, false),

    -- ============================================================
    -- GAME DAY SHOOTAROUND / WALKTHROUGH (45 min default)
    -- ============================================================
    ('basketball', 'game_day_shootaround', 'warmup',              'Warmup',                  1,  8, 'warmup',       'warmup',       false, false),
    ('basketball', 'game_day_shootaround', 'offense_walkthrough', 'Offensive walkthrough',   2, 12, 'focus_anchor', 'offense',      false, true),
    ('basketball', 'game_day_shootaround', 'defense_walkthrough', 'Defensive walkthrough',   3, 10, 'focus_anchor', 'defense',      false, true),
    ('basketball', 'game_day_shootaround', 'shooting',            'Shooting / individual',   4,  8, 'focus_anchor', 'general',      true,  false),
    ('basketball', 'game_day_shootaround', 'situations',          'Situations',              5,  8, 'focus_anchor', 'situational',  true,  true),
    ('basketball', 'game_day_shootaround', 'end_practice',        'End of practice',         6,  4, 'focus_anchor', 'end_practice', false, false),

    ('soccer',     'game_day_shootaround', 'warmup',              'Warmup',                  1,  8, 'warmup',       'warmup',       false, false),
    ('soccer',     'game_day_shootaround', 'offense_walkthrough', 'Offensive walkthrough',   2, 12, 'focus_anchor', 'offense',      false, true),
    ('soccer',     'game_day_shootaround', 'defense_walkthrough', 'Defensive walkthrough',   3, 10, 'focus_anchor', 'defense',      false, true),
    ('soccer',     'game_day_shootaround', 'finishing',           'Finishing / individual',  4,  8, 'focus_anchor', 'general',      true,  false),
    ('soccer',     'game_day_shootaround', 'situations',          'Set pieces',              5,  8, 'focus_anchor', 'situational',  true,  true),
    ('soccer',     'game_day_shootaround', 'end_practice',        'End of practice',         6,  4, 'focus_anchor', 'end_practice', false, false),

    ('volleyball', 'game_day_shootaround', 'warmup',              'Warmup',                  1,  8, 'warmup',       'warmup',       false, false),
    ('volleyball', 'game_day_shootaround', 'offense_walkthrough', 'Offensive walkthrough',   2, 12, 'focus_anchor', 'offense',      false, true),
    ('volleyball', 'game_day_shootaround', 'defense_walkthrough', 'Defensive walkthrough',   3, 10, 'focus_anchor', 'defense',      false, true),
    ('volleyball', 'game_day_shootaround', 'serving',             'Serving / individual',    4,  8, 'focus_anchor', 'general',      true,  false),
    ('volleyball', 'game_day_shootaround', 'situations',          'Situations',              5,  8, 'focus_anchor', 'situational',  true,  true),
    ('volleyball', 'game_day_shootaround', 'end_practice',        'End of practice',         6,  4, 'focus_anchor', 'end_practice', false, false),

    ('baseball',   'game_day_shootaround', 'warmup',              'Warmup',                  1,  8, 'warmup',       'warmup',       false, false),
    ('baseball',   'game_day_shootaround', 'defense_walkthrough', 'Defensive walkthrough',   2, 12, 'focus_anchor', 'defense',      false, true),
    ('baseball',   'game_day_shootaround', 'offense_walkthrough', 'Offensive walkthrough',   3, 10, 'focus_anchor', 'offense',      false, true),
    ('baseball',   'game_day_shootaround', 'batting_practice',    'Batting practice',        4,  8, 'focus_anchor', 'general',      true,  false),
    ('baseball',   'game_day_shootaround', 'situations',          'Situations',              5,  8, 'focus_anchor', 'situational',  true,  true),
    ('baseball',   'game_day_shootaround', 'end_practice',        'End of practice',         6,  4, 'focus_anchor', 'end_practice', false, false),

    ('softball',   'game_day_shootaround', 'warmup',              'Warmup',                  1,  8, 'warmup',       'warmup',       false, false),
    ('softball',   'game_day_shootaround', 'defense_walkthrough', 'Defensive walkthrough',   2, 12, 'focus_anchor', 'defense',      false, true),
    ('softball',   'game_day_shootaround', 'offense_walkthrough', 'Offensive walkthrough',   3, 10, 'focus_anchor', 'offense',      false, true),
    ('softball',   'game_day_shootaround', 'batting_practice',    'Batting practice',        4,  8, 'focus_anchor', 'general',      true,  false),
    ('softball',   'game_day_shootaround', 'situations',          'Situations',              5,  8, 'focus_anchor', 'situational',  true,  true),
    ('softball',   'game_day_shootaround', 'end_practice',        'End of practice',         6,  4, 'focus_anchor', 'end_practice', false, false),

    -- ============================================================
    -- SKILLS DAY (75 min default)
    -- ============================================================
    ('basketball', 'skills_day', 'warmup',             'Warmup',             1, 10, 'warmup',       'warmup',       false, false),
    ('basketball', 'skills_day', 'individual_skills',  'Individual skills',  2, 25, 'focus_anchor', 'general',      false, true),
    ('basketball', 'skills_day', 'small_group_skills', 'Small group skills', 3, 20, 'focus_anchor', 'general',      false, true),
    ('basketball', 'skills_day', 'scrimmage',          'Light scrimmage',    4, 15, 'focus_anchor', 'general',      true,  false),
    ('basketball', 'skills_day', 'end_practice',       'End of practice',    5,  5, 'focus_anchor', 'end_practice', false, false),

    ('soccer',     'skills_day', 'warmup',             'Warmup',             1, 10, 'warmup',       'warmup',       false, false),
    ('soccer',     'skills_day', 'individual_skills',  'Individual skills',  2, 25, 'focus_anchor', 'general',      false, true),
    ('soccer',     'skills_day', 'small_group_skills', 'Small group skills', 3, 20, 'focus_anchor', 'general',      false, true),
    ('soccer',     'skills_day', 'scrimmage',          'Light scrimmage',    4, 15, 'focus_anchor', 'general',      true,  false),
    ('soccer',     'skills_day', 'end_practice',       'End of practice',    5,  5, 'focus_anchor', 'end_practice', false, false),

    ('volleyball', 'skills_day', 'warmup',             'Warmup',             1, 10, 'warmup',       'warmup',       false, false),
    ('volleyball', 'skills_day', 'individual_skills',  'Individual skills',  2, 25, 'focus_anchor', 'general',      false, true),
    ('volleyball', 'skills_day', 'small_group_skills', 'Small group skills', 3, 20, 'focus_anchor', 'general',      false, true),
    ('volleyball', 'skills_day', 'scrimmage',          'Light scrimmage',    4, 15, 'focus_anchor', 'general',      true,  false),
    ('volleyball', 'skills_day', 'end_practice',       'End of practice',    5,  5, 'focus_anchor', 'end_practice', false, false),

    ('baseball',   'skills_day', 'warmup',             'Warmup',             1, 10, 'warmup',       'warmup',       false, false),
    ('baseball',   'skills_day', 'individual_skills',  'Individual skills',  2, 25, 'focus_anchor', 'general',      false, true),
    ('baseball',   'skills_day', 'small_group_skills', 'Small group skills', 3, 20, 'focus_anchor', 'general',      false, true),
    ('baseball',   'skills_day', 'scrimmage',          'Light scrimmage',    4, 15, 'focus_anchor', 'general',      true,  false),
    ('baseball',   'skills_day', 'end_practice',       'End of practice',    5,  5, 'focus_anchor', 'end_practice', false, false),

    ('softball',   'skills_day', 'warmup',             'Warmup',             1, 10, 'warmup',       'warmup',       false, false),
    ('softball',   'skills_day', 'individual_skills',  'Individual skills',  2, 25, 'focus_anchor', 'general',      false, true),
    ('softball',   'skills_day', 'small_group_skills', 'Small group skills', 3, 20, 'focus_anchor', 'general',      false, true),
    ('softball',   'skills_day', 'scrimmage',          'Light scrimmage',    4, 15, 'focus_anchor', 'general',      true,  false),
    ('softball',   'skills_day', 'end_practice',       'End of practice',    5,  5, 'focus_anchor', 'end_practice', false, false),

    -- ============================================================
    -- SCRIMMAGE DAY (75 min default)
    -- ============================================================
    ('basketball', 'scrimmage_day', 'warmup',          'Warmup',                 1, 10, 'warmup',       'warmup',       false, false),
    ('basketball', 'scrimmage_day', 'situations',      'Short situations',       2, 10, 'focus_anchor', 'situational',  false, true),
    ('basketball', 'scrimmage_day', 'main_scrimmage',  'Main scrimmage',         3, 40, 'focus_anchor', 'general',      false, false),
    ('basketball', 'scrimmage_day', 'closeout',        'Competitive close-out',  4, 10, 'focus_anchor', 'general',      true,  false),
    ('basketball', 'scrimmage_day', 'end_practice',    'End of practice',        5,  5, 'focus_anchor', 'end_practice', false, false),

    ('soccer',     'scrimmage_day', 'warmup',          'Warmup',                 1, 10, 'warmup',       'warmup',       false, false),
    ('soccer',     'scrimmage_day', 'situations',      'Short situations',       2, 10, 'focus_anchor', 'situational',  false, true),
    ('soccer',     'scrimmage_day', 'main_scrimmage',  'Main scrimmage',         3, 40, 'focus_anchor', 'general',      false, false),
    ('soccer',     'scrimmage_day', 'closeout',        'Competitive close-out',  4, 10, 'focus_anchor', 'general',      true,  false),
    ('soccer',     'scrimmage_day', 'end_practice',    'End of practice',        5,  5, 'focus_anchor', 'end_practice', false, false),

    ('volleyball', 'scrimmage_day', 'warmup',          'Warmup',                 1, 10, 'warmup',       'warmup',       false, false),
    ('volleyball', 'scrimmage_day', 'situations',      'Short situations',       2, 10, 'focus_anchor', 'situational',  false, true),
    ('volleyball', 'scrimmage_day', 'main_scrimmage',  'Main scrimmage',         3, 40, 'focus_anchor', 'general',      false, false),
    ('volleyball', 'scrimmage_day', 'closeout',        'Competitive close-out',  4, 10, 'focus_anchor', 'general',      true,  false),
    ('volleyball', 'scrimmage_day', 'end_practice',    'End of practice',        5,  5, 'focus_anchor', 'end_practice', false, false),

    ('baseball',   'scrimmage_day', 'warmup',          'Warmup',                 1, 10, 'warmup',       'warmup',       false, false),
    ('baseball',   'scrimmage_day', 'situations',      'Short situations',       2, 10, 'focus_anchor', 'situational',  false, true),
    ('baseball',   'scrimmage_day', 'main_scrimmage',  'Simulated innings',      3, 40, 'focus_anchor', 'general',      false, false),
    ('baseball',   'scrimmage_day', 'closeout',        'Competitive close-out',  4, 10, 'focus_anchor', 'general',      true,  false),
    ('baseball',   'scrimmage_day', 'end_practice',    'End of practice',        5,  5, 'focus_anchor', 'end_practice', false, false),

    ('softball',   'scrimmage_day', 'warmup',          'Warmup',                 1, 10, 'warmup',       'warmup',       false, false),
    ('softball',   'scrimmage_day', 'situations',      'Short situations',       2, 10, 'focus_anchor', 'situational',  false, true),
    ('softball',   'scrimmage_day', 'main_scrimmage',  'Simulated innings',      3, 40, 'focus_anchor', 'general',      false, false),
    ('softball',   'scrimmage_day', 'closeout',        'Competitive close-out',  4, 10, 'focus_anchor', 'general',      true,  false),
    ('softball',   'scrimmage_day', 'end_practice',    'End of practice',        5,  5, 'focus_anchor', 'end_practice', false, false)
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
