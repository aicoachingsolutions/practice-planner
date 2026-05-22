-- Setup instructions for volleyball system drills

update public.drills set
  player_count = 'Pairs (any number of pairs)',
  equipment = '1 ball per pair',
  setup_instructions = 'Partners stand 8–10 feet apart facing each other. No net needed. Can be done on the court or in an open gym space.',
  how_to_run = 'Player A forearm passes to B. B overhead sets back to A. A hits or tips softly back to B who digs and sets. Continuous rally — goal is 20 contacts without a drop. If the ball drops, reset. Switch which partner hits every 2 minutes.',
  coaching_points = E'• Keep platform flat and angled toward the target — don''t swing at the ball\n• Setter: hands form a triangle above the forehead, elbows out wide\n• Hit at 50% power — this is a warm-up, not a competition'
where id = '701100b0-0000-4000-8000-000000000001';

update public.drills set
  player_count = 'Any number (individual)',
  equipment = '1 ball per player, serve target markers (tape or cones) optional',
  setup_instructions = 'Players line up behind the 10-foot line first. After that round, move to the 20-foot line. Final round from the full service line behind the end line.',
  how_to_run = 'Round 1: each player serves 5 times from the 10-foot line focusing only on contact mechanics — toss, arm swing, follow through. Round 2: 5 serves from 20 feet. Round 3: 5 serves from the full service line. Rest between rounds. No power — mechanics only.',
  coaching_points = E'• Consistent toss is everything — the toss determines the serve\n• Full arm extension at contact, not a short punch\n• Follow through toward your target, not across your body'
where id = '701100b0-0000-4000-8000-000000000002';

update public.drills set
  player_count = 'Individual (any number)',
  equipment = 'Resistance bands (1 per player) or no equipment needed for band-free version',
  setup_instructions = 'Players find open space. Can be done in a line along the sideline. No net or ball needed.',
  how_to_run = 'With bands: 15 reps each — external rotation at 90 degrees, internal rotation, straight-arm pull-down (I-Y-T). Without bands: 20 arm circles forward, 20 backward, 10 wrist circles each direction, 10 shoulder shrugs. Move slowly and controlled throughout.',
  coaching_points = E'• This protects the rotator cuff — do not rush through it\n• Pain means stop — this is pre-hab, not a test of toughness\n• Wrists and fingers need attention too, especially for setters'
where id = '701100b0-0000-4000-8000-000000000003';

update public.drills set
  player_count = 'Any number (individual)',
  equipment = 'Cones to mark lanes (optional)',
  setup_instructions = 'Players line up on the end line. Mark a 10-foot lane with cones if space is limited. No ball or net needed.',
  how_to_run = 'Side shuffles from end line to 10-foot line and back — 3 reps. Then: drop step right, drop step left, 5 reps each. Then crossover shuffle 10 feet in each direction. Finally, 3 reps of a quick slide-and-reach simulating a dig position. 1 minute total, 30 seconds rest.',
  coaching_points = E'• Stay low throughout — if your knees straighten, you are too high\n• Quick feet, not wide steps — short choppy strides are faster\n• Land in a balanced dig position on the slide-and-reach: weight forward, arms low'
where id = '701100b0-0000-4000-8000-000000000004';

update public.drills set
  player_count = 'Pairs (any number)',
  equipment = '1 ball per pair',
  setup_instructions = 'Partners stand 15 feet apart facing each other. No net needed. Start close and gradually move apart.',
  how_to_run = 'Start with 20 consecutive forearm passes back and forth. Then switch to 20 consecutive overhead sets. Then alternate: one forearm pass, one set, one forearm pass, one set. Count consecutive contacts without a drop. Add 2 feet of distance every 2 minutes.',
  coaching_points = E'• Platform passes: shuffle your feet to get behind the ball — do not reach across your body\n• Overhead sets: contact the ball above and slightly in front of your forehead, not at nose level\n• Call "mine" every time even with just two of you — builds the habit'
where id = '701100b0-0000-4000-8000-000000000005';

