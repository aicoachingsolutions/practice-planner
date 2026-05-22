-- Setup instructions for basketball system drills

update public.drills set
  player_count = 'Full team (any number)',
  equipment = '1 ball per player, 4–6 cones',
  setup_instructions = 'Set up a cone path that snakes across the half court — about 6 cones total. Each player starts with a ball at the baseline.',
  how_to_run = 'Players move through the cone path doing crossovers at the first cone, between-the-legs at the next, behind-the-back, in-and-outs, and a hesitation move. Reset and run again with each pass increasing speed. 4 total passes.',
  coaching_points = E'• Eyes up — find a target on the wall, not the floor\n• Low dribble through the moves — pound the ball, do not roll it\n• Both hands get equal reps — no favoring the dominant hand'
where id = '1ba50000-0000-4000-8000-000000000001';

update public.drills set
  player_count = 'Individual (any number)',
  equipment = '1 ball per player, 1 hoop per 2–3 players',
  setup_instructions = 'Each player starts 3–5 feet directly in front of the hoop. After 5 makes they back up to the elbow.',
  how_to_run = 'One-handed form shots from close range, 5 makes required at each distance: 3 feet, 5 feet, free throw line elbow. Use the off-hand only to guide the ball at the start. Focus on elbow under the ball and high follow-through.',
  coaching_points = E'• Elbow stays under the ball — not flared out to the side\n• Hold the follow-through until the ball hits the rim\n• Same release point on every shot — consistency over power'
where id = '1ba50000-0000-4000-8000-000000000002';

update public.drills set
  player_count = 'Individual (any number)',
  equipment = '2 balls per player',
  setup_instructions = 'Players spread out across the floor with enough space to dribble without bumping into others. Each player has two basketballs.',
  how_to_run = 'Sequence — 30 seconds each: pound dribble both balls same height, alternating high-low, crossover both balls at once, between-the-legs alternating. Rest 15 seconds. Repeat the sequence twice.',
  coaching_points = E'• Keep both balls at the same rhythm — even tempo\n• Eyes up at all times — no looking down\n• Use your fingertips, not your palm'
where id = '1ba50000-0000-4000-8000-000000000003';

update public.drills set
  player_count = '6–12 players',
  equipment = '2 balls, 1 hoop',
  setup_instructions = 'Form two lines on opposite sides of the lane extended (right side and left side). The first player in each line has a ball. Set up rebounders under the rim.',
  how_to_run = 'First player in line drives in and finishes with the dominant hand. Rebounder grabs and outlets to the next shooter. After 2 minutes on the right, switch to the left side using the non-dominant hand. Build to up-and-under finishes in the third round.',
  coaching_points = E'• Use the backboard on angle layups, finger roll up the middle\n• Push off the opposite foot of your shooting hand\n• Stay through the shot — do not float sideways'
where id = '1ba50000-0000-4000-8000-000000000004';

update public.drills set
  player_count = 'Any number (lanes of 1–2)',
  equipment = '4 cones per lane',
  setup_instructions = 'Mark a 10-foot wide channel with cones. Place a target cone 5 yards beyond the channel as the closeout finish.',
  how_to_run = 'Player slides laterally from cone to cone in a defensive stance for 10 seconds, then sprints to the target cone and gets into a closeout stance — feet wide, knees bent, hands up. 5 reps per player.',
  coaching_points = E'• Stay low in the slide — no standing up between cones\n• Closeout with feet chopping — do not run all the way in\n• High hands at the contest, do not reach down'
where id = '1ba50000-0000-4000-8000-000000000005';

update public.drills set
  player_count = '5 players (full lineup)',
  equipment = '1 ball, full court (or half court)',
  setup_instructions = 'Five offensive players take their normal positions. No defense. Coach stands at the top of the key to call out positions and corrections.',
  how_to_run = 'Run the full motion offense at half speed. Coach freezes the action to identify spacing errors, late cuts, or weak screen angles. Each set runs 2–3 times before moving to the next entry option.',
  coaching_points = E'• Maintain 12–15 feet of spacing at all times\n• Cuts must be hard and decisive — no jogging through\n• Screen angles: butt to the basket, set your feet before contact'
where id = '1ba50000-0000-4000-8000-000000000006';

