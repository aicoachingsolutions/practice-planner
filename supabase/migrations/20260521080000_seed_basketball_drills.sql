-- Starter system drills: basketball
-- 25 drills (5 warmup, 5 offense, 5 defense, 5 situational, 3 end_practice, 2 general)

insert into public.drills (
  id, sport_key, source_type, name, drill_type,
  placement_zone, primary_goal_slug,
  default_duration_minutes, priority, frequency, notes, is_active
)
values

-- Warmup
('1ba50000-0000-4000-8000-000000000001','basketball','system','Dynamic Ball-Handling Circuit','warmup','warmup','warmup',10,3,'none','Players move through cone stations doing crossovers, between-the-legs, and behind-the-back dribbles at increasing speed. Activates wrists, ankles, and decision-making before live work.',true),
('1ba50000-0000-4000-8000-000000000002','basketball','system','Form Shooting Progression','individual','warmup','warmup',8,3,'none','Players shoot one-handed from 3–5 feet then work back to the elbow. Focus on elbow under the ball and consistent follow-through.',true),
('1ba50000-0000-4000-8000-000000000003','basketball','system','Two-Ball Dribbling','individual','warmup','warmup',7,3,'none','Each player dribbles two balls simultaneously through patterns — same height, alternating, low-high. Builds weak-hand confidence and ball control.',true),
('1ba50000-0000-4000-8000-000000000004','basketball','system','Layup Lines (Right and Left)','small_group','warmup','warmup',8,3,'none','Two lines feed layups from both sides. Players rotate through finishing on the dominant hand then the non-dominant hand.',true),
('1ba50000-0000-4000-8000-000000000005','basketball','system','Defensive Slide and Closeout','individual','warmup','warmup',8,3,'none','Players slide laterally between cones then sprint into a closeout stance at a marker. Activates defensive footwork and short-burst recovery.',true),

-- Offense
('1ba50000-0000-4000-8000-000000000006','basketball','system','5-on-0 Motion Offense Walkthrough','team','offense','offense',20,3,'none','Team runs the full motion offense at half speed with no defense. Coach stops to correct spacing, cuts, and screen angles. Builds shared offensive language.',true),
('1ba50000-0000-4000-8000-000000000007','basketball','system','Pick and Roll Reads','small_group','offense','offense',15,3,'none','Ball handler and screener work through reads against a live defender: turn corner, snake the screen, reject, pop. Defender varies coverage (drop, ICE, switch).',true),
('1ba50000-0000-4000-8000-000000000008','basketball','system','Shell Passing and Spacing','small_group','offense','offense',15,3,'none','4 offensive players on the perimeter pass and replace, maintaining 12–15 feet of spacing. No dribbles allowed. Trains ball movement and stationary spacing.',true),
('1ba50000-0000-4000-8000-000000000009','basketball','system','3-Man Weave to Finish','small_group','offense','offense',12,3,'none','Three players weave full court passing and cutting behind the receiver. Last receiver finishes at the rim with the trail player rebounding.',true),
('1ba50000-0000-4000-8000-000000000010','basketball','system','Half-Court Sets Walk-Through','team','offense','offense',20,3,'none','Team walks through 2–3 named half-court sets at slow tempo. Each set is run from both sides of the floor before moving on.',true),

-- Defense
('1ba50000-0000-4000-8000-000000000011','basketball','system','Defensive Shell Drill','team','defense','defense',20,3,'none','4 defenders against 4 offensive players who pass the ball around the perimeter. Defenders practice on-ball pressure, help position, and closeouts as the ball moves.',true),
('1ba50000-0000-4000-8000-000000000012','basketball','system','Closeout and Contest','small_group','defense','defense',12,3,'none','Coach passes to a shooter on the wing. Defender closes out under control with high hands and contests without fouling. Reset after each rep.',true),
('1ba50000-0000-4000-8000-000000000013','basketball','system','Boxing Out and Rebounding','small_group','defense','defense',12,3,'none','Coach shoots from the perimeter. Defender finds shooter, makes contact, then pursues the ball. Rebounder must secure with two hands and chin the ball.',true),
('1ba50000-0000-4000-8000-000000000014','basketball','system','1-on-1 On-Ball Defense','individual','defense','defense',12,3,'none','Offensive player starts at the top of the key, defender plays live. Offense gets 2 dribbles max. Trains stance, slides, and influencing the ball handler one direction.',true),
('1ba50000-0000-4000-8000-000000000015','basketball','system','Help Side Rotation','team','defense','defense',15,3,'none','5-on-5 with the ball moving on coach signal. Defenders must rotate to help, recover, and verbalize ball/help positions as the ball swings around the floor.',true),

