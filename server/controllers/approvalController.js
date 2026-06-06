const Quotation = require('../models/Quotation');
const RFQ = require('../models/RFQ');
const PurchaseOrder = require('../models/PurchaseOrder');
const AuditLog = require('../models/AuditLog');

// @desc    Get pending approvals
// @route   GET /api/approvals
// @access  Private (Manager/Admin)
const getApprovals = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    
    const quotations = await Quotation.find(filter)
      .populate('rfqId', 'title rfqNumber')
      .populate('vendorId', 'name email')
      .sort({ createdAt: -1 });

    const formattedApprovals = quotations.map(q => {
      // Map to the shape expected by ApprovalWorkflowPage
      return {
        _id: q._id,
        rfqId: q.rfqId?.rfqNumber || 'N/A',
        workflowStatus: q.status === 'Submitted' ? 'Pending' : q.status,
        currentStepIndex: q.status === 'Submitted' ? 1 : 2,
        approvalSteps: [
          { stepNumber: 1, stepName: 'Technical Review', role: 'Purchaser', status: 'Approved' },
          { stepNumber: 2, stepName: 'Financial Approval', role: 'Manager', status: q.status === 'Selected' ? 'Approved' : (q.status === 'Rejected' ? 'Rejected' : 'Pending') }
        ],
        approvalTimeline: [], // Optional: query AuditLogs here if needed
        quotationSummary: {
          title: q.rfqId?.title || 'Quotation Review',
          vendorName: q.vendorId?.name || 'Unknown',
          vendorEmail: q.vendorId?.email || 'N/A',
          deliveryDate: q.deliveryTimeline?.expectedDeliveryDate,
          items: q.quotationItems.map(item => ({
            description: item.description,
            qty: item.quantity,
            unitPrice: item.unitPrice,
            total: item.lineTotal
          })),
          subtotal: q.grandTotal - (q.taxSummary?.gstAmount || 0) + (q.taxSummary?.tdsAmount || 0) - (q.taxSummary?.otherCharges || 0),
          tax: q.taxSummary?.gstAmount || 0,
          grandTotal: q.grandTotal
        },
        requestedBy: { username: 'System Buyer' }
      };
    });

    res.json({ success: true, data: formattedApprovals });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Approve Quotation and Auto-Generate PO
// @route   POST /api/approvals/:id/approve
// @access  Private (Manager/Admin)
const approveQuotation = async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id)
      .populate('rfqId')
      .populate('vendorId');
      
    if (!quotation) return res.status(404).json({ success: false, message: 'Quotation not found' });

    // 1. Update Quotation Status
    quotation.status = 'Selected';
    await quotation.save();

    // 2. Update RFQ Status to Closed
    const rfq = await RFQ.findById(quotation.rfqId._id);
    if (rfq) {
      rfq.status = 'Closed';
      await rfq.save();
    }

    // 3. Auto-Generate Purchase Order
    const poNumber = `PO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const po = await PurchaseOrder.create({
      poNumber,
      rfqId: rfq._id,
      quotationId: quotation._id,
      vendorDetails: {
        name: quotation.vendorId.name,
        email: quotation.vendorId.email
      },
      invoiceItems: quotation.quotationItems.map(item => ({
        description: item.description,
        qty: item.quantity,
        unitPrice: item.unitPrice,
        total: item.lineTotal
      })),
      taxSummary: quotation.taxSummary,
      invoiceStatus: 'Sent',
      paymentStatus: 'Unpaid'
    });

    // 4. Create Audit Log
    await AuditLog.create({
      user: req.user._id,
      action: 'Approved Quotation',
      entityType: 'Quotation',
      entityId: quotation._id,
      details: `Quotation ${quotation.quotationId} approved. Generated ${poNumber}. Remarks: ${req.body.remarks || 'None'}`
    });

    res.json({ success: true, data: quotation, po });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reject Quotation
// @route   POST /api/approvals/:id/reject
// @access  Private (Manager/Admin)
const rejectQuotation = async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id);
    if (!quotation) return res.status(404).json({ success: false, message: 'Quotation not found' });

    quotation.status = 'Rejected';
    await quotation.save();

    await AuditLog.create({
      user: req.user._id,
      action: 'Rejected Quotation',
      entityType: 'Quotation',
      entityId: quotation._id,
      details: `Quotation ${quotation.quotationId} rejected. Remarks: ${req.body.remarks || 'None'}`
    });

    res.json({ success: true, data: quotation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getApprovals, approveQuotation, rejectQuotation };