update public.drills set
  player_count = '3 players (ball handler + screener + defender) + rotating defenders',
  equipment = '1 ball, 1 hoop',
  setup_instructions = 'Ball handler at the top of the key, screener at the elbow. One defender on the ball, plus a second defender hedging or dropping based on coach call.',
  how_to_run = 'Coach calls coverage: drop, ICE, hedge, or switch. Ball handler reads and makes the right play — turn the corner, snake, reject the screen, or pop. 4 reps per coverage type. Rotate roles every 8 reps.',
  coaching_points = E'• Set the screen with feet wider than shoulder width — give a real target\n• Roller catches with vision, not just hands — read the help\n• Ball handler: change speed off the screen, do not just drift'
where id = '1ba50000-0000-4000-8000-000000000007';

update public.drills set
  player_count = '4 offensive players + 1 ball',
  equipment = '1 ball',
  setup_instructions = 'Four players spaced around the perimeter (two wings, two corners or one corner one slot). No defenders. Coach positioned in the paint to act as a phantom defender.',
  how_to_run = 'Ball moves around the perimeter using pass-and-replace. Players cut to the basket on coach hand signal and replace from another spot. NO dribbles allowed. 5 minutes of continuous movement.',
  coaching_points = E'• Maintain 15 feet of spacing — measure with eyes, not toes\n• Hands up and ready when the ball comes — no late catches\n• Replace immediately after a cut — do not stand in the dunker spot'
where id = '1ba50000-0000-4000-8000-000000000008';

update public.drills set
  player_count = 'Groups of 3',
  equipment = '1 ball per group',
  setup_instructions = 'Three players line up at the baseline. Middle player has the ball. The two outside players are 12–15 feet to either side.',
  how_to_run = 'Player A (middle) passes to Player B (right) and cuts behind to the right wing. Player B passes to Player C (now coming from the left) and cuts behind. Continue weaving down the floor. Last receiver finishes at the rim. Trail player rebounds.',
  coaching_points = E'• Cut BEHIND the receiver — never in front\n• Pass leads the runner — not back to where they were\n• Finish strong at the rim with the dominant hand, off-hand on the trail rebound'
where id = '1ba50000-0000-4000-8000-000000000009';

update public.drills set
  player_count = '5 players',
  equipment = '1 ball, half court',
  setup_instructions = 'Five offensive players in starting positions for the named set. Coach stands at the sideline calling the set name.',
  how_to_run = 'Coach calls a set ("Horns Down," "Floppy," "Box"). Team executes the set at walking pace, reading the simulated defensive coverage coach narrates. Run each set 2–3 times from both sides of the floor.',
  coaching_points = E'• Know the entry pass before stepping into position\n• Late cuts kill the set — be early on every action\n• If the first option is covered, the second option is automatic — no hesitation'
where id = '1ba50000-0000-4000-8000-000000000010';

update public.drills set
  player_count = '8 players (4 offense, 4 defense)',
  equipment = '1 ball, half court',
  setup_instructions = 'Four offensive players spaced around the perimeter, four defenders matched up. Coach feeds the ball into rotation.',
  how_to_run = 'Offense passes the ball around without dribbling. Defense adjusts position on every pass — ball pressure, help side, deny one pass away. Coach occasionally signals a drive so defense must close out, contest, and rotate.',
  coaching_points = E'• On the catch, defender is in stance — not standing up\n• One pass away = deny stance with hand in the passing lane\n• Two passes away = sink to the paint, see ball and player'
where id = '1ba50000-0000-4000-8000-000000000011';

update public.drills set
  player_count = 'Pairs (rotating)',
  equipment = '1 ball, 1 hoop',
  setup_instructions = 'Defender stands at the rim. Shooter at the wing or top of the key. Coach has the ball in the paint.',
  how_to_run = 'Coach passes to the shooter. Defender sprints out, chopping their feet in the last 3 steps, contests with high hand without leaving feet. Reset, repeat 5 times. Rotate defender after each set.',
  coaching_points = E'• Sprint the first half of the closeout, chop your feet in the last half\n• High hand on contest — do not slap down\n• Force the shooter to one side by angling your closeout'
where id = '1ba50000-0000-4000-8000-000000000012';