-- Situational
('1ba50000-0000-4000-8000-000000000016','basketball','system','End-of-Game Free Throws','individual','situational','competitive',12,3,'none','Each player shoots 10 pressure free throws while the rest of the team watches. Coach calls a game situation before each rep: down 1, tied, double-bonus.',true),
('1ba50000-0000-4000-8000-000000000017','basketball','system','SLOB (Sideline Inbound) Plays','team','situational','competitive',15,3,'none','Team rehearses 2–3 sideline out-of-bounds plays from the front court. Inbounder calls the play with a number or word. Defense walks through coverage.',true),
('1ba50000-0000-4000-8000-000000000018','basketball','system','BLOB (Baseline Inbound) Plays','team','situational','competitive',15,3,'none','Team practices 2–3 baseline out-of-bounds plays under the basket. Focus on screen timing, second-cut options, and a safety release.',true),
('1ba50000-0000-4000-8000-000000000019','basketball','system','Press Break vs. Full-Court Press','team','situational','competitive',20,3,'none','5 offensive players break a 1-2-1-1 or 2-2-1 press. Outlet immediately, attack the middle, find the second cutter. Coach stops play to identify the open option.',true),
('1ba50000-0000-4000-8000-000000000020','basketball','system','Last-Shot Situations','team','situational','competitive',15,3,'none','Coach calls a clock scenario (5 seconds, 3 seconds, 1 second) and a score situation (down 2, tied). Team runs an inbound play or set to get a shot before the buzzer.',true),

-- End practice
('1ba50000-0000-4000-8000-000000000021','basketball','system','Free Throw Pressure Competition','competitive','end_practice','competitive',10,3,'none','Players shoot in pairs. First miss runs a sprint while the partner shoots two more. Keeps energy up and finishes practice with focused reps.',true),
('1ba50000-0000-4000-8000-000000000022','basketball','system','5-on-5 Game to 21','scrimmage','end_practice','competitive',20,3,'none','Full-court scrimmage with a target score instead of a clock. Each made basket = 2 points (3 from beyond the arc). Free play with limited interruptions.',true),
('1ba50000-0000-4000-8000-000000000023','basketball','system','Team Huddle and Closing','team','end_practice','communication',5,3,'none','Team gathers at center court. Coach names one thing done well and one focus for next practice. Players add their own observations. Closes with the team chant.',true),

-- General
('1ba50000-0000-4000-8000-000000000024','basketball','system','3-on-3 Half-Court Game','team','general','competitive',15,3,'none','Half-court 3-on-3 with make-it-take-it. Forces driving, kick-outs, and quick rotations. Use when a block runs short or as a transition between structured drills.',true),
('1ba50000-0000-4000-8000-000000000025','basketball','system','Partner Shooting Game','small_group','general','competitive',10,3,'none','Two players alternate spots and shots, first to 10 makes wins. Spots rotate every two rounds. Builds shooting rhythm under low-pressure competition.',true)

on conflict (id) do nothing;

