import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import GlassCard from '../../components/ui/GlassCard';
import Skeleton from '../../components/ui/Skeleton';
import Modal from '../../components/ui/Modal';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import {
  Users,
  FileText,
  FileSpreadsheet,
  ShoppingBag,
  CreditCard,
  TrendingUp,
  PlusCircle,
  ArrowRightLeft,
  CheckSquare,
  FileBadge,
  Clock,
  ThumbsUp,
  ThumbsDown,
  ArrowUpRight,
  UserCheck
} from 'lucide-react';

// Custom Tooltip for Recharts
const ChartTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-border p-3 rounded-xl backdrop-blur-md shadow-md text-xs">
        <p className="font-bold text-slate-800 mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="text-primary">
            <span className="text-slate-500 font-semibold">{p.name}: </span>
            {typeof p.value === 'number' && p.name.includes('Spend') ? `$${p.value.toLocaleString()}` : p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Colors for Pie Charts
const COLORS = ['#2563EB', '#14B8A6', '#F59E0B', '#A855F7', '#EC4899'];

export const Dashboard = () => {
  const { user } = useAuth();
  const { 
    vendors, 
    rfqs, 
    quotations, 
    approvals, 
    purchaseOrders, 
    invoices, 
    activities,
    updateApprovalStatus
  } = useApp();
  
  const [loading, setLoading] = useState(true);
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [comments, setComments] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 bg-slate-100 animate-pulse rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="lg:col-span-2 h-80 w-full" />
          <Skeleton className="h-80 w-full" />
        </div>
      </div>
    );
  }

  // Common calculations
  const totalSpend = purchaseOrders.reduce((sum, p) => sum + p.total, 0);

  // Render Admin Dashboard
  const renderAdminDashboard = () => {
    // Group vendors by category for chart
    const catMap = {};
    vendors.forEach(v => {
      catMap[v.category] = (catMap[v.category] || 0) + 1;
    });
    const vendorDistributionData = Object.entries(catMap).map(([name, value]) => ({ name, value }));

    // Monthly Spend Data
    const monthlySpendData = [
      { name: 'Jan', Spend: totalSpend * 0.35 },
      { name: 'Feb', Spend: totalSpend * 0.45 },
      { name: 'Mar', Spend: totalSpend * 0.6 },
      { name: 'Apr', Spend: totalSpend * 0.75 },
      { name: 'May', Spend: totalSpend * 0.9 },
      { name: 'Jun', Spend: totalSpend }
    ];

    // RFQ Trends Data
    const rfqTrendsData = [
      { name: 'Open', count: rfqs.filter(r => r.status === 'Open').length },
      { name: 'Closed', count: rfqs.filter(r => r.status === 'Closed').length },
      { name: 'Compared', count: rfqs.filter(r => r.status === 'Compared').length }
    ];

    // Approval status pie data
    const appMap = { Pending: 0, Approved: 0, Rejected: 0 };
    approvals.forEach(a => { appMap[a.status] = (appMap[a.status] || 0) + 1; });
    const approvalPieData = Object.entries(appMap).map(([name, value]) => ({ name, value }));

    return (
      <div className="space-y-8">
        {/* KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          <GlassCard className="p-4 flex flex-col justify-between" glowOnHover>
            <div className="flex justify-between items-start">
              <span className="text-xs text-slate-500 font-semibold">Total Vendors</span>
              <span className="p-1 bg-primary/10 rounded-lg text-primary"><Users className="w-4 h-4" /></span>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-bold text-slate-800">{vendors.length}</h3>
              <p className="text-[10px] text-emerald-400 mt-1 flex items-center font-bold">
                <TrendingUp className="w-3 h-3 mr-0.5" /> +12% this month
              </p>
            </div>
          </GlassCard>

          <GlassCard className="p-4 flex flex-col justify-between" glowOnHover>
            <div className="flex justify-between items-start">
              <span className="text-xs text-slate-500 font-semibold">Total RFQs</span>
              <span className="p-1 bg-teal-500/10 rounded-lg text-teal-400"><FileText className="w-4 h-4" /></span>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-bold text-slate-800">{rfqs.length}</h3>
              <p className="text-[10px] text-emerald-400 mt-1 flex items-center font-bold">
                <TrendingUp className="w-3 h-3 mr-0.5" /> +8% this month
              </p>
            </div>
          </GlassCard>

          <GlassCard className="p-4 flex flex-col justify-between" glowOnHover>
            <div className="flex justify-between items-start">
              <span className="text-xs text-slate-500 font-semibold">Quotations</span>
              <span className="p-1 bg-yellow-500/10 rounded-lg text-yellow-400"><FileSpreadsheet className="w-4 h-4" /></span>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-bold text-slate-800">{quotations.length}</h3>
              <p className="text-[10px] text-slate-500 mt-1">2.4 bids per RFQ avg</p>
            </div>
          </GlassCard>

          <GlassCard className="p-4 flex flex-col justify-between" glowOnHover>
            <div className="flex justify-between items-start">
              <span className="text-xs text-slate-500 font-semibold">Purchase Orders</span>
              <span className="p-1 bg-indigo-500/10 rounded-lg text-indigo-400"><ShoppingBag className="w-4 h-4" /></span>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-bold text-slate-800">{purchaseOrders.length}</h3>
              <p className="text-[10px] text-emerald-400 mt-1 flex items-center font-bold">
                <TrendingUp className="w-3 h-3 mr-0.5" /> 100% fulfill rate
              </p>
            </div>
          </GlassCard>

          <GlassCard className="p-4 flex flex-col justify-between" glowOnHover>
            <div className="flex justify-between items-start">
              <span className="text-xs text-slate-500 font-semibold">Invoices Ledger</span>
              <span className="p-1 bg-pink-500/10 rounded-lg text-pink-400"><CreditCard className="w-4 h-4" /></span>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-bold text-slate-800">{invoices.length}</h3>
              <p className="text-[10px] text-slate-500 mt-1">
                {invoices.filter(i => i.status === 'Paid').length} paid / {invoices.filter(i => i.status !== 'Paid').length} unpaid
              </p>
            </div>
          </GlassCard>

          <GlassCard className="p-4 flex flex-col justify-between border-primary/20 bg-gradient-to-br from-primary/10 to-slate-900/50" glowOnHover>
            <div className="flex justify-between items-start">
              <span className="text-xs text-slate-600 font-semibold">Monthly Spend</span>
              <span className="p-1 bg-blue-500/20 rounded-lg text-primary-light"><TrendingUp className="w-4 h-4" /></span>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-black text-slate-800">${totalSpend.toLocaleString()}</h3>
              <p className="text-[10px] text-primary mt-1 font-bold">Budget Savings 24%</p>
            </div>
          </GlassCard>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Monthly Spend */}
          <GlassCard className="lg:col-span-8 p-6" hoverEffect={false}>
            <h3 className="text-base font-bold text-slate-800 mb-6">Monthly Procurement Spend ($)</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlySpendData}>
                  <defs>
                    <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="Spend" stroke="#2563EB" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSpend)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          {/* Vendor distribution Pie */}
          <GlassCard className="lg:col-span-4 p-6" hoverEffect={false}>
            <h3 className="text-base font-bold text-slate-800 mb-6">Vendor Distribution</h3>
            <div className="h-56 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={vendorDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {vendorDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500 mt-4">
              {vendorDistributionData.map((d, i) => (
                <div key={d.name} className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="truncate">{d.name} ({d.value})</span>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* RFQ Status Trends */}
          <GlassCard className="lg:col-span-6 p-6" hoverEffect={false}>
            <h3 className="text-base font-bold text-slate-800 mb-6">RFQ Status Breakdown</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={rfqTrendsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="count" fill="#14B8A6" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          {/* Approvals pie */}
          <GlassCard className="lg:col-span-6 p-6" hoverEffect={false}>
            <h3 className="text-base font-bold text-slate-800 mb-6">Approval Status Overview</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={approvalPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={0}
                    outerRadius={70}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    dataKey="value"
                  >
                    {approvalPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.name === 'Approved' ? '#14B8A6' : entry.name === 'Pending' ? '#F59E0B' : '#EF4444'} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </div>

        {/* Audit Activity & Recent Vendors */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Recent Vendors */}
          <GlassCard className="lg:col-span-5 p-6" hoverEffect={false}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Onboarded Vendors</h3>
              <Link to="/vendors" className="text-xs text-primary font-bold hover:underline flex items-center">
                All Vendors <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </div>
            <div className="space-y-4">
              {vendors.slice(-4).map(v => (
                <div key={v.id} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm font-bold text-slate-800">{v.name}</p>
                    <p className="text-[10px] text-slate-500">{v.category} // GST: {v.gst}</p>
                  </div>
                  <span className={`text-[10px] px-2.5 py-0.5 rounded font-black border ${
                    v.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                    v.status === 'Onboarding' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
                  }`}>
                    {v.status}
                  </span>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Audit Logs */}
          <GlassCard className="lg:col-span-7 p-6" hoverEffect={false}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">System Activity Logs</h3>
              <Link to="/activity-logs" className="text-xs text-primary font-bold hover:underline flex items-center">
                Full Log <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </div>
            <div className="space-y-3 overflow-y-auto max-h-72 pr-1">
              {activities.slice(0, 5).map(act => (
                <div key={act.id} className="flex items-start justify-between text-xs py-2 border-b border-border last:border-0">
                  <div className="space-y-0.5">
                    <p className="text-slate-800">
                      <span className="font-semibold text-primary">{act.userName}</span> ({act.userRole}){' '}
                      <span className="text-slate-600 font-mono">{act.action}</span>
                    </p>
                    <p className="text-[10px] text-slate-500">{act.entity} ({act.entityId})</p>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(act.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    );
  };

  // Render Procurement Officer Dashboard
  const renderOfficerDashboard = () => {
    const activeRfqs = rfqs.filter(r => r.status === 'Open');
    const openQuotes = quotations.filter(q => q.status === 'Pending');

    return (
      <div className="space-y-8">
        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          <GlassCard className="p-5 flex justify-between items-center">
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Active RFQs</p>
              <h3 className="text-3xl font-extrabold text-slate-800 mt-1.5">{activeRfqs.length}</h3>
            </div>
            <div className="p-3.5 bg-primary/10 rounded-xl text-primary"><FileText className="w-6 h-6" /></div>
          </GlassCard>

          <GlassCard className="p-5 flex justify-between items-center">
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Pending Approvals</p>
              <h3 className="text-3xl font-extrabold text-slate-800 mt-1.5">{approvals.filter(a => a.status?.toLowerCase() === 'pending').length}</h3>
            </div>
            <div className="p-3.5 bg-accent/10 rounded-xl text-accent"><Clock className="w-6 h-6" /></div>
          </GlassCard>

          <GlassCard className="p-5 flex justify-between items-center">
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Open Quotations</p>
              <h3 className="text-3xl font-extrabold text-slate-800 mt-1.5">{openQuotes.length}</h3>
            </div>
            <div className="p-3.5 bg-secondary/10 rounded-xl text-primary"><FileSpreadsheet className="w-6 h-6" /></div>
          </GlassCard>

          <GlassCard className="p-5 flex justify-between items-center">
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Purchase Orders</p>
              <h3 className="text-3xl font-extrabold text-slate-800 mt-1.5">{purchaseOrders.length}</h3>
            </div>
            <div className="p-3.5 bg-indigo-500/10 rounded-xl text-indigo-400"><ShoppingBag className="w-6 h-6" /></div>
          </GlassCard>
        </div>

        {/* Quick Actions Panel */}
        <GlassCard className="p-6" hoverEffect={false}>
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-5">Quick Dashboard Actions</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Link
              to="/rfqs/create"
              className="flex flex-col items-center justify-center p-5 bg-slate-50 border border-border hover:border-primary/40 rounded-2xl hover:bg-primary/5 transition group text-center"
            >
              <PlusCircle className="w-8 h-8 text-primary group-hover:scale-110 transition-transform mb-3" />
              <span className="text-sm font-bold text-slate-800">Create RFQ</span>
              <span className="text-[10px] text-slate-500 mt-1">Multi-step Wizard</span>
            </Link>

            <Link
              to="/quotations"
              className="flex flex-col items-center justify-center p-5 bg-slate-50 border border-border hover:border-secondary/40 rounded-2xl hover:bg-secondary/5 transition group text-center"
            >
              <ArrowRightLeft className="w-8 h-8 text-primary group-hover:scale-110 transition-transform mb-3" />
              <span className="text-sm font-bold text-slate-800">Compare Quotations</span>
              <span className="text-[10px] text-slate-500 mt-1">Bid comparison tool</span>
            </Link>

            <Link
              to="/purchase-orders"
              className="flex flex-col items-center justify-center p-5 bg-slate-50 border border-border hover:border-indigo-500/40 rounded-2xl hover:bg-indigo-500/5 transition group text-center"
            >
              <ShoppingBag className="w-8 h-8 text-indigo-400 group-hover:scale-110 transition-transform mb-3" />
              <span className="text-sm font-bold text-slate-800">Generate PO</span>
              <span className="text-[10px] text-slate-500 mt-1">Accept quote and issue PO</span>
            </Link>

            <Link
              to="/invoices"
              className="flex flex-col items-center justify-center p-5 bg-slate-50 border border-border hover:border-pink-500/40 rounded-2xl hover:bg-pink-500/5 transition group text-center"
            >
              <CreditCard className="w-8 h-8 text-pink-400 group-hover:scale-110 transition-transform mb-3" />
              <span className="text-sm font-bold text-slate-800">Generate Invoice</span>
              <span className="text-[10px] text-slate-500 mt-1">Manage vendor payments</span>
            </Link>
          </div>
        </GlassCard>

        {/* Spend & Conversion Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <GlassCard className="lg:col-span-8 p-6" hoverEffect={false}>
            <h3 className="text-base font-bold text-slate-800 mb-6">RFQ Performance Trend</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={[
                    { name: 'Wk 1', count: 3, bidRate: 2.1 },
                    { name: 'Wk 2', count: 4, bidRate: 2.5 },
                    { name: 'Wk 3', count: 6, bidRate: 2.9 },
                    { name: 'Wk 4', count: 7, bidRate: 3.2 }
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend />
                  <Area type="monotone" name="Created RFQs" dataKey="count" stroke="#2563EB" fill="rgba(37,99,235,0.05)" />
                  <Area type="monotone" name="Average Bid Rate" dataKey="bidRate" stroke="#14B8A6" fill="rgba(20,184,166,0.05)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          <GlassCard className="lg:col-span-4 p-6" hoverEffect={false}>
            <h3 className="text-base font-bold text-slate-800 mb-6">Spend Allocation</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={[
                    { name: 'Acme Steel', value: 28500 },
                    { name: 'Initech ERP', value: 45000 },
                    { name: 'Umbrella Lab', value: 12000 }
                  ]}
                >
                  <CartesianGrid stroke="#e2e8f0" />
                  <XAxis type="number" stroke="#64748b" fontSize={10} />
                  <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={10} width={70} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="value" fill="#F59E0B" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </div>
      </div>
    );
  };

  // Render Manager Dashboard
  const renderManagerDashboard = () => {
    const pendingList = approvals.filter(a => a.status?.toLowerCase() === 'pending');
    const approvedCount = approvals.filter(a => a.status?.toLowerCase() === 'approved').length;
    const rejectedCount = approvals.filter(a => a.status?.toLowerCase() === 'rejected').length;

    const handleApprove = (id) => {
      updateApprovalStatus(id, 'Approved', 'Approved by Finance Director Robert Vance.', user);
    };

    const handleReject = (id) => {
      setSelectedApproval(approvals.find(a => a.id === id));
      setComments('');
    };

    const handleConfirmReject = () => {
      if (selectedApproval) {
        updateApprovalStatus(selectedApproval.id, 'Rejected', comments || 'Rejected by Finance Director Robert Vance.', user);
        setSelectedApproval(null);
      }
    };

    return (
      <div className="space-y-8">
        {/* KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <GlassCard className="p-5 flex justify-between items-center border-amber-500/20 bg-amber-500/5">
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Pending Approvals</p>
              <h3 className="text-3xl font-extrabold text-amber-400 mt-1.5">{pendingList.length}</h3>
            </div>
            <div className="p-3.5 bg-amber-500/10 rounded-xl text-amber-400"><Clock className="w-6 h-6 animate-pulse" /></div>
          </GlassCard>

          <GlassCard className="p-5 flex justify-between items-center border-emerald-500/20 bg-emerald-500/5">
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Approved Requests</p>
              <h3 className="text-3xl font-extrabold text-emerald-400 mt-1.5">{approvedCount}</h3>
            </div>
            <div className="p-3.5 bg-emerald-500/10 rounded-xl text-emerald-400"><ThumbsUp className="w-6 h-6" /></div>
          </GlassCard>

          <GlassCard className="p-5 flex justify-between items-center border-red-500/20 bg-red-500/5">
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Rejected Requests</p>
              <h3 className="text-3xl font-extrabold text-red-400 mt-1.5">{rejectedCount}</h3>
            </div>
            <div className="p-3.5 bg-red-500/10 rounded-xl text-red-400"><ThumbsDown className="w-6 h-6" /></div>
          </GlassCard>
        </div>

        {/* Approval Queue */}
        <GlassCard className="p-6" hoverEffect={false}>
          <h3 className="text-base font-bold text-slate-800 mb-5 uppercase tracking-wide">Document Approvals Queue</h3>
          {pendingList.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm">
              <CheckSquare className="w-12 h-12 text-primary mx-auto mb-3 opacity-60" />
              All clean! There are no documents awaiting your approval.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="pb-3">Type</th>
                    <th className="pb-3">Description</th>
                    <th className="pb-3">Requested By</th>
                    <th className="pb-3">Value</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-xs">
                  {pendingList.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 font-bold text-slate-700">
                        <span className={`px-2 py-0.5 rounded text-[10px] ${
                          item.type === 'Quotation' ? 'bg-primary/20 text-primary-light border border-primary/30' : 
                          item.type === 'Purchase Order' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                        }`}>
                          {item.type}
                        </span>
                      </td>
                      <td className="py-4">
                        <p className="font-semibold text-slate-800">{item.title}</p>
                        <p className="text-[10px] text-slate-500 line-clamp-1">{item.comments}</p>
                      </td>
                      <td className="py-4 text-slate-600">{item.requestedBy}</td>
                      <td className="py-4 text-primary font-extrabold">
                        {item.amount > 0 ? `$${item.amount.toLocaleString()}` : '—'}
                      </td>
                      <td className="py-4 text-right space-x-2">
                        <button
                          onClick={() => handleApprove(item.id)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-slate-800 rounded-lg font-bold text-[10px] transition"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(item.id)}
                          className="px-3 py-1.5 bg-red-950/40 hover:bg-red-900/40 text-red-400 border border-red-900/30 rounded-lg font-bold text-[10px] transition"
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </GlassCard>

        {/* Modal for Reject Comments */}
        <Modal
          isOpen={!!selectedApproval}
          onClose={() => setSelectedApproval(null)}
          title="Input Rejection Comments"
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-500">
              Please provide a detailed justification for rejecting approval request: 
              <span className="font-bold text-slate-800 block mt-1">{selectedApproval?.title}</span>
            </p>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="e.g. Price exceeds the allocated line budget by 15%..."
              className="w-full h-24 p-3 rounded-xl glass-input text-slate-800 text-xs"
            />
            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setSelectedApproval(null)}
                className="px-4 py-2 bg-slate-50 text-slate-600 hover:text-slate-800 rounded-lg text-xs transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-slate-800 rounded-lg text-xs font-bold transition"
              >
                Reject Document
              </button>
            </div>
          </div>
        </Modal>
      </div>
    );
  };

  // Render Vendor Dashboard
  const renderVendorDashboard = () => {
    // Dynamically retrieve the vendor profile linked to the authenticated user
    const myVendor = vendors.find(v => v.linkedUserId === user?.id || v.linkedUserId === user?._id || (user?.email && v.email === user.email));
    const vendorId = myVendor?.id || myVendor?._id || null;

    const myQuotes = quotations.filter(q => q.vendorId === vendorId || (q.vendorId && q.vendorId._id === vendorId) || (q.vendorId && q.vendorId.id === vendorId));
    const myPos = purchaseOrders.filter(p => p.vendorId === vendorId || (p.vendorId && p.vendorId._id === vendorId) || (p.vendorId && p.vendorId.id === vendorId));
    const myInvoices = invoices.filter(i => i.vendorId === vendorId || (i.vendorId && i.vendorId._id === vendorId) || (i.vendorId && i.vendorId.id === vendorId));

    return (
      <div className="space-y-8">
        {/* KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
          <GlassCard className="p-5 flex justify-between items-center">
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Open RFQs</p>
              <h3 className="text-3xl font-extrabold text-slate-800 mt-1.5">
                {rfqs.filter(r => {
                  const assigned = r.assignedVendorIds || r.assignedVendors || [];
                  return assigned.some(v => v === vendorId || v.id === vendorId || v._id === vendorId) && r.status === 'Open';
                }).length}
              </h3>
            </div>
            <div className="p-3.5 bg-primary/10 rounded-xl text-primary"><FileText className="w-6 h-6" /></div>
          </GlassCard>

          <GlassCard className="p-5 flex justify-between items-center">
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Submitted Quotes</p>
              <h3 className="text-3xl font-extrabold text-slate-800 mt-1.5">{myQuotes.length}</h3>
            </div>
            <div className="p-3.5 bg-secondary/10 rounded-xl text-primary"><FileSpreadsheet className="w-6 h-6" /></div>
          </GlassCard>

          <GlassCard className="p-5 flex justify-between items-center">
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Received POs</p>
              <h3 className="text-3xl font-extrabold text-slate-800 mt-1.5">{myPos.length}</h3>
            </div>
            <div className="p-3.5 bg-indigo-500/10 rounded-xl text-indigo-400"><ShoppingBag className="w-6 h-6" /></div>
          </GlassCard>

          <GlassCard className="p-5 flex justify-between items-center border-emerald-500/20 bg-emerald-500/5">
            <div>
              <p className="text-xs text-emerald-400/80 font-bold uppercase tracking-wider">Payments Ledger</p>
              <h3 className="text-3xl font-extrabold text-emerald-400 mt-1.5">
                ${myInvoices.filter(i => i.status === 'Paid').reduce((sum, i) => sum + i.total, 0).toLocaleString()}
              </h3>
            </div>
            <div className="p-3.5 bg-emerald-500/10 rounded-xl text-emerald-400"><CreditCard className="w-6 h-6" /></div>
          </GlassCard>
        </div>

        {/* Action / Process flow */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Quotes Listing */}
          <GlassCard className="lg:col-span-7 p-6" hoverEffect={false}>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-5">Your Submitted Quotations</h3>
            {myQuotes.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No quotations uploaded.</p>
            ) : (
              <div className="space-y-3">
                {myQuotes.map(q => (
                  <div key={q.id} className="p-4 bg-slate-50 border border-border rounded-xl flex items-center justify-between">
                    <div>
                      <p className="font-bold text-sm text-slate-800">{q.rfqTitle}</p>
                      <p className="text-[10px] text-slate-500">Total Bidded Value: ${q.grandTotal.toLocaleString()} // Due: {q.deliveryDays} Days</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      q.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 
                      q.status === 'Pending' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                      {q.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>

          {/* PO Deliveries Timeline */}
          <GlassCard className="lg:col-span-5 p-6" hoverEffect={false}>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-5">PO Order Tracking</h3>
            {myPos.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No active Purchase Orders.</p>
            ) : (
              <div className="space-y-4">
                {myPos.map(p => (
                  <div key={p.id} className="relative pl-6 pb-2 border-l border-border last:border-0 last:pb-0">
                    <span className="absolute left-[-5px] top-1.5 w-2.5 h-2.5 rounded-full bg-secondary ring-4 ring-[#0f172a]" />
                    <p className="text-xs font-bold text-slate-800">PO: #{p.id} ({p.status})</p>
                    <p className="text-[10px] text-slate-500">Target Delivery: {p.deliveryDate}</p>
                    <p className="text-[11px] text-primary font-extrabold mt-0.5">${p.total.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Profile Title Welcome */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-border">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-800 flex items-center space-x-2">
            <span>Welcome, {user?.name}</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping inline-block" />
          </h2>
          <p className="text-xs text-slate-500 mt-1">Logged role: {user?.role} — VendorBridge Secure Network</p>
        </div>
        <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-border text-xs text-slate-500 font-mono">
          <UserCheck className="w-3.5 h-3.5 text-primary" />
          <span>Active Token Session</span>
        </div>
      </div>

      {/* Renders dashboard by role */}
      {user?.role === 'Admin' && renderAdminDashboard()}
      {user?.role === 'Procurement Officer' && renderOfficerDashboard()}
      {user?.role === 'Manager' && renderManagerDashboard()}
      {user?.role === 'Vendor' && renderVendorDashboard()}
    </div>
  );
};
export default Dashboard;
