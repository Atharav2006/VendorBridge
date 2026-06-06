import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import GlassCard from '../../components/ui/GlassCard';
import Modal from '../../components/ui/Modal';
import { 
  Search, 
  Plus, 
  Download, 
  Trash2, 
  Edit, 
  Eye, 
  Star, 
  X,
  Filter,
  ChevronDown
} from 'lucide-react';

export const VendorList = () => {
  const { vendors, addVendor, updateVendor, deleteVendor, logActivity } = useApp();
  const { user } = useAuth();
  
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('Manufacturing');
  const [formGst, setFormGst] = useState('');
  const [formContact, setFormContact] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formStatus, setFormStatus] = useState('Active');
  const [formDescription, setFormDescription] = useState('');

  // Extract unique categories for filter
  const categories = ['All', ...new Set(vendors.map(v => v.category))];

  // Search & Filter logic
  const filteredVendors = vendors
    .filter(v => {
      const matchSearch = v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          v.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          v.gst.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCategory = categoryFilter === 'All' || v.category === categoryFilter;
      const matchStatus = statusFilter === 'All' || v.status === statusFilter;
      return matchSearch && matchCategory && matchStatus;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'name') comparison = a.name.localeCompare(b.name);
      else if (sortBy === 'rating') comparison = b.rating - a.rating; // high to low default
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  // Pagination calculations
  const totalPages = Math.ceil(filteredVendors.length / itemsPerPage);
  const paginatedVendors = filteredVendors.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle CSV Export
  const handleExportCSV = () => {
    const headers = ['Name', 'Category', 'GST', 'Contact Person', 'Email', 'Phone', 'Status', 'Rating'];
    const rows = filteredVendors.map(v => [
      v.name,
      v.category,
      v.gst,
      v.contactPerson,
      v.email,
      v.phone,
      v.status,
      v.rating
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `VendorBridge_Vendors_Report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    logActivity(user.name, user.role, 'Exported Vendors Directory to CSV', 'Vendors Ledger', 'ALL');
  };

  // Add operations
  const handleOpenAdd = () => {
    setFormName('');
    setFormCategory('Manufacturing');
    setFormGst('');
    setFormContact('');
    setFormEmail('');
    setFormPhone('');
    setFormStatus('Active');
    setFormDescription('');
    setIsAddOpen(true);
  };

  const handleCreate = (e) => {
    e.preventDefault();
    if (!formName || !formGst || !formContact || !formEmail || !formPhone) {
      alert("Please fill out all required vendor details (Name, GST, Contact, Email, Phone).");
      return;
    }

    const newVendor = addVendor({
      name: formName,
      category: formCategory,
      gst: formGst,
      contactPerson: formContact,
      email: formEmail,
      phone: formPhone,
      status: formStatus,
      profile: {
        description: formDescription || 'Custom description onboarding',
        founded: '2026',
        website: `www.${formName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`
      }
    });

    logActivity(user.name, user.role, 'Added Vendor', newVendor.name, newVendor.id);
    setIsAddOpen(false);
  };

  // Edit operations
  const handleOpenEdit = (v) => {
    setEditingVendor(v);
    setFormName(v.name);
    setFormCategory(v.category);
    setFormGst(v.gst);
    setFormContact(v.contactPerson);
    setFormEmail(v.email);
    setFormPhone(v.phone);
    setFormStatus(v.status);
    setFormDescription(v.profile?.description || '');
    setIsEditOpen(true);
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    if (!formName || !formGst || !formContact || !formEmail || !formPhone || !editingVendor) {
      alert("Please fill out all required vendor details (Name, GST, Contact, Email, Phone).");
      return;
    }

    updateVendor(editingVendor.id, {
      name: formName,
      category: formCategory,
      gst: formGst,
      contactPerson: formContact,
      email: formEmail,
      phone: formPhone,
      status: formStatus,
      profile: {
        ...editingVendor.profile,
        description: formDescription
      }
    });

    logActivity(user.name, user.role, 'Updated Vendor Profile', formName, editingVendor.id);
    setIsEditOpen(false);
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Are you sure you want to remove ${name}?`)) {
      deleteVendor(id);
      logActivity(user.name, user.role, 'Removed Vendor', name, id);
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title Controls Area */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-wide">Enterprise Vendor Directory</h2>
          <p className="text-xs text-slate-500 mt-0.5">Manage certifications, ratings, and contract profiles</p>
        </div>
        <div className="flex space-x-2.5">
          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-2 px-4 py-2.5 bg-white border border-border hover:border-slate-700 hover:text-slate-800 rounded-xl text-xs font-bold text-slate-600 transition"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-primary to-secondary hover:opacity-90 rounded-xl text-xs font-bold text-slate-800 shadow-md shadow-secondary/15 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Onboard Vendor</span>
          </button>
        </div>
      </div>

      {/* Filters Card */}
      <GlassCard className="p-4 flex flex-col md:flex-row md:items-center gap-4" hoverEffect={false}>
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by vendor name, contact person, GSTIN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl glass-input text-slate-800 text-xs"
          />
        </div>

        {/* Category Filter */}
        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-500 font-semibold flex items-center">
            <Filter className="w-3.5 h-3.5 mr-1" /> Category:
          </span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl glass-input text-slate-800 text-xs bg-white cursor-pointer"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-500 font-semibold">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl glass-input text-slate-800 text-xs bg-white cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Onboarding">Onboarding</option>
            <option value="Suspended">Suspended</option>
          </select>
        </div>
      </GlassCard>

      {/* Table grid layout */}
      <GlassCard className="p-0 overflow-hidden" hoverEffect={false}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50">
                <th className="p-4 cursor-pointer hover:text-slate-800 transition" onClick={() => handleSort('name')}>
                  Vendor Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="p-4">Category</th>
                <th className="p-4">GSTIN ID</th>
                <th className="p-4">Contact Details</th>
                <th className="p-4 cursor-pointer hover:text-slate-800 transition" onClick={() => handleSort('rating')}>
                  Compliance Rating {sortBy === 'rating' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-xs">
              {paginatedVendors.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-500">
                    No vendor profiles match the active search parameters.
                  </td>
                </tr>
              ) : (
                paginatedVendors.map(vendor => (
                  <tr key={vendor.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-bold text-slate-800">
                      <Link to={`/vendors/${vendor.id}`} className="hover:text-primary hover:underline block">
                        {vendor.name}
                      </Link>
                    </td>
                    <td className="p-4 text-slate-600">{vendor.category}</td>
                    <td className="p-4 text-slate-500 font-mono text-[11px]">{vendor.gst}</td>
                    <td className="p-4">
                      <p className="font-semibold text-slate-700">{vendor.contactPerson}</p>
                      <p className="text-[10px] text-slate-500">{vendor.email}</p>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center text-amber-500 space-x-0.5">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span className="font-bold text-slate-700 text-xs ml-1">{(vendor.rating || 0).toFixed(1)}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`text-[10px] px-2.5 py-0.5 rounded font-black border ${
                        vendor.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                        vendor.status === 'Onboarding' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}>
                        {vendor.status}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-1.5">
                      <Link
                        to={`/vendors/${vendor.id}`}
                        className="inline-flex items-center p-1.5 hover:bg-slate-50 text-slate-500 hover:text-slate-800 rounded-lg transition"
                        title="View profile"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleOpenEdit(vendor)}
                        className="inline-flex items-center p-1.5 hover:bg-slate-50 text-slate-500 hover:text-slate-800 rounded-lg transition"
                        title="Edit profile"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(vendor.id, vendor.name)}
                        className="inline-flex items-center p-1.5 hover:bg-red-950/20 text-slate-500 hover:text-red-400 rounded-lg transition"
                        title="Remove profile"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-border bg-white/10">
            <span className="text-[10px] text-slate-500">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredVendors.length)} of {filteredVendors.length} entries
            </span>
            <div className="flex space-x-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 disabled:opacity-30 rounded-lg text-xs transition"
              >
                Previous
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 disabled:opacity-30 rounded-lg text-xs transition"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </GlassCard>

      {/* ADD VENDOR MODAL */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Onboard New Vendor Profile">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5">
              <label className="text-xs font-semibold text-slate-600">Company Legal Name</label>
              <input
                type="text"
                required
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Acme Industrial Corp"
                className="w-full p-2.5 rounded-xl glass-input text-slate-800 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600">Operations Category</label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                className="w-full p-2.5 rounded-xl glass-input text-slate-800 text-xs bg-white"
              >
                <option value="Manufacturing">Manufacturing</option>
                <option value="Logistics">Logistics</option>
                <option value="IT Services">IT Services</option>
                <option value="Aerospace">Aerospace</option>
                <option value="Pharmaceuticals">Pharmaceuticals</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600">GSTIN Registration</label>
              <input
                type="text"
                required
                value={formGst}
                onChange={(e) => setFormGst(e.target.value)}
                placeholder="e.g. 27AACCA1234F1Z1"
                className="w-full p-2.5 rounded-xl glass-input text-slate-800 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600">Primary Contact Person</label>
              <input
                type="text"
                required
                value={formContact}
                onChange={(e) => setFormContact(e.target.value)}
                placeholder="John Doe"
                className="w-full p-2.5 rounded-xl glass-input text-slate-800 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600">Status</label>
              <select
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value)}
                className="w-full p-2.5 rounded-xl glass-input text-slate-800 text-xs bg-white"
              >
                <option value="Active">Active</option>
                <option value="Onboarding">Onboarding</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600">Contact Email</label>
              <input
                type="email"
                required
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                placeholder="john@company.com"
                className="w-full p-2.5 rounded-xl glass-input text-slate-800 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600">Contact Phone</label>
              <input
                type="text"
                required
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                placeholder="+1 (555) 012-3456"
                className="w-full p-2.5 rounded-xl glass-input text-slate-800 text-xs"
              />
            </div>
            <div className="col-span-2 space-y-1.5">
              <label className="text-xs font-semibold text-slate-600">Company Summary Description</label>
              <textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Describe product supplies and service scopes..."
                className="w-full h-20 p-2.5 rounded-xl glass-input text-slate-800 text-xs resize-none"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-800 rounded-lg text-xs font-bold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-slate-800 rounded-lg text-xs font-bold transition"
            >
              Register Vendor
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT VENDOR MODAL */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Modify Vendor Profile Details">
        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5">
              <label className="text-xs font-semibold text-slate-600">Company Name</label>
              <input
                type="text"
                required
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="w-full p-2.5 rounded-xl glass-input text-slate-800 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600">Category</label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                className="w-full p-2.5 rounded-xl glass-input text-slate-800 text-xs bg-white"
              >
                <option value="Manufacturing">Manufacturing</option>
                <option value="Logistics">Logistics</option>
                <option value="IT Services">IT Services</option>
                <option value="Aerospace">Aerospace</option>
                <option value="Pharmaceuticals">Pharmaceuticals</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600">GSTIN</label>
              <input
                type="text"
                required
                value={formGst}
                onChange={(e) => setFormGst(e.target.value)}
                className="w-full p-2.5 rounded-xl glass-input text-slate-800 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600">Primary Contact Person</label>
              <input
                type="text"
                required
                value={formContact}
                onChange={(e) => setFormContact(e.target.value)}
                className="w-full p-2.5 rounded-xl glass-input text-slate-800 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600">Status</label>
              <select
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value)}
                className="w-full p-2.5 rounded-xl glass-input text-slate-800 text-xs bg-white"
              >
                <option value="Active">Active</option>
                <option value="Onboarding">Onboarding</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600">Contact Email</label>
              <input
                type="email"
                required
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                className="w-full p-2.5 rounded-xl glass-input text-slate-800 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600">Contact Phone</label>
              <input
                type="text"
                required
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                className="w-full p-2.5 rounded-xl glass-input text-slate-800 text-xs"
              />
            </div>
            <div className="col-span-2 space-y-1.5">
              <label className="text-xs font-semibold text-slate-600">Profile Details</label>
              <textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                className="w-full h-20 p-2.5 rounded-xl glass-input text-slate-800 text-xs resize-none"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={() => setIsEditOpen(false)}
              className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-800 rounded-lg text-xs font-bold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-primary to-secondary text-slate-800 rounded-lg text-xs font-bold transition"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
export default VendorList;
