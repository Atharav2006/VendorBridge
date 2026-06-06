import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import quotationService from '../services/quotationService';
import { ClipboardList, Save, Send, Plus, Trash2, Calculator, CreditCard, Truck, CheckCircle, AlertCircle } from 'lucide-react';
import Card from '../components/common/Card';
import ErrorState from '../components/common/ErrorState';

const inputCls = 'w-full bg-white border border-surface-border focus:border-brand-400 focus:ring-2 focus:ring-brand-100 text-ink-700 text-xs rounded-xl px-3 py-2.5 outline-none transition-all placeholder-ink-300';
const labelCls = 'block text-[10px] font-bold text-ink-400 uppercase tracking-wider mb-1.5';
const lineCls  = 'w-full bg-transparent border-b border-surface-border focus:border-brand-400 text-ink-700 py-1 outline-none placeholder-ink-300 transition-colors text-xs';

const EMPTY_ITEM = () => ({
  _id: `qi-${Date.now()}-${Math.random().toString(36).substr(2,6)}`,
  description: '', unit: '', quantity: '', unitPrice: '', lineTotal: 0,
});

export const QuotationSubmissionPage = () => {
  const { rfqId } = useParams();

  const [quotationForm, setQuotationForm] = useState({ vendorId: '', rfqId: rfqId || '', notes: '', currency: 'INR', validityDays: 30 });
  const [quotationItems, setQuotationItems] = useState([EMPTY_ITEM()]);
  const [taxSummary, setTaxSummary] = useState({ gstPercentage: 18, gstAmount: 0, tdsPercentage: 0, tdsAmount: 0, otherCharges: 0, otherChargesDescription: '' });
  const [paymentTerms, setPaymentTerms] = useState({ advancePercentage: 0, creditDays: 30, paymentMethod: 'Bank Transfer', milestones: '' });
  const [deliveryTimeline, setDeliveryTimeline] = useState({ expectedDeliveryDate: '', deliveryLocation: '', shippingMode: '', partialDelivery: false, warrantyPeriod: '' });
  const [grandTotal, setGrandTotal] = useState(0);
  const [quotationStatus, setQuotationStatus] = useState('idle');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rfqDetails, setRfqDetails] = useState(null);
  const [rfqLoading, setRfqLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!rfqId) { setRfqLoading(false); return; }
      try {
        const res = await quotationService.getRFQDetails(rfqId);
        if (res.success) {
          setRfqDetails(res.data);
          if (res.data.rfqItems?.length) {
            setQuotationItems(res.data.rfqItems.map((item) => ({
              _id: `qi-${item._id || Math.random()}`, description: item.description || '', unit: item.unit || '', quantity: item.quantity || '', unitPrice: '', lineTotal: 0,
            })));
          }
        }
      } catch {} finally { setRfqLoading(false); }
    };
    load();
  }, [rfqId]);

  const recalc = useCallback(() => {
    const sub = quotationItems.reduce((s, i) => s + (Number(i.quantity)||0) * (Number(i.unitPrice)||0), 0);
    const gst = (sub * (Number(taxSummary.gstPercentage)||0)) / 100;
    const tds = (sub * (Number(taxSummary.tdsPercentage)||0)) / 100;
    setTaxSummary((p) => ({ ...p, gstAmount: gst, tdsAmount: tds }));
    setGrandTotal(sub + gst - tds + (Number(taxSummary.otherCharges)||0));
    setQuotationItems((p) => p.map((i) => ({ ...i, lineTotal: (Number(i.quantity)||0)*(Number(i.unitPrice)||0) })));
  }, [quotationItems, taxSummary.gstPercentage, taxSummary.tdsPercentage, taxSummary.otherCharges]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { recalc(); }, [quotationItems.map((i) => `${i.quantity}|${i.unitPrice}`).join(','), taxSummary.gstPercentage, taxSummary.tdsPercentage, taxSummary.otherCharges]);

  const addItem    = () => setQuotationItems((p) => [...p, EMPTY_ITEM()]);
  const removeItem = (id) => setQuotationItems((p) => p.length > 1 ? p.filter((i) => i._id !== id) : p);
  const updateItem = (id, f, v) => setQuotationItems((p) => p.map((i) => i._id === id ? { ...i, [f]: v } : i));

  const payload = () => ({ ...quotationForm, quotationItems, taxSummary, paymentTerms, deliveryTimeline, grandTotal });

  const saveDraft = async () => {
    setQuotationStatus('saving'); setLoading(true);
    try { const res = await quotationService.saveQuotationDraft(payload()); if (!res.success) throw new Error(res.message); setQuotationStatus('idle'); }
    catch (err) { setError(err.response?.data?.message || err.message); setQuotationStatus('error'); }
    finally { setLoading(false); }
  };

  const submit = async () => {
    setQuotationStatus('submitting'); setLoading(true); setError(null);
    try { const res = await quotationService.submitQuotation(payload()); if (!res.success) throw new Error(res.message); setQuotationStatus('success'); }
    catch (err) { setError(err.response?.data?.message || err.message); setQuotationStatus('error'); }
    finally { setLoading(false); }
  };

  const subtotal = quotationItems.reduce((s, i) => s + (Number(i.quantity)||0)*(Number(i.unitPrice)||0), 0);
  const fmt = (n) => Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 });

  if (quotationStatus === 'success') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-accent-50 border border-accent-200 flex items-center justify-center shadow-accent">
          <CheckCircle size={28} className="text-accent-600" />
        </div>
        <h2 className="text-xl font-bold text-ink-900">Quotation Submitted</h2>
        <p className="text-sm text-ink-400 max-w-sm">Your quotation has been successfully submitted and will appear in the comparison module.</p>
      </div>
    );
  }

  if (!rfqId) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center shadow-accent">
          <AlertCircle size={28} className="text-amber-600" />
        </div>
        <h2 className="text-xl font-bold text-ink-900">No RFQ Selected</h2>
        <p className="text-sm text-ink-400 max-w-sm">Please select an RFQ from the Active RFQs list to submit a quotation.</p>
        <button onClick={() => window.location.href = '/rfqs'} className="px-6 py-2.5 bg-brand-500 text-white rounded-xl hover:bg-brand-600 font-semibold shadow-sm transition-all">
          View Active RFQs
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-brand-50 border border-brand-100 flex items-center justify-center"><ClipboardList size={16} className="text-brand-600" /></div>
            <h1 className="text-2xl font-bold tracking-tight text-ink-900 font-heading">Submit Quotation</h1>
          </div>
          <p className="text-sm text-ink-400">Enter pricing, delivery timeline, and payment terms for this RFQ.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={saveDraft} disabled={loading} className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-ink-500 border border-surface-border rounded-xl hover:bg-surface-raised disabled:opacity-40 transition-all">
            <Save size={13} />{quotationStatus === 'saving' ? 'Saving...' : 'Save Draft'}
          </button>
          <button onClick={submit} disabled={loading} className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-brand disabled:opacity-40 transition-all active:scale-95">
            <Send size={13} />{quotationStatus === 'submitting' ? 'Submitting...' : 'Submit Quotation'}
          </button>
        </div>
      </div>

      {error && <ErrorState message={error} onRetry={() => setError(null)} />}

      {/* RFQ Summary */}
      {rfqLoading ? (
        <div className="h-16 bg-white border border-surface-border rounded-2xl flex items-center justify-center shadow-card">
          <p className="text-xs text-ink-300 animate-pulse">Loading RFQ details...</p>
        </div>
      ) : rfqDetails ? (
        <Card hoverable={false} title={rfqDetails.title}
          subtitle={`Ref: ${rfqDetails.rfqNumber || rfqId} — Deadline: ${rfqDetails.deadline ? new Date(rfqDetails.deadline).toLocaleDateString('en-IN') : '—'}`}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            {[['Department',rfqDetails.department],['Priority',rfqDetails.priority],['Items Requested',rfqDetails.rfqItems?.length],['Buyer',rfqDetails.createdBy?.username]].map(([k,v]) => (
              <div key={k}><p className={labelCls}>{k}</p><p className="text-ink-700 font-medium">{v ?? '—'}</p></div>
            ))}
          </div>
        </Card>
      ) : rfqId ? (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700">
          RFQ details will load after backend integration (rfqId: {rfqId})
        </div>
      ) : null}

      {/* Line Items */}
      <Card title="Quotation Line Items" subtitle="Enter your unit pricing for each requested item" hoverable={false}
        headerActions={<button onClick={addItem} className="flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors"><Plus size={13} /> Add Item</button>}>
        <div className="overflow-x-auto border border-surface-border rounded-xl">
          <table className="w-full border-collapse text-xs">
            <thead><tr className="border-b border-surface-border bg-surface-raised">
              {['Description','Unit','Quantity','Unit Price (₹)','Line Total (₹)',''].map((h,i) => (
                <th key={i} className={`text-left px-4 py-3 text-[10px] font-bold text-ink-400 uppercase tracking-wider ${i===5?'w-8':i>=1?'min-w-[100px]':'min-w-[180px]'}`}>{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-surface-border">
              {quotationItems.map((item) => (
                <tr key={item._id} className="hover:bg-brand-50/30 transition-colors">
                  <td className="px-4 py-3"><input value={item.description} onChange={(e) => updateItem(item._id,'description',e.target.value)} placeholder="Item description" className={lineCls} /></td>
                  <td className="px-4 py-3"><input value={item.unit} onChange={(e) => updateItem(item._id,'unit',e.target.value)} placeholder="pcs" className={lineCls} /></td>
                  <td className="px-4 py-3"><input type="number" min="0" value={item.quantity} onChange={(e) => updateItem(item._id,'quantity',e.target.value)} placeholder="0" className={lineCls} /></td>
                  <td className="px-4 py-3"><input type="number" min="0" step="0.01" value={item.unitPrice} onChange={(e) => updateItem(item._id,'unitPrice',e.target.value)} placeholder="0.00" className={`${lineCls} text-brand-700 font-semibold border-b-brand-400`} /></td>
                  <td className="px-4 py-3"><span className="font-semibold text-ink-800">₹{fmt((Number(item.quantity)||0)*(Number(item.unitPrice)||0))}</span></td>
                  <td className="px-4 py-3"><button onClick={() => removeItem(item._id)} className="p-1 text-ink-300 hover:text-red-500 rounded transition-colors"><Trash2 size={13} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button onClick={addItem} className="mt-4 flex items-center gap-2 w-full justify-center py-3 border border-dashed border-surface-border hover:border-brand-400 rounded-xl text-xs text-ink-400 hover:text-brand-600 transition-all">
          <Plus size={13} /> Add Item
        </button>
      </Card>

      {/* Tax + Delivery */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Tax & GST Summary" subtitle="Applicable taxes and additional charges" hoverable={false} headerActions={<Calculator size={14} className="text-ink-400" />}>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><label className={labelCls}>GST %</label><input type="number" min="0" max="100" value={taxSummary.gstPercentage} onChange={(e) => setTaxSummary((p) => ({...p, gstPercentage: e.target.value}))} className={inputCls} /></div>
              <div><label className={labelCls}>TDS %</label><input type="number" min="0" max="100" value={taxSummary.tdsPercentage} onChange={(e) => setTaxSummary((p) => ({...p, tdsPercentage: e.target.value}))} className={inputCls} /></div>
            </div>
            <div><label className={labelCls}>Other Charges (₹)</label><input type="number" min="0" value={taxSummary.otherCharges} onChange={(e) => setTaxSummary((p) => ({...p, otherCharges: e.target.value}))} placeholder="Freight, packaging…" className={inputCls} /></div>
            {Number(taxSummary.otherCharges) > 0 && <div><label className={labelCls}>Charges Description</label><input value={taxSummary.otherChargesDescription} onChange={(e) => setTaxSummary((p) => ({...p, otherChargesDescription: e.target.value}))} placeholder="Freight + Packaging" className={inputCls} /></div>}
          </div>
        </Card>

        <Card title="Delivery Timeline" subtitle="Specify delivery schedule and logistics" hoverable={false} headerActions={<Truck size={14} className="text-ink-400" />}>
          <div className="space-y-3">
            <div><label className={labelCls}>Expected Delivery Date</label><input type="date" value={deliveryTimeline.expectedDeliveryDate} onChange={(e) => setDeliveryTimeline((p) => ({...p, expectedDeliveryDate: e.target.value}))} className={inputCls} /></div>
            <div><label className={labelCls}>Delivery Location</label><input value={deliveryTimeline.deliveryLocation} onChange={(e) => setDeliveryTimeline((p) => ({...p, deliveryLocation: e.target.value}))} placeholder="Mumbai Warehouse" className={inputCls} /></div>
            <div><label className={labelCls}>Shipping Mode</label>
              <select value={deliveryTimeline.shippingMode} onChange={(e) => setDeliveryTimeline((p) => ({...p, shippingMode: e.target.value}))} className={inputCls}>
                {['','Road','Rail','Air','Sea','Courier','Hand Delivery'].map((m) => <option key={m} value={m}>{m || 'Select Mode'}</option>)}
              </select>
            </div>
            <div><label className={labelCls}>Warranty Period</label><input value={deliveryTimeline.warrantyPeriod} onChange={(e) => setDeliveryTimeline((p) => ({...p, warrantyPeriod: e.target.value}))} placeholder="12 months" className={inputCls} /></div>
            <label className="flex items-center gap-2 text-xs text-ink-500 cursor-pointer">
              <input type="checkbox" checked={deliveryTimeline.partialDelivery} onChange={(e) => setDeliveryTimeline((p) => ({...p, partialDelivery: e.target.checked}))} className="accent-brand-600 w-3.5 h-3.5 rounded" />
              Partial delivery accepted
            </label>
          </div>
        </Card>
      </div>

      {/* Payment Terms */}
      <Card title="Payment Terms" subtitle="Specify payment expectations" hoverable={false} headerActions={<CreditCard size={14} className="text-ink-400" />}>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div><label className={labelCls}>Advance %</label><input type="number" min="0" max="100" value={paymentTerms.advancePercentage} onChange={(e) => setPaymentTerms((p) => ({...p, advancePercentage: e.target.value}))} placeholder="0" className={inputCls} /></div>
          <div><label className={labelCls}>Credit Days</label><input type="number" min="0" value={paymentTerms.creditDays} onChange={(e) => setPaymentTerms((p) => ({...p, creditDays: e.target.value}))} placeholder="30" className={inputCls} /></div>
          <div><label className={labelCls}>Payment Method</label>
            <select value={paymentTerms.paymentMethod} onChange={(e) => setPaymentTerms((p) => ({...p, paymentMethod: e.target.value}))} className={inputCls}>
              {['Bank Transfer','Cheque','NEFT','RTGS','UPI','Letter of Credit'].map((m) => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div><label className={labelCls}>Validity (Days)</label><input type="number" min="1" value={quotationForm.validityDays} onChange={(e) => setQuotationForm((p) => ({...p, validityDays: e.target.value}))} placeholder="30" className={inputCls} /></div>
          <div className="col-span-full"><label className={labelCls}>Milestone / Schedule Notes</label><textarea value={paymentTerms.milestones} onChange={(e) => setPaymentTerms((p) => ({...p, milestones: e.target.value}))} placeholder="30% advance, 70% on delivery…" rows={2} className={`${inputCls} resize-none`} /></div>
        </div>
      </Card>

      {/* Grand Total */}
      <Card title="Grand Total" subtitle="Auto-calculated based on items and taxes" hoverable={false} headerActions={<Calculator size={14} className="text-brand-600" />}>
        <div className="flex justify-end">
          <div className="w-full max-w-xs bg-surface-raised rounded-2xl border border-surface-border p-5 space-y-3 text-sm">
            {[
              { label: 'Subtotal', value: `₹${fmt(subtotal)}`, cls: 'text-ink-700' },
              { label: `GST (${taxSummary.gstPercentage}%)`, value: `+ ₹${fmt(taxSummary.gstAmount)}`, cls: 'text-ink-600' },
              ...(Number(taxSummary.tdsPercentage) > 0 ? [{ label: `TDS (${taxSummary.tdsPercentage}%)`, value: `− ₹${fmt(taxSummary.tdsAmount)}`, cls: 'text-red-500' }] : []),
              ...(Number(taxSummary.otherCharges) > 0 ? [{ label: taxSummary.otherChargesDescription || 'Other Charges', value: `+ ₹${fmt(taxSummary.otherCharges)}`, cls: 'text-ink-600' }] : []),
            ].map((row) => (
              <div key={row.label} className="flex justify-between text-xs text-ink-400">
                <span>{row.label}</span><span className={`font-semibold ${row.cls}`}>{row.value}</span>
              </div>
            ))}
            <div className="flex justify-between font-bold pt-3 border-t border-surface-border">
              <span className="text-ink-800">Grand Total</span>
              <span className="text-brand-700 text-base">₹{fmt(grandTotal)}</span>
            </div>
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-3 pt-4 border-t border-surface-border">
          <button onClick={saveDraft} disabled={loading} className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-ink-500 border border-surface-border rounded-xl hover:bg-surface-raised disabled:opacity-40 transition-all"><Save size={13} /> Save Draft</button>
          <button onClick={submit} disabled={loading} className="flex items-center gap-2 px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-brand disabled:opacity-40 transition-all active:scale-95"><Send size={13} />{loading ? 'Submitting...' : 'Submit Quotation'}</button>
        </div>
      </Card>
    </div>
  );
};

export default QuotationSubmissionPage;
