import { useState, useEffect, useCallback, memo, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Zap, Trophy, ArrowRight, Lightbulb, SkipForward, ThumbsUp, ThumbsDown, LogOut } from 'lucide-react';
import { useQuestions, useSubmitAnswer, useCompleteSession } from '@/hooks/useApi';
import { useHotkeys } from '@/hooks/useHotkeys';
import { cn, formatXp } from '@/lib/utils';
import type { Question, AnswerResult } from '@/lib/api';
import PlayingCard from '@/components/games/PlayingCard';
import TableView from '@/components/games/TableView';

const QUESTIONS_PER_SESSION = 10;

// Generate contextual hints based on question type
function getHintForQuestion(question: Question): string {
  const content = question.content as Record<string, unknown>;

  switch (question.type) {
    case 'HAND_COMPARE':
    case 'HAND_RANK':
      return "Remember the hand rankings from highest to lowest: Royal Flush, Straight Flush, Four of a Kind, Full House, Flush, Straight, Three of a Kind, Two Pair, One Pair, High Card.";
    case 'MULTIWAY_SHOWDOWN':
    case 'SPLIT_POT':
      return "Each player makes their best 5-card hand from 7 cards (2 hole + 5 board). Look for the highest hand ranking first, then compare kickers if tied.";
    case 'ACTION_AVAILABLE':
    case 'STREET_ORDER':
    case 'BLIND_STRUCTURE':
    case 'TURN_ORDER':
      return "Streets go: Preflop → Flop (3 cards) → Turn (1 card) → River (1 card). Actions: Check (no bet to call), Bet (first to put money in), Call, Raise, Fold.";
    case 'POSITION_ID':
    case 'POSITION_ADVANTAGE':
    case 'POSITION_ORDER':
    case 'POSITION_STRATEGY':
      return "Positions clockwise: SB, BB, UTG, MP, CO, BTN. Button acts last post-flop = information advantage. Late position can play more hands.";
    case 'PLAY_FOLD':
    case 'PREFLOP':
    case 'HAND_CATEGORY':
      return "Premium hands: AA, KK, QQ, AK. In early position, play tight. On the button, you can play more hands due to position advantage.";
    case 'BET_INTENT':
    case 'BET_RESPONSE':
    case 'BET_SIZE':
      return "Three reasons to bet: Value (want calls from worse), Bluff (want better hands to fold), Protection (deny free cards to draws).";
    case 'HAND_STRENGTH':
    case 'BOARD_TEXTURE':
    case 'FLOP_ACTION':
      return "Categorize your hand: Strong (top pair+), Medium (middle pair), Weak (bottom pair/no pair), Draw (flush/straight draw). Dry boards = few draws, Wet boards = many draws.";
    case 'ODDS_CALC':
    case 'OUTS_COUNT':
    case 'ODDS_CONVERT':
    case 'DECISION':
    case 'RULE_OF':
      return "Rule of 2 and 4: Multiply outs by 2 for one card, by 4 for two cards. Flush draw = 9 outs (~36% with two cards). OESD = 8 outs (~32%).";
    case 'STORY_CONSISTENT':
    case 'BLUFF_SPOT':
    case 'VALUE_OR_BLUFF':
    case 'BLUFF_FREQUENCY':
      return "Good bluffs tell a consistent story. Bluff in position, with scare cards, against players who can fold. Small bets usually want calls (value), big bets apply pressure.";
    case 'SPOT_MISTAKE':
    case 'TILT_RESPONSE':
    case 'RESULTS_VS_DECISION':
    case 'BANKROLL':
    case 'SESSION_MANAGEMENT':
      return "Focus on decision quality, not results. Good decisions can lose, bad decisions can win. Take breaks when tilting. Have 20+ buy-ins for your stake.";
    default:
      if (content.hint) {
        return content.hint as string;
      }
      return "Take your time and consider all the options carefully. Think about the fundamental concepts you've learned.";
  }
}

interface SessionState {
  currentIndex: number;
  answers: Array<{
    questionId: string;
    answer: string;
    result: AnswerResult | null;
    skipped?: boolean;
  }>;
  isComplete: boolean;
}

