require('dotenv').config();
const mongoose = require('mongoose');
const PurchaseOrder = require('./models/PurchaseOrder');
const Vendor = require('./models/Vendor');
const Invoice = require('./models/Invoice');

async function testPOAccept() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    const po = await PurchaseOrder.findOne().populate('vendorId');
    if (!po) {
      console.log("No PO found.");
      process.exit(0);
    }
    
    console.log("PO Vendor ID:", po.vendorId);
    
    const vendor = po.vendorId;
    
    const invoiceNumber = `INV-TEST-001`;
    try {
      const invoice = await Invoice.create({
        invoiceNumber,
        purchaseOrderId: po._id,
        vendorId: vendor._id,
        billingDetails: {
          companyName: vendor.name || 'Test',
          address: vendor.address || 'Test',
          gst: vendor.gst || 'Test'
        },
        items: po.items,
        subtotal: po.subtotal,
        taxPercent: po.taxPercent,
        taxAmount: po.taxAmount,
        grandTotal: po.grandTotal
      });
      console.log("Invoice created successfully!", invoice._id);
    } catch (e) {
      console.log("Invoice creation error:", e.message);
    }
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

testPOAccept();
