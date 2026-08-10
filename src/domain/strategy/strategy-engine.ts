/**
 * strategy-engine.ts
 * Core strategy lookup and resolution engine.
 * The UI never contains strategy logic — it all flows through here.
 */

import type { Position } from '../poker/positions';
import type { ActionEvent, ScenarioType } from '../poker/actions';
import type {
  DecisionNode,
  HandStrategy,
  NodeFilter,
  StrategyProfile,
} from './types';
import type { HandClass } from '../poker/cards';

// ─── Strategy Registry ────────────────────────────────────────────────────────

/** All loaded strategy profiles, keyed by profile ID */
const profileRegistry = new Map<string, StrategyProfile>();

export function registerProfile(profile: StrategyProfile): void {
  profileRegistry.set(profile.metadata.id, profile);
}

export function getProfile(profileId: string): StrategyProfile {
  const profile = profileRegistry.get(profileId);
  if (!profile) {
    throw new Error(`Strategy profile not found: ${profileId}`);
  }
  return profile;
}

export function getAllProfiles(): StrategyProfile[] {
  return Array.from(profileRegistry.values());
}

export function getProfileIds(): string[] {
  return Array.from(profileRegistry.keys());
}

// ─── Decision Node Resolution ─────────────────────────────────────────────────

/**
 * Find the best matching DecisionNode for the given situation.
 * 
 * Matching logic:
 * 1. Hero position must match exactly.
 * 2. The action history must match the node's actionHistoryPattern (excluding fold/blind noise).
 * 
 * Returns null if no matching node exists for the situation.
 */
export function resolveDecisionNode(params: {
  profileId: string;
  heroPosition: Position;
  scenarioType: ScenarioType;
  openerPosition?: Position;
  threeBettorPosition?: Position;
}): DecisionNode | null {
  const profile = getProfile(params.profileId);

  return (
    profile.nodes.find((node) => {
      if (node.heroPosition !== params.heroPosition) return false;
      if (node.scenarioType !== params.scenarioType) return false;

      // For VS_RFI: match by opener position encoded in node ID
      if (params.scenarioType === 'VS_RFI' && params.openerPosition) {
        return node.id.includes(`VS_${params.openerPosition}_RFI`);
      }

      // For VS_3BET: match by 3-bettor position
      if (params.scenarioType === 'VS_3BET' && params.threeBettorPosition) {
        return node.id.includes(`VS_${params.threeBettorPosition}_3BET`);
      }

      return true;
    }) ?? null
  );
}

/**
 * Get a decision node by its ID.
 */
export function getDecisionNodeById(profileId: string, nodeId: string): DecisionNode | null {
  const profile = getProfile(profileId);
  return profile.nodes.find((n) => n.id === nodeId) ?? null;
}

// ─── Strategy Lookup ──────────────────────────────────────────────────────────

/**
 * Look up the GTO strategy for a specific hand in a specific decision node.
 * This is the core query that drives all training questions.
 */
export function getHandStrategy(
  profileId: string,
  nodeId: string,
  handClass: HandClass
): HandStrategy {
  const node = getDecisionNodeById(profileId, nodeId);
  if (!node) {
    throw new Error(`Decision node not found: ${nodeId} in profile ${profileId}`);
  }

  const strategy = node.strategy[handClass];
  if (!strategy) {
    throw new Error(
      `Hand ${handClass} not found in node ${nodeId}. This indicates a strategy data integrity issue.`
    );
  }

  return strategy;
}

// ─── Node Filtering ───────────────────────────────────────────────────────────

/**
 * Get all decision nodes matching the given filter criteria.
 */
export function filterDecisionNodes(profileId: string, filter: NodeFilter): DecisionNode[] {
  const profile = getProfile(profileId);
  
  return profile.nodes.filter((node) => {
    if (filter.scenarioTypes && !filter.scenarioTypes.includes(node.scenarioType)) {
      return false;
    }
    if (filter.heroPositions && !filter.heroPositions.includes(node.heroPosition)) {
      return false;
    }
    if (filter.openerPositions && node.scenarioType === 'VS_RFI') {
      const openerMatch = filter.openerPositions.some((op) => node.id.includes(`VS_${op}_RFI`));
      if (!openerMatch) return false;
    }
    return true;
  });
}

/**
 * Get all decision nodes for a profile.
 */
export function getAllDecisionNodes(profileId: string): DecisionNode[] {
  return getProfile(profileId).nodes;
}

// ─── Strategy Summary ─────────────────────────────────────────────────────────

/**
 * Get a summary of a node's strategy — how many hands fall in each category.
 */
export function getNodeStrategySummary(profileId: string, nodeId: string): {
  foldCount: number;
  callCount: number;
  raiseCount: number;
  mixedCount: number;
} {
  const node = getDecisionNodeById(profileId, nodeId);
  if (!node) throw new Error(`Node not found: ${nodeId}`);

  let foldCount = 0;
  let callCount = 0;
  let raiseCount = 0;
  let mixedCount = 0;

  for (const strategy of Object.values(node.strategy)) {
    const raiseFreq = strategy.raises.reduce((s, r) => s + r.frequency, 0);
    const actions = [strategy.fold > 0, strategy.call > 0, raiseFreq > 0].filter(Boolean);

    if (actions.length > 1) {
      mixedCount++;
    } else if (raiseFreq >= 0.5) {
      raiseCount++;
    } else if (strategy.call >= 0.5) {
      callCount++;
    } else {
      foldCount++;
    }
  }

  return { foldCount, callCount, raiseCount, mixedCount };
}
