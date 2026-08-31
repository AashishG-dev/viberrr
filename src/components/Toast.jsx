import React from 'react';
import { Check, Info } from 'lucide-react';

export default function Toast({ message, isVisible, type = 'success' }) {
  if (!isVisible) return null;

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none transition-all duration-300 transform translate-y-0 opacity-100">
      <div className="px-4 py-2.5 rounded-full glass-panel border border-white/25 shadow-2xl flex items-center gap-2 text-xs font-semibold text-white backdrop-blur-xl">
        {type === 'success' ? (
          <Check className="w-3.5 h-3.5 text-emerald-400" />
        ) : (
          <Info className="w-3.5 h-3.5 text-cyan-400" />
        )}
        <span>{message}</span>
      </div>
    </div>
  );
}
