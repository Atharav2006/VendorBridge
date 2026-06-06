import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import GlassCard from '../../components/ui/GlassCard';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Plus, 
  Trash2, 
  FileText, 
  ListOrdered, 
  Users, 
  Eye, 
  Send 
} from 'lucide-react';

export const RFQCreate = () => {
  const { vendors, addRFQ } = useApp();
  const { user } = useAuth();
  const navigate = useNavigate();

  const activeVendors = vendors.filter(v => v.status === 'Active');

  // Multi-step State
  const [step, setStep] = useState(1);

  // Form States
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  
  const [items, setItems] = useState([
    { id: '1', name: '', qty: 1, unit: 'Units' }
  ]);

  const [assignedVendors, setAssignedVendors] = useState([]);

  // Step 1 Validation
  const isStep1Valid = () => {
    return title.trim() !== '' && description.trim() !== '' && deadline !== '';
  };

  // Step 2 Validation
  const isStep2Valid = () => {
    return items.length > 0 && items.every(it => it.name.trim() !== '' && it.qty > 0);
  };

  // Step 3 Validation
  const isStep3Valid = () => {
    return assignedVendors.length > 0;
  };

  // Dynamic Row operations
  const handleAddItemRow = () => {
    setItems([
      ...items,
      { id: Date.now().toString(), name: '', qty: 1, unit: 'Units' }
    ]);
  };

  const handleRemoveItemRow = (id) => {
    if (items.length === 1) return;
    setItems(items.filter(it => it.id !== id));
  };

  const handleItemChange = (id, field, val) => {
    setItems(items.map(it => {
      if (it.id === id) {
        return { ...it, [field]: val };
      }
      return it;
    }));
  };

  // Vendor Assignment toggle
  const handleToggleVendor = (id) => {
    if (assignedVendors.includes(id)) {
      setAssignedVendors(assignedVendors.filter(vId => vId !== id));
    } else {
      setAssignedVendors([...assignedVendors, id]);
    }
  };

  // Final submit
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isStep1Valid() || !isStep2Valid() || !isStep3Valid()) return;

    addRFQ({
      title,
      description,
      deadline,
      items: items.map((it, idx) => ({ id: `item-${idx}`, name: it.name, quantity: Number(it.qty), unit: it.unit })),
      assignedVendorIds: assignedVendors
    }, user);

    navigate('/rfqs');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Back link */}
      <div>
        <Link to="/rfqs" className="inline-flex items-center space-x-1 text-xs text-slate-500 hover:text-slate-800 transition">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to RFQs</span>
        </Link>
      </div>

      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 tracking-wide">Create RFQ Wizard</h2>
        <p className="text-xs text-slate-500 mt-0.5">Detail specifications and assign verified supplier bid routes</p>
      </div>

      {/* PROGRESS BAR STEPPER */}
      <div className="flex justify-between items-center bg-white/30 p-4 rounded-xl border border-border relative overflow-hidden">
        {[
          { num: 1, label: 'RFQ Details', icon: FileText },
          { num: 2, label: 'Line Items', icon: ListOrdered },
          { num: 3, label: 'Assign Vendors', icon: Users },
          { num: 4, label: 'Preview & Submit', icon: Eye }
        ].map((item, idx) => (
          <div key={item.num} className="flex items-center flex-1 last:flex-none">
            <div className="flex items-center space-x-2 text-left">
              <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border transition ${
                step === item.num ? 'bg-primary text-slate-800 border-primary glow-ring-primary' : 
                step > item.num ? 'bg-secondary border-secondary text-slate-950' : 'bg-white border-border text-slate-500'
              }`}>
                {step > item.num ? <Check className="w-4 h-4" /> : item.num}
              </span>
              <span className={`text-[10px] sm:text-xs font-bold hidden sm:inline ${
                step === item.num ? 'text-slate-800' : 'text-slate-500'
              }`}>
                {item.label}
              </span>
            </div>
            
            {idx < 3 && (
              <div className="flex-1 mx-4 h-0.5 bg-slate-50 hidden sm:block">
                <div 
                  className="h-full bg-secondary transition-all duration-300" 
                  style={{ width: step > item.num ? '100%' : '0%' }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* WIZARD CARD */}
      <GlassCard className="p-6 md:p-8" hoverEffect={false}>
        <AnimatePresence mode="wait">
          
          {/* STEP 1: RFQ Details */}
          {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-4"
            >
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2">Step 1: RFQ Details</h3>
              
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600">RFQ Title</label>
                <input
                  type="text"
                  placeholder="e.g. Standard Steel reinforcement bar procurement"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl glass-input text-slate-800 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600">RFQ Description</label>
                <textarea
                  placeholder="Summarize structural grades, specifications, and scope of materials requested..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full h-28 p-2.5 rounded-xl glass-input text-slate-800 text-xs resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600">Submission Deadline</label>
                <input
                  type="date"
                  value={deadline}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full p-2.5 rounded-xl glass-input text-slate-800 text-xs bg-white cursor-pointer"
                />
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  disabled={!isStep1Valid()}
                  onClick={() => setStep(2)}
                  className="flex items-center space-x-2 px-5 py-2.5 bg-primary disabled:opacity-40 hover:bg-primary-hover text-slate-800 text-xs font-bold rounded-xl transition"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: Line Items */}
          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-4"
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Step 2: Add Line Items</h3>
                <button
                  type="button"
                  onClick={handleAddItemRow}
                  className="flex items-center space-x-1 text-xs text-primary font-bold hover:underline"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Row</span>
                </button>
              </div>

              <div className="space-y-3">
                {items.map((row, index) => (
                  <div key={row.id} className="flex gap-3 items-center">
                    <span className="text-slate-500 font-mono text-xs w-4">{index + 1}</span>
                    
                    <input
                      type="text"
                      placeholder="Item name / specifications..."
                      value={row.name}
                      onChange={(e) => handleItemChange(row.id, 'name', e.target.value)}
                      className="flex-1 p-2.5 rounded-xl glass-input text-slate-800 text-xs"
                    />

                    <input
                      type="number"
                      min="1"
                      placeholder="Qty"
                      value={row.qty}
                      onChange={(e) => handleItemChange(row.id, 'qty', Math.max(1, Number(e.target.value)))}
                      className="w-16 p-2.5 rounded-xl glass-input text-slate-800 text-xs"
                    />

                    <select
                      value={row.unit}
                      onChange={(e) => handleItemChange(row.id, 'unit', e.target.value)}
                      className="w-24 p-2.5 rounded-xl glass-input text-slate-800 text-xs bg-white"
                    >
                      <option value="Units">Units</option>
                      <option value="Tons">Tons</option>
                      <option value="Licenses">Licenses</option>
                      <option value="Year">Year</option>
                      <option value="Hours">Hours</option>
                    </select>

                    <button
                      type="button"
                      disabled={items.length === 1}
                      onClick={() => handleRemoveItemRow(row.id)}
                      className="text-slate-500 hover:text-red-400 p-2 rounded hover:bg-slate-50 disabled:opacity-20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex justify-between pt-6">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-5 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-bold transition"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={!isStep2Valid()}
                  onClick={() => setStep(3)}
                  className="flex items-center space-x-2 px-5 py-2.5 bg-primary disabled:opacity-40 hover:bg-primary-hover text-slate-800 text-xs font-bold rounded-xl transition"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Assign Vendors */}
          {step === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-4"
            >
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2">Step 3: Assign Vendors</h3>
              <p className="text-xs text-slate-500 mb-4">Select active verified vendor profiles to invite to this RFQ</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
                {activeVendors.map(vendor => (
                  <div
                    key={vendor.id}
                    onClick={() => handleToggleVendor(vendor.id)}
                    className={`p-3.5 border rounded-xl flex items-center justify-between cursor-pointer transition ${
                      assignedVendors.includes(vendor.id) 
                        ? 'border-secondary bg-secondary/5 text-slate-800' 
                        : 'border-border bg-slate-50 hover:border-border text-slate-600'
                    }`}
                  >
                    <div>
                      <p className="text-xs font-bold">{vendor.name}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{vendor.category} // Rating: {vendor.rating} ★</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition ${
                      assignedVendors.includes(vendor.id)
                        ? 'bg-secondary border-secondary text-slate-950'
                        : 'border-border'
                    }`}>
                      {assignedVendors.includes(vendor.id) && <Check className="w-3 h-3" />}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between pt-6">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-5 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-bold transition"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={!isStep3Valid()}
                  onClick={() => setStep(4)}
                  className="flex items-center space-x-2 px-5 py-2.5 bg-primary disabled:opacity-40 hover:bg-primary-hover text-slate-800 text-xs font-bold rounded-xl transition"
                >
                  <span>Preview & Verify</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: Preview & Submit */}
          {step === 4 && (
            <motion.div
              key="step-4"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-6"
            >
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Step 4: Preview Details</h3>

              {/* Details review */}
              <div className="space-y-3 p-4 bg-slate-50 border border-border rounded-2xl">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">RFQ Title</span>
                  <p className="text-sm font-bold text-slate-800">{title}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Deadline Date</span>
                  <p className="text-xs text-amber-400 font-bold">{deadline}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Description</span>
                  <p className="text-xs text-slate-600 leading-relaxed">{description}</p>
                </div>
              </div>

              {/* Items review */}
              <div className="space-y-2">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Requested Line Items</span>
                <div className="border border-border rounded-xl overflow-hidden text-xs">
                  <div className="bg-slate-50 p-3 flex justify-between font-bold text-slate-500">
                    <span className="flex-1">Item Specifications</span>
                    <span className="w-16 text-right">Quantity</span>
                    <span className="w-20 text-right">Unit</span>
                  </div>
                  <div className="divide-y divide-border">
                    {items.map(it => (
                      <div key={it.id} className="p-3 flex justify-between text-slate-700">
                        <span className="flex-1 truncate">{it.name}</span>
                        <span className="w-16 text-right font-semibold">{it.qty}</span>
                        <span className="w-20 text-right">{it.unit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Vendors review */}
              <div className="space-y-2">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Assigned Suppliers ({assignedVendors.length})</span>
                <div className="flex flex-wrap gap-2">
                  {assignedVendors.map(vendorId => {
                    const vend = activeVendors.find(v => v.id === vendorId);
                    return (
                      <span key={vendorId} className="px-3 py-1 bg-slate-50 border border-border text-[11px] rounded-lg text-slate-600 font-medium">
                        {vend?.name}
                      </span>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-5 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-bold transition"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-primary to-secondary text-slate-800 text-xs font-bold rounded-xl transition hover:opacity-90 shadow-md shadow-secondary/15"
                >
                  <span>Publish RFQ Pipeline</span>
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </GlassCard>

    </div>
  );
};
export default RFQCreate;
