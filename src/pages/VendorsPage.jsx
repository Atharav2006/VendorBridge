import React, { useState, useEffect, useCallback } from 'react';
import vendorService from '../services/vendorService';
import {
  Building2, Plus, Search, X, ChevronLeft, ChevronRight,
  Star, Mail, Phone, Globe, MapPin, Tag,
} from 'lucide-react';
import Card from '../components/common/Card';
import Table from '../components/common/Table';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorState from '../components/common/ErrorState';

// ─── Shared input styling ─────────────────────────────────────────────────────
const inputCls = 'w-full bg-white border border-surface-border focus:border-brand-400 focus:ring-2 focus:ring-brand-100 text-ink-700 text-xs rounded-xl px-3 py-2.5 outline-none transition-all placeholder-ink-300';
const labelCls = 'block text-[10px] font-bold text-ink-400 uppercase tracking-wider mb-1.5';

// ─── Status Badge ─────────────────────────────────────────────────────────────
const VendorStatusBadge = ({ status }) => {
  const map = {
    Active:      'bg-accent-50  text-accent-700  border-accent-200',
    Inactive:    'bg-slate-50   text-slate-500   border-slate-200',
    Blacklisted: 'bg-red-50     text-red-600     border-red-200',
    Pending:     'bg-amber-50   text-amber-700   border-amber-200',
  };
  return (
    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${map[status] || 'bg-slate-50 text-slate-500 border-slate-200'}`}>
      {status}
    </span>
  );
};

// ─── Star Rating ──────────────────────────────────────────────────────────────
const StarRating = ({ rating = 0 }) => (
  <div className="flex items-center gap-0.5">
    {[1,2,3,4,5].map((s) => (
      <Star key={s} size={11} className={s <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-200'} />
    ))}
    <span className="ml-1 text-[10px] text-ink-300">{Number(rating).toFixed(1)}</span>
  </div>
);

// ─── Vendor Detail Modal ──────────────────────────────────────────────────────
const VendorDetailModal = ({ vendor, onClose }) => {
  if (!vendor) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink-900/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-xl bg-white border border-surface-border rounded-3xl shadow-card-lg overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-surface-border bg-surface-raised/50">
          <div>
            <h2 className="text-base font-bold text-ink-900">{vendor.name}</h2>
            <p className="text-[10px] text-ink-300 font-mono mt-0.5">{vendor._id}</p>
          </div>
          <div className="flex items-center gap-3">
            <VendorStatusBadge status={vendor.status} />
            <button onClick={onClose} className="p-1.5 rounded-lg text-ink-300 hover:text-ink-700 hover:bg-surface-raised transition-all">
              <X size={15} />
            </button>
          </div>
        </div>
        {/* Body */}
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Mail,   label: 'Email',    value: vendor.email },
              { icon: Phone,  label: 'Phone',    value: vendor.phone },
              { icon: Globe,  label: 'Website',  value: vendor.website },
              { icon: MapPin, label: 'Location', value: [vendor.city, vendor.country].filter(Boolean).join(', ') },
              { icon: Tag,    label: 'Category', value: vendor.category },
              { icon: Tag,    label: 'GST Number', value: vendor.gstNumber },
            ].filter((f) => f.value).map((f) => (
              <div key={f.label} className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-brand-50 flex items-center justify-center shrink-0">
                  <f.icon size={13} className="text-brand-500" />
                </div>
                <div>
                  <p className="text-[10px] text-ink-300 uppercase font-bold tracking-wider">{f.label}</p>
                  <p className="text-xs text-ink-700 mt-0.5 font-medium">{f.value}</p>
                </div>
              </div>
            ))}
          </div>
          {vendor.rating !== undefined && (
            <div>
              <p className={labelCls}>Vendor Rating</p>
              <StarRating rating={vendor.rating} />
            </div>
          )}
          {vendor.notes && (
            <div>
              <p className={labelCls}>Internal Notes</p>
              <p className="text-xs text-ink-500 bg-surface-raised border border-surface-border rounded-xl p-3 leading-relaxed">{vendor.notes}</p>
            </div>
          )}
          <div className="flex justify-between text-[10px] text-ink-300 pt-3 border-t border-surface-border">
            <span>Created: {vendor.createdAt ? new Date(vendor.createdAt).toLocaleDateString() : '—'}</span>
            <span>Updated: {vendor.updatedAt ? new Date(vendor.updatedAt).toLocaleDateString() : '—'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Add Vendor Modal ─────────────────────────────────────────────────────────
const AddVendorModal = ({ onClose, onSuccess }) => {
  const EMPTY = { name: '', email: '', phone: '', website: '', category: '', city: '', country: '', notes: '', status: 'Active', gstNumber: '' };
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);

  const change = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) { setFormError('Name and email are required.'); return; }
    setSaving(true); setFormError(null);
    try {
      const res = await vendorService.createVendor(form);
      if (res.success) onSuccess(res.data);
      else throw new Error(res.message);
    } catch (err) {
      setFormError(err.response?.data?.message || err.message);
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink-900/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-xl bg-white border border-surface-border rounded-3xl shadow-card-lg animate-slide-up">
        <div className="flex items-center justify-between px-6 py-5 border-b border-surface-border bg-surface-raised/40">
          <h2 className="text-base font-bold text-ink-900">Add New Vendor</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-ink-300 hover:text-ink-700 hover:bg-surface-raised transition-all"><X size={15} /></button>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4">
          {formError && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{formError}</p>}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2"><label className={labelCls}>Vendor Name *</label><input name="name" value={form.name} onChange={change} placeholder="Steel Metals Ltd." className={inputCls} /></div>
            <div><label className={labelCls}>Email *</label><input name="email" type="email" value={form.email} onChange={change} placeholder="contact@vendor.com" className={inputCls} /></div>
            <div><label className={labelCls}>Phone</label><input name="phone" value={form.phone} onChange={change} placeholder="+91 XXXXX XXXXX" className={inputCls} /></div>
            <div><label className={labelCls}>Category</label><input name="category" value={form.category} onChange={change} placeholder="Raw Materials" className={inputCls} /></div>
            <div><label className={labelCls}>GST Number</label><input name="gstNumber" value={form.gstNumber} onChange={change} placeholder="e.g. 22AAAAA0000A1Z5" className={inputCls} /></div>
            <div><label className={labelCls}>Status</label>
              <select name="status" value={form.status} onChange={change} className={inputCls}>
                {['Active','Inactive','Pending','Blacklisted'].map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div><label className={labelCls}>City</label><input name="city" value={form.city} onChange={change} placeholder="Mumbai" className={inputCls} /></div>
            <div><label className={labelCls}>Country</label><input name="country" value={form.country} onChange={change} placeholder="India" className={inputCls} /></div>
            <div className="col-span-2"><label className={labelCls}>Website</label><input name="website" value={form.website} onChange={change} placeholder="https://vendor.com" className={inputCls} /></div>
            <div className="col-span-2"><label className={labelCls}>Notes</label><textarea name="notes" value={form.notes} onChange={change} rows={2} className={`${inputCls} resize-none`} /></div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2.5 text-xs font-semibold text-ink-500 border border-surface-border rounded-xl hover:bg-surface-raised transition-all">Cancel</button>
            <button type="submit" disabled={saving} className="px-5 py-2.5 text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white rounded-xl shadow-brand disabled:opacity-50 transition-all">
              {saving ? 'Creating...' : 'Create Vendor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Vendors Page ─────────────────────────────────────────────────────────────
export const VendorsPage = () => {
  const [vendors, setVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [vendorFilters, setVendorFilters] = useState({ status: '', category: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [vendorPagination, setVendorPagination] = useState({ currentPage: 1, totalPages: 1, totalCount: 0, limit: 10 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchVendors = useCallback(async (page = 1) => {
    setLoading(true); setError(null);
    try {
      const res = await vendorService.getVendors({ page, limit: vendorPagination.limit, search: searchQuery, ...vendorFilters });
      if (res.success) {
        setVendors(res.data || []);
        setVendorPagination((p) => ({ ...p, currentPage: res.pagination?.currentPage || page, totalPages: res.pagination?.totalPages || 1, totalCount: res.pagination?.totalCount || 0 }));
      } else throw new Error(res.message);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally { setLoading(false); }
  }, [searchQuery, vendorFilters, vendorPagination.limit]);

  useEffect(() => { const t = setTimeout(() => fetchVendors(1), 350); return () => clearTimeout(t); }, [searchQuery, vendorFilters]);
  useEffect(() => { fetchVendors(1); }, []);

  const handleRowClick = async (row) => {
    try {
      const res = await vendorService.getVendorById(row._id);
      setSelectedVendor(res.success ? res.data : row);
    } catch { setSelectedVendor(row); }
  };

  const columns = [
    {
      key: 'name', label: 'Vendor Name',
      render: (row) => (
        <div>
          <p className="font-semibold text-ink-800">{row.name}</p>
          <p className="text-[10px] text-ink-300 font-mono">{row._id}</p>
        </div>
      ),
    },
    { key: 'email', label: 'Email' },
    { key: 'category', label: 'Category' },
    { key: 'rating', label: 'Rating', render: (row) => <StarRating rating={row.rating || 0} /> },
    { key: 'status', label: 'Status', render: (row) => <VendorStatusBadge status={row.status} /> },
    {
      key: 'createdAt', label: 'Onboarded',
      render: (row) => row.createdAt ? new Date(row.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—',
    },
    {
      key: 'actions', label: '',
      render: (row) => (
        <button onClick={(e) => { e.stopPropagation(); handleRowClick(row); }} className="text-xs text-brand-600 hover:text-brand-700 font-semibold transition-colors">
          View →
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-brand-50 border border-brand-100 flex items-center justify-center"><Building2 size={16} className="text-brand-600" /></div>
            <h1 className="text-2xl font-bold tracking-tight text-ink-900 font-heading">Vendors</h1>
          </div>
          <p className="text-sm text-ink-400">Manage your supplier network — {vendorPagination.totalCount} vendors registered.</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-brand transition-all active:scale-95">
          <Plus size={14} /> Add Vendor
        </button>
      </div>

      {error && <ErrorState message={error} onRetry={() => fetchVendors(vendorPagination.currentPage)} />}

      {/* Search & Filters */}
      <Card hoverable={false} className="!p-0">
        <div className="px-5 py-4 flex items-center gap-3 flex-wrap">
          <div className="flex-1 min-w-56 relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300 pointer-events-none" />
            <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search vendors..." className="w-full bg-surface-raised border border-surface-border focus:border-brand-400 focus:ring-2 focus:ring-brand-100 text-ink-700 text-xs rounded-xl pl-9 pr-8 py-2.5 outline-none transition-all placeholder-ink-300" />
            {searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-300 hover:text-ink-600"><X size={12} /></button>}
          </div>
          <select value={vendorFilters.status} onChange={(e) => setVendorFilters((p) => ({ ...p, status: e.target.value }))} className="bg-surface-raised border border-surface-border text-ink-500 text-xs rounded-xl px-3 py-2.5 outline-none focus:border-brand-400 transition-all">
            {['','Active','Inactive','Pending','Blacklisted'].map((s) => <option key={s} value={s}>{s || 'All Statuses'}</option>)}
          </select>
          <input value={vendorFilters.category} onChange={(e) => setVendorFilters((p) => ({ ...p, category: e.target.value }))} placeholder="Filter by category" className="bg-surface-raised border border-surface-border focus:border-brand-400 text-ink-500 text-xs rounded-xl px-3 py-2.5 outline-none transition-all placeholder-ink-300 w-44" />
          {(vendorFilters.status || vendorFilters.category || searchQuery) && (
            <button onClick={() => { setSearchQuery(''); setVendorFilters({ status: '', category: '' }); }} className="flex items-center gap-1.5 text-xs text-ink-400 hover:text-ink-700 transition-colors">
              <X size={12} /> Clear
            </button>
          )}
        </div>
      </Card>

      {/* Table */}
      <Table columns={columns} data={vendors} loading={loading} rowKey="_id" onRowClick={handleRowClick}
        emptyTitle="No vendors found" emptyDescription="Add your first vendor or adjust search filters."
        emptyIcon={Building2} onEmptyAction={() => setShowAddModal(true)} emptyActionLabel="Add Vendor"
      />

      {/* Pagination */}
      {vendorPagination.totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-ink-400">
          <span>Page {vendorPagination.currentPage} of {vendorPagination.totalPages} — {vendorPagination.totalCount} vendors</span>
          <div className="flex items-center gap-2">
            <button disabled={vendorPagination.currentPage <= 1} onClick={() => fetchVendors(vendorPagination.currentPage - 1)} className="p-2 rounded-xl border border-surface-border hover:bg-surface-raised disabled:opacity-30 disabled:cursor-not-allowed transition-all"><ChevronLeft size={14} /></button>
            <span className="px-3 py-1.5 rounded-xl bg-surface-raised border border-surface-border font-mono text-ink-700">{vendorPagination.currentPage}</span>
            <button disabled={vendorPagination.currentPage >= vendorPagination.totalPages} onClick={() => fetchVendors(vendorPagination.currentPage + 1)} className="p-2 rounded-xl border border-surface-border hover:bg-surface-raised disabled:opacity-30 disabled:cursor-not-allowed transition-all"><ChevronRight size={14} /></button>
          </div>
        </div>
      )}

      {showAddModal && <AddVendorModal onClose={() => setShowAddModal(false)} onSuccess={(v) => { setShowAddModal(false); setVendors((p) => [v, ...p]); }} />}
      {selectedVendor && <VendorDetailModal vendor={selectedVendor} onClose={() => setSelectedVendor(null)} />}
    </div>
  );
};

export default VendorsPage;
