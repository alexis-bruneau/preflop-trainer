'use client';

import React, { useState, useMemo } from 'react';
import { RANKS_DESC, getHandClassAt, handClassToMatrixPos } from '@/domain/poker/hands';
import { getTotalRaiseFrequency, isMixedStrategy } from '@/domain/strategy/types';
import type { DecisionNode } from '@/domain/strategy/types';
import type { HandClass } from '@/domain/poker/cards';
import { formatPct } from '@/lib/utils';

interface RangeMatrixProps {
  node: DecisionNode;
  highlightedHand?: HandClass;
  onHandSelect?: (handClass: HandClass) => void;
}

export function RangeMatrix({ node, highlightedHand, onHandSelect }: RangeMatrixProps) {
  const [hoveredHand, setHoveredHand] = useState<HandClass | null>(null);

  const selectedHand = hoveredHand ?? highlightedHand;

  // Get strategy for selected hand
  const selectedStrategy = selectedHand ? node.strategy[selectedHand] : null;

  return (
    <div>
      {/* Matrix grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(13, 1fr)',
          gap: '2px',
          marginBottom: '16px',
        }}
        role="grid"
        aria-label="169-hand range matrix"
      >
        {/* Column headers */}
        {RANKS_DESC.map((rank) => (
          <div
            key={`col-${rank}`}
            style={{
              textAlign: 'center',
              fontSize: '9px',
              color: 'var(--text-muted)',
              fontWeight: 600,
              paddingBottom: '2px',
            }}
          >
            {rank}
          </div>
        ))}

        {/* Cells */}
        {RANKS_DESC.map((rowRank, rowIdx) =>
          RANKS_DESC.map((colRank, colIdx) => {
            const handClass = getHandClassAt(rowIdx, colIdx);
            const strategy = node.strategy[handClass];
            const isHighlighted = handClass === highlightedHand;
            const isHovered = handClass === hoveredHand;

            const raiseFreq = getTotalRaiseFrequency(strategy);
            const cellColor = getCellColor(strategy.fold, strategy.call, raiseFreq);

            return (
              <div
                key={handClass}
                className={`range-matrix-cell ${cellColor} ${isHighlighted ? 'range-cell-highlight' : ''}`}
                style={{
                  cursor: 'pointer',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onClick={() => onHandSelect?.(handClass)}
                onMouseEnter={() => setHoveredHand(handClass)}
                onMouseLeave={() => setHoveredHand(null)}
                role="gridcell"
                aria-label={`${handClass}: Fold ${formatPct(strategy.fold)}, Call ${formatPct(strategy.call)}, Raise ${formatPct(raiseFreq)}`}
                title={`${handClass}: F${formatPct(strategy.fold)} C${formatPct(strategy.call)} R${formatPct(raiseFreq)}`}
              >
                {/* Mixed strategy visual split */}
                {strategy.call > 0.04 && raiseFreq > 0.04 && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: `linear-gradient(135deg, rgba(74,222,128,0.5) 0%, rgba(74,222,128,0.5) 50%, rgba(96,165,250,0.5) 50%, rgba(96,165,250,0.5) 100%)`,
                    }}
                  />
                )}
                {strategy.fold > 0.04 && raiseFreq > 0.04 && strategy.call < 0.04 && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: `linear-gradient(135deg, rgba(74,222,128,0.5) 0%, rgba(74,222,128,0.5) 50%, rgba(239,68,68,0.15) 50%, rgba(239,68,68,0.15) 100%)`,
                    }}
                  />
                )}
                {strategy.fold > 0.04 && strategy.call > 0.04 && raiseFreq < 0.04 && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: `linear-gradient(135deg, rgba(96,165,250,0.5) 0%, rgba(96,165,250,0.5) 50%, rgba(239,68,68,0.15) 50%, rgba(239,68,68,0.15) 100%)`,
                    }}
                  />
                )}

                {/* Hand label */}
                <span
                  style={{
                    fontSize: '7px',
                    fontWeight: 700,
                    color: 'rgba(255,255,255,0.7)',
                    position: 'relative',
                    zIndex: 1,
                    lineHeight: 1,
                    userSelect: 'none',
                  }}
                >
                  {handClass}
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* Hand detail panel */}
      {selectedStrategy && selectedHand && (
        <HandDetailPanel handClass={selectedHand} strategy={selectedStrategy} />
      )}

      {/* Legend */}
      <RangeLegend />
    </div>
  );
}

function getCellColor(fold: number, call: number, raise: number): string {
  const THRESH = 0.04;
  const hasFold = fold > THRESH;
  const hasCall = call > THRESH;
  const hasRaise = raise > THRESH;

  const actions = [hasFold, hasCall, hasRaise].filter(Boolean).length;
  if (actions > 1) return 'range-cell-mixed';
  if (hasRaise) return 'range-cell-raise';
  if (hasCall) return 'range-cell-call';
  return 'range-cell-fold';
}

// ─── Hand Detail Panel ────────────────────────────────────────────────────────

function HandDetailPanel({ handClass, strategy }: { handClass: HandClass; strategy: any }) {
  const raiseFreq = getTotalRaiseFrequency(strategy);

  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '8px',
        padding: '12px 16px',
        marginBottom: '12px',
        display: 'flex',
        gap: '16px',
        alignItems: 'center',
        flexWrap: 'wrap',
      }}
    >
      <span
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 800,
          fontSize: '1.2rem',
          color: 'var(--gold)',
          minWidth: '40px',
        }}
      >
        {handClass}
      </span>

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        {strategy.fold > 0.01 && (
          <span style={{ fontSize: '0.85rem', color: '#f87171' }}>
            Fold: <strong>{formatPct(strategy.fold)}</strong>
          </span>
        )}
        {strategy.call > 0.01 && (
          <span style={{ fontSize: '0.85rem', color: '#60a5fa' }}>
            Call: <strong>{formatPct(strategy.call)}</strong>
          </span>
        )}
        {raiseFreq > 0.01 && (
          <span style={{ fontSize: '0.85rem', color: '#4ade80' }}>
            Raise: <strong>{formatPct(raiseFreq)}</strong>
            {strategy.raises.length === 1 && (
              <span style={{ opacity: 0.7, fontSize: '0.75rem' }}>
                {' '}({strategy.raises[0].toBB}BB)
              </span>
            )}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Range Legend ─────────────────────────────────────────────────────────────

export function RangeLegend() {
  const items = [
    { color: 'rgba(74,222,128,0.3)', border: 'rgba(74,222,128,0.5)', label: 'Raise' },
    { color: 'rgba(96,165,250,0.3)', border: 'rgba(96,165,250,0.5)', label: 'Call' },
    { color: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.3)', label: 'Fold' },
    {
      color: 'linear-gradient(135deg, rgba(74,222,128,0.4) 50%, rgba(96,165,250,0.4) 50%)',
      border: 'rgba(255,255,255,0.1)',
      label: 'Mixed',
    },
  ];

  return (
    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '8px' }}>
      {items.map((item) => (
        <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div
            style={{
              width: '16px',
              height: '16px',
              borderRadius: '3px',
              background: item.color,
              border: `1px solid ${item.border}`,
            }}
          />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{item.label}</span>
        </div>
      ))}
    </div>
  );
}
