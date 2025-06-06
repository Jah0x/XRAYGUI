import React from 'react';

export default function Tabs({ items, value, onChange }: { items: { label: string; value: string }[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="mb-4">
      <div className="flex border-b border-white/10">
        {items.map((item) => (
          <button
            key={item.value}
            onClick={() => onChange(item.value)}
            className={`px-4 py-2 rounded-t-md ${value === item.value ? 'bg-primary/10 ring-1 ring-primary' : 'hover:bg-white/5'}`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
