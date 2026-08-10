/**
 * action-history.ts
 * Utilities for building, validating, and computing state from action histories.
 */

import type { Position } from './positions';
import { PREFLOP_ACTION_ORDER, getPositionIndex, BLIND_AMOUNTS } from './positions';
import type { ActionEvent } from './actions';

// ─── Pot Calculation ──────────────────────────────────────────────────────────

/**
 * Compute the total pot size in BB from the action history.
 * Includes blinds, all calls, and all raises.
 */
export function computePot(actionHistory: ActionEvent[]): number {
  let pot = 0;
  for (const event of actionHistory) {
    if (event.action === 'blind' || event.action === 'call' || event.action === 'raise' || event.action === 'limp') {
      pot += event.amountBB ?? 0;
    }
  }
  return Math.round(pot * 100) / 100;
}

/**
 * Compute individual contributions per player (for pot calculation accuracy).
 * Returns a map of position → total chips put in.
 */
export function computeContributions(actionHistory: ActionEvent[]): Map<Position, number> {
  const contributions = new Map<Position, number>();
  
  for (const event of actionHistory) {
    if (event.amountBB != null && event.amountBB > 0) {
      const current = contributions.get(event.position) ?? 0;
      contributions.set(event.position, current + event.amountBB);
    }
  }
  
  return contributions;
}

// ─── Action History Queries ───────────────────────────────────────────────────

/**
 * Get the last aggressor (raiser) in the action history.
 */
export function getLastAggressor(actionHistory: ActionEvent[]): Position | null {
  for (let i = actionHistory.length - 1; i >= 0; i--) {
    if (actionHistory[i].action === 'raise') {
      return actionHistory[i].position;
    }
  }
  return null;
}

/**
 * Get the last raise amount in BB.
 */
export function getLastRaiseAmount(actionHistory: ActionEvent[]): number | null {
  for (let i = actionHistory.length - 1; i >= 0; i--) {
    if (actionHistory[i].action === 'raise' && actionHistory[i].amountBB != null) {
      return actionHistory[i].amountBB!;
    }
  }
  return null;
}

/**
 * Count the number of raises (bets/re-raises) in the action history.
 * 1 raise = open, 2 raises = one 3-bet, etc.
 */
export function countRaises(actionHistory: ActionEvent[]): number {
  return actionHistory.filter((e) => e.action === 'raise').length;
}

/**
 * Get the action by a specific position (if any).
 */
export function getActionByPosition(
  actionHistory: ActionEvent[],
  position: Position
): ActionEvent | null {
  return actionHistory.find((e) => e.position === position) ?? null;
}

/**
 * Returns positions that have folded.
 */
export function getFoldedPositions(actionHistory: ActionEvent[]): Position[] {
  return actionHistory.filter((e) => e.action === 'fold').map((e) => e.position);
}

/**
 * Returns positions that have called (flat called, not counting blinds).
 */
export function getCallingPositions(actionHistory: ActionEvent[]): Position[] {
  return actionHistory.filter((e) => e.action === 'call').map((e) => e.position);
}

// ─── Action History Validation ────────────────────────────────────────────────

export interface ActionHistoryValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validate that an action history is legal for a 9-max preflop scenario.
 */
export function validateActionHistory(actionHistory: ActionEvent[]): ActionHistoryValidationResult {
  const errors: string[] = [];
  const seenPositions = new Set<Position>();

  for (const event of actionHistory) {
    if (seenPositions.has(event.position)) {
      // Positions can act multiple times only in specific scenarios (3-bet facing re-raise)
      // For V1, each position acts at most once
      // (In VS_3BET, the action does return to the opener, but they're the "hero" 
      // in our model, so their action isn't in the history — it's the quiz question)
    }
    seenPositions.add(event.position);

    // Validate action amounts
    if ((event.action === 'raise' || event.action === 'call') && event.amountBB == null) {
      errors.push(`Position ${event.position}: ${event.action} must have an amount`);
    }

    if (event.amountBB != null && event.amountBB < 0) {
      errors.push(`Position ${event.position}: amount cannot be negative`);
    }
  }

  return { valid: errors.length === 0, errors };
}

