const PurchaseOrder = require('../models/PurchaseOrder');
const Vendor = require('../models/Vendor');

exports.getVendorPerformance = async (req, res) => {
  try {
    const vendors = await Vendor.find();
    let performance = [];

    for (let vendor of vendors) {
      const pos = await PurchaseOrder.find({ vendorId: vendor._id });
      const totalSpend = pos.reduce((sum, po) => sum + po.grandTotal, 0);
      
      performance.push({
        vendorId: vendor._id,
        vendorName: vendor.name,
        totalPurchaseOrders: pos.length,
        totalSpend
      });
    }

    res.status(200).json({ vendorPerformance: performance });
  } catch (error) {
    res.status(500).json({ error: true, message: 'Server error', code: 'SERVER_ERROR' });
  }
};

exports.getProcurementSummary = async (req, res) => {
  try {
    const pos = await PurchaseOrder.find();
    
    const summary = {
      totalPurchaseOrders: pos.length,
      totalSpend: pos.reduce((sum, po) => sum + po.grandTotal, 0),
      statusBreakdown: {
        draft: pos.filter(po => po.status === 'draft').length,
        sent: pos.filter(po => po.status === 'sent').length,
        completed: pos.filter(po => po.status === 'completed').length,
      }
    };

    res.status(200).json({ summary });
  } catch (error) {
    res.status(500).json({ error: true, message: 'Server error', code: 'SERVER_ERROR' });
  }
};
