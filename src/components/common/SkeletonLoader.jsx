import React from 'react';

export const SkeletonLoader = ({ type = 'card', count = 1 }) => {
  const pulse = 'shimmer bg-slate-100 rounded';
  const items = Array.from({ length: count });

  switch (type) {
    case 'table':
      return (
        <div className="w-full">
          {/* Header row */}
          <div className="flex gap-4 px-5 py-3.5 border-b border-surface-border bg-surface-raised">
            {[30, 25, 25, 20].map((w, i) => (
              <div key={i} className={`${pulse} h-3.5`} style={{ width: `${w}%` }} />
            ))}
          </div>
          {/* Data rows */}
          {items.map((_, i) => (
            <div key={i} className="flex gap-4 px-5 py-4 border-b border-surface-border last:border-0">
              {[30, 25, 25, 20].map((w, j) => (
                <div key={j} className={`${pulse} h-3`} style={{ width: `${w}%` }} />
              ))}
            </div>
          ))}
        </div>
      );

    case 'list':
      return (
        <div className="space-y-3">
          {items.map((_, i) => (
            <div key={i} className="p-4 bg-white border border-surface-border rounded-xl space-y-2">
              <div className={`${pulse} h-4 w-1/3`} />
              <div className={`${pulse} h-3 w-1/2`} />
            </div>
          ))}
        </div>
      );

    case 'invoice':
      return (
        <div className="p-6 bg-white border border-surface-border rounded-2xl space-y-6">
          <div className="flex justify-between items-start">
            <div className="space-y-3 w-1/3">
              <div className={`${pulse} h-6`} />
              <div className={`${pulse} h-4 w-2/3`} />
            </div>
            <div className={`${pulse} h-8 w-24`} />
          </div>
          <div className="grid grid-cols-2 gap-6 pt-6 border-t border-surface-border">
            {[0, 1].map((i) => (
              <div key={i} className="space-y-2">
                <div className={`${pulse} h-4 w-1/4`} />
                <div className={`${pulse} h-3 w-2/3`} />
                <div className={`${pulse} h-3 w-1/2`} />
              </div>
            ))}
          </div>
          <div className="space-y-3 pt-6">
            <div className={`${pulse} h-4`} />
            <div className={`${pulse} h-10`} />
            <div className={`${pulse} h-10`} />
          </div>
        </div>
      );

    case 'card':
    default:
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((_, i) => (
            <div key={i} className="p-5 bg-white border border-surface-border rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div className={`${pulse} h-4 w-1/4`} />
                <div className={`${pulse} w-10 h-10 rounded-xl`} />
              </div>
              <div className={`${pulse} h-6 w-1/2`} />
              <div className={`${pulse} h-3 w-2/3`} />
            </div>
          ))}
        </div>
      );
  }
};

export default SkeletonLoader;
