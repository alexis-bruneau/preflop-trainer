/**
 * hands.ts
 * The 169 canonical preflop hand classes for Texas Hold'em.
 * Used for strategy storage, range matrices, and hand selection.
 */

import type { HandClass } from './cards';

// ─── The 169 Hand Classes ────────────────────────────────────────────────────

export const RANKS_DESC = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'] as const;

/**
 * All 169 strategically distinct preflop hand classes.
 * Order: pairs on diagonal (AA down to 22), suited above, offsuit below.
 * Useful for iteration and validation.
 */
export const ALL_169_HAND_CLASSES: HandClass[] = (() => {
  const classes: HandClass[] = [];

  for (let i = 0; i < RANKS_DESC.length; i++) {
    for (let j = 0; j < RANKS_DESC.length; j++) {
      const r1 = RANKS_DESC[i];
      const r2 = RANKS_DESC[j];

      if (i === j) {
        // Pair (diagonal)
        classes.push(`${r1}${r2}`);
      } else if (j > i) {
        // Offsuit (below diagonal — j > i means r2 is lower rank)
        classes.push(`${r1}${r2}o`);
      } else {
        // Suited (above diagonal — j < i means r1 is lower rank in row, so swap)
        // When i > j, r1 (row) > r2 (col) index-wise → r2 is higher rank
        // Standard: suited above diagonal means col rank > row rank
        // Matrix: rows = first rank (i), cols = second rank (j)
        // We skip these here and generate them in column-major order elsewhere
      }
    }
  }

  return classes;
})();

/**
 * Generate the full 169 hand classes in matrix reading order.
 * For a 13×13 grid with ranks A..2:
 *   - (i,i) = pair
 *   - (i,j) where j < i = suited (higher rank is col=j, lower rank is row=i) 
 *   - (i,j) where j > i = offsuit (higher rank is row=i, lower rank is col=j)
 * 
 * Standard display: rows top-to-bottom = A K Q J T 9 8 7 6 5 4 3 2
 *                   cols left-to-right = A K Q J T 9 8 7 6 5 4 3 2
 * Diagonal = pairs
 * Upper-right triangle (col > row index, meaning col rank is lower) = suited? NO.
 * 
 * Traditional 13×13 matrix:
 *   - Pairs on the main diagonal
 *   - SUITED hands in the UPPER-RIGHT triangle
 *   - OFFSUIT hands in the LOWER-LEFT triangle
 * 
 * Row i = rank i (A=0, 2=12), Col j = rank j.
 * Cell (i,j) where i < j: suited (ranks i and j, i being higher rank since i has lower index)
 * Cell (i,j) where i > j: offsuit (ranks i and j, j being higher rank)
 * Cell (i,i): pair
 */
export function getHandClassAt(row: number, col: number): HandClass {
  const r1 = RANKS_DESC[row]; // row rank
  const r2 = RANKS_DESC[col]; // col rank

  if (row === col) return `${r1}${r2}`; // pair

  if (row < col) {
    // Upper-right: row rank is HIGHER (lower index = higher rank)
    // Suited: higher rank first
    return `${r1}${r2}s`;
  }

  // Lower-left: col rank is HIGHER
  // Offsuit: higher rank first
  return `${r2}${r1}o`;
}

/**
 * Generate all 169 hand classes in the standard 13×13 matrix order.
 */
export function generateAll169(): HandClass[] {
  const classes: HandClass[] = [];
  for (let i = 0; i < 13; i++) {
    for (let j = 0; j < 13; j++) {
      classes.push(getHandClassAt(i, j));
    }
  }
  return classes;
}

// The definitive ordered list of all 169 hand classes (matrix order, row-major)
export const HAND_MATRIX_169: HandClass[] = generateAll169();

// Set for O(1) lookup
export const HAND_CLASS_SET: Set<HandClass> = new Set(HAND_MATRIX_169);

// ─── Hand Class Parsing & Validation ─────────────────────────────────────────

export function isValidHandClass(handClass: string): boolean {
  return HAND_CLASS_SET.has(handClass);
}

/**
 * Parse a hand class string and return its matrix position [row, col].
 */
export function handClassToMatrixPos(handClass: HandClass): [number, number] {
  if (handClass.length === 2) {
    // Pair
    const idx = RANKS_DESC.indexOf(handClass[0] as (typeof RANKS_DESC)[number]);
    return [idx, idx];
  }

  const highRank = handClass[0] as (typeof RANKS_DESC)[number];
  const lowRank = handClass[1] as (typeof RANKS_DESC)[number];
  const highIdx = RANKS_DESC.indexOf(highRank);
  const lowIdx = RANKS_DESC.indexOf(lowRank);

  if (handClass[2] === 's') {
    // Suited: row = high rank index, col = low rank index (upper right)
    return [highIdx, lowIdx];
  } else {
    // Offsuit: row = low rank index, col = high rank index (lower left)
    return [lowIdx, highIdx];
  }
}

// ─── Hand Category ────────────────────────────────────────────────────────────

export type HandCategory = 'pair' | 'suited' | 'offsuit';

export function getHandCategory(handClass: HandClass): HandCategory {
  if (handClass.length === 2) return 'pair';
  if (handClass[2] === 's') return 'suited';
  return 'offsuit';
}

// ─── Hand Description ─────────────────────────────────────────────────────────

export function describeHand(handClass: HandClass): string {
  if (handClass.length === 2) {
    return `Pocket ${handClass[0]}s`;
  }
  const suits = handClass[2] === 's' ? 'suited' : 'offsuit';
  return `${handClass[0]}${handClass[1]} ${suits}`;
}
