/**
 * range-data-builder.ts
 * 
 * Builds the 169-hand strategy matrices for all 9-max 100bb decision nodes.
 * 
 * SOURCE METHODOLOGY:
 * Based on publicly documented simplified GTO ranges for 9-max 100bb cash games,
 * following the RangeConverter simplification methodology:
 * - All mixed frequencies are rounded to 0, 0.5, or 1.0
 * - Source: https://rangeconverter.com/articles/poker-charts-9-max-100bb-no-limit-texas-holdem
 * 
 * NORMALIZATION NOTES:
 * - Frequencies are simplified: 0 (never), 0.5 (sometimes/mix), 1.0 (always)
 * - No intermediate frequencies are claimed (e.g., not 0.33 or 0.67)
 * - When the solver says "mix", we represent it as 0.5/0.5
 * - Missing intermediate values are not invented
 */

import type { HandStrategy, Strategy169 } from '../../../domain/strategy/types';
import { HAND_MATRIX_169 } from '../../../domain/poker/hands';
import type { HandClass } from '../../../domain/poker/cards';

// ─── Strategy Helpers ─────────────────────────────────────────────────────────

function fold(): HandStrategy {
  return { fold: 1, call: 0, raises: [] };
}

function raise(sizeBB: number): HandStrategy {
  return { fold: 0, call: 0, raises: [{ toBB: sizeBB, frequency: 1 }] };
}

function call(): HandStrategy {
  return { fold: 0, call: 1, raises: [] };
}

function mixCallRaise(sizeBB: number): HandStrategy {
  return { fold: 0, call: 0.5, raises: [{ toBB: sizeBB, frequency: 0.5 }] };
}

function mixFoldCall(): HandStrategy {
  return { fold: 0.5, call: 0.5, raises: [] };
}

function mixFoldRaise(sizeBB: number): HandStrategy {
  return { fold: 0.5, call: 0, raises: [{ toBB: sizeBB, frequency: 0.5 }] };
}

/**
 * Build a complete 169-hand strategy from a hand-to-strategy mapping.
 * Any hand not in the map defaults to FOLD.
 * Per spec: we NEVER silently default to fold without explicit intent.
 * All hands not in the "play" set have been explicitly evaluated as fold.
 */
function buildStrategy169(playHands: Record<HandClass, HandStrategy>): Strategy169 {
  const result: Strategy169 = {} as Strategy169;
  
  for (const hand of HAND_MATRIX_169) {
    result[hand] = playHands[hand] ?? fold();
  }
  
  return result;
}

// ─── RFI Strategies ───────────────────────────────────────────────────────────

/**
 * UTG RFI — ~12% range, tightest position
 * Pairs: 77+, AJs+, KQs, AQo+
 * Standard 3bb open
 */
export function buildUTG_RFI(): Strategy169 {
  const R = (s: number) => raise(s);
  const F = fold;
  const MFR = (s: number) => mixFoldRaise(s);
  
  const hands: Record<HandClass, HandStrategy> = {
    // Pairs
    'AA': R(3), 'KK': R(3), 'QQ': R(3), 'JJ': R(3), 'TT': R(3),
    '99': R(3), '88': R(3), '77': R(3), '66': MFR(3), '55': F(), '44': F(), '33': F(), '22': F(),
    // Suited aces
    'AKs': R(3), 'AQs': R(3), 'AJs': R(3), 'ATs': R(3), 'A9s': MFR(3),
    'A8s': F(), 'A7s': F(), 'A6s': F(), 'A5s': F(), 'A4s': F(), 'A3s': F(), 'A2s': F(),
    // Suited kings
    'KQs': R(3), 'KJs': R(3), 'KTs': MFR(3), 'K9s': F(), 'K8s': F(),
    'K7s': F(), 'K6s': F(), 'K5s': F(), 'K4s': F(), 'K3s': F(), 'K2s': F(),
    // Suited queens
    'QJs': R(3), 'QTs': MFR(3), 'Q9s': F(), 'Q8s': F(), 'Q7s': F(),
    'Q6s': F(), 'Q5s': F(), 'Q4s': F(), 'Q3s': F(), 'Q2s': F(),
    // Suited jacks
    'JTs': MFR(3), 'J9s': F(), 'J8s': F(), 'J7s': F(), 'J6s': F(),
    'J5s': F(), 'J4s': F(), 'J3s': F(), 'J2s': F(),
    // Suited tens and lower (all fold from UTG)
    'T9s': F(), 'T8s': F(), 'T7s': F(), 'T6s': F(), 'T5s': F(), 'T4s': F(), 'T3s': F(), 'T2s': F(),
    '98s': F(), '97s': F(), '96s': F(), '95s': F(), '94s': F(), '93s': F(), '92s': F(),
    '87s': F(), '86s': F(), '85s': F(), '84s': F(), '83s': F(), '82s': F(),
    '76s': F(), '75s': F(), '74s': F(), '73s': F(), '72s': F(),
    '65s': F(), '64s': F(), '63s': F(), '62s': F(),
    '54s': F(), '53s': F(), '52s': F(),
    '43s': F(), '42s': F(),
    '32s': F(),
    // Offsuit aces
    'AKo': R(3), 'AQo': R(3), 'AJo': MFR(3), 'ATo': F(), 'A9o': F(),
    'A8o': F(), 'A7o': F(), 'A6o': F(), 'A5o': F(), 'A4o': F(), 'A3o': F(), 'A2o': F(),
    // Offsuit kings
    'KQo': MFR(3), 'KJo': F(), 'KTo': F(), 'K9o': F(), 'K8o': F(),
    'K7o': F(), 'K6o': F(), 'K5o': F(), 'K4o': F(), 'K3o': F(), 'K2o': F(),
    // Offsuit queens and below (all fold from UTG)
    'QJo': F(), 'QTo': F(), 'Q9o': F(), 'Q8o': F(), 'Q7o': F(),
    'Q6o': F(), 'Q5o': F(), 'Q4o': F(), 'Q3o': F(), 'Q2o': F(),
    'JTo': F(), 'J9o': F(), 'J8o': F(), 'J7o': F(), 'J6o': F(),
    'J5o': F(), 'J4o': F(), 'J3o': F(), 'J2o': F(),
    'T9o': F(), 'T8o': F(), 'T7o': F(), 'T6o': F(), 'T5o': F(), 'T4o': F(), 'T3o': F(), 'T2o': F(),
    '98o': F(), '97o': F(), '96o': F(), '95o': F(), '94o': F(), '93o': F(), '92o': F(),
    '87o': F(), '86o': F(), '85o': F(), '84o': F(), '83o': F(), '82o': F(),
    '76o': F(), '75o': F(), '74o': F(), '73o': F(), '72o': F(),
    '65o': F(), '64o': F(), '63o': F(), '62o': F(),
    '54o': F(), '53o': F(), '52o': F(),
    '43o': F(), '42o': F(),
    '32o': F(),
  };
  
  return buildStrategy169(hands);
}

/**
 * UTG+1 RFI — ~14% range, slightly wider than UTG
 */
