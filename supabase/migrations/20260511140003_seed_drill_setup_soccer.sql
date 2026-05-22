-- Setup instructions for soccer system drills

update public.drills set
  player_count = 'Full team (any number)',
  equipment = 'None',
  setup_instructions = 'Players spread out across half the field with space to move freely without bumping into each other.',
  how_to_run = 'Lead a 2-minute sequence: jog in place → high knees → butt kicks → lateral shuffles left and right → arm circles forward and back → dynamic hip circles. Repeat the sequence twice. Increase pace each round.',
  coaching_points = E'• Keep movement light and controlled — this is activation, not a workout\n• Breathing should stay comfortable throughout\n• Full range of motion on each movement pattern'
where id = '5ec00000-0000-4000-8000-000000000001';

update public.drills set
  player_count = '5–8 players per group',
  equipment = '1 ball per group, cones to mark the circle boundary (optional)',
  setup_instructions = 'Mark a 10-yard diameter circle or use the center circle. Put 4–6 players on the outside and 1–2 defenders in the middle.',
  how_to_run = 'Outside players keep possession using 1–2 touch passing. Defenders try to intercept or force an error. When a defender wins the ball or a pass goes out, the player who made the error swaps in as a defender. If no turnover in 90 seconds, rotate the defender.',
  coaching_points = E'• Move immediately after every pass — not after the ball is gone\n• Weight of pass must be firm enough to reach the target without them having to run toward it\n• Call the receiver''s name before you pass'
where id = '5ec00000-0000-4000-8000-000000000002';

update public.drills set
  player_count = 'Individual (any number)',
  equipment = '1 ball per player',
  setup_instructions = 'Players spread out across open space with enough room to move without hitting each other. No cones needed.',
  how_to_run = 'Progression: (1) dominant thigh only, 10 reps. (2) Both thighs alternating. (3) Dominant foot. (4) Both feet alternating. (5) Mix of thighs and feet freely. Each player tracks their personal best total and tries to beat it each round.',
  coaching_points = E'• Relaxed ankle, toe pointed slightly up on contact\n• Small controlled touches — nudge the ball up, don''t boot it\n• Eyes on the ball the whole time'
where id = '5ec00000-0000-4000-8000-000000000003';

update public.drills set
  player_count = 'Even number (working in pairs)',
  equipment = '1 ball per pair, 2 cones per pair',
  setup_instructions = 'Partners stand 10–15 yards apart. Place a cone at each starting position. Players can move freely within a 20-yard zone between the cones.',
  how_to_run = 'Player A passes to Player B and immediately makes a movement — overlap left, overlap right, check away, or a diagonal run. Player B receives, controls, and plays back to where A has moved. Continue for 90 seconds then coach calls a different movement pattern.',
  coaching_points = E'• Move immediately after passing — the run happens before the ball arrives at the partner\n• First touch opens your body for the next action\n• Eye contact before the pass so the partner knows it''s coming'
where id = '5ec00000-0000-4000-8000-000000000004';

update public.drills set
  player_count = 'Any number (2–3 per lane)',
  equipment = '4 cones per lane',
  setup_instructions = 'Set up 2–3 parallel cone lanes each 5 yards wide and 20 yards long. Cone at each end and one in the middle. Players queue at the start.',
  how_to_run = 'Player sprints from start to the middle cone, shuffles sideways to the far cone, then backpedals to the start. Coach blows whistle or calls direction changes randomly. 3–4 reps each player, 15 seconds rest between reps.',
  coaching_points = E'• Stay low in the shuffle — don''t stand straight up\n• Short choppy steps, not long strides\n• React to the signal — don''t start moving before it comes'
where id = '5ec00000-0000-4000-8000-000000000005';

