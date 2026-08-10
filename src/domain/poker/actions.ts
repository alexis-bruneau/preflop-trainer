/**
 * actions.ts
 * Action types and events used in action histories.
 */

import type { Position } from './positions';

// ─── Action Types ─────────────────────────────────────────────────────────────

export type ActionType = 'fold' | 'limp' | 'call' | 'raise' | 'blind';

/**
 * A single action event in a preflop hand history.
 */
export interface ActionEvent {
  position: Position;
  action: ActionType;
  /** Amount in big blinds. Required for raise/call/blind. */
  amountBB?: number;
}

// ─── Scenario Types ───────────────────────────────────────────────────────────

export type ScenarioType =
  | 'RFI'        // Raise First In — everyone before folds
  | 'VS_RFI'     // Facing one open raise
  | 'VS_3BET'    // Original raiser facing 3-bet
  | 'VS_4BET'    // 3-bettor facing 4-bet (future)
  | 'VS_LIMP'    // Facing one limp (future)
  | 'VS_MULTI_LIMP' // Facing multiple limps (future)
  | 'SQUEEZE'    // 3-betting with caller(s) in between (future)
  | 'VS_SQUEEZE' // Facing a squeeze (future)
  | 'CUSTOM';    // Custom scenario

export const V1_SUPPORTED_SCENARIOS: ScenarioType[] = ['RFI', 'VS_RFI', 'VS_3BET'];

export const SCENARIO_DISPLAY_NAMES: Record<ScenarioType, string> = {
  RFI: 'Raise First In',
  VS_RFI: 'Facing Open Raise',
  VS_3BET: 'Facing 3-Bet',
  VS_4BET: 'Facing 4-Bet',
  VS_LIMP: 'Facing Limp',
  VS_MULTI_LIMP: 'Facing Multiple Limps',
  SQUEEZE: 'Squeeze Play',
  VS_SQUEEZE: 'Facing Squeeze',
  CUSTOM: 'Custom',
};

export const SCENARIO_SHORT_NAMES: Record<ScenarioType, string> = {
  RFI: 'RFI',
  VS_RFI: 'vs RFI',
  VS_3BET: 'vs 3-Bet',
  VS_4BET: 'vs 4-Bet',
  VS_LIMP: 'vs Limp',
  VS_MULTI_LIMP: 'vs Multi-Limp',
  SQUEEZE: 'Squeeze',
  VS_SQUEEZE: 'vs Squeeze',
  CUSTOM: 'Custom',
};

// ─── Available Decisions ──────────────────────────────────────────────────────

export type HeroDecision = 'fold' | 'call' | 'raise';

/**
 * Which decisions are available to hero given a scenario.
 * RFI: no call (nothing to call). Fold or Raise.
 * VS_RFI: Fold, Call (flat), or Raise (3-bet).
 * VS_3BET: Fold, Call, or Raise (4-bet).
 */
export function getAvailableDecisions(scenarioType: ScenarioType): HeroDecision[] {
  switch (scenarioType) {
    case 'RFI':
      return ['fold', 'raise'];
    case 'VS_RFI':
    case 'VS_3BET':
    case 'VS_4BET':
    case 'VS_SQUEEZE':
      return ['fold', 'call', 'raise'];
    case 'VS_LIMP':
    case 'VS_MULTI_LIMP':
      return ['fold', 'call', 'raise'];
    case 'SQUEEZE':
      return ['fold', 'raise'];
    default:
      return ['fold', 'call', 'raise'];
  }
}

/**
 * Human-readable label for what "raise" means in context.
 */
export function getRaiseLabel(scenarioType: ScenarioType): string {
  switch (scenarioType) {
    case 'RFI': return 'Open Raise';
    case 'VS_RFI': return '3-Bet';
    case 'VS_3BET': return '4-Bet';
    case 'VS_4BET': return '5-Bet';
    case 'SQUEEZE': return 'Squeeze';
    default: return 'Raise';
  }
}
