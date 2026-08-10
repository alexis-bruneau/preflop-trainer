'use client';

import React from 'react';
import type { ScoringResult } from '@/domain/trainer/answer-scorer';
import { formatPct } from '@/lib/utils';

interface FeedbackPanelProps {
  result: ScoringResult;
  handClass: string;
  scenarioType: string;
  showPercentages: boolean;
}

export function FeedbackPanel({ result, handClass, showPercentages }: FeedbackPanelProps) {
  const { valid, isMixed, frequencies, chosenAction, raiseSizes, randomizerValue, expectedAction } = result;

  // Determine panel style
  const panelClass = !valid
    ? 'feedback-incorrect'
    : isMixed
    ? 'feedback-mixed'
    : 'feedback-correct';

  const statusIcon = valid ? '✓' : '✗';
  const statusColor = valid ? '#4ade80' : '#f87171';
  const statusLabel = !valid
    ? 'Incorrect'
    : isMixed
    ? 'Valid GTO Action'
    : 'Correct';

  const actionLabel = (a: string) => a.charAt(0).toUpperCase() + a.slice(1);

  return (
    <div
      className={`feedback-panel ${panelClass}`}
      style={{
        borderRadius: '12px',
        padding: '16px 20px',
      }}
      role="alert"
      aria-live="polite"
    >
      {/* Status header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '10px',
        }}
      >
        <span
          style={{
            fontSize: '18px',
            fontWeight: 700,
            color: statusColor,
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            background: `${statusColor}20`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
          }}
        >
          {statusIcon}
        </span>
        <span
          style={{
            fontSize: '1rem',
            fontWeight: 700,
            color: statusColor,
            fontFamily: 'var(--font-display)',
          }}
        >
          {statusLabel}
        </span>

        {/* Show chosen action */}
        <span
          style={{
            fontSize: '0.8rem',
            color: 'var(--text-secondary)',
            marginLeft: 'auto',
          }}
        >
          You chose: <strong style={{ color: 'var(--text-primary)' }}>{actionLabel(chosenAction)}</strong>
        </span>
      </div>

      {/* Randomizer info */}
      {randomizerValue != null && expectedAction && (
        <div
          style={{
            fontSize: '0.85rem',
            color: 'var(--text-secondary)',
            marginBottom: '10px',
            padding: '6px 10px',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '6px',
          }}
        >
          Randomizer: <strong style={{ color: 'var(--gold)' }}>{randomizerValue}</strong>
          {' → '}
          Expected: <strong style={{ color: 'var(--text-primary)' }}>{actionLabel(expectedAction)}</strong>
        </div>
      )}

      {/* Feedback message */}
      <p
        style={{
          fontSize: '0.875rem',
          color: 'var(--text-secondary)',
          margin: '0 0 12px',
          lineHeight: 1.5,
        }}
      >
        {result.feedback}
      </p>

      {/* Strategy frequencies */}
      {showPercentages && (
        <div>
          <div
            style={{
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              fontWeight: 600,
              marginBottom: '8px',
            }}
          >
            GTO Strategy — {handClass}
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {/* Fold frequency */}
            {frequencies.fold > 0 && (
              <FrequencyBar
                action="fold"
                frequency={frequencies.fold}
                isChosen={chosenAction === 'fold'}
              />
            )}
            {/* Call frequency */}
            {frequencies.call > 0 && (
              <FrequencyBar
                action="call"
                frequency={frequencies.call}
                isChosen={chosenAction === 'call'}
              />
            )}
            {/* Raise frequency */}
            {frequencies.raise > 0 && (
              <FrequencyBar
                action="raise"
                frequency={frequencies.raise}
                isChosen={chosenAction === 'raise'}
                raiseSizes={raiseSizes}
              />
            )}
          </div>

          {/* Raise sizing details */}
          {raiseSizes.length > 1 && (
            <div
              style={{
                marginTop: '8px',
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
              }}
            >
              Sizing breakdown:{' '}
              {raiseSizes.map((rs, i) => (
                <span key={i}>
                  {rs.toBB}BB ({formatPct(rs.frequency)})
                  {i < raiseSizes.length - 1 ? ', ' : ''}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Frequency Bar ────────────────────────────────────────────────────────────

function FrequencyBar({
  action,
  frequency,
  isChosen,
  raiseSizes,
}: {
  action: 'fold' | 'call' | 'raise';
  frequency: number;
  isChosen: boolean;
  raiseSizes?: Array<{ toBB: number; frequency: number }>;
}) {
  const colors = {
    fold: { bg: 'rgba(239, 68, 68, 0.15)', text: '#f87171', bar: '#ef4444' },
    call: { bg: 'rgba(96, 165, 250, 0.15)', text: '#60a5fa', bar: '#3b82f6' },
    raise: { bg: 'rgba(74, 222, 128, 0.15)', text: '#4ade80', bar: '#22c55e' },
  };

  const c = colors[action];
  const label = action.charAt(0).toUpperCase() + action.slice(1);
  const sizeInfo = action === 'raise' && raiseSizes?.length === 1
    ? ` ${raiseSizes[0].toBB}BB`
    : '';

  return (
    <div
      style={{
        background: c.bg,
        border: `1px solid ${c.bar}30`,
        borderRadius: '8px',
        padding: '8px 12px',
        flex: 1,
        minWidth: '80px',
        outline: isChosen ? `2px solid ${c.bar}60` : 'none',
        outlineOffset: '1px',
      }}
    >
      <div style={{ fontSize: '0.75rem', color: c.text, fontWeight: 600, marginBottom: '4px' }}>
        {label}{sizeInfo}
        {isChosen && (
          <span style={{ marginLeft: '4px', fontSize: '0.7rem', opacity: 0.7 }}>← your pick</span>
        )}
      </div>
      {/* Progress bar */}
      <div
        style={{
          height: '4px',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '2px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${frequency * 100}%`,
            background: c.bar,
            borderRadius: '2px',
            transition: 'width 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        />
      </div>
      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px', fontFamily: 'var(--font-display)' }}>
        {formatPct(frequency)}
      </div>
    </div>
  );
}
