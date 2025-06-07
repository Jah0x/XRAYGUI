import { cva, VariantProps } from 'class-variance-authority';
import { clsx } from 'clsx';
import React from 'react';

const buttonStyles = cva(
  'inline-flex items-center justify-center rounded-lg font-medium transition-colors ring-offset-2 focus:outline-none focus:ring-2',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-white hover:ring-primary/30',
        ghost: 'bg-transparent hover:bg-white/5',
        danger: 'bg-red-600 text-white hover:bg-red-700',
        icon: 'p-2',
      },
      size: {
        default: 'h-9 px-4',
        sm: 'h-8 px-3 text-sm',
        lg: 'h-10 px-6 text-base',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonStyles> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={clsx(buttonStyles({ variant, size }), className)}
      {...props}
    />
  )
);
Button.displayName = 'Button';
