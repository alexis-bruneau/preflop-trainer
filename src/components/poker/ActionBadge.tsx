'use client';

import React from 'react';
import type { ActionEvent } from '@/domain/poker/actions';
import { cn } from '@/lib/utils';

interface ActionBadgeProps {
  event: ActionEvent;
  className?: string;
}

export function ActionBadge({ event, className }: ActionBadgeProps) {
  const { action, amountBB } = event;

  const getLabel = () => {
    switch (action) {
      case 'fold': return 'FOLD';
      case 'blind':
        return amountBB === 0.5 ? 'SB 0.5' : `BB ${amountBB}`;
      case 'call':
        return `CALL ${amountBB ? amountBB + ' BB' : ''}`.trim();
      case 'raise':
        return `RAISE ${amountBB ? amountBB + ' BB' : ''}`.trim();
      case 'limp':
        return 'LIMP';
      default:
        return String(action).toUpperCase();
    }
  };

  const getBadgeClass = () => {
    switch (action) {
      case 'fold': return 'action-badge-fold';
      case 'blind': return 'action-badge-blind';
      case 'call': return 'action-badge-call';
      case 'raise': return 'action-badge-raise';
      case 'limp': return 'action-badge-call';
      default: return 'action-badge-fold';
    }
  };

  return (
    <span className={cn('action-badge', getBadgeClass(), className)}>
      {getLabel()}
    </span>
  );
}
