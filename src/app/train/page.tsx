'use client';

import React, { useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { PokerTable } from '@/components/poker/PokerTable';
import { ActionButtons } from '@/components/trainer/ActionButtons';
import { FeedbackPanel } from '@/components/trainer/FeedbackPanel';
import { RangeMatrix } from '@/components/ranges/RangeMatrix';
import { useTrainerStore } from '@/lib/useTrainerStore';
import { initializeStrategyEngine } from '@/domain/strategy/strategy-loader';
import { getDecisionNodeById } from '@/domain/strategy/strategy-engine';
import { SCENARIO_DISPLAY_NAMES } from '@/domain/poker/actions';
import type { ScenarioType, HeroDecision } from '@/domain/poker/actions';
import type { Position } from '@/domain/poker/positions';
import { POSITION_DISPLAY_NAMES, POSITIONS } from '@/domain/poker/positions';
import { formatAccuracy, formatPct } from '@/lib/utils';

// ─── Session Score Bar ────────────────────────────────────────────────────────

function SessionScoreBar() {
  const { sessionMetrics } = useTrainerStore();
  const { totalAnswered, accuracy, currentStreak } = sessionMetrics;

  return (
    <div
      style={{
        display: 'flex',
        gap: '20px',
        alignItems: 'center',
        flexWrap: 'wrap',
      }}
    >
      <ScorePill label="Accuracy" value={totalAnswered > 0 ? formatAccuracy(accuracy) : '—'} />
      <ScorePill label="Streak" value={currentStreak.toString()} />
      <ScorePill label="Hands" value={totalAnswered.toString()} />
    </div>
  );
}

function ScorePill({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 800,
          fontSize: '1.3rem',
          color: 'var(--gold)',
          lineHeight: 1,
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: '0.65rem',
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          marginTop: '2px',
        }}
      >
        {label}
      </div>
    </div>
  );
}

// ─── Filters Panel ────────────────────────────────────────────────────────────

const SCENARIO_OPTIONS: Array<{ value: ScenarioType | 'ALL'; label: string }> = [
  { value: 'ALL', label: 'All Spots' },
  { value: 'RFI', label: 'RFI Only' },
  { value: 'VS_RFI', label: 'Facing Raise' },
  { value: 'VS_3BET', label: 'Facing 3-Bet' },
];

