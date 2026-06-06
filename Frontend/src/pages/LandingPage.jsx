import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import ParticleBackground from '../components/ui/ParticleBackground';
import apiClient from '../api/apiClient';
import {
  ShieldCheck, ArrowRight, TrendingUp, FileCheck, Workflow,
  Sparkles, Users2, Receipt, BarChart3, Search, Globe, Star, Play, CheckCircle
} from 'lucide-react';

const StatCounter = ({ endValue, suffix = '', duration = 2000 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const target = parseInt(endValue.replace(/[^0-9]/g, ''));
    if (isNaN(target)) {
      setCount(endValue);
      return;
    }
    const increment = Math.ceil(target / (duration / 16));
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        clearInterval(timer);
        setCount(endValue);
      } else {
        setCount(start + (endValue.includes('%') ? '%' : endValue.includes('+') ? '+' : ''));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [endValue, duration]);

  return <span>{count}</span>;
};

export const LandingPage = () => {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, 200]);
  const y2 = useTransform(scrollY, [0, 1000], [0, -200]);
  
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [stats, setStats] = useState([
    { metric: '1,500+', label: 'Vendors Managed' },
    { metric: '45,000+', label: 'RFQs Generated' },
    { metric: '24%', label: 'Procurement Savings' },
    { metric: '350,000+', label: 'Invoices Processed' }
  ]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await apiClient.get('/dashboard/public');
        if (response.data) {
          const data = response.data;
          setStats([
            { metric: data.vendors, label: 'Vendors Managed' },
            { metric: data.rfqs, label: 'RFQs Generated' },
            { metric: data.savings, label: 'Procurement Savings' },
            { metric: data.invoices, label: 'Invoices Processed' }
          ]);
        }
      } catch (error) {
        console.error('Failed to fetch public stats:', error);
      }
    };
    fetchStats();
  }, []);

  const testimonials = [
    {
      quote: "VendorBridge transformed our supply chain. We cut RFQ turnaround by 45% and gained full transparency over quotation compliance.",
      author: "Eleanor Vance", title: "VP of Procurement, Apex Global", rating: 5
    },
    {
      quote: "The quote comparison engine and automated AI recommendations save our managers hours of manual spreadsheet analysis every single week.",
      author: "Marcus Aurelius", title: "Director of Operations, Initech", rating: 5
    },
    {
      quote: "As a vendor, submitting bids is incredibly straightforward. Payment milestones are clear, and approvals happen in record time.",
      author: "Devon Lane", title: "Sales Lead, Acme Industrial Corp", rating: 5
    }
  ];

  const features = [
    { title: 'Vendor Onboarding', icon: Users2, desc: 'Centralize onboardings, verify GST details, and manage risk securely in a single platform.' },
    { title: 'Smart RFQs', icon: FileCheck, desc: 'Generate enterprise requests for quotations and auto-route them to your preferred vendor tier.' },
    { title: 'Quote Intelligence', icon: Search, desc: 'Auto-compare line items, spot lowest bids, and use AI scoring to pick the ideal supplier.' },
    { title: 'Approval Logic', icon: Workflow, desc: 'Custom multi-tier approval workflows ensuring finance managers have the final say.' },
    { title: 'Automated POs', icon: ShieldCheck, desc: 'Transform approved quotations directly into official Purchase Orders instantly.' },
    { title: 'Auto-Invoicing', icon: Receipt, desc: 'Vendors accept POs to auto-generate PDF invoices, instantly ready for your reconciliation.' },
    { title: 'Dynamic Analytics', icon: BarChart3, desc: 'Live dashboards mapping your complete financial ledger and procurement velocity.' },
    { title: 'Immutable Audits', icon: TrendingUp, desc: 'Cryptographically timestamped activity logs for perfect enterprise compliance tracking.' }
  ];

  return (
    <div className="relative min-h-screen bg-slate-50 overflow-hidden font-sans text-slate-900 selection:bg-blue-600/20 selection:text-blue-900">
      
      {/* Dynamic Background Mesh */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-400/20 rounded-full blur-[120px]" />
      </div>

      <ParticleBackground />

      {/* Modern Floating Header */}
      <div className="w-full fixed top-0 inset-x-0 z-50 bg-white/70 backdrop-blur-xl border-b border-slate-200/50">
        <header className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-slate-900">
              Vendor<span className="text-blue-600 font-black">Bridge</span>
            </span>
          </div>
          <div className="flex items-center space-x-6">
            <Link to="/login" className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors">
              Sign In
            </Link>
            <Link
              to="/signup"
              className="text-sm font-bold bg-slate-900 text-white hover:bg-blue-600 px-6 py-2.5 rounded-full transition-all shadow-md hover:shadow-lg"
            >
              Get Started
            </Link>
          </div>
        </header>
      </div>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-40 pb-28 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
        
        {/* Hero Copy */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="lg:col-span-6 space-y-8"
        >
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-xs font-bold text-blue-700 tracking-wide uppercase">
            <Sparkles className="w-4 h-4 mr-1" />
            <span>The Enterprise Procurement Standard</span>
          </div>
          
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 leading-[1.1]">
            Source Smarter.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Procure Faster.
            </span>
          </h1>
          
          <p className="text-lg sm:text-xl text-slate-600 leading-relaxed max-w-xl font-medium">
            VendorBridge automates your entire supply chain. From smart RFQs and AI-assisted bid comparisons to automated Purchase Orders and one-click Invoice reconciliation.
          </p>
          
          <div className="flex flex-wrap items-center gap-4 pt-4">
            <Link
              to="/signup"
              className="flex items-center space-x-2 text-base font-bold bg-blue-600 text-white px-8 py-4 rounded-full transition-all hover:bg-blue-700 hover:scale-105 shadow-xl shadow-blue-600/30 group"
            >
              <span>Deploy Now</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/login"
              className="flex items-center space-x-2 text-base font-bold bg-white border-2 border-slate-200 text-slate-700 px-8 py-4 rounded-full hover:border-slate-300 hover:bg-slate-50 transition-all shadow-sm"
            >
              <Play className="w-5 h-5 fill-current text-slate-700" />
              <span>Watch Demo</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-6 pt-6 opacity-70">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Trusted By Innovators</p>
            <div className="flex space-x-4 grayscale opacity-50">
               {/* Faux Company Logos using Typography */}
               <span className="font-serif font-black text-lg">Acme Corp</span>
               <span className="font-mono font-bold text-lg">Initech</span>
               <span className="font-sans font-black text-lg tracking-tighter">GLOBEX</span>
            </div>
          </div>
        </motion.div>

        {/* Hero Interactive UI Mockup */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="lg:col-span-6 relative"
          style={{ y: y1 }}
        >
          {/* Main Glass Panel */}
          <div className="relative w-full aspect-square max-h-[500px] bg-white/80 backdrop-blur-3xl border border-white/50 rounded-[2rem] shadow-2xl p-8 overflow-hidden">
            {/* Top Bar Mockup */}
            <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-4">
               <div className="flex space-x-2">
                 <div className="w-3 h-3 rounded-full bg-red-400" />
                 <div className="w-3 h-3 rounded-full bg-amber-400" />
                 <div className="w-3 h-3 rounded-full bg-emerald-400" />
               </div>
               <span className="text-[10px] font-mono font-bold text-slate-400 tracking-widest">VB-ORCHESTRATOR</span>
            </div>
            
            {/* Action List Mockup */}
            <div className="space-y-4">
              <div className="flex items-center p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center mr-4">
                   <ShieldCheck className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-900">Purchase Order Auto-Generated</p>
                  <p className="text-xs text-emerald-600 font-medium">PO-2026-0042 • Global Tech Solutions</p>
                </div>
                <div className="text-right">
                   <p className="text-sm font-black text-slate-900">$28,500</p>
                </div>
              </div>

              <div className="flex items-center p-4 bg-blue-50 border border-blue-100 rounded-2xl relative overflow-hidden">
                <div className="absolute right-0 top-0 bottom-0 w-1 bg-blue-500 animate-pulse" />
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                   <Receipt className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-900">Invoice Pending Payment</p>
                  <p className="text-xs text-blue-600 font-medium">INV-2026-0012 • Acme Logistics</p>
                </div>
                <button className="px-4 py-2 bg-blue-600 text-white text-[10px] font-bold rounded-lg shadow-md hover:bg-blue-700 transition">
                  RECONCILE
                </button>
              </div>

              <div className="flex items-center p-4 bg-slate-50 border border-slate-100 rounded-2xl opacity-70">
                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center mr-4">
                   <FileCheck className="w-5 h-5 text-slate-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-900">Quotation Submitted</p>
                  <p className="text-xs text-slate-500 font-medium">RFQ-0099 • Stark Industries</p>
                </div>
              </div>
            </div>
            
            {/* Absolute floating element */}
            <motion.div 
               animate={{ y: [-10, 10, -10] }}
               transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
               className="absolute -right-6 -bottom-6 bg-slate-900 text-white p-6 rounded-2xl shadow-2xl border border-slate-800"
            >
               <div className="flex items-center space-x-3">
                 <div className="bg-emerald-500/20 p-2 rounded-full">
                    <CheckCircle className="w-6 h-6 text-emerald-400" />
                 </div>
                 <div>
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-widest">Compliance Status</p>
                    <p className="text-base font-bold text-white">100% Audit Verified</p>
                 </div>
               </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Feature Grids */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-32 border-t border-slate-200">
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-6">
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
            The Complete Toolkit
          </h2>
          <p className="text-lg text-slate-600 font-medium">
            Everything your procurement officers, finance managers, and vendors need, seamlessly integrated into a single unified platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={feat.title}
                whileHover={{ y: -8 }}
                className="group flex flex-col h-full bg-white border border-slate-200 p-8 rounded-[2rem] shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 group-hover:bg-blue-50 group-hover:border-blue-100 flex items-center justify-center text-slate-700 group-hover:text-blue-600 transition-colors mb-6">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 mb-3">{feat.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed font-medium flex-1">{feat.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* The Procurement Pipeline Roadmap */}
      <section className="relative z-10 py-32 bg-slate-900 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-24 space-y-6">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight">
              A Seamless Pipeline
            </h2>
            <p className="text-lg text-slate-400 font-medium">
              Watch documents flow mathematically from raw RFQ to a finalized Paid Invoice. No data entry repeated twice.
            </p>
          </div>

          <div className="relative">
            {/* Connecting Line */}
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-800 -translate-y-1/2 hidden lg:block overflow-hidden">
               <motion.div 
                 animate={{ x: ['-100%', '100%'] }}
                 transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                 className="h-full w-1/3 bg-gradient-to-r from-transparent via-blue-500 to-transparent"
               />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 relative z-10">
              {[
                { step: '01', title: 'Onboard', icon: Users2 },
                { step: '02', title: 'Create RFQ', icon: FileCheck },
                { step: '03', title: 'Vendor Bids', icon: Sparkles },
                { step: '04', title: 'Approvals', icon: Workflow },
                { step: '05', title: 'Auto-PO', icon: ShieldCheck },
                { step: '06', title: 'Auto-Invoice', icon: Receipt }
              ].map((node) => {
                const Icon = node.icon;
                return (
                  <div key={node.step} className="bg-slate-800 border border-slate-700 rounded-3xl p-6 text-center flex flex-col items-center hover:bg-slate-700 transition">
                    <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-blue-400 mb-4 shadow-inner">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-base text-white mb-1">{node.title}</h4>
                    <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Step {node.step}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Counters Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-24 border-b border-slate-200">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[3rem] p-12 shadow-2xl text-white text-center">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
            {stats.map(stat => (
              <div key={stat.label} className="space-y-2">
                <h3 className="text-4xl md:text-5xl font-black tracking-tighter drop-shadow-md">
                  <StatCounter endValue={stat.metric} />
                </h3>
                <p className="text-sm text-blue-200 font-bold uppercase tracking-widest">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 bg-white py-16 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span className="font-black text-xl text-slate-900">VendorBridge</span>
          </div>
          
          <div className="flex space-x-8 text-sm font-bold text-slate-500">
            <Link to="/login" className="hover:text-blue-600 transition">Sign In</Link>
            <a href="#" className="hover:text-blue-600 transition">Privacy Policy</a>
            <a href="#" className="hover:text-blue-600 transition">Terms of Service</a>
          </div>
          
          <div className="text-sm font-medium text-slate-400">
            &copy; {new Date().getFullYear()} VendorBridge Inc. Enterprise Grade.
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
