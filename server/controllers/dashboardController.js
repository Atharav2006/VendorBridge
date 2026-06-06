const RFQ = require('../models/RFQ');
const Quotation = require('../models/Quotation');
const PurchaseOrder = require('../models/PurchaseOrder');

// @desc    Get dashboard analytics overview
// @route   GET /api/dashboard/analytics
// @access  Private
const getDashboardAnalytics = async (req, res) => {
  try {
    const activeRFQs = await RFQ.countDocuments({ status: 'Active' });
    const pendingApprovals = await Quotation.countDocuments({ status: 'Submitted' }); // Or specific workflow state
    const pos = await PurchaseOrder.find();
    
    let totalSpend = 0;
    pos.forEach(po => {
      if (po.taxSummary && po.taxSummary.grandTotal) {
        totalSpend += po.taxSummary.grandTotal;
      }
    });

    const overdueInvoices = await PurchaseOrder.countDocuments({ invoiceStatus: 'Overdue' });

    res.json({
      success: true,
      data: {
        activeRFQs,
        pendingApprovals,
        totalProcurementSpend: totalSpend,
        overdueInvoices,
        spendingTrend: '+12.5%'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get recent purchase orders
// @route   GET /api/dashboard/recent-purchase-orders
// @access  Private
const getRecentPurchaseOrders = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const pos = await PurchaseOrder.find()
      .populate('rfqId')
      .populate('quotationId')
      .sort({ createdAt: -1 })
      .limit(limit);
      
    res.json({ success: true, data: pos });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getDashboardAnalytics, getRecentPurchaseOrders };
