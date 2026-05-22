-- Setup instructions for baseball system drills

update public.drills set
  player_count = 'Pairs (any number)',
  equipment = '1 baseball per pair',
  setup_instructions = 'Partners start at 30 feet apart. Mark distances at 30, 60, 90, and 120 feet with cones or chalk. Players stand facing each other.',
  how_to_run = 'Start throwing at 30 feet for 2 minutes — easy, short arm. Move back to 60 feet for 2 minutes. Then 90 feet. If arm feels good, push to 120 feet for 1 minute. Work back in over the last 2 minutes to 60 feet. Total: about 10 minutes. Every throw uses a full crow hop.',
  coaching_points = E'• Crow hop on every single throw — no flat-footed throws even at short distance\n• At full distance: extend fully through the throw, do not short-arm it\n• If the arm feels tight or stiff, stop at 60 feet — do not push through soreness'
where id = 'ba5eba11-0000-4000-8000-000000000001';

update public.drills set
  player_count = 'Individual (any number)',
  equipment = 'None',
  setup_instructions = 'Players find open space on the field or in the outfield grass. No equipment needed. Can be done in a line.',
  how_to_run = 'Sequence (10 reps each): straight leg swings forward and back, lateral leg swings, hip circles clockwise and counterclockwise, ankle rolls each direction, standing torso rotations, arm circles forward and back. Move slowly and reach full range of motion on each rep. 8 minutes total.',
  coaching_points = E'• Do not rush through this — shortcuts here cause hamstring and shoulder problems later\n• Full range of motion on every rep — a small arm circle does nothing\n• Any player who skips this routine should not be the one complaining about soreness later'
where id = 'ba5eba11-0000-4000-8000-000000000002';

update public.drills set
  player_count = 'Individual (any number)',
  equipment = '1 resistance band per player (light to medium resistance)',
  setup_instructions = 'Each player anchors their band to a fence or dugout rail at shoulder height, or holds one end in the non-throwing hand. Face away from the anchor point.',
  how_to_run = 'With band attached at shoulder height behind you: (1) External rotation — elbow at 90 degrees, rotate hand up and out, 15 reps. (2) Internal rotation — reverse the motion, 15 reps. (3) Straight-arm pull-down from overhead to hip, 15 reps. (4) I-Y-T raises — no band, just bodyweight arms, 10 reps each letter. Rest 30 seconds between exercises.',
  coaching_points = E'• Light resistance only — this is activation, not a strength set\n• Controlled tempo: 2 seconds up, 2 seconds down\n• Any pitcher with elbow or shoulder history should use a band one level lighter'
where id = 'ba5eba11-0000-4000-8000-000000000003';

update public.drills set
  player_count = 'Groups of 2 (any number of groups)',
  equipment = '1 tee per cage station, 1 bat per hitter, bucket of balls',
  setup_instructions = 'Set up tees in batting cages or open field. Soft toss partner kneels 8–10 feet to the side of the hitter at a 45-degree angle. Start on the tee, finish with soft toss.',
  how_to_run = 'Phase 1 (tee): 15 swings. Tee at different heights — middle, high, low. Focus on hip rotation and keeping hands inside the ball. No power swings. Phase 2 (soft toss): partner flips 15 balls underhand. Hitter tracks the ball and makes contact. End with 5 inside-pitch soft toss swings to finish the wrist and forearm warm-up.',
  coaching_points = E'• Tee work is about mechanics — if you are trying to hit the ball hard off a tee, you are missing the point\n• Keep the front shoulder closed until the hips initiate — do not cast the arms early\n• Soft toss should land just in front of the front hip, not at the chest'
where id = 'ba5eba11-0000-4000-8000-000000000004';

update public.drills set
  player_count = 'Any number (groups of 3–4 per lane)',
  equipment = 'Agility ladder (1 per lane) or cones spaced 18 inches apart',
  setup_instructions = 'Lay agility ladders or cones on the outfield grass or infield warning track. Two ladder lanes for infielders (lateral patterns), two for outfielders (linear and diagonal patterns). Players rotate through.',
  how_to_run = 'Infield pattern: two-in-two-out shuffle, lateral shuffle, and in-out quick step — 3 reps each. Outfield pattern: 45-degree drop step left and right (simulate a read), crossover sprint 10 yards, stop and reset — 3 reps each direction. All at 75% speed, not full sprint.',
  coaching_points = E'• Eyes forward during lateral patterns — not looking at your feet\n• First step is the most important — practice it slowly then build speed\n• Outfielders: drop step with the foot on the side the ball is going — not a crossover first'
