import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  FileText,
  FileSpreadsheet,
  CheckSquare,
  ShoppingBag,
  CreditCard,
  History,
  Settings,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

export const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Navigation schema with role constraints
  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['Admin', 'Procurement Officer', 'Manager', 'Vendor'] },
    { name: 'Vendors', path: '/vendors', icon: Users, roles: ['Admin', 'Procurement Officer'] },
    { name: 'RFQs', path: '/rfqs', icon: FileText, roles: ['Admin', 'Procurement Officer', 'Vendor'] },
    { name: 'Quotations', path: '/quotations', icon: FileSpreadsheet, roles: ['Admin', 'Procurement Officer', 'Vendor'] },
    { name: 'Approvals', path: '/approvals', icon: CheckSquare, roles: ['Admin', 'Manager'] },
    { name: 'Purchase Orders', path: '/purchase-orders', icon: ShoppingBag, roles: ['Admin', 'Procurement Officer', 'Manager', 'Vendor'] },
    { name: 'Invoices', path: '/invoices', icon: CreditCard, roles: ['Admin', 'Procurement Officer', 'Manager', 'Vendor'] },
    { name: 'Activity Logs', path: '/activity-logs', icon: History, roles: ['Admin', 'Procurement Officer', 'Manager'] },
    { name: 'Settings', path: '/settings', icon: Settings, roles: ['Admin', 'Procurement Officer', 'Manager', 'Vendor'] },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const filteredMenuItems = menuItems.filter(item => item.roles.includes(user?.role));

  return (
    <motion.aside
      animate={{ width: isCollapsed ? 76 : 260 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="hidden md:flex flex-col h-screen fixed left-0 top-0 border-r border-border bg-white z-20 overflow-hidden shadow-sm"
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between h-20 px-6 border-b border-border">
        <AnimatePresence mode="wait">
          {!isCollapsed ? (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex items-center space-x-2.5"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center glow-ring-primary">
                <ShieldCheck className="w-5 h-5 text-slate-800" />
              </div>
              <span className="font-bold text-lg tracking-wider text-slate-800">
                Vendor<span className="text-primary font-black">Bridge</span>
              </span>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center glow-ring-primary mx-auto"
            >
              <ShieldCheck className="w-5 h-5 text-slate-800" />
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-slate-500 hover:text-slate-700 p-1 hover:bg-slate-100 rounded-lg transition"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {filteredMenuItems.map(item => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center rounded-xl py-3 px-3.5 text-sm font-medium transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-primary/10 text-primary border-l-4 border-primary font-bold'
                    : 'text-slate-500 hover:text-primary hover:bg-slate-50'
                }`
              }
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    className="ml-4 truncate"
                  >
                    {item.name}
                  </motion.span>
                )}
              </AnimatePresence>

              {/* Tooltip on collapse */}
              {isCollapsed && (
                <div className="absolute left-20 scale-0 group-hover:scale-100 bg-white border border-border text-slate-700 text-xs px-2.5 py-1.5 rounded-lg transition-transform duration-200 shadow-md pointer-events-none">
                  {item.name}
                </div>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer User Profile Summary */}
      <div className="p-4 border-t border-border bg-slate-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center min-w-0">
            <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-bold ring-1 ring-border">
              {user?.name ? user.name[0] : <User className="w-4 h-4" />}
            </div>
            {!isCollapsed && (
              <div className="ml-3 min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">{user?.name}</p>
                <p className="text-xs text-slate-500 truncate">{user?.role}</p>
              </div>
            )}
          </div>
          
          {!isCollapsed && (
            <button
              onClick={handleLogout}
              className="text-slate-500 hover:text-red-500 p-1.5 hover:bg-red-50 rounded-lg transition"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
        
        {isCollapsed && (
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center text-slate-500 hover:text-red-500 py-3.5 mt-2 hover:bg-red-50 rounded-xl transition"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        )}
      </div>
    </motion.aside>
  );
};
export default Sidebar;
