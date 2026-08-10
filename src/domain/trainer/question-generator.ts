/**
 * question-generator.ts
 * Dynamically generates quiz questions from strategy data.
 * No preset questions — every question is generated from the strategy engine.
 */

import { generateCardsForHandClass, dealRandomHand, classifyHand } from '../poker/cards';
import type { Card, HandClass } from '../poker/cards';
import { HAND_MATRIX_169 } from '../poker/hands';
import { getAvailableDecisions } from '../poker/actions';
import type { ScenarioType, HeroDecision } from '../poker/actions';
import type { Position } from '../poker/positions';
import {
  buildRfiActionHistory,
  buildVsRfiActionHistory,
  buildVs3BetActionHistory,
  addBlindsToHistory,
  computePot,
} from '../poker/action-history';
import type { ActionEvent } from '../poker/actions';
import { filterDecisionNodes, getHandStrategy } from '../strategy/strategy-engine';
import { getTotalRaiseFrequency } from '../strategy/types';
import type { DecisionNode, HandStrategy } from '../strategy/types';
import type { NodeFilter } from '../strategy/types';

// ─── Question Types ───────────────────────────────────────────────────────────

export interface TrainingQuestion {
  /** Unique question ID */
  id: string;
  /** Strategy profile used */
  profileId: string;
  /** Decision node this question is from */
  nodeId: string;
  /** Scenario type */
  scenarioType: ScenarioType;
  /** Hero's position */
  heroPosition: Position;
  /** Hand class (strategic category) */
  handClass: HandClass;
  /** Actual cards to display */
  heroCards: [Card, Card];
  /** Action history for table display (including blinds) */
  displayActionHistory: ActionEvent[];
  /** Available decisions for hero */
  availableDecisions: HeroDecision[];
  /** Pot size in BB (computed from action history) */
  potBB: number;
  /** GTO strategy for scoring (revealed after answer) */
  strategy: HandStrategy;
  /** In randomizer mode, the pre-generated random value */
  randomizerValue?: number;
  /** Human-readable description of the situation */
  description: string;
}

export type QuestionMode = 'trainer' | 'realistic';

export interface QuestionGeneratorOptions {
  profileId: string;
  scenarioTypes?: ScenarioType[];
  heroPositions?: Position[];
  openerPositions?: Position[];
  mode: QuestionMode;
  scoringMode?: 'practical' | 'randomizer';
}

// ─── Question Generator ───────────────────────────────────────────────────────

/**
 * Generate a training question from the strategy engine.
 * 
 * TRAINER MODE: Weighted sampling to produce a useful distribution of situations.
 *   - Samples proportionally from fold/call/raise/mixed categories
 *   - Emphasizes hands near range boundaries
 *   - Does not let user achieve good score by always pressing Fold
 * 
 * REALISTIC MODE: Deals 2 random cards, naturally respects combo frequencies.
 */
export function generateQuestion(options: QuestionGeneratorOptions): TrainingQuestion | null {
  const { profileId, mode, scoringMode } = options;

  // Get matching decision nodes
  const filter: NodeFilter = {
    scenarioTypes: options.scenarioTypes,
    heroPositions: options.heroPositions,
    openerPositions: options.openerPositions,
  };

  const nodes = filterDecisionNodes(profileId, filter);
  if (nodes.length === 0) return null;

  // Select a decision node
  const node = selectNode(nodes);

  if (mode === 'realistic') {
    return generateRealisticQuestion(profileId, node, scoringMode);
  } else {
    return generateTrainerQuestion(profileId, node, scoringMode);
  }
}

// ─── Trainer Mode ─────────────────────────────────────────────────────────────

/**
 * Trainer mode: weighted sampling across action categories.
 * Aims for roughly 25% fold, 25% call, 25% raise, 25% mixed hands.
 * The random pick within each category is uniform.
 */
function generateTrainerQuestion(
  profileId: string,
  node: DecisionNode,
  scoringMode?: string
): TrainingQuestion {
  // Categorize all 169 hands in this node
  const foldHands: HandClass[] = [];
  const callHands: HandClass[] = [];
  const raiseHands: HandClass[] = [];
  const mixedHands: HandClass[] = [];

  for (const hand of HAND_MATRIX_169) {
    const strategy = node.strategy[hand];
    const raiseFreq = getTotalRaiseFrequency(strategy);
    const significantActions = [
      strategy.fold > 0.04,
      strategy.call > 0.04,
      raiseFreq > 0.04,
    ].filter(Boolean).length;

    if (significantActions > 1) {
      mixedHands.push(hand);
    } else if (raiseFreq > 0.5) {
      raiseHands.push(hand);
    } else if (strategy.call > 0.5) {
      callHands.push(hand);
    } else {
      foldHands.push(hand);
    }
  }

  // Select category with equal probability (among non-empty categories)
  const categories = [
    { hands: foldHands, weight: 1 },
    { hands: callHands, weight: node.scenarioType === 'RFI' ? 0 : 1 }, // No call in RFI
    { hands: raiseHands, weight: 1 },
    { hands: mixedHands, weight: 2 }, // Slightly favor mixed hands for learning
  ].filter((c) => c.hands.length > 0 && c.weight > 0);

  const totalWeight = categories.reduce((sum, c) => sum + c.weight, 0);
  let r = Math.random() * totalWeight;
  let selectedCategory = categories[0];
  
  for (const cat of categories) {
    r -= cat.weight;
    if (r <= 0) {
      selectedCategory = cat;
      break;
    }
  }

  const handClass = selectedCategory.hands[
    Math.floor(Math.random() * selectedCategory.hands.length)
  ];
  const heroCards = generateCardsForHandClass(handClass);
  const strategy = getHandStrategy(profileId, node.id, handClass);

  return buildQuestion({
    profileId,
    node,
    handClass,
    heroCards,
    strategy,
    scoringMode,
  });
}

