-- Setup instructions for softball system drills

update public.drills set
  player_count = 'Pairs (any number)',
  equipment = '1 softball per pair',
  setup_instructions = 'Partners start at 30 feet apart. Mark distances at 30, 60, and 80 feet with cones or chalk. Stand facing each other in the outfield.',
  how_to_run = 'Start at 30 feet for 2 minutes — easy crow hop throws, no snap. Move to 60 feet for 2 minutes. Push to 80 feet if the arm feels ready — stay there 1 minute. Work back in over the last 2–3 minutes. Total: about 10 minutes. Full crow hop on every throw.',
  coaching_points = E'• Crow hop on every throw, even at 30 feet — build the habit every time\n• Softball requires a slightly shorter arm path than baseball — let the natural release happen, do not force it long\n• Stop at 60 feet if there is any arm tightness — this is not the time to push through soreness'
where id = '50f7ba11-0000-4000-8000-000000000001';

update public.drills set
  player_count = 'Individual (any number)',
  equipment = 'None',
  setup_instructions = 'Players find open space on the field. Line them up along the foul line or outfield grass. No equipment needed.',
  how_to_run = 'Sequence (10 reps each): hip flexor swings forward and back, lateral leg swings, hip circles each direction, wrist rolls each direction, shoulder circles forward and back, torso rotations. Then 5 overhead reaches and 5 trunk bends each side. Move at a slow controlled pace — full range of motion.',
  coaching_points = E'• Wrist and forearm activation is especially important for softball catchers and pitchers\n• Do not bounce through the stretches — hold the end range for one full second\n• Pitchers should add an extra 10 underhand arm swings in a full pitching arc before the throwing warm-up'
where id = '50f7ba11-0000-4000-8000-000000000002';

update public.drills set
  player_count = 'Pairs or small groups (any number)',
  equipment = '1 softball per pair',
  setup_instructions = 'Partners stand 15–20 feet apart. Start close to emphasize mechanics, not distance. No wall or equipment needed.',
  how_to_run = 'Phase 1: underhand flip catches — partner stands still and receives soft underhand flips working on clean hands and glove positioning. 10 reps each. Phase 2: short underhand toss with a half-stride toward the partner, mimicking a fielding flip to the bag. 10 reps each. Phase 3: both partners toss simultaneously at increasing distance up to 30 feet.',
  coaching_points = E'• Underhand flips in softball are everywhere — fielders to second, pitchers to first — practice them as seriously as overhand throws\n• Release the ball at hip height on flips — not at the knee and not at the chest\n• Receiving hand gives on the catch — do not stab at the ball'
where id = '50f7ba11-0000-4000-8000-000000000003';

update public.drills set
  player_count = 'Groups of 2',
  equipment = '1 tee per station, bat, bucket of softballs',
  setup_instructions = 'Tee set up in a cage or open field. Soft toss partner kneels 8–10 feet to the side at a 45-degree angle. Start on the tee, finish with soft toss.',
  how_to_run = 'Phase 1 (tee): 15 swings at different heights — middle, low, high. Focus is hip drive and staying on the ball through contact. No power — mechanics only. Phase 2 (soft toss): partner flips 15 balls underhand. Hitter tracks the ball and makes clean contact. Last 5 reps are inside-pitch location to activate the forearms and wrists.',
  coaching_points = E'• Tee work is about mechanics — swinging hard off a tee teaches nothing if the swing path is wrong\n• Stay on top of high pitches — do not uppercut. Stay through low pitches — do not pull off early\n• Softball hitters should drive into the ball, not just make contact and stop the swing'
where id = '50f7ba11-0000-4000-8000-000000000004';

update public.drills set
  player_count = 'Any number (groups of 3–4 per lane)',
  equipment = 'Agility ladder or cones spaced 18 inches apart',
  setup_instructions = 'Set up agility ladders or cone lanes on the outfield grass. Two lanes for infielders (lateral footwork), two for outfielders (linear and drop step patterns). Players rotate through.',
  how_to_run = 'Infield pattern: two-in-two-out lateral shuffle, quick step in-out, and crossover shuffle to a ground ball finish position. 3 reps each. Outfield pattern: drop step left, drop step right, crossover and sprint 10 yards, plant and reset. 3 reps each direction. Run at 75% effort.',
  coaching_points = E'• Infielders: stay low throughout the lateral patterns — standing up between steps kills first-step quickness\n• Outfielders: the drop step determines your route — a wrong first step is almost impossible to recover from\n• Short choppy steps are faster than long strides — do not lunge'
