import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  FilePlus,
  ClipboardList,
  GitCompare,
  CheckSquare,
  FileText,
  History,
  BarChart3,
  Shield,
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';

export const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user } = useAuth();
  const role = user?.role || 'Admin'; // fallback

  // ── Procurement Modules ────────────────────────────────────────────────────
  const procurementItems = [
    { path: '/dashboard',          name: 'Dashboard',          icon: LayoutDashboard, roles: ['Admin', 'Manager', 'Purchaser', 'Vendor'] },
    { path: '/rfqs',               name: 'Active RFQs',        icon: FileText,        roles: ['Admin', 'Manager', 'Purchaser', 'Vendor'] },
    { path: '/vendors',            name: 'Vendors',            icon: Building2,       roles: ['Admin', 'Manager', 'Purchaser'] },
    { path: '/rfq/create',         name: 'Create RFQ',         icon: FilePlus,        roles: ['Admin', 'Purchaser'] },
  ].filter(item => item.roles.includes(role));

  // ── Workflow Modules ────────────────────────────────────────────────────────
  const workflowItems = [
    { path: '/approvals',       name: 'Approvals Workflow',  icon: CheckSquare, roles: ['Admin', 'Manager'] },
    { path: '/purchase-orders', name: 'Invoices & POs',      icon: FileText,    roles: ['Admin', 'Manager', 'Purchaser', 'Vendor'] },
    { path: '/audit-logs',      name: 'Audit & Activity',    icon: History,     roles: ['Admin', 'Manager', 'Purchaser'] },
    { path: '/analytics',       name: 'Reports & Analytics', icon: BarChart3,   roles: ['Admin', 'Manager'] },
  ].filter(item => item.roles.includes(role));

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'bg-brand-50 text-brand-700 border border-brand-200 shadow-sm font-semibold'
        : 'text-ink-500 hover:bg-surface-raised hover:text-ink-700 border border-transparent'
    }`;

  const SectionMenu = ({ items }) => (
    <div className="space-y-0.5">
      {items.map(({ path, name, icon: Icon }) => (
        <NavLink key={path} to={path} onClick={() => toggleSidebar(false)} className={navLinkClass}>
          <Icon size={16} className="shrink-0" />
          <span className="truncate">{name}</span>
        </NavLink>
      ))}
    </div>
  );

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          onClick={() => toggleSidebar(false)}
          className="fixed inset-0 z-40 bg-ink-900/30 backdrop-blur-sm md:hidden"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-surface-border flex flex-col shadow-card-md transition-transform duration-300 transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-5 border-b border-surface-border bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-brand">
              <Shield size={17} className="text-white" />
            </div>
            <span className="font-heading text-lg font-bold tracking-tight text-ink-900">
              Vendor<span className="text-brand-600">Bridge</span>
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-5 px-3 overflow-y-auto space-y-6">

          {/* Procurement */}
          <div>
            <p className="px-3 text-[10px] font-bold text-ink-300 uppercase tracking-widest mb-2">
              Procurement
            </p>
            <SectionMenu items={procurementItems} />
          </div>

          {/* Workflow */}
          <div>
            <p className="px-3 text-[10px] font-bold text-ink-300 uppercase tracking-widest mb-2">
              Workflow & Finance
            </p>
            <SectionMenu items={workflowItems} />
          </div>

        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-surface-border bg-surface-raised/60">
          <div className="flex items-center justify-center gap-2 text-[11px] text-ink-400">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-500 animate-pulse-slow" />
            <span>API Gateway Online</span>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
