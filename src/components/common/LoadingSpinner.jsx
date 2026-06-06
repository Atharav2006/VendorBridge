import React from 'react';

export const LoadingSpinner = ({ size = 'md', message = 'Loading...' }) => {
  const sizeMap = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
  };

  return (
    <div className="flex flex-col items-center justify-center p-10 gap-4">
      <div
        className={`${sizeMap[size]} animate-spin rounded-full border-brand-100 border-t-brand-500`}
        role="status"
      >
        <span className="sr-only">Loading...</span>
      </div>
      {message && (
        <p className="text-sm font-medium text-ink-400 animate-pulse">{message}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;
