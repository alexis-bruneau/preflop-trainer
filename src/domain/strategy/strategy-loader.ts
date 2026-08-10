/**
 * strategy-loader.ts
 * Loads and registers strategy profiles. Runs validation on load.
 * This is the entry point for all strategy data initialization.
 */

import { RANGECONVERTER_9MAX_100BB_PROFILE } from '../../data/strategies/rangeconverter-9max-100bb';
import { registerProfile } from './strategy-engine';
import { validateStrategyProfile } from './strategy-validator';
import type { StrategyProfile } from './types';

let initialized = false;

/**
 * Initialize the strategy engine with all bundled profiles.
 * Must be called before any strategy lookups.
 * Safe to call multiple times (idempotent).
 */
export function initializeStrategyEngine(): void {
  if (initialized) return;

  const profiles: StrategyProfile[] = [RANGECONVERTER_9MAX_100BB_PROFILE];

  for (const profile of profiles) {
    if (process.env.NODE_ENV !== 'production') {
      // Validate in development — throw on errors
      const report = validateStrategyProfile(profile);
      if (!report.passed) {
        console.error(`Strategy validation failed for ${profile.metadata.id}:`);
        report.errors.forEach((e) => console.error('  ✗', e));
        throw new Error(
          `Strategy validation failed for ${profile.metadata.id}. See console for details.`
        );
      }
      if (report.warnings.length > 0) {
        console.warn(`Strategy warnings for ${profile.metadata.id}:`);
        report.warnings.forEach((w) => console.warn('  ⚠', w));
      }
      console.log(
        `✓ Strategy profile loaded: ${profile.metadata.name} (${report.totalNodes} nodes, ${report.totalHands} hands)`
      );
    }

    registerProfile(profile);
  }

  initialized = true;
}

/**
 * Get the default (first) profile ID.
 */
export function getDefaultProfileId(): string {
  return RANGECONVERTER_9MAX_100BB_PROFILE.metadata.id;
}

/**
 * Reset initialization state (for testing).
 */
export function resetStrategyEngine(): void {
  initialized = false;
}
