const Invoice = require('../models/Invoice');
const PurchaseOrder = require('../models/PurchaseOrder');
const Vendor = require('../models/Vendor');
const ActivityLog = require('../models/ActivityLog');
const PDFDocument = require('pdfkit');
const nodemailer = require('nodemailer');

exports.getInvoices = async (req, res) => {
  try {
    const { status, vendorId } = req.query;
    let query = {};
    if (status) query.status = status;
    if (vendorId) query.vendorId = vendorId;

    if (req.user.role === 'vendor') {
      const vendor = await Vendor.findOne({ linkedUserId: req.user._id });
      if (!vendor) return res.status(200).json({ invoices: [] });
      query.vendorId = vendor._id;
    }

    const invoices = await Invoice.find(query);
    res.status(200).json({ invoices });
  } catch (error) {
    res.status(500).json({ error: true, message: 'Server error', code: 'SERVER_ERROR' });
  }
};

exports.getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ error: true, message: 'Invoice not found', code: 'NOT_FOUND' });
    }
    res.status(200).json(invoice);
  } catch (error) {
    res.status(500).json({ error: true, message: 'Server error', code: 'SERVER_ERROR' });
  }
};

exports.createInvoice = async (req, res) => {
  try {
    const { purchaseOrderId } = req.body;
    
    const po = await PurchaseOrder.findById(purchaseOrderId).populate('vendorId');
    if (!po) {
      return res.status(404).json({ error: true, message: 'Purchase Order not found', code: 'NOT_FOUND' });
    }

    const invCount = await Invoice.countDocuments();
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(invCount + 1).padStart(4, '0')}`;

    const vendor = po.vendorId;

    const invoice = await Invoice.create({
      invoiceNumber,
      purchaseOrderId: po._id,
      vendorId: vendor._id,
      billingDetails: {
        companyName: vendor.name,
        address: vendor.address,
        gst: vendor.gst
      },
      items: po.items,
      subtotal: po.subtotal,
      taxPercent: po.taxPercent,
      taxAmount: po.taxAmount,
      grandTotal: po.grandTotal
    });

    await ActivityLog.create({
      userId: req.user._id,
      userName: req.user.name,
      action: 'Generated Invoice',
      entityType: 'invoice',
      entityId: invoice._id
    });

    res.status(201).json(invoice);
  } catch (error) {
    res.status(400).json({ error: true, message: error.message, code: 'BAD_REQUEST' });
  }
};

exports.downloadInvoicePdf = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ error: true, message: 'Invoice not found', code: 'NOT_FOUND' });
    }

    // Generate Professional PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${invoice.invoiceNumber}.pdf"`);

    const doc = new PDFDocument();
    doc.pipe(res);

    doc.fontSize(20).text('VendorBridge Invoice', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Company Name: ${invoice.billingDetails.companyName}`);
    doc.text(`Invoice Number: ${invoice.invoiceNumber}`);
    doc.text(`Date: ${new Date(invoice.createdAt).toLocaleDateString()}`);
    doc.text(`Vendor Address: ${invoice.billingDetails.address}`);
    doc.text(`GST: ${invoice.billingDetails.gst}`);
    doc.moveDown();

    doc.text('Items:', { underline: true });
    invoice.items.forEach(item => {
      doc.text(`${item.name} - ${item.quantity} x ₹${item.unitPrice} = ₹${item.totalPrice}`);
    });

    doc.moveDown();
    doc.text(`Subtotal: ₹${invoice.subtotal}`);
    doc.text(`Tax (18% GST): ₹${invoice.taxAmount}`);
    doc.text(`Grand Total: ₹${invoice.grandTotal}`, { bold: true });

    doc.moveDown(2);
    doc.text('Thank you for your business', { align: 'center' });

    doc.end();
  } catch (error) {
    res.status(500).json({ error: true, message: 'Server error', code: 'SERVER_ERROR' });
  }
};

exports.emailInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate('vendorId');

    if (!invoice) {
      return res.status(404).json({ error: true, message: 'Invoice not found', code: 'NOT_FOUND' });
    }

    const recipientEmail = req.body?.recipientEmail || req.user.email || invoice.vendorId?.email;
    if (!recipientEmail) {
       return res.status(400).json({ error: true, message: 'No recipient email found for this user', code: 'BAD_REQUEST' });
    }

    // Generate PDF in memory
    const doc = new PDFDocument();
    let buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    
    // Build PDF content
    doc.fontSize(20).text('VendorBridge Invoice', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Company Name: ${invoice.billingDetails.companyName}`);
    doc.text(`Invoice Number: ${invoice.invoiceNumber}`);
    doc.text(`Date: ${new Date(invoice.createdAt).toLocaleDateString()}`);
    doc.text(`Vendor Address: ${invoice.billingDetails.address}`);
    doc.text(`GST: ${invoice.billingDetails.gst}`);
    doc.moveDown();
    doc.text('Items:', { underline: true });
    invoice.items.forEach(item => {
      doc.text(`${item.name} - ${item.quantity} x ₹${item.unitPrice} = ₹${item.totalPrice}`);
    });
    doc.moveDown();
    doc.text(`Subtotal: ₹${invoice.subtotal}`);
    doc.text(`Tax (18% GST): ₹${invoice.taxAmount}`);
    doc.text(`Grand Total: ₹${invoice.grandTotal}`, { bold: true });
    doc.moveDown(2);
    doc.text('Thank you for your business', { align: 'center' });
    doc.end();

    doc.on('end', async () => {
      let pdfData = Buffer.concat(buffers);

      let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      try {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: recipientEmail,
          subject: `Invoice ${invoice.invoiceNumber}`,
          text: 'Please find your generated invoice attached.',
          attachments: [{
            filename: `${invoice.invoiceNumber}.pdf`,
            content: pdfData
          }]
        });

        await Invoice.updateOne(
          { _id: invoice._id },
          { 
            $set: { 
              status: 'sent', 
              emailSentTo: recipientEmail, 
              emailSentAt: new Date() 
            } 
          }
        );

        res.status(200).json({
          message: 'Invoice emailed successfully',
          sentTo: recipientEmail,
          sentAt: new Date()
        });
      } catch (emailErr) {
        console.error("Email Error: ", emailErr);
        require('fs').writeFileSync('email_error.log', JSON.stringify({ message: emailErr.message, stack: emailErr.stack }));
        res.status(500).json({ error: true, message: emailErr.message || 'Failed to send email.', stack: emailErr.stack, code: 'SERVER_ERROR' });
      }
    });

  } catch (error) {
    require('fs').writeFileSync('email_error.log', JSON.stringify({ message: error.message, stack: error.stack }));
    res.status(500).json({ error: true, message: error.message || 'Server error', stack: error.stack, code: 'SERVER_ERROR' });
  }
};

exports.updateInvoiceStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const invoice = await Invoice.findByIdAndUpdate(req.params.id, { status }, { new: true, runValidators: true });
    
    if (!invoice) {
      return res.status(404).json({ error: true, message: 'Invoice not found', code: 'NOT_FOUND' });
    }
    
    await ActivityLog.create({
      userId: req.user._id,
      userName: req.user.name,
      action: `Marked Invoice as ${status}`,
      entityType: 'invoice',
      entityId: invoice._id
    });
    
    res.status(200).json(invoice);
  } catch (error) {
    res.status(400).json({ error: true, message: error.message, code: 'BAD_REQUEST' });
  }
};