where id = 'ba5eba11-0000-4000-8000-000000000005';

update public.drills set
  player_count = 'Full team split into groups of 4–5',
  equipment = 'Batting cage or open field, pitching machine or live pitcher, buckets of balls',
  setup_instructions = 'Groups rotate through cage stations or live mound. One group hitting, one group shagging, one group on deck. Each group gets one 10-pitch round then rotates.',
  how_to_run = 'Each batter gets 10 pitches per round. First 3 are intentionally worked to the opposite field. Next 4 are free swings. Last 3 are situational (coach calls "run on contact," "two strikes," or "hit and run"). Keep tempo fast — no delays between pitches.',
  coaching_points = E'• Batters should have a plan before stepping in — not just reacting to every pitch\n• Opposite field work is not optional — it is the first 3 pitches every round\n• Encourage taking a strike early to get a pitch to drive — not just hacking at the first pitch'
where id = 'ba5eba11-0000-4000-8000-000000000006';

update public.drills set
  player_count = 'Full team (batter + full infield/outfield + baserunner)',
  equipment = 'Live pitcher or machine, bases, full field',
  setup_instructions = 'Runner on second base. Batter at the plate. Full defensive alignment. Coach calls the situation before each pitch: "runner going on contact," "less than 2 outs," etc.',
  how_to_run = 'Batter''s job: move the runner from 2B to 3B or home. Acceptable approaches — ground ball to right side, sacrifice fly to medium depth, gap hit. Batter is graded on execution of the assignment, not the hit result. Run 5 reps per batter then rotate. Baserunner rotates after every 2 reps.',
  coaching_points = E'• The assignment is more important than the outcome — a weak grounder to second base that moves the runner is a success\n• Batters who try to do too much (swing for a homer) are failing the situation\n• Runner must know their read — do not need a sign to advance on a ground ball to the right side'
where id = 'ba5eba11-0000-4000-8000-000000000007';

update public.drills set
  player_count = 'Individual batters rotating, 1 pitcher or coach tosser',
  equipment = 'Balls, bat, cones marking bunt target zones (first and third lines)',
  setup_instructions = 'Place cone targets about 15 feet down the first baseline and 15 feet down the third baseline. Pitcher throws live or coach does front toss from behind a screen.',
  how_to_run = 'Each batter gets 10 sacrifice bunt reps: 5 toward first, 5 toward third. Teaching sequence per rep: pivot front foot toward pitcher, bat out front at top of strike zone, catch the ball on the bat (do not push at it), let the ball deaden off the barrel. Deduct a rep for a pop-up or a missed attempt.',
  coaching_points = E'• Bat angle determines direction — pointing the barrel toward third sends it toward first, and vice versa\n• Do not push at the ball — hold the bat still and let contact happen\n• Top hand is the guide; bottom hand is the hinge — loosen the top hand slightly'
where id = 'ba5eba11-0000-4000-8000-000000000008';

update public.drills set
  player_count = 'Full team (baserunners rotating + live infield)',
  equipment = 'Full field with bases, live pitcher or coach fungo',
  setup_instructions = 'Runners take their lead position at each base simultaneously if you have enough players, or rotate through each base one at a time. Infield is live and can make plays.',
  how_to_run = 'Coach hits or pitches live. Runners react: ball in the dirt at 1B — runner at 2B goes. Fly ball to medium depth — runner at 3B tags. Line drive — freeze and read. Work each scenario 5 times. Then quiz runners verbally: "Ground ball to shortstop with a runner on first — what do you do?"',
  coaching_points = E'• Freeze on a line drive is automatic — do not assume it is falling\n• Lead distance should give you a chance to steal but also get back safely — know your lead\n• Tag-ups: the foot touches the base the instant the ball hits the fielder''s glove, not after'
where id = 'ba5eba11-0000-4000-8000-000000000009';

update public.drills set
  player_count = 'Individual batters rotating',
  equipment = 'Front toss screen, balls, bat',
  setup_instructions = 'Coach or partner kneels behind a screen 20 feet away and slightly to the side. Set up at various count locations on the edges of the strike zone.',
  how_to_run = 'Batters face a pure two-strike approach: choke up one inch on the bat, widen the stance slightly, and expand the strike zone to protect the plate. Coach throws 10 two-strike pitches including off-speed, inside fastball, and back-foot breaking ball. Goal: put 7 of 10 in play.',
  coaching_points = E'• Two strikes is not a death sentence — adjust your approach, do not panic\n• Choke up shortens the swing and increases bat control — it is not weakness\n• Foul off tough pitches intentionally — fight to stay alive, do not swing for the fence'
