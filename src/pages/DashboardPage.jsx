import React, { useState, useEffect } from 'react';
import dashboardService from '../services/dashboardService';
import {
  LayoutDashboard, FileText, Clock, DollarSign, AlertTriangle,
  TrendingUp, Plus, RefreshCw, ChevronRight, Package, Zap, BarChart2,
} from 'lucide-react';
import Card from '../components/common/Card';
import Table from '../components/common/Table';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorState from '../components/common/ErrorState';

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    Delivered:  'bg-accent-50  text-accent-700  border-accent-200',
    Pending:    'bg-amber-50   text-amber-700   border-amber-200',
    Processing: 'bg-brand-50   text-brand-700   border-brand-200',
    Cancelled:  'bg-red-50     text-red-600     border-red-200',
    Approved:   'bg-accent-50  text-accent-700  border-accent-200',
    Overdue:    'bg-red-50     text-red-600     border-red-200',
  };
  return (
    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${map[status] || 'bg-slate-50 text-slate-600 border-slate-200'}`}>
      {status}
    </span>
  );
};

// ─── Spark Bar Chart ──────────────────────────────────────────────────────────
const SparkBarChart = ({ data = [] }) => {
  if (!data.length) return null;
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex items-end gap-1.5 h-20">
      {data.map((d, i) => {
        const pct = (d.value / max) * 100;
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div
              className="w-full rounded-md bg-brand-400 hover:bg-brand-500 transition-all cursor-pointer"
              style={{ height: `${Math.max(pct, 4)}%` }}
              title={`${d.label}: ${d.value}`}
            />
            <span className="text-[9px] text-ink-300 truncate w-full text-center">{d.label}</span>
          </div>
        );
      })}
    </div>
  );
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, sub, accentBg, accentText, trend }) => (
  <div className="bg-white border border-surface-border rounded-2xl p-5 shadow-card hover:shadow-card-md hover:border-brand-200 transition-all duration-200 group">
    <div className="flex items-start justify-between mb-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${accentBg}`}>
        <Icon size={18} className={accentText} />
      </div>
      {trend !== undefined && (
        <div className={`flex items-center gap-1 text-xs font-semibold ${trend >= 0 ? 'text-accent-600' : 'text-red-500'}`}>
          <TrendingUp size={12} className={trend < 0 ? 'rotate-180' : ''} />
          {Math.abs(trend)}%
        </div>
      )}
    </div>
    <p className="text-2xl font-bold text-ink-900 tracking-tight">{value ?? '—'}</p>
    <p className="text-xs font-semibold text-ink-500 mt-0.5">{label}</p>
    {sub && <p className="text-[11px] text-ink-300 mt-1">{sub}</p>}
  </div>
);

