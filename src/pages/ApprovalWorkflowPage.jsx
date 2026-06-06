import React, { useState, useEffect } from 'react';
import approvalService, {
  GET_APPROVAL_DETAILS_API,
  APPROVE_RFQ_API,
  REJECT_RFQ_API,
} from '../services/approvalService';
import { useAuth } from '../context/AuthContext';
import {
  CheckCircle,
  XCircle,
  FileCheck,
  UserCheck,
  Clock,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import Card from '../components/common/Card';
import Table from '../components/common/Table';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorState from '../components/common/ErrorState';
import EmptyState from '../components/common/EmptyState';

export const ApprovalWorkflowPage = () => {
  const { user } = useAuth();

  // Explicitly declared variables required by USER
  const [approvalData, setApprovalData] = useState([]); // Array of all RFQs/approvals
  const [selectedApproval, setSelectedApproval] = useState(null); // Selected RFQ
  const [approvalSteps, setApprovalSteps] = useState([]); // Stepper array
  const [approvalTimeline, setApprovalTimeline] = useState([]); // Vertical timeline logs
  const [quotationSummary, setQuotationSummary] = useState(null); // Quotation details
  const [approvalRemarks, setApprovalRemarks] = useState(''); // Textarea input state
  const [workflowStatus, setWorkflowStatus] = useState(''); // Status string
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch RFQs / Approval list on mount
  useEffect(() => {
    fetchApprovals();
  }, []);

  // Update detail states when selected approval changes
  useEffect(() => {
    if (selectedApproval) {
      setApprovalSteps(selectedApproval.approvalSteps || []);
      setApprovalTimeline(selectedApproval.approvalTimeline || []);
      setQuotationSummary(selectedApproval.quotationSummary || null);
      setWorkflowStatus(selectedApproval.workflowStatus || '');
      setApprovalRemarks(''); // Reset remarks textarea
    } else {
      setApprovalSteps([]);
      setApprovalTimeline([]);
      setQuotationSummary(null);
      setWorkflowStatus('');
      setApprovalRemarks('');
    }
  }, [selectedApproval]);

  const fetchApprovals = async () => {
    setLoading(true);
    setError(null);
    try {
      // API INTEGRATION POINT: GET_APPROVAL_DETAILS_API
      // Fetching all approval records from backend
      const res = await approvalService.getApprovals();
      if (res.success) {
        setApprovalData(res.data);
        if (res.data.length > 0) {
          // Default selection to first RFQ
          setSelectedApproval(res.data[0]);
        }
      } else {
        throw new Error(res.message || 'Failed to fetch RFQ workflows');
      }
    } catch (err) {
      console.error('Fetch Approvals Error:', err.message);
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedApproval) return;
    setLoading(true);
    setError(null);
    try {
      // API INTEGRATION POINT: APPROVE_RFQ_API
      // Submitting approval payload to backend
      const res = await approvalService.approveRFQ(selectedApproval._id, approvalRemarks);
      if (res.success) {
        // Refresh the list and update selection
        const updatedListRes = await approvalService.getApprovals();
        if (updatedListRes.success) {
          setApprovalData(updatedListRes.data);
          const newSelected = updatedListRes.data.find(item => item._id === selectedApproval._id);
          setSelectedApproval(newSelected || updatedListRes.data[0] || null);
        }
      } else {
        throw new Error(res.message || 'Approval request failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedApproval) return;
    if (!approvalRemarks.trim()) {
      setError('Please provide remarks explaining the reason for rejection.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // API INTEGRATION POINT: REJECT_RFQ_API
      // Submitting rejection payload to backend
      const res = await approvalService.rejectRFQ(selectedApproval._id, approvalRemarks);
      if (res.success) {
        // Refresh the list and update selection
        const updatedListRes = await approvalService.getApprovals();
        if (updatedListRes.success) {
          setApprovalData(updatedListRes.data);
          const newSelected = updatedListRes.data.find(item => item._id === selectedApproval._id);
          setSelectedApproval(newSelected || updatedListRes.data[0] || null);
        }
      } else {
        throw new Error(res.message || 'Rejection request failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold rounded">Approved</span>;
      case 'Rejected':
        return <span className="px-2 py-0.5 bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-bold rounded">Rejected</span>;
      case 'Pending':
        return <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold rounded animate-pulse-slow">Pending</span>;
      default:
        return <span className="px-2 py-0.5 bg-neutral-500/10 text-neutral-400 border border-neutral-500/20 text-xs font-bold rounded">Draft</span>;
    }
  };

  const isMyTurnToApprove = () => {
    if (!selectedApproval || !user) return false;
    if (selectedApproval.workflowStatus !== 'Pending') return false;
    const currentStep = approvalSteps[selectedApproval.currentStepIndex];
    if (!currentStep) return false;
    return currentStep.role === user.role || user.role === 'Admin';
  };

  // Setup column definitions for the quotation items table
  const itemColumns = [
    { key: 'description', label: 'Item Description' },
    { key: 'qty', label: 'Qty', render: (row) => row.qty.toLocaleString() },
    {
      key: 'unitPrice',
      label: 'Unit Price',
      render: (row) => `$${row.unitPrice.toLocaleString()}`,
    },
    {
      key: 'total',
      label: 'Total',
      render: (row) => (
        <span className="font-semibold text-zinc-100">${row.total.toLocaleString()}</span>
      ),
    },
  ];

  if (loading && approvalData.length === 0) {
    return <LoadingSpinner size="lg" message="Fetching RFQ workflows..." />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-heading">
            Approval Workflows
          </h1>
          <p className="text-sm text-neutral-400">
            Audit and approve pending RFQs and vendor quotation packages.
          </p>
        </div>
      </div>

      {error && <ErrorState message={error} onRetry={fetchApprovals} />}

      {approvalData.length === 0 ? (
        <EmptyState
          title="No workflows queued"
          description="There are currently no RFQs awaiting approval."
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* LEFT PANEL: RFQ List */}
          <div className="lg:col-span-1 space-y-3">
            <h2 className="text-xs font-bold text-neutral-500 uppercase tracking-widest px-1">
              Active RFQs ({approvalData.length})
            </h2>
            <div className="space-y-2.5 max-h-[calc(100vh-230px)] overflow-y-auto pr-1">
              {approvalData.map((rfq) => (
                <div
                  key={rfq._id}
                  onClick={() => setSelectedApproval(rfq)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    selectedApproval?._id === rfq._id
                      ? 'bg-neutral-900 border-brand-500/40 shadow-lg'
                      : 'bg-[#18181B] border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-mono font-bold text-neutral-400">
                      {rfq.rfqId}
                    </span>
                    {getStatusBadge(rfq.workflowStatus)}
                  </div>
                  <h3 className="text-sm font-semibold text-zinc-200 line-clamp-1">
                    {rfq.quotationSummary.title}
                  </h3>
                  <p className="text-xs text-neutral-400 mt-1">
                    Vendor: {rfq.quotationSummary.vendorName}
                  </p>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-neutral-800/40">
                    <span className="text-xs text-neutral-500">Grand Total</span>
                    <span className="text-sm font-bold text-brand-400">
                      ${rfq.quotationSummary.grandTotal.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT PANEL: Selected RFQ Details */}
          {selectedApproval && (
            <div className="lg:col-span-2 space-y-6">
              {/* Stepper Card */}
              <Card hoverable={false} className="p-4">
                <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-4">
                  Approval Steps Status
                </h3>
                <div className="flex items-center justify-between overflow-x-auto py-2">
                  {approvalSteps.map((step, idx) => {
                    const isPending = step.status === 'Pending';
                    const isApproved = step.status === 'Approved';
                    const isRejected = step.status === 'Rejected';

                    return (
                      <React.Fragment key={step._id || idx}>
                        <div className="flex flex-col items-center min-w-[120px] text-center">
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center border text-xs font-bold transition-all ${
                              isApproved
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                : isRejected
                                ? 'bg-red-500/10 text-red-400 border-red-500/30'
                                : isPending
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 animate-pulse-slow'
                                : 'bg-neutral-900 text-neutral-500 border-neutral-800'
                            }`}
                          >
                            {isApproved ? '✓' : step.stepNumber}
                          </div>
                          <p className="text-xs font-semibold text-zinc-300 mt-2 truncate w-24">
                            {step.stepName}
                          </p>
                          <p className="text-[10px] text-neutral-500 mt-0.5">
                            {step.role}
                          </p>
                        </div>
                        {idx < approvalSteps.length - 1 && (
                          <div className="flex-1 h-0.5 mx-2 bg-neutral-800 min-w-[30px] relative">
                            {isApproved && (
                              <div className="absolute inset-0 bg-emerald-500/50" />
                            )}
                          </div>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </Card>

              {/* Quotation Details */}
              {quotationSummary && (
                <Card
                  title={`Quotation: ${quotationSummary.title}`}
                  subtitle={`Reference: ${selectedApproval.rfqId} | Requested By: ${selectedApproval.requestedBy?.username || 'Buyer'}`}
                  hoverable={false}
                  headerActions={getStatusBadge(workflowStatus)}
                >
                  {/* Vendor Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-neutral-900/40 border border-neutral-800/60 rounded-xl text-xs">
                    <div>
                      <p className="text-neutral-500 font-semibold uppercase tracking-wider mb-1">
                        Vendor Information
                      </p>
                      <p className="text-zinc-200 font-medium text-sm">
                        {quotationSummary.vendorName}
                      </p>
                      <p className="text-neutral-400 mt-0.5">
                        {quotationSummary.vendorEmail}
                      </p>
                    </div>
                    <div>
                      <p className="text-neutral-500 font-semibold uppercase tracking-wider mb-1">
                        Delivery Schedule
                      </p>
                      <p className="text-zinc-200 font-medium">
                        {quotationSummary.deliveryDate
                          ? new Date(quotationSummary.deliveryDate).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })
                          : 'Immediate'}
                      </p>
                    </div>
                  </div>

                  {/* Items Table */}
                  <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3">
                    Quoted Materials & Services
                  </h4>
                  <div className="border border-neutral-800 rounded-xl overflow-hidden mb-6">
                    <Table
                      columns={itemColumns}
                      data={quotationSummary.items}
                      rowKey="description"
                    />
                  </div>

                  {/* Tax calculations & totals */}
                  <div className="flex justify-end border-t border-neutral-800/80 pt-4">
                    <div className="w-full md:w-64 space-y-2.5 text-sm text-neutral-400">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span className="text-zinc-300 font-medium">
                          ${quotationSummary.subtotal.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Estimated Tax (18%):</span>
                        <span className="text-zinc-300 font-medium">
                          ${quotationSummary.tax.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-base font-bold text-zinc-100 pt-2 border-t border-neutral-800/40">
                        <span>Grand Total:</span>
                        <span className="text-brand-400">
                          ${quotationSummary.grandTotal.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {/* Grid: Workflow Actions & Timeline History */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Timeline Card */}
                <Card title="Approval Trail" hoverable={false}>
                  <div className="space-y-4">
                    {approvalTimeline.length === 0 ? (
                      <div className="flex items-center space-x-2.5 text-xs text-neutral-500">
                        <Clock size={14} />
                        <span>No audit logs recorded for this workflow yet.</span>
                      </div>
                    ) : (
                      approvalTimeline.map((item, idx) => (
                        <div key={item._id || idx} className="flex items-start space-x-3 text-xs">
                          <div className="mt-0.5">
                            {item.action === 'APPROVED' ? (
                              <CheckCircle size={14} className="text-emerald-500" />
                            ) : item.action === 'REJECTED' ? (
                              <XCircle size={14} className="text-red-500" />
                            ) : (
                              <Clock size={14} className="text-neutral-500" />
                            )}
                          </div>
                          <div className="flex-1 space-y-0.5">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-zinc-300">
                                {item.actor?.username || 'User'}
                              </span>
                              <span className="text-[10px] text-neutral-500">
                                {new Date(item.timestamp).toLocaleString(undefined, {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                            <p className="text-neutral-400 font-medium">
                              Action: {item.action} {item.stepNumber ? `(Step ${item.stepNumber})` : ''}
                            </p>
                            {item.remarks && (
                              <p className="text-neutral-500 italic mt-0.5">"{item.remarks}"</p>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </Card>

                {/* Remarks & Buttons */}
                <Card title="Submit Decision" hoverable={false}>
                  {isMyTurnToApprove() ? (
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                          Remarks / Comments
                        </label>
                        <textarea
                          value={approvalRemarks}
                          onChange={(e) => setApprovalRemarks(e.target.value)}
                          placeholder="Type approval notes or reasons for rejection here..."
                          className="w-full h-24 p-3 bg-neutral-900 border border-neutral-800 focus:border-brand-500/50 rounded-xl text-xs text-zinc-300 outline-none resize-none transition-colors"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={handleReject}
                          className="py-2.5 px-4 bg-red-950/25 hover:bg-red-900/30 active:bg-red-900/40 text-red-400 text-xs font-bold border border-red-900/50 rounded-xl transition-all"
                        >
                          Reject RFQ
                        </button>
                        <button
                          onClick={handleApprove}
                          className="py-2.5 px-4 bg-brand-500 hover:bg-brand-400 active:bg-brand-600 text-black text-xs font-bold rounded-xl shadow-lg shadow-brand-500/10 transition-all"
                        >
                          Approve RFQ
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl text-center">
                      <p className="text-xs text-neutral-400 font-medium leading-relaxed">
                        {workflowStatus === 'Approved'
                          ? 'This workflow is fully approved and complete. A purchase order has been generated.'
                          : workflowStatus === 'Rejected'
                          ? 'This workflow has been rejected.'
                          : `Current step author: ${
                              approvalSteps[selectedApproval.currentStepIndex]?.role
                            }. You cannot approve right now.`}
                      </p>
                    </div>
                  )}
                </Card>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ApprovalWorkflowPage;