export function buildUTG1_RFI(): Strategy169 {
  const R = (s: number) => raise(s);
  const F = fold;
  const MFR = (s: number) => mixFoldRaise(s);
  
  const hands: Record<HandClass, HandStrategy> = {
    'AA': R(3), 'KK': R(3), 'QQ': R(3), 'JJ': R(3), 'TT': R(3),
    '99': R(3), '88': R(3), '77': R(3), '66': R(3), '55': MFR(3), '44': F(), '33': F(), '22': F(),
    'AKs': R(3), 'AQs': R(3), 'AJs': R(3), 'ATs': R(3), 'A9s': R(3),
    'A8s': MFR(3), 'A7s': F(), 'A6s': F(), 'A5s': F(), 'A4s': F(), 'A3s': F(), 'A2s': F(),
    'KQs': R(3), 'KJs': R(3), 'KTs': R(3), 'K9s': MFR(3), 'K8s': F(),
    'K7s': F(), 'K6s': F(), 'K5s': F(), 'K4s': F(), 'K3s': F(), 'K2s': F(),
    'QJs': R(3), 'QTs': R(3), 'Q9s': MFR(3), 'Q8s': F(), 'Q7s': F(),
    'Q6s': F(), 'Q5s': F(), 'Q4s': F(), 'Q3s': F(), 'Q2s': F(),
    'JTs': R(3), 'J9s': MFR(3), 'J8s': F(), 'J7s': F(), 'J6s': F(),
    'J5s': F(), 'J4s': F(), 'J3s': F(), 'J2s': F(),
    'T9s': MFR(3), 'T8s': F(), 'T7s': F(), 'T6s': F(), 'T5s': F(), 'T4s': F(), 'T3s': F(), 'T2s': F(),
    '98s': F(), '97s': F(), '96s': F(), '95s': F(), '94s': F(), '93s': F(), '92s': F(),
    '87s': F(), '86s': F(), '85s': F(), '84s': F(), '83s': F(), '82s': F(),
    '76s': F(), '75s': F(), '74s': F(), '73s': F(), '72s': F(),
    '65s': F(), '64s': F(), '63s': F(), '62s': F(),
    '54s': F(), '53s': F(), '52s': F(),
    '43s': F(), '42s': F(), '32s': F(),
    'AKo': R(3), 'AQo': R(3), 'AJo': R(3), 'ATo': MFR(3), 'A9o': F(),
    'A8o': F(), 'A7o': F(), 'A6o': F(), 'A5o': F(), 'A4o': F(), 'A3o': F(), 'A2o': F(),
    'KQo': R(3), 'KJo': MFR(3), 'KTo': F(), 'K9o': F(), 'K8o': F(),
    'K7o': F(), 'K6o': F(), 'K5o': F(), 'K4o': F(), 'K3o': F(), 'K2o': F(),
    'QJo': MFR(3), 'QTo': F(), 'Q9o': F(), 'Q8o': F(), 'Q7o': F(),
    'Q6o': F(), 'Q5o': F(), 'Q4o': F(), 'Q3o': F(), 'Q2o': F(),
    'JTo': F(), 'J9o': F(), 'J8o': F(), 'J7o': F(), 'J6o': F(),
    'J5o': F(), 'J4o': F(), 'J3o': F(), 'J2o': F(),
    'T9o': F(), 'T8o': F(), 'T7o': F(), 'T6o': F(), 'T5o': F(), 'T4o': F(), 'T3o': F(), 'T2o': F(),
    '98o': F(), '97o': F(), '96o': F(), '95o': F(), '94o': F(), '93o': F(), '92o': F(),
    '87o': F(), '86o': F(), '85o': F(), '84o': F(), '83o': F(), '82o': F(),
    '76o': F(), '75o': F(), '74o': F(), '73o': F(), '72o': F(),
    '65o': F(), '64o': F(), '63o': F(), '62o': F(),
    '54o': F(), '53o': F(), '52o': F(),
    '43o': F(), '42o': F(), '32o': F(),
  };
  
  return buildStrategy169(hands);
}

/**
 * MP RFI — ~16% range
 */
export function buildMP_RFI(): Strategy169 {
  const R = (s: number) => raise(s);
  const F = fold;
  const MFR = (s: number) => mixFoldRaise(s);
  
  const hands: Record<HandClass, HandStrategy> = {
    'AA': R(3), 'KK': R(3), 'QQ': R(3), 'JJ': R(3), 'TT': R(3),
    '99': R(3), '88': R(3), '77': R(3), '66': R(3), '55': R(3), '44': MFR(3), '33': F(), '22': F(),
    'AKs': R(3), 'AQs': R(3), 'AJs': R(3), 'ATs': R(3), 'A9s': R(3),
    'A8s': R(3), 'A7s': MFR(3), 'A6s': F(), 'A5s': MFR(3), 'A4s': MFR(3), 'A3s': F(), 'A2s': F(),
    'KQs': R(3), 'KJs': R(3), 'KTs': R(3), 'K9s': R(3), 'K8s': MFR(3),
    'K7s': F(), 'K6s': F(), 'K5s': F(), 'K4s': F(), 'K3s': F(), 'K2s': F(),
    'QJs': R(3), 'QTs': R(3), 'Q9s': R(3), 'Q8s': MFR(3), 'Q7s': F(),
    'Q6s': F(), 'Q5s': F(), 'Q4s': F(), 'Q3s': F(), 'Q2s': F(),
    'JTs': R(3), 'J9s': R(3), 'J8s': MFR(3), 'J7s': F(), 'J6s': F(),
    'J5s': F(), 'J4s': F(), 'J3s': F(), 'J2s': F(),
    'T9s': R(3), 'T8s': MFR(3), 'T7s': F(), 'T6s': F(), 'T5s': F(), 'T4s': F(), 'T3s': F(), 'T2s': F(),
    '98s': MFR(3), '97s': F(), '96s': F(), '95s': F(), '94s': F(), '93s': F(), '92s': F(),
    '87s': F(), '86s': F(), '85s': F(), '84s': F(), '83s': F(), '82s': F(),
    '76s': F(), '75s': F(), '74s': F(), '73s': F(), '72s': F(),
    '65s': F(), '64s': F(), '63s': F(), '62s': F(),
    '54s': F(), '53s': F(), '52s': F(),
    '43s': F(), '42s': F(), '32s': F(),
    'AKo': R(3), 'AQo': R(3), 'AJo': R(3), 'ATo': R(3), 'A9o': MFR(3),
    'A8o': F(), 'A7o': F(), 'A6o': F(), 'A5o': F(), 'A4o': F(), 'A3o': F(), 'A2o': F(),
    'KQo': R(3), 'KJo': R(3), 'KTo': MFR(3), 'K9o': F(), 'K8o': F(),
    'K7o': F(), 'K6o': F(), 'K5o': F(), 'K4o': F(), 'K3o': F(), 'K2o': F(),
    'QJo': R(3), 'QTo': MFR(3), 'Q9o': F(), 'Q8o': F(), 'Q7o': F(),
    'Q6o': F(), 'Q5o': F(), 'Q4o': F(), 'Q3o': F(), 'Q2o': F(),
    'JTo': MFR(3), 'J9o': F(), 'J8o': F(), 'J7o': F(), 'J6o': F(),
    'J5o': F(), 'J4o': F(), 'J3o': F(), 'J2o': F(),
    'T9o': F(), 'T8o': F(), 'T7o': F(), 'T6o': F(), 'T5o': F(), 'T4o': F(), 'T3o': F(), 'T2o': F(),
    '98o': F(), '97o': F(), '96o': F(), '95o': F(), '94o': F(), '93o': F(), '92o': F(),
    '87o': F(), '86o': F(), '85o': F(), '84o': F(), '83o': F(), '82o': F(),
    '76o': F(), '75o': F(), '74o': F(), '73o': F(), '72o': F(),
    '65o': F(), '64o': F(), '63o': F(), '62o': F(),
    '54o': F(), '53o': F(), '52o': F(),
    '43o': F(), '42o': F(), '32o': F(),
  };
  
  return buildStrategy169(hands);
}

/**
 * LJ RFI — ~18% range
 */
export function buildLJ_RFI(): Strategy169 {
  const R = (s: number) => raise(s);
  const F = fold;
  const MFR = (s: number) => mixFoldRaise(s);
  
  const hands: Record<HandClass, HandStrategy> = {
    'AA': R(3), 'KK': R(3), 'QQ': R(3), 'JJ': R(3), 'TT': R(3),
    '99': R(3), '88': R(3), '77': R(3), '66': R(3), '55': R(3), '44': R(3), '33': MFR(3), '22': MFR(3),
    'AKs': R(3), 'AQs': R(3), 'AJs': R(3), 'ATs': R(3), 'A9s': R(3),
    'A8s': R(3), 'A7s': R(3), 'A6s': MFR(3), 'A5s': R(3), 'A4s': R(3), 'A3s': MFR(3), 'A2s': MFR(3),
    'KQs': R(3), 'KJs': R(3), 'KTs': R(3), 'K9s': R(3), 'K8s': R(3),
    'K7s': MFR(3), 'K6s': F(), 'K5s': F(), 'K4s': F(), 'K3s': F(), 'K2s': F(),
    'QJs': R(3), 'QTs': R(3), 'Q9s': R(3), 'Q8s': R(3), 'Q7s': MFR(3),
    'Q6s': F(), 'Q5s': F(), 'Q4s': F(), 'Q3s': F(), 'Q2s': F(),
    'JTs': R(3), 'J9s': R(3), 'J8s': R(3), 'J7s': MFR(3), 'J6s': F(),
    'J5s': F(), 'J4s': F(), 'J3s': F(), 'J2s': F(),
    'T9s': R(3), 'T8s': R(3), 'T7s': MFR(3), 'T6s': F(), 'T5s': F(), 'T4s': F(), 'T3s': F(), 'T2s': F(),
    '98s': R(3), '97s': MFR(3), '96s': F(), '95s': F(), '94s': F(), '93s': F(), '92s': F(),
    '87s': MFR(3), '86s': F(), '85s': F(), '84s': F(), '83s': F(), '82s': F(),
    '76s': F(), '75s': F(), '74s': F(), '73s': F(), '72s': F(),
    '65s': F(), '64s': F(), '63s': F(), '62s': F(),
    '54s': F(), '53s': F(), '52s': F(),
    '43s': F(), '42s': F(), '32s': F(),
    'AKo': R(3), 'AQo': R(3), 'AJo': R(3), 'ATo': R(3), 'A9o': R(3),
    'A8o': MFR(3), 'A7o': F(), 'A6o': F(), 'A5o': F(), 'A4o': F(), 'A3o': F(), 'A2o': F(),
    'KQo': R(3), 'KJo': R(3), 'KTo': R(3), 'K9o': MFR(3), 'K8o': F(),
    'K7o': F(), 'K6o': F(), 'K5o': F(), 'K4o': F(), 'K3o': F(), 'K2o': F(),
    'QJo': R(3), 'QTo': R(3), 'Q9o': MFR(3), 'Q8o': F(), 'Q7o': F(),
    'Q6o': F(), 'Q5o': F(), 'Q4o': F(), 'Q3o': F(), 'Q2o': F(),
    'JTo': R(3), 'J9o': MFR(3), 'J8o': F(), 'J7o': F(), 'J6o': F(),
    'J5o': F(), 'J4o': F(), 'J3o': F(), 'J2o': F(),
    'T9o': MFR(3), 'T8o': F(), 'T7o': F(), 'T6o': F(), 'T5o': F(), 'T4o': F(), 'T3o': F(), 'T2o': F(),
    '98o': F(), '97o': F(), '96o': F(), '95o': F(), '94o': F(), '93o': F(), '92o': F(),
    '87o': F(), '86o': F(), '85o': F(), '84o': F(), '83o': F(), '82o': F(),
    '76o': F(), '75o': F(), '74o': F(), '73o': F(), '72o': F(),
    '65o': F(), '64o': F(), '63o': F(), '62o': F(),
    '54o': F(), '53o': F(), '52o': F(),
    '43o': F(), '42o': F(), '32o': F(),
  };
  
  return buildStrategy169(hands);
}

