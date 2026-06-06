import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import rfqService from '../services/rfqService';
import { useAuth } from '../context/AuthContext';
import { FileText, ClipboardList, GitCompare, ChevronRight, RefreshCw, AlertCircle } from 'lucide-react';
import Card from '../components/common/Card';
import Table from '../components/common/Table';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorState from '../components/common/ErrorState';
import EmptyState from '../components/common/EmptyState';

const StatusBadge = ({ status }) => {
  const map = {
    Active: 'bg-brand-50 text-brand-700 border-brand-200',
    Closed: 'bg-slate-50 text-slate-600 border-slate-200',
    Draft:  'bg-amber-50 text-amber-700 border-amber-200',
  };
  return (
    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${map[status] || map.Draft}`}>
      {status}
    </span>
  );
};

export const RFQListPage = () => {
  const [rfqs, setRfqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchRfqs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await rfqService.getRFQs();
      if (res.success) {
        // Vendors only see RFQs assigned to them
        if (user?.role === 'Vendor') {
           const vendorRfqs = (res.data || []).filter(r => 
             r.assignedVendors?.some(v => v.email === user.email) || r.status === 'Active' // If backend doesn't filter perfectly
           );
           setRfqs(vendorRfqs);
        } else {
           setRfqs(res.data || []);
        }
      } else {
        throw new Error(res.message);
      }
    } catch (err) {
      setError(err.message || 'Failed to load RFQs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRfqs();
  }, []);

  const handleAction = (rfqId, status) => {
    if (user?.role === 'Vendor') {
      if (status !== 'Active') return;
      navigate(`/quotations/submit/${rfqId}`);
    } else {
      navigate(`/quotations/compare/${rfqId}`);
    }
  };

  const columns = [
    { key: 'rfqNumber', label: 'RFQ Number', render: (row) => <span className="font-mono text-xs text-brand-600 font-bold">{row.rfqNumber}</span> },
    { key: 'title', label: 'Title', render: (row) => <span className="font-semibold text-ink-900">{row.title}</span> },
    { key: 'department', label: 'Department' },
    { key: 'deadline', label: 'Deadline', render: (row) => row.deadline ? new Date(row.deadline).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—' },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    { key: 'actions', label: '', render: (row) => {
        const isVendor = user?.role === 'Vendor';
        if (isVendor) {
          if (row.status !== 'Active') return <span className="text-xs text-ink-300">Closed</span>;
          return (
            <button onClick={() => handleAction(row._id, row.status)} className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-50 text-brand-700 hover:bg-brand-600 hover:text-white rounded-lg text-xs font-bold transition-all border border-brand-200 hover:border-brand-600">
              <ClipboardList size={12} /> Submit Quote
            </button>
          );
        } else {
          return (
            <button onClick={() => handleAction(row._id, row.status)} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white rounded-lg text-xs font-bold transition-all border border-indigo-200 hover:border-indigo-600">
              <GitCompare size={12} /> Compare
            </button>
          );
        }
      } 
    }
  ];

  if (loading) return <LoadingSpinner size="lg" message="Loading active RFQs..." />;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-brand-50 border border-brand-100 flex items-center justify-center">
              <FileText size={16} className="text-brand-600" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-ink-900 font-heading">Active RFQs</h1>
          </div>
          <p className="text-sm text-ink-400">
            {user?.role === 'Vendor' 
              ? 'Review requests for quotations and submit your bids.' 
              : 'Monitor active procurement requests and compare received quotations.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchRfqs} className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-surface-border text-ink-400 text-xs font-semibold hover:bg-surface-raised transition-all">
            <RefreshCw size={12} /> Refresh
          </button>
        </div>
      </div>

      {error && <ErrorState message={error} onRetry={fetchRfqs} />}

      <Card hoverable={false} className="p-0 overflow-hidden">
        <Table 
          columns={columns} 
          data={rfqs} 
          rowKey="_id"
          emptyTitle="No RFQs Available"
          emptyDescription="There are currently no RFQs matching your role and active status."
          emptyIcon={FileText}
        />
      </Card>
    </div>
  );
};

export default RFQListPage;