update public.drills set
  player_count = 'Full team (12–15 recommended)',
  equipment = '10+ balls, full court with net',
  setup_instructions = 'One server behind the end line. Full receiving team on the opposite side in their serve receive formation. Setter in position at the net. Two or three hitters spread across the hitting positions.',
  how_to_run = 'Server puts ball in play. Receiving team runs pass-set-hit to completion. Rotate servers and passers every 5 reps. After each hit lands, immediately serve the next ball. Track perfect pass percentage (passes that land in the target zone). Goal: 60% or higher.',
  coaching_points = E'• Passers: call the ball early — "mine" before it crosses the net\n• Setter: release to your hitting position the moment you see the serve trajectory\n• Hitters: read the setter''s hand position as early as possible — don''t wait until the set is in the air'
where id = '701100b0-0000-4000-8000-000000000006';

update public.drills set
  player_count = 'Full team',
  equipment = 'Full court, net, 1 ball',
  setup_instructions = 'Team lines up on one side of the court in Rotation 1 of your offensive system. Setter in the appropriate position. No opposition needed.',
  how_to_run = 'Walk through Rotation 1 at half speed: setter calls each player''s position, serve is simulated, team shows their serve receive formation. Then Rotation 2, and so on through all 6. After one full walkthrough, run it at game speed calling out the rotation number. 2 full cycles total.',
  coaching_points = E'• Setter must call out every player''s position before each rotation — this is the setter''s job\n• Players should know their rotation position without being told — goal is to reduce dependency\n• Overlap rules: know which player must be behind or beside which before the serve'
where id = '701100b0-0000-4000-8000-000000000007';

update public.drills set
  player_count = '6–9 players (3 hitters + setter + shaggers)',
  equipment = '10+ balls, full court with net',
  setup_instructions = 'Setter at the net in setting position. One line of hitters at the left pin, one at middle, one at right pin. Tosser or assistant feeds sets, or setter runs the drill. Shaggers retrieve balls on the far side.',
  how_to_run = 'Hitter 1 (left pin) approaches, calls for the set, attacks. Hitter 2 (middle) immediately approaches. Hitter 3 (right pin) immediately follows. Continuous rotation — the moment one hitter leaves, the next is approaching. Run 15 consecutive attacks then rotate who is at each position.',
  coaching_points = E'• Three-step approach: left-right-left (right-handed) — last two steps are the most important\n• Arm swing starts from behind the ear — not a slap from the elbow\n• Jump from a hop step, not a flat-footed stand'
where id = '701100b0-0000-4000-8000-000000000008';

update public.drills set
  player_count = '3–4 players (setter + 2 hitters + 1 simulated blocker)',
  equipment = 'Full court, net, 10+ balls',
  setup_instructions = 'Setter at position 2 or 3. Two hitters at left pin and right pin (or middle). One player or coach acts as a simulated blocker, moving to cover one of the two hitters before each set.',
  how_to_run = 'Tosser delivers a pass to the setter. Blocker moves to cover one hitter visibly before the setter contacts the ball. Setter must set to the uncovered hitter. Track correct decisions: did the setter go away from the blocker? 20 reps per round.',
  coaching_points = E'• Setter: your eyes must find the blocker while your hands are contacting the ball — this takes practice\n• Use a high, slow set while learning — add speed as the reads improve\n• The wrong decision counts as a mistake even if the hitter kills it'
where id = '701100b0-0000-4000-8000-000000000009';

update public.drills set
  player_count = '2–4 players (back row attacker + setter + tosser)',
  equipment = 'Full court, net, 10+ balls',
  setup_instructions = 'Setter at the net. Back row attacker stands behind the 10-foot line (attack line) on the left back, middle back, or right back position. Tosser sends passes to the setter.',
  how_to_run = 'Tosser sends a pass to setter. Setter delivers a high set slightly inside the 10-foot line. Back row attacker takes a full approach, jumps completely behind the 10-foot line, and attacks. 10 reps from each back row position. Rotate hitters every round.',
  coaching_points = E'• Both feet must leave the floor behind the attack line — not on it or in front of it\n• Approach the same way as front row — do not change the footwork pattern\n• The set should be high enough that the hitter can generate a full arm swing'
