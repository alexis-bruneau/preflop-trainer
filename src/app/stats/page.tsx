'use client';

import React, { useEffect, useState } from 'react';
import { localStatsRepository } from '@/repositories/stats/LocalStatsRepository';
import type { TrainingStats } from '@/repositories/stats/StatsRepository';
import { SCENARIO_SHORT_NAMES } from '@/domain/poker/actions';
import type { ScenarioType } from '@/domain/poker/actions';
import { POSITION_DISPLAY_NAMES } from '@/domain/poker/positions';
import type { Position } from '@/domain/poker/positions';
import { formatAccuracy, formatTime } from '@/lib/utils';

export default function StatsPage() {
  const [stats, setStats] = useState<TrainingStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    localStatsRepository.getStats().then((s) => {
      setStats(s);
      setLoading(false);
    });
  }, []);

  const handleReset = async () => {
    if (!window.confirm('Reset all training statistics? This cannot be undone.')) return;
    await localStatsRepository.resetStats();
    setStats(await localStatsRepository.getStats());
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '80px', color: 'var(--text-muted)' }}>Loading stats...</div>;
  }

  if (!stats || stats.totalAnswered === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 24px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--text-primary)', marginBottom: '16px' }}>
          Statistics
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>No training data yet. Start practicing to track your progress!</p>
        <a href="/train" style={{ display: 'inline-block', marginTop: '24px', textDecoration: 'none' }}>
          <button className="btn-action btn-raise">Start Training</button>
        </a>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '32px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
            Statistics
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '8px 0 0' }}>
            Your preflop training performance
          </p>
        </div>
        <button
          onClick={handleReset}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#f87171',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Reset Stats
        </button>
      </div>

      {/* Overview */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '12px',
          marginBottom: '32px',
        }}
      >
        <OverviewCard label="Overall Accuracy" value={formatAccuracy(stats.accuracy)} highlight />
        <OverviewCard label="Total Hands" value={stats.totalAnswered.toLocaleString()} />
        <OverviewCard label="Correct" value={stats.totalCorrect.toLocaleString()} />
        <OverviewCard label="Best Streak" value={stats.longestStreak.toString()} />
        <OverviewCard label="Avg Decision" value={formatTime(stats.averageResponseTimeMs)} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        {/* By Scenario */}
        <div className="stat-card">
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', margin: '0 0 16px' }}>
            By Scenario
          </h3>
          {(['RFI', 'VS_RFI', 'VS_3BET'] as ScenarioType[]).map((st) => {
            const data = stats.byScenario[st];
            if (!data || data.total === 0) return null;
            return (
              <AccuracyRow
                key={st}
                label={SCENARIO_SHORT_NAMES[st]}
                total={data.total}
                accuracy={data.accuracy}
              />
            );
          })}
        </div>

        {/* By Position */}
        <div className="stat-card">
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', margin: '0 0 16px' }}>
            By Position
          </h3>
          {(['UTG', 'UTG1', 'MP', 'LJ', 'HJ', 'CO', 'BTN', 'SB', 'BB'] as Position[]).map((pos) => {
            const data = stats.byPosition[pos];
            if (!data || data.total === 0) return null;
            return (
              <AccuracyRow
                key={pos}
                label={POSITION_DISPLAY_NAMES[pos]}
                total={data.total}
                accuracy={data.accuracy}
              />
            );
          })}
        </div>
      </div>

      {/* Decision nodes */}
      {stats.byNode.length > 0 && (
        <div className="stat-card" style={{ marginBottom: '20px' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', margin: '0 0 16px' }}>
            By Spot (Weakest First)
          </h3>
          <div style={{ display: 'grid', gap: '4px' }}>
            {stats.byNode.slice(0, 12).map((node) => (
              <AccuracyRow
                key={node.nodeId}
                label={node.description}
                total={node.totalAnswered}
                accuracy={node.accuracy}
              />
            ))}
          </div>
        </div>
      )}

      {/* Most missed hands */}
      {stats.weakestHands.length > 0 && (
        <div className="stat-card">
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', margin: '0 0 16px' }}>
            Most Missed Hands
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px' }}>
            {stats.weakestHands.slice(0, 12).map((h) => (
              <div
                key={`${h.nodeId}::${h.handClass}`}
                style={{
                  padding: '10px 12px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(239, 68, 68, 0.15)',
                  borderRadius: '8px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--gold)', fontSize: '1rem' }}>
                    {h.handClass}
                  </span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: h.accuracy < 0.5 ? '#f87171' : '#fbbf24' }}>
                    {formatAccuracy(h.accuracy)}
                  </span>
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  {h.description} • {h.totalAnswered} attempts
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function OverviewCard({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div
      style={{
        background: highlight ? 'rgba(212, 168, 67, 0.08)' : 'var(--bg-surface)',
        border: highlight ? '1px solid rgba(212, 168, 67, 0.25)' : '1px solid rgba(255,255,255,0.06)',
        borderRadius: '12px',
        padding: '16px',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.8rem',
          fontWeight: 800,
          color: highlight ? 'var(--gold)' : 'var(--text-primary)',
          lineHeight: 1,
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '6px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        {label}
      </div>
    </div>
  );
}

function AccuracyRow({ label, total, accuracy }: { label: string; total: number; accuracy: number }) {
  const pct = Math.round(accuracy * 100);
  const color = pct >= 80 ? '#4ade80' : pct >= 60 ? '#fbbf24' : '#f87171';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
      <span style={{ flex: 1, fontSize: '0.82rem', color: 'var(--text-secondary)', minWidth: '0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {label}
      </span>
      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', flexShrink: 0 }}>
        {total}
      </span>
      <div style={{ width: '60px', height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', flexShrink: 0 }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '2px', transition: 'width 0.5s ease' }} />
      </div>
      <span style={{ fontSize: '0.82rem', fontWeight: 700, color, width: '36px', textAlign: 'right', flexShrink: 0 }}>
        {pct}%
      </span>
    </div>
  );
}