// ─── Action History Builders ──────────────────────────────────────────────────

/**
 * Build the action history for an RFI scenario.
 * All positions before hero fold, plus SB and BB post blinds.
 */
export function buildRfiActionHistory(heroPosition: Position): ActionEvent[] {
  const history: ActionEvent[] = [];
  const heroIdx = getPositionIndex(heroPosition);

  // Positions before hero all fold
  for (const pos of PREFLOP_ACTION_ORDER.slice(0, heroIdx)) {
    // Don't add fold for blind positions before hero acts (they post first)
    if (pos !== 'SB' && pos !== 'BB') {
      history.push({ position: pos, action: 'fold' });
    }
  }

  return history;
}

/**
 * Build the action history for a VS_RFI scenario.
 * Positions before opener fold, opener raises, positions between fold,
 * hero is about to act.
 */
export function buildVsRfiActionHistory(
  openerPosition: Position,
  heroPosition: Position,
  raiseSizeBB: number
): ActionEvent[] {
  const history: ActionEvent[] = [];
  const openerIdx = getPositionIndex(openerPosition);
  const heroIdx = getPositionIndex(heroPosition);

  // Positions before opener fold (excluding blinds since they haven't acted yet)
  for (let i = 0; i < openerIdx; i++) {
    const pos = PREFLOP_ACTION_ORDER[i];
    if (pos !== 'SB' && pos !== 'BB') {
      history.push({ position: pos, action: 'fold' });
    }
  }

  // Opener raises
  history.push({ position: openerPosition, action: 'raise', amountBB: raiseSizeBB });

  // Positions between opener and hero fold
  for (let i = openerIdx + 1; i < heroIdx; i++) {
    const pos = PREFLOP_ACTION_ORDER[i];
    history.push({ position: pos, action: 'fold' });
  }

  return history;
}

/**
 * Build the action history for a VS_3BET scenario.
 * Hero opened, 3-bettor raised, everyone else folded, hero faces 3-bet.
 */
export function buildVs3BetActionHistory(
  heroOpenerPosition: Position,
  threeBettorPosition: Position,
  openRaiseBB: number,
  threeBetBB: number
): ActionEvent[] {
  const history: ActionEvent[] = [];
  const heroIdx = getPositionIndex(heroOpenerPosition);
  const threeBettorIdx = getPositionIndex(threeBettorPosition);

  // Positions before hero (opener) fold
  for (let i = 0; i < heroIdx; i++) {
    const pos = PREFLOP_ACTION_ORDER[i];
    if (pos !== 'SB' && pos !== 'BB') {
      history.push({ position: pos, action: 'fold' });
    }
  }

  // Hero opens
  history.push({ position: heroOpenerPosition, action: 'raise', amountBB: openRaiseBB });

  // Positions between hero and 3-bettor fold
  for (let i = heroIdx + 1; i < threeBettorIdx; i++) {
    const pos = PREFLOP_ACTION_ORDER[i];
    history.push({ position: pos, action: 'fold' });
  }

  // 3-bettor re-raises
  history.push({ position: threeBettorPosition, action: 'raise', amountBB: threeBetBB });

  // Positions after 3-bettor fold (before action returns to hero)
  for (let i = threeBettorIdx + 1; i < 9; i++) {
    const pos = PREFLOP_ACTION_ORDER[i];
    // Don't fold positions that haven't acted yet or are the hero
    if (pos !== heroOpenerPosition) {
      history.push({ position: pos, action: 'fold' });
    }
  }

  return history;
}

/**
 * Add blind postings to the beginning of action history for display.
 */
export function addBlindsToHistory(history: ActionEvent[]): ActionEvent[] {
  const withBlinds: ActionEvent[] = [
    { position: 'SB', action: 'blind', amountBB: 0.5 },
    { position: 'BB', action: 'blind', amountBB: 1 },
    ...history,
  ];
  return withBlinds;
}
