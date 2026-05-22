-- Starter system drills: soccer, volleyball, baseball, softball
-- 25 drills per sport (5 warmup, 5 offense, 5 defense, 5 situational, 3 end_practice, 2 general)

insert into public.drills (
  id, sport_key, source_type, name, drill_type,
  placement_zone, primary_goal_slug,
  default_duration_minutes, priority, frequency, notes, is_active
)
values

-- ============================================================
-- SOCCER
-- ============================================================
('5ec00000-0000-4000-8000-000000000001','soccer','system','Dynamic Warm-Up Circuit','warmup','warmup','warmup',8,3,'none','Players cycle through high knees, butt kicks, lateral shuffles, and arm circles at jog pace. Builds heart rate and loosens joints before ball work.',true),
('5ec00000-0000-4000-8000-000000000002','soccer','system','Rondo Passing Circle','small_group','warmup','warmup',10,3,'none','4–6 players form a circle with 1–2 defenders in the middle. Outside players keep possession using one and two-touch passing.',true),
('5ec00000-0000-4000-8000-000000000003','soccer','system','Juggling Progression','individual','warmup','warmup',6,3,'none','Each player juggles solo working through thighs, feet, and alternating feet. Track personal bests to build engagement.',true),
('5ec00000-0000-4000-8000-000000000004','soccer','system','Partner Pass and Move','small_group','warmup','warmup',8,3,'none','Pairs pass and follow each pass with a movement — overlap, check away, or diagonal run. Activates passing rhythm and off-ball habits.',true),
('5ec00000-0000-4000-8000-000000000005','soccer','system','Activation Agility Run','conditioning','warmup','warmup',7,3,'none','Players run a cone course: sprint, shuffle, backpedal, change of direction. Primes movement mechanics before a ball is introduced.',true),

('5ec00000-0000-4000-8000-000000000006','soccer','system','4-Goal Possession Game','team','offense','offense',20,3,'none','Two teams play on a compact field with four small goals. Teams can score on either of two goals, encouraging width and switching the point of attack.',true),
('5ec00000-0000-4000-8000-000000000007','soccer','system','Combination Play (1-2 Pass)','small_group','offense','offense',15,3,'none','Groups of three work through wall pass combinations before finishing on goal. Emphasizes timing of the return pass and the run behind the defender.',true),
('5ec00000-0000-4000-8000-000000000008','soccer','system','Crossing and Finishing','small_group','offense','offense',15,3,'none','Wide players serve balls into the box from different angles while strikers attack the near and far post. Rotate players through all roles.',true),
('5ec00000-0000-4000-8000-000000000009','soccer','system','Overlap Run Drill','small_group','offense','offense',15,3,'none','Outside player passes inside and runs an overlap. Receiving player holds then plays the through ball. Trains timing of third-man runs.',true),
('5ec00000-0000-4000-8000-000000000010','soccer','system','Build-Up From the Back','team','offense','offense',20,3,'none','Start with the goalkeeper and build possession through the defensive third against a high press. Trains composure and positional structure.',true),

('5ec00000-0000-4000-8000-000000000011','soccer','system','1v1 Defending (Jockeying)','individual','defense','defense',12,3,'none','Defender channels attacker toward the sideline staying patient and not diving in. Attacker tries to beat the defender 1v1 in a narrow channel.',true),
('5ec00000-0000-4000-8000-000000000012','soccer','system','Pressing Triggers Walk-Through','team','defense','defense',15,3,'none','Coach calls out scenarios — back pass to keeper, slow touch — and team executes the press shape together. Builds collective pressing instinct.',true),
('5ec00000-0000-4000-8000-000000000013','soccer','system','Compact Block Shape','team','defense','defense',20,3,'none','Team holds a low defensive block against a possession team. Focus on compactness, cover shadows, and shifting as a unit.',true),
('5ec00000-0000-4000-8000-000000000014','soccer','system','Transition Defense (4v4)','small_group','defense','defense',20,3,'none','When possession is lost the losing team immediately defends 4v4. Rewards quick transitions and penalizes ball-watching after turnovers.',true),
('5ec00000-0000-4000-8000-000000000015','soccer','system','Zonal Marking Positioning','team','defense','defense',15,3,'none','Coach plays balls into different zones and team shifts as a unit using cones as reference points. No live opponent — this is a shape and communication drill.',true),