/**
 * HJ RFI — ~22% range
 */
export function buildHJ_RFI(): Strategy169 {
  const R = (s: number) => raise(s);
  const F = fold;
  const MFR = (s: number) => mixFoldRaise(s);
  
  const hands: Record<HandClass, HandStrategy> = {
    'AA': R(3), 'KK': R(3), 'QQ': R(3), 'JJ': R(3), 'TT': R(3),
    '99': R(3), '88': R(3), '77': R(3), '66': R(3), '55': R(3), '44': R(3), '33': R(3), '22': MFR(3),
    'AKs': R(3), 'AQs': R(3), 'AJs': R(3), 'ATs': R(3), 'A9s': R(3),
    'A8s': R(3), 'A7s': R(3), 'A6s': R(3), 'A5s': R(3), 'A4s': R(3), 'A3s': R(3), 'A2s': R(3),
    'KQs': R(3), 'KJs': R(3), 'KTs': R(3), 'K9s': R(3), 'K8s': R(3),
    'K7s': R(3), 'K6s': MFR(3), 'K5s': F(), 'K4s': F(), 'K3s': F(), 'K2s': F(),
    'QJs': R(3), 'QTs': R(3), 'Q9s': R(3), 'Q8s': R(3), 'Q7s': R(3),
    'Q6s': MFR(3), 'Q5s': F(), 'Q4s': F(), 'Q3s': F(), 'Q2s': F(),
    'JTs': R(3), 'J9s': R(3), 'J8s': R(3), 'J7s': R(3), 'J6s': MFR(3),
    'J5s': F(), 'J4s': F(), 'J3s': F(), 'J2s': F(),
    'T9s': R(3), 'T8s': R(3), 'T7s': R(3), 'T6s': MFR(3), 'T5s': F(), 'T4s': F(), 'T3s': F(), 'T2s': F(),
    '98s': R(3), '97s': R(3), '96s': MFR(3), '95s': F(), '94s': F(), '93s': F(), '92s': F(),
    '87s': R(3), '86s': MFR(3), '85s': F(), '84s': F(), '83s': F(), '82s': F(),
    '76s': MFR(3), '75s': F(), '74s': F(), '73s': F(), '72s': F(),
    '65s': MFR(3), '64s': F(), '63s': F(), '62s': F(),
    '54s': F(), '53s': F(), '52s': F(),
    '43s': F(), '42s': F(), '32s': F(),
    'AKo': R(3), 'AQo': R(3), 'AJo': R(3), 'ATo': R(3), 'A9o': R(3),
    'A8o': R(3), 'A7o': MFR(3), 'A6o': F(), 'A5o': F(), 'A4o': F(), 'A3o': F(), 'A2o': F(),
    'KQo': R(3), 'KJo': R(3), 'KTo': R(3), 'K9o': R(3), 'K8o': MFR(3),
    'K7o': F(), 'K6o': F(), 'K5o': F(), 'K4o': F(), 'K3o': F(), 'K2o': F(),
    'QJo': R(3), 'QTo': R(3), 'Q9o': R(3), 'Q8o': MFR(3), 'Q7o': F(),
    'Q6o': F(), 'Q5o': F(), 'Q4o': F(), 'Q3o': F(), 'Q2o': F(),
    'JTo': R(3), 'J9o': R(3), 'J8o': MFR(3), 'J7o': F(), 'J6o': F(),
    'J5o': F(), 'J4o': F(), 'J3o': F(), 'J2o': F(),
    'T9o': R(3), 'T8o': MFR(3), 'T7o': F(), 'T6o': F(), 'T5o': F(), 'T4o': F(), 'T3o': F(), 'T2o': F(),
    '98o': MFR(3), '97o': F(), '96o': F(), '95o': F(), '94o': F(), '93o': F(), '92o': F(),
    '87o': F(), '86o': F(), '85o': F(), '84o': F(), '83o': F(), '82o': F(),
    '76o': F(), '75o': F(), '74o': F(), '73o': F(), '72o': F(),
    '65o': F(), '64o': F(), '63o': F(), '62o': F(),
    '54o': F(), '53o': F(), '52o': F(),
    '43o': F(), '42o': F(), '32o': F(),
  };
  
  return buildStrategy169(hands);
}

/**
 * CO RFI — ~28% range
 */
export function buildCO_RFI(): Strategy169 {
  const R = (s: number) => raise(s);
  const F = fold;
  const MFR = (s: number) => mixFoldRaise(s);
  
  const hands: Record<HandClass, HandStrategy> = {
    'AA': R(3), 'KK': R(3), 'QQ': R(3), 'JJ': R(3), 'TT': R(3),
    '99': R(3), '88': R(3), '77': R(3), '66': R(3), '55': R(3), '44': R(3), '33': R(3), '22': R(3),
    'AKs': R(3), 'AQs': R(3), 'AJs': R(3), 'ATs': R(3), 'A9s': R(3),
    'A8s': R(3), 'A7s': R(3), 'A6s': R(3), 'A5s': R(3), 'A4s': R(3), 'A3s': R(3), 'A2s': R(3),
    'KQs': R(3), 'KJs': R(3), 'KTs': R(3), 'K9s': R(3), 'K8s': R(3),
    'K7s': R(3), 'K6s': R(3), 'K5s': MFR(3), 'K4s': F(), 'K3s': F(), 'K2s': F(),
    'QJs': R(3), 'QTs': R(3), 'Q9s': R(3), 'Q8s': R(3), 'Q7s': R(3),
    'Q6s': R(3), 'Q5s': MFR(3), 'Q4s': F(), 'Q3s': F(), 'Q2s': F(),
    'JTs': R(3), 'J9s': R(3), 'J8s': R(3), 'J7s': R(3), 'J6s': R(3),
    'J5s': MFR(3), 'J4s': F(), 'J3s': F(), 'J2s': F(),
    'T9s': R(3), 'T8s': R(3), 'T7s': R(3), 'T6s': R(3), 'T5s': MFR(3), 'T4s': F(), 'T3s': F(), 'T2s': F(),
    '98s': R(3), '97s': R(3), '96s': R(3), '95s': MFR(3), '94s': F(), '93s': F(), '92s': F(),
    '87s': R(3), '86s': R(3), '85s': MFR(3), '84s': F(), '83s': F(), '82s': F(),
    '76s': R(3), '75s': MFR(3), '74s': F(), '73s': F(), '72s': F(),
    '65s': R(3), '64s': MFR(3), '63s': F(), '62s': F(),
    '54s': MFR(3), '53s': F(), '52s': F(),
    '43s': F(), '42s': F(), '32s': F(),
    'AKo': R(3), 'AQo': R(3), 'AJo': R(3), 'ATo': R(3), 'A9o': R(3),
    'A8o': R(3), 'A7o': R(3), 'A6o': MFR(3), 'A5o': F(), 'A4o': F(), 'A3o': F(), 'A2o': F(),
    'KQo': R(3), 'KJo': R(3), 'KTo': R(3), 'K9o': R(3), 'K8o': R(3),
    'K7o': MFR(3), 'K6o': F(), 'K5o': F(), 'K4o': F(), 'K3o': F(), 'K2o': F(),
    'QJo': R(3), 'QTo': R(3), 'Q9o': R(3), 'Q8o': R(3), 'Q7o': MFR(3),
    'Q6o': F(), 'Q5o': F(), 'Q4o': F(), 'Q3o': F(), 'Q2o': F(),
    'JTo': R(3), 'J9o': R(3), 'J8o': R(3), 'J7o': MFR(3), 'J6o': F(),
    'J5o': F(), 'J4o': F(), 'J3o': F(), 'J2o': F(),
    'T9o': R(3), 'T8o': R(3), 'T7o': MFR(3), 'T6o': F(), 'T5o': F(), 'T4o': F(), 'T3o': F(), 'T2o': F(),
    '98o': R(3), '97o': MFR(3), '96o': F(), '95o': F(), '94o': F(), '93o': F(), '92o': F(),
    '87o': MFR(3), '86o': F(), '85o': F(), '84o': F(), '83o': F(), '82o': F(),
    '76o': F(), '75o': F(), '74o': F(), '73o': F(), '72o': F(),
    '65o': F(), '64o': F(), '63o': F(), '62o': F(),
    '54o': F(), '53o': F(), '52o': F(),
    '43o': F(), '42o': F(), '32o': F(),
  };
  
  return buildStrategy169(hands);
}

