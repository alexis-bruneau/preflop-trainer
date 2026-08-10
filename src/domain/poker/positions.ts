/**
 * positions.ts
 * Position definitions, ordering, and utilities for 9-max NLHE.
 */

// ─── Position Enum ────────────────────────────────────────────────────────────

export const POSITIONS = ['UTG', 'UTG1', 'MP', 'LJ', 'HJ', 'CO', 'BTN', 'SB', 'BB'] as const;
export type Position = (typeof POSITIONS)[number];

export const POSITION_DISPLAY_NAMES: Record<Position, string> = {
  UTG: 'UTG',
  UTG1: 'UTG+1',
  MP: 'MP',
  LJ: 'LJ',
  HJ: 'HJ',
  CO: 'CO',
  BTN: 'BTN',
  SB: 'SB',
  BB: 'BB',
};

export const POSITION_FULL_NAMES: Record<Position, string> = {
  UTG: 'Under the Gun',
  UTG1: 'UTG+1',
  MP: 'Middle Position',
  LJ: 'Lojack',
  HJ: 'Hijack',
  CO: 'Cutoff',
  BTN: 'Button',
  SB: 'Small Blind',
  BB: 'Big Blind',
};

// ─── Preflop Action Order ─────────────────────────────────────────────────────

/**
 * 9-max preflop action order (UTG acts first, BB acts last preflop).
 * This is the standard positions array ordered by action sequence.
 */
export const PREFLOP_ACTION_ORDER: Position[] = [
  'UTG', 'UTG1', 'MP', 'LJ', 'HJ', 'CO', 'BTN', 'SB', 'BB'
];

export const POSITION_INDEX: Record<Position, number> = Object.fromEntries(
  PREFLOP_ACTION_ORDER.map((p, i) => [p, i])
) as Record<Position, number>;

/**
 * Returns the index of a position in preflop action order.
 * 0 = UTG (first to act), 8 = BB (last to act preflop).
 */
export function getPositionIndex(position: Position): number {
  return POSITION_INDEX[position];
}

/**
 * Returns all positions that act BEFORE the given hero position.
 * e.g. heroPosition = 'HJ' → ['UTG', 'UTG1', 'MP', 'LJ']
 */
export function getPositionsActingBefore(heroPosition: Position): Position[] {
  const idx = getPositionIndex(heroPosition);
  return PREFLOP_ACTION_ORDER.slice(0, idx);
}

/**
 * Returns all positions that act AFTER the given hero position (preflop).
 */
export function getPositionsActingAfter(heroPosition: Position): Position[] {
  const idx = getPositionIndex(heroPosition);
  return PREFLOP_ACTION_ORDER.slice(idx + 1);
}

// ─── Table Seat Layout ────────────────────────────────────────────────────────

/**
 * Visual seat order around the poker table, clockwise from BTN.
 * BTN is at top-right, action flows clockwise.
 * 
 * Standard visual layout for 9-max (hero always shown at bottom):
 * Seat 0 = SB (bottom-left of BTN)
 * Seat 1 = BB (left side)
 * Seat 2 = UTG (upper-left)
 * Seat 3 = UTG1 (top-left)
 * Seat 4 = MP (top)
 * Seat 5 = LJ (top-right)
 * Seat 6 = HJ (right)
 * Seat 7 = CO (bottom-right)
 * Seat 8 = BTN (bottom)
 * 
 * For display, we rotate so HERO is always at bottom center.
 */
export const VISUAL_SEAT_ORDER: Position[] = [
  'BTN', 'SB', 'BB', 'UTG', 'UTG1', 'MP', 'LJ', 'HJ', 'CO'
];

/**
 * Get the visual seat index (0-8) for a position when hero is at seat heroSeatIndex.
 * Returns positions arranged clockwise around the table.
 */
export function getVisualSeats(heroPosition: Position): Array<{ position: Position; seatIndex: number; isHero: boolean }> {
  const HERO_VISUAL_INDEX = 4; // bottom center in a 9-seat layout
  const heroIdx = VISUAL_SEAT_ORDER.indexOf(heroPosition);
  
  return VISUAL_SEAT_ORDER.map((position, i) => {
    // Rotate so hero lands at HERO_VISUAL_INDEX
    const rawOffset = (i - heroIdx + 9) % 9;
    const seatIndex = (HERO_VISUAL_INDEX + rawOffset) % 9;
    return {
      position,
      seatIndex,
      isHero: position === heroPosition,
    };
  });
}

// ─── RFI Positions ────────────────────────────────────────────────────────────

/**
 * Positions that can raise first in (everyone before them folds).
 * BB can't RFI in a traditional sense (they'd just check), so we exclude them.
 * SB can RFI vs BB.
 */
export const RFI_POSITIONS: Position[] = ['UTG', 'UTG1', 'MP', 'LJ', 'HJ', 'CO', 'BTN', 'SB'];

// ─── Blind Positions ──────────────────────────────────────────────────────────

export const BLIND_POSITIONS: Position[] = ['SB', 'BB'];
export const SMALL_BLIND: Position = 'SB';
export const BIG_BLIND: Position = 'BB';

export const BLIND_AMOUNTS: Partial<Record<Position, number>> = {
  SB: 0.5,
  BB: 1,
};

// ─── Valid Opponent Combinations ──────────────────────────────────────────────

/**
 * Returns all valid (opener, hero) pairs for VS_RFI scenarios.
 * Hero must act after the opener.
 */
export function getValidVsRfiCombinations(): Array<{ opener: Position; hero: Position }> {
  const pairs: Array<{ opener: Position; hero: Position }> = [];
  
  for (const opener of RFI_POSITIONS) {
    const openerIdx = getPositionIndex(opener);
    // Hero can be any position that acts after the opener
    for (const hero of PREFLOP_ACTION_ORDER) {
      if (getPositionIndex(hero) > openerIdx) {
        pairs.push({ opener, hero });
      }
    }
  }
  
  return pairs;
}

/**
 * Returns all valid (original_opener, three_bettor, hero) triples for VS_3BET scenarios.
 * In VS_3BET, hero = original opener who faces the 3-bet.
 * Original opener opens, someone after them 3-bets, action returns to opener.
 */
export function getValidVs3BetCombinations(): Array<{ heroOpener: Position; threeBettor: Position }> {
  const triples: Array<{ heroOpener: Position; threeBettor: Position }> = [];
  
  for (const opener of RFI_POSITIONS) {
    const openerIdx = getPositionIndex(opener);
    // 3-bettor must act after the opener
    for (const threeBettor of PREFLOP_ACTION_ORDER) {
      if (getPositionIndex(threeBettor) > openerIdx) {
        triples.push({ heroOpener: opener, threeBettor });
      }
    }
  }
  
  return triples;
}
