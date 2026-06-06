import React, { useState, useEffect } from 'react';
import poService from '../services/poService';
import { useAuth } from '../context/AuthContext';
import {
  FileText,
  Download,
  Mail,
  Printer,
  CreditCard,
  Building,
  Calendar,
  DollarSign,
} from 'lucide-react';
import Card from '../components/common/Card';
import Table from '../components/common/Table';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorState from '../components/common/ErrorState';
import EmptyState from '../components/common/EmptyState';

export const PurchaseOrderInvoicePage = () => {
  const { user } = useAuth();

  // Explicitly declared variables required by USER
  const [purchaseOrder, setPurchaseOrder] = useState([]); // List of POs
  const [selectedPO, setSelectedPO] = useState(null); // Selected PO
  const [invoiceDetails, setInvoiceDetails] = useState(null); // invoice number, dates
  const [invoiceItems, setInvoiceItems] = useState([]); // Table rows
  const [vendorDetails, setVendorDetails] = useState(null); // Vendor object
  const [billingDetails, setBillingDetails] = useState(null); // Billing address/taxId
  const [taxSummary, setTaxSummary] = useState(null); // subtotal, taxAmount, grandTotal
  const [invoiceStatus, setInvoiceStatus] = useState(''); // status string
  const [paymentStatus, setPaymentStatus] = useState(''); // payment status string
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [emailStatus, setEmailStatus] = useState(''); // feedback message

  // Fetch all Invoices/POs on mount
  useEffect(() => {
    fetchPurchaseOrders();
  }, []);

  // Update states when selected PO changes
  useEffect(() => {
    if (selectedPO) {
      setInvoiceDetails(selectedPO.invoiceDetails || null);
      setInvoiceItems(selectedPO.invoiceItems || []);
      setVendorDetails(selectedPO.vendorDetails || null);
      setBillingDetails(selectedPO.billingDetails || null);
      setTaxSummary(selectedPO.taxSummary || null);
      setInvoiceStatus(selectedPO.invoiceStatus || '');
      setPaymentStatus(selectedPO.paymentStatus || '');
      setEmailStatus('');
    } else {
      setInvoiceDetails(null);
      setInvoiceItems([]);
      setVendorDetails(null);
      setBillingDetails(null);
      setTaxSummary(null);
      setInvoiceStatus('');
      setPaymentStatus('');
      setEmailStatus('');
    }
  }, [selectedPO]);

  const fetchPurchaseOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      // API INTEGRATION POINT: GET_INVOICE_API
      const res = await poService.getPurchaseOrders();
      if (res.success) {
        setPurchaseOrder(res.data);
        if (res.data.length > 0) {
          setSelectedPO(res.data[0]);
        }
      } else {
        throw new Error(res.message || 'Failed to fetch invoices');
      }
    } catch (err) {
      console.error('Fetch PO Error:', err.message);
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsPaid = async () => {
    if (!selectedPO) return;
    setLoading(true);
    setError(null);
    try {
      // API INTEGRATION POINT: MARK_AS_PAID_API
      const res = await poService.markAsPaid(selectedPO._id);
      if (res.success) {
        // Refresh PO lists
        const updatedListRes = await poService.getPurchaseOrders();
        if (updatedListRes.success) {
          setPurchaseOrder(updatedListRes.data);
          const newSelected = updatedListRes.data.find(item => item._id === selectedPO._id);
          setSelectedPO(newSelected || updatedListRes.data[0] || null);
        }
      } else {
        throw new Error(res.message || 'Payment update failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!selectedPO) return;
    setEmailStatus('Downloading PDF...');
    try {
      // API INTEGRATION POINT: DOWNLOAD_INVOICE_API
      const res = await poService.downloadInvoice(selectedPO._id);
      if (res.success) {
        setEmailStatus(`File "${res.fileName}" prepared for download.`);
        // In local web preview, we can trigger raw browser mock download link
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(res.data, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", res.fileName.replace('.pdf', '.json'));
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
      } else {
        throw new Error(res.message || 'PDF Download failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const handleEmailInvoice = async () => {
    if (!selectedPO) return;
    setEmailStatus('Sending email to vendor...');
    try {
      // API INTEGRATION POINT: EMAIL_INVOICE_API
      const res = await poService.emailInvoice(selectedPO._id);
      if (res.success) {
        setEmailStatus(res.message);
      } else {
        throw new Error(res.message || 'Email dispatch failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getInvoiceStatusBadge = (status) => {
    switch (status) {
      case 'Paid':
        return <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold rounded">Paid</span>;
      case 'Overdue':
        return <span className="px-2 py-0.5 bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-bold rounded">Overdue</span>;
      case 'Sent':
        return <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-bold rounded">Sent</span>;
      default:
        return <span className="px-2 py-0.5 bg-neutral-500/10 text-neutral-400 border border-neutral-500/20 text-xs font-bold rounded">Draft</span>;
    }
  };

  const getPaymentStatusBadge = (status) => {
    switch (status) {
      case 'Paid':
        return <span className="px-2.5 py-1 bg-emerald-500/15 text-emerald-400 rounded-lg text-xs font-semibold uppercase tracking-wider">Paid</span>;
      case 'Partially Paid':
        return <span className="px-2.5 py-1 bg-indigo-500/15 text-indigo-400 rounded-lg text-xs font-semibold uppercase tracking-wider">Partially Paid</span>;
      default:
        return <span className="px-2.5 py-1 bg-amber-500/15 text-amber-400 rounded-lg text-xs font-semibold uppercase tracking-wider animate-pulse-slow">Unpaid</span>;
    }
  };

  const itemColumns = [
    { key: 'description', label: 'Description' },
    { key: 'qty', label: 'Quantity', render: (row) => row.qty.toLocaleString() },
    { key: 'unitPrice', label: 'Unit Price', render: (row) => `$${row.unitPrice.toLocaleString()}` },
    {
      key: 'total',
      label: 'Amount',
      render: (row) => (
        <span className="font-semibold text-zinc-100">${row.total.toLocaleString()}</span>
      ),
    },
  ];

  if (loading && purchaseOrder.length === 0) {
    return <LoadingSpinner size="lg" message="Fetching purchase orders..." />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white font-heading">
          Purchase Orders & Invoices
        </h1>
        <p className="text-sm text-neutral-400">
          Track active commitments, audit vendor invoices, and manage payment settlements.
        </p>
      </div>

      {error && <ErrorState message={error} onRetry={fetchPurchaseOrders} />}

      {purchaseOrder.length === 0 ? (
        <EmptyState
          title="No purchase orders"
          description="There are currently no purchase order or invoice logs recorded."
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* LEFT PANEL: PO List */}
          <div className="lg:col-span-1 space-y-3">
            <h2 className="text-xs font-bold text-neutral-500 uppercase tracking-widest px-1">
              Purchase Orders ({purchaseOrder.length})
            </h2>
            <div className="space-y-2.5 max-h-[calc(100vh-230px)] overflow-y-auto pr-1">
              {purchaseOrder.map((po) => (
                <div
                  key={po._id}
                  onClick={() => setSelectedPO(po)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    selectedPO?._id === po._id
                      ? 'bg-neutral-900 border-brand-500/40 shadow-lg'
                      : 'bg-[#18181B] border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-mono font-bold text-neutral-400">
                      {po.poNumber}
                    </span>
                    {getInvoiceStatusBadge(po.invoiceStatus)}
                  </div>
                  <h3 className="text-sm font-semibold text-zinc-200 line-clamp-1">
                    {po.vendorDetails.name}
                  </h3>
                  <p className="text-[11px] text-neutral-400 mt-1">
                    Order Date: {new Date(po.orderDate).toLocaleDateString()}
                  </p>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-neutral-800/40">
                    <span className="text-[10px] text-neutral-500 uppercase tracking-wider">Amount Due</span>
                    <span className="text-sm font-bold text-zinc-100">
                      ${po.taxSummary.grandTotal.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT PANEL: Digital Invoice Sheet */}
          {selectedPO && (
            <div className="lg:col-span-2 space-y-6">
              {/* Toolbar */}
              <Card hoverable={false} className="py-3 px-4">
                <div className="flex flex-wrap gap-2 items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs">
                    <button
                      onClick={handleDownloadPDF}
                      className="flex items-center space-x-1.5 px-3 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 rounded-lg transition-all"
                    >
                      <Download size={14} />
                      <span>Download PDF</span>
                    </button>
                    <button
                      onClick={handlePrint}
                      className="flex items-center space-x-1.5 px-3 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 rounded-lg transition-all"
                    >
                      <Printer size={14} />
                      <span>Print</span>
                    </button>
                    <button
                      onClick={handleEmailInvoice}
                      className="flex items-center space-x-1.5 px-3 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 rounded-lg transition-all"
                    >
                      <Mail size={14} />
                      <span>Email Invoice</span>
                    </button>
                  </div>

                  {/* Mark as paid button guarded by role authorization */}
                  {(user?.role === 'Admin' || user?.role === 'Manager') && paymentStatus !== 'Paid' && (
                    <button
                      onClick={handleMarkAsPaid}
                      className="flex items-center space-x-1.5 px-3.5 py-2 bg-brand-500 hover:bg-brand-400 active:bg-brand-600 text-black text-xs font-bold rounded-lg shadow-lg shadow-brand-500/10 transition-all ml-auto"
                    >
                      <CreditCard size={14} />
                      <span>Mark as Paid</span>
                    </button>
                  )}
                </div>
                {emailStatus && (
                  <p className="text-[11px] text-brand-400 mt-2 ml-1 italic font-medium animate-pulse-slow">
                    {emailStatus}
                  </p>
                )}
              </Card>

              {/* Digital Invoice Layout Sheet */}
              <div id="invoice-sheet" className="p-8 bg-[#18181B] border border-neutral-800 rounded-2xl shadow-2xl space-y-8 print:bg-white print:text-black print:border-none print:shadow-none">
                {/* Invoice Header */}
                <div className="flex justify-between items-start flex-wrap gap-4 border-b border-neutral-800/80 pb-6">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-500 print:hidden">
                        <FileText size={18} />
                      </div>
                      <span className="font-heading text-lg font-bold text-white print:text-black">
                        VendorBridge ERP
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500 print:text-neutral-600 font-mono">
                      PO-REF: {selectedPO.poNumber}
                    </p>
                  </div>
                  
                  {invoiceDetails && (
                    <div className="text-right">
                      <h2 className="text-lg font-bold text-zinc-100 print:text-black">
                        INVOICE
                      </h2>
                      <p className="text-sm text-brand-400 print:text-emerald-600 font-semibold mt-0.5">
                        {invoiceDetails.invoiceNumber || 'Draft'}
                      </p>
                      <div className="flex items-center justify-end space-x-2 mt-2">
                        {getInvoiceStatusBadge(invoiceStatus)}
                      </div>
                    </div>
                  )}
                </div>

                {/* Vendor & Client Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs">
                  {/* Vendor Details */}
                  {vendorDetails && (
                    <div className="space-y-2.5">
                      <h4 className="text-neutral-500 print:text-neutral-600 font-bold uppercase tracking-wider flex items-center space-x-1.5">
                        <Building size={12} />
                        <span>Vendor / Payee</span>
                      </h4>
                      <div className="space-y-1 font-medium">
                        <p className="text-zinc-200 print:text-black text-sm font-bold">
                          {vendorDetails.name}
                        </p>
                        <p className="text-neutral-400 print:text-neutral-700">
                          {vendorDetails.email}
                        </p>
                        {vendorDetails.phone && (
                          <p className="text-neutral-400 print:text-neutral-700">
                            {vendorDetails.phone}
                          </p>
                        )}
                        {vendorDetails.address && (
                          <p className="text-neutral-400 print:text-neutral-700 whitespace-pre-line leading-relaxed mt-1">
                            {vendorDetails.address}
                          </p>
                        )}
                        {vendorDetails.taxId && (
                          <p className="text-neutral-500 print:text-neutral-600 font-mono text-[10px] pt-1">
                            TAX ID: {vendorDetails.taxId}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Billing Details */}
                  {billingDetails && (
                    <div className="space-y-2.5">
                      <h4 className="text-neutral-500 print:text-neutral-600 font-bold uppercase tracking-wider flex items-center space-x-1.5">
                        <Building size={12} />
                        <span>Bill To / Payor</span>
                      </h4>
                      <div className="space-y-1 font-medium">
                        <p className="text-zinc-200 print:text-black text-sm font-bold">
                          {billingDetails.companyName}
                        </p>
                        {billingDetails.address && (
                          <p className="text-neutral-400 print:text-neutral-700 whitespace-pre-line leading-relaxed">
                            {billingDetails.address}
                          </p>
                        )}
                        {billingDetails.taxId && (
                          <p className="text-neutral-500 print:text-neutral-600 font-mono text-[10px] pt-2">
                            TAX ID: {billingDetails.taxId}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Dates & Payments Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-neutral-900/40 print:bg-neutral-100 border border-neutral-800/80 print:border-neutral-300 rounded-xl text-xs">
                  <div>
                    <span className="text-neutral-500 print:text-neutral-600 font-medium block">Order Date</span>
                    <span className="text-zinc-200 print:text-black font-semibold mt-0.5 block">
                      {new Date(selectedPO.orderDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-500 print:text-neutral-600 font-medium block">Invoice Date</span>
                    <span className="text-zinc-200 print:text-black font-semibold mt-0.5 block">
                      {invoiceDetails?.invoiceDate
                        ? new Date(invoiceDetails.invoiceDate).toLocaleDateString()
                        : 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-500 print:text-neutral-600 font-medium block">Due Date</span>
                    <span className="text-zinc-200 print:text-black font-semibold mt-0.5 block">
                      {invoiceDetails?.dueDate
                        ? new Date(invoiceDetails.dueDate).toLocaleDateString()
                        : 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-500 print:text-neutral-600 font-medium block">Settlement Status</span>
                    <div className="mt-1 print:hidden">{getPaymentStatusBadge(paymentStatus)}</div>
                    <span className="hidden print:block font-bold uppercase">{paymentStatus}</span>
                  </div>
                </div>

                {/* Items Table */}
                <div className="border border-neutral-800 print:border-neutral-300 rounded-xl overflow-hidden">
                  <Table
                    columns={itemColumns}
                    data={invoiceItems}
                    rowKey="description"
                  />
                </div>

                {/* Grand Total Area */}
                {taxSummary && (
                  <div className="flex justify-end border-t border-neutral-800/80 pt-6">
                    <div className="w-full md:w-64 space-y-2.5 text-sm text-neutral-400 print:text-neutral-700">
                      <div className="flex justify-between">
                        <span>Net Subtotal:</span>
                        <span className="text-zinc-300 print:text-black font-medium">
                          ${taxSummary.subtotal.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>GST / TAX ({Math.round(taxSummary.taxRate * 100)}%):</span>
                        <span className="text-zinc-300 print:text-black font-medium">
                          ${taxSummary.taxAmount.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-base font-bold text-zinc-100 print:text-black pt-2.5 border-t border-neutral-800/40">
                        <span>Grand Total:</span>
                        <span className="text-brand-400 print:text-black">
                          ${taxSummary.grandTotal.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Notes */}
                <div className="text-[10px] text-neutral-500 print:text-neutral-600 border-t border-neutral-800/40 pt-4 leading-relaxed font-medium">
                  <p>
                    1. Settlement terms: Invoices are payable within 30 days of the invoice date.
                  </p>
                  <p>
                    2. Bank accounts details: Wire transfers are accepted to VendorBridge Central Settlement Account routing.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PurchaseOrderInvoicePage;