where id = '701100b0-0000-4000-8000-000000000010';

update public.drills set
  player_count = '3–6 players in a line',
  equipment = '10+ balls, full court with net',
  setup_instructions = 'Players form a line in left back or middle back defensive position. Coach or hitter stands on a box or chair on the opposite side of the net with balls.',
  how_to_run = 'Coach hits (or tosses) a driven ball to the first player. Player digs to the target zone (setter position, marked with a cone). After the dig, player moves to the back of the line. Coach immediately hits to the next player. 3 digs per player per round. Track digs that land in the target zone.',
  coaching_points = E'• Platform angle determines where the ball goes — angle it toward the target, not straight up\n• Move your feet first, platform second — do not reach before you move\n• Do not swing the arms — let the ball do the work off a stable platform'
where id = '701100b0-0000-4000-8000-000000000011';

update public.drills set
  player_count = '2–4 blockers rotating',
  equipment = 'Full court with net, no ball needed for footwork phase',
  setup_instructions = 'Blockers line up at position 2 (right front). Coach or setter stands on the other side of the net and signals with a hand gesture or by pointing which position to close to.',
  how_to_run = 'Phase 1 (footwork only): Coach signals left, middle, or right. Blocker shuffle-steps to the correct spot, jumps, and lands — no ball. 10 reps. Phase 2 (with ball): Setter sets to different hitters on the same side. Blocker reads the set and closes. Hitter attacks. 15 live reps.',
  coaching_points = E'• Shuffle-step, do not crossover — crossing your feet kills your jump timing\n• Hands penetrate over the net on the jump — do not pull back\n• Eyes on the setter''s hands, not on the hitter''s approach'
where id = '701100b0-0000-4000-8000-000000000012';

update public.drills set
  player_count = 'Full team (defensive side only)',
  equipment = 'Full court, net, 10+ balls, cones marking zones on the defensive side',
  setup_instructions = 'Mark 6 zones on the defensive court with cones. Full defense takes their starting position. Coach stands on a chair or box on the opposite side with balls.',
  how_to_run = 'Coach hits balls to different zones one at a time. Defense shifts into the correct coverage position for each hit. After each ball, coach stops play and checks positioning before resetting. Walk through the first 5 reps, then go live for the next 10. Rotate which player takes the ball.',
  coaching_points = E'• Every player shifts on every ball — not just the player the ball is going to\n• Call the ball early and loud — the whole gym should hear "mine"\n• Libero sets the defensive tone — everyone keys off their movement'
where id = '701100b0-0000-4000-8000-000000000013';

update public.drills set
  player_count = 'Full team',
  equipment = 'Full court both sides, net, 15+ balls',
  setup_instructions = 'Full team on one side in defensive positions. Coach on a box on the other side with balls. Setter ready to transition. Two hitters in hitting positions.',
  how_to_run = 'Coach hits a driven ball. Defense digs. Setter transitions to set. Hitters attack. If the attack lands in, coach immediately hits another ball to the same team — they must transition back to defense. Rally continues until the ball lands out or defense cannot handle 3 consecutive coach hits.',
  coaching_points = E'• Transition out of defensive posture the instant the dig leaves your platform\n• Setter: read the dig direction and release to set position before the ball peaks\n• Hitters: stay ready — the transition is 2 seconds, not 10'
where id = '701100b0-0000-4000-8000-000000000014';

update public.drills set
  player_count = 'Full team (focus on back 3 defenders)',
  equipment = 'Full court, net, 10+ balls',
  setup_instructions = 'Hitters in front row with a setter. Back three defenders in their standard positions. Coach or assistant observes coverage gaps and tracks ball placement.',
  how_to_run = 'Front row hitter attacks from varying positions. Back row defenders hold their coverage zones — do not drift forward to "help." After each ball, freeze and check: is every back row player in their coverage zone? Adjust, then continue. 15 reps.',
  coaching_points = E'• Coverage angle changes depending on where the setter is — know your reference point\n• Do not creep forward to watch the hitter — that is how tips die behind you\n• Off-blocker drops to their coverage zone on every front row attack, no exceptions'
