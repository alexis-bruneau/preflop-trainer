/**
 * strategy-validator.ts
 * Validates StrategyProfile and DecisionNode objects before use.
 * Throws descriptive errors for any issues — never silently fails.
 */

import { HAND_MATRIX_169, isValidHandClass } from '../poker/hands';
import { POSITIONS } from '../poker/positions';
import { getTotalFrequency, getTotalRaiseFrequency } from './types';
import type { DecisionNode, HandStrategy, StrategyProfile } from './types';
import type { HandClass } from '../poker/cards';

// ─── Constants ────────────────────────────────────────────────────────────────

/** Allowed tolerance for frequency sums deviating from 1.0 */
const FREQUENCY_TOLERANCE = 0.02;

// ─── Validation Errors ────────────────────────────────────────────────────────

export class StrategyValidationError extends Error {
  constructor(
    public readonly profileId: string,
    public readonly nodeId: string | null,
    public readonly handClass: HandClass | null,
    message: string
  ) {
    const context = [
      `Profile: ${profileId}`,
      nodeId ? `Node: ${nodeId}` : null,
      handClass ? `Hand: ${handClass}` : null,
    ]
      .filter(Boolean)
      .join(', ');
    super(`Strategy validation failed [${context}]: ${message}`);
    this.name = 'StrategyValidationError';
  }
}

// ─── Hand Strategy Validation ─────────────────────────────────────────────────

export function validateHandStrategy(
  strategy: HandStrategy,
  profileId: string,
  nodeId: string,
  handClass: HandClass
): void {
  const total = getTotalFrequency(strategy);

  if (Math.abs(total - 1.0) > FREQUENCY_TOLERANCE) {
    throw new StrategyValidationError(
      profileId,
      nodeId,
      handClass,
      `Frequencies sum to ${total.toFixed(4)}, expected ~1.0 (fold: ${strategy.fold}, call: ${strategy.call}, raise: ${getTotalRaiseFrequency(strategy).toFixed(4)})`
    );
  }

  if (strategy.fold < 0 || strategy.fold > 1) {
    throw new StrategyValidationError(profileId, nodeId, handClass, `fold frequency ${strategy.fold} is out of range [0,1]`);
  }

  if (strategy.call < 0 || strategy.call > 1) {
    throw new StrategyValidationError(profileId, nodeId, handClass, `call frequency ${strategy.call} is out of range [0,1]`);
  }

  for (const raise of strategy.raises) {
    if (raise.frequency < 0 || raise.frequency > 1) {
      throw new StrategyValidationError(
        profileId,
        nodeId,
        handClass,
        `raise frequency ${raise.frequency} (size ${raise.toBB}bb) is out of range [0,1]`
      );
    }
    if (raise.toBB <= 0) {
      throw new StrategyValidationError(
        profileId,
        nodeId,
        handClass,
        `raise size ${raise.toBB}bb must be positive`
      );
    }
  }
}

// ─── Decision Node Validation ─────────────────────────────────────────────────

export function validateDecisionNode(node: DecisionNode, profileId: string): void {
  // 1. Validate hero position
  if (!POSITIONS.includes(node.heroPosition)) {
    throw new StrategyValidationError(
      profileId,
      node.id,
      null,
      `Invalid hero position: ${node.heroPosition}`
    );
  }

  // 2. Validate action history positions
  for (const event of node.actionHistoryPattern) {
    if (!POSITIONS.includes(event.position)) {
      throw new StrategyValidationError(
        profileId,
        node.id,
        null,
        `Invalid position in action history: ${event.position}`
      );
    }
  }

  // 3. Check all 169 hand classes are present
  const strategyKeys = Object.keys(node.strategy);
  const missingHands: HandClass[] = [];

  for (const handClass of HAND_MATRIX_169) {
    if (!(handClass in node.strategy)) {
      missingHands.push(handClass);
    }
  }

  if (missingHands.length > 0) {
    throw new StrategyValidationError(
      profileId,
      node.id,
      null,
      `Missing ${missingHands.length} hand(s): ${missingHands.slice(0, 10).join(', ')}${missingHands.length > 10 ? '...' : ''}`
    );
  }

  // 4. Check for invalid hand class keys
  const invalidHands = strategyKeys.filter((k) => !isValidHandClass(k));
  if (invalidHands.length > 0) {
    throw new StrategyValidationError(
      profileId,
      node.id,
      null,
      `Invalid hand class keys: ${invalidHands.slice(0, 10).join(', ')}`
    );
  }

  // 5. Validate each hand's strategy
  for (const handClass of HAND_MATRIX_169) {
    validateHandStrategy(node.strategy[handClass], profileId, node.id, handClass);
  }
}

// ─── Profile Validation ───────────────────────────────────────────────────────

export interface ValidationReport {
  profileId: string;
  totalNodes: number;
  totalHands: number;
  errors: string[];
  warnings: string[];
  passed: boolean;
}

export function validateStrategyProfile(profile: StrategyProfile): ValidationReport {
  const report: ValidationReport = {
    profileId: profile.metadata.id,
    totalNodes: profile.nodes.length,
    totalHands: profile.nodes.length * 169,
    errors: [],
    warnings: [],
    passed: true,
  };

  // Check for duplicate node IDs
  const nodeIds = profile.nodes.map((n) => n.id);
  const duplicateIds = nodeIds.filter((id, i) => nodeIds.indexOf(id) !== i);
  if (duplicateIds.length > 0) {
    report.errors.push(`Duplicate node IDs: ${duplicateIds.join(', ')}`);
    report.passed = false;
  }

  // Validate each node
  for (const node of profile.nodes) {
    try {
      validateDecisionNode(node, profile.metadata.id);
    } catch (err) {
      if (err instanceof StrategyValidationError) {
        report.errors.push(err.message);
        report.passed = false;
      } else {
        throw err;
      }
    }
  }

  // Warnings for missing recommended nodes
  const rfiNodeIds = profile.nodes
    .filter((n) => n.scenarioType === 'RFI')
    .map((n) => n.heroPosition);

  const expectedRfiPositions = ['UTG', 'UTG1', 'MP', 'LJ', 'HJ', 'CO', 'BTN', 'SB'];
  for (const pos of expectedRfiPositions) {
    if (!rfiNodeIds.includes(pos as any)) {
      report.warnings.push(`Missing RFI node for position: ${pos}`);
    }
  }

  return report;
}
