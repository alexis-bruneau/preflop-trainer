'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { initializeStrategyEngine } from '@/domain/strategy/strategy-loader';
import { localStatsRepository } from '@/repositories/stats/LocalStatsRepository';
import type { TrainingStats } from '@/repositories/stats/StatsRepository';
import { formatAccuracy } from '@/lib/utils';

export default function HomePage() {
  const [stats, setStats] = useState<TrainingStats | null>(null);
  const [engineReady, setEngineReady] = useState(false);

  useEffect(() => {
    try {
      initializeStrategyEngine();
      setEngineReady(true);
    } catch (e) {
      console.error('Strategy engine initialization failed:', e);
    }

    localStatsRepository.getStats().then(setStats).catch(console.error);
  }, []);

  const quickPracticeItems = [
    { label: 'Raise First In', icon: '↑', href: '/train?scenario=RFI', description: 'Open raise spots' },
    { label: 'Facing Raise', icon: '⟳', href: '/train?scenario=VS_RFI', description: '3-bet or fold/call' },
    { label: 'Facing 3-Bet', icon: '↑↑', href: '/train?scenario=VS_3BET', description: '4-bet or fold/call' },
    { label: 'Weak Spots', icon: '⚡', href: '/train?weakness=1', description: 'Practice mistakes' },
  ];

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 60px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
        background: 'radial-gradient(ellipse at top, rgba(212, 168, 67, 0.04) 0%, transparent 60%)',
      }}
    >
      <div style={{ maxWidth: '800px', width: '100%', textAlign: 'center' }}>

        {/* Hero section */}
        <div className="animate-fade-in" style={{ marginBottom: '48px' }}>
          {/* Game badge */}
          <div
            style={{
              display: 'inline-flex',
              gap: '8px',
              marginBottom: '20px',
              background: 'rgba(212, 168, 67, 0.08)',
              border: '1px solid rgba(212, 168, 67, 0.2)',
              borderRadius: '20px',
              padding: '6px 16px',
              fontSize: '0.8rem',
              color: 'var(--gold)',
              fontWeight: 600,
              letterSpacing: '0.05em',
            }}
          >
            <span>9-MAX</span>
            <span style={{ opacity: 0.4 }}>•</span>
            <span>100 BB</span>
            <span style={{ opacity: 0.4 }}>•</span>
            <span>NO-LIMIT HOLD'EM</span>
          </div>

          {/* Title */}
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.5rem, 6vw, 4rem)',
              fontWeight: 900,
              color: 'var(--text-primary)',
              margin: '0 0 16px',
              lineHeight: 1,
              letterSpacing: '-0.03em',
            }}
          >
            PREFLOP{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, var(--gold), var(--gold-light))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              TRAINER
            </span>
          </h1>

          <p
            style={{
              fontSize: '1.1rem',
              color: 'var(--text-secondary)',
              maxWidth: '480px',
              margin: '0 auto 32px',
              lineHeight: 1.6,
            }}
          >
            Study GTO preflop strategy with unlimited dynamically generated hands.
            Train smarter. Play better.
          </p>

          {/* CTA Button */}
          <Link href="/train" style={{ textDecoration: 'none' }}>
            <button
              className="btn-action animate-pulse-gold"
              style={{
                background: 'linear-gradient(135deg, var(--gold), var(--gold-dark))',
                color: '#1a1000',
                boxShadow: '0 8px 30px rgba(212, 168, 67, 0.3)',
                fontSize: '1.1rem',
                padding: '1rem 3rem',
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
              }}
            >
              START TRAINING
            </button>
          </Link>
        </div>

        {/* Stats summary */}
        {stats && stats.totalAnswered > 0 && (
          <div
            className="animate-slide-up"
            style={{
              display: 'flex',
              gap: '16px',
              justifyContent: 'center',
              marginBottom: '40px',
              flexWrap: 'wrap',
            }}
          >
            <StatPill
              label="Accuracy"
              value={formatAccuracy(stats.accuracy)}
              highlight
            />
            <StatPill
              label="Hands Studied"
              value={stats.totalAnswered.toLocaleString()}
            />
            <StatPill
              label="Best Streak"
              value={`${stats.longestStreak}`}
            />
          </div>
        )}

        {/* Quick Practice */}
        <div style={{ marginBottom: '40px' }}>
          <h2
            style={{
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              fontWeight: 600,
              marginBottom: '16px',
            }}
          >
            Quick Practice
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: '12px',
            }}
          >
            {quickPracticeItems.map((item) => (
              <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
                <div
                  className="stat-card"
                  style={{
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textAlign: 'center',
                  }}
                >
                  <div
                    style={{
                      fontSize: '1.5rem',
                      marginBottom: '8px',
                      fontFamily: 'var(--font-display)',
                      color: 'var(--gold)',
                    }}
                  >
                    {item.icon}
                  </div>
                  <div
                    style={{
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      fontSize: '0.9rem',
                      marginBottom: '4px',
                      fontFamily: 'var(--font-display)',
                    }}
                  >
                    {item.label}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {item.description}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Feature highlights */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginTop: '20px',
          }}
        >
          {[
            { icon: '♠', label: '169 Hand Classes', desc: 'Every preflop hand tracked' },
            { icon: '📊', label: 'GTO Frequencies', desc: 'Solver-derived strategy data' },
            { icon: '🎯', label: 'Dynamic Questions', desc: 'Never repeat, always relevant' },
            { icon: '📈', label: 'Track Progress', desc: 'Persistent accuracy stats' },
          ].map((feat) => (
            <div
              key={feat.label}
              style={{
                padding: '16px',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: '10px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '1.4rem', marginBottom: '6px' }}>{feat.icon}</div>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.85rem', marginBottom: '4px' }}>
                {feat.label}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{feat.desc}</div>
            </div>
          ))}
        </div>

        {/* Source attribution */}
        <p
          style={{
            marginTop: '32px',
            fontSize: '0.7rem',
            color: 'var(--text-muted)',
            lineHeight: 1.5,
          }}
        >
          Strategy: Simplified GTO 9-Max 100BB (RangeConverter methodology) •{' '}
          Frequencies: 0%, 50%, 100% only •{' '}
          Rake: Unknown
        </p>
      </div>
    </div>
  );
}

function StatPill({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div
      style={{
        background: highlight ? 'rgba(212, 168, 67, 0.1)' : 'rgba(255,255,255,0.04)',
        border: highlight ? '1px solid rgba(212, 168, 67, 0.3)' : '1px solid rgba(255,255,255,0.08)',
        borderRadius: '12px',
        padding: '12px 20px',
        minWidth: '100px',
      }}
    >
      <div
        style={{
          fontSize: '1.5rem',
          fontWeight: 800,
          color: highlight ? 'var(--gold)' : 'var(--text-primary)',
          fontFamily: 'var(--font-display)',
          lineHeight: 1,
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </div>
    </div>
  );
}
