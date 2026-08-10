'use client';

import React from 'react';
import type { Card } from '@/domain/poker/cards';
import { SUIT_SYMBOLS, SUIT_COLORS } from '@/domain/poker/cards';
import { cn } from '@/lib/utils';

interface PlayingCardProps {
  card: Card;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animate?: boolean;
  className?: string;
}

const SIZE_CLASSES = {
  sm: 'w-8 h-11',
  md: 'w-12 h-16',
  lg: 'w-16 h-22',
  xl: 'w-20 h-28',
};

const FONT_SIZES = {
  sm: { rank: 'text-sm', suit: 'text-xs' },
  md: { rank: 'text-lg', suit: 'text-sm' },
  lg: { rank: 'text-2xl', suit: 'text-lg' },
  xl: { rank: 'text-3xl', suit: 'text-xl' },
};

export function PlayingCard({ card, size = 'md', animate = false, className }: PlayingCardProps) {
  const isRed = SUIT_COLORS[card.suit] === 'red';
  const suit = SUIT_SYMBOLS[card.suit];
  const { rank, suit: suitSize } = FONT_SIZES[size];

  return (
    <div
      className={cn(
        'playing-card',
        SIZE_CLASSES[size],
        animate && 'card-deal-animate',
        className
      )}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
        position: 'relative',
      }}
      aria-label={`${card.rank}${suit}`}
    >
      {/* Top-left rank + suit */}
      <div
        style={{
          position: 'absolute',
          top: '4px',
          left: '5px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          lineHeight: 1,
        }}
      >
        <span
          className={rank}
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            color: isRed ? 'var(--card-red)' : 'var(--card-black)',
            lineHeight: 1,
          }}
        >
          {card.rank}
        </span>
        <span
          className={suitSize}
          style={{
            color: isRed ? 'var(--card-red)' : 'var(--card-black)',
            lineHeight: 1,
          }}
        >
          {suit}
        </span>
      </div>

      {/* Center suit */}
      <span
        style={{
          fontSize: size === 'xl' ? '28px' : size === 'lg' ? '22px' : size === 'md' ? '16px' : '12px',
          color: isRed ? 'var(--card-red)' : 'var(--card-black)',
          opacity: 0.7,
        }}
      >
        {suit}
      </span>

      {/* Bottom-right rank + suit (rotated) */}
      <div
        style={{
          position: 'absolute',
          bottom: '4px',
          right: '5px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          lineHeight: 1,
          transform: 'rotate(180deg)',
        }}
      >
        <span
          className={rank}
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            color: isRed ? 'var(--card-red)' : 'var(--card-black)',
            lineHeight: 1,
          }}
        >
          {card.rank}
        </span>
        <span
          className={suitSize}
          style={{
            color: isRed ? 'var(--card-red)' : 'var(--card-black)',
            lineHeight: 1,
          }}
        >
          {suit}
        </span>
      </div>
    </div>
  );
}

/** Card back (face down) */
export function CardBack({ size = 'md', className }: { size?: 'sm' | 'md' | 'lg' | 'xl'; className?: string }) {
  return (
    <div
      className={cn(SIZE_CLASSES[size], className)}
      style={{
        borderRadius: '8px',
        background: 'linear-gradient(135deg, #1e3a5f 0%, #0f1f35 50%, #1e3a5f 100%)',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Diamond pattern */}
      <div
        style={{
          position: 'absolute',
          inset: '4px',
          borderRadius: '4px',
          border: '1px solid rgba(212,168,67,0.3)',
          background: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 4px,
            rgba(212,168,67,0.05) 4px,
            rgba(212,168,67,0.05) 8px
          )`,
        }}
      />
    </div>
  );
}
