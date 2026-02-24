export const mentalGameQuestions = [
  // ============================================================
  // SPOT_MISTAKE - Identify mental/strategic mistakes (7 questions)
  // ============================================================

  // 1 - Easy
  {
    type: 'SPOT_MISTAKE',
    difficulty: 1,
    content: {
      situation:
        'After losing a big hand with pocket Kings, a player immediately starts playing every hand dealt to them for the next 20 minutes.',
      question: 'What mistake is this player making?',
      options: [
        'Playing too many hands due to tilt',
        'Being too cautious after a loss',
        'Adjusting correctly to run bad',
        'Trying to read opponents better',
      ],
    },
    correctAnswer: 'Playing too many hands due to tilt',
    explanation:
      'After a bad beat, frustration can cause players to loosen up and play hands they normally would fold. This is revenge tilt -- the urge to win back losses quickly by playing more hands, which usually leads to bigger losses.',
    xpValue: 10,
  },

  // 2 - Easy
  {
    type: 'SPOT_MISTAKE',
    difficulty: 1,
    content: {
      situation:
        'A player calls a large river bet with bottom pair because they already put a lot of chips in the pot on earlier streets.',
      question: 'What mistake is this player making?',
      options: [
        'Sunk cost fallacy -- calling because of chips already invested',
        'Playing too tight by not raising',
        'Correctly protecting their investment',
        'Value betting with a marginal hand',
      ],
    },
    correctAnswer: 'Sunk cost fallacy -- calling because of chips already invested',
    explanation:
      'Chips already in the pot are gone -- they no longer belong to you. Each decision should be based on current pot odds and hand strength, not on how much you have already invested. Calling with bottom pair against a large river bet is almost always a losing play.',
    xpValue: 10,
  },

  // 3 - Medium
  {
    type: 'SPOT_MISTAKE',
    difficulty: 2,
    content: {
      situation:
        'A player has been losing all session. They decide to move from $0.05/$0.10 stakes up to $0.25/$0.50 to try to recover their losses faster.',
      question: 'What mistake is this player making?',
      options: [
        'Moving up in stakes to chase losses',
        'Not moving up sooner',
        'Playing too conservatively at low stakes',
        'Properly adjusting their strategy',
      ],
    },
    correctAnswer: 'Moving up in stakes to chase losses',
    explanation:
      'Moving up in stakes during a losing session is one of the most costly mistakes in poker. The competition is tougher at higher stakes, you are likely already tilting, and the bigger swings can devastate your bankroll. Always move up based on skill and bankroll -- never to chase losses.',
    xpValue: 15,
  },

  // 4 - Medium
  {
    type: 'SPOT_MISTAKE',
    difficulty: 2,
    content: {
      situation:
        'A player always bets the same size regardless of the board, their hand, or the situation. They bet half-pot every single time they bet.',
      question: 'What mistake is this player making?',
      options: [
        'Using a predictable, one-size-fits-all bet sizing',
        'Betting too small on every street',
        'Playing a mathematically optimal strategy',
        'Being too aggressive with their bets',
      ],
    },
    correctAnswer: 'Using a predictable, one-size-fits-all bet sizing',
    explanation:
      'Good players vary their bet sizes based on board texture, hand strength, and what they want to accomplish. Betting the same size every time makes you easy to read and means you miss value with strong hands and waste chips on bluffs.',
    xpValue: 15,
  },

  // 5 - Medium
  {
    type: 'SPOT_MISTAKE',
    difficulty: 2,
    content: {
      situation:
        'A player thinks "I have been folding for an hour, I deserve to win a pot." They call a raise with 7-2 offsuit from early position.',
      question: 'What mistake is this player making?',
      options: [
        'Letting boredom override discipline -- the cards have no memory',
        'Folding too much before this hand',
        'Not raising instead of calling',
        'Playing too tight overall',
      ],
    },
    correctAnswer: 'Letting boredom override discipline -- the cards have no memory',
    explanation:
      'Cards are random and have no memory of past deals. Being "due" for a good hand is the gambler\'s fallacy. Playing junk hands out of boredom or frustration is a mental game leak that costs money over time. Discipline means waiting for good spots regardless of how long it takes.',
    xpValue: 15,
  },

  // 6 - Hard
  {
    type: 'SPOT_MISTAKE',
    difficulty: 3,
    content: {
      situation:
        'A winning player studies their losing hands carefully to find leaks, but never reviews hands where they won big pots.',
      question: 'What mistake is this player making?',
      options: [
        'Only reviewing losses -- winners can contain mistakes too',
        'Studying too much instead of playing',
        'Focusing on the wrong stakes',
        'Not using tracking software',
      ],
    },
    correctAnswer: 'Only reviewing losses -- winners can contain mistakes too',
    explanation:
      'You can win a pot despite making a mistake (like getting lucky on the river). Reviewing only losses creates a biased picture of your game. A complete study routine includes reviewing winning hands to confirm good decisions and catch hidden leaks where you got lucky despite poor play.',
    xpValue: 20,
  },

  // 7 - Hard
  {
    type: 'SPOT_MISTAKE',
    difficulty: 3,
    content: {
      situation:
        'A player is at a table where one opponent is very aggressive and hard to play against. The player keeps getting into big pots with this opponent and losing. They refuse to change tables or adjust.',
      question: 'What mistake is this player making?',
      options: [
        'Ego -- refusing to leave a tough spot or adjust strategy',
        'Not bluffing enough against the aggressive player',
        'Playing too tight against aggression',
        'Correctly standing their ground at the table',
      ],
    },
    correctAnswer: 'Ego -- refusing to leave a tough spot or adjust strategy',
    explanation:
      'Poker is about making money, not proving you can beat a specific player. If someone at your table is giving you trouble, the smart play is to either adjust your strategy against them or simply move to a more profitable table. Ego-driven decisions are expensive.',
    xpValue: 20,
  },

  // ============================================================
  // TILT_RESPONSE - Best response to tilt-inducing situations (7 questions)
  // ============================================================

  // 8 - Easy
  {
    type: 'TILT_RESPONSE',
    difficulty: 1,
    content: {
      situation:
        'You just lost three hands in a row. You notice your hands are shaking and you feel your heart racing.',
      question: 'What is the best response?',
      options: [
        'Take a break and step away from the table',
        'Play more aggressively to win it back',
        'Move to a higher stakes table',
        'Keep playing but bet bigger',
      ],
    },
    correctAnswer: 'Take a break and step away from the table',
    explanation:
      'Physical signs like shaking hands and a racing heart are clear tilt indicators. When your body is in fight-or-flight mode, your decision-making suffers. The best response is always to step away, calm down, and return only when you can think clearly.',
    xpValue: 10,
  },

  // 9 - Easy
  {
    type: 'TILT_RESPONSE',
    difficulty: 1,
    content: {
      situation:
        'An opponent hits a miracle two-outer on the river to crack your full house. They celebrate loudly.',
      question: 'What is the best response?',
      options: [
        'Stay calm -- bad beats happen and you played correctly',
        'Tell the opponent they got lucky and played badly',
        'Immediately go all-in on the next hand to show strength',
        'Leave the game permanently',
      ],
    },
    correctAnswer: 'Stay calm -- bad beats happen and you played correctly',
    explanation:
      'Bad beats are a normal part of poker. If you got your money in with the best hand, you made the right decision. Over time, correct play is profitable. Reacting emotionally or berating opponents only hurts your own game and gives away information.',
    xpValue: 10,
  },

  // 10 - Medium
  {
    type: 'TILT_RESPONSE',
    difficulty: 2,
    content: {
      situation:
        'You have been card dead for two hours -- nothing but junk hands. You finally pick up Ace-King, raise, and get three callers. The flop completely misses you.',
      question: 'What is the healthiest mental approach?',
      options: [
        'Accept that good hands miss sometimes and play this spot on its merits',
        'Bet big because you deserve to win after waiting so long',
        'Go all-in to punish the callers',
        'Fold and complain about your luck',
      ],
    },
    correctAnswer: 'Accept that good hands miss sometimes and play this spot on its merits',
    explanation:
      'Being card dead does not entitle you to win the next hand. Ace-King misses the flop about two-thirds of the time. Each hand must be played based on the current situation -- board texture, opponents, and position -- not on how long you have been waiting.',
    xpValue: 15,
  },

  // 11 - Medium
  {
    type: 'TILT_RESPONSE',
    difficulty: 2,
    content: {
      situation:
        'You made what you believe was a perfect bluff, but your opponent snap-called with a weak hand and happened to be right. You feel frustrated that your skill was not rewarded.',
      question: 'What is the best way to handle this?',
      options: [
        'Note the opponent calls light and adjust -- bluff them less, value bet more',
        'Keep bluffing them until they fold',
        'Stop bluffing entirely for the rest of the session',
        'Tell the table your opponent made a bad call',
      ],
    },
    correctAnswer: 'Note the opponent calls light and adjust -- bluff them less, value bet more',
    explanation:
      'When an opponent calls with weak hands, that is valuable information. Instead of getting frustrated, adjust your strategy: bluff less against calling stations and value bet thinner. Adapting to opponents is a core poker skill and turns their tendencies into your profit.',
    xpValue: 15,
  },

  // 12 - Medium
  {
    type: 'TILT_RESPONSE',
    difficulty: 2,
    content: {
      situation:
        'You have lost your last five sessions in a row. You are starting to doubt whether you are any good at poker.',
      question: 'What is the most productive response?',
      options: [
        'Review your hands objectively or get coaching to identify leaks',
        'Play more volume to turn your luck around',
        'Move down to the lowest stakes to rebuild confidence',
        'Quit poker entirely since you keep losing',
      ],
    },
    correctAnswer: 'Review your hands objectively or get coaching to identify leaks',
    explanation:
      'Losing streaks happen to every player due to variance. But five losing sessions in a row is also worth investigating. The productive response is to study your play objectively -- review hand histories, check for tilt-driven decisions, or get a more experienced player to review your game.',
    xpValue: 15,
  },

  // 13 - Hard
  {
    type: 'TILT_RESPONSE',
    difficulty: 3,
    content: {
      situation:
        'You are playing in a tournament and just doubled up with a great play. You feel confident and invincible. You start entering more pots and playing more aggressively than your normal strategy.',
      question: 'What type of tilt is this, and what should you do?',
      options: [
        'Winner\'s tilt -- overconfidence is also tilt; return to your normal strategy',
        'This is not tilt -- you should capitalize on your momentum',
        'Aggression tilt -- you need to play even more aggressively',
        'Stack tilt -- you should protect your big stack by folding more',
      ],
    },
    correctAnswer: 'Winner\'s tilt -- overconfidence is also tilt; return to your normal strategy',
    explanation:
      'Tilt is not just about losing. Winner\'s tilt (also called euphoria tilt) happens when a big win makes you feel invincible, causing you to play looser and more recklessly. Good play means sticking to your strategy regardless of recent results, whether you are up or down.',
    xpValue: 20,
  },

  // 14 - Hard
  {
    type: 'TILT_RESPONSE',
    difficulty: 3,
    content: {
      situation:
        'A player at your table has been verbally needling you, making comments about your play after every hand. You feel angry and want to prove them wrong.',
      question: 'What is the optimal response?',
      options: [
        'Ignore them completely -- emotional reactions cloud your judgment',
        'Needle them back to establish dominance',
        'Target them specifically and try to take all their chips',
        'Call the floor manager to have them removed',
      ],
    },
    correctAnswer: 'Ignore them completely -- emotional reactions cloud your judgment',
    explanation:
      'Table talk and needling are deliberate strategies some players use to put you on tilt. The moment you start playing to "prove them wrong" instead of making optimal decisions, they have already won the mental battle. Ignore it, stay focused on your strategy, and let your chips do the talking.',
    xpValue: 20,
  },

  // ============================================================
  // RESULTS_VS_DECISION - Good decisions vs good results (7 questions)
  // ============================================================

  // 15 - Easy
  {
    type: 'RESULTS_VS_DECISION',
    difficulty: 1,
    content: {
      situation:
        'You called an all-in with a flush draw. You had a 35% chance to win. You hit your flush on the river and won a big pot.',
      question: 'Was this a good decision?',
      options: [
        'It depends on the pot odds -- the decision quality is separate from the result',
        'Yes -- you won money so it was clearly the right call',
        'No -- flush draws never justify calling all-in',
        'Yes -- you should always call with a flush draw',
      ],
    },
    correctAnswer: 'It depends on the pot odds -- the decision quality is separate from the result',
    explanation:
      'Whether a call is correct depends on pot odds, not on whether you won. With 35% equity, you need about 2:1 pot odds to call profitably. If the pot offered those odds, it was a good call regardless of the result. If not, it was a bad call even though you won.',
    xpValue: 10,
  },

  // 16 - Easy
  {
    type: 'RESULTS_VS_DECISION',
    difficulty: 1,
    content: {
      situation:
        'You correctly folded a weak hand preflop. The board ran out and you would have made a straight.',
      question: 'Should you regret this fold?',
      options: [
        'No -- you made the right decision with the information you had',
        'Yes -- you missed out on a big hand',
        'Yes -- you should play more hands to avoid missing out',
        'It depends on how big the pot was',
      ],
    },
    correctAnswer: 'No -- you made the right decision with the information you had',
    explanation:
      'You can only make decisions based on the information available at the time. Folding a weak hand preflop is correct even if it would have hit. If you start playing bad hands because they "might" connect, you will lose much more than you win over time.',
    xpValue: 10,
  },

  // 17 - Medium
  {
    type: 'RESULTS_VS_DECISION',
    difficulty: 2,
    content: {
      situation:
        'You went all-in preflop with pocket Aces (85% favorite). Your opponent called with 7-2 offsuit and hit two pair on the flop. You lost.',
      question: 'How should you evaluate your play?',
      options: [
        'Excellent decision, unlucky result -- keep making this play every time',
        'Bad decision because you lost the hand',
        'You should have folded to avoid the risk',
        'You should have bet less to minimize losses',
      ],
    },
    correctAnswer: 'Excellent decision, unlucky result -- keep making this play every time',
    explanation:
      'Getting all your chips in as an 85% favorite is one of the best situations in poker. The 15% happens sometimes -- that is just variance. If you could replay this situation 1,000 times, you would profit enormously. Never let a bad result change a winning strategy.',
    xpValue: 15,
  },

  // 18 - Medium
  {
    type: 'RESULTS_VS_DECISION',
    difficulty: 2,
    content: {
      situation:
        'A player at your table consistently calls large bets with weak draws and no pot odds. Tonight they have won several big pots this way.',
      question: 'What conclusion should you draw?',
      options: [
        'They are making bad decisions that happened to work out -- they will lose long-term',
        'They have found a winning strategy you should copy',
        'Calling with draws must be more profitable than you thought',
        'You should stop betting into them',
      ],
    },
    correctAnswer: 'They are making bad decisions that happened to work out -- they will lose long-term',
    explanation:
      'Short-term results in poker are heavily influenced by luck. A player making mathematically incorrect calls will sometimes win in a single session, but over hundreds of sessions they will lose money. Do not confuse a lucky night with a sound strategy.',
    xpValue: 15,
  },

  // 19 - Medium
  {
    type: 'RESULTS_VS_DECISION',
    difficulty: 2,
    content: {
      situation:
        'You made a large bluff on the river. Your opponent thought for a long time and then folded. Later they told you they had top pair.',
      question: 'Was this necessarily a good bluff?',
      options: [
        'Not necessarily -- a good bluff depends on your read and the situation, not just the result',
        'Yes -- any bluff that works is a good bluff',
        'No -- bluffing is always wrong',
        'Yes -- making top pair fold proves you are a great player',
      ],
    },
    correctAnswer: 'Not necessarily -- a good bluff depends on your read and the situation, not just the result',
    explanation:
      'A bluff that works is not automatically a good bluff. If your opponent was a calling station who happened to fold this one time, it was still a bad bluff that got lucky. Good bluffs are based on solid reads, board texture, and credible stories -- not just on whether they happen to work.',
    xpValue: 15,
  },

  // 20 - Hard
  {
    type: 'RESULTS_VS_DECISION',
    difficulty: 3,
    content: {
      situation:
        'You are reviewing your play for the month. You lost money overall but feel you played well. Your friend says "If you were playing well, you would be winning."',
      question: 'Is your friend correct?',
      options: [
        'No -- variance means good players can lose over weeks or even months',
        'Yes -- winning is the only measure of good play',
        'Yes -- a full month is enough to eliminate variance',
        'No -- but you should probably move down in stakes anyway',
      ],
    },
    correctAnswer: 'No -- variance means good players can lose over weeks or even months',
    explanation:
      'Poker has significant short-term variance. Even strong winning players can have losing months. A month of results (typically a few thousand hands for recreational players) is far too small a sample to draw conclusions about skill. Evaluate your decisions, not your results, over small samples.',
    xpValue: 20,
  },

  // 21 - Hard
  {
    type: 'RESULTS_VS_DECISION',
    difficulty: 3,
    content: {
      situation:
        'Two players both call a bet on the river. Player A had correct pot odds (getting 4:1 with 25% equity) and won. Player B had terrible pot odds (getting 2:1 with 10% equity) and also won.',
      question: 'Which player made the better decision?',
      options: [
        'Player A -- correct pot odds make it a good call regardless of Player B also winning',
        'Both made equally good decisions since both won',
        'Player B -- they won with worse odds, showing superior skill',
        'Neither -- calling is always worse than raising',
      ],
    },
    correctAnswer: 'Player A -- correct pot odds make it a good call regardless of Player B also winning',
    explanation:
      'Player A made a mathematically sound call (25% equity vs needing 20% to call). Player B made a losing call (10% equity vs needing 33% to call). Both won this time, but over thousands of hands, Player A\'s decision prints money while Player B\'s decision loses money. The result of a single hand tells you nothing about decision quality.',
    xpValue: 20,
  },

  // ============================================================
  // BANKROLL - Bankroll management questions (7 questions)
  // ============================================================

  // 22 - Easy
  {
    type: 'BANKROLL',
    difficulty: 1,
    content: {
      question: 'What is "bankroll management" in poker?',
      options: [
        'Setting aside a specific amount of money for poker and only playing stakes you can afford',
        'Counting your chips during a hand to decide bet sizes',
        'Keeping track of how much you have won or lost tonight',
        'Putting all your savings into poker to maximize returns',
      ],
    },
    correctAnswer: 'Setting aside a specific amount of money for poker and only playing stakes you can afford',
    explanation:
      'Bankroll management means having a dedicated poker fund separate from your living expenses, and playing at stakes where your bankroll can handle the natural ups and downs (variance). It protects you from going broke during normal losing streaks.',
    xpValue: 10,
  },

  // 23 - Easy
  {
    type: 'BANKROLL',
    difficulty: 1,
    content: {
      question: 'Why should you never play poker with money you cannot afford to lose?',
      options: [
        'Scared money leads to poor decisions -- you cannot play optimally when afraid to lose',
        'There is no reason -- any money works for poker',
        'Because poker is pure luck and you will always lose',
        'Because casinos are rigged against you',
      ],
    },
    correctAnswer: 'Scared money leads to poor decisions -- you cannot play optimally when afraid to lose',
    explanation:
      'When you play with money you need for rent or bills, fear of losing affects every decision. You fold too much, miss value bets, and cannot pull the trigger on correct bluffs. Optimal poker requires being comfortable with the stakes you are playing.',
    xpValue: 10,
  },

  // 24 - Medium
  {
    type: 'BANKROLL',
    difficulty: 2,
    content: {
      question:
        'For a beginning cash game player at $0.05/$0.10 (max buy-in $10), how many buy-ins should your bankroll have at minimum?',
      options: [
        '20-30 buy-ins ($200-$300)',
        '3-5 buy-ins ($30-$50)',
        '50-100 buy-ins ($500-$1,000)',
        '1-2 buy-ins ($10-$20)',
      ],
    },
    correctAnswer: '20-30 buy-ins ($200-$300)',
    explanation:
      'A standard bankroll guideline for cash games is 20-30 buy-ins. This gives you enough cushion to survive normal downswings without going broke. With only a few buy-ins, even a small run of bad luck can wipe you out before your skill edge materializes.',
    xpValue: 15,
  },

  // 25 - Medium
  {
    type: 'BANKROLL',
    difficulty: 2,
    content: {
      question:
        'You have a $500 bankroll for cash games. You have been winning consistently and your bankroll has grown to $1,000. When is it appropriate to move up in stakes?',
      options: [
        'When your bankroll supports 20-30 buy-ins at the next level and you are beating your current level',
        'Immediately -- you should always play the highest stakes you can afford',
        'Never -- stay at your current level forever',
        'After winning 3 sessions in a row at your current level',
      ],
    },
    correctAnswer: 'When your bankroll supports 20-30 buy-ins at the next level and you are beating your current level',
    explanation:
      'Moving up should be based on two factors: having enough bankroll (20-30 buy-ins at the new level) and proven results showing you can beat your current level. Three winning sessions is not enough data -- you need a meaningful sample showing consistent profit.',
    xpValue: 15,
  },

  // 26 - Medium
  {
    type: 'BANKROLL',
    difficulty: 2,
    content: {
      question:
        'You moved up from $0.05/$0.10 to $0.10/$0.25. After two weeks, your bankroll has dropped from 25 buy-ins to 15 buy-ins at the new level. What should you do?',
      options: [
        'Move back down to $0.05/$0.10 until you rebuild to 20+ buy-ins',
        'Stay at $0.10/$0.25 and hope the cards turn around',
        'Move up to $0.25/$0.50 to recover faster',
        'Stop playing poker completely',
      ],
    },
    correctAnswer: 'Move back down to $0.05/$0.10 until you rebuild to 20+ buy-ins',
    explanation:
      'There is no shame in moving down. Dropping back to a level where you have a proven edge lets you rebuild your bankroll safely. Good bankroll management means moving down when you hit a predetermined stop-loss threshold, typically around 15 buy-ins.',
    xpValue: 15,
  },

  // 27 - Hard
  {
    type: 'BANKROLL',
    difficulty: 3,
    content: {
      question:
        'Why do tournaments require a larger bankroll (50-100 buy-ins) compared to cash games (20-30 buy-ins)?',
      options: [
        'Tournaments have higher variance -- you will lose most events even if you are a strong player',
        'Tournament buy-ins are always more expensive',
        'Cash games are easier to beat',
        'Tournament players are worse so you need less protection',
      ],
    },
    correctAnswer: 'Tournaments have higher variance -- you will lose most events even if you are a strong player',
    explanation:
      'In tournaments, even the best players in the world only cash (finish in the money) about 15-20% of the time. The top-heavy payout structure means long stretches without cashing are normal. The higher variance demands a bigger bankroll cushion compared to cash games where you can book smaller, steadier wins.',
    xpValue: 20,
  },

  // 28 - Hard
  {
    type: 'BANKROLL',
    difficulty: 3,
    content: {
      question:
        'A recreational player earns $3,000/month from their job and has $300 set aside for poker. They want to play $1/$2 live cash games where the typical buy-in is $200. Is this bankroll adequate?',
      options: [
        'No -- 1.5 buy-ins is dangerously underfunded; they need at least $4,000-$6,000',
        'Yes -- $300 is enough for one session',
        'Yes -- they can reload from their paycheck if they lose',
        'No -- they should play $5/$10 instead for better competition',
      ],
    },
    correctAnswer: 'No -- 1.5 buy-ins is dangerously underfunded; they need at least $4,000-$6,000',
    explanation:
      'At $1/$2 with $200 buy-ins, you need 20-30 buy-ins ($4,000-$6,000). Playing with 1.5 buy-ins means one bad session wipes you out. The player should either build their bankroll at lower stakes, play in smaller games, or save more before taking a shot at $1/$2.',
    xpValue: 20,
  },

  // ============================================================
  // SESSION_MANAGEMENT - When to quit, breaks, moving stakes (7 questions)
  // ============================================================

  // 29 - Easy
  {
    type: 'SESSION_MANAGEMENT',
    difficulty: 1,
    content: {
      question: 'What is the most important thing to set before starting a poker session?',
      options: [
        'A stop-loss limit and a time limit',
        'A goal for how much you want to win',
        'The exact hands you will play',
        'A lucky charm on the table',
      ],
    },
    correctAnswer: 'A stop-loss limit and a time limit',
    explanation:
      'Before every session, decide the maximum you are willing to lose (stop-loss) and how long you will play. Setting these limits before you start prevents emotional decisions later. A win goal is less important because you should keep playing when conditions are good.',
    xpValue: 10,
  },

  // 30 - Easy
  {
    type: 'SESSION_MANAGEMENT',
    difficulty: 1,
    content: {
      situation: 'You have been playing for four hours straight without a break.',
      question: 'What is a sign that you should take a break?',
      options: [
        'You are having trouble focusing and making decisions feels harder than usual',
        'You have won a lot of money',
        'The table just got a new player',
        'You have been folding for 30 minutes',
      ],
    },
    correctAnswer: 'You are having trouble focusing and making decisions feels harder than usual',
    explanation:
      'Mental fatigue degrades decision quality. When decisions that should be routine start feeling difficult, or you catch yourself not paying attention to the action, your brain is telling you to take a break. Even five minutes away from the table helps refresh your focus.',
    xpValue: 10,
  },

  // 31 - Medium
  {
    type: 'SESSION_MANAGEMENT',
    difficulty: 2,
    content: {
      situation:
        'You are up 3 buy-ins in a cash game session. The game is good and you are playing well. But you told yourself you would quit after doubling up.',
      question: 'What should you do?',
      options: [
        'Keep playing -- if you are playing well and the game is good, there is no reason to leave',
        'Quit immediately because you met your win goal',
        'Leave half your winnings on the table and keep playing with the rest',
        'Move to a higher stakes table with your winnings',
      ],
    },
    correctAnswer: 'Keep playing -- if you are playing well and the game is good, there is no reason to leave',
    explanation:
      'In cash games, the best time to play is when you are focused, playing well, and the table conditions are favorable. Rigid win goals cause you to leave profitable situations. Your stop-loss matters more than your win goal -- protect your downside but let your upside run.',
    xpValue: 15,
  },

  // 32 - Medium
  {
    type: 'SESSION_MANAGEMENT',
    difficulty: 2,
    content: {
      situation:
        'It is 2 AM. You have work at 8 AM. You are stuck one buy-in but the game is good.',
      question: 'What should you do?',
      options: [
        'Quit for the night -- fatigue will cost you more than the good game conditions are worth',
        'Keep playing until you get even',
        'Play for two more hours to capitalize on the good game',
        'Take a coffee break and keep playing until dawn',
      ],
    },
    correctAnswer: 'Quit for the night -- fatigue will cost you more than the good game conditions are worth',
    explanation:
      'Sleep deprivation is one of the biggest leaks in poker. Even if the game is great, playing tired makes you miss information, miscalculate odds, and increases tilt susceptibility. A good game will come again; the money you lose playing tired is real. Poker will always be there tomorrow.',
    xpValue: 15,
  },

  // 33 - Medium
  {
    type: 'SESSION_MANAGEMENT',
    difficulty: 2,
    content: {
      question: 'What is a "stop-loss" in the context of session management?',
      options: [
        'A predetermined maximum amount you are willing to lose in one session before quitting',
        'A bet that stops you from losing more chips in a hand',
        'A strategy where you stop calling and only fold',
        'The minimum amount of chips you must have to stay at the table',
      ],
    },
    correctAnswer: 'A predetermined maximum amount you are willing to lose in one session before quitting',
    explanation:
      'A stop-loss is a limit you set before playing -- for example, "I will quit if I lose 3 buy-ins." It prevents you from chasing losses during a bad session. When you hit your stop-loss, leave. No exceptions, no "one more hand." This discipline protects your bankroll and your mental game.',
    xpValue: 15,
  },

  // 34 - Hard
  {
    type: 'SESSION_MANAGEMENT',
    difficulty: 3,
    content: {
      situation:
        'You are playing in an online session. You have 6 tables open. You notice you are timing out on decisions and making snap calls instead of thinking through hands.',
      question: 'What should you do?',
      options: [
        'Close some tables until you can give proper attention to each decision',
        'Speed up your decision-making to keep up',
        'Open more tables to increase your hourly rate',
        'Turn off the time bank feature so you have more time',
      ],
    },
    correctAnswer: 'Close some tables until you can give proper attention to each decision',
    explanation:
      'Multi-tabling only works when you can make quality decisions at every table. If you are timing out or making snap decisions, you are playing too many tables. It is better to play fewer tables with good decisions than many tables with poor ones. Quality over quantity maximizes your win rate.',
    xpValue: 20,
  },

  // 35 - Hard
  {
    type: 'SESSION_MANAGEMENT',
    difficulty: 3,
    content: {
      situation:
        'You are a winning player at $0.10/$0.25 online. You have built your bankroll from $300 to $800 over three months. A friend invites you to a $1/$2 home game with a $200 buy-in.',
      question: 'How should you approach this decision?',
      options: [
        'It is reasonable as a one-time shot if you limit yourself to one buy-in and accept the risk',
        'Never play -- the stakes are too high for your bankroll',
        'Buy in for $400 to have an advantage over the table',
        'Go every week since home games are easy',
      ],
    },
    correctAnswer: 'It is reasonable as a one-time shot if you limit yourself to one buy-in and accept the risk',
    explanation:
      'Taking occasional "shots" at higher stakes is part of bankroll building, as long as you limit your risk. With $800, risking one $200 buy-in (25% of bankroll) is aggressive but manageable if it is a one-time event and you can afford to lose it. The key is setting a strict limit and sticking to it -- no rebuys if you bust.',
    xpValue: 20,
  },
];
