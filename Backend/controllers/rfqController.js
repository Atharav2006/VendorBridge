const RFQ = require('../models/RFQ');
const Quotation = require('../models/Quotation');
const Vendor = require('../models/Vendor');

exports.getRFQs = async (req, res) => {
  try {
    const { status, search } = req.query;
    let query = {};

    if (status) query.status = status;
    if (search) query.title = { $regex: search, $options: 'i' };

    // Vendors should only see RFQs assigned to them
    if (req.user.role === 'vendor') {
      const vendor = await Vendor.findOne({ linkedUserId: req.user._id });
      if (!vendor) {
        return res.status(200).json({ rfqs: [], total: 0 });
      }
      query.assignedVendorIds = vendor._id;
    }

    const rfqs = await RFQ.find(query);
    res.status(200).json({ rfqs, total: rfqs.length });
  } catch (error) {
    res.status(500).json({ error: true, message: 'Server error', code: 'SERVER_ERROR' });
  }
};

exports.getRFQById = async (req, res) => {
  try {
    const rfq = await RFQ.findById(req.params.id);
    if (!rfq) {
      return res.status(404).json({ error: true, message: 'RFQ not found', code: 'NOT_FOUND' });
    }
    
    // Vendor access check
    if (req.user.role === 'vendor') {
      const vendor = await Vendor.findOne({ linkedUserId: req.user._id });
      if (!vendor || !rfq.assignedVendorIds.includes(vendor._id)) {
         return res.status(403).json({ error: true, message: 'Not authorized', code: 'FORBIDDEN' });
      }
    }
    
    res.status(200).json(rfq);
  } catch (error) {
    res.status(500).json({ error: true, message: 'Server error', code: 'SERVER_ERROR' });
  }
};

exports.createRFQ = async (req, res) => {
  try {
    const rfq = await RFQ.create({
      ...req.body,
      createdBy: req.user._id
    });
    res.status(201).json(rfq);
  } catch (error) {
    res.status(400).json({ error: true, message: error.message, code: 'BAD_REQUEST' });
  }
};

exports.updateRFQ = async (req, res) => {
  try {
    const rfq = await RFQ.findOne({ _id: req.params.id, status: 'draft' });
    if (!rfq) {
      return res.status(404).json({ error: true, message: 'Draft RFQ not found', code: 'NOT_FOUND' });
    }
    
    const updatedRFQ = await RFQ.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.status(200).json(updatedRFQ);
  } catch (error) {
    res.status(400).json({ error: true, message: error.message, code: 'BAD_REQUEST' });
  }
};

exports.updateRFQStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const rfq = await RFQ.findByIdAndUpdate(req.params.id, { status }, { new: true, runValidators: true });
    if (!rfq) {
      return res.status(404).json({ error: true, message: 'RFQ not found', code: 'NOT_FOUND' });
    }
    res.status(200).json(rfq);
  } catch (error) {
    res.status(400).json({ error: true, message: error.message, code: 'BAD_REQUEST' });
  }
};

exports.compareQuotations = async (req, res) => {
  try {
    const rfq = await RFQ.findById(req.params.id);
    if (!rfq) {
      return res.status(404).json({ error: true, message: 'RFQ not found', code: 'NOT_FOUND' });
    }

    const quotations = await Quotation.find({ rfqId: rfq._id }).populate('vendorId');
    
    if (quotations.length === 0) {
      return res.status(200).json({
        rfqId: rfq._id.toString(),
        rfqTitle: rfq.title,
        quotations: []
      });
    }

    // Find lowest price and fastest delivery
    let lowestPrice = Math.min(...quotations.map(q => q.grandTotal));
    let fastestDelivery = Math.min(...quotations.map(q => q.deliveryDays));

    const enrichedQuotations = quotations.map(q => {
      const qObj = q.toJSON();
      const vendorName = q.vendorId ? q.vendorId.name : 'Unknown';
      const vendorRating = q.vendorId ? q.vendorId.rating : 0;
      
      return {
        ...qObj,
        vendorId: qObj.vendorId.toString(),
        vendorName,
        vendorRating,
        isLowestPrice: q.grandTotal === lowestPrice,
        isFastestDelivery: q.deliveryDays === fastestDelivery
      };
    });

    res.status(200).json({
      rfqId: rfq._id.toString(),
      rfqTitle: rfq.title,
      quotations: enrichedQuotations
    });
  } catch (error) {
    res.status(500).json({ error: true, message: 'Server error', code: 'SERVER_ERROR' });
  }
};
