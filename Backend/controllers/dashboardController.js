const Approval = require('../models/Approval');
const RFQ = require('../models/RFQ');
const Vendor = require('../models/Vendor');
const PurchaseOrder = require('../models/PurchaseOrder');
const Invoice = require('../models/Invoice');

exports.getDashboardStats = async (req, res) => {
  try {
    const role = req.user.role;
    let vendorId = null;

    if (role === 'vendor') {
      const vendor = await Vendor.findOne({ linkedUserId: req.user._id });
      if (vendor) vendorId = vendor._id;
    }

    const pendingApprovalsQuery = role === 'vendor' ? { status: 'never_matches' } : { status: 'pending' };
    const pendingApprovals = await Approval.countDocuments(pendingApprovalsQuery);
    
    const rfqQuery = role === 'vendor' && vendorId ? { assignedVendorIds: vendorId, status: 'open' } : { status: 'open' };
    const activeRFQs = await RFQ.countDocuments(rfqQuery);
    
    const totalVendors = role === 'vendor' ? 1 : await Vendor.countDocuments();
    
    const poQuery = role === 'vendor' && vendorId ? { vendorId } : {};
    const recentPOs = await PurchaseOrder.find(poQuery).sort({ createdAt: -1 }).limit(5);
    
    const invoiceQuery = role === 'vendor' && vendorId ? { vendorId } : {};
    const recentInvoices = await Invoice.find(invoiceQuery).sort({ createdAt: -1 }).limit(5);

    // Aggregate monthly spend from Invoices
    const currentYear = new Date().getFullYear();
    const invoicesThisYear = await Invoice.find({
      ...invoiceQuery,
      createdAt: { $gte: new Date(`${currentYear}-01-01`), $lte: new Date(`${currentYear}-12-31`) }
    });

    const monthlySpend = invoicesThisYear.reduce((acc, curr) => acc + curr.grandTotal, 0);

    const monthlyTrendMap = {};
    invoicesThisYear.forEach(inv => {
      const month = inv.createdAt.toLocaleString('default', { month: 'short' });
      if (!monthlyTrendMap[month]) {
        monthlyTrendMap[month] = { spend: 0, poCount: 0 };
      }
      monthlyTrendMap[month].spend += inv.grandTotal;
    });

    // Also count POs per month
    const posThisYear = await PurchaseOrder.find({
      ...poQuery,
      createdAt: { $gte: new Date(`${currentYear}-01-01`), $lte: new Date(`${currentYear}-12-31`) }
    });

    posThisYear.forEach(po => {
      const month = po.createdAt.toLocaleString('default', { month: 'short' });
      if (!monthlyTrendMap[month]) {
        monthlyTrendMap[month] = { spend: 0, poCount: 0 };
      }
      monthlyTrendMap[month].poCount += 1;
    });

    const monthlyProcurementTrend = Object.keys(monthlyTrendMap).map(month => ({
      month,
      spend: monthlyTrendMap[month].spend,
      poCount: monthlyTrendMap[month].poCount
    }));

    res.status(200).json({
      pendingApprovals,
      activeRFQs,
      totalVendors,
      monthlySpend,
      recentPurchaseOrders: recentPOs.map(po => ({
        id: po._id,
        poNumber: po.poNumber,
        vendorId: po.vendorId,
        grandTotal: po.grandTotal,
        status: po.status,
        createdAt: po.createdAt
      })),
      recentInvoices: recentInvoices.map(inv => ({
        id: inv._id,
        invoiceNumber: inv.invoiceNumber,
        grandTotal: inv.grandTotal,
        status: inv.status,
        createdAt: inv.createdAt
      })),
      monthlyProcurementTrend
    });
  } catch (error) {
    res.status(500).json({ error: true, message: 'Server error', code: 'SERVER_ERROR' });
  }
};

exports.getPublicStats = async (req, res) => {
  try {
    const totalVendors = await Vendor.countDocuments();
    const totalRFQs = await RFQ.countDocuments();
    const totalInvoices = await Invoice.countDocuments();
    
    res.status(200).json({
      vendors: totalVendors.toString(),
      rfqs: totalRFQs.toString(),
      savings: '24%', // Base system stat
      invoices: totalInvoices.toString()
    });
  } catch (error) {
    res.status(500).json({ error: true, message: 'Server error', code: 'SERVER_ERROR' });
  }
};