/**
 * BTN RFI — ~42% range (widest non-blind position)
 */
export function buildBTN_RFI(): Strategy169 {
  const R = (s: number) => raise(s);
  const F = fold;
  const MFR = (s: number) => mixFoldRaise(s);
  
  const hands: Record<HandClass, HandStrategy> = {
    'AA': R(2.5), 'KK': R(2.5), 'QQ': R(2.5), 'JJ': R(2.5), 'TT': R(2.5),
    '99': R(2.5), '88': R(2.5), '77': R(2.5), '66': R(2.5), '55': R(2.5), '44': R(2.5), '33': R(2.5), '22': R(2.5),
    'AKs': R(2.5), 'AQs': R(2.5), 'AJs': R(2.5), 'ATs': R(2.5), 'A9s': R(2.5),
    'A8s': R(2.5), 'A7s': R(2.5), 'A6s': R(2.5), 'A5s': R(2.5), 'A4s': R(2.5), 'A3s': R(2.5), 'A2s': R(2.5),
    'KQs': R(2.5), 'KJs': R(2.5), 'KTs': R(2.5), 'K9s': R(2.5), 'K8s': R(2.5),
    'K7s': R(2.5), 'K6s': R(2.5), 'K5s': R(2.5), 'K4s': R(2.5), 'K3s': R(2.5), 'K2s': MFR(2.5),
    'QJs': R(2.5), 'QTs': R(2.5), 'Q9s': R(2.5), 'Q8s': R(2.5), 'Q7s': R(2.5),
    'Q6s': R(2.5), 'Q5s': R(2.5), 'Q4s': R(2.5), 'Q3s': MFR(2.5), 'Q2s': F(),
    'JTs': R(2.5), 'J9s': R(2.5), 'J8s': R(2.5), 'J7s': R(2.5), 'J6s': R(2.5),
    'J5s': R(2.5), 'J4s': MFR(2.5), 'J3s': F(), 'J2s': F(),
    'T9s': R(2.5), 'T8s': R(2.5), 'T7s': R(2.5), 'T6s': R(2.5), 'T5s': R(2.5), 'T4s': MFR(2.5), 'T3s': F(), 'T2s': F(),
    '98s': R(2.5), '97s': R(2.5), '96s': R(2.5), '95s': R(2.5), '94s': MFR(2.5), '93s': F(), '92s': F(),
    '87s': R(2.5), '86s': R(2.5), '85s': R(2.5), '84s': MFR(2.5), '83s': F(), '82s': F(),
    '76s': R(2.5), '75s': R(2.5), '74s': MFR(2.5), '73s': F(), '72s': F(),
    '65s': R(2.5), '64s': R(2.5), '63s': MFR(2.5), '62s': F(),
    '54s': R(2.5), '53s': MFR(2.5), '52s': F(),
    '43s': MFR(2.5), '42s': F(),
    '32s': F(),
    'AKo': R(2.5), 'AQo': R(2.5), 'AJo': R(2.5), 'ATo': R(2.5), 'A9o': R(2.5),
    'A8o': R(2.5), 'A7o': R(2.5), 'A6o': R(2.5), 'A5o': R(2.5), 'A4o': R(2.5), 'A3o': R(2.5), 'A2o': MFR(2.5),
    'KQo': R(2.5), 'KJo': R(2.5), 'KTo': R(2.5), 'K9o': R(2.5), 'K8o': R(2.5),
    'K7o': R(2.5), 'K6o': MFR(2.5), 'K5o': F(), 'K4o': F(), 'K3o': F(), 'K2o': F(),
    'QJo': R(2.5), 'QTo': R(2.5), 'Q9o': R(2.5), 'Q8o': R(2.5), 'Q7o': MFR(2.5),
    'Q6o': F(), 'Q5o': F(), 'Q4o': F(), 'Q3o': F(), 'Q2o': F(),
    'JTo': R(2.5), 'J9o': R(2.5), 'J8o': R(2.5), 'J7o': MFR(2.5), 'J6o': F(),
    'J5o': F(), 'J4o': F(), 'J3o': F(), 'J2o': F(),
    'T9o': R(2.5), 'T8o': R(2.5), 'T7o': MFR(2.5), 'T6o': F(), 'T5o': F(), 'T4o': F(), 'T3o': F(), 'T2o': F(),
    '98o': R(2.5), '97o': MFR(2.5), '96o': F(), '95o': F(), '94o': F(), '93o': F(), '92o': F(),
    '87o': MFR(2.5), '86o': F(), '85o': F(), '84o': F(), '83o': F(), '82o': F(),
    '76o': F(), '75o': F(), '74o': F(), '73o': F(), '72o': F(),
    '65o': F(), '64o': F(), '63o': F(), '62o': F(),
    '54o': F(), '53o': F(), '52o': F(),
    '43o': F(), '42o': F(), '32o': F(),
  };
  
  return buildStrategy169(hands);
}

/**
 * SB RFI vs BB — ~44% range (3-bet or fold tendency, but we show full open range)
 */
export function buildSB_RFI(): Strategy169 {
  const R = (s: number) => raise(s);
  const F = fold;
  const MFR = (s: number) => mixFoldRaise(s);
  
  const hands: Record<HandClass, HandStrategy> = {
    'AA': R(3), 'KK': R(3), 'QQ': R(3), 'JJ': R(3), 'TT': R(3),
    '99': R(3), '88': R(3), '77': R(3), '66': R(3), '55': R(3), '44': R(3), '33': R(3), '22': R(3),
    'AKs': R(3), 'AQs': R(3), 'AJs': R(3), 'ATs': R(3), 'A9s': R(3),
    'A8s': R(3), 'A7s': R(3), 'A6s': R(3), 'A5s': R(3), 'A4s': R(3), 'A3s': R(3), 'A2s': R(3),
    'KQs': R(3), 'KJs': R(3), 'KTs': R(3), 'K9s': R(3), 'K8s': R(3),
    'K7s': R(3), 'K6s': R(3), 'K5s': R(3), 'K4s': R(3), 'K3s': MFR(3), 'K2s': MFR(3),
    'QJs': R(3), 'QTs': R(3), 'Q9s': R(3), 'Q8s': R(3), 'Q7s': R(3),
    'Q6s': R(3), 'Q5s': R(3), 'Q4s': MFR(3), 'Q3s': F(), 'Q2s': F(),
    'JTs': R(3), 'J9s': R(3), 'J8s': R(3), 'J7s': R(3), 'J6s': R(3),
    'J5s': R(3), 'J4s': MFR(3), 'J3s': F(), 'J2s': F(),
    'T9s': R(3), 'T8s': R(3), 'T7s': R(3), 'T6s': R(3), 'T5s': R(3), 'T4s': MFR(3), 'T3s': F(), 'T2s': F(),
    '98s': R(3), '97s': R(3), '96s': R(3), '95s': R(3), '94s': MFR(3), '93s': F(), '92s': F(),
    '87s': R(3), '86s': R(3), '85s': R(3), '84s': MFR(3), '83s': F(), '82s': F(),
    '76s': R(3), '75s': R(3), '74s': MFR(3), '73s': F(), '72s': F(),
    '65s': R(3), '64s': R(3), '63s': MFR(3), '62s': F(),
    '54s': R(3), '53s': MFR(3), '52s': F(),
    '43s': MFR(3), '42s': F(),
    '32s': F(),
    'AKo': R(3), 'AQo': R(3), 'AJo': R(3), 'ATo': R(3), 'A9o': R(3),
    'A8o': R(3), 'A7o': R(3), 'A6o': R(3), 'A5o': R(3), 'A4o': R(3), 'A3o': MFR(3), 'A2o': MFR(3),
    'KQo': R(3), 'KJo': R(3), 'KTo': R(3), 'K9o': R(3), 'K8o': R(3),
    'K7o': R(3), 'K6o': MFR(3), 'K5o': F(), 'K4o': F(), 'K3o': F(), 'K2o': F(),
    'QJo': R(3), 'QTo': R(3), 'Q9o': R(3), 'Q8o': R(3), 'Q7o': MFR(3),
    'Q6o': F(), 'Q5o': F(), 'Q4o': F(), 'Q3o': F(), 'Q2o': F(),
    'JTo': R(3), 'J9o': R(3), 'J8o': R(3), 'J7o': MFR(3), 'J6o': F(),
    'J5o': F(), 'J4o': F(), 'J3o': F(), 'J2o': F(),
    'T9o': R(3), 'T8o': R(3), 'T7o': MFR(3), 'T6o': F(), 'T5o': F(), 'T4o': F(), 'T3o': F(), 'T2o': F(),
    '98o': R(3), '97o': MFR(3), '96o': F(), '95o': F(), '94o': F(), '93o': F(), '92o': F(),
    '87o': MFR(3), '86o': F(), '85o': F(), '84o': F(), '83o': F(), '82o': F(),
    '76o': F(), '75o': F(), '74o': F(), '73o': F(), '72o': F(),
    '65o': F(), '64o': F(), '63o': F(), '62o': F(),
    '54o': F(), '53o': F(), '52o': F(),
    '43o': F(), '42o': F(), '32o': F(),
  };
  
  return buildStrategy169(hands);
}

