const PurchaseOrder = require('../models/PurchaseOrder');
const AuditLog = require('../models/AuditLog');

// @desc    Get all purchase orders
// @route   GET /api/po
// @access  Private
const getPurchaseOrders = async (req, res) => {
  try {
    const pos = await PurchaseOrder.find()
      .populate('rfqId')
      .populate('quotationId')
      .sort({ createdAt: -1 });

    const formattedPOs = pos.map(po => {
      // Extract Quotation tax data safely
      const gstPercentage = po.taxSummary?.gstPercentage || 18;
      const gstAmount = po.taxSummary?.gstAmount || 0;
      const sub = (po.taxSummary?.grandTotal || 0) - gstAmount;

      return {
        _id: po._id,
        poNumber: po.poNumber,
        orderDate: po.createdAt,
        vendorDetails: {
          name: po.vendorDetails?.name || 'Vendor Name',
          email: po.vendorDetails?.email || 'vendor@example.com',
          phone: '+1 234 567 890',
          address: 'Vendor Address Line 1\nLine 2',
          taxId: 'VEND-TAX-9012'
        },
        billingDetails: {
          companyName: 'VendorBridge Enterprise',
          address: '123 Procurement Avenue\nTech District, NY 10001',
          taxId: 'COMP-TAX-1234'
        },
        invoiceDetails: {
          invoiceNumber: `INV-${po.poNumber}`,
          invoiceDate: po.createdAt,
          dueDate: new Date(po.createdAt.getTime() + 30 * 24 * 60 * 60 * 1000)
        },
        invoiceItems: po.invoiceItems || [],
        taxSummary: {
          subtotal: sub,
          taxRate: gstPercentage / 100,
          taxAmount: gstAmount,
          grandTotal: po.taxSummary?.grandTotal || 0
        },
        invoiceStatus: po.invoiceStatus || 'Draft',
        paymentStatus: po.paymentStatus || 'Unpaid'
      };
    });

    res.json({ success: true, data: formattedPOs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark PO as paid
// @route   PUT /api/po/:id/pay
// @access  Private (Admin/Manager)
const markAsPaid = async (req, res) => {
  try {
    const po = await PurchaseOrder.findById(req.params.id);
    if (!po) return res.status(404).json({ success: false, message: 'PO not found' });

    po.paymentStatus = 'Paid';
    po.invoiceStatus = 'Paid';
    await po.save();

    await AuditLog.create({
      user: req.user._id,
      action: 'Invoice Paid',
      entityType: 'PurchaseOrder',
      entityId: po._id,
      details: `Invoice for PO ${po.poNumber} marked as Paid.`
    });

    res.json({ success: true, data: po });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const PDFDocument = require('pdfkit');

// @desc    Download PO Invoice as PDF
// @route   GET /api/po/:id/download
// @access  Private
const downloadInvoicePDF = async (req, res) => {
  try {
    const po = await PurchaseOrder.findById(req.params.id);
    if (!po) return res.status(404).json({ success: false, message: 'PO not found' });

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Invoice-${po.poNumber}.pdf`);
    doc.pipe(res);

    doc.fontSize(20).text(`Purchase Order Invoice: ${po.poNumber}`, { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Vendor: ${po.vendorDetails?.name || 'N/A'}`);
    doc.text(`Email: ${po.vendorDetails?.email || 'N/A'}`);
    doc.moveDown();
    
    po.invoiceItems.forEach(item => {
      doc.text(`${item.description} - Qty: ${item.qty} - Unit Price: ₹${item.unitPrice} - Total: ₹${item.total}`);
    });

    doc.moveDown();
    doc.fontSize(14).text(`Grand Total: ₹${po.taxSummary?.grandTotal || 0}`, { align: 'right' });
    
    doc.end();
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Email PO Invoice
// @route   POST /api/po/:id/email
// @access  Private
const emailInvoice = async (req, res) => {
  try {
    const po = await PurchaseOrder.findById(req.params.id);
    if (!po) return res.status(404).json({ success: false, message: 'PO not found' });

    // Mocking email dispatch via nodemailer
    const nodemailer = require('nodemailer');
    // Using Ethereal for testing
    const testAccount = await nodemailer.createTestAccount();
    const transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: { user: testAccount.user, pass: testAccount.pass }
    });

    await transporter.sendMail({
      from: '"VendorBridge ERP" <erp@vendorbridge.com>',
      to: po.vendorDetails?.email || 'vendor@example.com',
      subject: `Invoice for Purchase Order ${po.poNumber}`,
      text: `Hello ${po.vendorDetails?.name}, please find attached the invoice for PO ${po.poNumber}.`
    });

    await AuditLog.create({
      user: req.user._id,
      action: 'Emailed Invoice',
      entityType: 'PurchaseOrder',
      entityId: po._id,
      details: `Invoice for PO ${po.poNumber} emailed to vendor.`
    });

    res.json({ success: true, message: 'Invoice successfully dispatched to vendor via email.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getPurchaseOrders, markAsPaid, downloadInvoicePDF, emailInvoice };
