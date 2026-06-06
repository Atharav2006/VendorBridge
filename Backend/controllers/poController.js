const PurchaseOrder = require('../models/PurchaseOrder');
const Approval = require('../models/Approval');
const Quotation = require('../models/Quotation');
const Vendor = require('../models/Vendor');
const Invoice = require('../models/Invoice');
const RFQ = require('../models/RFQ');
const ActivityLog = require('../models/ActivityLog');
const Notification = require('../models/Notification');

exports.getPurchaseOrders = async (req, res) => {
  try {
    const { status, vendorId } = req.query;
    let query = {};
    if (status) query.status = status;
    if (vendorId) query.vendorId = vendorId;

    if (req.user.role === 'vendor') {
      const vendor = await Vendor.findOne({ linkedUserId: req.user._id });
      if (!vendor) return res.status(200).json({ purchaseOrders: [] });
      query.vendorId = vendor._id;
    }

    const purchaseOrders = await PurchaseOrder.find(query);
    res.status(200).json({ purchaseOrders });
  } catch (error) {
    res.status(500).json({ error: true, message: 'Server error', code: 'SERVER_ERROR' });
  }
};

exports.getPurchaseOrderById = async (req, res) => {
  try {
    const po = await PurchaseOrder.findById(req.params.id);
    if (!po) {
      return res.status(404).json({ error: true, message: 'Purchase Order not found', code: 'NOT_FOUND' });
    }
    res.status(200).json(po);
  } catch (error) {
    res.status(500).json({ error: true, message: 'Server error', code: 'SERVER_ERROR' });
  }
};

exports.createPurchaseOrder = async (req, res) => {
  try {
    const { approvalId } = req.body;
    
    const approval = await Approval.findById(approvalId).populate('quotationId');
    if (!approval || approval.status !== 'approved') {
      return res.status(400).json({ error: true, message: 'Valid approved Approval not found', code: 'BAD_REQUEST' });
    }

    const quotation = approval.quotationId;
    const poCount = await PurchaseOrder.countDocuments();
    const poNumber = `PO-${new Date().getFullYear()}-${String(poCount + 1).padStart(4, '0')}`;

    const po = await PurchaseOrder.create({
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

    // Log Activity
    await ActivityLog.create({
      userId: req.user._id,
      userName: req.user.name,
      action: 'Generated Purchase Order',
      entityType: 'purchase_order',
      entityId: po._id
    });

    // Update RFQ status to closed
    await RFQ.findByIdAndUpdate(approval.rfqId, { status: 'closed' });

    res.status(201).json(po);
  } catch (error) {
    res.status(400).json({ error: true, message: error.message, code: 'BAD_REQUEST' });
  }
};

exports.updatePurchaseOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const po = await PurchaseOrder.findByIdAndUpdate(req.params.id, { status }, { new: true, runValidators: true }).populate('vendorId');
    if (!po) {
      return res.status(404).json({ error: true, message: 'Purchase Order not found', code: 'NOT_FOUND' });
    }
    
    // Auto-generate invoice when PO is accepted
    if (status === 'Accepted') {
      const invCount = await Invoice.countDocuments();
      const invoiceNumber = `INV-${new Date().getFullYear()}-${String(invCount + 1).padStart(4, '0')}`;
      const vendor = po.vendorId;
      
      await Invoice.create({
        invoiceNumber,
        purchaseOrderId: po._id,
        vendorId: vendor._id,
        billingDetails: {
          companyName: vendor?.name || 'Verified Vendor',
          address: vendor?.address || 'VendorBridge Corporate Network',
          gst: vendor?.gst || 'GST-PENDING'
        },
        items: po.items,
        subtotal: po.subtotal,
        taxPercent: po.taxPercent,
        taxAmount: po.taxAmount,
        grandTotal: po.grandTotal
      });
    }

    await ActivityLog.create({
      userId: req.user._id,
      userName: req.user.name,
      action: `Updated PO Status to ${status}`,
      entityType: 'purchase_order',
      entityId: po._id
    });

    res.status(200).json(po);
  } catch (error) {
    res.status(400).json({ error: true, message: error.message, code: 'BAD_REQUEST' });
  }
};
