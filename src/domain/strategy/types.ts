/**
 * types.ts
 * Core strategy data model types.
 * Designed for long-term scalability with mixed strategy support.
 */

import type { HandClass } from '../poker/cards';
import type { Position } from '../poker/positions';
import type { ActionEvent, ScenarioType } from '../poker/actions';

// ─── Hand Strategy ────────────────────────────────────────────────────────────

/**
 * A specific raise action with size and frequency.
 * Supports multiple raise sizes (e.g., small and large 3-bet).
 */
export interface RaiseSize {
  /** Total amount to put in, in big blinds (e.g., 3 for a 3bb open) */
  toBB: number;
  /** Frequency this specific sizing is used (0–1) */
  frequency: number;
}

/**
 * The full GTO strategy for a specific hand in a specific situation.
 * All frequencies must sum to approximately 1.0.
 * 
 * Example — pure raise:
 *   { fold: 0, call: 0, raises: [{ toBB: 3, frequency: 1 }] }
 * 
 * Example — 50/50 call/raise:
 *   { fold: 0, call: 0.5, raises: [{ toBB: 9, frequency: 0.5 }] }
 * 
 * Example — pure fold:
 *   { fold: 1, call: 0, raises: [] }
 */
export interface HandStrategy {
  fold: number;
  call: number;
  raises: RaiseSize[];
}

/** Total raise frequency (sum of all raise sizes' frequencies) */
export function getTotalRaiseFrequency(strategy: HandStrategy): number {
  return strategy.raises.reduce((sum, r) => sum + r.frequency, 0);
}

/** Total frequency of all actions (should sum to ~1) */
export function getTotalFrequency(strategy: HandStrategy): number {
  return strategy.fold + strategy.call + getTotalRaiseFrequency(strategy);
}

/** Determine the dominant action (highest frequency) */
export function getDominantAction(strategy: HandStrategy): 'fold' | 'call' | 'raise' {
  const raiseFreq = getTotalRaiseFrequency(strategy);
  const max = Math.max(strategy.fold, strategy.call, raiseFreq);
  if (raiseFreq === max) return 'raise';
  if (strategy.call === max) return 'call';
  return 'fold';
}

/** Returns true if the strategy is mixed (no single action ≥ 95%) */
export function isMixedStrategy(strategy: HandStrategy, threshold = 0.05): boolean {
  const raiseFreq = getTotalRaiseFrequency(strategy);
  const actions = [strategy.fold, strategy.call, raiseFreq].filter((f) => f > 0);
  return actions.length > 1 && actions.every((f) => f < 1 - threshold);
}

// ─── 169-Hand Strategy Matrix ─────────────────────────────────────────────────

/** Maps each of the 169 hand classes to a HandStrategy */
export type Strategy169 = Record<HandClass, HandStrategy>;

// ─── Decision Node ────────────────────────────────────────────────────────────

/**
 * A decision node represents a specific poker situation with its complete strategy.
 * Each node is uniquely identified by:
 *   - The scenario type (RFI, VS_RFI, VS_3BET, ...)
 *   - The hero's position
 *   - The action history leading to this decision
 * 
 * Example: "CO raises, BTN faces the raise" = DecisionNode {
 *   id: "BTN_VS_CO_RFI",
 *   scenarioType: "VS_RFI",
 *   heroPosition: "BTN",
 *   actionHistoryPattern: [
 *     { position: "CO", action: "raise", amountBB: 3 }
 *   ],
 *   strategy: { ...169 hand strategies... }
 * }
 */
export interface DecisionNode {
  /** Unique identifier, e.g. "UTG_RFI", "BTN_VS_CO_RFI", "CO_VS_BTN_3BET" */
  id: string;
  scenarioType: ScenarioType;
  heroPosition: Position;
  /** Simplified action history pattern (excludes hero's action) */
  actionHistoryPattern: ActionEvent[];
  /** The 169-hand strategy matrix for this situation */
  strategy: Strategy169;
  /** Human-readable description */
  description: string;
}

// ─── Strategy Profile Metadata ────────────────────────────────────────────────

export interface RakeConfig {
  /** Rake percentage (e.g., 0.05 for 5%). null = unknown. */
  percent: number | null;
  /** Rake cap in big blinds. null = unknown. */
  capBB: number | null;
  /** No flop, no drop rule. null = unknown. */
  noFlopNoDrop: boolean | null;
}

export interface StrategySource {
  name: string;
  url: string;
  description: string;
}

export interface ProfileMetadata {
  /** Unique profile identifier */
  id: string;
  /** Human-readable profile name */
  name: string;
  /** Game type */
  game: 'NLHE' | 'PLO' | 'PLO5';
  /** Number of players */
  players: number;
  /** Effective stack depth in big blinds */
  stackDepthBB: number;
  /** Ante in big blinds (0 = no ante) */
  anteBB: number;
  /** Straddle in big blinds (0 = no straddle) */
  straddleBB: number;
  /** Positions in this profile */
  positions: Position[];
  /** Source information */
  source: StrategySource;
  /** Rake structure (null values = unknown/unspecified) */
  rake: RakeConfig;
  /** Any normalization/simplification notes */
  normalizationNotes?: string;
}

// ─── Strategy Profile ─────────────────────────────────────────────────────────

/**
 * A complete strategy profile containing metadata and all decision nodes.
 * This is the top-level strategy object loaded by the strategy engine.
 */
export interface StrategyProfile {
  metadata: ProfileMetadata;
  nodes: DecisionNode[];
}

// ─── Strategy Filter ──────────────────────────────────────────────────────────

export interface NodeFilter {
  scenarioTypes?: ScenarioType[];
  heroPositions?: Position[];
  openerPositions?: Position[];
}
