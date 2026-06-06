import React, { useState, useEffect } from 'react';
import reportService, {
  GET_REPORT_ANALYTICS_API,
  EXPORT_REPORT_API,
} from '../services/reportService';
import {
  BarChart3,
  DollarSign,
  FileCheck2,
  Users,
  Calendar,
  Download,
  Percent,
  TrendingUp,
} from 'lucide-react';
import Card from '../components/common/Card';
import Table from '../components/common/Table';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorState from '../components/common/ErrorState';

export const ReportsAnalyticsPage = () => {
  // Explicitly declared variables required by USER
  const [reportSummary, setReportSummary] = useState({
    totalSpent: 0,
    totalSubtotal: 0,
    totalTax: 0,
    activePOsCount: 0,
    pendingApprovalsCount: 0,
    vendorCount: 0,
  });
  const [vendorAnalytics, setVendorAnalytics] = useState([]);
  const [monthlyTrend, setMonthlyTrend] = useState([]);
  const [spendingCategories, setSpendingCategories] = useState([]);
  const [reportFilters, setReportFilters] = useState({
    year: '2026',
    category: 'ALL',
    exportFormat: 'CSV',
  });
  const [chartData, setChartData] = useState({
    monthlyLabels: [],
    monthlyAmounts: [],
    categoryLabels: [],
    categoryValues: [],
  });
  const [exportStatus, setExportStatus] = useState(''); // Export status feedback string
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch report data on mount
  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      // API INTEGRATION POINT: GET_REPORT_ANALYTICS_API
      const res = await reportService.getAnalytics();
      if (res.success && res.data) {
        const { reportSummary: summary, vendorAnalytics: va, monthlyTrend: mt, spendingCategories: sc, chartData: cd } = res.data;
        setReportSummary(summary);
        setVendorAnalytics(va);
        setMonthlyTrend(mt);
        setSpendingCategories(sc);
        setChartData(cd);
      } else {
        throw new Error(res.message || 'Failed to fetch analytics');
      }
    } catch (err) {
      console.error('Fetch Analytics Error:', err.message);
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    setExportStatus('Initiating export payload...');
    try {
      // API INTEGRATION POINT: EXPORT_REPORT_API
      const res = await reportService.exportReport(reportFilters.exportFormat, 'procurement_summary');
      if (res.success) {
        setExportStatus(res.message);
        setTimeout(() => setExportStatus(''), 4000); // clear feedback
      } else {
        throw new Error(res.message || 'Export trigger failed');
      }
    } catch (err) {
      setExportStatus(`Export failed: ${err.message}`);
    }
  };

  // SVG Helper: Calculate max for scaling graph height
  const maxSpend = chartData.monthlyAmounts.length > 0 ? Math.max(...chartData.monthlyAmounts) : 100;

  const vendorColumns = [
    { key: 'vendorName', label: 'Vendor Partner' },
    { key: 'ordersCount', label: 'Completed Orders', render: (row) => row.ordersCount.toLocaleString() },
    {
      key: 'averageOrderValue',
      label: 'Avg Order Value',
      render: (row) => `$${row.averageOrderValue.toLocaleString()}`,
    },
    {
      key: 'totalSpent',
      label: 'Volume Spent',
      render: (row) => (
        <span className="font-bold text-brand-400">${row.totalSpent.toLocaleString()}</span>
      ),
    },
  ];

  if (loading && reportSummary.totalSpent === 0) {
    return <LoadingSpinner size="lg" message="Compiling real-time ERP analytics..." />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header & Export Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-heading">
            Reports & Analytics
          </h1>
          <p className="text-sm text-neutral-400">
            Real-time visual monitoring of corporate spend, vendor metrics, and operations.
          </p>
        </div>

        {/* Toolbar Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Filters */}
          <select
            value={reportFilters.year}
            onChange={(e) => setReportFilters({ ...reportFilters, year: e.target.value })}
            className="px-3 py-2 bg-neutral-900 border border-neutral-800 text-neutral-300 rounded-xl text-xs outline-none focus:border-brand-500/50"
          >
            <option value="2026">Financial Year 2026</option>
            <option value="2025">Financial Year 2025</option>
          </select>

          {/* Export Dropdown */}
          <select
            value={reportFilters.exportFormat}
            onChange={(e) => setReportFilters({ ...reportFilters, exportFormat: e.target.value })}
            className="px-3 py-2 bg-neutral-900 border border-neutral-800 text-neutral-300 rounded-xl text-xs outline-none focus:border-brand-500/50"
          >
            <option value="CSV">Export Format: CSV</option>
            <option value="PDF">Export Format: PDF</option>
          </select>

          {/* Export Button */}
          <button
            onClick={handleExport}
            className="flex items-center space-x-1.5 px-4 py-2 bg-brand-500 hover:bg-brand-400 active:bg-brand-600 text-black text-xs font-bold rounded-xl shadow-lg shadow-brand-500/10 transition-all"
          >
            <Download size={14} />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {exportStatus && (
        <div className="p-3 bg-brand-950/20 border border-brand-800/40 text-brand-400 rounded-xl text-xs font-semibold animate-pulse-slow">
          {exportStatus}
        </div>
      )}

      {error && <ErrorState message={error} onRetry={fetchAnalytics} />}

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Spend */}
        <Card hoverable={true} className="p-4 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                Centralized Spend
              </p>
              <h3 className="text-2xl font-bold text-emerald-400 mt-1 font-heading">
                ${reportSummary.totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </h3>
            </div>
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/25 rounded-lg text-emerald-400">
              <DollarSign size={18} />
            </div>
          </div>
          <div className="flex items-center space-x-1 text-[10px] text-neutral-400 mt-3 pt-2.5 border-t border-neutral-900">
            <TrendingUp size={12} className="text-emerald-400" />
            <span className="font-semibold text-emerald-400">+14.2%</span>
            <span>from past FY period</span>
          </div>
        </Card>

        {/* KPI 2: Active POs */}
        <Card hoverable={true} className="p-4 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                Active Purchase Orders
              </p>
              <h3 className="text-2xl font-bold text-zinc-100 mt-1 font-heading">
                {reportSummary.activePOsCount}
              </h3>
            </div>
            <div className="p-2 bg-neutral-900 border border-neutral-850 rounded-lg text-neutral-400">
              <FileCheck2 size={18} />
            </div>
          </div>
          <div className="text-[10px] text-neutral-500 mt-3 pt-2.5 border-t border-neutral-900">
            PO contracts requiring fulfillment
          </div>
        </Card>

        {/* KPI 3: Pending Approvals */}
        <Card hoverable={true} className="p-4 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                Pending RFQ Approvals
              </p>
              <h3 className="text-2xl font-bold text-zinc-100 mt-1 font-heading">
                {reportSummary.pendingApprovalsCount}
              </h3>
            </div>
            <div className="p-2 bg-neutral-900 border border-neutral-850 rounded-lg text-neutral-400">
              <BarChart3 size={18} />
            </div>
          </div>
          <div className="text-[10px] text-neutral-500 mt-3 pt-2.5 border-t border-neutral-900">
            Workflows awaiting approval decisions
          </div>
        </Card>

        {/* KPI 4: Active Vendors */}
        <Card hoverable={true} className="p-4 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                Registered Active Vendors
              </p>
              <h3 className="text-2xl font-bold text-zinc-100 mt-1 font-heading">
                {reportSummary.vendorCount}
              </h3>
            </div>
            <div className="p-2 bg-neutral-900 border border-neutral-850 rounded-lg text-neutral-400">
              <Users size={18} />
            </div>
          </div>
          <div className="text-[10px] text-neutral-500 mt-3 pt-2.5 border-t border-neutral-900">
            Certified partner profiles online
          </div>
        </Card>
      </div>

      {/* Visual Graphical Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spend Trend Chart (SVG Column representation) */}
        <Card title="Monthly Spending Analytics" subtitle="Overall monthly total volume processed ($)" hoverable={false}>
          {chartData.monthlyAmounts.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-xs text-neutral-500">
              No trend data available for current selection.
            </div>
          ) : (
            <div className="space-y-4 pt-2">
              {/* SVG Chart Column Container */}
              <div className="relative w-full h-48 flex items-end justify-between border-b border-neutral-800 pb-2">
                {/* Y-axis helper ticks */}
                <div className="absolute left-0 right-0 top-0 border-t border-neutral-850/40" />
                <div className="absolute left-0 right-0 top-1/2 border-t border-neutral-850/40" />
                
                {chartData.monthlyAmounts.map((amt, idx) => {
                  const percentHeight = maxSpend > 0 ? (amt / maxSpend) * 100 : 0;
                  return (
                    <div key={idx} className="flex flex-col items-center flex-1 group relative">
                      {/* Tooltip on Hover */}
                      <span className="absolute -top-10 scale-0 group-hover:scale-100 bg-neutral-900 border border-neutral-850 text-white font-mono text-[9px] font-bold px-2 py-1 rounded shadow-lg pointer-events-none transition-transform origin-bottom duration-150 z-20 whitespace-nowrap">
                        ${amt.toLocaleString()}
                      </span>
                      
                      {/* Bar Pillar */}
                      <div
                        style={{ height: `${Math.max(percentHeight, 4)}%` }}
                        className="w-8 sm:w-10 bg-brand-500/20 hover:bg-brand-500/40 border-t-2 border-brand-500 rounded-t transition-all duration-300"
                      />
                    </div>
                  );
                })}
              </div>

              {/* X-axis labels */}
              <div className="flex justify-between px-1.5 text-[10px] text-neutral-500 font-mono">
                {chartData.monthlyLabels.map((lbl, idx) => (
                  <span key={idx} className="flex-1 text-center truncate">
                    {lbl}
                  </span>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Spend Category Breakdown (SVG Progress indicators) */}
        <Card title="Spending Breakdown by Category" subtitle="Distribution of aggregate procurement categories" hoverable={false}>
          {spendingCategories.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-xs text-neutral-500">
              No category aggregates compiled yet.
            </div>
          ) : (
            <div className="space-y-5 pt-3">
              {spendingCategories.map((cat, idx) => {
                const totalCategorySpend = spendingCategories.reduce((sum, item) => sum + item.value, 0);
                const percentShare = totalCategorySpend > 0 ? (cat.value / totalCategorySpend) * 100 : 0;
                
                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-zinc-200">{cat.name || 'Materials'}</span>
                      <span className="text-neutral-400 font-mono">
                        ${cat.value.toLocaleString()} ({Math.round(percentShare)}%)
                      </span>
                    </div>
                    {/* Progress Bar Track */}
                    <div className="w-full h-2 bg-neutral-900 rounded-full overflow-hidden border border-neutral-850">
                      <div
                        style={{ width: `${percentShare}%` }}
                        className="h-full bg-brand-500 rounded-full transition-all duration-500"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Vendor Summary list */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold text-neutral-500 uppercase tracking-widest px-1">
          Top Performing Vendors
        </h2>
        <Table
          columns={vendorColumns}
          data={vendorAnalytics}
          emptyTitle="No vendor analytics"
          emptyDescription="There are currently no vendor purchase order entries compiled."
        />
      </div>
    </div>
  );
};

export default ReportsAnalyticsPage;
