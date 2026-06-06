const Quotation = require('../models/Quotation');
const Vendor = require('../models/Vendor');
const RFQ = require('../models/RFQ');
const ActivityLog = require('../models/ActivityLog');
const Notification = require('../models/Notification');

exports.getQuotations = async (req, res) => {
  try {
    const { rfqId, vendorId, status } = req.query;
    let query = {};

    if (rfqId) query.rfqId = rfqId;
    if (vendorId) query.vendorId = vendorId;
    if (status) query.status = status;

    if (req.user.role === 'vendor') {
      const vendor = await Vendor.findOne({ linkedUserId: req.user._id });
      if (!vendor) {
        return res.status(200).json({ quotations: [] });
      }
      query.vendorId = vendor._id;
    }

    const quotations = await Quotation.find(query);
    res.status(200).json({ quotations });
  } catch (error) {
    res.status(500).json({ error: true, message: 'Server error', code: 'SERVER_ERROR' });
  }
};

exports.getQuotationById = async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id);
    if (!quotation) {
      return res.status(404).json({ error: true, message: 'Quotation not found', code: 'NOT_FOUND' });
    }
    res.status(200).json(quotation);
  } catch (error) {
    res.status(500).json({ error: true, message: 'Server error', code: 'SERVER_ERROR' });
  }
};

exports.createQuotation = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ linkedUserId: req.user._id });
    if (!vendor) {
      return res.status(400).json({ error: true, message: 'Vendor profile not found for user', code: 'BAD_REQUEST' });
    }
    
    const quotation = await Quotation.create({
      ...req.body,
      rfqId: req.params.rfqId,
      vendorId: vendor._id
    });

    // Log Activity
    await ActivityLog.create({
      userId: req.user._id,
      userName: req.user.name,
      action: 'Submitted Quotation',
      entityType: 'quotation',
      entityId: quotation._id
    });

    // Notify RFQ Creator
    const rfq = await RFQ.findById(req.params.rfqId);
    if (rfq) {
      await Notification.create({
        userId: rfq.createdBy,
        type: 'quotation_received',
        message: `Vendor ${vendor.name} has submitted a quotation for RFQ ${rfq.title}.`,
        entityType: 'quotation',
        entityId: quotation._id
      });
    }

    res.status(201).json(quotation);
  } catch (error) {
    res.status(400).json({ error: true, message: error.message, code: 'BAD_REQUEST' });
  }
};

exports.updateQuotation = async (req, res) => {
  try {
    const quotation = await Quotation.findOne({ _id: req.params.id, status: 'submitted' });
    if (!quotation) {
      return res.status(404).json({ error: true, message: 'Quotation not found or cannot be edited', code: 'NOT_FOUND' });
    }
    
    const updatedQuotation = await Quotation.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.status(200).json(updatedQuotation);
  } catch (error) {
    res.status(400).json({ error: true, message: error.message, code: 'BAD_REQUEST' });
  }
};