update public.drills set
  player_count = '8–14 players split into 2 teams',
  equipment = '4 small goals or 8 cones (2 per goal), pinnies, 1 ball',
  setup_instructions = 'Mark a 30x25 yard grid. Place one small goal or 2-cone gate on each of the four sides — two on the end lines and two on the sidelines. Teams of 4–6 wear different colors.',
  how_to_run = 'Each team can score on any two of the four goals (assign which two before starting). Teams must switch which goal they are attacking to keep width. No goalkeeper — just go through the gate. Play 5-minute games then rotate teams if more than 2 groups.',
  coaching_points = E'• Look up and find the open goal — don''t fixate on one target\n• Switch the point of attack quickly when one goal is covered\n• Width stretches the defense — stay spread'
where id = '5ec00000-0000-4000-8000-000000000006';

update public.drills set
  player_count = 'Groups of 3, one small goal per group',
  equipment = 'Cones, 1 ball per group, 1 small goal or 2 cones per group',
  setup_instructions = 'Player A at a cone 15 yards from goal. Player B stands 8 yards to one side as the wall player. A passive defender cone (or mannequin) sits between A and goal. Rotate one group at a time.',
  how_to_run = 'A passes firmly to B then immediately runs an angled run to the outside of the defender. B lays the ball into A''s path with one touch. A receives and finishes on goal. 5 reps, then rotate roles — A becomes B, B becomes the finisher from a different angle.',
  coaching_points = E'• A must start the run before B touches the ball — the timing of the combination depends on it\n• The wall pass must be played into space ahead of A, not back to their feet\n• Two-touch max on the finish — take it early'
where id = '5ec00000-0000-4000-8000-000000000007';

update public.drills set
  player_count = '6–12 players',
  equipment = '6+ balls near the wide positions, 1 full-size goal, cones marking the crossing zones',
  setup_instructions = 'Mark a wide position on each side at the edge of the 18-yard box. Place 4–6 balls at each wide station. Two or three strikers line up between the penalty spot and far post.',
  how_to_run = 'Wide player drives a cross — vary between near post, far post, and cutback. Strikers attack the ball based on where the cross is going. After each rep rotate one player out and bring in a fresh attacker. Do 5 crosses from the right side then switch to the left.',
  coaching_points = E'• Strikers: run to meet the ball, don''t stand and wait for it to arrive\n• Call your run — "near," "far," or "cutback" — so the crosser knows\n• Wide players: drive the ball in on the ground when there is space, only loft it when needed'
where id = '5ec00000-0000-4000-8000-000000000008';

update public.drills set
  player_count = 'Groups of 3',
  equipment = 'Cones, 1 ball per group',
  setup_instructions = 'Three cones in an L-shape: Player A at the base with the ball, Player B 10 yards ahead, and a third cone 8 yards wide of B marking the overlap target. A small goal or target zone sits beyond the third cone.',
  how_to_run = 'A passes to B who checks back to receive. Immediately after passing, A sprints an overlap run to the outside and beyond B. B holds the ball for a beat then plays a through ball to the overlap cone. A receives and crosses or shoots. 5 reps, then rotate A and B roles.',
  coaching_points = E'• A must sprint the overlap the instant the pass leaves their foot — no hesitation\n• B must wait long enough for the run to develop before playing the through ball\n• The through ball must lead A into space, not be played to their feet'
where id = '5ec00000-0000-4000-8000-000000000009';

update public.drills set
  player_count = '9–13 players (GK + defenders + midfield + 2–3 press players)',
  equipment = 'Pinnies, 1 ball, cones marking the halfway line',
  setup_instructions = 'GK in goal. Two centerbacks split wide. Two fullbacks near the sidelines. One holding midfielder between the back line and halfway. Two or three opposition players in the attacking half ready to press.',
  how_to_run = 'Coach plays ball to the GK. Team must build possession from the back to the halfway line using short passes only. Press players close space but cannot tackle — they only move to cut passing lanes. If possession is lost, reset from the GK. 5 successful build-ups = one round.',
  coaching_points = E'• GK must be vocal and direct the first pass — don''t stand still\n• Centerbacks split as wide as possible to create a wide base\n• Holding midfielder must offer themselves between the lines — not hide behind defenders'
where id = '5ec00000-0000-4000-8000-000000000010';

