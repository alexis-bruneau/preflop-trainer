/**
 * useTrainerStore.ts
 * Zustand store for training session state.
 * Separates client state from server state cleanly.
 */

'use client';

import { create } from 'zustand';
import type { TrainingQuestion } from '../domain/trainer/question-generator';
import { generateQuestion, generateWeaknessQuestion } from '../domain/trainer/question-generator';
import type { ScoringResult } from '../domain/trainer/answer-scorer';
import { scoreAnswer } from '../domain/trainer/answer-scorer';
import {
  createSession,
  recordAnswer as recordAnswerToSession,
  computeSessionMetrics,
  createAnswerRecord,
} from '../domain/trainer/session-engine';
import type { SessionState, SessionMetrics } from '../domain/trainer/session-engine';
import type { HeroDecision, ScenarioType } from '../domain/poker/actions';
import type { Position } from '../domain/poker/positions';
import { localStatsRepository } from '../repositories/stats/LocalStatsRepository';
import { getDefaultProfileId, initializeStrategyEngine } from '../domain/strategy/strategy-loader';
import type { QuestionMode } from '../domain/trainer/question-generator';

// ─── Settings ─────────────────────────────────────────────────────────────────

export interface TrainerSettings {
  profileId: string;
  questionMode: QuestionMode;
  scoringMode: 'practical' | 'randomizer';
  showPercentagesAfterAnswer: boolean;
  autoAdvanceMs: 0 | 1000 | 2000 | 3000;
  animationsEnabled: boolean;
  scenarioFilter: ScenarioType[] | null; // null = all
  positionFilter: Position[] | null; // null = all
  weaknessMode: boolean;
}

const DEFAULT_SETTINGS: TrainerSettings = {
  profileId: 'rangeconverter-9max-100bb',
  questionMode: 'trainer',
  scoringMode: 'practical',
  showPercentagesAfterAnswer: true,
  autoAdvanceMs: 0,
  animationsEnabled: true,
  scenarioFilter: null,
  positionFilter: null,
  weaknessMode: false,
};

// ─── Store State ──────────────────────────────────────────────────────────────

export type TrainerPhase = 'idle' | 'question' | 'feedback';

export interface TrainerStore {
  // Session
  session: SessionState;
  sessionMetrics: SessionMetrics;
  
  // Current question
  phase: TrainerPhase;
  currentQuestion: TrainingQuestion | null;
  questionStartTime: number | null;
  
  // Feedback
  lastResult: ScoringResult | null;
  showRangeMatrix: boolean;
  
  // Settings
  settings: TrainerSettings;
  
  // Actions
  startNewSession: () => void;
  nextQuestion: () => void;
  submitAnswer: (action: HeroDecision) => void;
  toggleRangeMatrix: () => void;
  updateSettings: (partial: Partial<TrainerSettings>) => void;
  initializeEngine: () => void;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useTrainerStore = create<TrainerStore>((set, get) => ({
  session: createSession(),
  sessionMetrics: {
    totalAnswered: 0,
    correct: 0,
    incorrect: 0,
    accuracy: 0,
    currentStreak: 0,
    longestStreak: 0,
    averageResponseTimeMs: 0,
  },
  phase: 'idle',
  currentQuestion: null,
  questionStartTime: null,
  lastResult: null,
  showRangeMatrix: false,
  settings: loadSettings(),

  initializeEngine: () => {
    initializeStrategyEngine();
  },

  startNewSession: () => {
    const session = createSession();
    set({ session, sessionMetrics: computeSessionMetrics(session), phase: 'idle' });
    get().nextQuestion();
  },

  nextQuestion: () => {
    const { settings, session } = get();
    
    const options = {
      profileId: settings.profileId,
      scenarioTypes: settings.scenarioFilter ?? undefined,
      heroPositions: settings.positionFilter ?? undefined,
      mode: settings.questionMode,
      scoringMode: settings.scoringMode,
    };

    let question;
    if (settings.weaknessMode) {
      question = generateWeaknessQuestion(options, []);
    } else {
      question = generateQuestion(options);
    }

    if (!question) {
      console.warn('No question generated — check filters');
      return;
    }

    set({
      currentQuestion: question,
      phase: 'question',
      lastResult: null,
      showRangeMatrix: false,
      questionStartTime: Date.now(),
    });
  },

  submitAnswer: (action: HeroDecision) => {
    const { currentQuestion, questionStartTime, session, settings } = get();
    if (!currentQuestion || get().phase !== 'question') return;

    const responseTimeMs = questionStartTime ? Date.now() - questionStartTime : 0;

    const result = scoreAnswer({
      chosenAction: action,
      strategy: currentQuestion.strategy,
      handClass: currentQuestion.handClass,
      scoringMode: settings.scoringMode,
      randomizerValue: currentQuestion.randomizerValue,
    });

    const answerRecord = createAnswerRecord({
      strategyProfileId: currentQuestion.profileId,
      decisionNodeId: currentQuestion.nodeId,
      scenarioType: currentQuestion.scenarioType,
      heroPosition: currentQuestion.heroPosition,
      handClass: currentQuestion.handClass,
      chosenAction: action,
      strategy: currentQuestion.strategy,
      valid: result.valid,
      responseTimeMs,
    });

    const updatedSession = recordAnswerToSession(session, answerRecord);
    const updatedMetrics = computeSessionMetrics(updatedSession);

    // Persist to localStorage
    localStatsRepository.recordAnswer(answerRecord).catch(console.error);

    set({
      session: updatedSession,
      sessionMetrics: updatedMetrics,
      lastResult: result,
      phase: 'feedback',
    });

    // Auto-advance if enabled
    if (settings.autoAdvanceMs > 0) {
      setTimeout(() => {
        get().nextQuestion();
      }, settings.autoAdvanceMs);
    }
  },

  toggleRangeMatrix: () => {
    set((state) => ({ showRangeMatrix: !state.showRangeMatrix }));
  },

  updateSettings: (partial) => {
    const newSettings = { ...get().settings, ...partial };
    set({ settings: newSettings });
    saveSettings(newSettings);
  },
}));

// ─── Settings Persistence ─────────────────────────────────────────────────────

const SETTINGS_KEY = 'preflop-trainer:settings';

function loadSettings(): TrainerSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function saveSettings(settings: TrainerSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {}
}