('5ec00000-0000-4000-8000-000000000016','soccer','system','Corner Kick Attack and Defense','team','situational','competitive',20,3,'none','Rehearse two attacking corner routines and one defensive scheme. Attacking runs are numbered; defenders mark zones or specific players.',true),
('5ec00000-0000-4000-8000-000000000017','soccer','system','Free Kick Routines','team','situational','competitive',20,3,'none','Practice 2–3 set free kick plays at different distances. Include one direct shot option and one combination to a late runner.',true),
('5ec00000-0000-4000-8000-000000000018','soccer','system','Penalty Kick Practice','individual','situational','competitive',12,3,'none','Players take turns from the spot including the goalkeeper. Rotate so all players experience both sides of the pressure situation.',true),
('5ec00000-0000-4000-8000-000000000019','soccer','system','Throw-In Combinations','small_group','situational','competitive',12,3,'none','Practice three throw-in plays: simple lay-off, flick-on, and a back-then-forward combination. Emphasis on throw-ins near the attacking third.',true),
('5ec00000-0000-4000-8000-000000000020','soccer','system','Goalkeeper Distribution Patterns','small_group','situational','competitive',15,3,'none','Goalkeeper works short distribution to centerbacks, quick throws to wide players, and long kicks. Outfield players practice receiving under simulated pressure.',true),

('5ec00000-0000-4000-8000-000000000021','soccer','system','Full-Field Scrimmage','scrimmage','end_practice','competitive',25,3,'none','Free play scrimmage to close practice. Minimal coaching interruptions — let players make decisions independently and play with freedom.',true),
('5ec00000-0000-4000-8000-000000000022','soccer','system','PK Shootout Competition','competitive','end_practice','competitive',10,3,'none','Team splits into two groups for a penalty shootout. Sudden death after the first round — keeps energy high at the end of practice.',true),
('5ec00000-0000-4000-8000-000000000023','soccer','system','5v5 Transition Closing Game','competitive','end_practice','competitive',15,3,'none','High-speed 5v5 emphasizing quick transitions. Goals only count if scored within 5 seconds of winning the ball.',true),

('5ec00000-0000-4000-8000-000000000024','soccer','system','4v4 Small-Sided Game','team','general','competitive',15,3,'none','Open 4v4 with no specific constraint. Used as a flexible block filler when time is variable or as a warm-down game.',true),
('5ec00000-0000-4000-8000-000000000025','soccer','system','3-Man Passing Pattern','small_group','general','competitive',12,3,'none','Three players work through a passing and movement sequence using cones. Reinforces weight of pass and eye contact on the receiving end.',true),

-- ============================================================
-- VOLLEYBALL
-- ============================================================
('701100b0-0000-4000-8000-000000000001','volleyball','system','Pepper Drill','small_group','warmup','warmup',10,3,'none','Partners work through pass-set-hit continuously without letting the ball drop. Builds hand-eye coordination and warms up wrists and shoulders.',true),
('701100b0-0000-4000-8000-000000000002','volleyball','system','Serving Warm-Up Lines','individual','warmup','warmup',8,3,'none','Players serve from the 10-foot line then the 20-foot line then full court. Focus on mechanics and contact over power at the start.',true),
('701100b0-0000-4000-8000-000000000003','volleyball','system','Shoulder Activation Routine','individual','warmup','warmup',6,3,'none','Resistance band pulls, arm circles, and wrist rolls before any contact work. Protects the rotator cuff and prepares spiking and setting mechanics.',true),
('701100b0-0000-4000-8000-000000000004','volleyball','system','Dynamic Shuffles and Footwork','individual','warmup','warmup',7,3,'none','Side shuffles, drop steps, and crossovers through a cone pattern. Activates the lateral movement mechanics used constantly in defensive positioning.',true),
('701100b0-0000-4000-8000-000000000005','volleyball','system','Partner Forearm and Overhead Passing','small_group','warmup','warmup',8,3,'none','Pairs alternate forearm pass and overhead set while gradually moving apart. Builds touch and passing consistency before team work begins.',true),

