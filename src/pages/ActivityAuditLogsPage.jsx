import React, { useState, useEffect } from 'react';
import auditService from '../services/auditService';
import {
  Search,
  Filter,
  ShieldAlert,
  ShieldCheck,
  User,
  Clock,
  History,
  FileCheck,
  CreditCard,
  PlusCircle,
} from 'lucide-react';
import Card from '../components/common/Card';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorState from '../components/common/ErrorState';

export const ActivityAuditLogsPage = () => {
  // Explicitly declared variables required by USER
  const [activityLogs, setActivityLogs] = useState([]); // state variable for fetched logs
  const [selectedFilter, setSelectedFilter] = useState('ALL'); // Filter tag
  const [searchQuery, setSearchQuery] = useState(''); // Search query
  const [auditTimeline, setAuditTimeline] = useState([]); // Formatted timeline logs
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch logs on mount and whenever search or filter selection changes
  useEffect(() => {
    fetchLogs();
  }, [selectedFilter]);

  // Handle client-side search query matching
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setAuditTimeline(activityLogs);
    } else {
      const filtered = activityLogs.filter(
        (log) =>
          log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
          log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
          log.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
          log.resourceType.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setAuditTimeline(filtered);
    }
  }, [searchQuery, activityLogs]);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const filters = {};
      if (selectedFilter !== 'ALL') {
        filters.resourceType = selectedFilter;
      }

      // API INTEGRATION POINT: GET_ACTIVITY_LOGS_API / FILTER_ACTIVITY_LOGS_API
      const res = await auditService.getLogs(filters);
      if (res.success) {
        setActivityLogs(res.data);
        setAuditTimeline(res.data);
      } else {
        throw new Error(res.message || 'Failed to fetch logs');
      }
    } catch (err) {
      console.error('Fetch Logs Error:', err.message);
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const getLogIcon = (action, resourceType) => {
    switch (resourceType) {
      case 'AUTH':
        return <User size={14} className="text-indigo-400" />;
      case 'APPROVAL':
        if (action.includes('REJECTED')) {
          return <ShieldAlert size={14} className="text-red-400" />;
        }
        return <ShieldCheck size={14} className="text-emerald-400" />;
      case 'PURCHASE_ORDER':
        return <PlusCircle size={14} className="text-emerald-400" />;
      case 'INVOICE':
        if (action.includes('PAID')) {
          return <CreditCard size={14} className="text-brand-400" />;
        }
        return <FileCheck size={14} className="text-indigo-400" />;
      default:
        return <History size={14} className="text-neutral-400" />;
    }
  };

  const getBorderColor = (resourceType) => {
    switch (resourceType) {
      case 'AUTH':
        return 'border-l-indigo-500';
      case 'APPROVAL':
        return 'border-l-emerald-500';
      case 'PURCHASE_ORDER':
        return 'border-l-teal-500';
      case 'INVOICE':
        return 'border-l-brand-500';
      default:
        return 'border-l-neutral-700';
    }
  };

  const filterOptions = [
    { value: 'ALL', label: 'All Activities' },
    { value: 'AUTH', label: 'Security & Access' },
    { value: 'APPROVAL', label: 'RFQ Workflows' },
    { value: 'PURCHASE_ORDER', label: 'Orders' },
    { value: 'INVOICE', label: 'Billing & Payments' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-heading">
            Immutable Audit Trail
          </h1>
          <p className="text-sm text-neutral-400">
            System activity ledger. Logs are write-once, read-only and immutable.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card hoverable={false} className="py-4 px-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search Query Input */}
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search details, actions, resource types, or users..."
              className="w-full pl-10 pr-4 py-2 bg-neutral-900 border border-neutral-800 focus:border-brand-500/50 rounded-xl text-xs text-zinc-300 outline-none transition-colors"
            />
          </div>

          {/* Filter Option Buttons */}
          <div className="flex flex-wrap gap-1.5 items-center">
            <span className="text-xs text-neutral-500 mr-2 flex items-center space-x-1">
              <Filter size={12} />
              <span>Filter:</span>
            </span>
            {filterOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSelectedFilter(opt.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  selectedFilter === opt.value
                    ? 'bg-brand-500/10 text-brand-400 border-brand-500/30'
                    : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:border-neutral-700 hover:text-zinc-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {error && <ErrorState message={error} onRetry={fetchLogs} />}

      {/* Scrollable Logs Section */}
      <div className="max-h-[calc(100vh-270px)] overflow-y-auto pr-1">
        {loading ? (
          <LoadingSpinner size="lg" message="Loading audit trail ledger..." />
        ) : auditTimeline.length === 0 ? (
          <div className="p-12 text-center bg-[#18181B] border border-neutral-800 rounded-xl">
            <History size={36} className="text-neutral-500 mx-auto mb-3" />
            <p className="text-sm font-semibold text-zinc-300">No activity matching filter query</p>
            <p className="text-xs text-neutral-500 mt-1">Try modifying your filter categories or query keyword.</p>
          </div>
        ) : (
          <div className="relative border-l border-neutral-800 ml-4 pl-6 space-y-4">
            {auditTimeline.map((log, index) => (
              <div
                key={log._id || index}
                className={`p-4 bg-[#18181B] border border-neutral-800 border-l-4 ${getBorderColor(
                  log.resourceType
                )} rounded-xl shadow-md transition-all hover:bg-neutral-900/30 flex items-start space-x-3.5 relative`}
              >
                {/* Timeline node dot indicator */}
                <div className="absolute -left-[31px] top-4 w-2 h-2 rounded-full bg-[#0A0A0A] border-2 border-neutral-700" />

                {/* Log Icon container */}
                <div className="p-2.5 bg-neutral-900 border border-neutral-850 rounded-lg text-neutral-400 shrink-0">
                  {getLogIcon(log.action, log.resourceType)}
                </div>

                {/* Log Details card content */}
                <div className="flex-1 space-y-1.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                    <span className="text-xs font-bold text-zinc-200 tracking-wide font-mono uppercase bg-neutral-900 border border-neutral-850 px-2 py-0.5 rounded">
                      {log.action}
                    </span>
                    <span className="text-[10px] text-neutral-500 flex items-center space-x-1">
                      <Clock size={10} />
                      <span>
                        {new Date(log.createdAt).toLocaleString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </span>
                    </span>
                  </div>

                  <p className="text-xs text-neutral-300 font-medium leading-relaxed">
                    {log.details}
                  </p>

                  <div className="flex items-center space-x-4 pt-1.5 border-t border-neutral-850 text-[10px] text-neutral-500">
                    <span className="flex items-center space-x-1">
                      <span className="w-1 h-1 rounded-full bg-neutral-600" />
                      <span>Trigger: {log.username}</span>
                    </span>
                    <span className="flex items-center space-x-1 font-mono">
                      <span className="w-1 h-1 rounded-full bg-neutral-600" />
                      <span>ID: {log.resourceId}</span>
                    </span>
                    {log.ipAddress && (
                      <span className="flex items-center space-x-1 font-mono">
                        <span className="w-1 h-1 rounded-full bg-neutral-600" />
                        <span>IP: {log.ipAddress}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityAuditLogsPage;
