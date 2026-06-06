import React from 'react';
import { Database } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = Database,
  title = 'No Records Found',
  description = 'There is no data available in this view right now.',
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-14 text-center bg-white border border-surface-border rounded-2xl shadow-card">
      <div className="w-16 h-16 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center mb-5 text-brand-400">
        <Icon size={28} className="stroke-[1.5]" />
      </div>
      <h3 className="text-base font-semibold text-ink-900 mb-1.5">{title}</h3>
      <p className="text-sm text-ink-400 max-w-xs mb-6 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-5 py-2.5 text-sm font-semibold text-white bg-brand-500 hover:bg-brand-600 active:bg-brand-700 rounded-xl shadow-brand transition-all duration-200"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
