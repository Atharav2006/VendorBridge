const Approval = require('../models/Approval');
const Quotation = require('../models/Quotation');
const PurchaseOrder = require('../models/PurchaseOrder');
const ActivityLog = require('../models/ActivityLog');
const Notification = require('../models/Notification');

exports.getApprovals = async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};
    if (status) query.status = status;

    const approvals = await Approval.find(query);
    res.status(200).json({ approvals });
  } catch (error) {
    res.status(500).json({ error: true, message: 'Server error', code: 'SERVER_ERROR' });
  }
};

exports.getApprovalById = async (req, res) => {
  try {
    const approval = await Approval.findById(req.params.id);
    if (!approval) {
      return res.status(404).json({ error: true, message: 'Approval not found', code: 'NOT_FOUND' });
    }
    res.status(200).json(approval);
  } catch (error) {
    res.status(500).json({ error: true, message: 'Server error', code: 'SERVER_ERROR' });
  }
};

exports.createApproval = async (req, res) => {
  try {
    const { rfqId, quotationId } = req.body;
    
    // Check if quotation exists
    const quotation = await Quotation.findById(quotationId);
    if (!quotation) {
      return res.status(404).json({ error: true, message: 'Quotation not found', code: 'NOT_FOUND' });
    }

    const approval = await Approval.create({
      rfqId,
      quotationId,
      requestedBy: req.user._id,
      approvalTimeline: [{
        action: 'Approval Requested',
        by: req.user._id
      }]
    });
    
    // Update quotation status to shortlisted
    await Quotation.findByIdAndUpdate(quotationId, { status: 'shortlisted' });
    
    res.status(201).json(approval);
  } catch (error) {
    res.status(400).json({ error: true, message: error.message, code: 'BAD_REQUEST' });
  }
};

exports.actionApproval = async (req, res) => {
  try {
    const { action, remarks } = req.body;
    
    if (!['approved', 'rejected'].includes(action)) {
      return res.status(400).json({ error: true, message: 'Invalid action', code: 'BAD_REQUEST' });
    }

    const approval = await Approval.findById(req.params.id);
    if (!approval) {
      return res.status(404).json({ error: true, message: 'Approval not found', code: 'NOT_FOUND' });
    }

    if (approval.status.toLowerCase() !== 'pending') {
      return res.status(400).json({ error: true, message: 'Approval is no longer pending', code: 'BAD_REQUEST' });
    }

    approval.status = action;
    approval.approvedBy = req.user._id;
    approval.remarks = remarks || null;
    approval.approvalTimeline.push({
      action: action === 'approved' ? 'Approved' : 'Rejected',
      by: req.user._id,
      remarks: remarks || null
    });

    await approval.save();

    if (action === 'approved') {
      const quotation = await Quotation.findById(approval.quotationId);
      if (quotation) {
        const poCount = await PurchaseOrder.countDocuments();
        const poNumber = `PO-${new Date().getFullYear()}-${String(poCount + 1).padStart(4, '0')}`;

        await PurchaseOrder.create({
          poNumber,
          rfqId: approval.rfqId,
          quotationId: quotation._id,
          vendorId: quotation.vendorId,
          items: quotation.items,
          subtotal: quotation.subtotal,
          taxPercent: quotation.taxPercent,
          taxAmount: quotation.taxAmount,
          grandTotal: quotation.grandTotal,
          createdBy: req.user._id
        });
      }
    }

    // Log Activity
    await ActivityLog.create({
      userId: req.user._id,
      userName: req.user.name,
      action: `Approval ${action}`,
      entityType: 'approval',
      entityId: approval._id,
      metadata: { remarks }
    });

    // Notify the user who requested the approval
    await Notification.create({
      userId: approval.requestedBy,
      type: 'approval_done',
      message: `Your approval request has been ${action} by ${req.user.name}.`,
      entityType: 'approval',
      entityId: approval._id
    });

    res.status(200).json(approval);
  } catch (error) {
    res.status(400).json({ error: true, message: error.message, code: 'BAD_REQUEST' });
  }
};