where id = '701100b0-0000-4000-8000-000000000015';

update public.drills set
  player_count = 'Full team (split into 2 groups)',
  equipment = 'Full court, net, 10+ balls',
  setup_instructions = 'Two groups on opposite sides of the court. One group serves, one group receives. Serving group lines up behind the end line. Receiving group is in serve receive formation.',
  how_to_run = 'Server must make 3 consecutive serves in bounds to score a point for their team. Any miss resets that player''s count back to zero. First team to 10 points wins. Rotate who is serving after every player has had a turn.',
  coaching_points = E'• A miss under pressure is the whole point — don''t minimize it, use it\n• Reset your routine after a miss — same toss, same breath, same footwork\n• Watch who maintains mechanics under pressure and who changes everything'
where id = '701100b0-0000-4000-8000-000000000016';

update public.drills set
  player_count = '1 passer + 1 server or coach tosser',
  equipment = '10+ balls, full court with net, cone marking the target zone at setter position',
  setup_instructions = 'Passer (libero or designated back row) stands in their serve receive starting position. Cone placed at the setter target zone (about 3 feet off the net at position 2 or 3). Server stands at the service line.',
  how_to_run = 'Server delivers 10 serves varying speed, spin, and location — short, deep, line, angle, float, topspin. Passer must pass every ball to land within 5 feet of the target cone. Track accuracy: how many of 10 land in the target zone? Repeat 3 rounds. Goal is 7 out of 10.',
  coaching_points = E'• Move to the ball — platform passes are most accurate when the ball comes to the center of your body\n• Do not over-platform a short ball — move your feet forward instead of lunging\n• Track which serve type causes the most errors — that is your practice priority'
where id = '701100b0-0000-4000-8000-000000000017';

update public.drills set
  player_count = 'Full team',
  equipment = 'Full court, net, 10+ balls',
  setup_instructions = 'Full team on one side. Setter at the net. Coach stands on the other side with balls.',
  how_to_run = 'Coach intentionally delivers a bad pass — off the net, too far right, or off to the side. Setter must get to the ball and make a playable set. Hitters must adjust their approach based on where the set actually goes, not where they expected it. 15 reps. Grade: did the team still construct an attackable ball?',
  coaching_points = E'• The setter''s first job is to get to the ball — worry about quality of set second\n• Hitters: shorten the approach if the set is off — do not stop and watch\n• Call "help" if you need another player to step in — communication prevents the ball from dying'
where id = '701100b0-0000-4000-8000-000000000018';

update public.drills set
  player_count = 'Full team',
  equipment = 'Full court, net, 10+ balls',
  setup_instructions = 'Full team on one side in their standard defensive positions. Coach on the other side with balls.',
  how_to_run = 'Coach tosses a free ball (slow and high, tossed over the net) or hits a down ball (hard flat trajectory, no jump) randomly. Team must first call out "free" or "down" loud enough for everyone to hear, then transition into their free ball or down ball defensive-to-offense pattern. 20 reps alternating free and down balls.',
  coaching_points = E'• Call the ball type immediately — "free" or "down" — before it crosses the net\n• Free ball protocol is different from a serve receive — everyone should know the difference\n• The ball call is a team call, not just the passer''s — everyone calls it'
where id = '701100b0-0000-4000-8000-000000000019';

update public.drills set
  player_count = 'Full team',
  equipment = 'Full court, net, 15+ balls',
  setup_instructions = 'Identify the rotation in your system that is the most problematic — typically the one where your setter is in the back row or a key attacker is out of position. Line up in that rotation.',
  how_to_run = 'Play out full rallies starting from a serve into this rotation. After each rally, reset to the same rotation. Track points won vs. lost over 20 rallies. If the team wins fewer than 8 of 20, spend 5 additional minutes on positional adjustments before repeating.',
  coaching_points = E'• Name the rotation''s specific weakness before starting — "setter is back row, we lose the quick attack"\n• Design a system for this rotation that plays to available strengths\n• Every player must know their assignment in this rotation without prompting'
