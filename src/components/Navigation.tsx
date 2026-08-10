'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/', label: 'Home' },
  { href: '/train', label: 'Train' },
  { href: '/ranges', label: 'Ranges' },
  { href: '/stats', label: 'Stats' },
  { href: '/settings', label: 'Settings' },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav
      style={{
        background: 'rgba(13, 15, 20, 0.95)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        backdropFilter: 'blur(12px)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '60px',
        }}
      >
        {/* Logo */}
        <Link href="/" style={{ textDecoration: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                fontSize: '20px',
                fontFamily: 'var(--font-display)',
                fontWeight: 900,
                color: 'var(--gold)',
                letterSpacing: '-0.02em',
              }}
            >
              PREFLOP
            </span>
            <span
              style={{
                fontSize: '20px',
                fontFamily: 'var(--font-display)',
                fontWeight: 400,
                color: 'var(--text-primary)',
                letterSpacing: '-0.02em',
              }}
            >
              TRAINER
            </span>
            <span
              style={{
                background: 'rgba(212, 168, 67, 0.15)',
                border: '1px solid rgba(212, 168, 67, 0.3)',
                color: 'var(--gold)',
                fontSize: '9px',
                fontWeight: 700,
                padding: '2px 6px',
                borderRadius: '4px',
                letterSpacing: '0.05em',
              }}
            >
              9-MAX
            </span>
          </div>
        </Link>

        {/* Nav links */}
        <div style={{ display: 'flex', gap: '4px' }}>
          {NAV_ITEMS.map((item) => {
            const isActive = item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-link ${isActive ? 'active' : ''}`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
