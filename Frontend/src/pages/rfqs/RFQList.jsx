import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import GlassCard from '../../components/ui/GlassCard';
import { FileText, Plus, Eye, ArrowRight, ClipboardList, Calendar, Package, Users } from 'lucide-react';

export const RFQList = () => {
  const { rfqs, quotations, vendors } = useApp();
  const { user } = useAuth();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredRfqs = rfqs.filter(r => {
    const matchSearch = r.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        r.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'All' || r.status === statusFilter;
    
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-wide">Request for Quotations (RFQs)</h2>
          <p className="text-xs text-slate-500 mt-0.5">Invite vendor bids, detail line specifications, and track submissions</p>
        </div>
        {user?.role !== 'Vendor' && (
          <Link
            to="/rfqs/create"
            className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-primary to-secondary hover:opacity-90 rounded-xl text-xs font-bold text-slate-800 shadow-md shadow-secondary/15 transition animate-pulse-slow"
          >
            <Plus className="w-4 h-4" />
            <span>Create RFQ Wizard</span>
          </Link>
        )}
      </div>

      {/* Search Filter Box */}
      <GlassCard className="p-4 flex flex-col sm:flex-row sm:items-center gap-4" hoverEffect={false}>
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search RFQ title or description fields..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-4 pr-4 py-2.5 rounded-xl glass-input text-slate-800 text-xs"
          />
        </div>
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl glass-input text-slate-800 text-xs bg-white cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Open">Open</option>
            <option value="Closed">Closed</option>
            <option value="Compared">Compared</option>
          </select>
        </div>
      </GlassCard>

      {/* RFQ Grid list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredRfqs.length === 0 ? (
          <div className="col-span-2 text-center py-12 text-slate-500 text-sm bg-white border border-border shadow-sm rounded-2xl border border-border rounded-2xl">
            <FileText className="w-12 h-12 text-slate-500 mx-auto mb-3 opacity-60" />
            No active RFQ sheets found matching requirements.
          </div>
        ) : (
          filteredRfqs.map(rfq => {
            const bidCount = quotations.filter(q => q.rfqId === (rfq._id || rfq.id)).length;
            return (
              <GlassCard 
                key={rfq._id || rfq.id} 
                className="flex flex-col justify-between h-full hover:border-primary/30 p-6" 
                glowOnHover
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className={`text-[10px] px-2.5 py-0.5 rounded font-black border uppercase tracking-wider ${
                      rfq.status === 'Open' ? 'bg-primary/10 text-primary border-primary/20' : 
                      rfq.status === 'Closed' ? 'bg-slate-100 text-slate-500 border-slate-200' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                    }`}>
                      {rfq.status}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">ID: #{rfq._id || rfq.id}</span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-800 mb-2 leading-tight">{rfq.title}</h3>
                  <p className="text-xs text-slate-500 mb-4 line-clamp-2">{rfq.description}</p>
                  
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center text-[10px] text-slate-600">
                      <Package className="w-3.5 h-3.5 mr-2 opacity-70" />
                      <span className="font-semibold">{rfq.items?.length || 0}</span>&nbsp;Items Requested
                    </div>
                    <div className="flex items-center text-[10px] text-slate-600">
                      <Users className="w-3.5 h-3.5 mr-2 opacity-70" />
                      <span className="font-semibold">{rfq.assignedVendorIds?.length || 0}</span>&nbsp;Vendors Invited
                    </div>
                    <div className="flex items-center text-[10px] text-slate-600">
                      <FileText className="w-3.5 h-3.5 mr-2 opacity-70" />
                      <span className="font-semibold text-primary">{bidCount}</span>&nbsp;Bids Received
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-border mt-auto">
                  <div className="text-[10px] text-slate-500">
                    <span className="block mb-0.5">Deadline:</span>
                    <span className="font-bold text-slate-700">{new Date(rfq.deadline).toLocaleDateString()}</span>
                  </div>
                  
                  {user?.role === 'Vendor' ? (
                    (() => {
                      const myVendor = vendors.find(v => v.linkedUserId === user?.id || v.linkedUserId === user?._id);
                      const hasSubmitted = quotations.some(q => q.rfqId === (rfq._id || rfq.id) && q.vendorId === myVendor?.id);
                      return (
                        <Link
                          to={hasSubmitted ? `/quotations` : `/quotations`}
                          className="flex items-center space-x-1.5 text-xs font-bold text-primary hover:underline"
                        >
                          <span>{hasSubmitted ? 'View Submissions' : 'Submit Quotation'}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      );
                    })()
                  ) : (
                    <Link
                      to={bidCount > 0 ? `/quotations/compare/${rfq._id || rfq.id}` : '#'}
                      className={`flex items-center space-x-1.5 text-xs font-bold transition ${
                        bidCount > 0 ? 'text-primary hover:underline' : 'text-slate-600 cursor-not-allowed'
                      }`}
                      title={bidCount === 0 ? "Requires at least 1 quotation to compare" : ""}
                    >
                      <span>Compare Quotations</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              </GlassCard>
            );
          })
        )}
      </div>

    </div>
  );
};
export default RFQList;