('701100b0-0000-4000-8000-000000000006','volleyball','system','Serve Receive to Attack','team','offense','offense',20,3,'none','Server puts ball in play and receiving team runs a full pass-set-hit sequence. Rotate servers and passers every 5 reps.',true),
('701100b0-0000-4000-8000-000000000007','volleyball','system','Rotation System Walk-Through','team','offense','offense',20,3,'none','Walk through each rotation of your offensive system at half speed. Setter calls each player''s position before the ball is in play.',true),
('701100b0-0000-4000-8000-000000000008','volleyball','system','Hitting Lines (3 Rotations)','small_group','offense','offense',15,3,'none','Hitters attack from pin, middle, and opposite in back-to-back cycles with a stationary setter at the net. Rotate through all approach angles.',true),
('701100b0-0000-4000-8000-000000000009','volleyball','system','Setter Decision Drill','small_group','offense','offense',15,3,'none','Setter receives a controlled pass and chooses between two hitters based on a simulated blocker''s position. Builds quick-read setting habits.',true),
('701100b0-0000-4000-8000-000000000010','volleyball','system','Back Row Attack Development','small_group','offense','offense',15,3,'none','Back row players approach from behind the 10-foot line and attack a high set. Focus on timing the jump and maintaining arm swing mechanics.',true),

('701100b0-0000-4000-8000-000000000011','volleyball','system','Digging Lines','small_group','defense','defense',12,3,'none','Coach or player hits balls to defenders in a line. Each player digs three balls and rotates. Emphasize platform angle and ready position.',true),
('701100b0-0000-4000-8000-000000000012','volleyball','system','Blocking Footwork and Timing','small_group','defense','defense',12,3,'none','Blockers work lateral footwork along the net responding to a hand signal. Focus on closing the block and hand penetration over the net.',true),
('701100b0-0000-4000-8000-000000000013','volleyball','system','Defensive System Positioning','team','defense','defense',20,3,'none','Coach hits balls to different court zones and the defense rotates into position. Walk through the rotation scheme before going live.',true),
('701100b0-0000-4000-8000-000000000014','volleyball','system','Dig-Set-Attack Transition','team','defense','defense',20,3,'none','Play starts with a coach-driven hit. Defense must dig, set, and attack continuously. Rewards quick transition out of defensive posture.',true),
('701100b0-0000-4000-8000-000000000015','volleyball','system','Back Row Defensive Coverage','team','defense','defense',15,3,'none','Hitters attack while back row defenders cover tipped balls and off-speed shots. Trains coverage angles relative to where the setter is located.',true),

('701100b0-0000-4000-8000-000000000016','volleyball','system','Serving Under Pressure','competitive','situational','competitive',15,3,'none','Players must make 3 consecutive serves to score a point for their team. Missing resets the count. Simulates late-set serving pressure.',true),
('701100b0-0000-4000-8000-000000000017','volleyball','system','Libero Platform Passing Focus','individual','situational','competitive',12,3,'none','Libero or designated passer receives a series of tough serves and off-speed balls. Every pass targets the setter position for accuracy scoring.',true),
('701100b0-0000-4000-8000-000000000018','volleyball','system','Out-of-System Ball Handling','team','situational','competitive',15,3,'none','Coach introduces bad passes forcing out-of-system sets. Team must construct a playable attack from a broken system.',true),
('701100b0-0000-4000-8000-000000000019','volleyball','system','Free Ball and Down Ball Protocol','team','situational','competitive',15,3,'none','Coach tosses free balls and hits down balls in random patterns. Team must call the ball type and transition into attack mode.',true),
('701100b0-0000-4000-8000-000000000020','volleyball','system','Rotation Breakdown Challenge','team','situational','competitive',20,3,'none','Team plays a set starting from a disadvantageous rotation. Focus on communication and covering rotational weaknesses with positioning.',true),