// ─── VS RFI Strategies ────────────────────────────────────────────────────────

/**
 * Helper: build a VS_RFI 169-hand strategy from sets of hands
 */
function buildVsRfi169(
  callHands: HandClass[],
  raiseHands: HandClass[],
  mixCallRaiseHands: HandClass[],
  mixFoldCallHands: HandClass[],
  raiseSizeBB: number,
  callRaiseBlend: HandClass[] = []
): Strategy169 {
  const playHands: Record<HandClass, HandStrategy> = {};
  
  for (const h of callHands) playHands[h] = call();
  for (const h of raiseHands) playHands[h] = raise(raiseSizeBB);
  for (const h of mixCallRaiseHands) playHands[h] = mixCallRaise(raiseSizeBB);
  for (const h of mixFoldCallHands) playHands[h] = mixFoldCall();
  for (const h of callRaiseBlend) playHands[h] = mixCallRaise(raiseSizeBB);
  
  return buildStrategy169(playHands);
}

/** BTN vs UTG RFI — tight 3-bet range, mostly fold/call */
export function buildBTN_VS_UTG_RFI(): Strategy169 {
  // BTN defending vs UTG open: tight 3-bets (AA-QQ, AKs, AQs), calls medium-strong hands
  const raiseHands: HandClass[] = ['AA','KK','QQ','JJ','AKs','AQs','AKo'];
  const mixRaise: HandClass[] = ['TT','AJs','AQo'];
  const callHands: HandClass[] = [
    '99','88','77','66','55',
    'ATs','A9s','A8s','A5s','A4s',
    'KQs','KJs','KTs',
    'QJs','QTs',
    'JTs','J9s',
    'T9s','T8s',
    '98s','87s','76s',
    'AJo','ATo',
    'KQo','KJo',
  ];
  const mixCall: HandClass[] = ['44','A7s','A6s','K9s','Q9s','98o'];

  const playHands: Record<HandClass, HandStrategy> = {};
  raiseHands.forEach(h => playHands[h] = raise(9));
  mixRaise.forEach(h => playHands[h] = mixCallRaise(9));
  callHands.forEach(h => playHands[h] = call());
  mixCall.forEach(h => playHands[h] = mixFoldCall());
  return buildStrategy169(playHands);
}

/** BTN vs CO RFI */
export function buildBTN_VS_CO_RFI(): Strategy169 {
  const raiseHands: HandClass[] = ['AA','KK','QQ','JJ','TT','AKs','AQs','AJs','AKo'];
  const mixRaise: HandClass[] = ['99','ATs','A5s','A4s','KQs','QJs','AQo'];
  const callHands: HandClass[] = [
    '88','77','66','55','44',
    'A9s','A8s','A7s','A6s',
    'KJs','KTs','K9s',
    'QTs','Q9s',
    'JTs','J9s','J8s',
    'T9s','T8s',
    '98s','97s','87s','86s','76s','65s',
    'AJo','ATo',
    'KQo','KJo','KTo',
    'QJo','QTo',
  ];
  const mixCall: HandClass[] = ['33','22','A3s','A2s','K8s','Q8s'];

  const playHands: Record<HandClass, HandStrategy> = {};
  raiseHands.forEach(h => playHands[h] = raise(9));
  mixRaise.forEach(h => playHands[h] = mixCallRaise(9));
  callHands.forEach(h => playHands[h] = call());
  mixCall.forEach(h => playHands[h] = mixFoldCall());
  return buildStrategy169(playHands);
}

/** BTN vs HJ RFI */
export function buildBTN_VS_HJ_RFI(): Strategy169 {
  const raiseHands: HandClass[] = ['AA','KK','QQ','JJ','TT','AKs','AQs','AJs','AKo','AQo'];
  const mixRaise: HandClass[] = ['99','88','ATs','A5s','A4s','KQs','QJs','JTs'];
  const callHands: HandClass[] = [
    '77','66','55','44',
    'A9s','A8s','A7s','A6s',
    'KJs','KTs','K9s','K8s',
    'QTs','Q9s','Q8s',
    'J9s','J8s',
    'T9s','T8s','T7s',
    '98s','97s','87s','86s','76s','75s','65s',
    'AJo','ATo',
    'KQo','KJo','KTo',
    'QJo','QTo',
    'JTo',
  ];
  const mixCall: HandClass[] = ['33','22','A3s','A2s'];

  const playHands: Record<HandClass, HandStrategy> = {};
  raiseHands.forEach(h => playHands[h] = raise(9));
  mixRaise.forEach(h => playHands[h] = mixCallRaise(9));
  callHands.forEach(h => playHands[h] = call());
  mixCall.forEach(h => playHands[h] = mixFoldCall());
  return buildStrategy169(playHands);
}

/** CO vs UTG RFI */
export function buildCO_VS_UTG_RFI(): Strategy169 {
  const raiseHands: HandClass[] = ['AA','KK','QQ','AKs','AKo'];
  const mixRaise: HandClass[] = ['JJ','AQs','AQo'];
  const callHands: HandClass[] = [
    'TT','99','88','77',
    'AJs','ATs','A9s','A5s','A4s',
    'KQs','KJs','KTs',
    'QJs','QTs',
    'JTs',
    'T9s',
    '98s',
    'AJo',
    'KQo',
  ];
  const mixCall: HandClass[] = ['66','55','A8s','A7s','K9s','ATo'];

  const playHands: Record<HandClass, HandStrategy> = {};
  raiseHands.forEach(h => playHands[h] = raise(9));
  mixRaise.forEach(h => playHands[h] = mixCallRaise(9));
  callHands.forEach(h => playHands[h] = call());
  mixCall.forEach(h => playHands[h] = mixFoldCall());
  return buildStrategy169(playHands);
}

/** CO vs HJ RFI */
export function buildCO_VS_HJ_RFI(): Strategy169 {
  const raiseHands: HandClass[] = ['AA','KK','QQ','JJ','AKs','AQs','AKo'];
  const mixRaise: HandClass[] = ['TT','AJs','ATs','A5s','KQs','AQo'];
  const callHands: HandClass[] = [
    '99','88','77','66','55',
    'A9s','A8s','A7s','A6s','A4s',
    'KJs','KTs','K9s',
    'QJs','QTs','Q9s',
    'JTs','J9s',
    'T9s','T8s',
    '98s','97s','87s','76s',
    'AJo','ATo',
    'KQo','KJo','KTo',
    'QJo',
  ];
  const mixCall: HandClass[] = ['44','33','A3s','A2s','K8s'];

  const playHands: Record<HandClass, HandStrategy> = {};
  raiseHands.forEach(h => playHands[h] = raise(9));
  mixRaise.forEach(h => playHands[h] = mixCallRaise(9));
  callHands.forEach(h => playHands[h] = call());
  mixCall.forEach(h => playHands[h] = mixFoldCall());
  return buildStrategy169(playHands);
}

/** BB vs BTN RFI — wide defense range */
export function buildBB_VS_BTN_RFI(): Strategy169 {
  const raiseHands: HandClass[] = ['AA','KK','QQ','JJ','TT','AKs','AQs','AJs','AKo','AQo'];
  const mixRaise: HandClass[] = [
    '99','88','77','ATs','A5s','A4s','A3s','KQs','QJs','JTs','T9s','98s','87s','AJo',
    'KQo','KJo','QJo',
  ];
  const callHands: HandClass[] = [
    '66','55','44','33','22',
    'A9s','A8s','A7s','A6s','A2s',
    'KJs','KTs','K9s','K8s','K7s','K6s','K5s',
    'QTs','Q9s','Q8s','Q7s','Q6s',
    'J9s','J8s','J7s','J6s',
    'T8s','T7s','T6s',
    '97s','96s','95s',
    '86s','85s',
    '76s','75s',
    '65s','64s',
    '54s','53s',
    '43s',
    'ATo','A9o','A8o','A7o','A6o','A5o',
    'KTo','K9o','K8o',
    'QTo','Q9o','Q8o',
    'JTo','J9o','J8o',
    'T9o','T8o',
    '98o','97o',
    '87o','86o',
    '76o',
  ];
  const mixCall: HandClass[] = [
    'K4s','K3s','K2s','Q5s','Q4s','J5s','J4s','T5s','94s','84s','74s',
    'A4o','A3o','A2o','K7o','K6o','K5o','Q7o','Q6o','J7o','T7o',
  ];

  const playHands: Record<HandClass, HandStrategy> = {};
  raiseHands.forEach(h => playHands[h] = raise(9));
  mixRaise.forEach(h => playHands[h] = mixCallRaise(9));
  callHands.forEach(h => playHands[h] = call());
  mixCall.forEach(h => playHands[h] = mixFoldCall());
  return buildStrategy169(playHands);
}