where id = 'ba5eba11-0000-4000-8000-000000000010';

update public.drills set
  player_count = 'Full infield (4 players) + fungo hitter',
  equipment = 'Fungo bat, bucket of balls, full infield with bases',
  setup_instructions = 'Coach with a fungo bat stands at home plate. Four infielders (1B, 2B, SS, 3B) in their positions. First baseman stays at the bag to receive throws.',
  how_to_run = 'Coach hits 10 ground balls to each infielder in sequence: 2 routine backhands, 2 routine forehands, 2 charging slow rollers, 2 short hops, 2 at choice. Player fields and throws to first. After 10 reps at each position, rotate players one spot clockwise. Grade: clean field and accurate throw = 1 point.',
  coaching_points = E'• Charge the slow roller — do not wait for it to come to you\n• Short hops: attack them, do not back up from them\n• Footwork before the throw: right-left hop step, not a crow hop from a stop'
where id = 'ba5eba11-0000-4000-8000-000000000011';

update public.drills set
  player_count = '3 outfielders + 1 infielder per rep',
  equipment = 'Fungo bat, balls',
  setup_instructions = 'Two outfielders positioned in center field area, one infielder (SS or 2B) about 30 yards in front of them. Coach at home plate with fungo.',
  how_to_run = 'Coach hits a ball into the gap or alley. Both outfielders react. The outfielder with the best route calls "I got it" twice. The other outfielder calls "take it" and backs off. Infielder sets up as the relay target. After each rep, coach gives one specific call-out on who communicated correctly. 5 reps per outfield pairing then rotate.',
  coaching_points = E'• The call must happen early — not after you are both standing under the ball\n• Two calls: "I got it, I got it" — one call is not enough for a loud game environment\n• Never let pride beat communication — calling off a teammate is correct baseball'
where id = 'ba5eba11-0000-4000-8000-000000000012';

update public.drills set
  player_count = '2 middle infielders (SS + 2B) + feeder',
  equipment = 'Balls, bases, gloves',
  setup_instructions = 'Second base is the only base needed. Feeder stands at home plate or throws from a kneeling position. SS stands at shortstop position, 2B stands at second base.',
  how_to_run = 'Feeder throws a ground ball to SS. SS fields and throws to 2B who catches, turns, and throws to first (or to a cone at first). Rotate: now feeder throws to 2B who feeds to SS covering. 10 reps each combination. Add a live runner at game speed after 10 walkthrough reps.',
  coaching_points = E'• 2B turn: inside-pivot (step to the back of the bag), outside-pivot (step around), or swipe tag — learn all three, use whichever the throw requires\n• The throw to first must be firm and chest-high — a weak throw gives the runner the call\n• Communication: the covering player must be set up at the bag before the fielder releases the throw'
where id = 'ba5eba11-0000-4000-8000-000000000013';

update public.drills set
  player_count = 'Groups of 2–3 outfielders per rep',
  equipment = 'Fungo bat, balls',
  setup_instructions = 'Two outfielders positioned in their normal spots (LF, CF or CF, RF). Coach at home plate with fungo. Extra balls at home plate to keep pace fast.',
  how_to_run = 'Rep types (5 each): (1) Ball hit directly over the outfielder''s head — drop step and run. (2) Ball hit to a deep gap — angle route, do not run at an arc. (3) Shallow line drive — charge or hold. (4) Sinking liner at medium depth — read the spin to decide. 2 seconds between fungo hits to keep reps frequent.',
  coaching_points = E'• Drop step first, then turn — never backpedal on a ball over your head\n• The first step is the most important rep in the drill — walk through it slowly if needed\n• On sinking liners: when in doubt, play it on a hop — a ball that drops in front of you is a hit; one that goes past you is a double'
where id = 'ba5eba11-0000-4000-8000-000000000014';

update public.drills set
  player_count = 'Full team',
  equipment = 'Full field with bases, no ball needed',
  setup_instructions = 'Full team takes their defensive positions. Coach stands near home plate with a situation card or calls scenarios verbally.',
  how_to_run = 'Coach calls a scenario: "Runner on first, one out, right-handed batter." Team moves to correct position and each player verbally states their assignment. Coach gives feedback, resets, calls a new scenario. Run 10 scenarios minimum. Include at least 2 advanced situations: bases loaded, infield in, and the wheel play.',
  coaching_points = E'• If a player is moving to the wrong position, stop play — better to correct it now than during a game\n• Every player states their job out loud — "I''m the cutoff on a ball to right center"\n• The shortstop and catcher typically direct traffic — make sure those two know every situation cold'
