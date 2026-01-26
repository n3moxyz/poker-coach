import { useState, useEffect, useCallback, memo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, Zap, Trophy, ArrowRight, Lightbulb, SkipForward } from 'lucide-react';
import { useQuestions, useSubmitAnswer, useCompleteSession } from '@/hooks/useApi';
import { cn, formatXp } from '@/lib/utils';
import type { Question, AnswerResult } from '@/lib/api';
import PlayingCard from '@/components/games/PlayingCard';

const QUESTIONS_PER_SESSION = 10;

// Generate contextual hints based on question type
function getHintForQuestion(question: Question): string {
  const content = question.content as Record<string, unknown>;

  switch (question.type) {
    case 'HAND_COMPARE':
      return "Remember the hand rankings from highest to lowest: Royal Flush, Straight Flush, Four of a Kind, Full House, Flush, Straight, Three of a Kind, Two Pair, One Pair, High Card.";
    case 'POSITION_ID':
      return "Positions at the table go clockwise: Small Blind, Big Blind, Under the Gun (UTG), Middle Position (MP), Cutoff (CO), Button (BTN). The button is the best position because you act last.";
    case 'ODDS_CALC':
      return "Pot odds = (Cost to Call) / (Pot + Cost to Call). Compare this to your winning chances. If pot odds are better than your hand odds, it's mathematically correct to call.";
    case 'PREFLOP':
      return "In early position, play tight (only premium hands). In late position, you can play more hands. Suited connectors and pocket pairs gain value in late position.";
    case 'SCENARIO':
      return "Consider your position, stack sizes, and opponent tendencies. Think about what hands beat you and what you beat.";
    default:
      // Generic hint based on content
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

export default function PracticeSession() {
  const { slug } = useParams<{ slug: string }>();
  const { data, isLoading, error } = useQuestions(slug || '', QUESTIONS_PER_SESSION);
  const submitAnswer = useSubmitAnswer();

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

  return (
    <div className="md:ml-64 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link
          to={`/modules/${slug}`}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Exit Practice
        </Link>
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
            onClick={() => setShowHint(!showHint)}
            className={cn(
              "flex-1 py-3 rounded-lg border-2 transition-all flex items-center justify-center gap-2",
              showHint
                ? "border-yellow-500/50 bg-yellow-500/10 text-yellow-400"
                : "border-border hover:border-border-light text-muted-foreground hover:text-white"
            )}
          >
            <Lightbulb className="w-4 h-4" />
            {showHint ? 'Hide Hint' : 'Show Hint'}
          </button>
          <button
            onClick={handleSkip}
            className="flex-1 py-3 rounded-lg border-2 border-border hover:border-border-light text-muted-foreground hover:text-white transition-all flex items-center justify-center gap-2"
          >
            <SkipForward className="w-4 h-4" />
            Skip Question
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
        <button onClick={handleNext} className="btn-primary w-full py-4 text-lg">
          {session.currentIndex >= data.questions.length - 1 ? (
            'See Results'
          ) : (
            <>
              Next Question
              <ArrowRight className="w-5 h-5 ml-2" />
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
            { hand: hand1, value: 'hand1' },
            { hand: hand2, value: 'hand2' },
          ].map(({ hand, value }) => (
            <button
              key={value}
              onClick={() => onSelect(value)}
              disabled={showResult}
              className={cn(
                'p-4 rounded-xl border-2 transition-all',
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

  // Multiple choice questions
  const options = content.options as string[];
  const questionText = content.question as string;

  return (
    <div>
      <h2 className="text-lg font-semibold text-white mb-6">{questionText}</h2>

      {/* Show hand if present */}
      {Boolean(content.hand) && (
        <div className="flex justify-center gap-1 mb-6">
          {((content.hand as { cards: string[] }).cards || []).map((card, i) => (
            <PlayingCard key={i} card={card} size="sm" />
          ))}
        </div>
      )}

      {/* Options */}
      <div className="space-y-3">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => onSelect(option)}
            disabled={showResult}
            className={cn(
              'w-full p-4 rounded-xl border-2 text-left transition-all',
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
        <h1 className="text-2xl font-bold text-white mb-2">Session Complete!</h1>
        <p className="text-muted-foreground">{moduleName}</p>
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

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => navigate(`/practice/${slug}`)}
          className="btn-primary py-4"
        >
          Practice Again
        </button>
        <button
          onClick={() => navigate(`/modules/${slug}`)}
          className="btn-secondary py-4"
        >
          Back to Module
        </button>
      </div>
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
