import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import GlassCard from '../../components/ui/GlassCard';
import { ArrowLeft, Sparkles, Building, Calendar, ClipboardCheck, DollarSign } from 'lucide-react';

export const QuotationDetail = () => {
  const { id } = useParams();
  const { quotations, updateApprovalStatus, requestApproval, approvals, logActivity } = useApp();
  const { user } = useAuth();
  const navigate = useNavigate();

  const quote = quotations.find(q => q.id === id);

  if (!quote) {
    return (
      <div className="text-center py-12 space-y-4">
        <h3 className="text-xl font-bold text-slate-800">Quotation not found</h3>
        <Link to="/quotations" className="text-xs text-primary hover:underline flex items-center justify-center">
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Quotations
        </Link>
      </div>
    );
  }

  // Find associated approval ID if manager wants to approve from this page
  const approvalItem = approvals.find(a => a.entityId === quote.id && a.status === 'Pending');

  const handleAction = (status) => {
    if (approvalItem) {
      updateApprovalStatus(
        approvalItem.id, 
        status, 
        `${status} directly from Quotation Detail Page by ${user.name}`, 
        user
      );
      navigate('/dashboard');
    }
  };

  const subtotal = quote.items.reduce((sum, item) => sum + (item.total || (item.qty * item.pricePerUnit)), 0);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Back button */}
      <div>
        <Link to="/quotations" className="inline-flex items-center space-x-1 text-xs text-slate-500 hover:text-slate-800 transition">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Quotations</span>
        </Link>
      </div>

      {/* Header Info Card */}
      <GlassCard className="p-6" hoverEffect={false}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div className="space-y-1">
            <span className={`text-[10px] px-2.5 py-0.5 rounded font-black border ${
              quote.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
              quote.status === 'Pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
            }`}>
              {quote.status}
            </span>
            <h2 className="text-lg font-bold text-slate-800 tracking-wide mt-2">{quote.rfqTitle}</h2>
            <p className="text-xs text-slate-500">Quotation ID: #{quote.id} // Submitted on: {quote.submittedAt}</p>
          </div>
          <div className="flex items-center space-x-3 bg-slate-50 border border-border p-3.5 rounded-xl">
            <Building className="w-5 h-5 text-primary" />
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-semibold">Vendor Partner</p>
              <p className="text-sm font-bold text-slate-800">{quote.vendorName}</p>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Quotation breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Table items */}
        <div className="lg:col-span-2 space-y-6">
          <GlassCard className="p-6" hoverEffect={false}>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-border pb-2.5">
              Line Items Pricing Details
            </h3>
            
            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="pb-3">Item Specification</th>
                    <th className="pb-3 text-right">Quantity</th>
                    <th className="pb-3 text-right">Unit Price</th>
                    <th className="pb-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {quote.items.map((it, idx) => {
                    const qty = it.quantity || it.qty || 0;
                    const price = it.unitPrice || it.pricePerUnit || 0;
                    const total = it.totalPrice || it.total || (qty * price);
                    
                    return (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 font-semibold text-slate-800">{it.name}</td>
                        <td className="py-3.5 text-right text-slate-600">{qty} {it.unit || ''}</td>
                        <td className="py-3.5 text-right text-slate-500">${price.toLocaleString()}</td>
                        <td className="py-3.5 text-right text-primary font-bold">
                          ${total.toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>

        {/* Totals panel */}
        <div className="space-y-6">
          <GlassCard className="p-6" hoverEffect={false}>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-5 border-b border-border pb-2.5">
              Cost Calculation Summary
            </h3>
            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Items Subtotal</span>
                <span className="font-semibold text-slate-700">${(quote.subtotal || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Value Added Tax (GST {(quote.taxPercent || 10)}%)</span>
                <span className="font-semibold text-slate-700">${(quote.taxAmount || quote.tax || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Shipment Lead Time</span>
                <span className="font-bold text-slate-800">{quote.deliveryDays || 0} Days</span>
              </div>
              <div className="pt-3.5 border-t border-border flex justify-between text-sm font-black">
                <span className="text-slate-800">Grand Net Total</span>
                <span className="text-primary text-base">${(quote.grandTotal || 0).toLocaleString()}</span>
              </div>
            </div>

            {/* Procurement Officer Actions */}
            {user?.role === 'Procurement Officer' && !approvalItem && quote.status === 'Pending' && (
              <div className="mt-6 pt-6 border-t border-border space-y-2.5">
                <p className="text-[10px] text-primary font-bold uppercase tracking-wider">Procurement Actions</p>
                <button
                  onClick={async () => {
                    await requestApproval(quote.rfqId, quote.id);
                    navigate('/dashboard');
                  }}
                  className="w-full py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-bold text-[10px] transition"
                >
                  Select Bid & Request Manager Approval
                </button>
              </div>
            )}

            {/* Manager approval override box */}
            {user?.role === 'Manager' && approvalItem && (
              <div className="mt-6 pt-6 border-t border-border space-y-2.5">
                <p className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">Manager Quick Actions</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleAction('Approved')}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-slate-800 rounded-lg font-bold text-[10px] transition"
                  >
                    Approve Bid
                  </button>
                  <button
                    onClick={() => handleAction('Rejected')}
                    className="w-full py-2 bg-red-950/40 hover:bg-red-900/40 text-red-400 border border-red-900/30 rounded-lg font-bold text-[10px] transition"
                  >
                    Reject Bid
                  </button>
                </div>
              </div>
            )}
          </GlassCard>
        </div>

      </div>

    </div>
  );
};
export default QuotationDetail;