where id = '50f7ba11-0000-4000-8000-000000000005';

update public.drills set
  player_count = 'Full team split into groups of 4–5',
  equipment = 'Pitching machine or live pitcher, batting cage or open field, bucket of balls',
  setup_instructions = 'One group in the cage or at the plate, one group shagging, one group on deck. Rotate every 8–10 pitches.',
  how_to_run = 'Each batter gets 8–10 pitches per round. First 3: work to the opposite field intentionally. Next 4: free swings. Last 2–3: situational (coach calls hit and run, slap, or sacrifice fly). Machine settings: medium speed for early rounds, full speed for the last round. Keep tempo fast — one pitch every 10–12 seconds.',
  coaching_points = E'• Opposite field work is non-negotiable — it is the first 3 swings every round\n• A plan matters more than a hot swing — know before stepping in what you are trying to do\n• Slappers and drag bunters get their own round with machine settings that simulate rise ball and changeup sequences'
where id = '50f7ba11-0000-4000-8000-000000000006';

update public.drills set
  player_count = 'Individual batters rotating + pitcher or toss feeder',
  equipment = 'Balls, bat, cones marking bunt target zones',
  setup_instructions = 'Place cone targets about 12 feet down the first and third baselines. Pitcher throws live or coach does front toss. For slap drill: set up a cone to simulate the first base position and a starting box for the slapper.',
  how_to_run = 'Bunters (10 reps): pivot to the pitcher, bat angled to direct the bunt toward the cone target, deadening contact — do not push. Slappers (10 reps): full approach from the left side of the box, crossover stride, contact at or in front of the plate, direct the ball through the left side of the infield. Rotate every 10 reps.',
  coaching_points = E'• Bunters: bat above the ball at contact — this prevents pop-ups\n• Slappers: the crossover stride must be toward the pitcher, not toward the third base line\n• Drag bunt: stay on top of the pitch and let the ball drag the bat — do not push out in front'
where id = '50f7ba11-0000-4000-8000-000000000007';

update public.drills set
  player_count = 'Full team (batter + full defense + baserunner)',
  equipment = 'Live pitcher or machine, full field with bases',
  setup_instructions = 'Baserunner at first and third. Full defensive alignment. Coach calls the assignment for each batter before the pitch: squeeze, safety squeeze, or hit and run.',
  how_to_run = 'Batter executes the called assignment. Grade is execution only — a squeezed pitch that scores the runner is a success even if the batter is thrown out. Rotate batters every 3 reps. Baserunner at first goes on contact for hit and run; baserunner at third goes on contact for squeeze. Run each assignment 4 times.',
  coaching_points = E'• Squeeze: the batter must bunt any pitch — this is a commitment, not an option\n• Hit and run: protect the runner — make contact on anything close, do not take a strike\n• Safety squeeze: the runner goes only when the bunt is down, not automatically'
where id = '50f7ba11-0000-4000-8000-000000000008';

update public.drills set
  player_count = 'Full team (baserunners + live infield)',
  equipment = 'Full field with bases, fungo or live pitcher',
  setup_instructions = 'Runners at each base simultaneously if players allow, or rotate one base at a time. Full infield in their positions ready to make plays.',
  how_to_run = 'Coach hits or pitches. Runners react to each play type. Work 5 reps of each: ball in the dirt — do you go from second? Fly ball to medium depth — tag from third? Grounder to right — does the runner from first run through to third? Also work the read at third: do you score on a ground ball or hold? Quiz runners verbally between reps.',
  coaching_points = E'• Aggressive base running wins games at every level of softball\n• The baseline is yours — do not drift wide on the turn at each base\n• Sliding practice: at least one rep per runner should end with a slide — pop-up slide or straight in, but commit to it'
where id = '50f7ba11-0000-4000-8000-000000000009';

update public.drills set
  player_count = 'Individual batters rotating',
  equipment = 'Live pitcher or pitching machine set to simulate rise ball, front toss screen',
  setup_instructions = 'Pitcher throws from full distance. Machine set to rise ball sequence: fastball mid, fastball up, rise ball at the letters. Batters in the box one at a time.',
  how_to_run = 'Each batter faces 10 two-strike pitches. Machine or pitcher varies: rise ball at letters, drop ball, changeup. Batter must protect the plate — choke up, shorten the swing, and put the ball in play. Goal: 6 of 10 in play (including foul balls). Track balls that drop for called strikes — that is the focus area.',
  coaching_points = E'• Rise ball: recognize it early by the spin, do not chase it above the zone\n• Choke up is not a concession — it makes you a harder out with two strikes\n• Two-strike at-bats are won by patience, not aggression — one pitch at a time'
