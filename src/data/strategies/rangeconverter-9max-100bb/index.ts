/**
 * index.ts
 * Assembles the complete RangeConverter 9-max 100bb strategy profile
 * from the range data builders.
 */

import type { DecisionNode, StrategyProfile } from '../../../domain/strategy/types';
import {
  buildUTG_RFI, buildUTG1_RFI, buildMP_RFI, buildLJ_RFI,
  buildHJ_RFI, buildCO_RFI, buildBTN_RFI, buildSB_RFI,
  buildBTN_VS_UTG_RFI, buildBTN_VS_CO_RFI, buildBTN_VS_HJ_RFI,
  buildCO_VS_UTG_RFI, buildCO_VS_HJ_RFI,
  buildBB_VS_UTG_RFI, buildBB_VS_UTG1_RFI, buildBB_VS_MP_RFI,
  buildBB_VS_LJ_RFI, buildBB_VS_HJ_RFI, buildBB_VS_CO_RFI,
  buildBB_VS_BTN_RFI, buildBB_VS_SB_RFI,
  buildSB_VS_UTG_RFI, buildSB_VS_CO_RFI, buildSB_VS_HJ_RFI, buildSB_VS_BTN_RFI,
  buildHJ_VS_UTG_RFI, buildLJ_VS_UTG_RFI, buildMP_VS_UTG_RFI,
  buildUTG_VS_ANY_3BET,
  buildBTN_VS_BB_3BET, buildBTN_VS_SB_3BET,
  buildCO_VS_BTN_3BET, buildCO_VS_BB_3BET,
  buildHJ_VS_BTN_3BET, buildHJ_VS_BB_3BET,
  buildSB_VS_BB_3BET,
} from './range-data-builder';

// ─── Metadata ─────────────────────────────────────────────────────────────────

export const PROFILE_METADATA = {
  id: 'rangeconverter-9max-100bb',
  name: '9-Max 100bb Solver-Derived (Simplified)',
  game: 'NLHE' as const,
  players: 9,
  stackDepthBB: 100,
  anteBB: 0,
  straddleBB: 0,
  positions: ['UTG', 'UTG1', 'MP', 'LJ', 'HJ', 'CO', 'BTN', 'SB', 'BB'] as any[],
  source: {
    name: 'RangeConverter',
    url: 'https://rangeconverter.com/articles/poker-charts-9-max-100bb-no-limit-texas-holdem',
    description: 'Simplified solver-derived 9-max 100bb live cash ranges. Based on RangeConverter methodology.',
  },
  rake: {
    percent: null,
    capBB: null,
    noFlopNoDrop: null,
  },
  normalizationNotes:
    'All mixed frequencies are expressed as 0, 0.5, or 1.0 to match the RangeConverter simplification methodology. ' +
    'No intermediate frequencies (e.g., 0.33, 0.67) are claimed. ' +
    'Standard open-raise sizes: 3bb from UTG/UTG1/MP/LJ/HJ/CO/SB, 2.5bb from BTN. ' +
    '3-bet sizing: 9bb vs opens. 4-bet sizing: 25bb.',
};

// ─── Decision Nodes ───────────────────────────────────────────────────────────

