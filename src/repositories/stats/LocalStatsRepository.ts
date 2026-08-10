/**
 * LocalStatsRepository.ts
 * localStorage-based implementation of StatsRepository.
 * Replace with CloudStatsRepository for authenticated users.
 */

import type { StatsRepository, TrainingStats, NodeAccuracy, HandAccuracy } from './StatsRepository';
import type { AnswerRecord, SessionState } from '../../domain/trainer/session-engine';
import type { ScenarioType } from '../../domain/poker/actions';
import type { Position } from '../../domain/poker/positions';
import { POSITIONS, PREFLOP_ACTION_ORDER } from '../../domain/poker/positions';

const STORAGE_KEYS = {
  ANSWERS: 'preflop-trainer:answers',
  SESSIONS: 'preflop-trainer:sessions',
} as const;

const MAX_RECENT_ANSWERS = 2000;

// ─── LocalStatsRepository ─────────────────────────────────────────────────────

export class LocalStatsRepository implements StatsRepository {
  async getStats(): Promise<TrainingStats> {
    const answers = this.loadAnswers();
    const sessions = this.loadSessions();

    return computeStats(answers, sessions);
  }

  async recordAnswer(record: AnswerRecord): Promise<void> {
    const answers = this.loadAnswers();
    answers.push(record);

    // Trim to max recent answers
    const trimmed = answers.slice(-MAX_RECENT_ANSWERS);
    this.saveAnswers(trimmed);
  }

  async recordSessionEnd(session: SessionState): Promise<void> {
    const sessions = this.loadSessions();
    const answers = session.answers;
    const correct = answers.filter((a) => a.valid).length;

    sessions.push({
      sessionId: session.sessionId,
      startTime: session.startTime,
      endTime: new Date().toISOString(),
      answered: answers.length,
      correct,
    });

    this.saveSessions(sessions);
  }

  async resetStats(): Promise<void> {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.ANSWERS);
      localStorage.removeItem(STORAGE_KEYS.SESSIONS);
    }
  }

  private loadAnswers(): AnswerRecord[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.ANSWERS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private saveAnswers(answers: AnswerRecord[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.ANSWERS, JSON.stringify(answers));
    } catch {
      // Quota exceeded — trim further
      const trimmed = answers.slice(-500);
      localStorage.setItem(STORAGE_KEYS.ANSWERS, JSON.stringify(trimmed));
    }
  }

  private loadSessions(): Array<{ sessionId: string; startTime: string; endTime?: string; answered: number; correct: number }> {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SESSIONS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private saveSessions(sessions: any[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions.slice(-100)));
    } catch {}
  }
}

// ─── Stats Computation ────────────────────────────────────────────────────────

function computeStats(
  answers: AnswerRecord[],
  sessions: Array<{ sessionId: string; startTime: string; endTime?: string; answered: number; correct: number }>
): TrainingStats {
  const total = answers.length;
  const correct = answers.filter((a) => a.valid).length;

  // Longest streak across all time
  let longestStreak = 0;
  let streak = 0;
  for (const a of answers) {
    if (a.valid) { streak++; longestStreak = Math.max(longestStreak, streak); }
    else streak = 0;
  }

  const avgResponseTime = total > 0
    ? answers.reduce((s, a) => s + a.responseTimeMs, 0) / total
    : 0;

  // By scenario
  const scenarioTypes: ScenarioType[] = ['RFI', 'VS_RFI', 'VS_3BET', 'VS_4BET', 'VS_LIMP', 'VS_MULTI_LIMP', 'SQUEEZE', 'VS_SQUEEZE', 'CUSTOM'];
  const byScenario: TrainingStats['byScenario'] = {} as any;
  for (const st of scenarioTypes) {
    const group = answers.filter((a) => a.scenarioType === st);
    const c = group.filter((a) => a.valid).length;
    byScenario[st] = { total: group.length, correct: c, accuracy: group.length > 0 ? c / group.length : 0 };
  }

  // By position
  const byPosition: TrainingStats['byPosition'] = {} as any;
  for (const pos of POSITIONS) {
    const group = answers.filter((a) => a.heroPosition === pos);
    const c = group.filter((a) => a.valid).length;
    byPosition[pos] = { total: group.length, correct: c, accuracy: group.length > 0 ? c / group.length : 0 };
  }

  // By node
  const nodeMap = new Map<string, { total: number; correct: number; description: string; scenarioType: ScenarioType; heroPosition: Position }>();
  for (const a of answers) {
    const key = a.decisionNodeId;
    const existing = nodeMap.get(key) ?? {
      total: 0, correct: 0,
      description: a.decisionNodeId,
      scenarioType: a.scenarioType,
      heroPosition: a.heroPosition,
    };
    nodeMap.set(key, {
      ...existing,
      total: existing.total + 1,
      correct: existing.correct + (a.valid ? 1 : 0),
    });
  }

  const byNode: NodeAccuracy[] = Array.from(nodeMap.entries())
    .map(([nodeId, data]) => ({
      nodeId,
      description: data.description,
      scenarioType: data.scenarioType,
      heroPosition: data.heroPosition,
      totalAnswered: data.total,
      correct: data.correct,
      accuracy: data.correct / data.total,
    }))
    .sort((a, b) => a.accuracy - b.accuracy);

  // Weakest hands (most mistakes, lowest accuracy)
  const handNodeMap = new Map<string, { total: number; correct: number; handClass: string; nodeId: string; lastMistake?: string }>();
  for (const a of answers) {
    const key = `${a.decisionNodeId}::${a.handClass}`;
    const existing = handNodeMap.get(key) ?? { total: 0, correct: 0, handClass: a.handClass, nodeId: a.decisionNodeId };
    handNodeMap.set(key, {
      ...existing,
      total: existing.total + 1,
      correct: existing.correct + (a.valid ? 1 : 0),
      lastMistake: !a.valid ? a.timestamp : existing.lastMistake,
    });
  }

  const weakestHands: HandAccuracy[] = Array.from(handNodeMap.entries())
    .filter(([, d]) => d.total >= 2) // Need at least 2 attempts
    .map(([, d]) => ({
      handClass: d.handClass as any,
      nodeId: d.nodeId,
      description: d.nodeId,
      totalAnswered: d.total,
      correct: d.correct,
      accuracy: d.correct / d.total,
      lastMistakeTimestamp: d.lastMistake,
    }))
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 20);

  return {
    totalAnswered: total,
    totalCorrect: correct,
    accuracy: total > 0 ? correct / total : 0,
    longestStreak,
    averageResponseTimeMs: avgResponseTime,
    byScenario,
    byPosition,
    byNode,
    weakestHands,
    recentAnswers: answers.slice(-100),
    sessions,
  };
}

// ─── Singleton ────────────────────────────────────────────────────────────────

export const localStatsRepository = new LocalStatsRepository();
