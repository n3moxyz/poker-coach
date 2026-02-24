export const handFlowQuestions = [
  // ============================================================
  // ACTION_AVAILABLE (~10 questions)
  // ============================================================
  {
    type: 'ACTION_AVAILABLE',
    difficulty: 1,
    content: {
      situation: 'You are first to act preflop. No one has raised yet.',
      question: 'What actions are available to you?',
      options: [
        'Fold, Call, or Raise',
        'Fold or Raise',
        'Check or Bet',
      ],
    },
    correctAnswer: 'Fold or Raise',
    explanation:
      'Preflop as first to act, you can fold or raise. There is no bet to "call" — the big blind is a forced bet, and matching it is technically a raise to the minimum. In common usage this is called a "call," but the key concept is that checking is not an option because the big blind counts as a live bet.',
    xpValue: 10,
  },
  {
    type: 'ACTION_AVAILABLE',
    difficulty: 1,
    content: {
      situation: 'You are on the flop. Everyone has checked to you.',
      question: 'What actions are available to you?',
      options: [
        'Check or Bet',
        'Fold, Call, or Raise',
        'Only Bet',
      ],
    },
    correctAnswer: 'Check or Bet',
    explanation:
      'When no one has bet on the current street, you can check (pass the action) or bet. You cannot fold or call because there is nothing to fold to or call.',
    xpValue: 10,
  },
  {
    type: 'ACTION_AVAILABLE',
    difficulty: 1,
    content: {
      situation: 'An opponent bets on the river. You are next to act.',
      question: 'What are your options?',
      options: [
        'Fold, Call, or Raise',
        'Only Fold or Call',
        'Check or Call',
      ],
    },
    correctAnswer: 'Fold, Call, or Raise',
    explanation:
      'Facing a bet, you always have three options: fold (give up your hand), call (match the bet), or raise (increase the bet). You can raise on any street, including the river.',
    xpValue: 10,
  },
  {
    type: 'ACTION_AVAILABLE',
    difficulty: 2,
    content: {
      situation: 'You bet on the flop. Your opponent raises. Action is back to you.',
      question: 'What can you do?',
      options: [
        'Fold, Call, or Re-raise',
        'Only Call or Fold',
        'Check or Call',
      ],
    },
    correctAnswer: 'Fold, Call, or Re-raise',
    explanation:
      'When facing a raise, you can fold (give up), call (match the raise amount), or re-raise (raise again). In No Limit Hold\'em, you can always re-raise as long as you have chips.',
    xpValue: 15,
  },
  {
    type: 'ACTION_AVAILABLE',
    difficulty: 2,
    content: {
      situation: 'You only have 500 chips left. The opponent bets 1,200 on the turn.',
      question: 'Can you still play this hand?',
      options: [
        'Yes — you can go all-in for your remaining 500',
        'No — you cannot call a bet larger than your stack',
        'Yes — but only if you borrow chips',
      ],
    },
    correctAnswer: 'Yes — you can go all-in for your remaining 500',
    explanation:
      'You can always go all-in for whatever chips you have, even if the bet is larger than your stack. You will be eligible to win the portion of the pot matching your investment. This is called a "side pot" situation.',
    xpValue: 15,
  },
  {
    type: 'ACTION_AVAILABLE',
    difficulty: 2,
    content: {
      situation: 'You are in the big blind preflop. Everyone folds to you.',
      question: 'What happens?',
      options: [
        'You win the pot — no need to act',
        'You must check to see the flop',
        'You must fold because no one called',
      ],
    },
    correctAnswer: 'You win the pot — no need to act',
    explanation:
      'If everyone folds to the big blind preflop, the big blind wins the small blind. The hand is over — there is no flop. You collect the pot automatically.',
    xpValue: 15,
  },
  {
    type: 'ACTION_AVAILABLE',
    difficulty: 3,
    content: {
      situation:
        'A player puts out a single large chip without saying "raise." The previous bet was 100.',
      question: 'In most casino rules, what is this considered?',
      options: [
        'A call — a single oversized chip is a call unless the player announces raise',
        'A raise to whatever the chip is worth',
        'An illegal action that must be taken back',
      ],
    },
    correctAnswer:
      'A call — a single oversized chip is a call unless the player announces raise',
    explanation:
      'Under standard poker rules, putting out a single chip (even a large denomination) without verbally declaring "raise" is treated as a call. This prevents "string betting" — you must announce your intent before acting.',
    xpValue: 20,
  },
  {
    type: 'ACTION_AVAILABLE',
    difficulty: 3,
    content: {
      situation:
        'A player says "I call" and then immediately says "actually, I raise."',
      question: 'Is this allowed?',
      options: [
        'No — the call stands; you cannot change your action after declaring it',
        'Yes — players can change their mind any time',
        'Yes — as long as no chips have been placed yet',
      ],
    },
    correctAnswer:
      'No — the call stands; you cannot change your action after declaring it',
    explanation:
      'In standard poker rules, a verbal declaration is binding. Once you say "call," you are committed to calling. This rule prevents angle-shooting where players gauge reactions before deciding their action.',
    xpValue: 20,
  },
  {
    type: 'ACTION_AVAILABLE',
    difficulty: 3,
    content: {
      situation:
        'It is not your turn, but you throw your cards into the muck face-down.',
      question: 'What happens?',
      options: [
        'Your hand is dead — acting out of turn forfeits your hand',
        'Nothing — the dealer puts your cards back',
        'You receive a penalty but keep your hand',
      ],
    },
    correctAnswer:
      'Your hand is dead — acting out of turn forfeits your hand',
    explanation:
      'If you release your cards into the muck, your hand is dead regardless of timing. Acting out of turn can also influence other players\' decisions, which is why it is strictly enforced in casinos.',
    xpValue: 20,
  },
  {
    type: 'ACTION_AVAILABLE',
    difficulty: 1,
    content: {
      situation:
        'You are in the big blind preflop. Several players have limped in (just called the big blind).',
      question: 'What are your options?',
      options: [
        'Check or Raise',
        'Fold or Call',
        'Only Check',
      ],
    },
    correctAnswer: 'Check or Raise',
    explanation:
      'In the big blind, when players only call (limp) preflop, you have already put in the required amount. You can check to see the flop for free, or raise to build the pot and thin the field.',
    xpValue: 10,
  },

  // ============================================================
  // STREET_ORDER (~8 questions)
  // ============================================================
  {
    type: 'STREET_ORDER',
    difficulty: 1,
    content: {
      question: 'In what order are community cards dealt in Texas Hold\'em?',
      options: [
        'Flop (3 cards) → Turn (1 card) → River (1 card)',
        'Turn (1 card) → Flop (3 cards) → River (1 card)',
        'All 5 cards are dealt at once',
      ],
    },
    correctAnswer: 'Flop (3 cards) → Turn (1 card) → River (1 card)',
    explanation:
      'After preflop betting, three community cards (the flop) are dealt at once, then one card (the turn), then one more card (the river). There is a betting round after each deal, for a total of four betting rounds.',
    xpValue: 10,
  },
  {
    type: 'STREET_ORDER',
    difficulty: 1,
    content: {
      question: 'How many total community cards are dealt in a full hand of Texas Hold\'em?',
      options: ['5', '3', '7'],
    },
    correctAnswer: '5',
    explanation:
      'A total of 5 community cards are dealt: 3 on the flop, 1 on the turn, and 1 on the river. Combined with your 2 hole cards, you choose the best 5-card hand from 7 cards.',
    xpValue: 10,
  },
  {
    type: 'STREET_ORDER',
    difficulty: 1,
    content: {
      question: 'How many betting rounds are there in a hand of No Limit Hold\'em?',
      options: [
        '4 — preflop, flop, turn, river',
        '3 — flop, turn, river',
        '5 — pre-deal, preflop, flop, turn, river',
      ],
    },
    correctAnswer: '4 — preflop, flop, turn, river',
    explanation:
      'There are four betting rounds: preflop (after hole cards are dealt), flop (after the first 3 community cards), turn (after the 4th card), and river (after the 5th card).',
    xpValue: 10,
  },
  {
    type: 'STREET_ORDER',
    difficulty: 2,
    content: {
      question: 'What is a "burn card" and when is it used?',
      options: [
        'A card discarded face-down before each community card deal',
        'A card that is damaged and removed from the deck',
        'The last card dealt to the player who folds',
      ],
    },
    correctAnswer:
      'A card discarded face-down before each community card deal',
    explanation:
      'Before dealing the flop, turn, and river, the dealer discards ("burns") one card face-down. This is done to prevent cheating — if the top card was marked, the burn card ensures no one knows what community card is coming next.',
    xpValue: 15,
  },
  {
    type: 'STREET_ORDER',
    difficulty: 2,
    content: {
      question:
        'If there are 3 burn cards in a hand, how many cards are used from the deck for community cards and burns combined?',
      options: ['8', '5', '10'],
    },
    correctAnswer: '8',
    explanation:
      'There are 3 burn cards (one before the flop, one before the turn, one before the river) and 5 community cards, totaling 8 cards from the deck. The remaining cards stay in the stub.',
    xpValue: 15,
  },
  {
    type: 'STREET_ORDER',
    difficulty: 2,
    content: {
      question:
        'After which street can your hand no longer improve?',
      options: [
        'After the river — all 5 community cards are out',
        'After the turn — the river does not count',
        'After the flop — your hand is set',
      ],
    },
    correctAnswer: 'After the river — all 5 community cards are out',
    explanation:
      'Once the river card is dealt, all 5 community cards are on the board. No more cards will come, so your final hand is locked in. You can improve on the turn (4th card) and river (5th card), but not after.',
    xpValue: 15,
  },
  {
    type: 'STREET_ORDER',
    difficulty: 3,
    content: {
      question:
        'If all players go all-in preflop, what happens with the community cards?',
      options: [
        'All 5 community cards are dealt out — no more betting rounds',
        'The hand is over — highest pocket cards win',
        'Only the flop is dealt',
      ],
    },
    correctAnswer:
      'All 5 community cards are dealt out — no more betting rounds',
    explanation:
      'When all players are all-in, there is no more betting to do, so the dealer runs out all remaining community cards (flop, turn, and river). The best 5-card hand at showdown wins.',
    xpValue: 20,
  },
  {
    type: 'STREET_ORDER',
    difficulty: 3,
    content: {
      question:
        'In a multi-way pot, if two players are all-in with different stack sizes, what happens?',
      options: [
        'A main pot and side pot are created',
        'The shorter stack must borrow chips',
        'The hand is void and chips are returned',
      ],
    },
    correctAnswer: 'A main pot and side pot are created',
    explanation:
      'When players go all-in for different amounts, a main pot is created that the short stack can win, and a side pot is created for the remaining chips that only the bigger stacks compete for. Each pot is awarded separately at showdown.',
    xpValue: 20,
  },

  // ============================================================
  // BLIND_STRUCTURE (~8 questions)
  // ============================================================
  {
    type: 'BLIND_STRUCTURE',
    difficulty: 1,
    content: {
      question: 'What is the purpose of the blinds in poker?',
      options: [
        'Force action by creating a pot worth fighting for',
        'Penalize players who sit out',
        'Determine who deals the cards',
      ],
    },
    correctAnswer: 'Force action by creating a pot worth fighting for',
    explanation:
      'Blinds are mandatory bets that create a pot before any cards are dealt. Without them, players could wait forever for premium hands with no cost. The blinds give everyone a reason to compete.',
    xpValue: 10,
  },
  {
    type: 'BLIND_STRUCTURE',
    difficulty: 1,
    content: {
      question:
        'In a $1/$2 No Limit game, what do the numbers mean?',
      options: [
        'Small blind is $1, big blind is $2',
        'Minimum bet is $1, maximum bet is $2',
        'Ante is $1, blind is $2',
      ],
    },
    correctAnswer: 'Small blind is $1, big blind is $2',
    explanation:
      'The two numbers represent the forced blind bets. The first number is the small blind ($1) and the second is the big blind ($2). In No Limit, you can bet any amount from the big blind up to your entire stack.',
    xpValue: 10,
  },
  {
    type: 'BLIND_STRUCTURE',
    difficulty: 1,
    content: {
      question: 'Who posts the small blind?',
      options: [
        'The player directly to the left of the dealer button',
        'The player to the right of the dealer button',
        'The dealer',
      ],
    },
    correctAnswer:
      'The player directly to the left of the dealer button',
    explanation:
      'The small blind sits immediately to the left of the dealer button. The big blind is one more seat to the left. After each hand, the button moves clockwise, so everyone takes turns posting blinds.',
    xpValue: 10,
  },
  {
    type: 'BLIND_STRUCTURE',
    difficulty: 2,
    content: {
      question: 'What is an "ante" in a poker tournament?',
      options: [
        'A small forced bet that every player at the table must post each hand',
        'Another name for the big blind',
        'A bonus paid to the winner of each hand',
      ],
    },
    correctAnswer:
      'A small forced bet that every player at the table must post each hand',
    explanation:
      'An ante is an additional forced bet (usually smaller than the blinds) that every player pays before each hand. Antes are common in later stages of tournaments and increase the pot size, encouraging more action.',
    xpValue: 15,
  },
  {
    type: 'BLIND_STRUCTURE',
    difficulty: 2,
    content: {
      question:
        'In a tournament, what happens to the blind levels over time?',
      options: [
        'Blinds increase at regular intervals',
        'Blinds stay the same throughout',
        'Blinds decrease as players are eliminated',
      ],
    },
    correctAnswer: 'Blinds increase at regular intervals',
    explanation:
      'Tournament blinds increase on a set schedule (e.g., every 15 minutes). This forces action and prevents players from waiting forever. As blinds go up, short stacks must play or get blinded out.',
    xpValue: 15,
  },
  {
    type: 'BLIND_STRUCTURE',
    difficulty: 2,
    content: {
      question:
        'If a player does not have enough chips to post the full big blind, what happens?',
      options: [
        'They post whatever they have and are all-in',
        'They skip the blind and wait for a better spot',
        'They are eliminated from the tournament',
      ],
    },
    correctAnswer: 'They post whatever they have and are all-in',
    explanation:
      'A player who cannot afford the full blind posts whatever chips they have left. They are automatically all-in and can only win a pot equal to their investment multiplied by the number of callers.',
    xpValue: 15,
  },
  {
    type: 'BLIND_STRUCTURE',
    difficulty: 3,
    content: {
      question: 'What is a "straddle" in a cash game?',
      options: [
        'A voluntary blind bet (usually 2x the big blind) posted by the UTG player',
        'A forced bet equal to three big blinds',
        'When two players split the big blind',
      ],
    },
    correctAnswer:
      'A voluntary blind bet (usually 2x the big blind) posted by the UTG player',
    explanation:
      'A straddle is an optional blind raise made before cards are dealt, typically by the under-the-gun player for 2x the big blind. It effectively doubles the stakes for that hand and gives the straddler last action preflop.',
    xpValue: 20,
  },
  {
    type: 'BLIND_STRUCTURE',
    difficulty: 3,
    content: {
      question:
        'In a cash game, what is the typical relationship between the big blind and the minimum buy-in?',
      options: [
        'Minimum buy-in is usually 20-100 big blinds',
        'Minimum buy-in is always exactly 10 big blinds',
        'There is no minimum — you can buy in for any amount',
      ],
    },
    correctAnswer: 'Minimum buy-in is usually 20-100 big blinds',
    explanation:
      'Most cash games have a minimum buy-in of 20-40 big blinds and a maximum of 100-200 big blinds. For a $1/$2 game, that is typically $40-$200. Having enough big blinds lets you play proper strategy without being forced all-in constantly.',
    xpValue: 20,
  },

  // ============================================================
  // TURN_ORDER (~9 questions)
  // ============================================================
  {
    type: 'TURN_ORDER',
    difficulty: 1,
    content: {
      question: 'Preflop, who acts first?',
      options: [
        'The player to the left of the big blind (Under the Gun)',
        'The small blind',
        'The dealer button',
      ],
    },
    correctAnswer:
      'The player to the left of the big blind (Under the Gun)',
    explanation:
      'Preflop, action starts with the player to the left of the big blind, called "Under the Gun" (UTG). The blinds have already posted forced bets, so they act last preflop.',
    xpValue: 10,
  },
  {
    type: 'TURN_ORDER',
    difficulty: 1,
    content: {
      question: 'After the flop, who acts first?',
      options: [
        'The first active player to the left of the dealer button',
        'The dealer button',
        'The player who bet last preflop',
      ],
    },
    correctAnswer:
      'The first active player to the left of the dealer button',
    explanation:
      'On all postflop streets (flop, turn, river), action starts with the first active player to the left of the dealer button. This is usually the small blind if they are still in the hand.',
    xpValue: 10,
  },
  {
    type: 'TURN_ORDER',
    difficulty: 1,
    content: {
      question: 'Who acts last on the flop, turn, and river?',
      options: [
        'The dealer button (if still in the hand)',
        'The big blind',
        'The player with the most chips',
      ],
    },
    correctAnswer: 'The dealer button (if still in the hand)',
    explanation:
      'Postflop, the dealer button always acts last. This is why the button is the most powerful position — you see everyone else\'s actions before making your decision.',
    xpValue: 10,
  },
  {
    type: 'TURN_ORDER',
    difficulty: 2,
    content: {
      question:
        'Why is acting last considered an advantage in poker?',
      options: [
        'You see what everyone else does before deciding',
        'You get to bet more money',
        'You receive better cards',
      ],
    },
    correctAnswer:
      'You see what everyone else does before deciding',
    explanation:
      'Acting last gives you maximum information. You see whether opponents check (showing weakness) or bet (showing strength) before you have to make a decision. This informational edge is why position matters so much in poker.',
    xpValue: 15,
  },
  {
    type: 'TURN_ORDER',
    difficulty: 2,
    content: {
      question:
        'In a 6-player game, if the small blind and UTG fold preflop, who acts next?',
      options: [
        'The next player clockwise (middle position)',
        'The big blind',
        'The hand starts over',
      ],
    },
    correctAnswer:
      'The next player clockwise (middle position)',
    explanation:
      'Action always moves clockwise. When a player folds, the next active player to their left acts. The order continues around the table until the betting round is complete.',
    xpValue: 15,
  },
  {
    type: 'TURN_ORDER',
    difficulty: 2,
    content: {
      question:
        'What does "position" mean in poker?',
      options: [
        'Where you sit relative to the dealer, which determines when you act',
        'Your chip stack ranking at the table',
        'Your physical seat number',
      ],
    },
    correctAnswer:
      'Where you sit relative to the dealer, which determines when you act',
    explanation:
      'Position refers to where you sit in the betting order relative to the dealer button. "Early position" acts first (disadvantage), "late position" acts last (advantage). Position changes every hand as the button rotates.',
    xpValue: 15,
  },
  {
    type: 'TURN_ORDER',
    difficulty: 2,
    content: {
      question:
        'On which street do the blinds act LAST instead of first?',
      options: [
        'Preflop',
        'Flop',
        'River',
      ],
    },
    correctAnswer: 'Preflop',
    explanation:
      'Preflop is the only street where the blinds act last. Since they posted forced bets, action starts with UTG and comes around to the blinds. On all postflop streets, the blinds act first (earliest position).',
    xpValue: 15,
  },
  {
    type: 'TURN_ORDER',
    difficulty: 3,
    content: {
      question:
        'In heads-up play (2 players), who posts the small blind?',
      options: [
        'The dealer button posts the small blind',
        'The non-dealer posts the small blind',
        'There are no blinds heads-up',
      ],
    },
    correctAnswer: 'The dealer button posts the small blind',
    explanation:
      'In heads-up play, the standard rule is: the dealer button posts the small blind and acts first preflop but last postflop. The other player posts the big blind. This differs from multi-way play where the button acts last preflop.',
    xpValue: 20,
  },
  {
    type: 'TURN_ORDER',
    difficulty: 3,
    content: {
      question:
        'When a new player joins a cash game table, when must they post a blind?',
      options: [
        'They must post a big blind or wait for the big blind to reach them',
        'They never have to post — just wait for cards',
        'They must post double the big blind on their first hand',
      ],
    },
    correctAnswer:
      'They must post a big blind or wait for the big blind to reach them',
    explanation:
      'When joining a cash game, you either post a "dead blind" equal to the big blind to play immediately, or you wait until the big blind naturally reaches your seat. This prevents players from timing their entry to avoid paying blinds.',
    xpValue: 20,
  },
];