function FiltersPanel() {
  const { settings, updateSettings } = useTrainerStore();

  const currentScenario =
    settings.scenarioFilter?.length === 1 ? settings.scenarioFilter[0] : 'ALL';

  const togglePosition = (pos: Position) => {
    const current = settings.positionFilter ?? [];
    const next = current.includes(pos)
      ? current.filter((p) => p !== pos)
      : [...current, pos];
    updateSettings({ positionFilter: next.length === 0 ? null : next });
  };

  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '16px',
      }}
    >
      {/* Scenario filter */}
      <div style={{ marginBottom: '12px' }}>
        <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '8px' }}>
          Scenario
        </label>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {SCENARIO_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => updateSettings({
                scenarioFilter: opt.value === 'ALL' ? null : [opt.value as ScenarioType]
              })}
              style={{
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '0.75rem',
                fontWeight: 600,
                border: currentScenario === opt.value
                  ? '1px solid rgba(212, 168, 67, 0.6)'
                  : '1px solid rgba(255,255,255,0.1)',
                background: currentScenario === opt.value
                  ? 'rgba(212, 168, 67, 0.12)'
                  : 'rgba(255,255,255,0.03)',
                color: currentScenario === opt.value ? 'var(--gold)' : 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Position filter */}
      <div>
        <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '8px' }}>
          Hero Position{' '}
          {settings.positionFilter && (
            <button
              onClick={() => updateSettings({ positionFilter: null })}
              style={{ marginLeft: '8px', fontSize: '0.65rem', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Clear
            </button>
          )}
        </label>
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {POSITIONS.map((pos) => {
            const isActive = settings.positionFilter?.includes(pos) ?? false;
            const isFiltered = !!settings.positionFilter;
            return (
              <button
                key={pos}
                onClick={() => togglePosition(pos)}
                style={{
                  padding: '3px 10px',
                  borderRadius: '6px',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  border: isActive
                    ? '1px solid rgba(74, 222, 128, 0.5)'
                    : '1px solid rgba(255,255,255,0.08)',
                  background: isActive
                    ? 'rgba(74, 222, 128, 0.12)'
                    : 'rgba(255,255,255,0.03)',
                  color: isActive ? '#4ade80' : (isFiltered ? 'var(--text-muted)' : 'var(--text-secondary)'),
                  cursor: 'pointer',
                  opacity: isFiltered && !isActive ? 0.5 : 1,
                  transition: 'all 0.1s ease',
                }}
              >
                {POSITION_DISPLAY_NAMES[pos]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Mode toggle */}
      <div style={{ marginTop: '12px', display: 'flex', gap: '8px', alignItems: 'center' }}>
        <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Mode:
        </label>
        {(['trainer', 'realistic'] as const).map((m) => (
          <button
            key={m}
            onClick={() => updateSettings({ questionMode: m })}
            style={{
              padding: '3px 10px',
              borderRadius: '6px',
              fontSize: '0.72rem',
              fontWeight: 600,
              border: settings.questionMode === m
                ? '1px solid rgba(212, 168, 67, 0.5)'
                : '1px solid rgba(255,255,255,0.08)',
              background: settings.questionMode === m
                ? 'rgba(212, 168, 67, 0.12)'
                : 'rgba(255,255,255,0.03)',
              color: settings.questionMode === m ? 'var(--gold)' : 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'all 0.1s ease',
              textTransform: 'capitalize',
            }}
          >
            {m}
          </button>
        ))}
        
        <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginLeft: '8px' }}>
          Scoring:
        </label>
        {(['practical', 'randomizer'] as const).map((m) => (
          <button
            key={m}
            onClick={() => updateSettings({ scoringMode: m })}
            style={{
              padding: '3px 10px',
              borderRadius: '6px',
              fontSize: '0.72rem',
              fontWeight: 600,
              border: settings.scoringMode === m
                ? '1px solid rgba(212, 168, 67, 0.5)'
                : '1px solid rgba(255,255,255,0.08)',
              background: settings.scoringMode === m
                ? 'rgba(212, 168, 67, 0.12)'
                : 'rgba(255,255,255,0.03)',
              color: settings.scoringMode === m ? 'var(--gold)' : 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'all 0.1s ease',
              textTransform: 'capitalize',
            }}
          >
            {m}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Main Train Page ──────────────────────────────────────────────────────────

function TrainContent() {
  const {
    phase,
    currentQuestion,
    lastResult,
    showRangeMatrix,
    sessionMetrics,
    settings,
    startNewSession,
    nextQuestion,
    submitAnswer,
    toggleRangeMatrix,
    updateSettings,
    initializeEngine,
  } = useTrainerStore();

  const searchParams = useSearchParams();

  // Initialize on mount
  useEffect(() => {
    initializeEngine();

    // Apply URL-based filters
    const scenario = searchParams.get('scenario') as ScenarioType | null;
    const weakness = searchParams.get('weakness');

    if (scenario && ['RFI', 'VS_RFI', 'VS_3BET'].includes(scenario)) {
      updateSettings({ scenarioFilter: [scenario] });
    }
    if (weakness === '1') {
      updateSettings({ weaknessMode: true });
    }

    startNewSession();
  }, []);

  // Get decision node for range matrix
  const decisionNode = currentQuestion
    ? getDecisionNodeById(currentQuestion.profileId, currentQuestion.nodeId)
    : null;

  if (phase === 'idle') {
    return (
      <div style={{ textAlign: 'center', padding: '80px 24px' }}>
        <button
          className="btn-action btn-raise"
          onClick={startNewSession}
          style={{ fontSize: '1.1rem' }}
        >
          Start Training
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: '900px',
        margin: '0 auto',
        padding: '20px 16px',
      }}
    >
      {/* Top bar: session score + filters toggle */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <SessionScoreBar />

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {/* Situation label */}
          {currentQuestion && (
            <div
              style={{
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '8px',
                padding: '4px 10px',
              }}
            >
              {currentQuestion.description}
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <FiltersPanel />

      {/* Poker Table */}
      {currentQuestion && (
        <div
          style={{
            marginBottom: '20px',
            borderRadius: '16px',
            overflow: 'hidden',
            background: 'var(--bg-surface)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <PokerTable
            heroPosition={currentQuestion.heroPosition}
            heroCards={currentQuestion.heroCards}
            actionHistory={currentQuestion.displayActionHistory}
            potBB={currentQuestion.potBB}
            showHeroCards
          />
        </div>
      )}

      {/* Hand info */}
      {currentQuestion && (
        <div
          style={{
            textAlign: 'center',
            marginBottom: '16px',
          }}
        >
          <p
            style={{
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}
          >
            {SCENARIO_DISPLAY_NAMES[currentQuestion.scenarioType]}
            {currentQuestion.randomizerValue != null && (
              <span style={{ marginLeft: '12px', color: 'var(--gold)' }}>
                Randomizer: {currentQuestion.randomizerValue}
              </span>
            )}
          </p>
        </div>
      )}

      {/* Action Buttons */}
      {currentQuestion && (
        <div style={{ marginBottom: '20px' }}>
          <ActionButtons
            scenarioType={currentQuestion.scenarioType}
            onAction={submitAnswer}
            disabled={phase === 'feedback'}
            isAnswered={phase === 'feedback'}
            onNext={nextQuestion}
          />
        </div>
      )}

      {/* Feedback Panel */}
      {phase === 'feedback' && lastResult && currentQuestion && (
        <div style={{ marginBottom: '20px' }}>
          <FeedbackPanel
            result={lastResult}
            handClass={currentQuestion.handClass}
            scenarioType={currentQuestion.scenarioType}
            showPercentages={settings.showPercentagesAfterAnswer}
          />
        </div>
      )}

      {/* View Range button */}
      {phase === 'feedback' && decisionNode && (
        <div style={{ marginBottom: '16px' }}>
          <button
            onClick={toggleRangeMatrix}
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              padding: '8px 16px',
              color: 'var(--text-secondary)',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              width: '100%',
            }}
          >
            {showRangeMatrix ? '▲ Hide Range' : '▼ View Range'}
            {' '}— {decisionNode.description}
          </button>

          {showRangeMatrix && (
            <div
              className="animate-slide-up"
              style={{
                marginTop: '12px',
                background: 'var(--bg-surface)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '12px',
                padding: '16px',
              }}
            >
              <RangeMatrix
                node={decisionNode}
                highlightedHand={currentQuestion?.handClass}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function TrainPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '80px' }}>Loading...</div>}>
      <TrainContent />
    </Suspense>
  );
}
