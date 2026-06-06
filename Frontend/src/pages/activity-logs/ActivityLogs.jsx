import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import GlassCard from '../../components/ui/GlassCard';
import { History, Search, Filter, ShieldAlert, Clock, User } from 'lucide-react';

export const ActivityLogs = () => {
  const { activities } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');

  const filteredLogs = activities.filter(act => {
    const matchSearch = act.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        act.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        act.entity.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRole = roleFilter === 'All' || act.userRole === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 tracking-wide">System Audit Trail Logs</h2>
        <p className="text-xs text-slate-500 mt-0.5">Secure, timestamped records of all document status updates and approvals</p>
      </div>

      {/* Filters */}
      <GlassCard className="p-4 flex flex-col sm:flex-row sm:items-center gap-4" hoverEffect={false}>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search logs by action, username, or document code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl glass-input text-slate-800 text-xs"
          />
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-500 font-semibold flex items-center">
            <Filter className="w-3.5 h-3.5 mr-1" /> Filter Role:
          </span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 rounded-xl glass-input text-slate-800 text-xs bg-white cursor-pointer"
          >
            <option value="All">All Roles</option>
            <option value="Admin">Admin</option>
            <option value="Procurement Officer">Procurement Officer</option>
            <option value="Manager">Manager</option>
            <option value="Vendor">Vendor</option>
          </select>
        </div>
      </GlassCard>

      {/* Timeline List */}
      <GlassCard className="p-6 md:p-8" hoverEffect={false}>
        {filteredLogs.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-sm">
            <History className="w-12 h-12 text-slate-500 mx-auto mb-3 opacity-60" />
            No audit logs match current constraints.
          </div>
        ) : (
          <div className="relative pl-6 border-l-2 border-border space-y-6">
            {filteredLogs.map(act => (
              <div key={act.id} className="relative group">
                
                {/* Timeline node dot */}
                <span className="absolute left-[-30px] top-1.5 w-3.5 h-3.5 rounded-full bg-white border-2 border-secondary flex items-center justify-center group-hover:scale-125 transition-transform">
                  <span className="w-1 h-1 bg-secondary rounded-full" />
                </span>

                <div className="p-4 bg-slate-50 border border-border rounded-2xl max-w-2xl hover:border-slate-800 transition">
                  <div className="flex flex-wrap justify-between items-center gap-2 mb-2 text-xs">
                    <div className="flex items-center space-x-2 text-slate-700">
                      <User className="w-3.5 h-3.5 text-primary" />
                      <span className="font-bold text-slate-800">{act.userName}</span>
                      <span className="text-[10px] bg-white border border-border text-slate-500 px-2 py-0.5 rounded">
                        {act.userRole}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1.5 text-slate-500 font-mono text-[10px]">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{new Date(act.timestamp).toLocaleString()}</span>
                    </div>
                  </div>

                  <p className="text-sm font-semibold text-slate-100 font-mono tracking-wide">{act.action}</p>
                  
                  <div className="mt-2.5 flex items-center justify-between text-[10px] text-slate-500 font-mono bg-white/40 p-2 rounded-lg border border-border">
                    <span>Target Entity: {act.entity}</span>
                    <span className="text-primary">Code: {act.entityId}</span>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </GlassCard>

    </div>
  );
};
export default ActivityLogs;
