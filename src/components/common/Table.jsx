import React from 'react';
import SkeletonLoader from './SkeletonLoader';
import EmptyState from './EmptyState';

export const Table = ({
  columns,
  data = [],
  loading = false,
  emptyTitle,
  emptyDescription,
  emptyIcon,
  onEmptyAction,
  emptyActionLabel,
  rowKey = '_id',
  onRowClick,
}) => {
  if (loading) {
    return (
      <div className="bg-white border border-surface-border rounded-2xl overflow-hidden shadow-card">
        <SkeletonLoader type="table" count={5} />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        icon={emptyIcon}
        actionLabel={emptyActionLabel}
        onAction={onEmptyAction}
      />
    );
  }

  return (
    <div className="bg-white border border-surface-border rounded-2xl overflow-hidden shadow-card">
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-raised border-b border-surface-border">
              {columns.map((col, idx) => (
                <th
                  key={col.key || idx}
                  className="px-5 py-3.5 text-[11px] font-bold text-ink-400 uppercase tracking-wider"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {data.map((row, rowIdx) => (
              <tr
                key={row[rowKey] || rowIdx}
                onClick={() => onRowClick && onRowClick(row)}
                className={`text-ink-700 text-sm hover:bg-brand-50/50 transition-colors duration-150 ${
                  onRowClick ? 'cursor-pointer' : ''
                }`}
              >
                {columns.map((col, colIdx) => (
                  <td key={col.key || colIdx} className="px-5 py-3.5 whitespace-nowrap">
                    {col.render ? col.render(row, rowIdx) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;
