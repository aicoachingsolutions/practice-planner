with starter_drills(
  sport_key,
  name,
  drill_type,
  default_duration_minutes,
  notes
) as (
  values
    ('basketball', 'Dynamic ball-handling warmup', 'warmup', 10, 'Full-group warmup with movement, ball control, and quick decision cues.'),
    ('basketball', 'Drive and finish series', 'small_group', 12, 'Finishing reps from multiple angles with a live read at the rim.'),
    ('basketball', 'Shell closeout rotation', 'team', 15, 'Half-court defensive shell focused on closeouts, help, and communication.'),
    ('soccer', 'Passing pattern warmup', 'warmup', 10, 'Progressive passing warmup emphasizing first touch and communication.'),
    ('soccer', 'Possession rondo', 'small_group', 12, 'Tight-space possession with quick support angles and receiving quality.'),
    ('soccer', 'Transition finishing waves', 'team', 15, 'Numbers-up transition attack to finishing with immediate recovery runs.'),
    ('baseball', 'Throwing progression', 'warmup', 10, 'Partner throwing build-up with footwork and arm-care emphasis.'),
    ('baseball', 'Infield ground-ball circuit', 'small_group', 12, 'Short-hop reads, funneling, and transfer work for infield groups.'),
    ('baseball', 'Cutoff and relay game', 'team', 15, 'Team defense rep set covering communication and relay responsibilities.'),
    ('softball', 'Dynamic throwing progression', 'warmup', 10, 'Partner throwing build-up with glove-side footwork and clean transfers.'),
    ('softball', 'Rapid-fire fielding series', 'small_group', 12, 'Controlled fielding reps for ground balls with quick reset tempo.'),
    ('softball', 'First-and-third defense live reps', 'team', 15, 'Team defense reps around communication, cuts, and decision-making.'),
    ('volleyball', 'Movement and platform warmup', 'warmup', 10, 'Warmup sequence for footwork, platform control, and communication.'),
    ('volleyball', 'Serve-receive passing lanes', 'small_group', 12, 'Serve-receive reps focused on seams, platform angle, and target passing.'),
    ('volleyball', 'Transition coverage game', 'team', 15, 'Team sequence for block coverage, transition offense, and scramble communication.')
),
inserted_drills as (
  insert into public.drills (
    owner_user_id,
    sport_key,
    source_type,
    copied_from_drill_id,
    name,
    drill_type,
    default_duration_minutes,
    priority,
    frequency,
    notes,
    is_active
  )
  select
    null,
    sd.sport_key,
    'system'::public.drill_source_type,
    null,
    sd.name,
    sd.drill_type::public.drill_type,
    sd.default_duration_minutes,
    4,
    'none'::public.frequency_rule,
    sd.notes,
    true
  from starter_drills sd
  where not exists (
    select 1
    from public.drills d
    where d.source_type = 'system'
      and d.sport_key = sd.sport_key
      and d.name = sd.name
  )
  returning id, sport_key, name
),
all_system_drills as (
  select id, sport_key, name
  from inserted_drills
  union all
  select d.id, d.sport_key, d.name
  from public.drills d
  join starter_drills sd
    on sd.sport_key = d.sport_key
   and sd.name = d.name
  where d.source_type = 'system'
),
drill_tag_seed(drill_name, sport_key, tag_slug, category) as (
  values
    ('Dynamic ball-handling warmup', 'basketball', 'warmup', 'universal'),
    ('Dynamic ball-handling warmup', 'basketball', 'ball_handling', 'sport_specific'),
    ('Dynamic ball-handling warmup', 'basketball', 'footwork', 'sport_specific'),
    ('Drive and finish series', 'basketball', 'offense', 'universal'),
    ('Drive and finish series', 'basketball', 'finishing', 'sport_specific'),
    ('Drive and finish series', 'basketball', 'decision_making', 'sport_specific'),
    ('Shell closeout rotation', 'basketball', 'defense', 'universal'),
    ('Shell closeout rotation', 'basketball', 'closeouts', 'sport_specific'),
    ('Shell closeout rotation', 'basketball', 'help_defense', 'sport_specific'),
    ('Passing pattern warmup', 'soccer', 'warmup', 'universal'),
    ('Passing pattern warmup', 'soccer', 'passing', 'sport_specific'),
    ('Passing pattern warmup', 'soccer', 'first_touch', 'sport_specific'),
    ('Possession rondo', 'soccer', 'team_skill', 'universal'),
    ('Possession rondo', 'soccer', 'possession', 'sport_specific'),
    ('Possession rondo', 'soccer', 'receiving', 'sport_specific'),
    ('Transition finishing waves', 'soccer', 'transition', 'universal'),
    ('Transition finishing waves', 'soccer', 'transition_attack', 'sport_specific'),
    ('Transition finishing waves', 'soccer', 'finishing', 'sport_specific'),
    ('Throwing progression', 'baseball', 'warmup', 'universal'),
    ('Throwing progression', 'baseball', 'throwing', 'sport_specific'),
    ('Throwing progression', 'baseball', 'catching', 'sport_specific'),
    ('Infield ground-ball circuit', 'baseball', 'individual_skill', 'universal'),
    ('Infield ground-ball circuit', 'baseball', 'ground_balls', 'sport_specific'),
    ('Infield ground-ball circuit', 'baseball', 'infield_work', 'sport_specific'),
    ('Cutoff and relay game', 'baseball', 'team_skill', 'universal'),
    ('Cutoff and relay game', 'baseball', 'cutoffs', 'sport_specific'),
    ('Cutoff and relay game', 'baseball', 'relays', 'sport_specific'),
    ('Dynamic throwing progression', 'softball', 'warmup', 'universal'),
    ('Dynamic throwing progression', 'softball', 'throwing', 'sport_specific'),
    ('Dynamic throwing progression', 'softball', 'catching', 'sport_specific'),
    ('Rapid-fire fielding series', 'softball', 'individual_skill', 'universal'),
    ('Rapid-fire fielding series', 'softball', 'fielding', 'sport_specific'),
    ('Rapid-fire fielding series', 'softball', 'ground_balls', 'sport_specific'),
    ('First-and-third defense live reps', 'softball', 'defense', 'universal'),
    ('First-and-third defense live reps', 'softball', 'situational_defense', 'sport_specific'),
    ('First-and-third defense live reps', 'softball', 'first_and_third_defense', 'sport_specific'),
    ('Movement and platform warmup', 'volleyball', 'warmup', 'universal'),
    ('Movement and platform warmup', 'volleyball', 'footwork', 'sport_specific'),
    ('Movement and platform warmup', 'volleyball', 'passing', 'sport_specific'),
    ('Serve-receive passing lanes', 'volleyball', 'team_skill', 'universal'),
    ('Serve-receive passing lanes', 'volleyball', 'serve_receive', 'sport_specific'),
    ('Serve-receive passing lanes', 'volleyball', 'passing', 'sport_specific'),
    ('Transition coverage game', 'volleyball', 'transition', 'universal'),
    ('Transition coverage game', 'volleyball', 'coverage', 'sport_specific'),
    ('Transition coverage game', 'volleyball', 'transition_offense', 'sport_specific')
)
insert into public.drill_tag_map (drill_id, tag_id)
select distinct d.id, st.id
from drill_tag_seed dts
join all_system_drills d
  on d.name = dts.drill_name
 and d.sport_key = dts.sport_key
join public.sport_tags st
  on st.sport_key = dts.sport_key
 and st.tag_slug = dts.tag_slug
 and coalesce(st.category, '') = coalesce(dts.category, '')
on conflict (drill_id, tag_id) do nothing;
