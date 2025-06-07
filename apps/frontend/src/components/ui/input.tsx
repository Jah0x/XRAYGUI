import React from 'react';
import { clsx } from 'clsx';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={clsx(
        'bg-surface2/70 ring-1 ring-white/10 rounded-lg px-4 py-2 focus:ring-primary',
        className
      )}
      {...props}
    />
  )
);
Input.displayName = 'Input';