where id = '50f7ba11-0000-4000-8000-000000000010';

update public.drills set
  player_count = 'Full infield + coach with fungo',
  equipment = 'Fungo bat, bucket of balls, full infield with bases',
  setup_instructions = 'Coach with fungo at home plate. Four infielders (1B, 2B, SS, 3B) in their normal positions. First baseman stays at the bag to receive throws.',
  how_to_run = 'Coach hits 10 ground balls to each infielder in sequence: 2 backhands, 2 forehands, 2 slow rollers they must charge, 2 short hops in the dirt, 2 at the coach''s choice. Each fielder throws to first. After 10 reps at each position, rotate one spot clockwise. Grade: clean field and accurate throw = 1 point.',
  coaching_points = E'• Charge slow rollers — hesitating gives the runner an extra step\n• Attack short hops — do not back away from them\n• Glove-side footwork: step with your glove-side foot into the ground ball path, not away from it'
where id = '50f7ba11-0000-4000-8000-000000000011';

update public.drills set
  player_count = '3 outfielders + 1 infielder per rep',
  equipment = 'Fungo bat, balls',
  setup_instructions = 'Two outfielders in their normal areas (LF-CF or CF-RF). One infielder (SS or 2B) about 25–30 yards in front of them as a relay target. Coach at home plate.',
  how_to_run = 'Coach hits into the gap or alley. Both outfielders react. The one with the better route calls "I got it, I got it." The other calls "take it" and becomes the backup. Infielder sets relay target position. 5 reps per outfield pairing. After each rep, coach calls out who communicated first and whether it was correct.',
  coaching_points = E'• Two calls required — "I got it" once is not enough in a loud ballpark\n• Never let two players collide trying to prove who is better — communication exists so that does not happen\n• The infielder on the relay: get in a straight line to the target base, not just near the outfielder'
where id = '50f7ba11-0000-4000-8000-000000000012';

update public.drills set
  player_count = '2 middle infielders (SS + 2B) + feeder',
  equipment = 'Softballs, gloves, bases',
  setup_instructions = 'Second base only. Feeder at home plate. SS at shortstop position, 2B at second base. Rotate who covers and who feeds.',
  how_to_run = 'Feeder throws to SS. SS fields, throws to 2B covering the bag. 2B catches, turns (inside, outside, or swipe), and throws to first. 10 reps SS-to-2B. Rotate: feeder throws to 2B who feeds to SS covering. Add a live runner after 10 walkthrough reps.',
  coaching_points = E'• Inside pivot: step to the back corner of the bag and turn toward first — fastest option if the throw is on time\n• Outside pivot: step around the bag if the runner is close — gives you an extra step away\n• Throw to first must be firm and chest-high regardless of how the pivot goes'
where id = '50f7ba11-0000-4000-8000-000000000013';

update public.drills set
  player_count = '1 catcher + pitcher or machine (optional)',
  equipment = 'Full catcher gear, balls, pitcher or pitching machine',
  setup_instructions = 'Catcher in full gear behind the plate. Pitcher throws from full distance, or use a pitching machine. Place a target zone on the ground behind the catcher to grade blocks.',
  how_to_run = 'Phase 1 (blocking): pitcher throws 10 balls intentionally in the dirt — middle, left, and right. Catcher blocks: drop to both knees, tuck chin, angle body toward target zone. Grade: did the ball stay in front? Phase 2 (framing): pitcher throws 10 borderline pitches — corners and top/bottom of zone. Catcher receives quietly and holds the glove. No snatching.',
  coaching_points = E'• Blocking: the goal is to keep the ball in front — it does not need to be pretty\n• Tuck the chin on blocks to protect the throat and keep the mask forward\n• Framing: receive the ball, don''t grab it — a quiet glove looks like a strike; a snatch looks like a ball'
where id = '50f7ba11-0000-4000-8000-000000000014';

update public.drills set
  player_count = 'Full team',
  equipment = 'Full field with bases, no ball needed',
  setup_instructions = 'All 9 defensive players take their positions. Coach at home plate calls situations verbally.',
  how_to_run = 'Coach calls: "Runner on second, nobody out, left-handed batter." Every player moves to correct position and states their assignment out loud — "I''m the cutoff on a hit to left," "I''m covering second on a steal." Coach gives feedback, resets, calls the next scenario. Run 10 minimum. Include bunt plays, first and third, and the wheel.',
  coaching_points = E'• If a player is in the wrong position, stop the drill and correct it — do not let it slide\n• Catcher and shortstop run the defense — both must know every situation\n• Standing in the right spot is not enough — every player must verbalize their assignment'
