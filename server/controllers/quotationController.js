const Quotation = require('../models/Quotation');
const RFQ = require('../models/RFQ');
const AuditLog = require('../models/AuditLog');

// @desc    Submit quotation
// @route   POST /api/quotations
// @access  Private (Admin/Vendor)
const submitQuotation = async (req, res) => {
  try {
    const quotationId = `QT-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
    
    // Look up Vendor by user email
    const Vendor = require('../models/Vendor');
    const vendor = await Vendor.findOne({ email: req.user.email });
    const vendorId = req.body.vendorId || (vendor ? vendor._id : null);

    // If RFQ is missing (e.g. accessed via sidebar without selecting), find the latest active RFQ
    let rfqId = req.body.rfqId;
    if (!rfqId) {
      const latestRfq = await RFQ.findOne({ status: 'Active' }).sort({ createdAt: -1 });
      if (latestRfq) rfqId = latestRfq._id;
    }

    // Strip frontend-generated string _id from items
    const sanitizedItems = req.body.quotationItems?.map(item => {
      const { _id, ...rest } = item;
      return rest;
    }) || [];

    const quote = await Quotation.create({
      ...req.body,
      rfqId,
      vendorId,
      quotationItems: sanitizedItems,
      quotationId,
      status: 'Submitted'
    });

    await AuditLog.create({
      user: req.user._id,
      action: 'Submitted Quotation',
      entityType: 'Quotation',
      entityId: quote._id,
      details: `Quotation ${quotationId} submitted for RFQ.`
    });

    res.status(201).json({ success: true, data: quote });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get quotations for comparison (by RFQ ID)
// @route   GET /api/quotations/compare/:rfqId
// @access  Private
const getQuotationsByRfq = async (req, res) => {
  try {
    let query = {};
    if (req.params.rfqId !== 'all') {
      query.rfqId = req.params.rfqId;
    }
    
    const quotations = await Quotation.find(query)
      .populate('vendorId', 'name rating email')
      .sort({ grandTotal: 1 }); // sort lowest price first

    res.json({ success: true, data: quotations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { submitQuotation, getQuotationsByRfq };
