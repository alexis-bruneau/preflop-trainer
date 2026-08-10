/**
 * answer-scorer.ts
 * Scores user's chosen action against GTO strategy data.
 */

import type { HandStrategy } from '../strategy/types';
import { getTotalRaiseFrequency } from '../strategy/types';
import type { HeroDecision } from '../poker/actions';

// ─── Scoring Config ───────────────────────────────────────────────────────────

/** Actions with at least this solver frequency count as valid in Practical mode */
export const DEFAULT_VALID_ACTION_THRESHOLD = 0.05;

// ─── Scoring Modes ────────────────────────────────────────────────────────────

export type ScoringMode = 'practical' | 'randomizer';

// ─── Scoring Result ───────────────────────────────────────────────────────────

export interface ScoringResult {
  /** Whether the user's action is considered valid */
  valid: boolean;
  /** The user's chosen action */
  chosenAction: HeroDecision;
  /** Solver frequency of the chosen action (0–1) */
  chosenFrequency: number;
  /** The action with the highest frequency */
  dominantAction: HeroDecision;
  /** Whether this is a mixed strategy (multiple actions have significant frequency) */
  isMixed: boolean;
  /** All action frequencies for display */
  frequencies: {
    fold: number;
    call: number;
    raise: number;
  };
  /** In randomizer mode, the random number used */
  randomizerValue?: number;
  /** In randomizer mode, the expected action given the randomizer */
  expectedAction?: HeroDecision;
  /** Detailed feedback message */
  feedback: string;
  /** Raise sizing info (if raise is recommended) */
  raiseSizes: Array<{ toBB: number; frequency: number }>;
}

// ─── Score Function ───────────────────────────────────────────────────────────

export function scoreAnswer(params: {
  chosenAction: HeroDecision;
  strategy: HandStrategy;
  handClass: string;
  scoringMode: ScoringMode;
  validActionThreshold?: number;
  randomizerValue?: number;
}): ScoringResult {
  const {
    chosenAction,
    strategy,
    handClass,
    scoringMode,
    validActionThreshold = DEFAULT_VALID_ACTION_THRESHOLD,
    randomizerValue,
  } = params;

  const raiseFreq = getTotalRaiseFrequency(strategy);
  const frequencies = {
    fold: strategy.fold,
    call: strategy.call,
    raise: raiseFreq,
  };

  // Determine dominant action
  const dominantAction: HeroDecision =
    raiseFreq >= strategy.call && raiseFreq >= strategy.fold
      ? 'raise'
      : strategy.call >= strategy.fold
      ? 'call'
      : 'fold';

  // Determine if mixed (multiple actions have frequency ≥ threshold)
  const significantActions = (Object.entries(frequencies) as [HeroDecision, number][]).filter(
    ([, freq]) => freq >= validActionThreshold
  );
  const isMixed = significantActions.length > 1;

  // Get chosen action frequency
  const chosenFrequency = frequencies[chosenAction];

  let valid: boolean;
  let expectedAction: HeroDecision | undefined;

  if (scoringMode === 'randomizer') {
    // Randomizer mode: check if the randomizer value dictates the chosen action
    if (randomizerValue == null) {
      throw new Error('Randomizer mode requires a randomizerValue');
    }

    // Determine expected action from randomizer value
    // randomizerValue is 1-100
    const r = randomizerValue / 100;
    if (r <= strategy.fold) {
      expectedAction = 'fold';
    } else if (r <= strategy.fold + strategy.call) {
      expectedAction = 'call';
    } else {
      expectedAction = 'raise';
    }

    valid = chosenAction === expectedAction;
  } else {
    // Practical mode: any action with meaningful solver frequency is valid
    valid = chosenFrequency >= validActionThreshold;
  }

  // Build feedback message
  const feedback = buildFeedback({
    valid,
    chosenAction,
    chosenFrequency,
    dominantAction,
    isMixed,
    frequencies,
    handClass,
    scoringMode,
    randomizerValue,
    expectedAction,
  });

  return {
    valid,
    chosenAction,
    chosenFrequency,
    dominantAction,
    isMixed,
    frequencies,
    randomizerValue,
    expectedAction,
    feedback,
    raiseSizes: strategy.raises,
  };
}

// ─── Feedback Builder ─────────────────────────────────────────────────────────

function buildFeedback(params: {
  valid: boolean;
  chosenAction: HeroDecision;
  chosenFrequency: number;
  dominantAction: HeroDecision;
  isMixed: boolean;
  frequencies: { fold: number; call: number; raise: number };
  handClass: string;
  scoringMode: ScoringMode;
  randomizerValue?: number;
  expectedAction?: HeroDecision;
}): string {
  const { valid, chosenAction, isMixed, frequencies, handClass, scoringMode, expectedAction } = params;

  const freqPct = (f: number) => `${Math.round(f * 100)}%`;
  const actionLabel = (a: HeroDecision) => a.charAt(0).toUpperCase() + a.slice(1);

  if (scoringMode === 'randomizer' && expectedAction) {
    if (valid) {
      return `Correct! Randomizer says: ${actionLabel(expectedAction)}`;
    } else {
      return `Incorrect. Randomizer dictates: ${actionLabel(expectedAction)}. You chose: ${actionLabel(chosenAction)}.`;
    }
  }

  if (valid && !isMixed) {
    return `Correct! ${handClass} is a pure ${actionLabel(chosenAction)} (${freqPct(params.chosenFrequency)}).`;
  }

  if (valid && isMixed) {
    const actions = Object.entries(frequencies)
      .filter(([, f]) => f > 0)
      .map(([a, f]) => `${actionLabel(a as HeroDecision)}: ${freqPct(f)}`)
      .join(', ');
    return `Valid GTO action! ${handClass} mixes here: ${actions}.`;
  }

  // Incorrect
  const bestActions = Object.entries(frequencies)
    .filter(([, f]) => f > 0)
    .map(([a, f]) => `${actionLabel(a as HeroDecision)}: ${freqPct(f)}`)
    .join(', ');
  return `Incorrect. You chose: ${actionLabel(chosenAction)}. GTO strategy: ${bestActions}.`;
}

// ─── Randomizer ───────────────────────────────────────────────────────────────

/** Generate a random value 1-100 for randomizer mode */
export function generateRandomizerValue(): number {
  return Math.floor(Math.random() * 100) + 1;
}
