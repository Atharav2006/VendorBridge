import React from 'react';

export const Card = ({
  children,
  title,
  subtitle,
  headerActions,
  footer,
  className = '',
  hoverable = true,
}) => {
  return (
    <div
      className={`bg-white border border-surface-border rounded-2xl overflow-hidden shadow-card ${
        hoverable
          ? 'hover:shadow-card-md hover:border-brand-200 transition-all duration-250'
          : ''
      } ${className}`}
    >
      {/* Card Header */}
      {(title || subtitle || headerActions) && (
        <div className="px-6 py-4 border-b border-surface-border flex items-center justify-between flex-wrap gap-2 bg-surface-raised/40">
          <div>
            {title && (
              <h3 className="text-sm font-semibold text-ink-900">{title}</h3>
            )}
            {subtitle && (
              <p className="text-xs text-ink-400 mt-0.5">{subtitle}</p>
            )}
          </div>
          {headerActions && (
            <div className="flex items-center gap-2">{headerActions}</div>
          )}
        </div>
      )}

      {/* Card Body */}
      <div className="p-6">{children}</div>

      {/* Card Footer */}
      {footer && (
        <div className="px-6 py-4 bg-surface-raised/50 border-t border-surface-border">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