update public.drills set
  player_count = 'Pairs plus extras waiting (rotate every 3 reps)',
  equipment = 'Cones marking channels, 1 ball per active pair',
  setup_instructions = 'Mark a 5-yard wide, 20-yard long channel with cones. Defender stands at one end. Attacker with the ball starts at the other end.',
  how_to_run = 'Attacker tries to dribble to the far end line. Defender jockeys and channels toward the sideline, staying on their feet at all times. No diving in until the attacker is within 5 yards of the end line. Switch roles after 3 attacking reps.',
  coaching_points = E'• Stay on your feet — patience before committing to a tackle\n• Keep a low center of gravity — bent knees, weight on balls of feet\n• Show the attacker toward their weaker foot by angling your body'
where id = '5ec00000-0000-4000-8000-000000000011';

update public.drills set
  player_count = 'Full team (10–18)',
  equipment = 'Pinnies, 1 ball, cones if marking zones',
  setup_instructions = 'Defending team takes their pressing shape on one half of the field. 3–4 players with bibs act as the possession team. Coach stands near the possession team to call triggers.',
  how_to_run = 'Possession players pass the ball around at walking pace. Coach calls a trigger: "back pass," "miscontrol," "goalkeeper has it." Defending team immediately executes the press on that trigger at 50% pace first, then game speed. 5 reps per trigger type, minimum 3 different triggers.',
  coaching_points = E'• The first pressing player sets the angle to force play one direction — they don''t just run straight at the ball\n• Second player anticipates the pass and cuts the likely lane before the ball moves\n• Everyone presses together — one player pressing alone does nothing'
where id = '5ec00000-0000-4000-8000-000000000012';

update public.drills set
  player_count = '10–14 players (two banks of defenders plus an attacking group)',
  equipment = 'Pinnies, 1 ball, cones marking the defensive block width',
  setup_instructions = 'Defending team forms two horizontal lines of 4–5 across the defensive half. 5–6 attacking players with the ball on the other side. Use cones to mark the maximum horizontal spread of the defending block (about 35 yards wide).',
  how_to_run = 'Attacking team moves the ball side to side. Defending block shifts together — nobody breaks the line to press. If the block is broken and a defender is forced out of line, stop and reset. 5-minute sessions. Coach counts how many times the block shape breaks down.',
  coaching_points = E'• Compactness is the goal — horizontal gaps between players should stay narrow\n• Hands behind the back helps players resist the urge to reach or lunge\n• The block shifts as one unit — the furthest player from the ball must also move'
where id = '5ec00000-0000-4000-8000-000000000013';

update public.drills set
  player_count = '8–12 players (two teams of 4)',
  equipment = '2 small goals or cone gates, pinnies, 1 ball',
  setup_instructions = 'Mark a 25x20 yard grid with cones. Small goals on opposite end lines. Two equal teams.',
  how_to_run = 'Normal 4v4 play. When a team loses the ball, they have a 3-second pressing window to win it back. Coach or player counts aloud. If they win it back in that window, award a bonus point. Goals scored normally. Track both goals and pressing wins.',
  coaching_points = E'• React to losing the ball instantly — no standing and watching\n• Closest player pressures the ball carrier; others cut passing lanes immediately\n• If you don''t win it in 3 seconds, recover your shape — don''t keep chasing'
where id = '5ec00000-0000-4000-8000-000000000014';

update public.drills set
  player_count = '6–9 players (full defensive unit)',
  equipment = 'Cones to mark zone boundaries, 1 ball',
  setup_instructions = 'Divide the defensive half into 6 zones using cones (3 columns x 2 rows). Defenders take starting positions. One coach or player moves the ball across zones — no pressure, just ball movement.',
  how_to_run = 'Ball carrier dribbles or passes to a different zone every 5 seconds. Defenders shift their shape in response. After each move, coach stops play and checks: is everyone facing the ball? Are the far-side defenders tucked in? Reset and repeat. 10 minutes total.',
  coaching_points = E'• Defenders furthest from the ball must tuck in toward the center, not stay wide\n• Everyone faces the ball at all times — no sideways or backward stances\n• Nearest defender to the ball is the reference point for everyone else''s position'