('701100b0-0000-4000-8000-000000000021','volleyball','system','King/Queen of the Court','competitive','end_practice','competitive',20,3,'none','Three-player teams rotate on and off based on rally wins. Losing team exits to the back of the line. Highly competitive way to close practice.',true),
('701100b0-0000-4000-8000-000000000022','volleyball','system','Serving Competition','competitive','end_practice','competitive',12,3,'none','Each player gets 5 serves scored by placement in target zones. Leaderboard posted — builds serving accountability through competition.',true),
('701100b0-0000-4000-8000-000000000023','volleyball','system','Team Appreciation Circle','team','end_practice','communication',5,3,'none','Team gathers in a circle and each player calls out one highlight from practice. Closes practice with positive culture and reinforces good reps.',true),

('701100b0-0000-4000-8000-000000000024','volleyball','system','Wash Drill','team','general','competitive',20,3,'none','Losing a rally washes the previous win and the team must win two in a row to score. Excellent for building competitive intensity and momentum.',true),
('701100b0-0000-4000-8000-000000000025','volleyball','system','3v3 Mini-Court Game','small_group','general','competitive',15,3,'none','Half-court 3v3 with emphasis on quick decisions and consistent three-contact play. Rotate teams every 5 points.',true),

-- ============================================================
-- BASEBALL
-- ============================================================
('ba5eba11-0000-4000-8000-000000000001','baseball','system','Long Toss Progression','small_group','warmup','warmup',12,3,'none','Partners start at 30 feet and work out to full distance over 5 minutes then work back in. Emphasis on crow hop footwork and full arm extension.',true),
('ba5eba11-0000-4000-8000-000000000002','baseball','system','Dynamic Stretch Circuit','individual','warmup','warmup',8,3,'none','Leg swings, hip circles, ankle rolls, and torso rotations before any throwing begins. Reduces injury risk and primes rotational mechanics.',true),
('ba5eba11-0000-4000-8000-000000000003','baseball','system','Arm Band Activation','individual','warmup','warmup',7,3,'none','Resistance band internal and external rotation, shoulder I-Y-T, and bicep curls before live throwing. Essential shoulder pre-hab for every practice.',true),
('ba5eba11-0000-4000-8000-000000000004','baseball','system','Soft Toss and Tee Work','small_group','warmup','warmup',10,3,'none','Hitters take 15–20 swings off a tee then 10–15 from soft toss before live BP. Grooves swing mechanics at low intensity.',true),
('ba5eba11-0000-4000-8000-000000000005','baseball','system','Footwork and Shuffle Ladder','individual','warmup','warmup',8,3,'none','Infield and outfield footwork patterns through an agility ladder. Trains first-step quickness and lateral shuffle mechanics used in all defensive positions.',true),

