'use client';

import React, { useEffect, useCallback } from 'react';
import type { HeroDecision, ScenarioType } from '@/domain/poker/actions';
import { getAvailableDecisions, getRaiseLabel } from '@/domain/poker/actions';
import { cn } from '@/lib/utils';

interface ActionButtonsProps {
  scenarioType: ScenarioType;
  onAction: (action: HeroDecision) => void;
  disabled?: boolean;
  isAnswered?: boolean;
  onNext?: () => void;
}

export function ActionButtons({
  scenarioType,
  onAction,
  disabled = false,
  isAnswered = false,
  onNext,
}: ActionButtonsProps) {
  const availableActions = getAvailableDecisions(scenarioType);
  const raiseLabel = getRaiseLabel(scenarioType);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const key = e.key.toLowerCase();

      if (isAnswered) {
        if (key === ' ' || key === 'enter' || key === 'n') {
          e.preventDefault();
          onNext?.();
        }
        return;
      }

      if (disabled) return;

      if (key === 'f' && availableActions.includes('fold')) {
        onAction('fold');
      } else if (key === 'c' && availableActions.includes('call')) {
        onAction('call');
      } else if (key === 'r' && availableActions.includes('raise')) {
        onAction('raise');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [availableActions, onAction, disabled, isAnswered, onNext]);

  if (isAnswered) {
    return (
      <div style={{ textAlign: 'center' }}>
        <button
          onClick={onNext}
          className="btn-action"
          style={{
            background: 'linear-gradient(135deg, rgba(212, 168, 67, 0.2), rgba(184, 140, 46, 0.15))',
            color: 'var(--gold)',
            border: '1px solid rgba(212, 168, 67, 0.4)',
            boxShadow: '0 4px 15px rgba(212, 168, 67, 0.15)',
            padding: '0.875rem 3rem',
          }}
          aria-label="Next hand (Space / N)"
        >
          NEXT HAND
          <span
            style={{
              fontSize: '0.7rem',
              opacity: 0.6,
              marginLeft: '8px',
              verticalAlign: 'middle',
            }}
          >
            [SPACE]
          </span>
        </button>
      </div>
    );
  }

  return (
    <div>
      <p
        style={{
          textAlign: 'center',
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
          marginBottom: '12px',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          fontWeight: 500,
        }}
      >
        What should you do?
      </p>

      <div
        style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'center',
          flexWrap: 'wrap',
        }}
      >
        {/* FOLD */}
        <button
          id="btn-fold"
          className="btn-action btn-fold"
          onClick={() => onAction('fold')}
          disabled={disabled}
          aria-label="Fold (F)"
          title="Fold [F]"
        >
          FOLD
          <span style={{ fontSize: '0.7rem', opacity: 0.6, marginLeft: '6px' }}>[F]</span>
        </button>

        {/* CALL */}
        {availableActions.includes('call') && (
          <button
            id="btn-call"
            className="btn-action btn-call"
            onClick={() => onAction('call')}
            disabled={disabled}
            aria-label="Call (C)"
            title="Call [C]"
          >
            CALL
            <span style={{ fontSize: '0.7rem', opacity: 0.6, marginLeft: '6px' }}>[C]</span>
          </button>
        )}

        {/* RAISE */}
        {availableActions.includes('raise') && (
          <button
            id="btn-raise"
            className="btn-action btn-raise"
            onClick={() => onAction('raise')}
            disabled={disabled}
            aria-label={`${raiseLabel} (R)`}
            title={`${raiseLabel} [R]`}
          >
            {raiseLabel.toUpperCase()}
            <span style={{ fontSize: '0.7rem', opacity: 0.6, marginLeft: '6px' }}>[R]</span>
          </button>
        )}
      </div>
    </div>
  );
}