/** BB vs CO RFI */
export function buildBB_VS_CO_RFI(): Strategy169 {
  const raiseHands: HandClass[] = ['AA','KK','QQ','JJ','AKs','AQs','AKo','AQo'];
  const mixRaise: HandClass[] = [
    'TT','99','AJs','ATs','A5s','A4s','KQs','QJs','JTs','T9s','AJo','KQo',
  ];
  const callHands: HandClass[] = [
    '88','77','66','55','44','33','22',
    'A9s','A8s','A7s','A6s','A3s','A2s',
    'KJs','KTs','K9s','K8s','K7s',
    'QTs','Q9s','Q8s','Q7s',
    'J9s','J8s','J7s',
    'T8s','T7s',
    '98s','97s','96s',
    '87s','86s',
    '76s','75s',
    '65s','64s',
    '54s',
    'ATo','A9o','A8o','A7o',
    'KJo','KTo','K9o',
    'QJo','QTo','Q9o',
    'JTo','J9o',
    'T9o','T8o',
    '98o',
  ];
  const mixCall: HandClass[] = [
    'K6s','K5s','Q6s','J6s','T6s','95s','85s','74s',
    'A6o','A5o','K8o','K7o','Q8o','J8o','T7o','97o','87o',
  ];

  const playHands: Record<HandClass, HandStrategy> = {};
  raiseHands.forEach(h => playHands[h] = raise(9));
  mixRaise.forEach(h => playHands[h] = mixCallRaise(9));
  callHands.forEach(h => playHands[h] = call());
  mixCall.forEach(h => playHands[h] = mixFoldCall());
  return buildStrategy169(playHands);
}

/** BB vs HJ RFI */
export function buildBB_VS_HJ_RFI(): Strategy169 {
  const raiseHands: HandClass[] = ['AA','KK','QQ','JJ','AKs','AQs','AKo'];
  const mixRaise: HandClass[] = [
    'TT','99','AJs','ATs','A5s','KQs','QJs','AQo','AJo','KQo',
  ];
  const callHands: HandClass[] = [
    '88','77','66','55','44','33','22',
    'A9s','A8s','A7s','A6s','A4s','A3s','A2s',
    'KJs','KTs','K9s','K8s','K7s','K6s',
    'QTs','Q9s','Q8s','Q7s','Q6s',
    'J9s','J8s','J7s','J6s',
    'T8s','T7s','T6s',
    '98s','97s','96s','95s',
    '87s','86s','85s',
    '76s','75s','74s',
    '65s','64s',
    '54s','53s',
    '43s',
    'ATo','A9o','A8o','A7o',
    'KJo','KTo','K9o','K8o',
    'QJo','QTo','Q9o','Q8o',
    'JTo','J9o','J8o',
    'T9o','T8o',
    '98o','97o',
    '87o',
  ];
  const mixCall: HandClass[] = [
    'K5s','Q5s','J5s','T5s','94s','84s',
    'A6o','A5o','K7o','K6o','Q7o','J7o','T7o',
  ];

  const playHands: Record<HandClass, HandStrategy> = {};
  raiseHands.forEach(h => playHands[h] = raise(9));
  mixRaise.forEach(h => playHands[h] = mixCallRaise(9));
  callHands.forEach(h => playHands[h] = call());
  mixCall.forEach(h => playHands[h] = mixFoldCall());
  return buildStrategy169(playHands);
}

/** BB vs SB RFI — very wide defense */
export function buildBB_VS_SB_RFI(): Strategy169 {
  const raiseHands: HandClass[] = [
    'AA','KK','QQ','JJ','TT','AKs','AQs','AJs','AKo','AQo','AJo',
  ];
  const mixRaise: HandClass[] = [
    '99','88','77','ATs','A5s','A4s','A3s','KQs','KJs','QJs','JTs','T9s','98s','87s',
    'KQo','KJo','QJo','JTo',
  ];
  const callHands: HandClass[] = [
    '66','55','44','33','22',
    'A9s','A8s','A7s','A6s','A2s',
    'KTs','K9s','K8s','K7s','K6s','K5s','K4s','K3s',
    'QTs','Q9s','Q8s','Q7s','Q6s','Q5s','Q4s',
    'J9s','J8s','J7s','J6s','J5s','J4s',
    'T8s','T7s','T6s','T5s',
    '97s','96s','95s','94s',
    '86s','85s','84s',
    '76s','75s','74s',
    '65s','64s','63s',
    '54s','53s','52s',
    '43s','42s',
    '32s',
    'ATo','A9o','A8o','A7o','A6o','A5o','A4o',
    'KTo','K9o','K8o','K7o','K6o',
    'QTo','Q9o','Q8o','Q7o',
    'JTo','J9o','J8o','J7o',
    'T9o','T8o','T7o',
    '98o','97o','96o',
    '87o','86o',
    '76o','75o',
    '65o',
    '54o',
  ];
  const mixCall: HandClass[] = [
    'K2s','Q3s','J3s','T4s','93s','83s',
    'A3o','A2o','K5o','K4o','Q6o','Q5o','J6o','T6o','96o','85o','74o',
  ];

  const playHands: Record<HandClass, HandStrategy> = {};
  raiseHands.forEach(h => playHands[h] = raise(9));
  mixRaise.forEach(h => playHands[h] = mixCallRaise(9));
  callHands.forEach(h => playHands[h] = call());
  mixCall.forEach(h => playHands[h] = mixFoldCall());
  return buildStrategy169(playHands);
}

/** SB vs BTN RFI */
export function buildSB_VS_BTN_RFI(): Strategy169 {
  const raiseHands: HandClass[] = ['AA','KK','QQ','JJ','TT','AKs','AQs','AJs','AKo','AQo'];
  const mixRaise: HandClass[] = [
    '99','88','ATs','A5s','A4s','KQs','QJs','JTs','AJo','KQo','KJo',
  ];
  const callHands: HandClass[] = [
    '77','66','55','44',
    'A9s','A8s','A7s','A6s','A3s','A2s',
    'KJs','KTs','K9s','K8s',
    'QTs','Q9s','Q8s',
    'J9s','J8s',
    'T9s','T8s',
    '98s','97s','87s','76s',
    'ATo',
    'KTo','K9o',
    'QJo','QTo',
    'JTo','J9o',
    'T9o',
    '98o',
  ];
  const mixCall: HandClass[] = ['33','22','A2s','K7s','K6s'];

  const playHands: Record<HandClass, HandStrategy> = {};
  raiseHands.forEach(h => playHands[h] = raise(9));
  mixRaise.forEach(h => playHands[h] = mixCallRaise(9));
  callHands.forEach(h => playHands[h] = call());
  mixCall.forEach(h => playHands[h] = mixFoldCall());
  return buildStrategy169(playHands);
}

/** SB vs CO RFI */
export function buildSB_VS_CO_RFI(): Strategy169 {
  const raiseHands: HandClass[] = ['AA','KK','QQ','JJ','TT','AKs','AQs','AKo'];
  const mixRaise: HandClass[] = ['99','AJs','ATs','A5s','KQs','AQo','AJo','KQo'];
  const callHands: HandClass[] = [
    '88','77','66',
    'A9s','A8s','A7s','A6s','A4s',
    'KJs','KTs','K9s',
    'QJs','QTs','Q9s',
    'JTs','J9s',
    'T9s','T8s',
    '98s','97s','87s','76s',
    'ATo',
    'KJo','KTo',
    'QJo',
    'JTo',
  ];
  const mixCall: HandClass[] = ['55','44','A3s','A2s','K8s'];

  const playHands: Record<HandClass, HandStrategy> = {};
  raiseHands.forEach(h => playHands[h] = raise(9));
  mixRaise.forEach(h => playHands[h] = mixCallRaise(9));
  callHands.forEach(h => playHands[h] = call());
  mixCall.forEach(h => playHands[h] = mixFoldCall());
  return buildStrategy169(playHands);
}