const RFI_NODES: DecisionNode[] = [
  {
    id: 'UTG_RFI',
    scenarioType: 'RFI',
    heroPosition: 'UTG',
    actionHistoryPattern: [],
    description: 'UTG opens (everyone folds before)',
    strategy: buildUTG_RFI(),
  },
  {
    id: 'UTG1_RFI',
    scenarioType: 'RFI',
    heroPosition: 'UTG1',
    actionHistoryPattern: [{ position: 'UTG', action: 'fold' }],
    description: 'UTG+1 opens (UTG folds)',
    strategy: buildUTG1_RFI(),
  },
  {
    id: 'MP_RFI',
    scenarioType: 'RFI',
    heroPosition: 'MP',
    actionHistoryPattern: [
      { position: 'UTG', action: 'fold' },
      { position: 'UTG1', action: 'fold' },
    ],
    description: 'MP opens (UTG, UTG+1 fold)',
    strategy: buildMP_RFI(),
  },
  {
    id: 'LJ_RFI',
    scenarioType: 'RFI',
    heroPosition: 'LJ',
    actionHistoryPattern: [
      { position: 'UTG', action: 'fold' },
      { position: 'UTG1', action: 'fold' },
      { position: 'MP', action: 'fold' },
    ],
    description: 'LJ opens (everyone before folds)',
    strategy: buildLJ_RFI(),
  },
  {
    id: 'HJ_RFI',
    scenarioType: 'RFI',
    heroPosition: 'HJ',
    actionHistoryPattern: [
      { position: 'UTG', action: 'fold' },
      { position: 'UTG1', action: 'fold' },
      { position: 'MP', action: 'fold' },
      { position: 'LJ', action: 'fold' },
    ],
    description: 'HJ opens (everyone before folds)',
    strategy: buildHJ_RFI(),
  },
  {
    id: 'CO_RFI',
    scenarioType: 'RFI',
    heroPosition: 'CO',
    actionHistoryPattern: [
      { position: 'UTG', action: 'fold' },
      { position: 'UTG1', action: 'fold' },
      { position: 'MP', action: 'fold' },
      { position: 'LJ', action: 'fold' },
      { position: 'HJ', action: 'fold' },
    ],
    description: 'CO opens (everyone before folds)',
    strategy: buildCO_RFI(),
  },
  {
    id: 'BTN_RFI',
    scenarioType: 'RFI',
    heroPosition: 'BTN',
    actionHistoryPattern: [
      { position: 'UTG', action: 'fold' },
      { position: 'UTG1', action: 'fold' },
      { position: 'MP', action: 'fold' },
      { position: 'LJ', action: 'fold' },
      { position: 'HJ', action: 'fold' },
      { position: 'CO', action: 'fold' },
    ],
    description: 'BTN opens (everyone before folds)',
    strategy: buildBTN_RFI(),
  },
  {
    id: 'SB_RFI',
    scenarioType: 'RFI',
    heroPosition: 'SB',
    actionHistoryPattern: [
      { position: 'UTG', action: 'fold' },
      { position: 'UTG1', action: 'fold' },
      { position: 'MP', action: 'fold' },
      { position: 'LJ', action: 'fold' },
      { position: 'HJ', action: 'fold' },
      { position: 'CO', action: 'fold' },
      { position: 'BTN', action: 'fold' },
    ],
    description: 'SB opens vs BB (everyone folds to SB)',
    strategy: buildSB_RFI(),
  },
];

