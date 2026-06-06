import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { invoiceApi } from '../../api/invoiceApi';
import GlassCard from '../../components/ui/GlassCard';
import Modal from '../../components/ui/Modal';
import { 
  CreditCard, 
  Eye, 
  Calendar, 
  CheckCircle, 
  Mail, 
  Download, 
  Printer, 
  Building,
  ArrowRight,
  TrendingUp
} from 'lucide-react';

export const InvoiceList = () => {
  const { invoices, updateInvoiceStatus, purchaseOrders, logActivity } = useApp();
  const { user } = useAuth();
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isPdfOpen, setIsPdfOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // The backend API already filters invoices for the vendor role, so we just use the list directly
  const filteredInvoices = invoices;

  const handleInvoiceAction = (id, nextStatus) => {
    updateInvoiceStatus(id, nextStatus, user);
    setSelectedInvoice(prev => prev ? { ...prev, status: nextStatus } : null);
    showToast(`Invoice successfully marked as ${nextStatus}!`);
  };

  const handleSendEmail = async (id) => {
    try {
      showToast(`Sending email to ${selectedInvoice.vendorName || 'Verified Vendor'}...`);
      await invoiceApi.emailInvoice(id);
      logActivity(user.name, user.role, 'Dispatched Invoice Email', `Invoice ${id}`, id);
      showToast(`Invoice PDF successfully emailed to ${selectedInvoice.vendorName || 'Verified Vendor'}!`);
    } catch (err) {
      showToast(`Failed to send email. Check SMTP setup.`);
    }
  };

  const handleDownloadPdf = async (id) => {
    try {
      showToast(`Generating high-quality PDF...`);
      const blob = await invoiceApi.downloadPdf(id);
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `Invoice_${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showToast(`PDF Downloaded Successfully!`);
    } catch (err) {
      showToast(`Failed to generate PDF.`);
    }
  };

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  // Find line items from the invoice directly (backend stores them)
  const getLineItems = () => {
    return selectedInvoice?.items || [];
  };

  return (
    <div className="space-y-6">
      
      {/* Toast Notification Alert */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 p-4 bg-white border border-secondary text-primary rounded-xl font-bold text-xs shadow-2xl flex items-center space-x-2 animate-bounce">
          <CheckCircle className="w-4.5 h-4.5" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 tracking-wide">Invoices & Financial Ledger</h2>
        <p className="text-xs text-slate-500 mt-0.5">Audit supplier billings, reconcile purchase line records, and release payouts</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Table list */}
        <div className={selectedInvoice ? "lg:col-span-6 space-y-4" : "lg:col-span-12 space-y-4"}>
          <GlassCard className="p-0 overflow-hidden" hoverEffect={false}>
            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50">
                    <th className="p-4">Invoice Code</th>
                    <th className="p-4">PO Code</th>
                    <th className="p-4">Vendor Partner</th>
                    <th className="p-4">Total Amount</th>
                    <th className="p-4">Due Date</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-slate-700">
                  {filteredInvoices.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="p-8 text-center text-slate-500">No invoices generated yet.</td>
                    </tr>
                  ) : (
                    filteredInvoices.map(invoice => (
                      <tr 
                        key={invoice.id} 
                        className={`hover:bg-slate-50 transition-colors cursor-pointer ${
                          selectedInvoice?.id === invoice.id ? 'bg-primary/10 border-l-2 border-primary' : ''
                        }`}
                        onClick={() => setSelectedInvoice(invoice)}
                      >
                        <td className="p-4 font-bold text-slate-800">#{invoice.id}</td>
                        <td className="p-4 text-slate-500">#{invoice.purchaseOrderId || invoice.poId}</td>
                        <td className="p-4 text-slate-600">{invoice.vendorName || invoice.billingDetails?.companyName}</td>
                        <td className="p-4 text-primary font-bold">${(invoice.total || invoice.grandTotal || 0).toLocaleString()}</td>
                        <td className="p-4 text-slate-500 font-mono text-[10px]">{invoice.dueDate || invoice.createdAt?.split('T')[0]}</td>
                        <td className="p-4">
                          <span className={`text-[9px] px-2.5 py-0.5 rounded font-black border ${
                            invoice.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                            'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          }`}>
                            {invoice.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedInvoice(invoice);
                            }}
                            className="inline-flex items-center text-[10px] font-bold text-primary hover:underline"
                          >
                            <span>Details</span>
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

        {/* Invoice details */}
        {selectedInvoice && (
          <div className="lg:col-span-6 space-y-6">
            <GlassCard className="p-6" hoverEffect={false}>
              
              {/* Header controls */}
              <div className="flex justify-between items-start border-b border-border pb-4 mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-800">Invoice Details: #{selectedInvoice.invoiceNumber || selectedInvoice.id}</h3>
                  <p className="text-[10px] text-slate-500">Reconciled against: PO-#{selectedInvoice.purchaseOrderId || selectedInvoice.poId}</p>
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => setIsPdfOpen(true)}
                    className="p-2 bg-slate-50 text-slate-500 hover:text-slate-800 rounded-lg transition"
                    title="Invoice Preview Sheet"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDownloadPdf(selectedInvoice.id)}
                    className="p-2 bg-slate-50 text-slate-500 hover:text-slate-800 rounded-lg transition"
                    title="Download Official PDF"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleSendEmail(selectedInvoice.id)}
                    className="p-2 bg-slate-50 text-slate-500 hover:text-slate-800 rounded-lg transition"
                    title="Send invoice via email"
                  >
                    <Mail className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setSelectedInvoice(null)}
                    className="text-slate-500 hover:text-slate-800 text-xs px-2.5 py-1 hover:bg-slate-50 rounded-lg transition"
                  >
                    Close
                  </button>
                </div>
              </div>

              {/* Data list */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase font-black tracking-wider block">Billing Vendor</span>
                    <p className="text-xs font-bold text-slate-800 mt-1 flex items-center">
                      <Building className="w-3.5 h-3.5 text-slate-500 mr-1.5" />
                      {selectedInvoice.vendorName || selectedInvoice.billingDetails?.companyName}
                    </p>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase font-black tracking-wider block">Due Date</span>
                    <p className="text-xs font-bold text-amber-400 mt-1 flex items-center">
                      <Calendar className="w-3.5 h-3.5 text-slate-500 mr-1.5" />
                      {selectedInvoice.dueDate || selectedInvoice.createdAt?.split('T')[0]}
                    </p>
                  </div>
                </div>

                {/* Line Items of matching PO */}
                <div className="border border-border rounded-xl overflow-hidden text-xs">
                  <div className="bg-slate-50 p-3 flex justify-between font-bold text-slate-500 text-[10px]">
                    <span className="flex-1">Billing Item</span>
                    <span className="w-20 text-right">Quantity</span>
                  </div>
                  <div className="divide-y divide-border max-h-36 overflow-y-auto">
                    {getLineItems().map((it, idx) => (
                      <div key={idx} className="p-3 flex justify-between text-slate-700">
                        <span className="flex-1 truncate">{it.name}</span>
                        <span className="w-20 text-right">{it.quantity || it.qty} {it.unit || 'Units'}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-border pt-4 text-xs space-y-1.5">
                  <div className="flex justify-between text-slate-500">
                    <span>Subtotal</span>
                    <span>${(selectedInvoice.subtotal || selectedInvoice.amount || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>VAT / GST (10%)</span>
                    <span>${(selectedInvoice.taxAmount || selectedInvoice.tax || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm font-black pt-2 border-t border-dashed border-border">
                    <span className="text-slate-800">Amount Due</span>
                    <span className="text-primary">${(selectedInvoice.grandTotal || selectedInvoice.total || 0).toLocaleString()}</span>
                  </div>
                </div>

                {/* Mark Paid Button (Admin/Manager only) */}
                {selectedInvoice.status !== 'Paid' && user?.role !== 'Vendor' && (
                  <div className="pt-4 border-t border-border">
                    <button
                      onClick={() => handleInvoiceAction(selectedInvoice.id, 'Paid')}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-slate-800 font-black text-xs rounded-xl transition shadow-lg shadow-emerald-700/15 flex items-center justify-center space-x-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Reconcile & Mark Invoice Paid</span>
                    </button>
                  </div>
                )}

                {selectedInvoice.status === 'Paid' && (
                  <div className="flex items-center space-x-2 text-xs text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 p-3 rounded-xl justify-center font-bold">
                    <CheckCircle className="w-4.5 h-4.5" />
                    <span>Invoice Fully Reconciled & Paid</span>
                  </div>
                )}
              </div>

            </GlassCard>
          </div>
        )}
      </div>

      {/* PROFESSIONAL PREVIEW LETTERHEAD */}
      <Modal isOpen={isPdfOpen} onClose={() => setIsPdfOpen(false)} title="Corporate Invoice Reconcile Sheet" size="lg">
        {selectedInvoice && (
          <div className="bg-white text-slate-900 p-8 rounded-xl font-sans relative overflow-hidden border border-slate-200">
            {/* Watermark design */}
            <div className="absolute right-[-40px] top-[-40px] w-40 h-40 bg-slate-100 rounded-full opacity-35 pointer-events-none" />

            <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6 mb-6">
              <div>
                <span className="text-xs font-black bg-emerald-600 text-slate-800 px-3 py-1 rounded tracking-widest uppercase">
                  Vendor Partner Billing
                </span>
                <h2 className="text-xl font-extrabold text-slate-900 mt-2">COMMERCIAL INVOICE</h2>
                <p className="text-[10px] text-slate-500 font-mono mt-1">INVOICE DATE: {selectedInvoice.createdAt?.split('T')[0]}</p>
                <p className="text-[10px] text-amber-600 font-bold font-mono">DUE DATE: {selectedInvoice.dueDate || selectedInvoice.createdAt?.split('T')[0]}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-black text-slate-900">INV CODE: #{selectedInvoice.invoiceNumber || selectedInvoice.id}</p>
                <p className="text-xs text-slate-500 font-mono">RECONCILED PO: #{selectedInvoice.purchaseOrderId || selectedInvoice.poId}</p>
              </div>
            </div>

            {/* Billing addresses */}
            <div className="grid grid-cols-2 gap-8 mb-8 text-xs text-slate-700">
              <div>
                <p className="font-black text-slate-900 uppercase tracking-wide mb-1.5">Billed From (Supplier)</p>
                <p className="font-bold text-slate-900">{selectedInvoice.vendorName || selectedInvoice.billingDetails?.companyName}</p>
                <p>Tax Registration: {selectedInvoice.billingDetails?.gst || '27AACCA1234F1Z1'}</p>
                <p>{selectedInvoice.billingDetails?.address || 'Corporate Supplier Node'}</p>
              </div>
              <div className="text-right sm:text-left">
                <p className="font-black text-slate-900 uppercase tracking-wide mb-1.5">Billed To (Client)</p>
                <p className="font-bold text-slate-900">VendorBridge Corporate HQ</p>
                <p>100 Enterprise Way, Suite A</p>
                <p>Chicago, IL, 60601</p>
              </div>
            </div>

            {/* Line items table */}
            <table className="w-full text-left border-collapse text-xs mb-8">
              <thead>
                <tr className="border-b-2 border-slate-300 text-slate-800 font-bold bg-slate-50">
                  <th className="p-2">Line Specification</th>
                  <th className="p-2 text-right">Quantity</th>
                  <th className="p-2 text-right">Unit Net Cost</th>
                  <th className="p-2 text-right">Total Net</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {getLineItems().map((it, idx) => (
                  <tr key={idx}>
                    <td className="p-2 font-medium text-slate-900">{it.name}</td>
                    <td className="p-2 text-right text-slate-700">{it.quantity || it.qty} {it.unit || 'Units'}</td>
                    <td className="p-2 text-right text-slate-600">${(it.unitPrice || it.price || 0).toLocaleString()}</td>
                    <td className="p-2 text-right font-bold text-slate-900">${(it.totalPrice || (it.quantity || it.qty) * (it.unitPrice || it.price)).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Calculation Totals */}
            <div className="flex justify-end mb-8 text-xs">
              <div className="w-64 space-y-2 border-t-2 border-slate-200 pt-4 text-slate-700">
                <div className="flex justify-between">
                  <span>Subtotal Amount:</span>
                  <span>${(selectedInvoice.subtotal || selectedInvoice.amount || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST/VAT Tax (10%):</span>
                  <span>${(selectedInvoice.taxAmount || selectedInvoice.tax || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-300">
                  <span>Grand Net Amount Due:</span>
                  <span>${(selectedInvoice.grandTotal || selectedInvoice.total || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Signatures / watermark footer */}
            <div className="flex justify-between items-end border-t border-slate-200 pt-6 mt-6 text-[10px] text-slate-500 font-mono">
              <div>
                <p>Payment Status: <span className="font-bold text-slate-900 uppercase">{selectedInvoice.status}</span></p>
                <p>Invoice ledger verified under node certificate: inv_sign_{selectedInvoice.id}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-slate-900">Reconciled Corporate Ledger</p>
                <p>VendorBridge Accounts Payable Division</p>
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
export default InvoiceList;