('ba5eba11-0000-4000-8000-000000000006','baseball','system','Live Batting Practice','small_group','offense','offense',20,3,'none','Pitchers or coaches throw live BP to batters in the cage or on field. Rotate groups through 10-pitch rounds keeping tempo high.',true),
('ba5eba11-0000-4000-8000-000000000007','baseball','system','Situational Hitting (Runner on 2B)','team','offense','offense',20,3,'none','Batter must move the runner from 2B: ground ball to right side, sacrifice fly, or opposite field hit. Scored by execution of the assignment, not result.',true),
('ba5eba11-0000-4000-8000-000000000008','baseball','system','Bunting Fundamentals','individual','offense','offense',12,3,'none','Sacrifice bunt technique against live or front toss. Cover first and third line bunts, proper bat angle, and pivot footwork.',true),
('ba5eba11-0000-4000-8000-000000000009','baseball','system','Base Running Reads and Leads','team','offense','offense',15,3,'none','Runners take leads from all three bases while infield is live. Coach gives random scenarios — ball in the dirt, fly ball, line drive — and runners react.',true),
('ba5eba11-0000-4000-8000-000000000010','baseball','system','Two-Strike Approach Hitting','individual','offense','offense',15,3,'none','Batters work specifically on protecting the plate with two strikes: choke up, widen stance, expand zone. Front toss or machine at varying locations.',true),

('ba5eba11-0000-4000-8000-000000000011','baseball','system','Infield Ground Ball Rounds','small_group','defense','defense',15,3,'none','Coach hits 10 ground balls to each infield position — backhand, forehand, short hop, slow roller. Players charge, field cleanly, and throw to first.',true),
('ba5eba11-0000-4000-8000-000000000012','baseball','system','Fly Ball Communication Drill','small_group','defense','defense',12,3,'none','Fungo hit to the gap with two outfielders and one infielder converging. Player with the best angle calls off the others. Communication is the only grade.',true),
('ba5eba11-0000-4000-8000-000000000013','baseball','system','Double Play Turn Practice','small_group','defense','defense',15,3,'none','Middle infielders work double play footwork at 2B — inside, outside, and swipe tag turns. Feed from both SS and 2B sides at game speed.',true),
('ba5eba11-0000-4000-8000-000000000014','baseball','system','Outfield Routes and Angles','small_group','defense','defense',15,3,'none','Coach hits balls requiring drop steps, over-the-shoulder catches, and bloop reads. Outfielders work in pairs on reading the ball off the bat.',true),
('ba5eba11-0000-4000-8000-000000000015','baseball','system','Team Defensive Alignment Walk-Through','team','defense','defense',20,3,'none','Coach calls game situations and players move to correct positions while verbalizing assignments. No live ball — this is a communication and positioning drill.',true),

('ba5eba11-0000-4000-8000-000000000016','baseball','system','First and Third Defense','team','situational','competitive',20,3,'none','Runner on 1B and 3B with less than 2 outs. Work all defensive options: straight throw, cut-off, daylight plays. Multiple rounds with different runner speeds.',true),
('ba5eba11-0000-4000-8000-000000000017','baseball','system','Bunt Coverage Assignments','team','situational','competitive',20,3,'none','Live bunts from the plate with full defensive coverage — crash plays, rotation to 3B, safety squeeze defense. Pitcher, catcher, and corners all involved.',true),
('ba5eba11-0000-4000-8000-000000000018','baseball','system','Cutoff and Relay Routes','team','situational','competitive',20,3,'none','Coach hits extra base hits to gaps and corners. Infield sets relay angles and outfield hits the cutoff man. Repetition until routes are automatic.',true),
('ba5eba11-0000-4000-8000-000000000019','baseball','system','Rundown Drill','small_group','situational','competitive',15,3,'none','Two infielders run a baserunner caught between bases. Focus on limiting throws to two, staying in throwing lanes, and applying a quick tag.',true),
('ba5eba11-0000-4000-8000-000000000020','baseball','system','Pitcher Fielding Practice (PFP)','small_group','situational','competitive',15,3,'none','Pitchers field comeback grounders, cover 1B on groundouts to the right side, and work all bunt coverage scenarios. Keeps pitchers game-ready defensively.',true),

