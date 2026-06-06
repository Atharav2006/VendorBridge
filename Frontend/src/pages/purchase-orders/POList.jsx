import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import GlassCard from '../../components/ui/GlassCard';
import Modal from '../../components/ui/Modal';
import { 
  ShoppingBag, 
  Eye, 
  Calendar, 
  Clock, 
  CheckCircle, 
  Printer, 
  Building,
  DollarSign,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';

export const POList = () => {
  const { purchaseOrders, updatePOStatus, logActivity } = useApp();
  const { user } = useAuth();
  const [selectedPO, setSelectedPO] = useState(null);
  const [isPdfOpen, setIsPdfOpen] = useState(false);

  // The backend API already filters POs for the vendor role, so we just use the list directly
  const filteredPOs = purchaseOrders;

  const handlePOAction = (id, nextStatus) => {
    updatePOStatus(id, nextStatus, user);
    // Refresh selected PO state
    setSelectedPO(prev => prev ? { ...prev, status: nextStatus } : null);
  };

  // Status timeline nodes
  const statuses = ['Draft', 'Sent', 'Accepted', 'Completed'];

  const getStatusIndex = (status) => statuses.indexOf(status);

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 tracking-wide">Purchase Orders (POs)</h2>
        <p className="text-xs text-slate-500 mt-0.5">Issue purchase authorizations, monitor deliverables acceptances, and verify ledgers</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* PO Table grid */}
        <div className={selectedPO ? "lg:col-span-6 space-y-4" : "lg:col-span-12 space-y-4"}>
          <GlassCard className="p-0 overflow-hidden" hoverEffect={false}>
            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50">
                    <th className="p-4">PO Code</th>
                    <th className="p-4">Vendor Partner</th>
                    <th className="p-4">Grand Total</th>
                    <th className="p-4">Issued On</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredPOs.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-slate-500">No Purchase Orders logged.</td>
                    </tr>
                  ) : (
                    filteredPOs.map(po => (
                      <tr 
                        key={po.id} 
                        className={`hover:bg-slate-50 transition-colors cursor-pointer ${
                          selectedPO?.id === po.id ? 'bg-primary/10 border-l-2 border-primary' : ''
                        }`}
                        onClick={() => setSelectedPO(po)}
                      >
                        <td className="p-4 font-bold text-slate-800">#{po.poNumber || po.id}</td>
                        <td className="p-4 text-slate-600">{(po.vendorName || po.vendorId?.name || "Verified Vendor") || po.vendorId?.name || 'Verified Vendor'}</td>
                        <td className="p-4 text-primary font-bold">${(po.grandTotal || po.total || 0).toLocaleString()}</td>
                        <td className="p-4 text-slate-500 font-mono text-[10px]">{po.createdAt?.split('T')[0]}</td>
                        <td className="p-4">
                          <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase border ${
                            po.status === 'Completed' || po.status === 'delivered' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                            po.status === 'Accepted' || po.status === 'issued' ? 'bg-teal-500/10 text-teal-400 border-teal-500/20' : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                          }`}>
                            {po.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedPO(po);
                            }}
                            className="inline-flex items-center text-[10px] font-bold text-primary hover:underline"
                          >
                            <span>Inspect</span>
                            <ArrowRight className="w-3 h-3 ml-1" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>

        {/* PO details & Timeline panel */}
        {selectedPO && (
          <div className="lg:col-span-6 space-y-6">
            <GlassCard className="p-6" hoverEffect={false}>
              
              {/* Header */}
              <div className="flex justify-between items-start border-b border-border pb-4 mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-800">PO Details: #{selectedPO.poNumber || selectedPO.id}</h3>
                  <p className="text-[10px] text-slate-500">Issued against bid quotation: #{selectedPO.quotationId}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setIsPdfOpen(true)}
                    className="p-2 bg-slate-50 text-slate-500 hover:text-slate-800 rounded-lg transition"
                    title="Print / View Invoice letterhead"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setSelectedPO(null)}
                    className="text-slate-500 hover:text-slate-800 text-xs px-2.5 py-1 hover:bg-slate-50 rounded-lg transition"
                  >
                    Close
                  </button>
                </div>
              </div>

              {/* Status Milestone Timeline */}
              <div className="p-4 bg-slate-50 border border-border rounded-2xl mb-6">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-4">PO Fulfillment Timeline</p>
                <div className="flex items-center justify-between text-center relative">
                  <div className="absolute top-3.5 left-6 right-6 h-0.5 bg-slate-50 z-0" />
                  <div 
                    className="absolute top-3.5 left-6 right-6 h-0.5 bg-secondary z-0 transition-all duration-300"
                    style={{
                      width: `${(getStatusIndex(selectedPO.status) / (statuses.length - 1)) * 90}%`
                    }}
                  />
                  {statuses.map((step, idx) => {
                    const isActive = getStatusIndex(selectedPO.status) >= idx;
                    return (
                      <div key={step} className="relative z-10 flex flex-col items-center">
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[10px] border transition ${
                          isActive 
                            ? 'bg-secondary border-secondary text-slate-950 shadow-md shadow-secondary/25' 
                            : 'bg-white border-border text-slate-500'
                        }`}>
                          {idx + 1}
                        </span>
                        <span className="text-[9px] font-bold text-slate-500 mt-2">{step}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Summary Items list */}
              <div className="space-y-4">
                <div>
                  <span className="text-[9px] text-slate-500 uppercase font-black tracking-wider block">Vendor Details</span>
                  <div className="flex items-center space-x-2 text-xs font-semibold text-slate-800 mt-1">
                    <Building className="w-4 h-4 text-slate-500" />
                    <span>{selectedPO.vendorName || selectedPO.vendorId?.name || 'Verified Vendor'}</span>
                  </div>
                </div>

                <div className="border border-border rounded-xl overflow-hidden text-xs">
                  <div className="bg-slate-50 p-3 flex justify-between font-bold text-slate-500 text-[10px]">
                    <span className="flex-1">Line Item</span>
                    <span className="w-12 text-right">Qty</span>
                    <span className="w-20 text-right">Total</span>
                  </div>
                  <div className="divide-y divide-border max-h-40 overflow-y-auto">
                    {selectedPO.items.map((it, idx) => (
                      <div key={idx} className="p-3 flex justify-between text-slate-700">
                        <span className="flex-1 truncate">{it.name}</span>
                        <span className="w-12 text-right">{it.quantity || it.qty}</span>
                        <span className="w-20 text-right font-bold">${(it.totalPrice || it.total || 0).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs pt-2">
                  <span className="text-slate-500">Estimated Delivery Date</span>
                  <span className="text-amber-400 font-bold font-mono">{selectedPO.deliveryDate || selectedPO.createdAt?.split('T')[0]}</span>
                </div>

                {/* Subtotals */}
                <div className="border-t border-border pt-4 text-xs space-y-1.5">
                  <div className="flex justify-between text-slate-500">
                    <span>Subtotal</span>
                    <span>${(selectedPO.subtotal || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Estimated Tax</span>
                    <span>${(selectedPO.taxAmount || selectedPO.tax || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm font-black pt-2 border-t border-dashed border-border">
                    <span className="text-slate-800">PO Value</span>
                    <span className="text-primary">${(selectedPO.grandTotal || selectedPO.total || 0).toLocaleString()}</span>
                  </div>
                </div>

                {/* Quick actions for state moves */}
                <div className="pt-4 border-t border-border">
                  {(selectedPO.status?.toLowerCase() === 'sent' || selectedPO.status?.toLowerCase() === 'pending') && user?.role?.toLowerCase() === 'vendor' && (
                    <button
                      onClick={() => handlePOAction(selectedPO.id, 'Accepted')}
                      className="w-full py-3 bg-secondary hover:bg-secondary-hover text-slate-950 font-black text-xs rounded-xl transition shadow-lg shadow-secondary/15 flex items-center justify-center space-x-2"
                    >
                      <CheckCircle className="w-4 h-4 text-slate-950" />
                      <span>Accept Purchase Order (Generate Invoice)</span>
                    </button>
                  )}

                  {selectedPO.status?.toLowerCase() === 'accepted' && user?.role?.toLowerCase() !== 'vendor' && (
                    <button
                      onClick={() => handlePOAction(selectedPO.id, 'Completed')}
                      className="w-full py-3 bg-primary hover:bg-primary-hover text-slate-800 font-black text-xs rounded-xl transition shadow-lg shadow-primary/15 flex items-center justify-center space-x-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Mark Delivery Completed</span>
                    </button>
                  )}

                  {selectedPO.status?.toLowerCase() === 'completed' && (
                    <div className="flex items-center space-x-2 text-xs text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 p-3 rounded-xl justify-center">
                      <CheckCircle className="w-4.5 h-4.5" />
                      <span className="font-bold">Purchase Order Fulfilled & Closed</span>
                    </div>
                  )}
                </div>
              </div>

            </GlassCard>
          </div>
        )}
      </div>

      {/* PDF LETTERHEAD PREVIEW MODAL */}
      <Modal isOpen={isPdfOpen} onClose={() => setIsPdfOpen(false)} title="Purchase Order Document Preview" size="lg">
        {selectedPO && (
          <div className="bg-white text-slate-900 p-8 rounded-xl font-sans relative overflow-hidden border border-slate-200">
            {/* PDF Watermark / Design */}
            <div className="absolute right-[-30px] top-[-30px] w-40 h-40 bg-slate-100 rounded-full opacity-30 pointer-events-none" />

            {/* Letterhead Header */}
            <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6 mb-6">
              <div>
                <span className="text-xs font-black bg-white text-slate-900 border border-slate-900 px-3 py-1 rounded tracking-widest uppercase">
                  VendorBridge Procurement
                </span>
                <h2 className="text-xl font-extrabold text-slate-900 mt-2">OFFICIAL PURCHASE ORDER</h2>
                <p className="text-[10px] text-slate-500 font-mono mt-1">ISSUED DATE: {selectedPO.createdAt?.split('T')[0]}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-black text-slate-900">PO CODE: #{selectedPO.poNumber || selectedPO.id}</p>
                <p className="text-xs text-slate-500 font-mono">STATUS: {selectedPO.status}</p>
              </div>
            </div>

            {/* Vendor and Ship-To info */}
            <div className="grid grid-cols-2 gap-8 mb-8 text-xs text-slate-700">
              <div>
                <p className="font-black text-slate-900 uppercase tracking-wide mb-1.5">Supplier / Vendor Partner</p>
                <p className="font-bold text-slate-900">{selectedPO.vendorName || selectedPO.vendorId?.name || 'Verified Vendor'}</p>
                <p>Tax Registration: 'Verified Partner'</p>
                <p>Corporate Vendor Network</p>
              </div>
              <div className="text-right sm:text-left">
                <p className="font-black text-slate-900 uppercase tracking-wide mb-1.5">Ship To / Billing Entity</p>
                <p className="font-bold text-slate-900">VendorBridge Corporate HQ</p>
                <p>100 Enterprise Way, Suite A</p>
                <p>Chicago, IL, 60601</p>
              </div>
            </div>

            {/* Line Items Table */}
            <table className="w-full text-left border-collapse text-xs mb-8">
              <thead>
                <tr className="border-b-2 border-slate-300 text-slate-800 font-bold bg-slate-50">
                  <th className="p-2">Line Specification</th>
                  <th className="p-2 text-right">Quantity</th>
                  <th className="p-2 text-right">Unit Price</th>
                  <th className="p-2 text-right">Total Net</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {selectedPO.items.map((it, idx) => (
                  <tr key={idx}>
                    <td className="p-2 font-medium text-slate-900">{it.name}</td>
                    <td className="p-2 text-right text-slate-700">{it.quantity || it.qty} {it.unit || 'Units'}</td>
                    <td className="p-2 text-right text-slate-600">${(it.unitPrice || it.price || 0).toLocaleString()}</td>
                    <td className="p-2 text-right font-bold text-slate-900">${(it.totalPrice || it.total || 0).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Calculation Totals */}
            <div className="flex justify-end mb-8 text-xs">
              <div className="w-64 space-y-2 border-t-2 border-slate-200 pt-4 text-slate-700">
                <div className="flex justify-between">
                  <span>Items Subtotal:</span>
                  <span>${(selectedPO.subtotal || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Applicable GST/VAT (10%):</span>
                  <span>${(selectedPO.taxAmount || selectedPO.tax || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-300">
                  <span>Grand Net Value:</span>
                  <span>${(selectedPO.grandTotal || selectedPO.total || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Official seal/signatures */}
            <div className="flex justify-between items-end border-t border-slate-200 pt-6 mt-6 text-[10px] text-slate-500 font-mono">
              <div>
                <p>Approved via Blockchain Smart Release Ledger</p>
                <p>Verification Certificate: vb_sign_{selectedPO.id}_{selectedPO.quotationId}</p>
              </div>
              <div className="text-right">
                <div className="w-32 h-0.5 bg-slate-400 mb-2 mx-auto sm:ml-auto" />
                <p>Authorized Signature</p>
                <p>VendorBridge Finance Audit Board</p>
              </div>
            </div>

          </div>
        )}
        <div className="flex justify-end mt-4">
          <button
            onClick={() => setIsPdfOpen(false)}
            className="px-5 py-2.5 bg-slate-50 border border-border hover:bg-slate-100 text-slate-600 hover:text-slate-800 text-xs font-bold rounded-xl transition"
          >
            Close Document Preview
          </button>
        </div>
      </Modal>

    </div>
  );
};
export default POList;
