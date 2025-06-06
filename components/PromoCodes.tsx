import React, { useState } from 'react';
import { Tag } from 'lucide-react';

export default function PromoCodes({ onApply }: { onApply: (code: string) => void }) {
  const [code, setCode] = useState('');

  return (
    <div className="flex rounded-lg overflow-hidden ring-1 ring-white/10">
      <input
        className="flex-1 px-4 py-2 bg-surface text-onSurface placeholder-onSurface/40 outline-none"
        placeholder="Promo code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />
      <button
        className="px-4 bg-primary hover:bg-primary/80 text-white flex items-center gap-2"
        onClick={() => {
          if (code.trim()) {
            onApply(code.trim());
            setCode('');
          }
        }}
      >
        <Tag className="h-4 w-4" />
        Apply
      </button>
    </div>
  );
}