where id = '50f7ba11-0000-4000-8000-000000000015';

update public.drills set
  player_count = 'Full team (runners at 1B and 3B + full defense)',
  equipment = 'Full field, live pitcher or coach feeding, bases',
  setup_instructions = 'Runner at 1B and 3B, less than 2 outs. Full defense aligned. Pitcher on the mound.',
  how_to_run = 'Work these 4 defensive options: (1) Straight throw to second — 3B runner should hold. (2) Catcher throws to SS cutting at the mound, SS looks 3B runner back then throws to 2B. (3) Catcher pump-fakes to 2B and fires to 3B. (4) Catcher goes directly to third base. 3 reps per option, rotate who gives the call signal.',
  coaching_points = E'• Catcher makes the call — all other players react to the catcher\n• The SS cut at the mound should set up at a distance that gives them a realistic angle to 3B\n• 3B runner: if you go on a straight throw to second, the defense wins — stay until you have a sure score'
where id = '50f7ba11-0000-4000-8000-000000000016';

update public.drills set
  player_count = 'Full team',
  equipment = 'Full field, live pitcher, bases',
  setup_instructions = 'Full defensive alignment with all 9 players. Batter at the plate. Coach calls the coverage before each pitch: safety, crash, or wheel.',
  how_to_run = 'Batter shows a bunt. Defense executes the called coverage. Crash: pitcher and corner player charge hard, middle infielder covers vacated base. Wheel: third baseman charges, SS covers third, pitcher takes a bunt path. Safety: corners hold until the bunt is down, then charge. 3 reps per coverage type. Grade the execution, not the result.',
  coaching_points = E'• Pitcher''s job: field the ball AND call the base — both responsibilities, not just one\n• Corner players: charge on the crack of the bat — any delay is an error\n• Catcher directs: "first," "second," or "third" loudly before the fielder releases'
where id = '50f7ba11-0000-4000-8000-000000000017';

update public.drills set
  player_count = 'Full outfield + infield relay line',
  equipment = 'Fungo bat, balls, full field with bases',
  setup_instructions = 'Full outfield in normal positions. SS and 2B set up as relay players in a line from the outfield to the target base. Coach at home plate with fungo.',
  how_to_run = 'Coach hits extra base balls to gaps and corners. Outfielder calls the ball and throws to the relay cutoff. Relay throws to the target base (or second relay player if needed). 3 reps each: right-center gap, left-center gap, right field corner, left field corner. Grade: is the relay line straight from outfielder to target base?',
  coaching_points = E'• Relay player: stand in a direct line between the outfielder and the target base — move to that line before the ball arrives\n• Glove up high and away from the body so the outfielder has a clear target\n• Outfielder throw must be chest-high to the relay player — a low throw into the dirt kills the relay'
where id = '50f7ba11-0000-4000-8000-000000000018';

update public.drills set
  player_count = 'Groups of 2 infielders + 1 baserunner',
  equipment = 'Bases, balls',
  setup_instructions = 'Two infielders 60 feet apart at adjacent bases. Live baserunner caught between the bases.',
  how_to_run = 'Maximum 2 throws to complete the rundown. Fielder with the ball runs hard at the runner to force a direction. When the runner commits or reverses, throw to the partner who applies the tag. 3 reps per rotation. If a third throw is needed, the drill went wrong — reset and discuss what happened.',
  coaching_points = E'• Run directly at the runner — do not trot or fake the throw prematurely\n• The throw happens when the runner changes direction, not on a guess\n• Receiving fielder: come toward the throw, receive on the glove-side, and tag with two hands'
where id = '50f7ba11-0000-4000-8000-000000000019';

update public.drills set
  player_count = '2–4 pitchers + catcher + first baseman',
  equipment = 'Full mound, bases, balls',
  setup_instructions = 'Pitcher on the mound. Catcher in the crouch. First baseman at the bag. Coach at home plate taps or tosses the ball to simulate contact.',
  how_to_run = 'Rep 1: coach taps a comeback grounder — pitcher fields and throws to first. Rep 2: coach rolls a bunt down the first base line — pitcher fields, first baseman covers the bag. Rep 3: coach taps a bunt toward third — pitcher fields and throws home or to third as called. 5 reps of each per pitcher. Pitcher calls the base before throwing.',
  coaching_points = E'• Covering first: run to the bag in a straight line and hit the inside half with the right foot\n• On fielded bunts: stop your feet before throwing — do not throw off a moving base\n• Call the base out loud — "home," "first," "third" — so the catcher and fielder both hear it'