update public.drills set
  player_count = 'Pairs',
  equipment = '1 ball, 1 hoop',
  setup_instructions = 'Defender at the free throw line facing the basket. Offensive player at the elbow. Coach stands at the wing with the ball.',
  how_to_run = 'Coach shoots an intentional miss. Defender turns, finds the offensive player, makes contact with a forearm bar, then pursues the rebound. Offensive player tries to get position. 5 reps then switch roles.',
  coaching_points = E'• Find the man FIRST, then find the ball\n• Two hands on the rebound — chin the ball strong\n• Pivot away from pressure before passing out'
where id = '1ba50000-0000-4000-8000-000000000013';

update public.drills set
  player_count = 'Pairs (rotating)',
  equipment = '1 ball per pair',
  setup_instructions = 'Offensive player at the top of the key with the ball. Defender 3 feet away in defensive stance. Mark sidelines with cones so the offense cannot leave the half court.',
  how_to_run = 'Live 1-on-1 with a 2-dribble limit for the offense. Defender plays full extension, attempting to influence the ball handler one direction. Each rep is 10 seconds max. Swap roles every 3 reps.',
  coaching_points = E'• Stance: butt low, chest forward, hands wide\n• Slide, do not crossover — stay square\n• Influence the offense to their weak hand or a sideline'
where id = '1ba50000-0000-4000-8000-000000000014';

update public.drills set
  player_count = '5 defenders + 5 offensive walkers',
  equipment = '1 ball, half court',
  setup_instructions = 'Five offensive players spread around the perimeter and post. Five defenders matched up. Coach signals which offensive player has the ball.',
  how_to_run = 'On every coach signal, the ball moves to a new offensive player (skip pass, drive, kick out). Defense rotates as a unit. Coach pauses occasionally to check: who is on the ball, who is in help, who has the weak side. 10-minute live block.',
  coaching_points = E'• Talk every possession — "ball," "help," "I have him"\n• On a baseline drive, weakside defenders rotate up\n• Recover hard after a kick-out — closeout under control'
where id = '1ba50000-0000-4000-8000-000000000015';

update public.drills set
  player_count = 'Full team',
  equipment = '1 ball, 1 hoop',
  setup_instructions = 'Players line up at the free throw line. The rest of the team stands at half court watching.',
  how_to_run = 'Coach announces the game situation before each free throw ("Down 1, no time on the clock," "Tied, one-and-one"). Player shoots 2 free throws. Track makes and misses. Run all players through one round.',
  coaching_points = E'• Same routine every shot — bounces, breath, release\n• Eyes on the front rim or back rim — pick one and stay with it\n• Misses are noise — clear them before the next shot'
where id = '1ba50000-0000-4000-8000-000000000016';

update public.drills set
  player_count = '5 players + 5 defenders',
  equipment = '1 ball',
  setup_instructions = 'Five offensive players in their named SLOB positions. Inbounder stands out of bounds at the sideline in the front court. Five defenders match up.',
  how_to_run = 'Inbounder calls the play by number. Team executes 2–3 named sideline out-of-bounds plays. Run each play 2 times against live defense. Coach freezes after to discuss what was open.',
  coaching_points = E'• Inbounder is the second decision-maker — they choose if the first option is covered\n• Screens must be set before the cutter moves — timing is everything\n• Have a safety release that comes back to the ball'
where id = '1ba50000-0000-4000-8000-000000000017';

update public.drills set
  player_count = '5 players + 5 defenders',
  equipment = '1 ball',
  setup_instructions = 'Five offensive players under the basket in named BLOB positions. Inbounder out of bounds at the baseline. Five defenders match up.',
  how_to_run = 'Inbounder calls the play. Team executes 2–3 named baseline out-of-bounds plays. Run each play 2 times. Focus on screen angle, second-cut options, and a kick-out safety.',
  coaching_points = E'• First cutter is the decoy half the time — sell the cut\n• Inbounder must look at the first cut to draw defender attention\n• Plant foot inbounds the moment you pass — be ready for the return'
where id = '1ba50000-0000-4000-8000-000000000018';

update public.drills set
  player_count = '5 offensive players + 5 defenders',
  equipment = '1 ball, full court',
  setup_instructions = 'Defense sets up in a 1-2-1-1 or 2-2-1 full-court press. Offense lines up to break the press with an inbounder + 4 receivers spaced across the court.',
  how_to_run = 'Inbounder gets the ball into play. Offense must reach the front court within 8 seconds without turning the ball over. Practice attacking the middle, getting outlets, and finding the second cutter. Coach freezes after each rep.',
  coaching_points = E'• Inbound to the middle of the floor when possible — corners trap easily\n• Speed dribble straight ahead when you have it — do not retreat\n• Receivers stay between the ball handler and basket — never behind them'
