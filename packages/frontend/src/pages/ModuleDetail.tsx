import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Award, Zap } from 'lucide-react';
import { useModule } from '@/hooks/useApi';
import {
  cn,
  formatXp,
  getDifficultyLabel,
  getDifficultyColor,
  getStatusColor,
  getStatusLabel,
} from '@/lib/utils';

export default function ModuleDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data, isLoading, error } = useModule(slug || '');

  if (isLoading) {
    return <ModuleDetailSkeleton />;
  }

  if (error || !data) {
    return (
      <div className="md:ml-64 p-8 text-center">
        <p className="text-red-400">Failed to load module. Please try again.</p>
        <Link to="/modules" className="text-gold hover:text-gold-light mt-4 inline-block">
          Back to Modules
        </Link>
      </div>
    );
  }

  const { module, progress } = data;
  const isMastered = progress.status === 'MASTERED';

  return (
    <div className="md:ml-64 pb-20 md:pb-6">
      {/* Back link */}
      <Link
        to="/modules"
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Modules
      </Link>

      {/* Header */}
      <div className={cn('card felt-bg mb-6', isMastered && 'border-gold/30')}>
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-xl bg-background/30 flex items-center justify-center text-4xl">
            {module.iconEmoji}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-white">{module.name}</h1>
              <span
                className={cn(
                  'px-2 py-0.5 rounded text-sm font-medium',
                  getDifficultyColor(module.difficulty),
                  'bg-current/10'
                )}
              >
                {getDifficultyLabel(module.difficulty)}
              </span>
            </div>
            <p className="text-muted-foreground mb-4">{module.description}</p>
            <div className="flex items-center gap-4 text-sm">
              <span className={getStatusColor(progress.status)}>
                {getStatusLabel(progress.status)}
              </span>
              <span className="text-muted">·</span>
              <span className="text-muted-foreground">
                {module.questionCount} questions
              </span>
              {isMastered && (
                <>
                  <span className="text-muted">·</span>
                  <span className="text-gold">+{formatXp(module.masteryXpBonus)} XP earned</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Progress stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="card text-center">
          <Award className="w-6 h-6 text-green-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">
            {progress.correctAnswers}/{progress.totalAnswers}
          </div>
          <div className="text-sm text-muted-foreground">Correct</div>
        </div>
        <div className="card text-center">
          <Zap className="w-6 h-6 text-orange-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">
            {progress.currentStreak}
          </div>
          <div className="text-sm text-muted-foreground">Streak</div>
        </div>
        <div className="card text-center">
          <Play className={cn("w-6 h-6 mx-auto mb-2", isMastered ? "text-gold" : "text-purple-400")} />
          <div className={cn(
            "text-2xl font-bold",
            isMastered ? "text-gold" : "text-white"
          )}>
            {isMastered ? '✓' : progress.totalAnswers}
          </div>
          <div className="text-sm text-muted-foreground">
            {isMastered ? 'Mastered!' : 'Answered'}
          </div>
        </div>
      </div>

      {/* Mastery progress */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">
            {isMastered ? 'Module Mastered!' : 'Mastery Progress'}
          </span>
          <span className={cn('text-sm font-medium', isMastered ? 'text-gold' : 'text-white')}>
            {Math.round(progress.masteryScore)}% accuracy
          </span>
        </div>
        <div className="progress-bar h-3">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-500',
              isMastered
                ? 'bg-gradient-to-r from-gold to-gold-light'
                : progress.masteryScore >= 80
                  ? 'bg-gradient-to-r from-green-500 to-green-400'
                  : 'bg-gradient-to-r from-felt-light to-blue-500'
            )}
            style={{ width: `${Math.min(100, progress.masteryScore)}%` }}
          />
        </div>
        {!isMastered && (
          <p className="text-xs text-muted-foreground mt-2">
            {progress.totalAnswers < 20
              ? `Answer ${20 - progress.totalAnswers} more question${20 - progress.totalAnswers > 1 ? 's' : ''} (${progress.totalAnswers}/20) with 80%+ accuracy to master.`
              : progress.masteryScore >= 80
                ? 'Great job! You\'ve mastered this module!'
                : `Keep practicing! Need 80% accuracy to master (currently ${Math.round(progress.masteryScore)}%).`
            }
          </p>
        )}
        {isMastered && (
          <p className="text-xs text-gold mt-2">
            Congratulations! You've mastered this module.
          </p>
        )}
      </div>

      {/* Question types */}
      {module.questionTypes && module.questionTypes.length > 0 && (
        <div className="card mb-6">
          <h2 className="text-lg font-semibold text-white mb-3">
            What You'll Practice
          </h2>
          <ul className="space-y-2">
            {module.questionTypes.map((qt) => (
              <li key={qt.type} className="flex items-center gap-2 text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-gold flex-shrink-0" />
                <span>{formatQuestionType(qt.type)}</span>
                <span className="text-sm text-muted">({qt.count})</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Start practice button */}
      <button
        onClick={() => navigate(`/practice/${slug}`)}
        className="btn-primary w-full py-4 text-lg"
      >
        <Play className="w-5 h-5 mr-2" />
        {progress.totalAnswers > 0 ? 'Continue Practice' : 'Start Practice'}
      </button>

      {/* Mastery bonus info - subtle hint, not a button */}
      {!isMastered && (
        <p className="mt-4 text-center text-sm text-muted-foreground">
          <span className="text-gold/70">💡</span> Master this module to earn{' '}
          <span className="text-gold">{formatXp(module.masteryXpBonus)} bonus XP</span>
        </p>
      )}
    </div>
  );
}

function formatQuestionType(type: string): string {
  const types: Record<string, string> = {
    // Hand Rankings (Module 1)
    HAND_COMPARE: 'Compare two poker hands',
    HAND_RANK: 'Identify hand rankings',
    // Board Reading (Module 2)
    MULTIWAY_SHOWDOWN: 'Find the winner at showdown',
    SPLIT_POT: 'Identify split pot situations',
    // Hand Flow (Module 3)
    STREET_ORDER: 'Order of betting rounds',
    BLIND_STRUCTURE: 'Blinds and antes',
    ACTION_AVAILABLE: 'Available betting actions',
    TURN_ORDER: 'Who acts when',
    // Position (Module 4)
    POSITION_ID: 'Identify table positions',
    POSITION_ADVANTAGE: 'Position advantages',
    POSITION_ORDER: 'Acting order by position',
    POSITION_STRATEGY: 'Position-based strategy',
    // Starting Hands (Module 5)
    PLAY_FOLD: 'Play or fold decisions',
    PREFLOP: 'Preflop hand selection',
    HAND_CATEGORY: 'Categorize starting hands',
    // Betting Basics (Module 6)
    BET_INTENT: 'Why we bet (value, bluff, protection)',
    BET_RESPONSE: 'Responding to bets',
    BET_SIZE: 'Bet sizing',
    // Flop Play (Module 7)
    HAND_STRENGTH: 'Evaluate hand strength',
    BOARD_TEXTURE: 'Read board textures',
    FLOP_ACTION: 'Flop action decisions',
    // Pot Odds (Module 8)
    ODDS_CALC: 'Calculate pot odds',
    OUTS_COUNT: 'Count your outs',
    ODDS_CONVERT: 'Convert odds to percentages',
    DECISION: 'Odds-based decisions',
    RULE_OF: 'Rule of 2 and 4',
    // Bluffing (Module 9)
    STORY_CONSISTENT: 'Tell a consistent story',
    BLUFF_SPOT: 'Identify bluff spots',
    VALUE_OR_BLUFF: 'Value bet or bluff?',
    BLUFF_FREQUENCY: 'Bluffing frequency',
    // Mental Game (Module 10)
    SPOT_MISTAKE: 'Spot common mistakes',
    TILT_RESPONSE: 'Handle tilt',
    RESULTS_VS_DECISION: 'Results vs. decisions',
    BANKROLL: 'Bankroll management',
    SESSION_MANAGEMENT: 'Session management',
    // Fallback
    SCENARIO: 'Game scenarios',
  };
  return types[type] || type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
}

function ModuleDetailSkeleton() {
  return (
    <div className="md:ml-64 pb-20 md:pb-6 animate-pulse">
      <div className="h-6 w-32 bg-background-secondary rounded mb-6" />
      <div className="card felt-bg h-40 mb-6" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card h-24" />
        ))}
      </div>
      <div className="card h-20 mb-6" />
      <div className="h-14 bg-gold/50 rounded-lg" />
    </div>
  );
}