// ─── Quick Action Button ──────────────────────────────────────────────────────
const QuickActionBtn = ({ icon: Icon, label, colorClass, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all hover:shadow-sm active:scale-95 ${colorClass}`}
  >
    <Icon size={14} />
    {label}
  </button>
);

// ─── Dashboard Page ───────────────────────────────────────────────────────────
export const DashboardPage = () => {
  const [dashboardSummary, setDashboardSummary] = useState(null);
  const [analyticsCards, setAnalyticsCards] = useState([]);
  const [recentPurchaseOrders, setRecentPurchaseOrders] = useState([]);
  const [spendingAnalytics, setSpendingAnalytics] = useState([]);
  const [quickActions] = useState([
    { label: 'New RFQ',        icon: Plus,     colorClass: 'bg-brand-500 text-white border-brand-500 hover:bg-brand-600',   path: '/rfq/create' },
    { label: 'Compare Quotes', icon: BarChart2, colorClass: 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100', path: '/rfqs' },
    { label: 'View POs',       icon: Package,  colorClass: 'bg-amber-50  text-amber-700  border-amber-200  hover:bg-amber-100',  path: '/purchase-orders' },
    { label: 'Analytics',      icon: Zap,      colorClass: 'bg-accent-50 text-accent-700 border-accent-200 hover:bg-accent-100', path: '/analytics' },
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { fetchDashboardData(); }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [analyticsRes, posRes] = await Promise.all([
        dashboardService.getDashboardAnalytics(),
        dashboardService.getRecentPurchaseOrders(8),
      ]);
      if (analyticsRes.success) {
        setDashboardSummary(analyticsRes.data?.summary || null);
        setAnalyticsCards(analyticsRes.data?.analyticsCards || []);
        setSpendingAnalytics(analyticsRes.data?.spendingAnalytics || []);
      }
      if (posRes.success) setRecentPurchaseOrders(posRes.data || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const statsConfig = [
    { _id: 'active-rfqs',      label: 'Active RFQs',       sub: 'Open for vendor response',   icon: FileText,       accentBg: 'bg-brand-50',  accentText: 'text-brand-600'  },
    { _id: 'pending-approvals',label: 'Pending Approvals',  sub: 'Awaiting reviewer sign-off', icon: Clock,          accentBg: 'bg-amber-50',  accentText: 'text-amber-600'  },
    { _id: 'procurement-spend',label: 'Procurement Spend',  sub: 'Total this fiscal year',     icon: DollarSign,     accentBg: 'bg-indigo-50', accentText: 'text-indigo-600' },
    { _id: 'overdue-invoices', label: 'Overdue Invoices',   sub: 'Past payment due date',      icon: AlertTriangle,  accentBg: 'bg-red-50',    accentText: 'text-red-500'    },
  ];

  const poColumns = [
    {
      key: 'purchaseOrderId', label: 'PO Reference',
      render: (row) => (
        <span className="font-mono text-xs text-brand-600 font-bold">{row.purchaseOrderId}</span>
      ),
    },
    { key: 'vendorName', label: 'Vendor' },
    { key: 'itemDescription', label: 'Description' },
    {
      key: 'totalAmount', label: 'Amount',
      render: (row) => (
        <span className="font-semibold text-ink-800">₹{Number(row.totalAmount || 0).toLocaleString('en-IN')}</span>
      ),
    },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    {
      key: 'createdAt', label: 'Date',
      render: (row) => row.createdAt
        ? new Date(row.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
        : '—',
    },
  ];

  if (loading) return <LoadingSpinner size="lg" message="Loading dashboard analytics..." />;

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-brand-50 border border-brand-100 flex items-center justify-center">
              <LayoutDashboard size={16} className="text-brand-600" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-ink-900 font-heading">Dashboard</h1>
          </div>
          <p className="text-sm text-ink-400">Central procurement overview — real-time ERP analytics.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {quickActions.map((a) => (
            <QuickActionBtn key={a.label} {...a} />
          ))}
          <button
            onClick={fetchDashboardData}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-surface-border text-ink-400 text-xs font-semibold hover:bg-surface-raised hover:text-ink-700 transition-all"
          >
            <RefreshCw size={12} /> Refresh
          </button>
        </div>
      </div>

      {error && <ErrorState message={error} onRetry={fetchDashboardData} />}

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statsConfig.map((cfg) => (
          <StatCard
            key={cfg._id}
            icon={cfg.icon}
            label={cfg.label}
            sub={cfg.sub}
            accentBg={cfg.accentBg}
            accentText={cfg.accentText}
            value={analyticsCards.find((c) => c._id === cfg._id)?.value}
            trend={analyticsCards.find((c) => c._id === cfg._id)?.trend}
          />
        ))}
      </div>

      {/* Charts + KPI */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card
          title="Spending Trends"
          subtitle="Monthly procurement expenditure"
          className="xl:col-span-2"
          hoverable={false}
          headerActions={
            <span className="text-[10px] font-mono text-ink-400 bg-surface-raised border border-surface-border px-2 py-1 rounded-lg">
              {dashboardSummary?.fiscalYear ?? 'FY 2025-26'}
            </span>
          }
        >
          {spendingAnalytics.length > 0 ? (
            <div className="space-y-4">
              <SparkBarChart data={spendingAnalytics} />
              <div className="flex items-center justify-between pt-3 border-t border-surface-border">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-brand-400" />
                  <span className="text-xs text-ink-400">Monthly Spend (₹)</span>
                </div>
                <span className="text-xs text-ink-500">
                  Total: <span className="text-brand-600 font-bold">
                    ₹{spendingAnalytics.reduce((s, d) => s + (d.value || 0), 0).toLocaleString('en-IN')}
                  </span>
                </span>
              </div>
            </div>
          ) : (
            <div className="h-28 flex flex-col items-center justify-center text-ink-300 gap-2">
              <BarChart2 size={28} className="opacity-30" />
              <p className="text-xs">Spending data will appear after backend integration</p>
            </div>
          )}
        </Card>

        <Card title="Procurement Summary" subtitle="Current period KPIs" hoverable={false}>
          <div className="space-y-4">
            {[
              { label: 'Total Vendors',        value: dashboardSummary?.totalVendors,        color: 'text-brand-600' },
              { label: 'RFQs This Month',      value: dashboardSummary?.rfqsThisMonth,       color: 'text-indigo-600' },
              { label: 'Quotations Received',  value: dashboardSummary?.quotationsReceived,  color: 'text-amber-600' },
              { label: 'POs Generated',        value: dashboardSummary?.posGenerated,        color: 'text-purple-600' },
              { label: 'Savings vs Last Period',value: dashboardSummary?.savingsVsLastPeriod,color: 'text-accent-600' },
            ].map((kpi) => (
              <div key={kpi.label} className="flex items-center justify-between text-sm">
                <span className="text-xs text-ink-400">{kpi.label}</span>
                <span className={`font-bold ${kpi.color}`}>{kpi.value ?? '—'}</span>
              </div>
            ))}
            <div className="pt-3 mt-1 border-t border-surface-border">
              <a href="/analytics" className="flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 font-semibold transition-colors">
                View full analytics <ChevronRight size={12} />
              </a>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent POs */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold text-ink-400 uppercase tracking-widest">Recent Purchase Orders</h2>
          <a href="/purchase-orders" className="text-xs text-brand-600 hover:text-brand-700 font-semibold flex items-center gap-1 transition-colors">
            View All <ChevronRight size={12} />
          </a>
        </div>
        <Table
          columns={poColumns}
          data={recentPurchaseOrders}
          rowKey="purchaseOrderId"
          emptyTitle="No purchase orders yet"
          emptyDescription="Recent purchase orders will appear here after backend integration."
          emptyIcon={Package}
        />
      </div>
    </div>
  );
};

export default DashboardPage;