('ba5eba11-0000-4000-8000-000000000021','baseball','system','Simulated Game Innings','scrimmage','end_practice','competitive',30,3,'none','Pitcher faces live batters with base runners in a simulated game. Full defensive alignment — coach can call situations for teachable moments.',true),
('ba5eba11-0000-4000-8000-000000000022','baseball','system','Base Running Sprint Competition','competitive','end_practice','competitive',10,3,'none','Players compete in timed base running circuits: home to first, home to second, full around the bases. Fastest times recorded to build hustle culture.',true),
('ba5eba11-0000-4000-8000-000000000023','baseball','system','Team Closing Meeting','team','end_practice','communication',5,3,'none','Brief team circle to name one thing done well and one focus for next practice. Keeps culture positive and closes practice with intention.',true),

('ba5eba11-0000-4000-8000-000000000024','baseball','system','Station Rotations','team','general','competitive',30,3,'none','Groups rotate through 3–4 stations: cage hitting, tee work, infield rounds, outfield work. Maximizes reps and minimizes players standing around.',true),
('ba5eba11-0000-4000-8000-000000000025','baseball','system','Partner Catch (Mechanics Focus)','small_group','general','competitive',10,3,'none','Partners play catch at medium range with focus on grip, arm path, and follow-through. Coach circulates giving one technical cue per player.',true),

-- ============================================================
-- SOFTBALL
-- ============================================================
('50f7ba11-0000-4000-8000-000000000001','softball','system','Long Toss Progression','small_group','warmup','warmup',12,3,'none','Partners work out from 30 to 80 feet using proper crow hop and extension then work back in with flat-seam throws for accuracy.',true),
('50f7ba11-0000-4000-8000-000000000002','softball','system','Dynamic Stretch and Activation','individual','warmup','warmup',8,3,'none','Hip flexor stretches, leg swings, shoulder circles, and wrist rolls before any throwing or hitting. Protects high-use joints specific to softball mechanics.',true),
('50f7ba11-0000-4000-8000-000000000003','softball','system','Underhand Toss Warm-Up','small_group','warmup','warmup',8,3,'none','Pitchers and players work underhand flip catches and short toss patterns. Warms up the specific grip and release used in softball fielding.',true),
('50f7ba11-0000-4000-8000-000000000004','softball','system','Soft Toss and Tee Warm-Up','small_group','warmup','warmup',10,3,'none','Hitters take 15 swings off the tee focusing on hip rotation and staying through the ball. Follow with 10 soft toss reps.',true),
('50f7ba11-0000-4000-8000-000000000005','softball','system','Lateral Shuffle and Footwork','individual','warmup','warmup',7,3,'none','Cone course with side shuffles, T-drill, and backpedal patterns. Prepares the lateral movement mechanics used heavily in softball infield and outfield.',true),

('50f7ba11-0000-4000-8000-000000000006','softball','system','Live Batting Practice','small_group','offense','offense',20,3,'none','Pitcher or pitching machine throws live BP to batters. Keep tempo high with quick rotations every 8–10 pitches.',true),
('50f7ba11-0000-4000-8000-000000000007','softball','system','Slap Hitting and Drag Bunt','individual','offense','offense',15,3,'none','Left-handed slappers and drag bunters work approach mechanics — timing the crossover step, contact point, and placement targets.',true),
('50f7ba11-0000-4000-8000-000000000008','softball','system','Situational Hitting (Squeeze and Hit and Run)','team','offense','offense',20,3,'none','Batters execute specific situational assignments: suicide squeeze, safety squeeze, hit and run with the runner moving. Scored on execution not results.',true),
('50f7ba11-0000-4000-8000-000000000009','softball','system','Base Running Aggressiveness Drill','team','offense','offense',15,3,'none','Runners work on reading through the base on contact, tagging up on fly balls, and aggressive first-to-third reads. Coach varies ball placement.',true),
('50f7ba11-0000-4000-8000-000000000010','softball','system','Two-Strike and Rise Ball Recognition','individual','offense','offense',15,3,'none','Pitching machine or live pitcher works two-strike pitches — rise ball, change-up, inside fastball. Batters practice staying back and protecting the plate.',true),