where id = '1ba50000-0000-4000-8000-000000000019';

update public.drills set
  player_count = '5 offensive players + 5 defenders',
  equipment = '1 ball, game clock or stopwatch',
  setup_instructions = 'Set the clock to a specific number (5, 3, or 1 second). Coach calls the score: "Down 2, no timeouts" or "Tied, one possession." Team takes their inbound or starting position.',
  how_to_run = 'Team runs a named end-of-game set or inbounds play to generate the right shot. Defense plays it live. 5 reps per clock scenario. Trains decision-making under pressure.',
  coaching_points = E'• Down 2 in the final 5 seconds = take the 2 to send it to overtime (unless coach says otherwise)\n• 1 second is a catch-and-shoot only — no dribbles\n• Know your foul-to-give situation before the play starts'
where id = '1ba50000-0000-4000-8000-000000000020';

update public.drills set
  player_count = 'Full team (in pairs)',
  equipment = '1 ball per pair, full court',
  setup_instructions = 'Pair up players. One in each pair starts at a basket shooting free throws. The other stands at the half-court line.',
  how_to_run = 'Shooter takes 2 free throws. If they make both, both players rest. If they miss one or both, the partner sprints down and back. Then they swap. 5 rounds.',
  coaching_points = E'• Pressure of teammates running is the whole point — embrace it\n• Stick to your routine even when tired\n• A miss is not a failure — how you reset is the measure'
where id = '1ba50000-0000-4000-8000-000000000021';

update public.drills set
  player_count = '10 players',
  equipment = '1 ball, full court',
  setup_instructions = 'Two teams of 5. Full court. Coach in the stands or sideline observing. Keep score on a whiteboard.',
  how_to_run = 'Standard 5-on-5 to 21 points. Made baskets = 2, 3-pointers = 3, free throws = 1. Winner picks the next practice warm-up game. Minimal coaching interruptions — let them play.',
  coaching_points = E'• Game-speed reps with real consequences — coach less, watch more\n• Note effort and communication patterns for next practice\n• Closing scrimmage builds team identity — protect this time'
where id = '1ba50000-0000-4000-8000-000000000022';

update public.drills set
  player_count = 'Full team',
  equipment = 'None',
  setup_instructions = 'Team gathers at center court — everyone standing in a circle, no phones, hands in.',
  how_to_run = 'Coach names ONE specific thing done well today (no generalities). Names ONE focus for next practice. Open to players for one observation each if time allows. Close with the team chant or breakdown.',
  coaching_points = E'• Specificity matters — "your help rotations got faster every round" beats "good practice"\n• One focus point only — three becomes none\n• The tone you close with goes home with them — be intentional'
where id = '1ba50000-0000-4000-8000-000000000023';

update public.drills set
  player_count = '6 players (2 teams of 3)',
  equipment = '1 ball, half court',
  setup_instructions = 'Two teams of 3 at a half-court hoop. Make-it-take-it rules. Out by ones, deuces are twos.',
  how_to_run = 'First team to 11 wins (must win by 2). Standard half-court rules — call your own fouls. Use as a flexible block filler or a transition between structured drills.',
  coaching_points = E'• Minimal coaching — this is competitive free play\n• Watch how players communicate and rotate on defense\n• 3-on-3 is the best stress test for spacing and decision-making'
where id = '1ba50000-0000-4000-8000-000000000024';

update public.drills set
  player_count = 'Pairs',
  equipment = '1 ball per pair, 1 hoop',
  setup_instructions = 'Two players at a hoop with one ball. Spots marked at 5 positions (corner, wing, top, opposite wing, opposite corner).',
  how_to_run = 'Alternating turns. Each player shoots one spot at a time and the partner rebounds and passes back. First to 10 total makes wins. Spots rotate every 2 rounds.',
  coaching_points = E'• Quick catch-and-shoot — no dribbles\n• Partner''s pass should hit you in shooting position, not at your feet\n• Match your partner''s pace — energy is contagious in this drill'
where id = '1ba50000-0000-4000-8000-000000000025';
