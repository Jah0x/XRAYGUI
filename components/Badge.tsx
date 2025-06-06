import React from 'react';

export default function Badge({ children, className = '' }: React.PropsWithChildren<{ className?: string }>) {
  return <span className={`inline-block px-2 py-1 rounded-full bg-primary text-white text-xs ${className}`}>{children}</span>;
}
