/**
 * session-engine.ts
 * Manages the active training session state and records.
 */

import type { ScenarioType, HeroDecision } from '../poker/actions';
import type { Position } from '../poker/positions';
import type { HandStrategy } from '../strategy/types';
import type { HandClass } from '../poker/cards';

// ─── Answer Record ────────────────────────────────────────────────────────────

export interface AnswerRecord {
  id: string;
  timestamp: string;
  strategyProfileId: string;
  decisionNodeId: string;
  scenarioType: ScenarioType;
  heroPosition: Position;
  handClass: HandClass;
  chosenAction: HeroDecision;
  strategy: HandStrategy;
  valid: boolean;
  responseTimeMs: number;
}

// ─── Session State ────────────────────────────────────────────────────────────

export interface SessionState {
  sessionId: string;
  startTime: string;
  answers: AnswerRecord[];
}

// ─── Session Metrics ──────────────────────────────────────────────────────────

export interface SessionMetrics {
  totalAnswered: number;
  correct: number;
  incorrect: number;
  accuracy: number; // 0–1
  currentStreak: number;
  longestStreak: number;
  averageResponseTimeMs: number;
}

// ─── Session Engine ───────────────────────────────────────────────────────────

export function createSession(): SessionState {
  return {
    sessionId: `session_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    startTime: new Date().toISOString(),
    answers: [],
  };
}

export function recordAnswer(session: SessionState, record: AnswerRecord): SessionState {
  return {
    ...session,
    answers: [...session.answers, record],
  };
}

export function computeSessionMetrics(session: SessionState): SessionMetrics {
  const answers = session.answers;
  const total = answers.length;
  const correct = answers.filter((a) => a.valid).length;
  const incorrect = total - correct;

  // Current streak
  let currentStreak = 0;
  for (let i = answers.length - 1; i >= 0; i--) {
    if (answers[i].valid) currentStreak++;
    else break;
  }

  // Longest streak
  let longestStreak = 0;
  let streak = 0;
  for (const answer of answers) {
    if (answer.valid) {
      streak++;
      longestStreak = Math.max(longestStreak, streak);
    } else {
      streak = 0;
    }
  }

  // Average response time
  const avgResponseTime =
    total > 0
      ? answers.reduce((sum, a) => sum + a.responseTimeMs, 0) / total
      : 0;

  return {
    totalAnswered: total,
    correct,
    incorrect,
    accuracy: total > 0 ? correct / total : 0,
    currentStreak,
    longestStreak,
    averageResponseTimeMs: avgResponseTime,
  };
}

export function createAnswerRecord(params: {
  strategyProfileId: string;
  decisionNodeId: string;
  scenarioType: ScenarioType;
  heroPosition: Position;
  handClass: HandClass;
  chosenAction: HeroDecision;
  strategy: HandStrategy;
  valid: boolean;
  responseTimeMs: number;
}): AnswerRecord {
  return {
    id: `ans_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    timestamp: new Date().toISOString(),
    ...params,
  };
}
