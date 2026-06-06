import React, { useState, useEffect } from 'react';
import rfqService from '../services/rfqService';
import {
  FilePlus, ChevronRight, Plus, Trash2, Paperclip,
  Send, Save, CalendarDays, Users, CheckCircle, X,
} from 'lucide-react';
import Card from '../components/common/Card';
import ErrorState from '../components/common/ErrorState';

// ─── Shared styles ────────────────────────────────────────────────────────────
const inputCls = 'w-full bg-white border border-surface-border focus:border-brand-400 focus:ring-2 focus:ring-brand-100 text-ink-700 text-xs rounded-xl px-3 py-2.5 outline-none transition-all placeholder-ink-300';
const labelCls = 'block text-[10px] font-bold text-ink-400 uppercase tracking-wider mb-1.5';
const errorCls = 'text-[10px] text-red-500 mt-1';

// ─── Step Indicator ───────────────────────────────────────────────────────────
const StepIndicator = ({ steps, currentStep }) => (
  <div className="flex items-center justify-center overflow-x-auto pb-1">
    {steps.map((step, idx) => {
      const done   = idx < currentStep;
      const active = idx === currentStep;
      return (
        <React.Fragment key={step.label}>
          <div className="flex flex-col items-center min-w-[96px]">
            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all ${
              done   ? 'bg-accent-500  border-accent-500  text-white' :
              active ? 'bg-brand-600  border-brand-600  text-white shadow-brand' :
                       'bg-white border-surface-border text-ink-300'
            }`}>
              {done ? <CheckCircle size={14} /> : idx + 1}
            </div>
            <p className={`text-[10px] font-semibold mt-1.5 ${active ? 'text-brand-700' : done ? 'text-accent-600' : 'text-ink-300'}`}>
              {step.label}
            </p>
          </div>
          {idx < steps.length - 1 && (
            <div className={`flex-1 h-0.5 mx-2 min-w-[20px] transition-colors ${done ? 'bg-accent-400' : 'bg-surface-border'}`} />
          )}
        </React.Fragment>
      );
    })}
  </div>
);

const EMPTY_ITEM = () => ({
  _id: `item-${Date.now()}-${Math.random().toString(36).substr(2,6)}`,
  description: '', unit: '', quantity: '', estimatedUnitPrice: '', remarks: '',
});

export const RFQCreationPage = () => {
  const [rfqForm, setRfqForm] = useState({ title: '', description: '', rfqNumber: '', priority: 'Medium', department: '' });
  const [rfqItems, setRfqItems] = useState([EMPTY_ITEM()]);
  const [assignedVendors, setAssignedVendors] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [deadline, setDeadline] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [submissionStatus, setSubmissionStatus] = useState('idle');
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [vendorList, setVendorList] = useState([]);
  const [vendorSearch, setVendorSearch] = useState('');

  const STEPS = [{ label: 'RFQ Details' }, { label: 'Line Items' }, { label: 'Assign Vendors' }, { label: 'Review & Send' }];

  useEffect(() => {
    rfqService.getVendorList().then((res) => { if (res.success) setVendorList(res.data || []); }).catch(() => {});
  }, []);

  const validate = () => {
    const e = {};
    if (!rfqForm.title.trim()) e.title = 'RFQ title is required';
    if (!deadline) e.deadline = 'Deadline is required';
    if (rfqItems.every((i) => !i.description.trim())) e.items = 'At least one item required';
    if (assignedVendors.length === 0) e.vendors = 'Assign at least one vendor';
    setFormErrors(e);
    return Object.keys(e).length === 0;
  };

  const addItem    = () => setRfqItems((p) => [...p, EMPTY_ITEM()]);
  const removeItem = (id) => setRfqItems((p) => p.length > 1 ? p.filter((i) => i._id !== id) : p);
  const updateItem = (id, f, v) => setRfqItems((p) => p.map((i) => i._id === id ? { ...i, [f]: v } : i));
  const toggleVendor = (id) => setAssignedVendors((p) => p.includes(id) ? p.filter((v) => v !== id) : [...p, id]);

  const handleFileChange = (e) => {
    setAttachments((p) => [...p, ...Array.from(e.target.files).map((f) => ({
      _id: `att-${Date.now()}-${Math.random().toString(36).substr(2,5)}`,
      name: f.name, size: f.size, type: f.type, file: f, uploadedUrl: null,
    }))]);
  };

  const buildPayload = () => ({ ...rfqForm, rfqItems, assignedVendors, deadline, attachments: attachments.map(({ name, size, type, uploadedUrl }) => ({ name, size, type, uploadedUrl })) });

  const handleSaveDraft = async () => {
    setSubmissionStatus('saving'); setLoading(true);
    try {
      const res = await rfqService.saveRFQDraft(buildPayload());
      if (!res.success) throw new Error(res.message);
      setSubmissionStatus('idle');
    } catch (err) {
      setFormErrors((p) => ({ ...p, submit: err.response?.data?.message || err.message }));
      setSubmissionStatus('error');
    } finally { setLoading(false); }
  };

  const handleSend = async () => {
    if (!validate()) { setCurrentStep(0); return; }
    setSubmissionStatus('sending'); setLoading(true);
    try {
      const res = await rfqService.createRFQ(buildPayload());
      if (!res.success) throw new Error(res.message);
      setSubmissionStatus('success');
    } catch (err) {
      setFormErrors((p) => ({ ...p, submit: err.response?.data?.message || err.message }));
      setSubmissionStatus('error');
    } finally { setLoading(false); }
  };

  const filteredVendors = vendorList.filter((v) => `${v.name} ${v.email}`.toLowerCase().includes(vendorSearch.toLowerCase()));

  if (submissionStatus === 'success') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-accent-50 border border-accent-200 flex items-center justify-center shadow-accent">
          <CheckCircle size={28} className="text-accent-600" />
        </div>
        <h2 className="text-xl font-bold text-ink-900">RFQ Sent Successfully</h2>
        <p className="text-sm text-ink-400 max-w-sm">Your RFQ has been dispatched to {assignedVendors.length} vendor{assignedVendors.length !== 1 ? 's' : ''}.</p>
        <div className="flex justify-center gap-4 mt-8">
            <button
              onClick={() => { setRfqForm({ title:'', description:'', rfqNumber:'', priority:'Medium', department:'' }); setRfqItems([EMPTY_ITEM()]); setAssignedVendors([]); setAttachments([]); setDeadline(''); setFormErrors({}); setSubmissionStatus('idle'); setCurrentStep(0); }}
              className="px-6 py-2.5 bg-surface-raised text-ink-600 rounded-xl hover:bg-surface-border font-semibold transition-all"
            >
              Create Another
            </button>
            <button
              onClick={() => window.location.href = '/rfqs'}
              className="px-6 py-2.5 bg-brand-500 text-white rounded-xl hover:bg-brand-600 font-semibold shadow-sm transition-all"
            >
              View Active RFQs
            </button>
          </div>
      </div>
    );
  }

  const thCls = 'text-left px-4 py-3 text-[10px] font-bold text-ink-400 uppercase tracking-wider bg-surface-raised';
  const tdCls = 'px-4 py-3';
  const lineCls = 'w-full bg-transparent border-b border-surface-border focus:border-brand-400 text-ink-700 py-1 outline-none placeholder-ink-300 transition-colors text-xs';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-brand-50 border border-brand-100 flex items-center justify-center"><FilePlus size={16} className="text-brand-600" /></div>
            <h1 className="text-2xl font-bold tracking-tight text-ink-900 font-heading">Create RFQ</h1>
          </div>
          <p className="text-sm text-ink-400">Request for Quotation — define items, assign vendors, set deadline.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleSaveDraft} disabled={loading} className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-ink-500 border border-surface-border rounded-xl hover:bg-surface-raised disabled:opacity-40 transition-all">
            <Save size={13} />{submissionStatus === 'saving' ? 'Saving...' : 'Save Draft'}
          </button>
          <button onClick={handleSend} disabled={loading} className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-brand disabled:opacity-40 transition-all active:scale-95">
            <Send size={13} />{submissionStatus === 'sending' ? 'Sending...' : 'Send to Vendors'}
          </button>
        </div>
      </div>

      {formErrors.submit && <ErrorState message={formErrors.submit} onRetry={() => setFormErrors((p) => ({ ...p, submit: null }))} />}

      {/* Steps */}
      <Card hoverable={false}>
        <StepIndicator steps={STEPS} currentStep={currentStep} />
        <div className="flex justify-between mt-5 pt-4 border-t border-surface-border">
          <button onClick={() => setCurrentStep((p) => Math.max(0, p-1))} disabled={currentStep === 0}
            className="flex items-center gap-1.5 text-xs text-ink-400 hover:text-ink-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
            <ChevronRight size={14} className="rotate-180" /> Previous
          </button>
          <button onClick={() => setCurrentStep((p) => Math.min(STEPS.length-1, p+1))} disabled={currentStep === STEPS.length-1}
            className="flex items-center gap-1.5 text-xs text-brand-600 hover:text-brand-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-semibold">
            Next <ChevronRight size={14} />
          </button>
        </div>
      </Card>

      {/* ── STEP 0: Details ─────────────────────────────────────────────────── */}
      {currentStep === 0 && (
        <Card title="RFQ Details" subtitle="Title, priority, deadline and attachments" hoverable={false}
          headerActions={<span className="text-[10px] font-mono text-ink-300 bg-surface-raised border border-surface-border px-2 py-1 rounded-lg">{rfqForm.rfqNumber || 'Auto-generated'}</span>}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2"><label className={labelCls}>RFQ Title *</label><input value={rfqForm.title} onChange={(e) => setRfqForm((p) => ({ ...p, title: e.target.value }))} placeholder="e.g. Q3 Office Supplies Procurement" className={inputCls} />{formErrors.title && <p className={errorCls}>{formErrors.title}</p>}</div>
            <div className="md:col-span-2"><label className={labelCls}>Description</label><textarea value={rfqForm.description} onChange={(e) => setRfqForm((p) => ({ ...p, description: e.target.value }))} rows={3} placeholder="Describe the procurement requirement..." className={`${inputCls} resize-none`} /></div>
            <div><label className={labelCls}><CalendarDays size={10} className="inline mr-1" />Response Deadline *</label><input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className={inputCls} />{formErrors.deadline && <p className={errorCls}>{formErrors.deadline}</p>}</div>
            <div><label className={labelCls}>Priority</label>
              <select value={rfqForm.priority} onChange={(e) => setRfqForm((p) => ({ ...p, priority: e.target.value }))} className={inputCls}>
                {['Low','Medium','High','Urgent'].map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div><label className={labelCls}>Department</label><input value={rfqForm.department} onChange={(e) => setRfqForm((p) => ({ ...p, department: e.target.value }))} placeholder="IT, Operations, Finance" className={inputCls} /></div>
            <div><label className={labelCls}><Paperclip size={10} className="inline mr-1" />Attachments</label>
              <label className="flex items-center gap-2 cursor-pointer px-3 py-2.5 bg-surface-raised border border-dashed border-surface-border hover:border-brand-400 rounded-xl text-xs text-ink-400 transition-all">
                <Paperclip size={13} /><span>Click to attach files</span>
                <input type="file" multiple className="hidden" onChange={handleFileChange} />
              </label>
              {attachments.length > 0 && (
                <div className="mt-2 space-y-1">
                  {attachments.map((a) => (
                    <div key={a._id} className="flex items-center justify-between bg-surface-raised border border-surface-border rounded-lg px-3 py-1.5 text-[10px]">
                      <span className="text-ink-600 truncate max-w-[200px]">{a.name}</span>
                      <button onClick={() => setAttachments((p) => p.filter((x) => x._id !== a._id))} className="text-ink-300 hover:text-red-500 ml-2"><X size={11} /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* ── STEP 1: Line Items ──────────────────────────────────────────────── */}
      {currentStep === 1 && (
        <Card title="Line Items" subtitle="Products or services you're requesting quotations for" hoverable={false}
          headerActions={<button onClick={addItem} className="flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors"><Plus size={13} /> Add Row</button>}>
          {formErrors.items && <p className="text-xs text-red-500 mb-3">{formErrors.items}</p>}
          <div className="overflow-x-auto border border-surface-border rounded-xl">
            <table className="w-full border-collapse text-xs">
              <thead><tr className="border-b border-surface-border">
                {['Description','Unit','Quantity','Est. Unit Price','Remarks',''].map((h, i) => (
                  <th key={i} className={`${thCls} ${i === 5 ? 'w-8' : i >= 1 ? 'min-w-[90px]' : 'min-w-[200px]'}`}>{h}</th>
                ))}
              </tr></thead>
              <tbody className="divide-y divide-surface-border">
                {rfqItems.map((item, idx) => (
                  <tr key={item._id} className="hover:bg-brand-50/30 transition-colors">
                    <td className={tdCls}><input value={item.description} onChange={(e) => updateItem(item._id,'description',e.target.value)} placeholder={`Item ${idx+1}`} className={lineCls} /></td>
                    <td className={tdCls}><input value={item.unit} onChange={(e) => updateItem(item._id,'unit',e.target.value)} placeholder="pcs/kg" className={lineCls} /></td>
                    <td className={tdCls}><input type="number" min="0" value={item.quantity} onChange={(e) => updateItem(item._id,'quantity',e.target.value)} placeholder="0" className={lineCls} /></td>
                    <td className={tdCls}><input type="number" min="0" value={item.estimatedUnitPrice} onChange={(e) => updateItem(item._id,'estimatedUnitPrice',e.target.value)} placeholder="₹0.00" className={lineCls} /></td>
                    <td className={tdCls}><input value={item.remarks} onChange={(e) => updateItem(item._id,'remarks',e.target.value)} placeholder="Optional" className={lineCls} /></td>
                    <td className={tdCls}><button onClick={() => removeItem(item._id)} className="p-1 text-ink-300 hover:text-red-500 rounded transition-colors"><Trash2 size={13} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button onClick={addItem} className="mt-4 flex items-center gap-2 w-full justify-center py-3 border border-dashed border-surface-border hover:border-brand-400 rounded-xl text-xs text-ink-400 hover:text-brand-600 transition-all">
            <Plus size={13} /> Add Another Item
          </button>
        </Card>
      )}

      {/* ── STEP 2: Assign Vendors ──────────────────────────────────────────── */}
      {currentStep === 2 && (
        <Card title="Assign Vendors" subtitle="Select vendors to receive this RFQ" hoverable={false}
          headerActions={<span className="text-xs text-ink-400 bg-surface-raised border border-surface-border px-2.5 py-1 rounded-lg font-semibold">{assignedVendors.length} selected</span>}>
          {formErrors.vendors && <p className="text-xs text-red-500 mb-3">{formErrors.vendors}</p>}
          <div className="relative mb-4">
            <input value={vendorSearch} onChange={(e) => setVendorSearch(e.target.value)} placeholder="Search vendors..." className={inputCls} />
          </div>
          {filteredVendors.length === 0 ? (
            <div className="text-center py-8 text-ink-300 text-xs"><Users size={24} className="mx-auto mb-2 opacity-30" /><p>No vendors available yet.</p></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto pr-1">
              {filteredVendors.map((v) => {
                const sel = assignedVendors.includes(v._id);
                return (
                  <div key={v._id} onClick={() => toggleVendor(v._id)}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${sel ? 'bg-brand-50 border-brand-300 shadow-sm' : 'bg-white border-surface-border hover:border-brand-200 hover:bg-brand-50/40'}`}>
                    <div className={`w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center transition-all ${sel ? 'bg-brand-600 border-brand-600' : 'border-ink-300'}`}>
                      {sel && <CheckCircle size={10} className="text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-ink-800 truncate">{v.name}</p>
                      <p className="text-[10px] text-ink-400 truncate">{v.email}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      )}

      {/* ── STEP 3: Review ──────────────────────────────────────────────────── */}
      {currentStep === 3 && (
        <div className="space-y-4">
          <Card title="Review & Confirm" subtitle="Verify all details before sending" hoverable={false}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
              <div className="space-y-2.5 p-4 bg-surface-raised rounded-xl border border-surface-border">
                <p className={labelCls}>RFQ Details</p>
                {[['Title', rfqForm.title],['Priority',rfqForm.priority],['Department',rfqForm.department],['Deadline',deadline ? new Date(deadline).toLocaleDateString('en-IN',{day:'2-digit',month:'long',year:'numeric'}) : '—']].map(([k,v]) => (
                  <p key={k} className="text-ink-600"><span className="text-ink-400">{k}: </span>{v || '—'}</p>
                ))}
              </div>
              <div className="space-y-2.5 p-4 bg-surface-raised rounded-xl border border-surface-border">
                <p className={labelCls}>Summary</p>
                {[['Line Items', rfqItems.filter((i) => i.description).length],['Vendors Assigned',assignedVendors.length],['Attachments',attachments.length]].map(([k,v]) => (
                  <p key={k} className="text-ink-600"><span className="text-ink-400">{k}: </span><span className="font-semibold text-brand-700">{v}</span></p>
                ))}
              </div>
            </div>
            {Object.entries(formErrors).filter(([k]) => k !== 'submit').length > 0 && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-xs font-semibold text-red-600 mb-1">Please fix these issues:</p>
                {Object.entries(formErrors).filter(([k]) => k !== 'submit').map(([k, v]) => (
                  <p key={k} className="text-[11px] text-red-500">• {v}</p>
                ))}
              </div>
            )}
          </Card>
          <div className="flex justify-end gap-3">
            <button onClick={handleSaveDraft} disabled={loading} className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-ink-500 border border-surface-border rounded-xl hover:bg-surface-raised disabled:opacity-40 transition-all"><Save size={13} /> Save Draft</button>
            <button onClick={handleSend} disabled={loading} className="flex items-center gap-2 px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-brand disabled:opacity-40 transition-all active:scale-95"><Send size={13} />{loading ? 'Sending...' : 'Send to Vendors'}</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RFQCreationPage;
