'use client';

import React from 'react';
import { useTrainerStore } from '@/lib/useTrainerStore';

export default function SettingsPage() {
  const { settings, updateSettings } = useTrainerStore();

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '32px 16px' }}>
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
        Settings
      </h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0 0 32px' }}>
        Customize your training experience
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* Training Mode */}
        <SettingsCard title="Training Mode" description="How questions are generated">
          <RadioGroup
            options={[
              { value: 'trainer', label: 'Trainer Mode', desc: 'Weighted for learning (recommended)' },
              { value: 'realistic', label: 'Realistic Deal', desc: 'Random deal — respects combo frequency' },
            ]}
            value={settings.questionMode}
            onChange={(v) => updateSettings({ questionMode: v as any })}
          />
        </SettingsCard>

        {/* Mixed Strategy Scoring */}
        <SettingsCard title="Mixed Strategy Scoring" description="How mixed strategy hands are scored">
          <RadioGroup
            options={[
              { value: 'practical', label: 'Practical Mode', desc: 'Any GTO action ≥5% counts as correct' },
              { value: 'randomizer', label: 'Randomizer Mode', desc: 'Must match a pre-rolled number exactly' },
            ]}
            value={settings.scoringMode}
            onChange={(v) => updateSettings({ scoringMode: v as any })}
          />
        </SettingsCard>

        {/* Show Percentages */}
        <SettingsCard title="Show Percentages After Answer" description="Display exact GTO frequencies in feedback">
          <ToggleSwitch
            value={settings.showPercentagesAfterAnswer}
            onChange={(v) => updateSettings({ showPercentagesAfterAnswer: v })}
          />
        </SettingsCard>

        {/* Auto Advance */}
        <SettingsCard title="Auto Advance" description="Automatically proceed to the next hand">
          <RadioGroup
            options={[
              { value: '0', label: 'Off', desc: 'Manual advance (Space)' },
              { value: '1000', label: '1 second', desc: '' },
              { value: '2000', label: '2 seconds', desc: '' },
              { value: '3000', label: '3 seconds', desc: '' },
            ]}
            value={String(settings.autoAdvanceMs)}
            onChange={(v) => updateSettings({ autoAdvanceMs: Number(v) as any })}
          />
        </SettingsCard>

        {/* Animations */}
        <SettingsCard title="Animations" description="Card deal and transition animations">
          <ToggleSwitch
            value={settings.animationsEnabled}
            onChange={(v) => updateSettings({ animationsEnabled: v })}
          />
        </SettingsCard>

        {/* Strategy profile info */}
        <SettingsCard title="Strategy Profile" description="Data source for all decisions">
          <div
            style={{
              padding: '12px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '8px',
            }}
          >
            <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem', marginBottom: '4px' }}>
              9-Max 100bb Solver-Derived (Simplified)
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Source: RangeConverter methodology<br />
              Rake: Unknown<br />
              Frequencies: 0%, 50%, 100% only<br />
              To add a new profile, see the documentation.
            </div>
          </div>
        </SettingsCard>

      </div>
    </div>
  );
}

function SettingsCard({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="stat-card">
      <div style={{ marginBottom: '16px' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', margin: '0 0 4px' }}>
          {title}
        </h3>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
          {description}
        </p>
      </div>
      {children}
    </div>
  );
}

function RadioGroup({ options, value, onChange }: {
  options: Array<{ value: string; label: string; desc: string }>;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {options.map((opt) => (
        <label
          key={opt.value}
          style={{
            display: 'flex',
            gap: '10px',
            alignItems: 'flex-start',
            padding: '10px 12px',
            borderRadius: '8px',
            cursor: 'pointer',
            background: value === opt.value ? 'rgba(212, 168, 67, 0.08)' : 'rgba(255,255,255,0.02)',
            border: value === opt.value ? '1px solid rgba(212, 168, 67, 0.3)' : '1px solid rgba(255,255,255,0.06)',
            transition: 'all 0.15s ease',
          }}
        >
          <input
            type="radio"
            checked={value === opt.value}
            onChange={() => onChange(opt.value)}
            style={{ marginTop: '2px', accentColor: 'var(--gold)' }}
          />
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.85rem', color: value === opt.value ? 'var(--gold)' : 'var(--text-primary)' }}>
              {opt.label}
            </div>
            {opt.desc && (
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                {opt.desc}
              </div>
            )}
          </div>
        </label>
      ))}
    </div>
  );
}

function ToggleSwitch({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: 0,
      }}
      aria-label={value ? 'On' : 'Off'}
    >
      <div
        style={{
          width: '44px',
          height: '24px',
          borderRadius: '12px',
          background: value ? 'var(--gold)' : 'rgba(255,255,255,0.15)',
          position: 'relative',
          transition: 'background 0.2s ease',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            width: '18px',
            height: '18px',
            borderRadius: '50%',
            background: 'white',
            top: '2px',
            left: value ? '22px' : '2px',
            transition: 'left 0.2s ease',
            boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
          }}
        />
      </div>
      <span style={{ fontSize: '0.85rem', color: value ? 'var(--gold)' : 'var(--text-muted)' }}>
        {value ? 'On' : 'Off'}
      </span>
    </button>
  );
}
