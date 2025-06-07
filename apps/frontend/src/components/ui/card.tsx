import React from 'react';
import { clsx } from 'clsx';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  neon?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, neon, ...props }, ref) => (
    <div
      ref={ref}
      className={clsx(
        'rounded-2xl bg-surface2 shadow-glass p-6',
        neon && 'border border-primary',
        className
      )}
      {...props}
    />
  )
);
Card.displayName = 'Card';
