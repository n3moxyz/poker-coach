import { useState, useCallback, memo } from 'react';
import {
  BookOpen,
  Rocket,
  ArrowRight,
  ArrowLeft,
  Loader2,
  CheckCircle,
  XCircle,
  ChevronUp,
} from 'lucide-react';
import {
  usePlacementQuestions,
  useSubmitPlacementTest,
  useSkipPlacementTest,
} from '@/hooks/useApi';
import { cn } from '@/lib/utils';
import type { PlacementQuestion, PlacementResult, PlacementAnswerFeedback } from '@/lib/api';
import PlayingCard from '@/components/games/PlayingCard';

type TestPhase = 'welcome' | 'testing' | 'results';

export default function PlacementTest() {
  const { data: questionsData, isLoading: questionsLoading } = usePlacementQuestions();
  const submitTest = useSubmitPlacementTest();
  const skipTest = useSkipPlacementTest();

  const [phase, setPhase] = useState<TestPhase>('welcome');
  const [currentIndex, setCurrentIndex] = useState(0);
  // Store answers as a map for easy update when going back
  const [answersMap, setAnswersMap] = useState<Record<string, string>>({});
  const [result, setResult] = useState<PlacementResult | null>(null);
  const [answerFeedback, setAnswerFeedback] = useState<PlacementAnswerFeedback[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const questions = questionsData?.questions || [];
  const currentQuestion = questions[currentIndex];
  const currentAnswer = currentQuestion ? answersMap[currentQuestion.id] : null;

  const handleStartTest = useCallback(() => {
    setPhase('testing');
  }, []);

  const handleSkipTest = useCallback(async () => {
    try {
      const response = await skipTest.mutateAsync();
      setResult(response.result);
      setPhase('results');
    } catch (error) {
      console.error('Failed to skip placement test:', error);
    }
  }, [skipTest]);

  // Auto-advance when user selects an answer
  const handleSelectAnswer = useCallback(async (answer: string) => {
    if (!currentQuestion || isSubmitting) return;

    // Store the answer
    setAnswersMap((prev) => ({
      ...prev,
      [currentQuestion.id]: answer,
    }));

    // Small delay for visual feedback before advancing
    await new Promise((resolve) => setTimeout(resolve, 200));

    if (currentIndex >= questions.length - 1) {
      // This is the last question - submit all answers
      setIsSubmitting(true);
      try {
        const allAnswers = questions.map((q) => ({
          questionId: q.id,
          answer: q.id === currentQuestion.id ? answer : answersMap[q.id] || '',
        }));
        const response = await submitTest.mutateAsync(allAnswers);
        setResult(response.result);
        setAnswerFeedback(response.answers);
        setPhase('results');
      } catch (error) {
        console.error('Failed to submit placement test:', error);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Move to next question
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentQuestion, currentIndex, questions, answersMap, submitTest, isSubmitting]);

  const handleGoBack = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  const handleContinue = useCallback(() => {
    // Force a full page reload to refresh the app state
    window.location.href = '/';
  }, []);

  if (questionsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  if (phase === 'welcome') {
    return (
      <WelcomeScreen
        onStart={handleStartTest}
        onSkip={handleSkipTest}
        isSkipping={skipTest.isPending}
        totalQuestions={questions.length}
      />
    );
  }

  if (phase === 'results' && result) {
    return (
      <ResultsScreen
        result={result}
        feedback={answerFeedback}
        questions={questions}
        onContinue={handleContinue}
      />
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">No questions available.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header with back button */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {currentIndex > 0 && (
              <button
                onClick={handleGoBack}
                className="p-2 rounded-lg hover:bg-background-secondary transition-colors text-muted-foreground hover:text-white"
                disabled={isSubmitting}
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <h1 className="text-lg font-semibold text-white">Placement Test</h1>
          </div>
          <div className="text-sm text-muted-foreground">
            {currentIndex + 1} / {questions.length}
          </div>
        </div>

        {/* Progress bar - clickable dots */}
        <div className="flex gap-1 mb-6">
          {questions.map((q, i) => (
            <button
              key={q.id}
              onClick={() => i < currentIndex && setCurrentIndex(i)}
              disabled={i >= currentIndex || isSubmitting}
              className={cn(
                'flex-1 h-2 rounded-full transition-all',
                i < currentIndex
                  ? 'bg-gold cursor-pointer hover:bg-gold-light'
                  : i === currentIndex
                  ? 'bg-gold/50'
                  : 'bg-background-tertiary'
              )}
            />
          ))}
        </div>

        {/* Question card */}
        <div className="card felt-bg mb-6">
          <QuestionDisplay
            question={currentQuestion}
            selectedAnswer={currentAnswer}
            onSelect={handleSelectAnswer}
            disabled={isSubmitting}
          />
        </div>

        {/* Loading indicator when submitting */}
        {isSubmitting && (
          <div className="flex items-center justify-center gap-2 text-gold">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Calculating your results...</span>
          </div>
        )}

        {/* Instruction hint */}
        {!isSubmitting && (
          <p className="text-center text-sm text-muted-foreground">
            Click an answer to continue
            {currentIndex > 0 && ' • Use the back arrow to change previous answers'}
          </p>
        )}
      </div>
    </div>
  );
}

interface WelcomeScreenProps {
  onStart: () => void;
  onSkip: () => void;
  isSkipping: boolean;
  totalQuestions: number;
}

function WelcomeScreen({
  onStart,
  onSkip,
  isSkipping,
  totalQuestions,
}: WelcomeScreenProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-lg w-full text-center">
        <div className="mb-8">
          <div className="w-20 h-20 mx-auto bg-gold/20 rounded-full flex items-center justify-center mb-6">
            <BookOpen className="w-10 h-10 text-gold" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">
            Welcome to Poker Coach!
          </h1>
          <p className="text-muted-foreground text-lg">
            Let's find the perfect starting point for you.
          </p>
        </div>

        <div className="card mb-6">
          <h2 className="text-lg font-semibold text-white mb-3">
            Placement Test
          </h2>
          <p className="text-muted-foreground mb-4">
            Answer {totalQuestions} quick questions to assess your poker knowledge.
            Based on your score, we'll unlock the right modules and give you
            starting XP!
          </p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-background-tertiary rounded-lg p-3">
              <div className="text-gold font-semibold mb-1">Score High</div>
              <div className="text-muted-foreground">
                Unlock more modules & earn up to 700 XP
              </div>
            </div>
            <div className="bg-background-tertiary rounded-lg p-3">
              <div className="text-gold font-semibold mb-1">Quick Test</div>
              <div className="text-muted-foreground">
                Just {totalQuestions} questions, no pressure
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={onStart}
            className="btn-primary w-full py-4 text-lg"
          >
            <Rocket className="w-5 h-5 mr-2" />
            Start Placement Test
          </button>
          <button
            onClick={onSkip}
            disabled={isSkipping}
            className="btn-secondary w-full py-3"
          >
            {isSkipping ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Skipping...
              </>
            ) : (
              "Skip (I'm a beginner)"
            )}
          </button>
        </div>

        <p className="text-sm text-muted-foreground mt-4">
          New to poker? No worries! Skip the test to start from the basics.
        </p>
      </div>
    </div>
  );
}

interface ResultsScreenProps {
  result: PlacementResult;
  feedback: PlacementAnswerFeedback[];
  questions: PlacementQuestion[];
  onContinue: () => void;
}

function ResultsScreen({ result, feedback, questions, onContinue }: ResultsScreenProps) {
  const [showReview, setShowReview] = useState(false);

  const getLevelEmoji = (level: string) => {
    switch (level) {
      case 'Expert':
        return '👑';
      case 'Advanced':
        return '🌟';
      case 'Intermediate':
        return '💪';
      case 'Knows Basics':
        return '📚';
      default:
        return '🎓';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Expert':
        return 'text-gold';
      case 'Advanced':
        return 'text-purple-400';
      case 'Intermediate':
        return 'text-blue-400';
      case 'Knows Basics':
        return 'text-green-400';
      default:
        return 'text-gray-400';
    }
  };

  const wrongAnswers = feedback.filter((a) => !a.isCorrect);

  // When review is shown, don't use fixed footer so user can scroll to see all content
  const useFixedFooter = !showReview;

  return (
    <div className={cn('min-h-screen bg-background p-4 sm:p-6', useFixedFooter ? 'pb-40' : 'pb-6')}>
      <div className="max-w-2xl mx-auto">
        {/* Celebration header */}
        <div className="card felt-bg text-center mb-6">
          <div className="text-6xl mb-4">{getLevelEmoji(result.level)}</div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Test Complete!
          </h1>
          <p className={cn('text-xl font-semibold', getLevelColor(result.level))}>
            You're starting as: {result.level}
          </p>
        </div>

        {/* Stats - simplified */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="card text-center">
            <div className="text-3xl font-bold text-green-400">
              {result.score}/{result.totalQuestions}
            </div>
            <div className="text-sm text-muted-foreground">Questions Correct</div>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-bold text-blue-400">
              {result.modulesUnlocked}
            </div>
            <div className="text-sm text-muted-foreground">
              Module{result.modulesUnlocked !== 1 ? 's' : ''} Unlocked
            </div>
          </div>
        </div>

        {/* Answer summary visual bar */}
        {feedback.length > 0 && (
          <div className="card mb-6">
            <h2 className="text-lg font-semibold text-white mb-4">
              Answer Summary
            </h2>
            <div className="flex gap-1 mb-3">
              {feedback.map((answer, i) => (
                <div
                  key={i}
                  className={cn(
                    'flex-1 h-3 rounded-full flex items-center justify-center',
                    answer.isCorrect ? 'bg-green-500' : 'bg-red-500'
                  )}
                >
                  <span className="text-[10px] font-bold text-white">
                    {i + 1}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-400" />
                {feedback.filter((a) => a.isCorrect).length} correct
              </span>
              <span className="flex items-center gap-1">
                <XCircle className="w-4 h-4 text-red-400" />
                {wrongAnswers.length} incorrect
              </span>
            </div>
          </div>
        )}

        {/* Detailed review of wrong answers only */}
        {showReview && wrongAnswers.length > 0 && (
          <div className="space-y-4 mb-6">
            {feedback
              .map((answer, originalIndex) => ({ answer, originalIndex }))
              .filter(({ answer }) => !answer.isCorrect)
              .map(({ answer, originalIndex }) => {
                const question = questions.find((q) => q.id === answer.questionId);
                const content = question?.content as Record<string, unknown> | undefined;
                const questionText = answer.questionText || (content?.question as string);

                // For hand comparison questions, get the hand names
                const isHandCompare = question?.type === 'HAND_COMPARE';
                const hand1 = content?.hand1 as { cards: string[]; name: string } | undefined;
                const hand2 = content?.hand2 as { cards: string[]; name: string } | undefined;

                // Get display text for user's answer
                const getUserAnswerDisplay = () => {
                  if (isHandCompare && hand1 && hand2) {
                    return answer.userAnswer === 'hand1' ? hand1.name : hand2.name;
                  }
                  return answer.userAnswer;
                };

                // Get display text for correct answer
                const getCorrectAnswerDisplay = () => {
                  if (isHandCompare && hand1 && hand2) {
                    return answer.correctAnswer === 'hand1' ? hand1.name : hand2.name;
                  }
                  return answer.correctAnswer;
                };

                return (
                  <div
                    key={answer.questionId}
                    className="card border-l-4 border-l-red-500"
                  >
                    <div className="text-sm text-muted-foreground mb-2">
                      Question {originalIndex + 1}
                    </div>

                    {/* Question text */}
                    {questionText && (
                      <p className="text-white font-medium mb-4">{questionText}</p>
                    )}

                    {/* For hand compare questions, show the cards */}
                    {isHandCompare && hand1 && hand2 && (
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        {[
                          { hand: hand1, value: 'hand1' },
                          { hand: hand2, value: 'hand2' },
                        ].map(({ hand, value }) => (
                          <div
                            key={value}
                            className={cn(
                              'p-3 rounded-lg border-2',
                              answer.correctAnswer === value
                                ? 'border-green-500 bg-green-500/10'
                                : answer.userAnswer === value
                                ? 'border-red-500 bg-red-500/10'
                                : 'border-border'
                            )}
                          >
                            <div className="text-sm text-muted-foreground mb-2 text-center">
                              {hand.name}
                            </div>
                            <div className="flex justify-center gap-1 flex-wrap">
                              {hand.cards.map((card, i) => (
                                <PlayingCard key={i} card={card} size="sm" />
                              ))}
                            </div>
                            {answer.correctAnswer === value && (
                              <div className="text-center mt-2 text-green-400 text-sm font-medium">
                                ✓ Correct
                              </div>
                            )}
                            {answer.userAnswer === value && answer.correctAnswer !== value && (
                              <div className="text-center mt-2 text-red-400 text-sm font-medium">
                                ✗ Your pick
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* For non-hand-compare questions, show text answers */}
                    {!isHandCompare && (
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2">
                          <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                          <span className="text-red-400">You chose: <span className="line-through">{getUserAnswerDisplay() || '(unknown)'}</span></span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                          <span className="text-green-400">Correct: {getCorrectAnswerDisplay()}</span>
                        </div>
                      </div>
                    )}

                    {/* Explanation */}
                    <p className="text-muted-foreground text-sm">
                      {answer.explanation}
                    </p>
                  </div>
                );
              })}
          </div>
        )}

        {/* Action buttons - fixed when review hidden, inline when review shown */}
        <div className={cn(
          'p-4 bg-background',
          useFixedFooter
            ? 'fixed bottom-0 left-0 right-0 border-t border-border'
            : 'mt-6'
        )}>
          <div className={cn('space-y-3', useFixedFooter && 'max-w-2xl mx-auto')}>
            {wrongAnswers.length > 0 && (
              <button
                onClick={() => setShowReview(!showReview)}
                className="btn-secondary w-full py-4 text-lg"
              >
                {showReview ? (
                  <>
                    <ChevronUp className="w-5 h-5 mr-2" />
                    Hide Review
                  </>
                ) : (
                  <>
                    <BookOpen className="w-5 h-5 mr-2" />
                    Review Wrong Answers ({wrongAnswers.length})
                  </>
                )}
              </button>
            )}
            <button
              onClick={onContinue}
              className="btn-primary w-full py-4 text-lg"
            >
              Go to Dashboard
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface QuestionDisplayProps {
  question: PlacementQuestion;
  selectedAnswer: string | null;
  onSelect: (answer: string) => void;
  disabled?: boolean;
}

const QuestionDisplay = memo(function QuestionDisplay({
  question,
  selectedAnswer,
  onSelect,
  disabled,
}: QuestionDisplayProps) {
  const content = question.content as Record<string, unknown>;

  // Hand comparison questions
  if (question.type === 'HAND_COMPARE') {
    const hand1 = content.hand1 as { cards: string[]; name: string };
    const hand2 = content.hand2 as { cards: string[]; name: string };

    return (
      <div>
        <div className="text-xs text-muted-foreground mb-2">
          {question.moduleName}
        </div>
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
              disabled={disabled}
              className={cn(
                'p-4 rounded-xl border-2 transition-all',
                selectedAnswer === value
                  ? 'border-gold bg-gold/10'
                  : 'border-border hover:border-gold/50',
                disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              <div className="text-sm text-muted-foreground mb-2">
                {hand.name}
              </div>
              <div className="flex justify-center gap-1 flex-wrap">
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
      <div className="text-xs text-muted-foreground mb-2">
        {question.moduleName}
      </div>
      <h2 className="text-lg font-semibold text-white mb-6">{questionText}</h2>

      {/* Show hand if present */}
      {Boolean(content.hand) && (
        <div className="flex justify-center gap-1 mb-6 flex-wrap">
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
            disabled={disabled}
            className={cn(
              'w-full p-4 rounded-xl border-2 text-left transition-all',
              selectedAnswer === option
                ? 'border-gold bg-gold/10'
                : 'border-border hover:border-gold/50',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            <span className="text-white">{option}</span>
          </button>
        ))}
      </div>
    </div>
  );
});
