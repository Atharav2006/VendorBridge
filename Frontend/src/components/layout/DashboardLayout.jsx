import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, Link, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  Menu, 
  X, 
  User, 
  LogOut, 
  ChevronDown,
  ShieldCheck,
  CheckCircle2,
  FileClock
} from 'lucide-react';

export const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const { approvals } = useApp();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Handle path name translation
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.startsWith('/dashboard')) return 'System Dashboard';
    if (path.startsWith('/vendors')) return 'Vendor Directory';
    if (path.startsWith('/rfqs')) return 'Request for Quotations (RFQs)';
    if (path.startsWith('/quotations')) return 'Vendor Quotations';
    if (path.startsWith('/approvals')) return 'Approval Center';
    if (path.startsWith('/purchase-orders')) return 'Purchase Orders';
    if (path.startsWith('/invoices')) return 'Invoices & Ledger';
    if (path.startsWith('/activity-logs')) return 'Audit Trail Logs';
    if (path.startsWith('/settings')) return 'System Settings';
    return 'Dashboard';
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Extract pending tasks as notification list
  const pendingApprovals = approvals.filter(a => a.status === 'Pending').slice(0, 4);

  return (
    <div className="min-h-screen bg-background text-foreground flex font-sans transition-colors duration-300">
      
      {/* Sidebar for Desktop */}
      <Sidebar isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} />

      {/* Mobile Sidebar overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 z-30 bg-white backdrop-blur-sm md:hidden"
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed inset-y-0 left-0 w-72 bg-white z-40 p-6 flex flex-col md:hidden border-r border-border shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center glow-ring-primary">
                    <ShieldCheck className="w-5 h-5 text-slate-800" />
                  </div>
                  <span className="font-bold text-lg tracking-wider text-slate-800">VendorBridge</span>
                </div>
                <button onClick={() => setIsMobileOpen(false)} className="text-slate-500 hover:text-slate-700 hover:bg-slate-100 p-1 rounded-lg">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <nav className="flex-1 space-y-2">
                {[
                  { name: 'Dashboard', path: '/dashboard' },
                  { name: 'Vendors', path: '/vendors', roles: ['Admin', 'Procurement Officer'] },
                  { name: 'RFQs', path: '/rfqs', roles: ['Admin', 'Procurement Officer', 'Vendor'] },
                  { name: 'Quotations', path: '/quotations', roles: ['Admin', 'Procurement Officer', 'Vendor'] },
                  { name: 'Approvals', path: '/approvals', roles: ['Admin', 'Manager'] },
                  { name: 'Purchase Orders', path: '/purchase-orders' },
                  { name: 'Invoices', path: '/invoices' },
                  { name: 'Activity Logs', path: '/activity-logs', roles: ['Admin', 'Procurement Officer', 'Manager'] },
                  { name: 'Settings', path: '/settings' },
                ]
                  .filter(item => !item.roles || item.roles.includes(user?.role))
                  .map(item => (
                    <Link
                      key={item.name}
                      to={item.path}
                      onClick={() => setIsMobileOpen(false)}
                      className={`block py-3 px-4 rounded-xl text-sm font-medium transition ${
                        location.pathname === item.path ? 'bg-primary/10 text-primary border-l-4 border-primary shadow-sm' : 'text-slate-500 hover:text-primary hover:bg-slate-50'
                      }`}
                    >
                      {item.name}
                    </Link>
                  ))}
              </nav>
              <div className="border-t border-border pt-4 mt-auto">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 ring-1 ring-border">
                    {user?.name?.[0]}
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800 text-sm">{user?.name}</h4>
                    <p className="text-xs text-slate-500">{user?.role}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full py-2.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl text-sm font-medium transition flex items-center justify-center space-x-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Workspace */}
      <div 
        className="flex-1 min-h-screen flex flex-col transition-all duration-300 relative z-10"
        style={{
          paddingLeft: typeof window !== 'undefined' && window.innerWidth >= 768 ? (isSidebarCollapsed ? '76px' : '260px') : '0px'
        }}
      >
        
        {/* Dynamic lights layer */}
        <div className="absolute top-0 right-0 w-[400px] h-[300px] bg-primary/10 blur-[120px] pointer-events-none z-0 rounded-full" />
        <div className="absolute bottom-0 left-10 w-[400px] h-[300px] bg-secondary/30 blur-[120px] pointer-events-none z-0 rounded-full" />

        {/* Top Header */}
        <header className="h-20 border-b border-border bg-white/60 backdrop-blur-xl flex items-center justify-between px-6 md:px-8 relative z-30 shadow-sm">
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="p-2 text-slate-500 hover:text-primary hover:bg-slate-100 rounded-xl md:hidden transition"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-800 select-none">
              {getPageTitle()}
            </h1>
          </div>

          <div className="flex items-center space-x-4">


            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsNotificationsOpen(!isNotificationsOpen);
                  setIsProfileOpen(false);
                }}
                className="p-2 text-slate-500 hover:text-primary hover:bg-slate-100 rounded-xl transition relative"
              >
                <Bell className="w-5 h-5" />
                {pendingApprovals.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-accent rounded-full ring-2 ring-white animate-pulse" />
                )}
              </button>

              <AnimatePresence>
                {isNotificationsOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsNotificationsOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 15, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 15, scale: 0.95 }}
                      className="absolute right-0 mt-3 w-80 bg-white border border-border shadow-sm rounded-2xl border border-border rounded-2xl shadow-2xl p-4 z-50 text-slate-700"
                    >
                      <div className="flex justify-between items-center pb-3 border-b border-border mb-3">
                        <span className="font-semibold text-slate-800">Pending Approvals</span>
                        <span className="text-xs bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-bold">
                          {pendingApprovals.length} New
                        </span>
                      </div>
                      <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                        {pendingApprovals.length === 0 ? (
                          <div className="text-center py-6 text-slate-500 text-sm">
                            <CheckCircle2 className="w-8 h-8 text-primary mx-auto mb-2 opacity-60" />
                            All documents processed!
                          </div>
                        ) : (
                          pendingApprovals.map(approval => (
                            <Link
                              key={approval.id}
                              to="/approvals"
                              onClick={() => setIsNotificationsOpen(false)}
                              className="block p-2 rounded-xl hover:bg-slate-50 transition border border-transparent hover:border-border"
                            >
                              <div className="flex items-start">
                                <FileClock className="w-4 h-4 text-primary mt-0.5 mr-2" />
                                <div className="text-xs">
                                  <p className="font-semibold text-slate-800 line-clamp-1">{approval.title}</p>
                                  <p className="text-slate-500">Request by {approval.requestedBy}</p>
                                  {approval.amount > 0 && (
                                    <p className="text-accent font-bold mt-0.5">${approval.amount.toLocaleString()}</p>
                                  )}
                                </div>
                              </div>
                            </Link>
                          ))
                        )}
                      </div>
                      <div className="border-t border-border pt-3 mt-3 text-center">
                        <Link
                          to="/approvals"
                          onClick={() => setIsNotificationsOpen(false)}
                          className="text-xs text-primary hover:text-primary-dark font-semibold hover:underline"
                        >
                          View Approval Dashboard
                        </Link>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsProfileOpen(!isProfileOpen);
                  setIsNotificationsOpen(false);
                }}
                className="flex items-center space-x-2.5 p-1.5 hover:bg-slate-100 rounded-xl transition"
              >
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-700 ring-1 ring-border">
                  {user?.name?.[0]}
                </div>
                <span className="hidden sm:inline text-sm font-semibold text-slate-700">{user?.name}</span>
                <ChevronDown className="w-4 h-4 text-slate-500 hidden sm:block" />
              </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 15, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 15, scale: 0.95 }}
                      className="absolute right-0 mt-3 w-56 bg-white border border-border shadow-sm rounded-2xl border border-border rounded-2xl shadow-2xl p-2 z-50 text-slate-700"
                    >
                      <div className="p-3 border-b border-border">
                        <p className="font-semibold text-slate-800 truncate">{user?.name}</p>
                        <p className="text-xs text-slate-500 truncate mt-0.5">{user?.email}</p>
                        <span className="inline-block mt-2 text-[10px] bg-primary/10 text-primary border border-primary/20 font-bold px-2 py-0.5 rounded">
                          {user?.role}
                        </span>
                      </div>
                      <div className="p-1 space-y-0.5">
                        <Link
                          to="/settings"
                          onClick={() => setIsProfileOpen(false)}
                          className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-sm text-slate-600 hover:text-primary hover:bg-slate-50 transition"
                        >
                          <User className="w-4 h-4 text-slate-500" />
                          <span>My Profile</span>
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-sm text-red-500 hover:bg-red-50 transition"
                        >
                          <LogOut className="w-4 h-4 text-red-500" />
                          <span>Logout</span>
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

          </div>
        </header>

        {/* Content Outlet wrapper */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto relative z-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
export default DashboardLayout;
