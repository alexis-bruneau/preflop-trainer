'use client';

import React, { useMemo } from 'react';
import type { Position } from '@/domain/poker/positions';
import { POSITION_DISPLAY_NAMES, VISUAL_SEAT_ORDER } from '@/domain/poker/positions';
import type { ActionEvent } from '@/domain/poker/actions';
import type { Card } from '@/domain/poker/cards';
import { PlayingCard, CardBack } from './PlayingCard';
import { ActionBadge } from './ActionBadge';
import { formatBB } from '@/lib/utils';

// ─── Seat Positions Around an Ellipse ────────────────────────────────────────

/**
 * Calculate (x, y) positions around an ellipse for 9 seats.
 * Seat indices 0-8 are distributed clockwise starting from bottom-center.
 * 
 * The hero (index 4 = bottom center) is always at the bottom.
 * We rotate so hero's visual index lands at the bottom.
 */
function getSeatPositions(width: number, height: number) {
  const cx = width / 2;
  const cy = height / 2;
  const rx = width * 0.43;
  const ry = height * 0.40;

  return Array.from({ length: 9 }, (_, i) => {
    // 0 = bottom center, clockwise
    // Angle: 90° = bottom (π/2), going clockwise
    const angle = (Math.PI / 2) + (i * 2 * Math.PI / 9);
    return {
      x: cx + rx * Math.cos(angle),
      y: cy + ry * Math.sin(angle),
    };
  });
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface SeatInfo {
  position: Position;
  seatIndex: number;
  isHero: boolean;
  action: ActionEvent | null;
  hasFolded: boolean;
  stackBB: number;
}

interface PokerTableProps {
  heroPosition: Position;
  heroCards?: [Card, Card];
  actionHistory: ActionEvent[];
  potBB: number;
  /** If true, show hero cards face up */
  showHeroCards?: boolean;
}

// ─── Seat Component ───────────────────────────────────────────────────────────

function PokerSeat({
  seatInfo,
  x,
  y,
  showHeroCards,
  heroCards,
}: {
  seatInfo: SeatInfo;
  x: number;
  y: number;
  showHeroCards: boolean;
  heroCards?: [Card, Card];
}) {
  const { position, isHero, action, hasFolded } = seatInfo;
  const displayName = POSITION_DISPLAY_NAMES[position];

  // Determine alignment based on horizontal position
  const isLeft = x < 45;
  const isRight = x > 55;
  const isTop = y < 35;
  const isBottom = y > 65;

  // Color scheme
  const opacity = hasFolded ? 0.3 : 1;

  return (
    <div
      style={{
        position: 'absolute',
        left: `${x}%`,
        top: `${y}%`,
        transform: 'translate(-50%, -50%)',
        opacity,
        zIndex: isHero ? 10 : 5,
        transition: 'opacity 0.3s ease',
      }}
    >
      {/* Seat container */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px',
          minWidth: isHero ? '120px' : '80px',
        }}
      >
        {/* Cards (above seat for top positions, below for bottom) */}
        {isHero && heroCards && showHeroCards && (isBottom || (!isTop && !isLeft && !isRight)) && (
          <div style={{ display: 'flex', gap: '4px', marginBottom: '4px', order: isBottom ? -1 : 1 }}>
            <PlayingCard card={heroCards[0]} size="md" animate />
            <PlayingCard card={heroCards[1]} size="md" animate />
          </div>
        )}

        {/* Seat box */}
        <div
          style={{
            background: isHero
              ? 'linear-gradient(135deg, rgba(212, 168, 67, 0.15), rgba(184, 140, 46, 0.08))'
              : 'rgba(30, 36, 51, 0.9)',
            border: isHero
              ? '1.5px solid rgba(212, 168, 67, 0.5)'
              : '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '10px',
            padding: isHero ? '10px 14px' : '6px 10px',
            backdropFilter: 'blur(8px)',
            boxShadow: isHero
              ? '0 4px 20px rgba(212, 168, 67, 0.15), 0 2px 8px rgba(0,0,0,0.4)'
              : '0 2px 8px rgba(0,0,0,0.3)',
            textAlign: 'center',
            minWidth: isHero ? '90px' : '70px',
          }}
        >
          {/* YOU label for hero */}
          {isHero && (
            <div
              style={{
                fontSize: '9px',
                fontWeight: 800,
                letterSpacing: '0.1em',
                color: 'var(--gold)',
                marginBottom: '2px',
                textTransform: 'uppercase',
              }}
            >
              YOU
            </div>
          )}

          {/* Position label */}
          <div
            style={{
              fontSize: isHero ? '14px' : '11px',
              fontWeight: 700,
              color: isHero ? 'var(--gold-light)' : 'var(--text-primary)',
              fontFamily: 'var(--font-display)',
            }}
          >
            {displayName}
          </div>

          {/* Stack */}
          <div
            style={{
              fontSize: isHero ? '11px' : '9px',
              color: 'var(--text-secondary)',
              marginTop: '2px',
            }}
          >
            100 BB
          </div>
        </div>

        {/* Action badge */}
        {action && (
          <ActionBadge event={action} />
        )}
      </div>
    </div>
  );
}

// ─── Pot Display ──────────────────────────────────────────────────────────────

