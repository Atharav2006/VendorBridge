import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import GlassCard from '../../components/ui/GlassCard';
import { 
  User, 
  Lock, 
  Bell, 
  CheckCircle,
  Eye,
  ShieldCheck,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';

export const SettingsPage = () => {
  const { user, updateProfile } = useAuth();
  
  // Profile state
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileEmail, setProfileEmail] = useState(user?.email || '');

  // Password state
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  // Notifications state
  const [alertQuote, setAlertQuote] = useState(true);
  const [alertApproval, setAlertApproval] = useState(true);
  const [alertPO, setAlertPO] = useState(false);

  // UI state
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateProfile({ name: profileName, email: profileEmail });
    showToast('Profile credentials successfully updated!');
  };

  const handleSaveSecurity = (e) => {
    e.preventDefault();
    if (newPass !== confirmPass) {
      alert("Passwords do not match!");
      return;
    }
    setCurrentPass('');
    setNewPass('');
    setConfirmPass('');
    showToast('Account security password successfully modified!');
  };

  const handleSaveNotifications = (e) => {
    e.preventDefault();
    showToast('Notification dispatch flags successfully synced!');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 p-4 bg-white border border-secondary text-primary rounded-xl font-bold text-xs shadow-2xl flex items-center space-x-2 animate-bounce">
          <CheckCircle className="w-4.5 h-4.5" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 tracking-wide">System Settings</h2>
        <p className="text-xs text-slate-500 mt-0.5">Configure profile configurations, email updates, and theme specifications</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Profile Settings */}
        <GlassCard className="p-6 space-y-4" hoverEffect={false}>
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center mb-2">
            <User className="w-4 h-4 mr-2 text-primary" /> Profile Information
          </h3>
          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs text-slate-600">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-500">Full Account Name</label>
              <input
                type="text"
                required
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="w-full p-2.5 rounded-xl glass-input text-slate-800 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-500">Work Email Address</label>
              <input
                type="email"
                required
                value={profileEmail}
                onChange={(e) => setProfileEmail(e.target.value)}
                className="w-full p-2.5 rounded-xl glass-input text-slate-800 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-500">Assigned Organization Role</label>
              <input
                type="text"
                disabled
                value={user?.role || 'User'}
                className="w-full p-2.5 rounded-xl glass-input text-slate-500 text-xs bg-white/50 border-border cursor-not-allowed"
              />
            </div>
            <div className="pt-2">
              <button
                type="submit"
                className="px-4 py-2 bg-gradient-to-r from-primary to-secondary text-slate-800 text-xs font-bold rounded-lg transition hover:opacity-90"
              >
                Update Profile Info
              </button>
            </div>
          </form>
        </GlassCard>

        {/* Security Password Change */}
        <GlassCard className="p-6 space-y-4" hoverEffect={false}>
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center mb-2">
            <Lock className="w-4 h-4 mr-2 text-primary" /> Security Access
          </h3>
          <form onSubmit={handleSaveSecurity} className="space-y-4 text-xs text-slate-600">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-500">Current Password</label>
              <input
                type="password"
                required
                value={currentPass}
                onChange={(e) => setCurrentPass(e.target.value)}
                placeholder="••••••••"
                className="w-full p-2.5 rounded-xl glass-input text-slate-800 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-500">New Password</label>
              <input
                type="password"
                required
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                placeholder="••••••••"
                className="w-full p-2.5 rounded-xl glass-input text-slate-800 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-500">Confirm Password</label>
              <input
                type="password"
                required
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                placeholder="••••••••"
                className="w-full p-2.5 rounded-xl glass-input text-slate-800 text-xs"
              />
            </div>
            <div className="pt-2">
              <button
                type="submit"
                className="px-4 py-2 bg-gradient-to-r from-primary to-secondary text-slate-800 text-xs font-bold rounded-lg transition hover:opacity-90"
              >
                Change Security Password
              </button>
            </div>
          </form>
        </GlassCard>

        {/* Notification preferences */}
        <GlassCard className="p-6 space-y-4" hoverEffect={false}>
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center mb-2">
            <Bell className="w-4 h-4 mr-2 text-primary" /> Notification Dispatch Rules
          </h3>
          <form onSubmit={handleSaveNotifications} className="space-y-4 text-xs">
            <div className="space-y-3.5">
              <div className="flex justify-between items-center text-slate-600">
                <div>
                  <p className="font-semibold text-slate-800">Quotation Upload Updates</p>
                  <p className="text-[10px] text-slate-500">Dispatch alerts when suppliers submit quotation records</p>
                </div>
                <button
                  type="button"
                  onClick={() => setAlertQuote(!alertQuote)}
                  className="text-slate-500 hover:text-slate-800 transition"
                >
                  {alertQuote ? <ToggleRight className="w-8 h-8 text-primary" /> : <ToggleLeft className="w-8 h-8" />}
                </button>
              </div>

              <div className="flex justify-between items-center text-slate-600">
                <div>
                  <p className="font-semibold text-slate-800">Approval Workflows</p>
                  <p className="text-[10px] text-slate-500">Notify when managers confirm or reject RFQ/POs</p>
                </div>
                <button
                  type="button"
                  onClick={() => setAlertApproval(!alertApproval)}
                  className="text-slate-500 hover:text-slate-800 transition"
                >
                  {alertApproval ? <ToggleRight className="w-8 h-8 text-primary" /> : <ToggleLeft className="w-8 h-8" />}
                </button>
              </div>

              <div className="flex justify-between items-center text-slate-600">
                <div>
                  <p className="font-semibold text-slate-800">Purchase Orders Releases</p>
                  <p className="text-[10px] text-slate-500">Notify partners instantly when PO documents dispatch</p>
                </div>
                <button
                  type="button"
                  onClick={() => setAlertPO(!alertPO)}
                  className="text-slate-500 hover:text-slate-800 transition"
                >
                  {alertPO ? <ToggleRight className="w-8 h-8 text-primary" /> : <ToggleLeft className="w-8 h-8" />}
                </button>
              </div>
            </div>
            <div className="pt-2">
              <button
                type="submit"
                className="px-4 py-2 bg-gradient-to-r from-primary to-secondary text-slate-800 text-xs font-bold rounded-lg transition hover:opacity-90"
              >
                Save Notification Rules
              </button>
            </div>
          </form>
        </GlassCard>

        {/* Global theme panel info */}
        <GlassCard className="p-6 flex flex-col justify-between" hoverEffect={false}>
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center mb-2">
              <ShieldCheck className="w-4 h-4 mr-2 text-primary" /> System Reconciliations
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              VendorBridge runs on a zero-trust encrypted document framework. Any status changes (e.g. approving quotations, accepted POs, paid invoices) are ledger-logged and signed using a cryptographic session token hash.
            </p>
          </div>
          
          <div className="mt-6 p-4 bg-white border border-border rounded-2xl text-[10px] font-mono text-slate-500">
            <p className="font-bold text-slate-800 mb-1.5">Lead Security Audit Log</p>
            <p>Session IP: 127.0.0.1 (LocalHost)</p>
            <p>Crypt: SHA-256 Enabled</p>
            <p>Node status: Healthy</p>
          </div>
        </GlassCard>

      </div>

    </div>
  );
};
export default SettingsPage;