where id = 'ba5eba11-0000-4000-8000-000000000015';

update public.drills set
  player_count = 'Full team (baserunners at 1B and 3B + full defense)',
  equipment = 'Full field with bases, 1 ball, live pitcher or coach feeding',
  setup_instructions = 'Runner at 1B and 3B. Fewer than 2 outs. Full defensive alignment. Pitcher set on the mound. Run from a live pitch or a pitch-out scenario.',
  how_to_run = 'Defensive options to practice: (1) Straight throw to 2B — runner at 3B holds. (2) Catcher fires to SS cutting at the mound — SS looks 3B runner back then throws to 2B. (3) Dummy throw — catcher pump-fakes to 2B and throws to 3B. (4) Catcher fires directly to 3B. Rotate which option is called, 4 reps each option.',
  coaching_points = E'• The catcher makes the call — every other player reacts to the catcher\n• SS cutting at the mound: get to the mound, not the baseline — your angle to the 3B runner matters\n• Runner at 3B: if you go on any of these, the defense wins — do not get picked'
where id = 'ba5eba11-0000-4000-8000-000000000016';

update public.drills set
  player_count = 'Full team (batter + full defense)',
  equipment = 'Full field, live pitcher or front toss, bases',
  setup_instructions = 'Full defensive alignment with all 9 players. Batter at the plate. Coach calls the defensive coverage before each pitch (safety, wheel, or crash right, crash left).',
  how_to_run = 'Batter shows bunt. Defense executes the called coverage. For crash plays: pitcher and corner player charge hard, middle infielder covers the vacated base. For wheel: third baseman charges while shortstop covers third. 3 reps per coverage type, then rotate batter. Coach grades only the execution of the coverage, not the result of the bunt.',
  coaching_points = E'• Pitcher''s job on bunt plays: field the ball AND communicate where to throw\n• Corner players must charge at the crack of the bat — hesitation is an error\n• Catcher is the director — "first," "second," or "third" called loudly before the fielder releases'
where id = 'ba5eba11-0000-4000-8000-000000000017';

update public.drills set
  player_count = 'Full team (outfield + infield relay line)',
  equipment = 'Fungo bat, balls, full field with bases',
  setup_instructions = 'Full outfield in position. Two relay players (SS and 2B) set up in a line from the outfield hit zone to the target base. Coach at home plate with fungo.',
  how_to_run = 'Coach hits a ball to a gap or corner. Outfielder calls the ball and throws to the relay cutoff player. Relay player catches and throws to the second relay (if needed) or directly to the target base. 3 reps to each gap: right-center gap, left-center gap, right field corner, left field corner. Grade: did the relay line stay straight?',
  coaching_points = E'• Relay player: get in a direct line between the outfielder and the target base — not behind the outfielder, not off to the side\n• Get your glove up high to give the outfielder a clear target\n• Outfielder: hit the relay player chest-high so they can release immediately — an inaccurate throw wastes the relay'
where id = 'ba5eba11-0000-4000-8000-000000000018';

update public.drills set
  player_count = 'Groups of 2 infielders + 1 baserunner',
  equipment = 'Bases, balls',
  setup_instructions = 'Two infielders positioned at bases 60 feet apart (1B and 2B, or 3B and home). Live baserunner caught between the two bases.',
  how_to_run = 'Runner is in a rundown. Rule: maximum 2 throws to complete the rundown. Fielder with the ball runs at the runner hard to force a decision. When the runner stops or reverses, throw to the partner — partner receives and tags. If you need a 3rd throw, the drill went wrong. 3 reps per rotation, rotate who starts with the ball.',
  coaching_points = E'• Run AT the runner to force the decision — do not lob the ball\n• The throw happens when the runner commits to a direction, not before\n• Two throws is the goal: one throw to start, one to finish with the tag'
where id = 'ba5eba11-0000-4000-8000-000000000019';

update public.drills set
  player_count = '2–4 pitchers + catcher (+ first baseman for 1B coverage)',
  equipment = 'Full mound, bases, balls, bat for coach to simulate contact',
  setup_instructions = 'Pitcher on the mound in pitching stance. Catcher in the crouch. First baseman at the bag. Coach at home plate simulates contact with a bat tap or toss.',
  how_to_run = 'Rep 1: Coach taps a comeback grounder — pitcher fields and throws to first. Rep 2: Coach rolls a ball down the first base line — pitcher fields and the first baseman covers the bag, pitcher tags the bag. Rep 3: Coach taps a bunt down the third base line — pitcher fields and the catcher or third baseman covers. 5 reps of each scenario per pitcher.',
  coaching_points = E'• Covering first: get there in a straight line, hit the inside of the bag, and avoid the first baseman''s foot\n• Fielding a comebacker: set your feet before throwing, do not throw off your back foot\n• Call the base you are throwing to out loud — "first" or "second" — not silent'
