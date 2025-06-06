import React from 'react';

export default function Card({ children, className = '' }: React.PropsWithChildren<{ className?: string }>) {
  return (
    <div className={`rounded-xl bg-surface/60 backdrop-blur p-6 shadow-lg ring-1 ring-primary/20 ${className}`}>
      {children}
    </div>
  );
}