where id = '5ec00000-0000-4000-8000-000000000015';

update public.drills set
  player_count = 'Full team',
  equipment = '1 full-size goal, balls at the corner flag, cones for defensive zones',
  setup_instructions = 'Full field setup. Attacking team: 6–8 players positioned near the goal with assigned runs numbered 1–4. Defending team mirrors with a goalkeeper. Mark defensive zones near the 6-yard box with cones.',
  how_to_run = 'Walk Run #1 (near post flick-on) at half speed x3. Walk Run #2 (back post arrival) x3. Then go game speed x5 each. Switch to defensive setup: defenders mark their zones, goalkeeper calls their position. Take 5 defensive corners and grade the shape and communication.',
  coaching_points = E'• Attackers: time your run to arrive as the ball arrives — not before it\n• Defenders: call your zone assignment out loud before every corner\n• Goalkeeper: command the 6-yard box — call "keeper" early and mean it'
where id = '5ec00000-0000-4000-8000-000000000016';

update public.drills set
  player_count = 'Full team',
  equipment = '1 full goal, 6+ balls, cones marking 3 kick spots',
  setup_instructions = 'Mark three kick spots with cones: 22 yards central, 25 yards right of center, 18 yards left of center. Set up a wall of 3–4 defenders. Goalkeeper in goal.',
  how_to_run = 'Practice Play A (direct shot over or around the wall) from each spot — 3 reps. Play B (short layoff to a late-arriving runner) — 3 reps from each spot. Play C (dummy run decoy + ball switched to opposite side) — 3 reps. Rotate who takes the kick.',
  coaching_points = E'• Dummy runners must sprint at full pace before peeling off — half-hearted runs fool nobody\n• Kicker places the ball the same way every time to build consistent muscle memory\n• Wall players: stay in position until the ball is struck, no matter what the decoy does'
where id = '5ec00000-0000-4000-8000-000000000017';

update public.drills set
  player_count = 'Full team including goalkeepers',
  equipment = '1 ball per player, 1 full-size goal',
  setup_instructions = 'Penalty spot marked. Goalkeeper in goal. Players form a single-file line behind the center circle. Each player takes one kick then goes to the back of the line.',
  how_to_run = 'Round 1: every player takes one penalty. GK cannot move until ball is struck. Track makes and misses on a whiteboard or verbally. Round 2: players who missed go again. Round 3: any remaining misses go sudden death until one player wins.',
  coaching_points = E'• Pick your spot during the approach — commit before you reach the ball\n• Controlled run-up, not a full sprint — accuracy over power\n• Plant foot beside the ball, not behind it'
where id = '5ec00000-0000-4000-8000-000000000018';

update public.drills set
  player_count = 'Groups of 3–4',
  equipment = '1 ball per group, cones marking positions',
  setup_instructions = 'Groups of 3 set up near a sideline. One player at the touchline as the thrower with the ball. Two receivers stand 5 and 12 yards infield.',
  how_to_run = 'Combination A: simple lay-off back to the thrower who turns and plays forward — 5 reps. Combination B: near receiver checks away as a decoy while far receiver makes an underlapping run to receive — 5 reps. Combination C: near receiver flicks on over the defense for a runner breaking in behind — 5 reps. Rotate thrower every round.',
  coaching_points = E'• Receivers must move before the throw, not after — sell the decoy run\n• Every throw-in must look identical at setup — the variation comes from movement, not the thrower''s body language\n• The thrower should look at the decoy first to hold the defense'
where id = '5ec00000-0000-4000-8000-000000000019';

update public.drills set
  player_count = 'GK + 4–6 outfield players',
  equipment = '6+ balls near the goal, cones marking receiving positions',
  setup_instructions = 'GK in goal. Two centerbacks positioned 15 yards out and wide. Two wide players at the halfway line in channels. One central midfielder in the middle third.',
  how_to_run = 'Pattern A: GK throws to near CB who plays wide — 4 reps. Pattern B: GK throws long to switch the field to the far-side wide player — 4 reps. Pattern C: CB plays back to GK who distributes long — 4 reps. Rotate which pattern and which side. 12 total reps per round.',
  coaching_points = E'• GK must scan the field before the ball arrives — know the first pass before receiving\n• Outfield players must check into receiving positions before the ball is coming\n• Short distribution should be crisp and to feet — no slow rollers'