const VS_RFI_NODES: DecisionNode[] = [
  // vs UTG open
  {
    id: 'MP_VS_UTG_RFI',
    scenarioType: 'VS_RFI',
    heroPosition: 'MP',
    actionHistoryPattern: [{ position: 'UTG', action: 'raise', amountBB: 3 }],
    description: 'MP faces UTG open',
    strategy: buildMP_VS_UTG_RFI(),
  },
  {
    id: 'LJ_VS_UTG_RFI',
    scenarioType: 'VS_RFI',
    heroPosition: 'LJ',
    actionHistoryPattern: [{ position: 'UTG', action: 'raise', amountBB: 3 }],
    description: 'LJ faces UTG open',
    strategy: buildLJ_VS_UTG_RFI(),
  },
  {
    id: 'HJ_VS_UTG_RFI',
    scenarioType: 'VS_RFI',
    heroPosition: 'HJ',
    actionHistoryPattern: [{ position: 'UTG', action: 'raise', amountBB: 3 }],
    description: 'HJ faces UTG open',
    strategy: buildHJ_VS_UTG_RFI(),
  },
  {
    id: 'CO_VS_UTG_RFI',
    scenarioType: 'VS_RFI',
    heroPosition: 'CO',
    actionHistoryPattern: [{ position: 'UTG', action: 'raise', amountBB: 3 }],
    description: 'CO faces UTG open',
    strategy: buildCO_VS_UTG_RFI(),
  },
  {
    id: 'BTN_VS_UTG_RFI',
    scenarioType: 'VS_RFI',
    heroPosition: 'BTN',
    actionHistoryPattern: [{ position: 'UTG', action: 'raise', amountBB: 3 }],
    description: 'BTN faces UTG open',
    strategy: buildBTN_VS_UTG_RFI(),
  },
  {
    id: 'SB_VS_UTG_RFI',
    scenarioType: 'VS_RFI',
    heroPosition: 'SB',
    actionHistoryPattern: [{ position: 'UTG', action: 'raise', amountBB: 3 }],
    description: 'SB faces UTG open',
    strategy: buildSB_VS_UTG_RFI(),
  },
  {
    id: 'BB_VS_UTG_RFI',
    scenarioType: 'VS_RFI',
    heroPosition: 'BB',
    actionHistoryPattern: [{ position: 'UTG', action: 'raise', amountBB: 3 }],
    description: 'BB faces UTG open',
    strategy: buildBB_VS_UTG_RFI(),
  },
  // vs UTG1 open
  {
    id: 'BB_VS_UTG1_RFI',
    scenarioType: 'VS_RFI',
    heroPosition: 'BB',
    actionHistoryPattern: [{ position: 'UTG1', action: 'raise', amountBB: 3 }],
    description: 'BB faces UTG+1 open',
    strategy: buildBB_VS_UTG1_RFI(),
  },
  // vs MP open
  {
    id: 'BB_VS_MP_RFI',
    scenarioType: 'VS_RFI',
    heroPosition: 'BB',
    actionHistoryPattern: [{ position: 'MP', action: 'raise', amountBB: 3 }],
    description: 'BB faces MP open',
    strategy: buildBB_VS_MP_RFI(),
  },
  // vs LJ open
  {
    id: 'BB_VS_LJ_RFI',
    scenarioType: 'VS_RFI',
    heroPosition: 'BB',
    actionHistoryPattern: [{ position: 'LJ', action: 'raise', amountBB: 3 }],
    description: 'BB faces LJ open',
    strategy: buildBB_VS_LJ_RFI(),
  },
  // vs HJ open
  {
    id: 'CO_VS_HJ_RFI',
    scenarioType: 'VS_RFI',
    heroPosition: 'CO',
    actionHistoryPattern: [{ position: 'HJ', action: 'raise', amountBB: 3 }],
    description: 'CO faces HJ open',
    strategy: buildCO_VS_HJ_RFI(),
  },
  {
    id: 'BTN_VS_HJ_RFI',
    scenarioType: 'VS_RFI',
    heroPosition: 'BTN',
    actionHistoryPattern: [{ position: 'HJ', action: 'raise', amountBB: 3 }],
    description: 'BTN faces HJ open',
    strategy: buildBTN_VS_HJ_RFI(),
  },
  {
    id: 'SB_VS_HJ_RFI',
    scenarioType: 'VS_RFI',
    heroPosition: 'SB',
    actionHistoryPattern: [{ position: 'HJ', action: 'raise', amountBB: 3 }],
    description: 'SB faces HJ open',
    strategy: buildSB_VS_HJ_RFI(),
  },
  {
    id: 'BB_VS_HJ_RFI',
    scenarioType: 'VS_RFI',
    heroPosition: 'BB',
    actionHistoryPattern: [{ position: 'HJ', action: 'raise', amountBB: 3 }],
    description: 'BB faces HJ open',
    strategy: buildBB_VS_HJ_RFI(),
  },
  // vs CO open
  {
    id: 'BTN_VS_CO_RFI',
    scenarioType: 'VS_RFI',
    heroPosition: 'BTN',
    actionHistoryPattern: [{ position: 'CO', action: 'raise', amountBB: 3 }],
    description: 'BTN faces CO open',
    strategy: buildBTN_VS_CO_RFI(),
  },
  {
    id: 'SB_VS_CO_RFI',
    scenarioType: 'VS_RFI',
    heroPosition: 'SB',
    actionHistoryPattern: [{ position: 'CO', action: 'raise', amountBB: 3 }],
    description: 'SB faces CO open',
    strategy: buildSB_VS_CO_RFI(),
  },
  {
    id: 'BB_VS_CO_RFI',
    scenarioType: 'VS_RFI',
    heroPosition: 'BB',
    actionHistoryPattern: [{ position: 'CO', action: 'raise', amountBB: 3 }],
    description: 'BB faces CO open',
    strategy: buildBB_VS_CO_RFI(),
  },
  // vs BTN open
  {
    id: 'SB_VS_BTN_RFI',
    scenarioType: 'VS_RFI',
    heroPosition: 'SB',
    actionHistoryPattern: [{ position: 'BTN', action: 'raise', amountBB: 2.5 }],
    description: 'SB faces BTN open',
    strategy: buildSB_VS_BTN_RFI(),
  },
  {
    id: 'BB_VS_BTN_RFI',
    scenarioType: 'VS_RFI',
    heroPosition: 'BB',
    actionHistoryPattern: [{ position: 'BTN', action: 'raise', amountBB: 2.5 }],
    description: 'BB faces BTN open',
    strategy: buildBB_VS_BTN_RFI(),
  },
  // vs SB open
  {
    id: 'BB_VS_SB_RFI',
    scenarioType: 'VS_RFI',
    heroPosition: 'BB',
    actionHistoryPattern: [{ position: 'SB', action: 'raise', amountBB: 3 }],
    description: 'BB faces SB open',
    strategy: buildBB_VS_SB_RFI(),
  },
];