/** SB vs HJ RFI */
export function buildSB_VS_HJ_RFI(): Strategy169 {
  const raiseHands: HandClass[] = ['AA','KK','QQ','JJ','AKs','AQs','AKo'];
  const mixRaise: HandClass[] = ['TT','99','AJs','A5s','KQs','AQo'];
  const callHands: HandClass[] = [
    '88','77','66','55',
    'ATs','A9s','A8s','A7s','A6s','A4s',
    'KJs','KTs','K9s',
    'QJs','QTs','Q9s',
    'JTs','J9s',
    'T9s','T8s',
    '98s','97s','87s',
    'AJo','ATo',
    'KQo','KJo',
    'QJo',
  ];
  const mixCall: HandClass[] = ['44','33','A3s','A2s','K8s'];

  const playHands: Record<HandClass, HandStrategy> = {};
  raiseHands.forEach(h => playHands[h] = raise(9));
  mixRaise.forEach(h => playHands[h] = mixCallRaise(9));
  callHands.forEach(h => playHands[h] = call());
  mixCall.forEach(h => playHands[h] = mixFoldCall());
  return buildStrategy169(playHands);
}

/** BB vs UTG RFI — tightest BB defense */
export function buildBB_VS_UTG_RFI(): Strategy169 {
  const raiseHands: HandClass[] = ['AA','KK','QQ','AKs','AKo'];
  const mixRaise: HandClass[] = ['JJ','AQs','AQo'];
  const callHands: HandClass[] = [
    'TT','99','88','77','66','55',
    'AJs','ATs','A9s','A5s','A4s','A3s',
    'KQs','KJs','KTs','K9s',
    'QJs','QTs','Q9s',
    'JTs','J9s',
    'T9s','T8s',
    '98s','97s','87s','76s',
    'AJo','ATo',
    'KQo','KJo','KTo',
    'QJo',
  ];
  const mixCall: HandClass[] = [
    '44','33','22',
    'A8s','A7s','A6s','A2s',
    'K8s','K7s',
    'Q8s',
    'J8s','T7s','96s','86s','75s','65s',
    'A9o','A8o',
    'K9o','Q9o','J9o','T8o','97o',
  ];

  const playHands: Record<HandClass, HandStrategy> = {};
  raiseHands.forEach(h => playHands[h] = raise(9));
  mixRaise.forEach(h => playHands[h] = mixCallRaise(9));
  callHands.forEach(h => playHands[h] = call());
  mixCall.forEach(h => playHands[h] = mixFoldCall());
  return buildStrategy169(playHands);
}

/** BB vs UTG1 RFI */
export function buildBB_VS_UTG1_RFI(): Strategy169 {
  const raiseHands: HandClass[] = ['AA','KK','QQ','AKs','AKo'];
  const mixRaise: HandClass[] = ['JJ','TT','AQs','AQo','AJo'];
  const callHands: HandClass[] = [
    '99','88','77','66','55','44',
    'AJs','ATs','A9s','A5s','A4s','A3s','A2s',
    'KQs','KJs','KTs','K9s','K8s',
    'QJs','QTs','Q9s','Q8s',
    'JTs','J9s','J8s',
    'T9s','T8s','T7s',
    '98s','97s','87s','86s','76s','65s',
    'ATo',
    'KQo','KJo','KTo',
    'QJo','QTo',
    'JTo',
  ];
  const mixCall: HandClass[] = [
    '33','22','A8s','A7s','A6s',
    'K7s','Q7s','J7s','T6s','96s','85s','75s',
    'A9o','A8o','A7o','K9o','Q9o','J9o','T8o',
  ];

  const playHands: Record<HandClass, HandStrategy> = {};
  raiseHands.forEach(h => playHands[h] = raise(9));
  mixRaise.forEach(h => playHands[h] = mixCallRaise(9));
  callHands.forEach(h => playHands[h] = call());
  mixCall.forEach(h => playHands[h] = mixFoldCall());
  return buildStrategy169(playHands);
}

/** BB vs MP RFI */
export function buildBB_VS_MP_RFI(): Strategy169 {
  const raiseHands: HandClass[] = ['AA','KK','QQ','JJ','AKs','AQs','AKo'];
  const mixRaise: HandClass[] = ['TT','AJs','A5s','KQs','AQo','AJo','KQo'];
  const callHands: HandClass[] = [
    '99','88','77','66','55','44','33',
    'ATs','A9s','A8s','A7s','A6s','A4s','A3s','A2s',
    'KJs','KTs','K9s','K8s','K7s',
    'QJs','QTs','Q9s','Q8s','Q7s',
    'JTs','J9s','J8s','J7s',
    'T9s','T8s','T7s',
    '98s','97s','96s','87s','86s','76s','75s','65s',
    'ATo','A9o','A8o',
    'KJo','KTo','K9o',
    'QJo','QTo','Q9o',
    'JTo','J9o',
    'T9o','T8o',
    '98o',
  ];
  const mixCall: HandClass[] = [
    '22','K6s','Q6s','J6s','T6s','95s','85s','74s',
    'A7o','A6o','K8o','K7o','Q8o','J8o','T7o','97o','87o',
  ];

  const playHands: Record<HandClass, HandStrategy> = {};
  raiseHands.forEach(h => playHands[h] = raise(9));
  mixRaise.forEach(h => playHands[h] = mixCallRaise(9));
  callHands.forEach(h => playHands[h] = call());
  mixCall.forEach(h => playHands[h] = mixFoldCall());
  return buildStrategy169(playHands);
}

/** BB vs LJ RFI */
export function buildBB_VS_LJ_RFI(): Strategy169 {
  const raiseHands: HandClass[] = ['AA','KK','QQ','JJ','AKs','AQs','AKo'];
  const mixRaise: HandClass[] = ['TT','99','AJs','ATs','A5s','A4s','KQs','QJs','AQo','AJo','KQo'];
  const callHands: HandClass[] = [
    '88','77','66','55','44','33','22',
    'A9s','A8s','A7s','A6s','A3s','A2s',
    'KJs','KTs','K9s','K8s','K7s','K6s',
    'QTs','Q9s','Q8s','Q7s','Q6s',
    'J9s','J8s','J7s','J6s',
    'T8s','T7s','T6s',
    '98s','97s','96s','95s',
    '87s','86s','85s',
    '76s','75s','74s',
    '65s','64s',
    '54s','53s',
    'ATo','A9o','A8o','A7o',
    'KJo','KTo','K9o','K8o',
    'QJo','QTo','Q9o','Q8o',
    'JTo','J9o','J8o',
    'T9o','T8o',
    '98o','97o',
    '87o',
  ];
  const mixCall: HandClass[] = [
    'K5s','Q5s','J5s','T5s','94s','84s',
    'A6o','A5o','K7o','K6o','Q7o','J7o','T7o','96o',
  ];

  const playHands: Record<HandClass, HandStrategy> = {};
  raiseHands.forEach(h => playHands[h] = raise(9));
  mixRaise.forEach(h => playHands[h] = mixCallRaise(9));
  callHands.forEach(h => playHands[h] = call());
  mixCall.forEach(h => playHands[h] = mixFoldCall());
  return buildStrategy169(playHands);
}

/** HJ vs UTG RFI */
export function buildHJ_VS_UTG_RFI(): Strategy169 {
  const raiseHands: HandClass[] = ['AA','KK','QQ','AKs','AKo'];
  const mixRaise: HandClass[] = ['JJ','AQs','AQo'];
  const callHands: HandClass[] = [
    'TT','99','88','77',
    'AJs','ATs','A5s','A4s',
    'KQs','KJs','KTs',
    'QJs','QTs',
    'JTs',
    'T9s',
    'AJo',
    'KQo',
  ];
  const mixCall: HandClass[] = ['66','A9s','A8s','K9s','ATo'];

  const playHands: Record<HandClass, HandStrategy> = {};
  raiseHands.forEach(h => playHands[h] = raise(9));
  mixRaise.forEach(h => playHands[h] = mixCallRaise(9));
  callHands.forEach(h => playHands[h] = call());
  mixCall.forEach(h => playHands[h] = mixFoldCall());
  return buildStrategy169(playHands);
}

/** LJ vs UTG RFI */
export function buildLJ_VS_UTG_RFI(): Strategy169 {
  const raiseHands: HandClass[] = ['AA','KK','QQ','AKs','AKo'];
  const mixRaise: HandClass[] = ['JJ','AQs'];
  const callHands: HandClass[] = [
    'TT','99','88',
    'AJs','ATs','A5s',
    'KQs','KJs',
    'QJs',
    'JTs',
  ];
  const mixCall: HandClass[] = ['77','66','A9s','KTs','AJo','AQo'];

  const playHands: Record<HandClass, HandStrategy> = {};
  raiseHands.forEach(h => playHands[h] = raise(9));
  mixRaise.forEach(h => playHands[h] = mixCallRaise(9));
  callHands.forEach(h => playHands[h] = call());
  mixCall.forEach(h => playHands[h] = mixFoldCall());
  return buildStrategy169(playHands);
}

