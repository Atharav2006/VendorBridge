import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import GlassCard from '../../components/ui/GlassCard';
import { 
  ArrowLeft, 
  Building2, 
  Calendar, 
  Globe, 
  MapPin, 
  Phone, 
  Mail, 
  Star, 
  History,
  FileCheck,
  TrendingUp
} from 'lucide-react';

export const VendorDetail = () => {
  const { id } = useParams();
  const { vendors, rfqs, activities } = useApp();

  // Find vendor profile
  const vendor = vendors.find(v => v.id === id);

  if (!vendor) {
    return (
      <div className="text-center py-12 space-y-4">
        <h3 className="text-xl font-bold text-slate-800">Vendor profile not found</h3>
        <Link to="/vendors" className="text-xs text-primary hover:underline flex items-center justify-center">
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Vendor Directory
        </Link>
      </div>
    );
  }

  // Filter RFQs assigned to this vendor
  const assignedRfqs = rfqs.filter(r => r.assignedVendors.includes(vendor.id));

  // Filter activity logs related to this vendor
  const vendorActivities = activities.filter(
    act => act.entityId === vendor.id || act.action.toLowerCase().includes(vendor.name.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Back button */}
      <div>
        <Link 
          to="/vendors" 
          className="inline-flex items-center space-x-1 text-xs text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Directory</span>
        </Link>
      </div>

      {/* Profile Header Block */}
      <GlassCard className="p-6 md:p-8" hoverEffect={false}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary/30 to-secondary/30 border border-border flex items-center justify-center text-slate-800">
              <Building2 className="w-8 h-8 text-primary" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-wide">{vendor.name}</h2>
                <span className={`text-[10px] px-2.5 py-0.5 rounded font-black border ${
                  vendor.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                  vendor.status === 'Onboarding' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
                }`}>
                  {vendor.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">{vendor.category} // GSTIN: {vendor.gst}</p>
            </div>
          </div>

          <div className="bg-slate-50 border border-border rounded-2xl p-4 flex items-center space-x-4">
            <div className="text-center">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Compliance Score</span>
              <div className="flex items-center justify-center text-amber-500 mt-1">
                <Star className="w-4 h-4 fill-current mr-1" />
                <span className="text-lg font-black text-slate-800">{(vendor.rating || 0).toFixed(1)}</span>
                <span className="text-xs text-slate-500">/5.0</span>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: General Profile Description */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* About profile */}
          <GlassCard className="p-6" hoverEffect={false}>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-border pb-2.5">
              Company Background
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {vendor.profile?.description || 'No detailed summary registered. Active vendor within our procurement network.'}
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 text-xs text-slate-500">
              <div className="flex items-center space-x-2.5">
                <Calendar className="w-4 h-4 text-slate-500" />
                <span>Founded: <span className="text-slate-800 font-medium">{vendor.profile?.founded || 'N/A'}</span></span>
              </div>
              <div className="flex items-center space-x-2.5">
                <Globe className="w-4 h-4 text-slate-500" />
                <span>Website:{' '}
                  <a href={`https://${vendor.profile?.website}`} target="_blank" rel="noreferrer" className="text-primary hover:underline font-medium">
                    {vendor.profile?.website || 'N/A'}
                  </a>
                </span>
              </div>
              <div className="col-span-1 sm:col-span-2 flex items-start space-x-2.5">
                <MapPin className="w-4 h-4 text-slate-500 mt-0.5" />
                <span>Office Address: <span className="text-slate-800 font-medium">{vendor.profile?.address || 'N/A'}</span></span>
              </div>
            </div>
          </GlassCard>

          {/* Active RFQ participations */}
          <GlassCard className="p-6" hoverEffect={false}>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-border pb-2.5">
              Assigned RFQs ({assignedRfqs.length})
            </h3>
            {assignedRfqs.length === 0 ? (
              <p className="text-xs text-slate-500 py-4">This vendor is not currently assigned to any active RFQs.</p>
            ) : (
              <div className="divide-y divide-border">
                {assignedRfqs.map(rfq => (
                  <div key={rfq.id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                    <div>
                      <Link to="/rfqs" className="text-xs font-bold text-slate-800 hover:text-primary hover:underline">
                        {rfq.title}
                      </Link>
                      <p className="text-[10px] text-slate-500 mt-0.5">Deadline: {rfq.deadline} // Created: {rfq.createdAt}</p>
                    </div>
                    <span className={`text-[9px] px-2 py-0.5 rounded font-black border ${
                      rfq.status === 'Open' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                      rfq.status === 'Compared' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-slate-500/10 text-slate-500 border-slate-500/20'
                    }`}>
                      {rfq.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </div>

        {/* Right Side: Contact & Audit Trail */}
        <div className="space-y-6">
          {/* Contact Panel */}
          <GlassCard className="p-6" hoverEffect={false}>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-border pb-2.5">
              Point of Contact
            </h3>
            <div className="space-y-4 text-xs">
              <div>
                <p className="text-slate-500 text-[10px] uppercase font-bold">Contact Name</p>
                <p className="text-sm font-bold text-slate-800 mt-0.5">{vendor.contactPerson}</p>
              </div>
              <div className="flex items-center space-x-2.5 py-1">
                <Mail className="w-4 h-4 text-slate-500" />
                <span className="text-slate-600 select-all">{vendor.email}</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <Phone className="w-4 h-4 text-slate-500" />
                <span className="text-slate-600">{vendor.phone}</span>
              </div>
            </div>
          </GlassCard>

          {/* Audit History */}
          <GlassCard className="p-6" hoverEffect={false}>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-border pb-2.5">
              Transaction History
            </h3>
            {vendorActivities.length === 0 ? (
              <p className="text-xs text-slate-500 py-4">No logged activity found for this vendor.</p>
            ) : (
              <div className="space-y-4 max-h-60 overflow-y-auto pr-1">
                {vendorActivities.map(act => (
                  <div key={act.id} className="relative pl-4 border-l border-border pb-1 text-xs">
                    <span className="absolute left-[-4.5px] top-1.5 w-2 h-2 rounded-full bg-primary" />
                    <p className="text-slate-600 font-medium">{act.action}</p>
                    <p className="text-[10px] text-slate-500">{new Date(act.timestamp).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </div>
      </div>

    </div>
  );
};
export default VendorDetail;