// ─── Realistic Mode ───────────────────────────────────────────────────────────

/**
 * Realistic mode: deal 2 random cards, classify, and look up strategy.
 * Naturally respects combo frequencies.
 */
function generateRealisticQuestion(
  profileId: string,
  node: DecisionNode,
  scoringMode?: string
): TrainingQuestion {
  const heroCards = dealRandomHand();
  const handClass = classifyHand(heroCards);
  const strategy = getHandStrategy(profileId, node.id, handClass);

  return buildQuestion({
    profileId,
    node,
    handClass,
    heroCards,
    strategy,
    scoringMode,
  });
}

// ─── Question Builder ─────────────────────────────────────────────────────────

function buildQuestion(params: {
  profileId: string;
  node: DecisionNode;
  handClass: HandClass;
  heroCards: [Card, Card];
  strategy: HandStrategy;
  scoringMode?: string;
}): TrainingQuestion {
  const { profileId, node, handClass, heroCards, strategy, scoringMode } = params;

  const actionHistory = buildActionHistoryForNode(node);
  const displayActionHistory = addBlindsToHistory(actionHistory);
  const potBB = 1.5 + computePot(actionHistory); // 1.5 = SB + BB

  const randomizerValue =
    scoringMode === 'randomizer'
      ? Math.floor(Math.random() * 100) + 1
      : undefined;

  return {
    id: `${node.id}_${handClass}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    profileId,
    nodeId: node.id,
    scenarioType: node.scenarioType,
    heroPosition: node.heroPosition,
    handClass,
    heroCards,
    displayActionHistory,
    availableDecisions: getAvailableDecisions(node.scenarioType),
    potBB,
    strategy,
    randomizerValue,
    description: node.description,
  };
}

// ─── Action History Builder ───────────────────────────────────────────────────

function buildActionHistoryForNode(node: DecisionNode): ActionEvent[] {
  const { scenarioType, heroPosition, actionHistoryPattern } = node;

  switch (scenarioType) {
    case 'RFI':
      return buildRfiActionHistory(heroPosition);

    case 'VS_RFI': {
      // Find opener from action history pattern
      const openRaise = actionHistoryPattern.find((e) => e.action === 'raise');
      if (!openRaise) return [];
      return buildVsRfiActionHistory(
        openRaise.position,
        heroPosition,
        openRaise.amountBB ?? 3
      );
    }

    case 'VS_3BET': {
      // Find opener (hero) and 3-bettor
      const raises = actionHistoryPattern.filter((e) => e.action === 'raise');
      if (raises.length < 2) return [];
      const openRaise = raises[0];
      const threeBet = raises[1];
      return buildVs3BetActionHistory(
        openRaise.position,
        threeBet.position,
        openRaise.amountBB ?? 3,
        threeBet.amountBB ?? 9
      );
    }

    default:
      return [];
  }
}

// ─── Node Selection ───────────────────────────────────────────────────────────

/**
 * Select a random node with slight weighting toward nodes with more variety.
 */
function selectNode(nodes: DecisionNode[]): DecisionNode {
  // Simple uniform random selection for V1
  return nodes[Math.floor(Math.random() * nodes.length)];
}

// ─── Weakness-Based Selection ─────────────────────────────────────────────────

/**
 * Select a question from weakness data.
 * Weights toward spots with low accuracy and recent mistakes.
 */
export function generateWeaknessQuestion(
  options: QuestionGeneratorOptions,
  weaknessData: WeaknessEntry[]
): TrainingQuestion | null {
  if (weaknessData.length === 0) {
    return generateQuestion(options);
  }

  // Compute weights: lower accuracy + more mistakes + recent = higher weight
  const weighted = weaknessData.map((entry) => {
    const accuracyWeight = 1 - entry.accuracy;
    const mistakeWeight = Math.min(entry.mistakes / 10, 1);
    const recencyWeight = Math.exp(-entry.daysSinceLastMistake / 7);
    const weight = (accuracyWeight * 0.5 + mistakeWeight * 0.3 + recencyWeight * 0.2);
    return { entry, weight };
  });

  const totalWeight = weighted.reduce((sum, w) => sum + w.weight, 0);
  let r = Math.random() * totalWeight;

  let selected = weighted[0];
  for (const item of weighted) {
    r -= item.weight;
    if (r <= 0) {
      selected = item;
      break;
    }
  }

  // Generate a question for the selected weakness spot
  const weaknessOptions: QuestionGeneratorOptions = {
    ...options,
    scenarioTypes: [selected.entry.scenarioType as ScenarioType],
    heroPositions: [selected.entry.heroPosition as Position],
  };

  return generateQuestion(weaknessOptions);
}

export interface WeaknessEntry {
  nodeId: string;
  handClass?: string;
  scenarioType: string;
  heroPosition: string;
  accuracy: number;
  mistakes: number;
  daysSinceLastMistake: number;
}