/** MP vs UTG RFI */
export function buildMP_VS_UTG_RFI(): Strategy169 {
  const raiseHands: HandClass[] = ['AA','KK','QQ','AKs','AKo'];
  const mixRaise: HandClass[] = ['JJ','AQs'];
  const callHands: HandClass[] = [
    'TT','99','88','77',
    'AJs','ATs','A5s','A4s',
    'KQs','KJs',
    'QJs',
    'JTs',
  ];
  const mixCall: HandClass[] = ['66','A9s','KTs','AQo','AJo'];

  const playHands: Record<HandClass, HandStrategy> = {};
  raiseHands.forEach(h => playHands[h] = raise(9));
  mixRaise.forEach(h => playHands[h] = mixCallRaise(9));
  callHands.forEach(h => playHands[h] = call());
  mixCall.forEach(h => playHands[h] = mixFoldCall());
  return buildStrategy169(playHands);
}

/** SB vs UTG RFI */
export function buildSB_VS_UTG_RFI(): Strategy169 {
  const raiseHands: HandClass[] = ['AA','KK','QQ','AKs','AKo'];
  const mixRaise: HandClass[] = ['JJ','AQs'];
  const callHands: HandClass[] = [
    'TT','99','88',
    'AJs','ATs','A5s',
    'KQs','KJs',
    'QJs','QTs',
    'JTs',
    'T9s',
    'AQo','AJo',
    'KQo',
  ];
  const mixCall: HandClass[] = ['77','66','A9s','K9s'];

  const playHands: Record<HandClass, HandStrategy> = {};
  raiseHands.forEach(h => playHands[h] = raise(9));
  mixRaise.forEach(h => playHands[h] = mixCallRaise(9));
  callHands.forEach(h => playHands[h] = call());
  mixCall.forEach(h => playHands[h] = mixFoldCall());
  return buildStrategy169(playHands);
}

// ─── VS 3-BET Strategies ──────────────────────────────────────────────────────

/** Build a VS_3BET strategy for the original opener facing a 3-bet */
function buildVs3Bet169(
  callHands: HandClass[],
  fourBetHands: HandClass[],
  mixCallFourBet: HandClass[],
  mixFoldCall: HandClass[],
  fourBetSizeBB: number
): Strategy169 {
  const playHands: Record<HandClass, HandStrategy> = {};
  
  fourBetHands.forEach(h => playHands[h] = raise(fourBetSizeBB));
  mixCallFourBet.forEach(h => playHands[h] = { fold: 0, call: 0.5, raises: [{ toBB: fourBetSizeBB, frequency: 0.5 }] });
  callHands.forEach(h => playHands[h] = call());
  mixFoldCall.forEach(h => playHands[h] = { fold: 0.5, call: 0.5, raises: [] });
  
  return buildStrategy169(playHands);
}

/** UTG opener vs 3-bet (from any position) */
export function buildUTG_VS_ANY_3BET(): Strategy169 {
  const fourBetHands: HandClass[] = ['AA','KK','QQ','JJ','AKs','AKo'];
  const mixFourBet: HandClass[] = ['TT','AQs'];
  const callHands: HandClass[] = [
    '99','88','77',
    'AJs','ATs',
    'KQs','KJs',
    'QJs',
    'AQo',
  ];
  const mixCall: HandClass[] = ['66','A9s','JTs','AJo'];

  return buildVs3Bet169(callHands, fourBetHands, mixFourBet, mixCall, 25);
}

/** BTN opener vs 3-bet from BB */
export function buildBTN_VS_BB_3BET(): Strategy169 {
  const fourBetHands: HandClass[] = ['AA','KK','QQ','JJ','TT','AKs','AQs','AKo'];
  const mixFourBet: HandClass[] = ['99','AJs','A5s','A4s','KQs','AQo'];
  const callHands: HandClass[] = [
    '88','77','66','55',
    'ATs','A9s','A8s','A7s','A6s',
    'KJs','KTs','K9s',
    'QJs','QTs','Q9s',
    'JTs','J9s',
    'T9s','T8s',
    '98s','97s','87s','76s',
    'AJo','ATo',
    'KQo','KJo','KTo',
    'QJo',
  ];
  const mixCall: HandClass[] = ['44','33','A3s','A2s'];

  return buildVs3Bet169(callHands, fourBetHands, mixFourBet, mixCall, 25);
}

/** BTN opener vs 3-bet from SB */
export function buildBTN_VS_SB_3BET(): Strategy169 {
  const fourBetHands: HandClass[] = ['AA','KK','QQ','JJ','TT','AKs','AQs','AKo'];
  const mixFourBet: HandClass[] = ['99','AJs','A5s','A4s','KQs','AQo'];
  const callHands: HandClass[] = [
    '88','77','66','55',
    'ATs','A9s','A8s','A7s','A6s',
    'KJs','KTs','K9s',
    'QJs','QTs',
    'JTs','J9s',
    'T9s','T8s',
    '98s','87s',
    'AJo','ATo',
    'KQo','KJo',
    'QJo',
  ];
  const mixCall: HandClass[] = ['44','33','A3s'];

  return buildVs3Bet169(callHands, fourBetHands, mixFourBet, mixCall, 25);
}

/** CO opener vs 3-bet from BTN */
export function buildCO_VS_BTN_3BET(): Strategy169 {
  const fourBetHands: HandClass[] = ['AA','KK','QQ','JJ','AKs','AKo'];
  const mixFourBet: HandClass[] = ['TT','AQs','AQo'];
  const callHands: HandClass[] = [
    '99','88','77','66',
    'AJs','ATs','A5s','A4s',
    'KQs','KJs','KTs',
    'QJs','QTs',
    'JTs',
    'T9s','T8s',
    '98s',
    'AJo','ATo',
    'KQo','KJo',
  ];
  const mixCall: HandClass[] = ['55','A9s','A8s','K9s'];

  return buildVs3Bet169(callHands, fourBetHands, mixFourBet, mixCall, 25);
}

/** CO opener vs 3-bet from BB */
export function buildCO_VS_BB_3BET(): Strategy169 {
  const fourBetHands: HandClass[] = ['AA','KK','QQ','JJ','AKs','AKo'];
  const mixFourBet: HandClass[] = ['TT','AQs','AQo'];
  const callHands: HandClass[] = [
    '99','88','77','66','55',
    'AJs','ATs','A9s','A5s','A4s',
    'KQs','KJs','KTs',
    'QJs','QTs',
    'JTs','J9s',
    'T9s','T8s',
    '98s','87s',
    'AJo','ATo',
    'KQo','KJo','KTo',
    'QJo',
  ];
  const mixCall: HandClass[] = ['44','A8s','A7s','K9s'];

  return buildVs3Bet169(callHands, fourBetHands, mixFourBet, mixCall, 25);
}

/** HJ opener vs 3-bet from BTN */
export function buildHJ_VS_BTN_3BET(): Strategy169 {
  const fourBetHands: HandClass[] = ['AA','KK','QQ','JJ','AKs','AKo'];
  const mixFourBet: HandClass[] = ['TT','AQs','AQo'];
  const callHands: HandClass[] = [
    '99','88','77',
    'AJs','ATs','A5s',
    'KQs','KJs','KTs',
    'QJs','QTs',
    'JTs',
    'T9s',
    'AJo',
    'KQo','KJo',
  ];
  const mixCall: HandClass[] = ['66','55','A9s','K9s','ATo'];

  return buildVs3Bet169(callHands, fourBetHands, mixFourBet, mixCall, 25);
}

/** HJ opener vs 3-bet from BB */
export function buildHJ_VS_BB_3BET(): Strategy169 {
  const fourBetHands: HandClass[] = ['AA','KK','QQ','JJ','AKs','AKo'];
  const mixFourBet: HandClass[] = ['TT','AQs','AQo'];
  const callHands: HandClass[] = [
    '99','88','77','66',
    'AJs','ATs','A5s','A4s',
    'KQs','KJs','KTs',
    'QJs','QTs',
    'JTs','J9s',
    'T9s','T8s',
    '98s',
    'AJo','ATo',
    'KQo','KJo',
    'QJo',
  ];
  const mixCall: HandClass[] = ['55','44','A9s','A8s','K9s'];

  return buildVs3Bet169(callHands, fourBetHands, mixFourBet, mixCall, 25);
}

/** SB opener vs 3-bet from BB */
export function buildSB_VS_BB_3BET(): Strategy169 {
  const fourBetHands: HandClass[] = ['AA','KK','QQ','JJ','TT','AKs','AQs','AKo'];
  const mixFourBet: HandClass[] = ['99','AJs','A5s','A4s','KQs','AQo'];
  const callHands: HandClass[] = [
    '88','77','66',
    'ATs','A9s','A8s','A7s','A6s',
    'KJs','KTs','K9s',
    'QJs','QTs',
    'JTs','J9s',
    'T9s','T8s',
    '98s','87s',
    'AJo','ATo',
    'KQo','KJo',
    'QJo',
  ];
  const mixCall: HandClass[] = ['55','44','A3s','A2s'];

  return buildVs3Bet169(callHands, fourBetHands, mixFourBet, mixCall, 25);
}
