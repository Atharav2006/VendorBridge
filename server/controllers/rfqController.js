const RFQ = require('../models/RFQ');
const AuditLog = require('../models/AuditLog');

// @desc    Get all RFQs
// @route   GET /api/rfq
// @access  Private
const getRFQs = async (req, res) => {
  try {
    const rfqs = await RFQ.find()
      .populate('assignedVendors', 'name email')
      .populate('createdBy', 'username')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: rfqs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single RFQ
// @route   GET /api/rfq/:id
// @access  Private
const getRFQById = async (req, res) => {
  try {
    const rfq = await RFQ.findById(req.params.id)
      .populate('assignedVendors', 'name email')
      .populate('createdBy', 'username');
    if (!rfq) return res.status(404).json({ success: false, message: 'RFQ not found' });
    res.json({ success: true, data: rfq });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create RFQ
// @route   POST /api/rfq
// @access  Private (Admin/Purchaser)
const createRFQ = async (req, res) => {
  try {
    const rfqNumber = `RFQ-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    // Strip frontend-generated string _id from items so Mongoose creates proper ObjectIds
    const sanitizedItems = req.body.rfqItems?.map(item => {
      const { _id, ...rest } = item;
      return rest;
    }) || [];

    const rfq = await RFQ.create({
      ...req.body,
      rfqItems: sanitizedItems,
      rfqNumber,
      createdBy: req.user._id,
      status: 'Active'
    });

    await AuditLog.create({
      user: req.user._id,
      action: 'Created RFQ',
      entityType: 'RFQ',
      entityId: rfq._id,
      details: `RFQ ${rfqNumber} created and assigned to vendors.`
    });

    res.status(201).json({ success: true, data: rfq });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = { getRFQs, getRFQById, createRFQ };
