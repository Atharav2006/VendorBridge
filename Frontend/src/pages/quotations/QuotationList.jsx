import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import GlassCard from '../../components/ui/GlassCard';
import { FileSpreadsheet, Eye, ArrowRight, Sparkles, PlusCircle } from 'lucide-react';

export const QuotationList = () => {
  const { quotations, rfqs, addQuotation } = useApp();
  const { user } = useAuth();
  const [rfqFilter, setRfqFilter] = useState('All');

  // Filter quotes by user role constraints
  const filteredQuotes = quotations.filter(q => {
    const matchRfq = rfqFilter === 'All' || q.rfqId === rfqFilter;
    return matchRfq;
  });

  // Action for mock adding a quotation if the user is a Vendor
  // Lets them quickly simulate bidding on an open RFQ! Highly interactive!
  const handleVendorSubmitMockQuote = (rfq) => {
    const pricePerUnit = Math.floor(Math.random() * 150) + 100;
    const items = rfq.items.map(it => {
      const quantity = it.quantity || it.qty || 1;
      return {
        name: it.name,
        quantity: quantity,
        unit: it.unit,
        unitPrice: pricePerUnit,
        totalPrice: quantity * pricePerUnit
      };
    });
    const subtotal = items.reduce((sum, i) => sum + i.totalPrice, 0);
    const taxAmount = Math.round(subtotal * 0.1);

    addQuotation({
      rfqId: rfq._id || rfq.id,
      rfqTitle: rfq.title,
      items,
      subtotal,
      taxPercent: 10,
      taxAmount,
      deliveryDays: Math.floor(Math.random() * 10) + 5,
      grandTotal: subtotal + taxAmount
    }, user);
  };

  // Find open RFQs which vendor hasn't bidded on yet
  const unbiddedRfqs = rfqs.filter(r => 
    r.status === 'Open' && 
    !quotations.some(q => q.rfqId === (r._id || r.id))
  );

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 tracking-wide">Vendor Quotation Bids</h2>
        <p className="text-xs text-slate-500 mt-0.5">Track and evaluate price bids submitted against published RFQs</p>
      </div>

      {/* Filter Box */}
      <GlassCard className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4" hoverEffect={false}>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-500 font-semibold">Filter by RFQ Campaign:</span>
          <select
            value={rfqFilter}
            onChange={(e) => setRfqFilter(e.target.value)}
            className="px-3 py-2 rounded-xl glass-input text-slate-800 text-xs bg-white cursor-pointer"
          >
            <option value="All">All Campaigns</option>
            {rfqs.map(r => (
              <option key={r.id} value={r.id}>{r.title}</option>
            ))}
          </select>
        </div>

        {user?.role === 'Vendor' && unbiddedRfqs.length > 0 && (
          <span className="text-xs text-primary font-bold flex items-center">
            <Sparkles className="w-3.5 h-3.5 mr-1" />
            {unbiddedRfqs.length} Open RFQs ready for bidding
          </span>
        )}
      </GlassCard>

      {/* Mock Submit Widget for Vendor */}
      {user?.role === 'Vendor' && unbiddedRfqs.length > 0 && (
        <GlassCard className="p-5 border-secondary/20 bg-secondary/5" hoverEffect={false}>
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">Quick Submit Bid (Interactive Sandbox)</h3>
          <div className="space-y-3">
            {unbiddedRfqs.map(rfq => (
              <div key={rfq.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-slate-50 border border-border rounded-xl gap-3 text-xs">
                <div>
                  <p className="font-bold text-slate-800">{rfq.title}</p>
                  <p className="text-[10px] text-slate-500">Items: {rfq.items.map(it => `${it.qty} ${it.unit} of ${it.name}`).join(', ')}</p>
                </div>
                <button
                  onClick={() => handleVendorSubmitMockQuote(rfq)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-primary to-secondary text-slate-800 rounded-lg font-bold text-[10px] hover:opacity-90 transition"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Submit Bid Proposal</span>
                </button>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Quotes Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredQuotes.length === 0 ? (
          <div className="col-span-2 text-center py-12 text-slate-500 text-sm bg-white border border-border shadow-sm rounded-2xl border border-border rounded-2xl">
            <FileSpreadsheet className="w-12 h-12 text-slate-500 mx-auto mb-3 opacity-60" />
            No quotation submissions found.
          </div>
        ) : (
          filteredQuotes.map(quote => {
            const relatedRfq = rfqs.find(r => r.id === quote.rfqId);
            const canCompare = rfqs.find(r => r.id === quote.rfqId)?.status !== 'Closed';
            
            return (
              <GlassCard 
                key={quote.id} 
                className="flex flex-col justify-between h-full hover:border-slate-700/60 p-6" 
                glowOnHover
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className={`text-[10px] px-2 py-0.5 rounded font-black border ${
                      quote.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                      quote.status === 'Pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}>
                      {quote.status}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">ID: #{quote.id}</span>
                  </div>

                  <p className="text-[10px] text-slate-500 uppercase font-semibold">RFQ Campaign</p>
                  <h4 className="text-sm font-bold text-slate-800 truncate mb-1">{relatedRfq?.title || quote.rfqTitle || "Unknown RFQ"}</h4>
                  
                  <p className="text-[10px] text-slate-500 uppercase font-semibold mt-3">Bidder Identity</p>
                  <p className="text-sm font-bold text-slate-700">{quote.vendorName || "Verified Vendor"}</p>

                  <div className="mt-4 pt-3 border-t border-border grid grid-cols-2 gap-4 text-xs text-slate-500">
                    <div>
                      <span className="block text-[10px]">Grand Total</span>
                      <span className="text-sm font-black text-primary">${quote.grandTotal.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="block text-[10px]">Delivery Delay</span>
                      <span className="text-sm font-black text-slate-800">{quote.deliveryDays} Days</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
                  <Link
                    to={`/quotations/${quote.id}`}
                    className="flex items-center space-x-1.5 text-xs text-slate-500 hover:text-slate-800 transition"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View Detail Sheet</span>
                  </Link>

                  {user?.role !== 'Vendor' && canCompare && (
                    <Link
                      to={`/quotations/compare/${quote.rfqId}`}
                      className="flex items-center space-x-1.5 text-xs font-bold text-primary hover:underline"
                    >
                      <span>Compare Dashboard</span>
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
export default QuotationList;