where id = '50f7ba11-0000-4000-8000-000000000020';

update public.drills set
  player_count = 'Full team',
  equipment = 'Full field, live pitcher, defense, scorecard',
  setup_instructions = 'Full 9-on-9 or 9-on-6 setup. Keep a running score. Set up base runners mid-inning to simulate game pressure situations.',
  how_to_run = 'Play 3–4 simulated innings. Pitcher faces live hitters. Outs are real, runs count. Coach can pause once per inning maximum to address a team situation — keep interruptions rare. After the scrimmage, address one offensive and one defensive theme with the full team.',
  coaching_points = E'• Treat this like a real game — communication, positioning, and hustle should all be game-level\n• Defense communicates every pitch, not just when a play develops\n• Offense: every batter should know the count and the situation before stepping in'
where id = '50f7ba11-0000-4000-8000-000000000021';

update public.drills set
  player_count = 'Full team',
  equipment = 'Stopwatch, full bases',
  setup_instructions = 'Players line up at home plate. Coach with a stopwatch at first base. Mark turning lanes at each base with a cone on the inside corner.',
  how_to_run = 'Round 1: timed home-to-first sprint. Goal: under 3.0 seconds from bat contact for average speed. Round 2: home-to-second turning the base aggressively. Round 3: full circuit all the way around. Post all times. Players who improve from the last session earn a point on the leaderboard.',
  coaching_points = E'• Home to first: run through the bag — do not slow up to look for the ball or the first base coach\n• Turning at second: hit the inside of the bag with your left foot and lean into the third base side\n• Sliding: every full circuit rep should end with a committed slide into home — either pop-up or straight-in'
where id = '50f7ba11-0000-4000-8000-000000000022';

update public.drills set
  player_count = 'Full team',
  equipment = 'None',
  setup_instructions = 'Team gathers in a circle near home plate or behind the dugout. Everyone standing, phones away. Coach stands inside the circle.',
  how_to_run = 'Coach names one specific thing done well today (not generic) and one specific focus for the next game or practice. Open to players for one addition each if time allows. Close with the team''s breakdown chant, handshake, or ritual — whatever the team has established. Under 5 minutes.',
  coaching_points = E'• Name something specific — "our double play footwork was sharp today" carries more weight than "great practice"\n• One focus item only — three takeaways means no one remembers any of them\n• The last impression of practice is the one they carry home — make it intentional'
where id = '50f7ba11-0000-4000-8000-000000000023';

update public.drills set
  player_count = 'Full team (groups of 4–5)',
  equipment = 'Batting cage or tees, fungo, agility ladder, bases',
  setup_instructions = 'Set up 3–4 stations: (1) Cage or tee hitting, (2) Infield ground balls with fungo, (3) Outfield work or fly balls, (4) Baserunning reads. Assign groups to each station. Each station has a player leader or assigned coach.',
  how_to_run = 'Groups rotate every 8 minutes on a whistle or signal. Each station runs independently — the player or coach at the station leads the reps without the head coach present. 4 stations x 8 minutes = 32 minutes. Bring the team together for 3 minutes after all rotations to address one theme observed.',
  coaching_points = E'• Stations run themselves — players who stop working when the coach walks away are a culture signal\n• Rotate who leads each station occasionally to develop leadership in all players\n• Quality over speed — 8 focused minutes beats 8 busy minutes going through the motions'
where id = '50f7ba11-0000-4000-8000-000000000024';

update public.drills set
  player_count = 'Pairs',
  equipment = '1 softball per pair',
  setup_instructions = 'Partners stand 40 feet apart in the outfield or along the foul line. Gloves required.',
  how_to_run = 'Both partners throw and catch for 8 minutes with a single mechanical focus per session — not a full checklist. Coach circulates and assigns one cue per pair: "work on your release today" or "focus on your glove-to-throwing hand transfer." Same cue for the whole session. Different cue next session.',
  coaching_points = E'• One cue per session — this is how mechanics actually improve\n• Four-seam grip on every throw, every rep — build the habit during warm-up\n• Observe the transfer from glove to throwing hand — slow, inconsistent transfers create errors under pressure'
where id = '50f7ba11-0000-4000-8000-000000000025';