where id = '701100b0-0000-4000-8000-000000000020';

update public.drills set
  player_count = 'Full team (3 players per court side at a time)',
  equipment = 'Full court, net, 15+ balls',
  setup_instructions = 'Three players on each side of the net (3v3). Extra players wait in a line on each side. Losing team exits and the next group in line comes in.',
  how_to_run = 'Normal 3v3 rally. Winning team stays on the court. Losing team walks off and the next group comes in immediately. First team to win 3 in a row is the "king/queen" and gets to nominate a challenge for the next group. Keep the pace fast — no breaks between rallies.',
  coaching_points = E'• Communication is amplified with only 3 players — everyone must call every ball\n• Losing teams: no excuses, no delays — walk off with your head up\n• Winning teams: the three-in-a-row standard is the goal, not just the first win'
where id = '701100b0-0000-4000-8000-000000000021';

update public.drills set
  player_count = 'Full team',
  equipment = 'Full court, net, 5 balls per player',
  setup_instructions = 'Mark 4 target zones on the opposite court with tape or cones: deep corners, short angle, short line. Assign point values (corner zones = 2 pts, short zones = 1 pt). Players take turns behind the service line.',
  how_to_run = 'Each player takes 5 serves and earns points based on where the ball lands. Track individual scores on a whiteboard or phone. After everyone serves, the top scorer gets to choose the warm-up game or activity for the next practice.',
  coaching_points = E'• Serving to zones requires consistent toss placement — each zone target has a different toss position\n• Challenge players who are playing it safe to try a zone one level harder\n• Note who performs better here than in game situations — pressure of an audience changes things'
where id = '701100b0-0000-4000-8000-000000000022';

update public.drills set
  player_count = 'Full team',
  equipment = 'None',
  setup_instructions = 'Team gathers in a circle — everyone standing, no one sitting. No phones. Coach stands in the circle, not outside it.',
  how_to_run = 'Going around the circle, each player calls out one specific positive thing that happened in practice — a great dig, a smart set, a tough serve. No generalities like "everyone worked hard." It must be specific. Coach goes last. Close with a team chant or hands in.',
  coaching_points = E'• Specificity matters — "I liked how Maria called the ball off the net in that last drill" is real, "good practice everyone" is not\n• Coach must participate, not just facilitate\n• Keep the energy up — this is a celebration, not a meeting'
where id = '701100b0-0000-4000-8000-000000000023';

update public.drills set
  player_count = 'Full team (4–6 per court side)',
  equipment = 'Full court, net, 15+ balls',
  setup_instructions = 'Two teams of 4–6 on opposite sides of the net. Assign servers for each side. Extra balls available on both sides.',
  how_to_run = 'Team A plays a full rally. If Team A wins the rally, they must immediately win the next rally to score a point. If Team B wins the second rally (the "wash"), no point is scored and a new rally starts. Points can only be scored by winning two consecutive rallies. First to 10 points wins.',
  coaching_points = E'• The wash keeps energy high after a sloppy rally — teams must stay locked in\n• This drill rewards consistency over lucky big plays\n• Watch how teams respond after losing a rally they should have won'
where id = '701100b0-0000-4000-8000-000000000024';

update public.drills set
  player_count = '6–9 players (groups of 3)',
  equipment = '1 ball per group, cones marking boundaries (optional)',
  setup_instructions = 'Mark a half-court area or a 20x20 foot zone for each group of 3. No net required for this drill — play over a line of tape or a low barrier if available.',
  how_to_run = 'Three players, one ball, playing over the line. Normal 3-contact rule applies: pass, set, attack (or tip). Team of 3 plays against themselves — the player who attacked switches sides and becomes the opposition. Rally continues. First to 10 contacts without an error wins.',
  coaching_points = E'• Three contacts on every play — reinforce the habit even in small groups\n• Quick decisions — with only 3 players there is no time to think for long\n• Rotate quickly after each rally — the pace is the point'
where id = '701100b0-0000-4000-8000-000000000025';