-- Tag mappings (sport_specific only)
insert into public.drill_tag_map (drill_id, tag_id)
select t.drill_id, st.id
from (values
  -- Warmup
  ('1ba50000-0000-4000-8000-000000000001'::uuid, 'ball_handling'),
  ('1ba50000-0000-4000-8000-000000000001'::uuid, 'footwork'),
  ('1ba50000-0000-4000-8000-000000000002'::uuid, 'shooting'),
  ('1ba50000-0000-4000-8000-000000000003'::uuid, 'ball_handling'),
  ('1ba50000-0000-4000-8000-000000000004'::uuid, 'finishing'),
  ('1ba50000-0000-4000-8000-000000000004'::uuid, 'ball_handling'),
  ('1ba50000-0000-4000-8000-000000000005'::uuid, 'footwork'),
  ('1ba50000-0000-4000-8000-000000000005'::uuid, 'closeouts'),
  -- Offense
  ('1ba50000-0000-4000-8000-000000000006'::uuid, 'spacing'),
  ('1ba50000-0000-4000-8000-000000000006'::uuid, 'cutting'),
  ('1ba50000-0000-4000-8000-000000000006'::uuid, 'screening'),
  ('1ba50000-0000-4000-8000-000000000007'::uuid, 'decision_making'),
  ('1ba50000-0000-4000-8000-000000000007'::uuid, 'screening'),
  ('1ba50000-0000-4000-8000-000000000008'::uuid, 'passing'),
  ('1ba50000-0000-4000-8000-000000000008'::uuid, 'spacing'),
  ('1ba50000-0000-4000-8000-000000000009'::uuid, 'transition_offense'),
  ('1ba50000-0000-4000-8000-000000000009'::uuid, 'finishing'),
  ('1ba50000-0000-4000-8000-000000000010'::uuid, 'spacing'),
  ('1ba50000-0000-4000-8000-000000000010'::uuid, 'cutting'),
  ('1ba50000-0000-4000-8000-000000000010'::uuid, 'screening'),
  -- Defense
  ('1ba50000-0000-4000-8000-000000000011'::uuid, 'help_defense'),
  ('1ba50000-0000-4000-8000-000000000011'::uuid, 'closeouts'),
  ('1ba50000-0000-4000-8000-000000000011'::uuid, 'communication'),
  ('1ba50000-0000-4000-8000-000000000012'::uuid, 'closeouts'),
  ('1ba50000-0000-4000-8000-000000000012'::uuid, 'on_ball_defense'),
  ('1ba50000-0000-4000-8000-000000000013'::uuid, 'rebounding'),
  ('1ba50000-0000-4000-8000-000000000013'::uuid, 'boxing_out'),
  ('1ba50000-0000-4000-8000-000000000014'::uuid, 'on_ball_defense'),
  ('1ba50000-0000-4000-8000-000000000014'::uuid, 'footwork'),
  ('1ba50000-0000-4000-8000-000000000015'::uuid, 'help_defense'),
  ('1ba50000-0000-4000-8000-000000000015'::uuid, 'off_ball_defense'),
  ('1ba50000-0000-4000-8000-000000000015'::uuid, 'communication'),
  -- Situational
  ('1ba50000-0000-4000-8000-000000000016'::uuid, 'free_throws'),
  ('1ba50000-0000-4000-8000-000000000017'::uuid, 'inbounds_blob_slob'),
  ('1ba50000-0000-4000-8000-000000000017'::uuid, 'communication'),
  ('1ba50000-0000-4000-8000-000000000018'::uuid, 'inbounds_blob_slob'),
  ('1ba50000-0000-4000-8000-000000000018'::uuid, 'communication'),
  ('1ba50000-0000-4000-8000-000000000019'::uuid, 'press_break'),
  ('1ba50000-0000-4000-8000-000000000019'::uuid, 'passing'),
  ('1ba50000-0000-4000-8000-000000000020'::uuid, 'decision_making'),
  -- End practice
  ('1ba50000-0000-4000-8000-000000000021'::uuid, 'free_throws'),
  ('1ba50000-0000-4000-8000-000000000022'::uuid, 'communication'),
  ('1ba50000-0000-4000-8000-000000000023'::uuid, 'communication'),
  -- General
  ('1ba50000-0000-4000-8000-000000000024'::uuid, 'passing'),
  ('1ba50000-0000-4000-8000-000000000024'::uuid, 'spacing'),
  ('1ba50000-0000-4000-8000-000000000025'::uuid, 'shooting')
) as t(drill_id, tag_slug)
join public.sport_tags st
  on st.sport_key = 'basketball'
  and st.tag_slug = t.tag_slug
  and st.category = 'sport_specific'
on conflict (drill_id, tag_id) do nothing;
