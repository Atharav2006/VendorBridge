import React from 'react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Skeleton = ({ className, ...props }) => {
  return (
    <div
      className={twMerge(
        'animate-pulse rounded bg-slate-100/80 border border-slate-700/20',
        className
      )}
      {...props}
    />
  );
};

export const SkeletonTable = ({ rows = 5, cols = 4 }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <Skeleton className="h-10 w-1/4" />
        <Skeleton className="h-10 w-12" />
        <Skeleton className="h-10 w-12" />
      </div>
      <div className="border border-border rounded-lg overflow-hidden">
        <div className="bg-slate-50 p-4 flex justify-between">
          {Array.from({ length: cols }).map((_, i) => (
            <Skeleton key={i} className="h-5 w-24" />
          ))}
        </div>
        <div className="p-4 space-y-4">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="flex justify-between items-center py-2 border-b border-border last:border-0">
              {Array.from({ length: cols }).map((_, j) => (
                <Skeleton key={j} className={`h-4 ${j === 0 ? 'w-48' : 'w-20'}`} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const SkeletonDashboard = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white border border-border shadow-sm rounded-2xl border border-border rounded-xl p-5 space-y-3">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-5 w-5 rounded-full" />
            </div>
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-36" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-border shadow-sm rounded-2xl border border-border rounded-xl p-5 space-y-4">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
        <div className="bg-white border border-border shadow-sm rounded-2xl border border-border rounded-xl p-5 space-y-4">
          <Skeleton className="h-5 w-32" />
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex justify-between py-2 border-b border-border">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-12" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
export default Skeleton;
