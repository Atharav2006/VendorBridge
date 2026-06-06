import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Menu, LogOut, Bell } from 'lucide-react';

export const TopNavbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();

  const getRoleBadge = (role) => {
    const map = {
      Admin:     'bg-red-50    text-red-600    border-red-200   ',
      Manager:   'bg-indigo-50 text-indigo-600 border-indigo-200',
      Purchaser: 'bg-brand-50  text-brand-700  border-brand-200 ',
      Vendor:    'bg-amber-50  text-amber-700  border-amber-200 ',
    };
    return map[role] || 'bg-slate-50 text-slate-600 border-slate-200';
  };

  return (
    <header className="fixed top-0 right-0 left-0 md:left-64 h-16 bg-white/90 backdrop-blur-md border-b border-surface-border z-30 flex items-center justify-between px-5 shadow-card">

      {/* Mobile Hamburger */}
      <button
        onClick={onMenuClick}
        className="p-2 -ml-1.5 text-ink-400 hover:text-ink-700 hover:bg-surface-raised rounded-lg transition-all md:hidden"
      >
        <Menu size={20} />
      </button>

      {/* Breadcrumb label */}
      <div className="hidden sm:flex items-center gap-2">
        <span className="text-[11px] font-semibold text-ink-300 tracking-widest uppercase">
          VendorBridge ERP
        </span>
        <span className="w-1 h-1 rounded-full bg-ink-200" />
        <span className="text-[11px] text-ink-400 font-mono">Central Workspace</span>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3 ml-auto">

        {/* Notification Bell */}
        <button className="relative p-2 text-ink-400 hover:text-ink-700 hover:bg-surface-raised rounded-lg transition-all">
          <Bell size={17} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-accent-500" />
        </button>

        {user && (
          <div className="flex items-center gap-3 pl-3 border-l border-surface-border">
            {/* Avatar initials */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
              {user.username?.[0]?.toUpperCase() || 'U'}
            </div>

            {/* User info */}
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-ink-700 leading-tight">{user.username}</p>
              <p className="text-[10px] text-ink-400 leading-tight mt-0.5">{user.email}</p>
            </div>

            {/* Role badge */}
            <span
              className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${getRoleBadge(user.role)}`}
            >
              {user.role}
            </span>
          </div>
        )}

        {/* Logout */}
        <button
          onClick={logout}
          className="flex items-center gap-1.5 text-ink-400 hover:text-red-500 text-xs font-medium p-2 rounded-lg hover:bg-red-50 transition-all"
          title="Sign out"
        >
          <LogOut size={15} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};

export default TopNavbar;
