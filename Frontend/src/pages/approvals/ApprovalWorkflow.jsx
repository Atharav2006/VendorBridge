import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import GlassCard from '../../components/ui/GlassCard';
import Modal from '../../components/ui/Modal';
import { motion } from 'framer-motion';
import { 
  CheckSquare, 
  Clock, 
  ThumbsUp, 
  ThumbsDown, 
  User, 
  DollarSign, 
  Eye, 
  ArrowRight,
  MessageSquarePlus
} from 'lucide-react';

export const ApprovalWorkflow = () => {
  const { approvals, updateApprovalStatus } = useApp();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('All');
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [comments, setComments] = useState('');

  // Kanban Columns
  const columns = [
    { id: 'Pending', title: 'Pending Audit', icon: Clock, color: 'text-amber-400 bg-amber-400/5 border-amber-400/10' },
    { id: 'Approved', title: 'Approved', icon: ThumbsUp, color: 'text-emerald-400 bg-emerald-400/5 border-emerald-400/10' },
    { id: 'Rejected', title: 'Rejected', icon: ThumbsDown, color: 'text-red-400 bg-red-400/5 border-red-400/10' }
  ];

  const handleOpenDetail = (item) => {
    setSelectedApproval(item);
    setComments(item.comments || '');
  };

  const handleStatusChange = (status) => {
    if (selectedApproval) {
      updateApprovalStatus(selectedApproval.id, status, comments, user);
      setSelectedApproval(null);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 tracking-wide">Document Approval Center</h2>
        <p className="text-xs text-slate-500 mt-0.5">Audit quotations, verify items requirements, and sign off purchase releases</p>
      </div>

      {/* Kanban Grid Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {columns.map(col => {
          const colItems = approvals.filter(item => item.status?.toLowerCase() === col.id.toLowerCase());
          const ColIcon = col.icon;

          return (
            <div key={col.id} className="space-y-4">
              
              {/* Column Header */}
              <div className={`p-4 border rounded-xl flex items-center justify-between font-bold text-xs uppercase tracking-wider ${col.color}`}>
                <div className="flex items-center space-x-2">
                  <ColIcon className="w-4 h-4" />
                  <span>{col.title}</span>
                </div>
                <span className="bg-slate-100 px-2 py-0.5 rounded-md text-[10px]">{colItems.length}</span>
              </div>

              {/* Lane Cards Container */}
              <div className="space-y-3 min-h-[500px] bg-slate-50 border border-border p-3 rounded-2xl">
                {colItems.length === 0 ? (
                  <div className="text-center py-12 text-[11px] text-slate-500 font-mono">
                    Lane empty
                  </div>
                ) : (
                  colItems.map(item => (
                    <motion.div
                      key={item.id}
                      layoutId={item.id}
                      onClick={() => handleOpenDetail(item)}
                      className="cursor-pointer"
                    >
                      <GlassCard 
                        className="p-4 hover:border-slate-700/50 transition relative overflow-hidden"
                        hoverEffect={true}
                        animate={false}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-black border uppercase ${
                            item.type === 'Quotation' ? 'bg-primary/20 text-primary-light border-primary/20' : 
                            item.type === 'Purchase Order' ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/20' : 'bg-teal-500/20 text-teal-300 border-teal-500/20'
                          }`}>
                            {item.type}
                          </span>
                          <span className="text-[9px] text-slate-500 font-mono">#{item.id}</span>
                        </div>

                        <h4 className="font-bold text-xs text-slate-800 line-clamp-1">{item.title}</h4>
                        <p className="text-[10px] text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">{item.comments}</p>
                        
                        <div className="mt-4 pt-3 border-t border-border flex justify-between items-center text-[10px]">
                          <span className="text-slate-500 flex items-center font-medium">
                            <User className="w-3 h-3 mr-1" /> {item.requestedBy}
                          </span>
                          {item.amount > 0 && (
                            <span className="font-black text-primary">
                              ${item.amount.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </GlassCard>
                    </motion.div>
                  ))
                )}
              </div>

            </div>
          );
        })}
      </div>

      {/* DETAIL WORKFLOW DRAWER MODAL */}
      <Modal
        isOpen={!!selectedApproval}
        onClose={() => setSelectedApproval(null)}
        title="Verification & Signing Details"
      >
        {selectedApproval && (
          <div className="space-y-5">
            <div className="space-y-1">
              <span className="text-[9px] text-slate-500 uppercase font-black tracking-wider">Document Type</span>
              <p className="text-sm font-bold text-slate-800 flex items-center">
                <span className="px-2 py-0.5 bg-primary/20 text-primary-light border border-primary/30 rounded text-[10px] mr-2">
                  {selectedApproval.type}
                </span>
                #{selectedApproval.id}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[9px] text-slate-500 uppercase font-black tracking-wider">Title</span>
              <p className="text-sm font-bold text-slate-800">{selectedApproval.title}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[9px] text-slate-500 uppercase font-black tracking-wider">Requested By</span>
                <p className="text-xs text-slate-700 mt-0.5">{selectedApproval.requestedBy}</p>
              </div>
              {selectedApproval.amount > 0 && (
                <div>
                  <span className="text-[9px] text-slate-500 uppercase font-black tracking-wider">Requested Value</span>
                  <p className="text-xs text-primary font-black mt-0.5">
                    ${selectedApproval.amount.toLocaleString()}
                  </p>
                </div>
              )}
            </div>

            {/* Comments input / review */}
            <div className="space-y-1.5">
              <span className="text-[9px] text-slate-500 uppercase font-black tracking-wider flex items-center">
                <MessageSquarePlus className="w-3.5 h-3.5 mr-1 text-slate-500" /> Audit Remarks
              </span>
              {selectedApproval.status?.toLowerCase() === 'pending' ? (
                <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Enter approval details, budget allocations, compliance approvals comments..."
                  className="w-full h-20 p-2.5 rounded-xl glass-input text-slate-800 text-xs resize-none"
                />
              ) : (
                <p className="p-3 bg-slate-50 border border-border rounded-xl text-xs text-slate-600 italic">
                  "{selectedApproval.comments || 'No remarks recorded.'}"
                </p>
              )}
            </div>

            {/* Actions for Pending */}
            {selectedApproval.status?.toLowerCase() === 'pending' ? (
              <div className="flex justify-end space-x-2 pt-4 border-t border-border">
                <button
                  onClick={() => handleStatusChange('Rejected')}
                  className="px-4 py-2 bg-red-950/40 hover:bg-red-900/40 text-red-400 border border-red-900/30 rounded-lg text-xs font-bold transition"
                >
                  Reject Release
                </button>
                <button
                  onClick={() => handleStatusChange('Approved')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-slate-800 rounded-lg text-xs font-bold transition shadow-lg shadow-emerald-700/25"
                >
                  Approve & Release
                </button>
              </div>
            ) : (
              <div className="flex justify-end pt-4 border-t border-border">
                <button
                  onClick={() => setSelectedApproval(null)}
                  className="px-4 py-2 bg-slate-50 text-slate-600 hover:text-slate-800 rounded-lg text-xs transition"
                >
                  Close Pane
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>

    </div>
  );
};
export default ApprovalWorkflow;