where id = 'ba5eba11-0000-4000-8000-000000000020';

update public.drills set
  player_count = 'Full team',
  equipment = 'Full field, live pitcher or machine, full defense, scorecard',
  setup_instructions = 'Full 9-on-9 or 9-on-6 setup (no full outfield needed if player count is low). Keep a running score. Set up base runners to simulate mid-inning situations.',
  how_to_run = 'Play 3–4 simulated innings. Pitcher faces live hitters. Outs are real. Runs count. Coach can call time to pose a situation ("runner on third, one out — what does the outfield do?") but keep interruptions to 2 or fewer per inning. After the scrimmage ends, coach addresses one offensive and one defensive theme observed.',
  coaching_points = E'• This is the closest thing to a real game — treat it like one\n• Defense communicates every pitch — not just on plays that develop\n• Offense: every batter should know the situation before stepping in'
where id = 'ba5eba11-0000-4000-8000-000000000021';

update public.drills set
  player_count = 'Full team',
  equipment = 'Stopwatch, full bases',
  setup_instructions = 'Players line up at home plate. Coach with a stopwatch at first base. Extra cones at second and third bases to mark turning positions. Run in groups of 2 to save time.',
  how_to_run = 'Round 1: timed home-to-first sprint (goal: under 4.2 seconds from contact). Round 2: home-to-second (round the bag aggressively). Round 3: full circuit around all bases. Post times. Players who improve their time from the last session earn a point on the leaderboard. Run each round twice.',
  coaching_points = E'• Home to first: run through the bag, do not slow down to look for the ball\n• Rounding second: hit the inside corner of the bag with your left foot and lean into the turn\n• Full circuit: do not coast between bases — sprint the entire way'
where id = 'ba5eba11-0000-4000-8000-000000000022';

update public.drills set
  player_count = 'Full team',
  equipment = 'None',
  setup_instructions = 'Team gathers in a circle near the mound or behind the dugout. Everyone standing. Coach inside the circle, not outside.',
  how_to_run = 'Coach names one specific thing done well today (not generic) and one specific focus for the next practice or game. Players can add one each if time allows. End with the team chant, handshake, or breakdown — whatever the team''s closing ritual is. Keep it under 5 minutes.',
  coaching_points = E'• Be specific — "our cutoff routes were sharp today" means more than "great practice"\n• One focus item only — too many points become noise\n• The tone you close with sets the tone they carry home'
where id = 'ba5eba11-0000-4000-8000-000000000023';

update public.drills set
  player_count = 'Full team (groups of 4–5)',
  equipment = 'Batting cage or tees, fungo, agility ladder, bases',
  setup_instructions = 'Set up 3–4 stations: (1) Batting cage or tee/soft toss, (2) Infield ground balls with fungo, (3) Outfield routes and fly balls, (4) Base running reads. Assign groups to each station. Each station needs a player leader or coach.',
  how_to_run = 'Groups rotate every 8 minutes on a whistle. Each station runs itself — the player or coach at the station leads the reps. Total time: 4 stations x 8 minutes = 32 minutes. After all rotations, bring the team together for 3 minutes to address any theme observed across stations.',
  coaching_points = E'• Stations must run themselves — if players stop when the coach walks away, that is a culture problem\n• Quality over quantity at each station — 8 minutes of focused work beats 8 minutes of going through the motions\n• Rotate who leads each station occasionally to build leadership'
where id = 'ba5eba11-0000-4000-8000-000000000024';

update public.drills set
  player_count = 'Pairs',
  equipment = '1 baseball per pair',
  setup_instructions = 'Partners stand 45 feet apart facing each other. No equipment other than gloves and a ball. Can be done in the outfield or along the warning track.',
  how_to_run = 'Both players throw and catch for 8 minutes focusing on one mechanical cue per session — not multiple cues. Coach circulates and gives each pair one specific focus: "work on your arm path today" or "watch your finish — let it come across your body." Change the cue for the next session.',
  coaching_points = E'• One cue per session — mechanics improve through focused repetition, not a checklist\n• Natural arm action varies by player — identify their pattern first before correcting it\n• Grip: four-seam across the horseshoe whenever possible, even in warm-up throws'
where id = 'ba5eba11-0000-4000-8000-000000000025';