const VS_3BET_NODES: DecisionNode[] = [
  {
    id: 'UTG_VS_ANY_3BET',
    scenarioType: 'VS_3BET',
    heroPosition: 'UTG',
    actionHistoryPattern: [
      { position: 'UTG', action: 'raise', amountBB: 3 },
    ],
    description: 'UTG opener faces 3-bet',
    strategy: buildUTG_VS_ANY_3BET(),
  },
  {
    id: 'BTN_VS_BB_3BET',
    scenarioType: 'VS_3BET',
    heroPosition: 'BTN',
    actionHistoryPattern: [
      { position: 'BTN', action: 'raise', amountBB: 2.5 },
      { position: 'BB', action: 'raise', amountBB: 9 },
    ],
    description: 'BTN opener faces BB 3-bet',
    strategy: buildBTN_VS_BB_3BET(),
  },
  {
    id: 'BTN_VS_SB_3BET',
    scenarioType: 'VS_3BET',
    heroPosition: 'BTN',
    actionHistoryPattern: [
      { position: 'BTN', action: 'raise', amountBB: 2.5 },
      { position: 'SB', action: 'raise', amountBB: 9 },
    ],
    description: 'BTN opener faces SB 3-bet',
    strategy: buildBTN_VS_SB_3BET(),
  },
  {
    id: 'CO_VS_BTN_3BET',
    scenarioType: 'VS_3BET',
    heroPosition: 'CO',
    actionHistoryPattern: [
      { position: 'CO', action: 'raise', amountBB: 3 },
      { position: 'BTN', action: 'raise', amountBB: 9 },
    ],
    description: 'CO opener faces BTN 3-bet',
    strategy: buildCO_VS_BTN_3BET(),
  },
  {
    id: 'CO_VS_BB_3BET',
    scenarioType: 'VS_3BET',
    heroPosition: 'CO',
    actionHistoryPattern: [
      { position: 'CO', action: 'raise', amountBB: 3 },
      { position: 'BB', action: 'raise', amountBB: 9 },
    ],
    description: 'CO opener faces BB 3-bet',
    strategy: buildCO_VS_BB_3BET(),
  },
  {
    id: 'HJ_VS_BTN_3BET',
    scenarioType: 'VS_3BET',
    heroPosition: 'HJ',
    actionHistoryPattern: [
      { position: 'HJ', action: 'raise', amountBB: 3 },
      { position: 'BTN', action: 'raise', amountBB: 9 },
    ],
    description: 'HJ opener faces BTN 3-bet',
    strategy: buildHJ_VS_BTN_3BET(),
  },
  {
    id: 'HJ_VS_BB_3BET',
    scenarioType: 'VS_3BET',
    heroPosition: 'HJ',
    actionHistoryPattern: [
      { position: 'HJ', action: 'raise', amountBB: 3 },
      { position: 'BB', action: 'raise', amountBB: 9 },
    ],
    description: 'HJ opener faces BB 3-bet',
    strategy: buildHJ_VS_BB_3BET(),
  },
  {
    id: 'SB_VS_BB_3BET',
    scenarioType: 'VS_3BET',
    heroPosition: 'SB',
    actionHistoryPattern: [
      { position: 'SB', action: 'raise', amountBB: 3 },
      { position: 'BB', action: 'raise', amountBB: 9 },
    ],
    description: 'SB opener faces BB 3-bet',
    strategy: buildSB_VS_BB_3BET(),
  },
];

// ─── Profile Assembly ─────────────────────────────────────────────────────────

export const RANGECONVERTER_9MAX_100BB_PROFILE: StrategyProfile = {
  metadata: PROFILE_METADATA,
  nodes: [...RFI_NODES, ...VS_RFI_NODES, ...VS_3BET_NODES],
};
