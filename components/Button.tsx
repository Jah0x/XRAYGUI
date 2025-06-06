import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline';
}

export default function Button({ variant = 'primary', className = '', ...props }: ButtonProps) {
  const base = 'px-4 py-2 rounded-lg font-medium transition-colors';
  const variants: Record<string, string> = {
    primary: 'bg-primary text-white hover:bg-primary-dark',
    outline: 'border border-primary text-primary hover:bg-primary hover:text-white',
  };
  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />;
}
