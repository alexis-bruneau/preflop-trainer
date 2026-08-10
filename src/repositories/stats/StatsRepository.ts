/**
 * StatsRepository.ts
 * Interface for persistent training statistics storage.
 * Abstracted so LocalStatsRepository can be replaced with CloudStatsRepository.
 */

import type { AnswerRecord, SessionState } from '../domain/trainer/session-engine';
import type { ScenarioType } from '../domain/poker/actions';
import type { Position } from '../domain/poker/positions';
import type { HandClass } from '../domain/poker/cards';

// ─── Training Stats ───────────────────────────────────────────────────────────

export interface NodeAccuracy {
  nodeId: string;
  description: string;
  scenarioType: ScenarioType;
  heroPosition: Position;
  totalAnswered: number;
  correct: number;
  accuracy: number;
}

export interface HandAccuracy {
  handClass: HandClass;
  nodeId: string;
  description: string;
  totalAnswered: number;
  correct: number;
  accuracy: number;
  lastMistakeTimestamp?: string;
}

export interface TrainingStats {
  totalAnswered: number;
  totalCorrect: number;
  accuracy: number;
  longestStreak: number;
  averageResponseTimeMs: number;
  
  /** Accuracy per scenario type */
  byScenario: Record<ScenarioType, { total: number; correct: number; accuracy: number }>;
  
  /** Accuracy per hero position */
  byPosition: Record<Position, { total: number; correct: number; accuracy: number }>;
  
  /** Per decision node accuracy */
  byNode: NodeAccuracy[];
  
  /** Most missed hands */
  weakestHands: HandAccuracy[];
  
  /** All individual answer records */
  recentAnswers: AnswerRecord[];
  
  /** All sessions */
  sessions: Array<{ sessionId: string; startTime: string; endTime?: string; answered: number; correct: number }>;
}

// ─── Repository Interface ─────────────────────────────────────────────────────

export interface StatsRepository {
  getStats(): Promise<TrainingStats>;
  recordAnswer(record: AnswerRecord): Promise<void>;
  recordSessionEnd(session: SessionState): Promise<void>;
  resetStats(): Promise<void>;
}
