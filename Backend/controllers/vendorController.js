const Vendor = require('../models/Vendor');

exports.getVendors = async (req, res) => {
  try {
    const { search, category, status } = req.query;
    let query = {};

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    if (category) {
      query.category = category;
    }
    if (status) {
      query.status = status;
    }

    const vendors = await Vendor.find(query);
    res.status(200).json({ vendors, total: vendors.length });
  } catch (error) {
    res.status(500).json({ error: true, message: 'Server error', code: 'SERVER_ERROR' });
  }
};

exports.getVendorById = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      return res.status(404).json({ error: true, message: 'Vendor not found', code: 'NOT_FOUND' });
    }
    res.status(200).json(vendor);
  } catch (error) {
    res.status(500).json({ error: true, message: 'Server error', code: 'SERVER_ERROR' });
  }
};

exports.createVendor = async (req, res) => {
  try {
    const vendor = await Vendor.create(req.body);
    res.status(201).json(vendor);
  } catch (error) {
    res.status(400).json({ error: true, message: error.message, code: 'BAD_REQUEST' });
  }
};

exports.updateVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!vendor) {
      return res.status(404).json({ error: true, message: 'Vendor not found', code: 'NOT_FOUND' });
    }
    res.status(200).json(vendor);
  } catch (error) {
    res.status(400).json({ error: true, message: error.message, code: 'BAD_REQUEST' });
  }
};

exports.updateVendorStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const vendor = await Vendor.findByIdAndUpdate(req.params.id, { status }, { new: true, runValidators: true });
    if (!vendor) {
      return res.status(404).json({ error: true, message: 'Vendor not found', code: 'NOT_FOUND' });
    }
    res.status(200).json(vendor);
  } catch (error) {
    res.status(400).json({ error: true, message: error.message, code: 'BAD_REQUEST' });
  }
};

exports.deleteVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findByIdAndDelete(req.params.id);
    if (!vendor) {
      return res.status(404).json({ error: true, message: 'Vendor not found', code: 'NOT_FOUND' });
    }
    res.status(200).json({ message: 'Vendor deleted' });
  } catch (error) {
    res.status(500).json({ error: true, message: 'Server error', code: 'SERVER_ERROR' });
  }
};
