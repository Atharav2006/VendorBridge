import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import GlassCard from '../../components/ui/GlassCard';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { BarChart3, TrendingUp, DollarSign, Calendar, Filter } from 'lucide-react';

const COLORS = ['#2563EB', '#14B8A6', '#F59E0B', '#A855F7', '#EC4899', '#3B82F6', '#10B981'];

export const AnalyticsPage = () => {
  const { purchaseOrders, vendors, rfqs, invoices } = useApp();
  const [catFilter, setCatFilter] = useState('All');

  // Group vendors for category filter
  const categories = ['All', ...new Set(vendors.map(v => v.category))];

  // Spend Analysis mock data (reconciled by category)
  const spendTrendData = [
    { name: 'Jan', Manufacturing: 12000, ITServices: 8000, Total: 20000 },
    { name: 'Feb', Manufacturing: 15000, ITServices: 9500, Total: 24500 },
    { name: 'Mar', Manufacturing: 18000, ITServices: 11000, Total: 29000 },
    { name: 'Apr', Manufacturing: 22000, ITServices: 13000, Total: 35000 },
    { name: 'May', Manufacturing: 25000, ITServices: 14500, Total: 39500 },
    { name: 'Jun', Manufacturing: 28500, ITServices: 45000, Total: 73500 }
  ];

  // Filtered spend trend
  const getFilteredSpend = () => {
    return spendTrendData.map(d => {
      if (catFilter === 'All') return { name: d.name, Spend: d.Total };
      if (catFilter === 'Manufacturing') return { name: d.name, Spend: d.Manufacturing };
      if (catFilter === 'IT Services') return { name: d.name, Spend: d.ITServices };
      return { name: d.name, Spend: Math.round(d.Total * 0.1) }; // fallback scaling
    });
  };

  // Vendor Performance / rating distribution
  const vendorPerformanceData = vendors
    .filter(v => catFilter === 'All' || v.category === catFilter)
    .map(v => ({
      name: v.name.split(' ')[0], // short name
      Rating: v.rating,
      onTimeDelivery: v.rating * 18 + Math.floor(Math.random() * 5) // Mock delivery rate percentage (e.g. 90%)
    }));

  // RFQ conversion data
  const rfqConversionData = [
    { name: 'RFQ-1 Steel', Bids: 3, ConversionDays: 4 },
    { name: 'RFQ-2 ERP', Bids: 2, ConversionDays: 7 },
    { name: 'RFQ-3 Lab', Bids: 1, ConversionDays: 5 }
  ];

  // Approval efficiency data (Hours to approve documents)
  const approvalEfficiencyData = [
    { name: 'Q1 Quote', Hours: 2.5 },
    { name: 'Q2 Quote', Hours: 4.8 },
    { name: 'RFQ-3 Setup', Hours: 1.2 },
    { name: 'PO-1 Steel', Hours: 3.5 }
  ];

  // Invoice status data
  const paidCount = invoices.filter(i => i.status === 'Paid').length;
  const unpaidCount = invoices.filter(i => i.status !== 'Paid').length;
  const invoiceStatusData = [
    { name: 'Paid Invoices', value: paidCount },
    { name: 'Pending Payment', value: unpaidCount }
  ];

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-wide">Procurement Analytics</h2>
          <p className="text-xs text-slate-500 mt-0.5">Analyze historical spend distributions, vendors scores, and cycle speeds</p>
        </div>
        
        {/* Category Filters */}
        <div className="flex items-center space-x-2 bg-white/30 p-2 border border-border rounded-xl">
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-xs text-slate-500 font-semibold">Segment:</span>
          <select
            value={catFilter}
            onChange={(e) => setCatFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg glass-input text-slate-800 text-xs bg-white cursor-pointer"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Analytics Charts grids */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Spend Trend */}
        <GlassCard className="lg:col-span-8 p-6" hoverEffect={false}>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Procurement Spend Trend</h3>
            <span className="text-xs text-primary font-bold flex items-center">
              <TrendingUp className="w-3.5 h-3.5 mr-1" /> Upward projection
            </span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={getFilteredSpend()}>
                <defs>
                  <linearGradient id="colorSpendTrend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14B8A6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#14B8A6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  labelStyle={{ fontWeight: 'bold', color: '#fff' }}
                />
                <Area type="monotone" name="Monthly Spend" dataKey="Spend" stroke="#14B8A6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSpendTrend)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Invoice status Pie */}
        <GlassCard className="lg:col-span-4 p-6" hoverEffect={false}>
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-6">Invoice Settlement Status</h3>
          <div className="h-56 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={invoiceStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  <Cell fill="#14B8A6" />
                  <Cell fill="#EF4444" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-around text-xs mt-4">
            <div className="flex items-center space-x-2 text-emerald-400 font-bold">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
              <span>Paid ({paidCount})</span>
            </div>
            <div className="flex items-center space-x-2 text-red-400 font-bold">
              <span className="w-2.5 h-2.5 bg-red-500 rounded-full" />
              <span>Unpaid ({unpaidCount})</span>
            </div>
          </div>
        </GlassCard>

        {/* Vendor Rating & Deliveries */}
        <GlassCard className="lg:col-span-6 p-6" hoverEffect={false}>
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-6">Supplier Compliance Score</h3>
          {vendorPerformanceData.length === 0 ? (
            <p className="text-xs text-slate-500 py-12 text-center">No vendor data available.</p>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={vendorPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                  <YAxis stroke="#64748b" fontSize={10} domain={[0, 5]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  />
                  <Bar dataKey="Rating" fill="#F59E0B" radius={[4, 4, 0, 0]} barSize={25} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </GlassCard>

        {/* RFQ Conversion speed */}
        <GlassCard className="lg:col-span-6 p-6" hoverEffect={false}>
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-6">RFQ Conversion Timelines</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rfqConversionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                />
                <Legend />
                <Bar name="Bids Submitted" dataKey="Bids" fill="#2563EB" radius={[4, 4, 0, 0]} />
                <Bar name="Cycle Speed (Days)" dataKey="ConversionDays" fill="#14B8A6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Approval efficiency */}
        <GlassCard className="lg:col-span-12 p-6" hoverEffect={false}>
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-6">Manager Approval Cycle Times (Hours)</h3>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={approvalEfficiencyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                />
                <Line type="monotone" dataKey="Hours" stroke="#A855F7" strokeWidth={3} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

      </div>

    </div>
  );
};
export default AnalyticsPage;
