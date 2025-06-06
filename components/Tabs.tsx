import React, { useState } from 'react';

export function Tabs({ tabs, initial = 0 }: { tabs: { label: string; content: React.ReactNode }[]; initial?: number }) {
  const [active, setActive] = useState(initial);
  return (
    <div>
      <div className="flex border-b border-primary mb-4">
        {tabs.map((t, i) => (
          <button
            key={t.label}
            onClick={() => setActive(i)}
            className={`px-4 py-2 -mb-px ${active === i ? 'border-b-2 border-primary text-primary' : ''}`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div>{tabs[active]?.content}</div>
    </div>
  );
}