('50f7ba11-0000-4000-8000-000000000011','softball','system','Ground Ball Fundamentals','small_group','defense','defense',15,3,'none','Coach hits 10 ground balls to each infielder — forehand, backhand, charge plays. Players must call the ball and throw to first.',true),
('50f7ba11-0000-4000-8000-000000000012','softball','system','Fly Ball Communication and Routes','small_group','defense','defense',12,3,'none','Fungo hit into the gap with two outfielders converging. Player with priority calls off the other. Communication and drop-step mechanics are evaluated.',true),
('50f7ba11-0000-4000-8000-000000000013','softball','system','Infield Double Play Footwork','small_group','defense','defense',15,3,'none','Middle infielders work the 4-6-3 and 6-4-3 double play turns at 2B. Feed from both sides at game speed.',true),
('50f7ba11-0000-4000-8000-000000000014','softball','system','Catcher Blocking and Framing','individual','defense','defense',15,3,'none','Catcher works blocking low pitches in the dirt from a live pitcher or machine. Follow with pitch framing reps on corner pitches.',true),
('50f7ba11-0000-4000-8000-000000000015','softball','system','Team Defensive Alignment','team','defense','defense',20,3,'none','Coach announces situational setups and players move to correct positions while verbalizing assignments. No live ball — communication and positioning only.',true),

('50f7ba11-0000-4000-8000-000000000016','softball','system','First and Third Defense','team','situational','competitive',20,3,'none','Defend the first-and-third situation working through multiple options: straight throw, dummy throw, safety rotation. Use different runner speeds.',true),
('50f7ba11-0000-4000-8000-000000000017','softball','system','Bunt Defense Assignments','team','situational','competitive',20,3,'none','Live bunts from the plate with crash coverage, rotation to 3B, and wheel play options. Pitcher, catcher, and corners rotate through assignments.',true),
('50f7ba11-0000-4000-8000-000000000018','softball','system','Cutoff and Relay Execution','team','situational','competitive',20,3,'none','Coach hits extra base hits to various zones. Outfield hits the cutoff who hits the relay — proper spacing and line alignment are the focus.',true),
('50f7ba11-0000-4000-8000-000000000019','softball','system','Rundown Drill','small_group','situational','competitive',15,3,'none','Work the two-person rundown with a live baserunner. Focus on limiting throws, staying in throwing lanes, and making a quick controlled tag.',true),
('50f7ba11-0000-4000-8000-000000000020','softball','system','Pitcher Circle Defense (PFP)','small_group','situational','competitive',15,3,'none','Pitchers field bunts to first and third, cover first base on groundouts to the right side, and practice the wheel play assignment.',true),

('50f7ba11-0000-4000-8000-000000000021','softball','system','Simulated Game Innings','scrimmage','end_practice','competitive',30,3,'none','Full live game simulation with base runners and situational setups. Coach can pause play for quick teaching moments.',true),
('50f7ba11-0000-4000-8000-000000000022','softball','system','Sprint and Base Running Competition','competitive','end_practice','competitive',10,3,'none','Timed home-to-first and full circuit base running competition. Fastest times recorded — keeps conditioning competitive at end of practice.',true),
('50f7ba11-0000-4000-8000-000000000023','softball','system','Team Breakdown and Next Game Focus','team','end_practice','communication',5,3,'none','Short team circle to name one positive and set one focus for the next game. Closes with a team chant or huddle.',true),

('50f7ba11-0000-4000-8000-000000000024','softball','system','Full Station Rotation','team','general','competitive',30,3,'none','Groups cycle through hitting, fielding, and baserunning stations. Efficient use of time when a full squad is present.',true),
('50f7ba11-0000-4000-8000-000000000025','softball','system','Partner Catch (Grip and Mechanics)','small_group','general','competitive',10,3,'none','Partners play catch with focus on grip, arm path, and follow-through. Coach circulates giving one technical cue per player.',true)

on conflict (id) do nothing;
