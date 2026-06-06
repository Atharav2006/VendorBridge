import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

export const ErrorState = ({
  message = 'Failed to load data. Please verify your server connection.',
  onRetry,
}) => {
  return (
    <div className="p-6 bg-red-50 border border-red-200 rounded-2xl flex flex-col items-center justify-center text-center gap-4 max-w-lg mx-auto shadow-card">
      <div className="w-12 h-12 rounded-xl bg-red-100 border border-red-200 flex items-center justify-center text-red-500">
        <AlertCircle size={22} />
      </div>
      <div className="space-y-1">
        <h4 className="text-sm font-semibold text-red-700">Something went wrong</h4>
        <p className="text-xs text-red-500 leading-relaxed max-w-xs">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-white hover:bg-red-50 text-red-600 border border-red-200 rounded-lg shadow-sm transition-all"
        >
          <RotateCcw size={13} />
          Retry Request
        </button>
      )}
    </div>
  );
};

export default ErrorState;