// Session storage for resume functionality
interface SavedSession {
  moduleSlug: string;
  questionIds: string[];
  currentIndex: number;
  answers: SessionState['answers'];
  savedAt: number;
}

const SESSION_STORAGE_KEY = 'poker-coach-session';
const SESSION_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

function getSavedSession(slug: string): SavedSession | null {
  try {
    const saved = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!saved) return null;
    const session: SavedSession = JSON.parse(saved);
    // Check if session is for this module and not expired
    if (session.moduleSlug === slug && Date.now() - session.savedAt < SESSION_EXPIRY_MS) {
      return session;
    }
    return null;
  } catch {
    return null;
  }
}

function saveSession(slug: string, questionIds: string[], state: SessionState): void {
  try {
    const session: SavedSession = {
      moduleSlug: slug,
      questionIds,
      currentIndex: state.currentIndex,
      answers: state.answers,
      savedAt: Date.now(),
    };
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  } catch {
    // Ignore storage errors
  }
}

function clearSavedSession(): void {
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch {
    // Ignore storage errors
  }
}

export default function PracticeSession() {
  const { slug } = useParams<{ slug: string }>();
  const { data, isLoading, error } = useQuestions(slug || '', QUESTIONS_PER_SESSION);
  const submitAnswer = useSubmitAnswer();

  const navigate = useNavigate();

  const [session, setSession] = useState<SessionState>({
    currentIndex: 0,
    answers: [],
    isComplete: false,
  });
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [currentResult, setCurrentResult] = useState<AnswerResult | null>(null);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [showHint, setShowHint] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [hasRestoredSession, setHasRestoredSession] = useState(false);

  // Check for saved session and restore if questions match
  useEffect(() => {
    if (!slug || !data?.questions || hasRestoredSession) return;

    const saved = getSavedSession(slug);
    if (saved && saved.questionIds.length === data.questions.length) {
      // Check if question IDs match (same session)
      const currentIds = data.questions.map(q => q.id);
      const idsMatch = saved.questionIds.every((id, i) => id === currentIds[i]);

      if (idsMatch && saved.currentIndex > 0) {
        // Restore the session
        setSession({
          currentIndex: saved.currentIndex,
          answers: saved.answers,
          isComplete: false,
        });
      }
    }
    setHasRestoredSession(true);
  }, [slug, data?.questions, hasRestoredSession]);

  // Save session whenever answers change
  useEffect(() => {
    if (!slug || !data?.questions || session.isComplete) return;
    if (session.answers.length > 0) {
      const questionIds = data.questions.map(q => q.id);
      saveSession(slug, questionIds, session);
    }
  }, [slug, data?.questions, session]);

  // Clear saved session when complete
  useEffect(() => {
    if (session.isComplete) {
      clearSavedSession();
    }
  }, [session.isComplete]);

  // Reset start time and hint when moving to next question
  useEffect(() => {
    setStartTime(Date.now());
    setShowHint(false);
  }, [session.currentIndex]);

  const currentQuestion = data?.questions[session.currentIndex];

  const handleSelectAnswer = useCallback(async (answer: string) => {
    if (showResult || submitAnswer.isPending) return;
    setSelectedAnswer(answer);

    // Auto-submit when an answer is selected
    if (!currentQuestion) return;

    const timeSpent = Math.round((Date.now() - startTime) / 1000);

    try {
      const result = await submitAnswer.mutateAsync({
        questionId: currentQuestion.id,
        answer: answer,
        timeSpent,
      });

      setCurrentResult(result);
      setShowResult(true);

      setSession((prev) => ({
        ...prev,
        answers: [
          ...prev.answers,
          { questionId: currentQuestion.id, answer: answer, result },
        ],
      }));
    } catch (err) {
      console.error('Failed to submit answer:', err);
    }
  }, [showResult, submitAnswer, currentQuestion, startTime]);

  const handleNext = useCallback(() => {
    if (session.currentIndex >= (data?.questions.length || 0) - 1) {
      setSession((prev) => ({ ...prev, isComplete: true }));
    } else {
      setSession((prev) => ({ ...prev, currentIndex: prev.currentIndex + 1 }));
      setSelectedAnswer(null);
      setShowResult(false);
      setCurrentResult(null);
    }
  }, [session.currentIndex, data?.questions.length]);

  const handleSkip = useCallback(() => {
    if (showResult || submitAnswer.isPending) return;
    if (!currentQuestion) return;

    // Record as skipped (counts as incorrect)
    setSession((prev) => ({
      ...prev,
      answers: [
        ...prev.answers,
        { questionId: currentQuestion.id, answer: '', result: null, skipped: true },
      ],
    }));

    // Move to next question
    if (session.currentIndex >= (data?.questions.length || 0) - 1) {
      setSession((prev) => ({ ...prev, isComplete: true }));
    } else {
      setSession((prev) => ({ ...prev, currentIndex: prev.currentIndex + 1 }));
      setSelectedAnswer(null);
      setShowResult(false);
      setCurrentResult(null);
    }
  }, [showResult, submitAnswer.isPending, currentQuestion, session.currentIndex, data?.questions.length]);

  const toggleHint = useCallback(() => {
    if (!showResult && !submitAnswer.isPending) {
      setShowHint((prev) => !prev);
    }
  }, [showResult, submitAnswer.isPending]);

  // Get options for current question (for number key selection)
  const currentOptions = useMemo(() => {
    if (!currentQuestion) return [];
    const content = currentQuestion.content as Record<string, unknown>;
    if (currentQuestion.type === 'HAND_COMPARE') {
      return ['hand1', 'hand2'];
    }
    if (currentQuestion.type === 'PLAY_FOLD') {
      return ['Play', 'Fold'];
    }
    if (currentQuestion.type === 'MULTIWAY_SHOWDOWN') {
      const players = content.players as Array<{ name: string }>;
      return players?.map(p => p.name) || [];
    }
    return (content.options as string[]) || [];
  }, [currentQuestion]);

  // Keyboard shortcuts
  useHotkeys(
    useMemo(
      () => [
        // Next question (after answering)
        {
          key: 'ArrowRight',
          callback: handleNext,
          enabled: showResult,
        },
        {
          key: 'Enter',
          callback: handleNext,
          enabled: showResult,
        },
        {
          key: ' ', // Space
          callback: handleNext,
          enabled: showResult,
        },
        // Number keys to select answers (1, 2, 3)
        {
          key: '1',
          callback: () => currentOptions[0] && handleSelectAnswer(currentOptions[0]),
          enabled: !showResult && !submitAnswer.isPending && currentOptions.length >= 1,
        },
        {
          key: '2',
          callback: () => currentOptions[1] && handleSelectAnswer(currentOptions[1]),
          enabled: !showResult && !submitAnswer.isPending && currentOptions.length >= 2,
        },
        {
          key: '3',
          callback: () => currentOptions[2] && handleSelectAnswer(currentOptions[2]),
          enabled: !showResult && !submitAnswer.isPending && currentOptions.length >= 3,
        },
        // Hint toggle
        {
          key: 'h',
          callback: toggleHint,
          enabled: !showResult && !submitAnswer.isPending,
        },
        // Skip question
        {
          key: 's',
          callback: handleSkip,
          enabled: !showResult && !submitAnswer.isPending,
        },
      ],
      [showResult, submitAnswer.isPending, currentOptions, handleNext, handleSelectAnswer, toggleHint, handleSkip]
    )
  );

  if (isLoading) {
    return <PracticeSessionSkeleton />;
  }

  if (error || !data) {
    return (
      <div className="md:ml-64 p-8 text-center">
        <p className="text-red-400">Failed to load questions. Please try again.</p>
        <Link to={`/modules/${slug}`} className="text-gold hover:text-gold-light mt-4 inline-block">
          Back to Module
        </Link>
      </div>
    );
  }

  if (session.isComplete) {
    return (
      <SessionSummary
        moduleName={data.moduleName}
        slug={slug || ''}
        answers={session.answers}
      />
    );
  }

  if (!currentQuestion) {
    return (
      <div className="md:ml-64 p-8 text-center">
        <p className="text-muted-foreground">No questions available.</p>
        <Link to={`/modules/${slug}`} className="text-gold hover:text-gold-light mt-4 inline-block">
          Back to Module
        </Link>
      </div>
    );
  }

  // Calculate current session stats for exit confirmation
  const answeredCount = session.answers.length;
  const correctCount = session.answers.filter((a) => a.result?.isCorrect).length;
  const totalXpEarned = session.answers.reduce((sum, a) => sum + (a.result?.xp?.earned || 0), 0);

  return (
    <div className="md:ml-64 pb-20 md:pb-6">
      {/* Save & Exit Confirmation Modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="card max-w-sm w-full">
            <h3 className="text-lg font-semibold text-white mb-2">Save & Exit?</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Your progress has been saved automatically.
            </p>

            {answeredCount > 0 && (
              <div className="bg-background-tertiary rounded-lg p-3 mb-4">
                <div className="grid grid-cols-3 gap-2 text-center text-sm">
                  <div>
                    <div className="text-white font-medium">{answeredCount}/{data.questions.length}</div>
                    <div className="text-muted-foreground text-xs">Answered</div>
                  </div>
                  <div>
                    <div className="text-green-400 font-medium">{correctCount}</div>
                    <div className="text-muted-foreground text-xs">Correct</div>
                  </div>
                  <div>
                    <div className="text-gold font-medium">+{totalXpEarned}</div>
                    <div className="text-muted-foreground text-xs">XP</div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="flex-1 py-3 rounded-lg bg-background-tertiary text-muted-foreground hover:text-white transition-colors active:scale-[0.98]"
              >
                Continue
              </button>
              <button
                onClick={() => navigate('/modules')}
                className="flex-1 py-3 rounded-lg bg-gold text-black font-medium hover:bg-gold-light transition-colors active:scale-[0.98]"
              >
                Exit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setShowExitConfirm(true)}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-white transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Save & Exit
        </button>
        <div className="text-sm text-muted-foreground">
          Question {session.currentIndex + 1} of {data.questions.length}
        </div>
      </div>

      {/* Progress bar */}
      <div className="progress-bar mb-6">
        <div
          className="progress-bar-fill"
          style={{
            width: `${((session.currentIndex + (showResult ? 1 : 0)) / data.questions.length) * 100}%`,
          }}
        />
      </div>

      {/* Question card */}
      <div className="card felt-bg mb-6">
        <QuestionDisplay
          question={currentQuestion}
          selectedAnswer={selectedAnswer}
          onSelect={handleSelectAnswer}
          showResult={showResult}
          correctAnswer={currentResult?.correctAnswer}
        />
      </div>

      {/* Result feedback */}
      {showResult && currentResult && (
        <div className="animate-slide-up mb-6">
          <div
            className={cn(
              'card border-2',
              currentResult.isCorrect
                ? 'border-green-500/50 bg-green-500/10'
                : 'border-red-500/50 bg-red-500/10'
            )}
          >
            <div className="flex items-center gap-3 mb-3">
              {currentResult.isCorrect ? (
                <CheckCircle className="w-6 h-6 text-green-400" />
              ) : (
                <XCircle className="w-6 h-6 text-red-400" />
              )}
              <span
                className={cn(
                  'text-lg font-semibold',
                  currentResult.isCorrect ? 'text-green-400' : 'text-red-400'
                )}
              >
                {currentResult.isCorrect ? 'Correct!' : 'Incorrect'}
              </span>
              {currentResult.xp.earned > 0 && (
                <span className="xp-badge ml-auto">
                  +{currentResult.xp.earned} XP
                </span>
              )}
            </div>
            <p className="text-muted-foreground">{currentResult.explanation}</p>

            {/* Achievement notifications */}
            {currentResult.achievements.length > 0 && (
              <div className="mt-4 space-y-2">
                {currentResult.achievements.map((achievement, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 p-2 rounded-lg bg-gold/20 border border-gold/30"
                  >
                    <Trophy className="w-5 h-5 text-gold" />
                    <span className="text-gold font-medium">
                      {achievement.iconEmoji} {achievement.name}
                    </span>
                    <span className="text-gold/70 text-sm">
                      +{achievement.xpReward} XP
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Level up notification */}
            {currentResult.levelUp && (
              <div className="mt-4 p-3 rounded-lg bg-gold/20 border border-gold/30 text-center">
                <Zap className="w-8 h-8 text-gold mx-auto mb-2" />
                <div className="text-gold font-bold text-lg">Level Up!</div>
                <div className="text-gold/70">
                  You reached level {currentResult.levelUp.newLevel}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action buttons */}
      {submitAnswer.isPending && (
        <div className="text-center py-4 text-muted-foreground">
          Checking...
        </div>
      )}

      {/* Hint and Skip buttons - show when not answered yet */}
      {!showResult && !submitAnswer.isPending && (
        <div className="flex gap-3 mb-4">
          <button
            onClick={toggleHint}
            className={cn(
              "flex-1 py-3 rounded-lg border-2 transition-all flex items-center justify-center gap-2",
              showHint
                ? "border-yellow-500/50 bg-yellow-500/10 text-yellow-400"
                : "border-border hover:border-border-light text-muted-foreground hover:text-white"
            )}
          >
            <Lightbulb className="w-4 h-4" />
            {showHint ? 'Hide Hint' : 'Show Hint'}
            <kbd className="hidden sm:inline-block ml-1 px-1.5 py-0.5 text-xs bg-background-tertiary rounded">H</kbd>
          </button>
          <button
            onClick={handleSkip}
            className="flex-1 py-3 rounded-lg border-2 border-border hover:border-border-light text-muted-foreground hover:text-white transition-all flex items-center justify-center gap-2"
          >
            <SkipForward className="w-4 h-4" />
            Skip Question
            <kbd className="hidden sm:inline-block ml-1 px-1.5 py-0.5 text-xs bg-background-tertiary rounded">S</kbd>
          </button>
        </div>
      )}

      {/* Hint display */}
      {showHint && !showResult && currentQuestion && (
        <div className="card border-yellow-500/30 bg-yellow-500/5 mb-4">
          <div className="flex items-start gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <p className="text-yellow-200/80 text-sm">
              {getHintForQuestion(currentQuestion)}
            </p>
          </div>
        </div>
      )}

      {showResult && (
        <button onClick={handleNext} className="btn-primary w-full py-4 text-lg group">
          {session.currentIndex >= data.questions.length - 1 ? (
            <>
              See Results
              <kbd className="hidden sm:inline-block ml-2 px-1.5 py-0.5 text-xs bg-black/20 rounded group-hover:bg-black/30">Enter</kbd>
            </>
          ) : (
            <>
              Next Question
              <ArrowRight className="w-5 h-5 ml-2" />
              <kbd className="hidden sm:inline-block ml-2 px-1.5 py-0.5 text-xs bg-black/20 rounded group-hover:bg-black/30">→</kbd>
            </>
          )}
        </button>
      )}
    </div>
  );
}

interface QuestionDisplayProps {
  question: Question;
  selectedAnswer: string | null;
  onSelect: (answer: string) => void;
  showResult: boolean;
  correctAnswer?: string;
}

const QuestionDisplay = memo(function QuestionDisplay({
  question,
  selectedAnswer,
  onSelect,
  showResult,
  correctAnswer,
}: QuestionDisplayProps) {
  const content = question.content as Record<string, unknown>;

  // Multi-way showdown questions (TableView)
  if (question.type === 'MULTIWAY_SHOWDOWN' || question.type === 'SPLIT_POT') {
    const board = content.board as string[];
    const players = content.players as Array<{ seat: number; name: string; cards: string[] }>;

    return (
      <div>
        <h2 className="text-lg font-semibold text-white mb-6 text-center">
          {content.question as string}
        </h2>

        {question.type === 'SPLIT_POT' && content.options ? (
          // Split pot uses options for answer selection
          <>
            <TableView
              board={board}
              players={players}
              disabled={true}
              className="mb-6"
            />
            <div className="space-y-3">
              {(content.options as string[]).map((option, index) => (
                <button
                  key={option}
                  onClick={() => onSelect(option)}
                  disabled={showResult}
                  className={cn(
                    'w-full p-4 rounded-xl border-2 text-left transition-all flex items-center gap-3',
                    selectedAnswer === option
                      ? 'border-gold bg-gold/10'
                      : 'border-border hover:border-border-light',
                    showResult && correctAnswer === option && 'border-green-500 bg-green-500/10',
                    showResult && selectedAnswer === option && correctAnswer !== option && 'border-red-500 bg-red-500/10'
                  )}
                >
                  {!showResult && (
                    <kbd className="hidden sm:flex items-center justify-center w-6 h-6 text-xs bg-background-tertiary rounded text-muted-foreground flex-shrink-0">
                      {index + 1}
                    </kbd>
                  )}
                  <span className="text-white">{option}</span>
                </button>
              ))}
            </div>
          </>
        ) : (
          // Multi-way showdown - click on player to select winner
          <TableView
            board={board}
            players={players}
            selectedPlayer={selectedAnswer || undefined}
            onSelectPlayer={onSelect}
            disabled={showResult}
            showResult={showResult}
            correctAnswer={correctAnswer}
          />
        )}
      </div>
    );
  }

  // Play/Fold questions (binary buttons)
  if (question.type === 'PLAY_FOLD') {
    const hand = content.hand as string[];
    const position = content.position as string;

    return (
      <div>
        <h2 className="text-lg font-semibold text-white mb-4 text-center">
          {content.question as string}
        </h2>

        {/* Position indicator */}
        <div className="text-center text-sm text-muted-foreground mb-4">
          Position: <span className="text-gold">{position}</span>
        </div>

        {/* Show the hand */}
        <div className="flex justify-center gap-2 mb-8">
          {hand.map((card, i) => (
            <PlayingCard key={i} card={card} size="lg" />
          ))}
        </div>

        {/* Play / Fold buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => onSelect('Fold')}
            disabled={showResult}
            className={cn(
              'p-6 rounded-xl border-2 transition-all flex flex-col items-center gap-2',
              selectedAnswer === 'Fold'
                ? 'border-red-500 bg-red-500/20'
                : 'border-border hover:border-red-500/50 hover:bg-red-500/10',
              showResult && correctAnswer === 'Fold' && 'border-green-500 bg-green-500/10',
              showResult && selectedAnswer === 'Fold' && correctAnswer !== 'Fold' && 'border-red-500 bg-red-500/10'
            )}
          >
            <ThumbsDown className={cn(
              'w-8 h-8',
              selectedAnswer === 'Fold' ? 'text-red-400' : 'text-muted-foreground'
            )} />
            <span className={cn(
              'text-lg font-semibold',
              selectedAnswer === 'Fold' ? 'text-red-400' : 'text-white'
            )}>Fold</span>
            {!showResult && (
              <kbd className="px-2 py-1 text-xs bg-background-tertiary rounded text-muted-foreground">2</kbd>
            )}
          </button>

          <button
            onClick={() => onSelect('Play')}
            disabled={showResult}
            className={cn(
              'p-6 rounded-xl border-2 transition-all flex flex-col items-center gap-2',
              selectedAnswer === 'Play'
                ? 'border-green-500 bg-green-500/20'
                : 'border-border hover:border-green-500/50 hover:bg-green-500/10',
              showResult && correctAnswer === 'Play' && 'border-green-500 bg-green-500/10',
              showResult && selectedAnswer === 'Play' && correctAnswer !== 'Play' && 'border-red-500 bg-red-500/10'
            )}
          >
            <ThumbsUp className={cn(
              'w-8 h-8',
              selectedAnswer === 'Play' ? 'text-green-400' : 'text-muted-foreground'
            )} />
            <span className={cn(
              'text-lg font-semibold',
              selectedAnswer === 'Play' ? 'text-green-400' : 'text-white'
            )}>Play</span>
            {!showResult && (
              <kbd className="px-2 py-1 text-xs bg-background-tertiary rounded text-muted-foreground">1</kbd>
            )}
          </button>
        </div>
      </div>
    );
  }

  // Hand comparison questions
  if (question.type === 'HAND_COMPARE') {
    const hand1 = content.hand1 as { cards: string[]; name: string };
    const hand2 = content.hand2 as { cards: string[]; name: string };

    return (
      <div>
        <h2 className="text-lg font-semibold text-white mb-6 text-center">
          {content.question as string}
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          {[
            { hand: hand1, value: 'hand1', num: 1 },
            { hand: hand2, value: 'hand2', num: 2 },
          ].map(({ hand, value, num }) => (
            <button
              key={value}
              onClick={() => onSelect(value)}
              disabled={showResult}
              className={cn(
                'p-4 rounded-xl border-2 transition-all relative',
                selectedAnswer === value
                  ? 'border-gold bg-gold/10'
                  : 'border-border hover:border-border-light',
                showResult &&
                  correctAnswer === value &&
                  'border-green-500 bg-green-500/10',
                showResult &&
                  selectedAnswer === value &&
                  correctAnswer !== value &&
                  'border-red-500 bg-red-500/10'
              )}
            >
              {!showResult && (
                <kbd className="hidden sm:flex absolute top-2 left-2 items-center justify-center w-6 h-6 text-xs bg-background-tertiary rounded text-muted-foreground">
                  {num}
                </kbd>
              )}
              <div className="text-sm text-muted-foreground mb-2">
                {hand.name}
              </div>
              <div className="flex justify-center gap-1">
                {hand.cards.map((card, i) => (
                  <PlayingCard key={i} card={card} size="sm" />
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Multiple choice questions (default)
  const options = content.options as string[];
  const questionText = content.question as string;

  // Extract hand cards if present (for various question types)
  const handCards = content.hand
    ? (Array.isArray(content.hand) ? content.hand : (content.hand as { cards: string[] }).cards) as string[]
    : null;

  // Extract board cards if present (for HAND_STRENGTH, BOARD_TEXTURE, etc.)
  const boardCards = content.board as string[] | undefined;

  return (
    <div>
      <h2 className="text-lg font-semibold text-white mb-6">{questionText}</h2>

      {/* Show situation/scenario context if present */}
      {typeof content.situation === 'string' && (
        <div className="bg-background-tertiary p-4 rounded-lg mb-6 text-muted-foreground">
          {content.situation}
        </div>
      )}

      {/* Show setup context if present (for SCENARIO type) */}
      {typeof content.setup === 'string' && (
        <div className="bg-background-tertiary p-4 rounded-lg mb-6 text-muted-foreground">
          {content.setup}
        </div>
      )}

      {/* Show betting line if present (for STORY_CONSISTENT type) */}
      {typeof content.line === 'string' && (
        <div className="bg-background-tertiary p-4 rounded-lg mb-6 text-muted-foreground italic">
          "{content.line}"
        </div>
      )}

      {/* Show hand if present */}
      {handCards && handCards.length > 0 && (
        <div className="flex flex-wrap justify-center gap-1 mb-4">
          {handCards.map((card, i) => (
            <PlayingCard key={i} card={card} size="sm" />
          ))}
        </div>
      )}

      {/* Show board if present */}
      {boardCards && boardCards.length > 0 && (
        <div className="mb-6">
          <div className="text-xs text-muted-foreground text-center mb-2">Board</div>
          <div className="flex justify-center gap-1">
            {boardCards.map((card, i) => (
              <PlayingCard key={i} card={card} size="sm" />
            ))}
          </div>
        </div>
      )}

      {/* Options */}
      <div className="space-y-3">
        {options?.map((option, index) => (
          <button
            key={option}
            onClick={() => onSelect(option)}
            disabled={showResult}
            className={cn(
              'w-full p-4 rounded-xl border-2 text-left transition-all flex items-center gap-3',
              selectedAnswer === option
                ? 'border-gold bg-gold/10'
                : 'border-border hover:border-border-light',
              showResult &&
                correctAnswer === option &&
                'border-green-500 bg-green-500/10',
              showResult &&
                selectedAnswer === option &&
                correctAnswer !== option &&
                'border-red-500 bg-red-500/10'
            )}
          >
            {!showResult && (
              <kbd className="hidden sm:flex items-center justify-center w-6 h-6 text-xs bg-background-tertiary rounded text-muted-foreground flex-shrink-0">
                {index + 1}
              </kbd>
            )}
            <span className="text-white">{option}</span>
          </button>
        ))}
      </div>
    </div>
  );
});

interface SessionSummaryProps {
  moduleName: string;
  slug: string;
  answers: Array<{ questionId: string; answer: string; result: AnswerResult | null; skipped?: boolean }>;
}

function SessionSummary({ moduleName, slug, answers }: SessionSummaryProps) {
  const navigate = useNavigate();
  const completeSession = useCompleteSession();

  const totalCorrect = answers.filter((a) => a.result?.isCorrect).length;
  const totalSkipped = answers.filter((a) => a.skipped).length;
  const totalAnswered = answers.length - totalSkipped;
  const totalXp = answers.reduce((sum, a) => sum + (a.result?.xp.earned || 0), 0);
  const accuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

  // Module is considered completed at 70%+ accuracy
  const isModuleCompleted = accuracy >= 70;

  // Mark session as complete on mount
  useEffect(() => {
    completeSession.mutate({
      moduleSlug: slug,
      correctCount: totalCorrect,
      totalCount: answers.length,
    });
  }, []);

  return (
    <div className="md:ml-64 pb-20 md:pb-6">
      <div className="card felt-bg text-center mb-6">
        {isModuleCompleted ? (
          <>
            <div className="text-5xl mb-3">🎉</div>
            <h1 className="text-2xl font-bold text-white mb-2">Module Completed!</h1>
            <p className="text-green-400">{moduleName}</p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-white mb-2">Session Complete!</h1>
            <p className="text-muted-foreground">{moduleName}</p>
          </>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="card text-center">
          <div className="text-3xl font-bold text-green-400">{totalCorrect}/{answers.length}</div>
          <div className="text-sm text-muted-foreground">Correct</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-gold">{formatXp(totalXp)}</div>
          <div className="text-sm text-muted-foreground">XP Earned</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-blue-400">{accuracy}%</div>
          <div className="text-sm text-muted-foreground">Accuracy</div>
        </div>
      </div>

      {totalSkipped > 0 && (
        <div className="card mb-4 text-center">
          <span className="text-yellow-400">{totalSkipped} question{totalSkipped > 1 ? 's' : ''} skipped</span>
        </div>
      )}

      {/* Answer breakdown */}
      <div className="card mb-6">
        <h2 className="text-lg font-semibold text-white mb-4">Results</h2>
        <div className="flex gap-1">
          {answers.map((answer, i) => (
            <div
              key={i}
              className={cn(
                'flex-1 h-2 rounded-full',
                answer.skipped
                  ? 'bg-yellow-500'
                  : answer.result?.isCorrect
                  ? 'bg-green-500'
                  : 'bg-red-500'
              )}
            />
          ))}
        </div>
        <div className="flex gap-4 mt-3 text-xs text-muted-foreground justify-center">
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-green-500" /> Correct
          </span>
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-red-500" /> Incorrect
          </span>
          {totalSkipped > 0 && (
            <span className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-yellow-500" /> Skipped
            </span>
          )}
        </div>
      </div>

      {isModuleCompleted ? (
        <>
          {/* Completion message */}
          <div className="card border-green-500/30 bg-green-500/10 mb-6 text-center">
            <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <p className="text-green-400 font-medium">
              You've achieved {accuracy}% accuracy!
            </p>
            <p className="text-muted-foreground text-sm mt-1">
              This module is now marked as completed.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => navigate(`/practice/${slug}`)}
              className="btn-secondary py-4"
            >
              Practice More
            </button>
            <button
              onClick={() => navigate('/modules')}
              className="btn-primary py-4 flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              Complete
            </button>
          </div>
        </>
      ) : (
        <>
          {/* Encouragement message */}
          <div className="card border-yellow-500/30 bg-yellow-500/10 mb-6 text-center">
            <p className="text-yellow-400 font-medium">
              Need 70% accuracy to complete this module
            </p>
            <p className="text-muted-foreground text-sm mt-1">
              You got {accuracy}%. Keep practicing!
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => navigate(`/practice/${slug}`)}
              className="btn-primary py-4"
            >
              Practice Again
            </button>
            <button
              onClick={() => navigate('/modules')}
              className="btn-secondary py-4"
            >
              Back to Modules
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function PracticeSessionSkeleton() {
  return (
    <div className="md:ml-64 pb-20 md:pb-6 animate-pulse">
      <div className="flex justify-between mb-6">
        <div className="h-6 w-32 bg-background-secondary rounded" />
        <div className="h-6 w-24 bg-background-secondary rounded" />
      </div>
      <div className="h-2 bg-background-secondary rounded mb-6" />
      <div className="card felt-bg h-64 mb-6" />
      <div className="h-14 bg-gold/50 rounded-lg" />
    </div>
  );
}
