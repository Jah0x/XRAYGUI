import React from 'react';

export default function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div>
      <h2 className="text-white text-xl font-semibold">{title}</h2>
      {subtitle && <p className="text-onSurface/90 text-sm">{subtitle}</p>}
    </div>
  );
}