function PotDisplay({ potBB }: { potBB: number }) {
  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center',
        zIndex: 20,
      }}
    >
      <div
        style={{
          background: 'rgba(13, 15, 20, 0.8)',
          border: '1px solid rgba(212, 168, 67, 0.2)',
          borderRadius: '20px',
          padding: '6px 16px',
          backdropFilter: 'blur(8px)',
        }}
      >
        <div
          style={{
            fontSize: '9px',
            fontWeight: 600,
            color: 'var(--text-muted)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
        >
          POT
        </div>
        <div
          style={{
            fontSize: '15px',
            fontWeight: 800,
            color: 'var(--gold)',
            fontFamily: 'var(--font-display)',
          }}
        >
          {formatBB(potBB)}
        </div>
      </div>
    </div>
  );
}

// ─── Dealer Button ────────────────────────────────────────────────────────────

function DealerButton({ x, y }: { x: number; y: number }) {
  return (
    <div
      style={{
        position: 'absolute',
        left: `${x}%`,
        top: `${y}%`,
        transform: 'translate(-50%, -50%)',
        zIndex: 8,
      }}
    >
      <div className="dealer-button">D</div>
    </div>
  );
}

// ─── Main Poker Table ─────────────────────────────────────────────────────────

export function PokerTable({
  heroPosition,
  heroCards,
  actionHistory,
  potBB,
  showHeroCards = true,
}: PokerTableProps) {
  // Build action map: position → action event
  const actionMap = useMemo(() => {
    const map = new Map<Position, ActionEvent>();
    for (const event of actionHistory) {
      map.set(event.position, event);
    }
    return map;
  }, [actionHistory]);

  // Build folded set
  const foldedSet = useMemo(() => {
    const s = new Set<Position>();
    for (const event of actionHistory) {
      if (event.action === 'fold') s.add(event.position);
    }
    return s;
  }, [actionHistory]);

  // Calculate visual seat positions
  // Hero is always at the bottom center (index 4 in visual order)
  const heroVisualIdx = VISUAL_SEAT_ORDER.indexOf(heroPosition);

  const seats = useMemo((): SeatInfo[] => {
    return VISUAL_SEAT_ORDER.map((position, i) => {
      const action = actionMap.get(position) ?? null;
      return {
        position,
        seatIndex: i,
        isHero: position === heroPosition,
        action,
        hasFolded: foldedSet.has(position),
        stackBB: 100,
      };
    });
  }, [heroPosition, actionMap, foldedSet]);

  // Table dimensions (relative, percentage-based)
  const TABLE_W = 100; // 100% width container
  const TABLE_H = 100;

  // Pre-compute visual positions (0-8 around ellipse, 0=bottom-center)
  // We rotate so that heroVisualIdx lands at 0 (bottom)
  const seatCoords = useMemo(() => {
    const coords = Array.from({ length: 9 }, (_, i) => {
      // 0 = bottom center, going clockwise
      const angle = (Math.PI / 2) + (i * 2 * Math.PI / 9);
      const rx = 42;
      const ry = 38;
      const cx = 50;
      const cy = 50;
      return {
        x: cx + rx * Math.cos(angle),
        y: cy + ry * Math.sin(angle),
      };
    });
    return coords;
  }, []);

  // Find BTN position for dealer button placement
  const btnSeatIdx = useMemo(() => {
    const btnIdx = VISUAL_SEAT_ORDER.indexOf('BTN');
    const offset = (btnIdx - heroVisualIdx + 9) % 9;
    return offset;
  }, [heroVisualIdx]);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        paddingTop: '62%', // slightly taller to prevent bottom seat clipping
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Table outer rail */}
        <div
          className="poker-table-rail"
          style={{
            position: 'absolute',
            width: '96%',
            height: '90%',
            borderRadius: '50%',
          }}
        />

        {/* Table felt */}
        <div
          className="poker-table-felt"
          style={{
            position: 'absolute',
            width: '90%',
            height: '82%',
            borderRadius: '50%',
            border: '4px solid var(--felt-border)',
          }}
        >
          {/* Pot */}
          <PotDisplay potBB={potBB} />
        </div>

        {/* Seats — positioned over the table */}
        <div
          style={{
            position: 'absolute',
            width: '92%',
            height: '86%',
          }}
        >
          {seats.map((seatInfo, i) => {
            // Rotate so hero's original index becomes 0 (bottom center)
            const visualOffset = (i - heroVisualIdx + 9) % 9;
            const coord = seatCoords[visualOffset];
            
            // Transform percentages relative to 92%/86% sub-container
            const adjustedX = (coord.x / 100) * (100 / 92) * 100;
            const adjustedY = (coord.y / 100) * (100 / 86) * 100;

            return (
              <PokerSeat
                key={seatInfo.position}
                seatInfo={seatInfo}
                x={adjustedX}
                y={adjustedY}
                showHeroCards={showHeroCards}
                heroCards={seatInfo.isHero ? heroCards : undefined}
              />
            );
          })}

          {/* Dealer button near BTN */}
          {(() => {
            const coord = seatCoords[btnSeatIdx];
            const adjustedX = (coord.x / 100) * (100 / 92) * 100;
            const adjustedY = (coord.y / 100) * (100 / 86) * 100;
            
            // Offset slightly toward center
            const offsetX = adjustedX < 50 ? 8 : -8;
            const offsetY = adjustedY < 50 ? 8 : -8;
            
            return (
              <DealerButton
                x={adjustedX + offsetX}
                y={adjustedY + offsetY}
              />
            );
          })()}
        </div>
      </div>
    </div>
  );
}
