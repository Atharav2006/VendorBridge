import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Lock, Mail, AlertTriangle, Zap, Info } from 'lucide-react';

const QUICK_LOGIN_ROLES = [
  {
    role: 'Admin',
    username: 'admin@vendorbridge.com',
    password: 'password123',
    color: 'text-red-600 border-red-200 hover:border-red-400 hover:bg-red-50',
    dot: 'bg-red-400',
  },
  {
    role: 'Manager',
    username: 'manager@vendorbridge.com',
    password: 'password123',
    color: 'text-indigo-600 border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50',
    dot: 'bg-indigo-400',
  },
  {
    role: 'Purchaser',
    username: 'purchaser@vendorbridge.com',
    password: 'password123',
    color: 'text-brand-700 border-brand-200 hover:border-brand-400 hover:bg-brand-50',
    dot: 'bg-brand-400',
  },
  {
    role: 'Vendor',
    username: 'sales@steelmetals.com',
    password: 'password123',
    color: 'text-amber-700 border-amber-200 hover:border-amber-400 hover:bg-amber-50',
    dot: 'bg-amber-400',
  },
];

export const LoginPage = () => {
  const { login, loginDemo, error: authError } = useAuth();
  const navigate = useNavigate();

  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');
  const [demoMode, setDemoMode] = useState(false);
  const [activeQuickRole, setActiveQuickRole] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!emailOrUsername || !password) {
      setLocalError('Please fill in all credentials');
      return;
    }
    setLocalError('');
    setLoading(true);
    const res = await login(emailOrUsername, password);
    setLoading(false);
    if (res.success) navigate('/dashboard');
  };

  const handleQuickLogin = async (item) => {
    setLocalError('');
    setActiveQuickRole(item.role);
    const res = await login(item.username, item.password);
    setActiveQuickRole(null);
    if (res.success) {
      navigate('/dashboard');
    } else {
      setLocalError('Quick login failed. Please try again or check backend server.');
    }
  };

  const displayError = localError || (authError && !demoMode ? authError : '');
  const inputClass =
    'w-full pl-10 pr-4 py-2.5 bg-white border border-surface-border focus:border-brand-400 focus:ring-2 focus:ring-brand-100 rounded-xl text-sm text-ink-800 outline-none transition-all placeholder:text-ink-300';
  const labelClass = 'text-[11px] font-bold text-ink-400 uppercase tracking-wider';

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-accent-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">

      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-100/60 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-accent-100/50 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      {/* Demo Banner */}
      {demoMode && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-2xl text-amber-700 text-xs font-semibold shadow-card-md backdrop-blur-md">
          <Zap size={13} className="shrink-0" />
          Demo Mode — Backend offline. UI is fully functional with mock data.
        </div>
      )}

      {/* Card */}
      <div className="w-full max-w-md bg-white border border-surface-border rounded-3xl shadow-card-lg p-8 relative z-10 animate-slide-up">

        {/* Branding */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white mx-auto mb-4 shadow-brand">
            <Shield size={28} strokeWidth={1.8} />
          </div>
          <h1 className="text-2xl font-bold text-ink-900 tracking-tight font-heading">
            VendorBridge ERP
          </h1>
          <p className="text-sm text-ink-400 mt-1">Enterprise Procurement Portal</p>
        </div>

        {/* Error */}
        {displayError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-red-600 text-xs mb-5">
            <AlertTriangle size={14} className="mt-0.5 shrink-0" />
            <span className="leading-relaxed">{displayError}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className={labelClass}>Email or Username</label>
            <div className="relative">
              <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-300" />
              <input
                type="text"
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                placeholder="Enter email or username"
                className={inputClass}
                disabled={loading}
                autoComplete="username"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className={labelClass}>Password</label>
            <div className="relative">
              <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-300" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={inputClass}
                disabled={loading}
                autoComplete="current-password"
              />
            </div>
          </div>

          <div className="flex items-center justify-between mt-1">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" className="w-3.5 h-3.5 rounded border-surface-border text-brand-600 focus:ring-brand-500" />
              <span className="text-[11px] text-ink-500">Remember me</span>
            </label>
            <a href="#" className="text-[11px] font-semibold text-brand-600 hover:text-brand-700 transition-colors">
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-1 bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white text-sm font-bold rounded-xl transition-all shadow-brand flex justify-center items-center gap-2 disabled:opacity-60"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Sign In'
            )}
          </button>
          
          <p className="text-center text-xs text-ink-500 mt-4">
            Don't have an account? <a href="#" className="font-semibold text-brand-600 hover:text-brand-700">Sign up</a>
          </p>
        </form>

        {/* Quick Login */}
        <div className="mt-7 pt-6 border-t border-surface-border">
          <div className="flex items-center justify-center gap-1.5 mb-3">
            <Zap size={11} className="text-ink-300" />
            <p className="text-[10px] font-bold text-ink-400 uppercase tracking-widest">
              Quick Login
            </p>
            <div className="group relative ml-1">
              <Info size={11} className="text-ink-300 cursor-help" />
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 p-2.5 bg-ink-900 text-white border border-ink-700 rounded-xl text-[10px] leading-relaxed invisible group-hover:visible z-20 shadow-xl">
                Tries the backend API first. Falls back to demo mode automatically if the server is offline.
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {QUICK_LOGIN_ROLES.map((item) => {
              const isSpinning = activeQuickRole === item.role;
              return (
                <button
                  key={item.role}
                  type="button"
                  onClick={() => handleQuickLogin(item)}
                  disabled={!!activeQuickRole || loading}
                  className={`flex items-center justify-center gap-2 px-3 py-2.5 bg-white border text-[11px] font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed ${item.color}`}
                >
                  {isSpinning ? (
                    <>
                      <span className="w-3 h-3 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                      <span>Connecting...</span>
                    </>
                  ) : (
                    <>
                      <span className={`w-1.5 h-1.5 rounded-full ${item.dot}`} />
                      <span>{item.role}</span>
                    </>
                  )}
                </button>
              );
            })}
          </div>

          <p className="text-center text-[10px] text-ink-300 mt-3 leading-relaxed">
            Backend not running? Quick login will auto-switch to demo mode.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
