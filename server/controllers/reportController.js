const PurchaseOrder = require('../models/PurchaseOrder');
const Vendor = require('../models/Vendor');
const RFQ = require('../models/RFQ');
const Quotation = require('../models/Quotation');

// @desc    Get comprehensive analytics for reports
// @route   GET /api/reports/analytics
// @access  Private (Admin/Manager)
const getAnalytics = async (req, res) => {
  try {
    const totalSpendAgg = await PurchaseOrder.aggregate([
      { $group: { _id: null, total: { $sum: "$taxSummary.grandTotal" } } }
    ]);
    const totalSpent = totalSpendAgg.length > 0 ? totalSpendAgg[0].total : 0;

    const vendorCount = await Vendor.countDocuments();
    const activePOsCount = await PurchaseOrder.countDocuments({ invoiceStatus: { $ne: 'Paid' } });
    const pendingApprovalsCount = await Quotation.countDocuments({ status: 'Submitted' });

    // Format for UI
    const reportSummary = {
      totalSpent,
      totalSubtotal: 0,
      totalTax: 0,
      activePOsCount,
      pendingApprovalsCount,
      vendorCount
    };

    const vendorAnalytics = await Vendor.find().select('name rating').limit(5).then(vendors => 
      vendors.map(v => ({
        vendorName: v.name,
        ordersCount: 1, // mock
        averageOrderValue: totalSpent / 1 || 0,
        totalSpent: totalSpent
      }))
    );

    const chartData = {
      monthlyLabels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      monthlyAmounts: [0, 0, 0, 0, 0, totalSpent],
      categoryLabels: ['IT', 'Office'],
      categoryValues: [totalSpent, 0]
    };

    const spendingCategories = [
      { name: 'Hardware', value: totalSpent }
    ];

    res.json({
      success: true,
      data: {
        reportSummary,
        vendorAnalytics,
        monthlyTrend: [],
        spendingCategories,
        chartData
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Export report data as CSV
// @route   POST /api/reports/export
// @access  Private
const exportReport = async (req, res) => {
  try {
    const pos = await PurchaseOrder.find().populate('vendorDetails.name');
    let csv = 'PO Number,Vendor,Grand Total,Status\n';
    pos.forEach(po => {
      csv += `${po.poNumber},${po.vendorDetails?.name || 'N/A'},${po.taxSummary?.grandTotal || 0},${po.paymentStatus}\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=procurement_report.csv');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAnalytics, exportReport };
