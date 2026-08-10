'use client';

import React, { useEffect, useState } from 'react';
import { initializeStrategyEngine } from '@/domain/strategy/strategy-loader';
import { getAllDecisionNodes, getProfile } from '@/domain/strategy/strategy-engine';
import type { DecisionNode } from '@/domain/strategy/types';
import { SCENARIO_DISPLAY_NAMES, SCENARIO_SHORT_NAMES } from '@/domain/poker/actions';
import type { ScenarioType } from '@/domain/poker/actions';
import { POSITION_DISPLAY_NAMES } from '@/domain/poker/positions';
import { RangeMatrix } from '@/components/ranges/RangeMatrix';
import type { HandClass } from '@/domain/poker/cards';

const DEFAULT_PROFILE_ID = 'rangeconverter-9max-100bb';

export default function RangesPage() {
  const [engineReady, setEngineReady] = useState(false);
  const [allNodes, setAllNodes] = useState<DecisionNode[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<ScenarioType | 'ALL'>('ALL');
  const [selectedNode, setSelectedNode] = useState<DecisionNode | null>(null);
  const [selectedHand, setSelectedHand] = useState<HandClass | undefined>();

  useEffect(() => {
    try {
      initializeStrategyEngine();
      const nodes = getAllDecisionNodes(DEFAULT_PROFILE_ID);
      setAllNodes(nodes);
      if (nodes.length > 0) setSelectedNode(nodes[0]);
      setEngineReady(true);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const profile = engineReady ? getProfile(DEFAULT_PROFILE_ID) : null;

  // Filter nodes by scenario
  const filteredNodes = selectedScenario === 'ALL'
    ? allNodes
    : allNodes.filter((n) => n.scenarioType === selectedScenario);

  const scenarioTypes: Array<ScenarioType | 'ALL'> = ['ALL', 'RFI', 'VS_RFI', 'VS_3BET'];

  if (!engineReady) {
    return (
      <div style={{ textAlign: 'center', padding: '80px', color: 'var(--text-muted)' }}>
        Loading strategy data...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 16px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '2rem',
            fontWeight: 800,
            color: 'var(--text-primary)',
            margin: '0 0 8px',
            letterSpacing: '-0.02em',
          }}
        >
          Range Explorer
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
          Browse GTO strategy for every position and scenario.
        </p>
        {profile && (
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '8px' }}>
            Strategy: {profile.metadata.name} •{' '}
            Source: <a href={profile.metadata.source.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--gold)', textDecoration: 'none' }}>
              {profile.metadata.source.name}
            </a>
            {' '}• Rake: Unknown
          </p>
        )}
      </div>

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        {/* Left: Node selector */}
        <div style={{ width: '260px', flexShrink: 0 }}>
          {/* Scenario filter */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '8px' }}>
              Scenario
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {scenarioTypes.map((st) => (
                <button
                  key={st}
                  onClick={() => setSelectedScenario(st)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    border: selectedScenario === st
                      ? '1px solid rgba(212, 168, 67, 0.5)'
                      : '1px solid rgba(255,255,255,0.08)',
                    background: selectedScenario === st
                      ? 'rgba(212, 168, 67, 0.12)'
                      : 'rgba(255,255,255,0.03)',
                    color: selectedScenario === st ? 'var(--gold)' : 'var(--text-secondary)',
                    cursor: 'pointer',
                  }}
                >
                  {st === 'ALL' ? 'All' : SCENARIO_SHORT_NAMES[st]}
                </button>
              ))}
            </div>
          </div>

          {/* Node list */}
          <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
            {filteredNodes.map((node) => (
              <button
                key={node.id}
                onClick={() => { setSelectedNode(node); setSelectedHand(undefined); }}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  padding: '10px 12px',
                  marginBottom: '4px',
                  borderRadius: '8px',
                  border: selectedNode?.id === node.id
                    ? '1px solid rgba(212, 168, 67, 0.4)'
                    : '1px solid rgba(255,255,255,0.05)',
                  background: selectedNode?.id === node.id
                    ? 'rgba(212, 168, 67, 0.08)'
                    : 'rgba(255,255,255,0.02)',
                  cursor: 'pointer',
                  transition: 'all 0.1s ease',
                }}
              >
                <div
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: selectedNode?.id === node.id ? 'var(--gold)' : 'var(--text-primary)',
                    marginBottom: '2px',
                  }}
                >
                  {node.description}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  {SCENARIO_SHORT_NAMES[node.scenarioType]} — Hero: {POSITION_DISPLAY_NAMES[node.heroPosition]}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Range matrix */}
        <div style={{ flex: 1, minWidth: '300px' }}>
          {selectedNode ? (
            <div>
              <div style={{ marginBottom: '16px' }}>
                <h2
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 700,
                    fontSize: '1.2rem',
                    color: 'var(--text-primary)',
                    margin: '0 0 4px',
                  }}
                >
                  {selectedNode.description}
                </h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                  {SCENARIO_DISPLAY_NAMES[selectedNode.scenarioType]} — Click a hand to inspect
                </p>
              </div>

              <RangeMatrix
                node={selectedNode}
                highlightedHand={selectedHand}
                onHandSelect={setSelectedHand}
              />
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '80px 24px', color: 'var(--text-muted)' }}>
              Select a scenario from the left to view the range matrix.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