where id = '5ec00000-0000-4000-8000-000000000020';

update public.drills set
  player_count = 'Full team',
  equipment = '2 full goals, pinnies, 2+ balls on the sideline',
  setup_instructions = 'Full field. Two equal teams with goalkeepers. Extra balls on the sidelines to keep the game flowing without long delays.',
  how_to_run = 'Free play scrimmage. Keep score. Coach stays on the sideline and observes without interrupting unless there is a safety issue or a team-wide habit that needs immediate correction. If a ball goes out, throw a new one in immediately to maintain pace.',
  coaching_points = E'• Let them play — this is their time to express and apply what was trained\n• Save feedback for after, not during\n• Watch body language and effort levels — those tell you more than mistakes'
where id = '5ec00000-0000-4000-8000-000000000021';

update public.drills set
  player_count = 'Full team split into 2 groups, 1 GK',
  equipment = '1 full-size goal, balls at the penalty spot',
  setup_instructions = 'Two teams of equal size. GK in goal. Teams take turns shooting in alternating order — standard shootout format.',
  how_to_run = 'First 5 shooters per team alternate kicks. If tied after 5, go to sudden death. Losing team runs a short sprint to the corner flag and back. Winning team chooses the warm-up game for the next practice session.',
  coaching_points = E'• Watch body language going into the run-up — confidence or nerves show early\n• Pressure is the point of the drill — acknowledge the nerves, don''t dismiss them\n• GK: commit to a side before the kick, don''t wait to see where it''s going'
where id = '5ec00000-0000-4000-8000-000000000022';

update public.drills set
  player_count = '10–14 players (2 teams of 5)',
  equipment = '2 small goals, pinnies, 1 ball, stopwatch',
  setup_instructions = 'Mark a 30x25 yard grid. Small goals on the end lines. Two equal teams.',
  how_to_run = 'Normal 5v5 play with one rule change: goals only count if scored within 5 seconds of winning the ball. Coach or assistant tracks time with a stopwatch and calls off any goal that takes too long. Play to 7 goals or 15 minutes.',
  coaching_points = E'• Win the ball and immediately look forward — the first touch should be purposeful\n• This is about instinct, not planning — act before thinking\n• Count your team''s disallowed goals — that number tells you your transition speed'
where id = '5ec00000-0000-4000-8000-000000000023';

update public.drills set
  player_count = '8 players (2 teams of 4)',
  equipment = '2 small goals or cone gates, pinnies, 1 ball',
  setup_instructions = 'Mark a 20x25 yard grid. Two small goals on opposite ends. Teams wear different colors.',
  how_to_run = 'Standard 4v4 with no special rules or constraints. Play to 5 goals or 10 minutes. Use as a flexible filler when a block runs short or as a transition between structured drills.',
  coaching_points = E'• Minimal coaching — this is free play\n• Let players solve problems on their own\n• Use this time to observe individual habits without the pressure of structured instruction'
where id = '5ec00000-0000-4000-8000-000000000024';

update public.drills set
  player_count = 'Groups of 3',
  equipment = '3 cones per group, 1 ball per group',
  setup_instructions = 'Place three cones in a triangle with each side 10 yards long. One player at each cone facing the center of the triangle.',
  how_to_run = 'Player A passes to B and jogs to B''s cone. Player B passes to C and jogs to C''s cone. Player C passes to where A started and jogs there. Continue the triangle pattern for 2 minutes then reverse direction. Increase pace every 30 seconds.',
  coaching_points = E'• Every pass must reach the receiver at pace — they should not have to move toward it\n• Follow your pass immediately — no waiting to see if it arrives\n• Eyes up before receiving so you know where the next pass goes'
where id = '5ec00000-0000-4000-8000-000000000025';
