import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import quotationService from '../services/quotationService';
import {
  GitCompare, Star, Trophy, CheckCircle, Clock,
  Truck, CreditCard, ArrowRight, RefreshCw, AlertTriangle,
} from 'lucide-react';
import Card from '../components/common/Card';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorState from '../components/common/ErrorState';
import EmptyState from '../components/common/EmptyState';

// ─── Star Rating ──────────────────────────────────────────────────────────────
const StarRating = ({ rating = 0, size = 12 }) => (
  <div className="flex items-center gap-0.5">
    {[1,2,3,4,5].map((s) => (
      <Star key={s} size={size} className={s <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-200'} />
    ))}
    <span className="ml-1 text-[10px] text-ink-300">{Number(rating).toFixed(1)}</span>
  </div>
);

// ─── Comparison Row ───────────────────────────────────────────────────────────
const ComparisonRow = ({ label, icon: Icon, values, bestIndex, formatter }) => (
  <div className="grid items-center gap-2 py-2.5 border-b border-surface-border last:border-0"
    style={{ gridTemplateColumns: `140px repeat(${values.length}, minmax(140px, 1fr))` }}>
    <div className="flex items-center gap-2 text-xs text-ink-400">
      {Icon && <Icon size={12} />}
      <span className="font-semibold">{label}</span>
    </div>
    {values.map((val, idx) => (
      <div key={idx} className={`text-xs font-semibold text-center px-2 py-1.5 rounded-xl transition-all ${
        idx === bestIndex ? 'bg-brand-50 text-brand-700 border border-brand-200 shadow-sm' : 'text-ink-600'
      }`}>
        {formatter ? formatter(val) : val ?? '—'}
      </div>
    ))}
  </div>
);

// ─── Vendor Quote Card ────────────────────────────────────────────────────────
const VendorQuoteCard = ({ quotation, isLowest, isSelected, onSelect, disabled }) => (
  <div className={`rounded-2xl border-2 p-5 shadow-card relative transition-all duration-200 hover:shadow-card-md ${
    isSelected ? 'border-brand-400 bg-brand-50/60' :
    isLowest   ? 'border-accent-400 bg-accent-50/40' :
                 'border-surface-border bg-white'
  }`}>
    {(isLowest || isSelected) && (
      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
        <span className={`px-3 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 shadow-sm ${
          isSelected ? 'bg-brand-100 text-brand-700 border-brand-300' : 'bg-accent-100 text-accent-700 border-accent-300'
        }`}>
          {isSelected ? <><CheckCircle size={10} /> Selected</> : <><Trophy size={10} /> Lowest Bid</>}
        </span>
      </div>
    )}

    <div className="text-center mb-4 mt-2">
      <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-sm mx-auto mb-2">
        {quotation.vendorName?.[0]?.toUpperCase() || 'V'}
      </div>
      <h3 className="text-sm font-bold text-ink-900">{quotation.vendorName}</h3>
      <p className="text-[10px] text-ink-300 font-mono mt-0.5">{quotation.quotationId}</p>
      <div className="flex justify-center mt-1.5"><StarRating rating={quotation.vendorRating || 0} /></div>
    </div>

    {/* Grand Total */}
    <div className="text-center py-3.5 bg-white rounded-xl border border-surface-border mb-4 shadow-card">
      <p className="text-[10px] text-ink-400 uppercase tracking-wider mb-1">Grand Total</p>
      <p className={`text-xl font-bold ${isLowest || isSelected ? 'text-brand-700' : 'text-ink-900'}`}>
        ₹{Number(quotation.grandTotal || 0).toLocaleString('en-IN')}
      </p>
    </div>

    {/* Metrics */}
    <div className="space-y-2 text-xs mb-5">
      {[
        { icon: Truck,      label: 'Delivery', value: quotation.deliveryTimeline?.expectedDeliveryDate ? new Date(quotation.deliveryTimeline.expectedDeliveryDate).toLocaleDateString('en-IN',{day:'2-digit',month:'short'}) : quotation.deliveryDays ? `${quotation.deliveryDays}d` : '—' },
        { icon: CreditCard, label: 'Payment',  value: quotation.paymentTerms?.paymentMethod || '—' },
        { icon: Clock,      label: 'Validity', value: quotation.quotationForm?.validityDays ? `${quotation.quotationForm.validityDays}d` : '—' },
      ].map((m) => (
        <div key={m.label} className="flex items-center justify-between text-ink-500">
          <div className="flex items-center gap-1.5"><m.icon size={11} className="text-ink-300" />{m.label}</div>
          <span className="text-ink-700 font-semibold">{m.value}</span>
        </div>
      ))}
    </div>

    {!isSelected ? (
      <button onClick={() => onSelect(quotation)} disabled={disabled}
        className="w-full py-2.5 text-xs font-bold rounded-xl border-2 border-brand-500 text-brand-600 hover:bg-brand-600 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all">
        Select Vendor
      </button>
    ) : (
      <div className="w-full py-2.5 text-xs font-bold rounded-xl bg-brand-600 text-white text-center shadow-brand">
        ✓ Vendor Selected
      </div>
    )}
  </div>
);

// ─── Quotation Comparison Page ────────────────────────────────────────────────
export const QuotationComparisonPage = () => {
  const { rfqId } = useParams();

  const [quotationComparisons, setQuotationComparisons] = useState([]);
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [vendorRatings, setVendorRatings] = useState({});
  const [workflowStatus, setWorkflowStatus] = useState('idle');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { fetchComparisons(); }, [rfqId]);

  const fetchComparisons = async () => {
    setLoading(true); setError(null);
    try {
      const res = await quotationService.getQuotationComparison(rfqId || 'all');
      if (res.success) {
        setQuotationComparisons(res.data || []);
        const r = {};
        (res.data || []).forEach((q) => { r[q.quotationId] = q.vendorRating || 0; });
        setVendorRatings(r);
      } else throw new Error(res.message);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally { setLoading(false); }
  };

  const handleSelect = async (q) => {
    try {
      const res = await quotationService.selectVendor(q.quotationId || q._id);
      if (res.success) setSelectedQuotation(q);
      else throw new Error(res.message);
    } catch (err) { setError(err.response?.data?.message || err.message); }
  };

  const handleInitiateApproval = async () => {
    if (!selectedQuotation) return;
    setWorkflowStatus('initiating');
    try {
      const res = await quotationService.initiateApprovalWorkflow(rfqId, selectedQuotation.quotationId || selectedQuotation._id);
      if (res.success) setWorkflowStatus('success');
      else throw new Error(res.message);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setWorkflowStatus('error');
    }
  };

  const lowestIdx = quotationComparisons.length > 0
    ? quotationComparisons.reduce((li, q, i) => Number(q.grandTotal||0) < Number(quotationComparisons[li]?.grandTotal||Infinity) ? i : li, 0)
    : -1;

  const gridCols = quotationComparisons.length === 1 ? 'grid-cols-1 max-w-sm' : quotationComparisons.length === 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';

  if (loading) return <LoadingSpinner size="lg" message="Loading quotation comparisons..." />;

  if (!rfqId) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center shadow-accent">
          <GitCompare size={28} className="text-indigo-600" />
        </div>
        <h2 className="text-xl font-bold text-ink-900">Select RFQ to Compare</h2>
        <p className="text-sm text-ink-400 max-w-sm">Please select an RFQ from the Active RFQs list to compare received quotations.</p>
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
            <div className="w-8 h-8 rounded-lg bg-brand-50 border border-brand-100 flex items-center justify-center"><GitCompare size={16} className="text-brand-600" /></div>
            <h1 className="text-2xl font-bold tracking-tight text-ink-900 font-heading">Quotation Comparison</h1>
          </div>
          <p className="text-sm text-ink-400">Side-by-side comparison — select the best vendor offer.{rfqId && <span className="ml-2 font-mono text-[10px] text-ink-300">RFQ: {rfqId}</span>}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchComparisons} className="flex items-center gap-2 px-3 py-2.5 text-xs text-ink-400 border border-surface-border rounded-xl hover:bg-surface-raised transition-all"><RefreshCw size={12} /> Refresh</button>
          {selectedQuotation && workflowStatus !== 'success' && (
            <button onClick={handleInitiateApproval} disabled={workflowStatus === 'initiating'}
              className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-brand disabled:opacity-40 transition-all active:scale-95">
              <ArrowRight size={13} />{workflowStatus === 'initiating' ? 'Initiating...' : 'Initiate Approval'}
            </button>
          )}
          {workflowStatus === 'success' && (
            <span className="flex items-center gap-2 px-4 py-2.5 bg-accent-50 text-accent-700 text-xs font-bold border border-accent-200 rounded-xl">
              <CheckCircle size={13} /> Approval Workflow Started
            </span>
          )}
        </div>
      </div>

      {error && <ErrorState message={error} onRetry={fetchComparisons} />}

      {quotationComparisons.length > 0 && !selectedQuotation && (
        <div className="flex items-center gap-2.5 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700">
          <AlertTriangle size={13} /> Select a vendor to enable approval workflow initiation.
        </div>
      )}

      {quotationComparisons.length === 0 ? (
        <EmptyState title="No quotations received" description="Vendor quotations will appear here after vendors submit responses to the RFQ." icon={GitCompare} />
      ) : (
        <>
          {/* Quote Cards */}
          <div className={`grid gap-5 ${gridCols}`}>
            {quotationComparisons.map((q, idx) => (
              <VendorQuoteCard key={q.quotationId || q._id || idx} quotation={q}
                isLowest={idx === lowestIdx}
                isSelected={selectedQuotation?.quotationId === q.quotationId}
                onSelect={handleSelect}
                disabled={workflowStatus === 'success'}
              />
            ))}
          </div>

          {/* Comparison Matrix */}
          <Card title="Detailed Comparison Matrix" subtitle="Criterion-by-criterion comparison of all quotations" hoverable={false}>
            <div className="overflow-x-auto">
              {/* Vendor headers */}
              <div className="grid items-center gap-2 pb-3 border-b border-surface-border mb-1"
                style={{ gridTemplateColumns: `140px repeat(${quotationComparisons.length}, minmax(140px, 1fr))` }}>
                <div />
                {quotationComparisons.map((q, idx) => (
                  <div key={idx} className="text-center">
                    <p className="text-xs font-bold text-ink-800 truncate">{q.vendorName}</p>
                    <StarRating rating={vendorRatings[q.quotationId] || 0} size={10} />
                  </div>
                ))}
              </div>

              <ComparisonRow label="Grand Total" icon={Trophy}
                values={quotationComparisons.map((q) => Number(q.grandTotal||0))}
                bestIndex={lowestIdx}
                formatter={(v) => `₹${Number(v).toLocaleString('en-IN',{minimumFractionDigits:2})}`}
              />
              <ComparisonRow label="Delivery" icon={Truck}
                values={quotationComparisons.map((q) =>
                  q.deliveryTimeline?.expectedDeliveryDate ? new Date(q.deliveryTimeline.expectedDeliveryDate).toLocaleDateString('en-IN',{day:'2-digit',month:'short'}) : q.deliveryDays ? `${q.deliveryDays}d` : '—'
                )}
                bestIndex={quotationComparisons.reduce((mi,q,i) => {
                  const d = q.deliveryTimeline?.expectedDeliveryDate ? new Date(q.deliveryTimeline.expectedDeliveryDate).getTime() : q.deliveryDays ?? Infinity;
                  const md = quotationComparisons[mi]?.deliveryTimeline?.expectedDeliveryDate ? new Date(quotationComparisons[mi].deliveryTimeline.expectedDeliveryDate).getTime() : quotationComparisons[mi]?.deliveryDays ?? Infinity;
                  return d < md ? i : mi;
                }, 0)}
              />
              <ComparisonRow label="Payment" icon={CreditCard}
                values={quotationComparisons.map((q) => q.paymentTerms?.paymentMethod || '—')}
                bestIndex={-1}
              />
              <ComparisonRow label="Credit Days" icon={Clock}
                values={quotationComparisons.map((q) => q.paymentTerms?.creditDays ?? '—')}
                bestIndex={quotationComparisons.reduce((mi,q,i) => Number(q.paymentTerms?.creditDays??0) > Number(quotationComparisons[mi]?.paymentTerms?.creditDays??0) ? i : mi, 0)}
                formatter={(v) => v !== '—' ? `${v} days` : '—'}
              />
              <ComparisonRow label="GST %"
                values={quotationComparisons.map((q) => q.taxSummary?.gstPercentage ?? '—')}
                bestIndex={quotationComparisons.reduce((mi,q,i) => Number(q.taxSummary?.gstPercentage??Infinity) < Number(quotationComparisons[mi]?.taxSummary?.gstPercentage??Infinity) ? i : mi, 0)}
                formatter={(v) => v !== '—' ? `${v}%` : '—'}
              />
              <ComparisonRow label="Vendor Rating" icon={Star}
                values={quotationComparisons.map((q) => q.vendorRating||0)}
                bestIndex={quotationComparisons.reduce((mi,q,i) => Number(q.vendorRating||0) > Number(quotationComparisons[mi]?.vendorRating||0) ? i : mi, 0)}
                formatter={(v) => `${Number(v).toFixed(1)} / 5.0`}
              />
            </div>
          </Card>

          {/* Selected Vendor Summary */}
          {selectedQuotation && (
            <Card title="Selected Vendor" subtitle="Procurement decision recorded — ready to initiate approval" hoverable={false}
              headerActions={<CheckCircle size={15} className="text-accent-600" />}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                {[
                  { label: 'Vendor', value: selectedQuotation.vendorName, cls: 'text-ink-800 font-semibold' },
                  { label: 'Grand Total', value: `₹${Number(selectedQuotation.grandTotal||0).toLocaleString('en-IN')}`, cls: 'text-brand-700 font-bold' },
                  { label: 'Quotation ID', value: selectedQuotation.quotationId || selectedQuotation._id, cls: 'text-ink-500 font-mono' },
                ].map(({ label, value, cls }) => (
                  <div key={label}><p className="text-[10px] text-ink-400 uppercase font-bold tracking-wider mb-1">{label}</p><p className={cls}>{value}</p></div>
                ))}
                <div><p className="text-[10px] text-ink-400 uppercase font-bold tracking-wider mb-1">Rating</p><StarRating rating={selectedQuotation.vendorRating||0} /></div>
              </div>

              {workflowStatus !== 'success' && (
                <div className="mt-5 flex justify-end">
                  <button onClick={handleInitiateApproval} disabled={workflowStatus === 'initiating'}
                    className="flex items-center gap-2 px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-brand disabled:opacity-40 transition-all active:scale-95">
                    <ArrowRight size={13} />{workflowStatus === 'initiating' ? 'Initiating...' : 'Send to Approval Workflow'}
                  </button>
                </div>
              )}

              {workflowStatus === 'success' && (
                <div className="mt-5 p-3 bg-accent-50 border border-accent-200 rounded-xl flex items-center gap-2 text-xs text-accent-700">
                  <CheckCircle size={13} />
                  Approval workflow initiated. Navigate to{' '}
                  <a href="/approvals" className="underline font-semibold hover:text-accent-800 transition-colors">Approvals</a> to review.
                </div>
              )}
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default QuotationComparisonPage;
