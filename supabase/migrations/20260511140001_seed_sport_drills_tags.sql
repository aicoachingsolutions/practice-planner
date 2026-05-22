-- Tag mappings for soccer, volleyball, baseball, softball starter drills
-- Joins on (sport_key, tag_slug, category='sport_specific') to pick skill tags only

insert into public.drill_tag_map (drill_id, tag_id)
select t.drill_id, st.id
from (values
  -- ============================================================
  -- SOCCER
  -- ============================================================
  -- 01 Dynamic Warm-Up Circuit
  ('5ec00000-0000-4000-8000-000000000001'::uuid, 'soccer', 'conditioning'),
  -- 02 Rondo Passing Circle
  ('5ec00000-0000-4000-8000-000000000002'::uuid, 'soccer', 'passing'),
  ('5ec00000-0000-4000-8000-000000000002'::uuid, 'soccer', 'possession'),
  -- 03 Juggling Progression
  ('5ec00000-0000-4000-8000-000000000003'::uuid, 'soccer', 'first_touch'),
  -- 04 Partner Pass and Move
  ('5ec00000-0000-4000-8000-000000000004'::uuid, 'soccer', 'passing'),
  ('5ec00000-0000-4000-8000-000000000004'::uuid, 'soccer', 'movement_off_ball'),
  -- 05 Activation Agility Run
  ('5ec00000-0000-4000-8000-000000000005'::uuid, 'soccer', 'conditioning'),
  -- 06 4-Goal Possession Game
  ('5ec00000-0000-4000-8000-000000000006'::uuid, 'soccer', 'possession'),
  ('5ec00000-0000-4000-8000-000000000006'::uuid, 'soccer', 'spacing'),
  ('5ec00000-0000-4000-8000-000000000006'::uuid, 'soccer', 'small_sided_games'),
  -- 07 Combination Play
  ('5ec00000-0000-4000-8000-000000000007'::uuid, 'soccer', 'passing'),
  ('5ec00000-0000-4000-8000-000000000007'::uuid, 'soccer', 'movement_off_ball'),
  -- 08 Crossing and Finishing
  ('5ec00000-0000-4000-8000-000000000008'::uuid, 'soccer', 'crossing'),
  ('5ec00000-0000-4000-8000-000000000008'::uuid, 'soccer', 'finishing'),
  ('5ec00000-0000-4000-8000-000000000008'::uuid, 'soccer', 'shooting'),
  -- 09 Overlap Run Drill
  ('5ec00000-0000-4000-8000-000000000009'::uuid, 'soccer', 'movement_off_ball'),
  ('5ec00000-0000-4000-8000-000000000009'::uuid, 'soccer', 'passing'),
  -- 10 Build-Up From the Back
  ('5ec00000-0000-4000-8000-000000000010'::uuid, 'soccer', 'passing'),
  ('5ec00000-0000-4000-8000-000000000010'::uuid, 'soccer', 'spacing'),
  ('5ec00000-0000-4000-8000-000000000010'::uuid, 'soccer', 'receiving'),
  -- 11 1v1 Defending
  ('5ec00000-0000-4000-8000-000000000011'::uuid, 'soccer', 'defending'),
  ('5ec00000-0000-4000-8000-000000000011'::uuid, 'soccer', 'tackling'),
  -- 12 Pressing Triggers
  ('5ec00000-0000-4000-8000-000000000012'::uuid, 'soccer', 'pressing'),
  ('5ec00000-0000-4000-8000-000000000012'::uuid, 'soccer', 'communication'),
  -- 13 Compact Block Shape
  ('5ec00000-0000-4000-8000-000000000013'::uuid, 'soccer', 'defending'),
  ('5ec00000-0000-4000-8000-000000000013'::uuid, 'soccer', 'marking'),
  ('5ec00000-0000-4000-8000-000000000013'::uuid, 'soccer', 'spacing'),
  -- 14 Transition Defense
  ('5ec00000-0000-4000-8000-000000000014'::uuid, 'soccer', 'transition_defense'),
  ('5ec00000-0000-4000-8000-000000000014'::uuid, 'soccer', 'defending'),
  -- 15 Zonal Marking Positioning
  ('5ec00000-0000-4000-8000-000000000015'::uuid, 'soccer', 'marking'),
  ('5ec00000-0000-4000-8000-000000000015'::uuid, 'soccer', 'spacing'),
  ('5ec00000-0000-4000-8000-000000000015'::uuid, 'soccer', 'defending'),
  -- 16 Corner Kick Attack and Defense
  ('5ec00000-0000-4000-8000-000000000016'::uuid, 'soccer', 'set_pieces'),
  ('5ec00000-0000-4000-8000-000000000016'::uuid, 'soccer', 'communication'),
  -- 17 Free Kick Routines
  ('5ec00000-0000-4000-8000-000000000017'::uuid, 'soccer', 'set_pieces'),
  ('5ec00000-0000-4000-8000-000000000017'::uuid, 'soccer', 'finishing'),
  -- 18 Penalty Kick Practice
  ('5ec00000-0000-4000-8000-000000000018'::uuid, 'soccer', 'shooting'),
  ('5ec00000-0000-4000-8000-000000000018'::uuid, 'soccer', 'finishing'),
  -- 19 Throw-In Combinations
  ('5ec00000-0000-4000-8000-000000000019'::uuid, 'soccer', 'passing'),
  ('5ec00000-0000-4000-8000-000000000019'::uuid, 'soccer', 'movement_off_ball'),
  -- 20 Goalkeeper Distribution
  ('5ec00000-0000-4000-8000-000000000020'::uuid, 'soccer', 'goalkeeping'),
  ('5ec00000-0000-4000-8000-000000000020'::uuid, 'soccer', 'passing'),
  -- 21 Full-Field Scrimmage
  ('5ec00000-0000-4000-8000-000000000021'::uuid, 'soccer', 'small_sided_games'),
  -- 22 PK Shootout Competition
  ('5ec00000-0000-4000-8000-000000000022'::uuid, 'soccer', 'finishing'),
  ('5ec00000-0000-4000-8000-000000000022'::uuid, 'soccer', 'shooting'),
  -- 23 5v5 Transition Closing Game
  ('5ec00000-0000-4000-8000-000000000023'::uuid, 'soccer', 'transition_attack'),
  ('5ec00000-0000-4000-8000-000000000023'::uuid, 'soccer', 'transition_defense'),
  -- 24 4v4 Small-Sided Game
  ('5ec00000-0000-4000-8000-000000000024'::uuid, 'soccer', 'small_sided_games'),
  ('5ec00000-0000-4000-8000-000000000024'::uuid, 'soccer', 'possession'),
  -- 25 3-Man Passing Pattern
  ('5ec00000-0000-4000-8000-000000000025'::uuid, 'soccer', 'passing'),

  -- ============================================================
  -- VOLLEYBALL
  -- ============================================================
  -- 01 Pepper Drill
  ('701100b0-0000-4000-8000-000000000001'::uuid, 'volleyball', 'passing'),
  ('701100b0-0000-4000-8000-000000000001'::uuid, 'volleyball', 'setting'),
  ('701100b0-0000-4000-8000-000000000001'::uuid, 'volleyball', 'hitting'),
  -- 02 Serving Warm-Up Lines
  ('701100b0-0000-4000-8000-000000000002'::uuid, 'volleyball', 'serving'),
  -- 03 Shoulder Activation Routine
  ('701100b0-0000-4000-8000-000000000003'::uuid, 'volleyball', 'conditioning'),
  -- 04 Dynamic Shuffles and Footwork
  ('701100b0-0000-4000-8000-000000000004'::uuid, 'volleyball', 'footwork'),
  ('701100b0-0000-4000-8000-000000000004'::uuid, 'volleyball', 'conditioning'),
  -- 05 Partner Forearm and Overhead Passing
  ('701100b0-0000-4000-8000-000000000005'::uuid, 'volleyball', 'passing'),
  -- 06 Serve Receive to Attack
  ('701100b0-0000-4000-8000-000000000006'::uuid, 'volleyball', 'serve_receive'),
  ('701100b0-0000-4000-8000-000000000006'::uuid, 'volleyball', 'hitting'),
  ('701100b0-0000-4000-8000-000000000006'::uuid, 'volleyball', 'setting'),
  -- 07 Rotation System Walk-Through
  ('701100b0-0000-4000-8000-000000000007'::uuid, 'volleyball', 'rotations'),
  ('701100b0-0000-4000-8000-000000000007'::uuid, 'volleyball', 'setting'),
  ('701100b0-0000-4000-8000-000000000007'::uuid, 'volleyball', 'communication'),
  -- 08 Hitting Lines
  ('701100b0-0000-4000-8000-000000000008'::uuid, 'volleyball', 'hitting'),
  ('701100b0-0000-4000-8000-000000000008'::uuid, 'volleyball', 'footwork'),
  -- 09 Setter Decision Drill
  ('701100b0-0000-4000-8000-000000000009'::uuid, 'volleyball', 'setting'),
  ('701100b0-0000-4000-8000-000000000009'::uuid, 'volleyball', 'transition_offense'),
  -- 10 Back Row Attack Development
  ('701100b0-0000-4000-8000-000000000010'::uuid, 'volleyball', 'hitting'),
  ('701100b0-0000-4000-8000-000000000010'::uuid, 'volleyball', 'transition_offense'),
  -- 11 Digging Lines
  ('701100b0-0000-4000-8000-000000000011'::uuid, 'volleyball', 'digging'),
  ('701100b0-0000-4000-8000-000000000011'::uuid, 'volleyball', 'footwork'),
  -- 12 Blocking Footwork and Timing
  ('701100b0-0000-4000-8000-000000000012'::uuid, 'volleyball', 'blocking'),
  ('701100b0-0000-4000-8000-000000000012'::uuid, 'volleyball', 'footwork'),
  -- 13 Defensive System Positioning
  ('701100b0-0000-4000-8000-000000000013'::uuid, 'volleyball', 'defensive_positioning'),
  ('701100b0-0000-4000-8000-000000000013'::uuid, 'volleyball', 'communication'),
  -- 14 Dig-Set-Attack Transition
  ('701100b0-0000-4000-8000-000000000014'::uuid, 'volleyball', 'transition_defense'),
  ('701100b0-0000-4000-8000-000000000014'::uuid, 'volleyball', 'digging'),
  ('701100b0-0000-4000-8000-000000000014'::uuid, 'volleyball', 'coverage'),
  -- 15 Back Row Defensive Coverage
  ('701100b0-0000-4000-8000-000000000015'::uuid, 'volleyball', 'defensive_positioning'),
  ('701100b0-0000-4000-8000-000000000015'::uuid, 'volleyball', 'coverage'),
  ('701100b0-0000-4000-8000-000000000015'::uuid, 'volleyball', 'digging'),
  -- 16 Serving Under Pressure
  ('701100b0-0000-4000-8000-000000000016'::uuid, 'volleyball', 'serving'),
  ('701100b0-0000-4000-8000-000000000016'::uuid, 'volleyball', 'communication'),
  -- 17 Libero Platform Passing Focus
  ('701100b0-0000-4000-8000-000000000017'::uuid, 'volleyball', 'passing'),
  ('701100b0-0000-4000-8000-000000000017'::uuid, 'volleyball', 'serve_receive'),
  -- 18 Out-of-System Ball Handling
  ('701100b0-0000-4000-8000-000000000018'::uuid, 'volleyball', 'out_of_system_play'),
  ('701100b0-0000-4000-8000-000000000018'::uuid, 'volleyball', 'setting'),
  ('701100b0-0000-4000-8000-000000000018'::uuid, 'volleyball', 'passing'),
  -- 19 Free Ball and Down Ball Protocol
  ('701100b0-0000-4000-8000-000000000019'::uuid, 'volleyball', 'passing'),
  ('701100b0-0000-4000-8000-000000000019'::uuid, 'volleyball', 'transition_offense'),
  -- 20 Rotation Breakdown Challenge
  ('701100b0-0000-4000-8000-000000000020'::uuid, 'volleyball', 'rotations'),
  ('701100b0-0000-4000-8000-000000000020'::uuid, 'volleyball', 'communication'),
  -- 21 King/Queen of the Court
  ('701100b0-0000-4000-8000-000000000021'::uuid, 'volleyball', 'hitting'),
  ('701100b0-0000-4000-8000-000000000021'::uuid, 'volleyball', 'digging'),
  ('701100b0-0000-4000-8000-000000000021'::uuid, 'volleyball', 'communication'),
  -- 22 Serving Competition
  ('701100b0-0000-4000-8000-000000000022'::uuid, 'volleyball', 'serving'),
  -- 23 Team Appreciation Circle
  ('701100b0-0000-4000-8000-000000000023'::uuid, 'volleyball', 'communication'),
  -- 24 Wash Drill
  ('701100b0-0000-4000-8000-000000000024'::uuid, 'volleyball', 'passing'),
  ('701100b0-0000-4000-8000-000000000024'::uuid, 'volleyball', 'hitting'),
  ('701100b0-0000-4000-8000-000000000024'::uuid, 'volleyball', 'digging'),
  -- 25 3v3 Mini-Court Game
  ('701100b0-0000-4000-8000-000000000025'::uuid, 'volleyball', 'hitting'),
  ('701100b0-0000-4000-8000-000000000025'::uuid, 'volleyball', 'passing'),
  ('701100b0-0000-4000-8000-000000000025'::uuid, 'volleyball', 'blocking'),

  -- ============================================================
  -- BASEBALL
  -- ============================================================
  -- 01 Long Toss Progression
  ('ba5eba11-0000-4000-8000-000000000001'::uuid, 'baseball', 'throwing'),
  -- 02 Dynamic Stretch Circuit
  ('ba5eba11-0000-4000-8000-000000000002'::uuid, 'baseball', 'conditioning'),
  -- 03 Arm Band Activation
  ('ba5eba11-0000-4000-8000-000000000003'::uuid, 'baseball', 'throwing'),
  ('ba5eba11-0000-4000-8000-000000000003'::uuid, 'baseball', 'conditioning'),
  -- 04 Soft Toss and Tee Work
  ('ba5eba11-0000-4000-8000-000000000004'::uuid, 'baseball', 'hitting'),
  -- 05 Footwork and Shuffle Ladder
  ('ba5eba11-0000-4000-8000-000000000005'::uuid, 'baseball', 'fielding'),
  ('ba5eba11-0000-4000-8000-000000000005'::uuid, 'baseball', 'conditioning'),
  -- 06 Live Batting Practice
  ('ba5eba11-0000-4000-8000-000000000006'::uuid, 'baseball', 'hitting'),
  -- 07 Situational Hitting (Runner on 2B)
  ('ba5eba11-0000-4000-8000-000000000007'::uuid, 'baseball', 'hitting'),
  ('ba5eba11-0000-4000-8000-000000000007'::uuid, 'baseball', 'base_running'),
  -- 08 Bunting Fundamentals
  ('ba5eba11-0000-4000-8000-000000000008'::uuid, 'baseball', 'bunting'),
  -- 09 Base Running Reads and Leads
  ('ba5eba11-0000-4000-8000-000000000009'::uuid, 'baseball', 'base_running'),
  ('ba5eba11-0000-4000-8000-000000000009'::uuid, 'baseball', 'sliding'),
  -- 10 Two-Strike Approach Hitting
  ('ba5eba11-0000-4000-8000-000000000010'::uuid, 'baseball', 'hitting'),
  -- 11 Infield Ground Ball Rounds
  ('ba5eba11-0000-4000-8000-000000000011'::uuid, 'baseball', 'ground_balls'),
  ('ba5eba11-0000-4000-8000-000000000011'::uuid, 'baseball', 'infield_work'),
  ('ba5eba11-0000-4000-8000-000000000011'::uuid, 'baseball', 'throwing'),
  -- 12 Fly Ball Communication
  ('ba5eba11-0000-4000-8000-000000000012'::uuid, 'baseball', 'fly_balls'),
  ('ba5eba11-0000-4000-8000-000000000012'::uuid, 'baseball', 'outfield_work'),
  ('ba5eba11-0000-4000-8000-000000000012'::uuid, 'baseball', 'communication'),
  -- 13 Double Play Turn Practice
  ('ba5eba11-0000-4000-8000-000000000013'::uuid, 'baseball', 'infield_work'),
  ('ba5eba11-0000-4000-8000-000000000013'::uuid, 'baseball', 'throwing'),
  ('ba5eba11-0000-4000-8000-000000000013'::uuid, 'baseball', 'fielding'),
  -- 14 Outfield Routes and Angles
  ('ba5eba11-0000-4000-8000-000000000014'::uuid, 'baseball', 'fly_balls'),
  ('ba5eba11-0000-4000-8000-000000000014'::uuid, 'baseball', 'outfield_work'),
  -- 15 Team Defensive Alignment
  ('ba5eba11-0000-4000-8000-000000000015'::uuid, 'baseball', 'fielding'),
  ('ba5eba11-0000-4000-8000-000000000015'::uuid, 'baseball', 'communication'),
  ('ba5eba11-0000-4000-8000-000000000015'::uuid, 'baseball', 'situational_defense'),
  -- 16 First and Third Defense
  ('ba5eba11-0000-4000-8000-000000000016'::uuid, 'baseball', 'first_and_third_defense'),
  ('ba5eba11-0000-4000-8000-000000000016'::uuid, 'baseball', 'communication'),
  ('ba5eba11-0000-4000-8000-000000000016'::uuid, 'baseball', 'throwing'),
  -- 17 Bunt Coverage Assignments
  ('ba5eba11-0000-4000-8000-000000000017'::uuid, 'baseball', 'situational_defense'),
  ('ba5eba11-0000-4000-8000-000000000017'::uuid, 'baseball', 'fielding'),
  ('ba5eba11-0000-4000-8000-000000000017'::uuid, 'baseball', 'communication'),
  -- 18 Cutoff and Relay Routes
  ('ba5eba11-0000-4000-8000-000000000018'::uuid, 'baseball', 'cutoffs'),
  ('ba5eba11-0000-4000-8000-000000000018'::uuid, 'baseball', 'relays'),
  ('ba5eba11-0000-4000-8000-000000000018'::uuid, 'baseball', 'throwing'),
  -- 19 Rundown Drill
  ('ba5eba11-0000-4000-8000-000000000019'::uuid, 'baseball', 'rundowns'),
  ('ba5eba11-0000-4000-8000-000000000019'::uuid, 'baseball', 'throwing'),
  ('ba5eba11-0000-4000-8000-000000000019'::uuid, 'baseball', 'base_running'),
  -- 20 PFP
  ('ba5eba11-0000-4000-8000-000000000020'::uuid, 'baseball', 'pitching'),
  ('ba5eba11-0000-4000-8000-000000000020'::uuid, 'baseball', 'fielding'),
  ('ba5eba11-0000-4000-8000-000000000020'::uuid, 'baseball', 'communication'),
  -- 21 Simulated Game Innings
  ('ba5eba11-0000-4000-8000-000000000021'::uuid, 'baseball', 'fielding'),
  ('ba5eba11-0000-4000-8000-000000000021'::uuid, 'baseball', 'hitting'),
  ('ba5eba11-0000-4000-8000-000000000021'::uuid, 'baseball', 'communication'),
  -- 22 Base Running Sprint Competition
  ('ba5eba11-0000-4000-8000-000000000022'::uuid, 'baseball', 'base_running'),
  ('ba5eba11-0000-4000-8000-000000000022'::uuid, 'baseball', 'conditioning'),
  -- 23 Team Closing Meeting
  ('ba5eba11-0000-4000-8000-000000000023'::uuid, 'baseball', 'communication'),
  -- 24 Station Rotations
  ('ba5eba11-0000-4000-8000-000000000024'::uuid, 'baseball', 'hitting'),
  ('ba5eba11-0000-4000-8000-000000000024'::uuid, 'baseball', 'fielding'),
  ('ba5eba11-0000-4000-8000-000000000024'::uuid, 'baseball', 'base_running'),
  -- 25 Partner Catch
  ('ba5eba11-0000-4000-8000-000000000025'::uuid, 'baseball', 'throwing'),
  ('ba5eba11-0000-4000-8000-000000000025'::uuid, 'baseball', 'catching'),

  -- ============================================================
  -- SOFTBALL
  -- ============================================================
  -- 01 Long Toss Progression
  ('50f7ba11-0000-4000-8000-000000000001'::uuid, 'softball', 'throwing'),
  -- 02 Dynamic Stretch and Activation
  ('50f7ba11-0000-4000-8000-000000000002'::uuid, 'softball', 'conditioning'),
  -- 03 Underhand Toss Warm-Up
  ('50f7ba11-0000-4000-8000-000000000003'::uuid, 'softball', 'throwing'),
  ('50f7ba11-0000-4000-8000-000000000003'::uuid, 'softball', 'pitching'),
  -- 04 Soft Toss and Tee Warm-Up
  ('50f7ba11-0000-4000-8000-000000000004'::uuid, 'softball', 'hitting'),
  -- 05 Lateral Shuffle and Footwork
  ('50f7ba11-0000-4000-8000-000000000005'::uuid, 'softball', 'fielding'),
  ('50f7ba11-0000-4000-8000-000000000005'::uuid, 'softball', 'conditioning'),
  -- 06 Live Batting Practice
  ('50f7ba11-0000-4000-8000-000000000006'::uuid, 'softball', 'hitting'),
  -- 07 Slap Hitting and Drag Bunt
  ('50f7ba11-0000-4000-8000-000000000007'::uuid, 'softball', 'bunting'),
  ('50f7ba11-0000-4000-8000-000000000007'::uuid, 'softball', 'hitting'),
  ('50f7ba11-0000-4000-8000-000000000007'::uuid, 'softball', 'base_running'),
  -- 08 Situational Hitting
  ('50f7ba11-0000-4000-8000-000000000008'::uuid, 'softball', 'hitting'),
  ('50f7ba11-0000-4000-8000-000000000008'::uuid, 'softball', 'bunting'),
  ('50f7ba11-0000-4000-8000-000000000008'::uuid, 'softball', 'base_running'),
  -- 09 Base Running Aggressiveness
  ('50f7ba11-0000-4000-8000-000000000009'::uuid, 'softball', 'base_running'),
  ('50f7ba11-0000-4000-8000-000000000009'::uuid, 'softball', 'sliding'),
  -- 10 Two-Strike and Rise Ball Recognition
  ('50f7ba11-0000-4000-8000-000000000010'::uuid, 'softball', 'hitting'),
  -- 11 Ground Ball Fundamentals
  ('50f7ba11-0000-4000-8000-000000000011'::uuid, 'softball', 'ground_balls'),
  ('50f7ba11-0000-4000-8000-000000000011'::uuid, 'softball', 'infield_work'),
  ('50f7ba11-0000-4000-8000-000000000011'::uuid, 'softball', 'throwing'),
  -- 12 Fly Ball Communication and Routes
  ('50f7ba11-0000-4000-8000-000000000012'::uuid, 'softball', 'fly_balls'),
  ('50f7ba11-0000-4000-8000-000000000012'::uuid, 'softball', 'outfield_work'),
  ('50f7ba11-0000-4000-8000-000000000012'::uuid, 'softball', 'communication'),
  -- 13 Infield Double Play Footwork
  ('50f7ba11-0000-4000-8000-000000000013'::uuid, 'softball', 'infield_work'),
  ('50f7ba11-0000-4000-8000-000000000013'::uuid, 'softball', 'throwing'),
  ('50f7ba11-0000-4000-8000-000000000013'::uuid, 'softball', 'fielding'),
  -- 14 Catcher Blocking and Framing
  ('50f7ba11-0000-4000-8000-000000000014'::uuid, 'softball', 'catching_position'),
  ('50f7ba11-0000-4000-8000-000000000014'::uuid, 'softball', 'pitching'),
  -- 15 Team Defensive Alignment
  ('50f7ba11-0000-4000-8000-000000000015'::uuid, 'softball', 'fielding'),
  ('50f7ba11-0000-4000-8000-000000000015'::uuid, 'softball', 'communication'),
  ('50f7ba11-0000-4000-8000-000000000015'::uuid, 'softball', 'situational_defense'),
  -- 16 First and Third Defense
  ('50f7ba11-0000-4000-8000-000000000016'::uuid, 'softball', 'first_and_third_defense'),
  ('50f7ba11-0000-4000-8000-000000000016'::uuid, 'softball', 'communication'),
  ('50f7ba11-0000-4000-8000-000000000016'::uuid, 'softball', 'throwing'),
  -- 17 Bunt Defense Assignments
  ('50f7ba11-0000-4000-8000-000000000017'::uuid, 'softball', 'situational_defense'),
  ('50f7ba11-0000-4000-8000-000000000017'::uuid, 'softball', 'fielding'),
  ('50f7ba11-0000-4000-8000-000000000017'::uuid, 'softball', 'communication'),
  -- 18 Cutoff and Relay Execution
  ('50f7ba11-0000-4000-8000-000000000018'::uuid, 'softball', 'cutoffs'),
  ('50f7ba11-0000-4000-8000-000000000018'::uuid, 'softball', 'relays'),
  ('50f7ba11-0000-4000-8000-000000000018'::uuid, 'softball', 'throwing'),
  -- 19 Rundown Drill
  ('50f7ba11-0000-4000-8000-000000000019'::uuid, 'softball', 'rundowns'),
  ('50f7ba11-0000-4000-8000-000000000019'::uuid, 'softball', 'throwing'),
  ('50f7ba11-0000-4000-8000-000000000019'::uuid, 'softball', 'base_running'),
  -- 20 Pitcher Circle Defense
  ('50f7ba11-0000-4000-8000-000000000020'::uuid, 'softball', 'pitching'),
  ('50f7ba11-0000-4000-8000-000000000020'::uuid, 'softball', 'fielding'),
  ('50f7ba11-0000-4000-8000-000000000020'::uuid, 'softball', 'communication'),
  -- 21 Simulated Game Innings
  ('50f7ba11-0000-4000-8000-000000000021'::uuid, 'softball', 'fielding'),
  ('50f7ba11-0000-4000-8000-000000000021'::uuid, 'softball', 'hitting'),
  ('50f7ba11-0000-4000-8000-000000000021'::uuid, 'softball', 'communication'),
  -- 22 Sprint and Base Running Competition
  ('50f7ba11-0000-4000-8000-000000000022'::uuid, 'softball', 'base_running'),
  ('50f7ba11-0000-4000-8000-000000000022'::uuid, 'softball', 'conditioning'),
  -- 23 Team Breakdown
  ('50f7ba11-0000-4000-8000-000000000023'::uuid, 'softball', 'communication'),
  -- 24 Full Station Rotation
  ('50f7ba11-0000-4000-8000-000000000024'::uuid, 'softball', 'hitting'),
  ('50f7ba11-0000-4000-8000-000000000024'::uuid, 'softball', 'fielding'),
  ('50f7ba11-0000-4000-8000-000000000024'::uuid, 'softball', 'base_running'),
  -- 25 Partner Catch
  ('50f7ba11-0000-4000-8000-000000000025'::uuid, 'softball', 'throwing'),
  ('50f7ba11-0000-4000-8000-000000000025'::uuid, 'softball', 'catching')

) as t(drill_id, sport_key, tag_slug)
join public.sport_tags st
  on st.sport_key = t.sport_key
  and st.tag_slug = t.tag_slug
  and st.category = 'sport_specific'
on conflict (drill_id, tag_id) do nothing;
