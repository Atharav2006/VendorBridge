require('dotenv').config();
const mongoose = require('mongoose');
const PurchaseOrder = require('./models/PurchaseOrder');
const Invoice = require('./models/Invoice');
const Vendor = require('./models/Vendor');

async function test() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const po = await PurchaseOrder.findOne({ status: { $ne: 'Completed' } });
    if (!po) {
      console.log('no po');
      process.exit();
    }
    
    // simulate poController.js lines
    const status = 'Accepted';
    const updatedPo = await PurchaseOrder.findByIdAndUpdate(po._id, { status }, { new: true, runValidators: true }).populate('vendorId');
    
    console.log("updatedPo vendor:", updatedPo.vendorId);
    
    if (status === 'Accepted') {
      const invCount = await Invoice.countDocuments();
      const invoiceNumber = `INV-${new Date().getFullYear()}-${String(invCount + 1).padStart(4, '0')}`;
      const vendor = updatedPo.vendorId;
      
      const inv = await Invoice.create({
        invoiceNumber,
        purchaseOrderId: updatedPo._id,
        vendorId: vendor._id,
        billingDetails: {
          companyName: vendor?.name || 'Verified Vendor',
          address: vendor?.address || 'VendorBridge Corporate Network',
          gst: vendor?.gst || 'GST-PENDING'
        },
        items: updatedPo.items,
        subtotal: updatedPo.subtotal,
        taxPercent: updatedPo.taxPercent,
        taxAmount: updatedPo.taxAmount,
        grandTotal: updatedPo.grandTotal
      });
      console.log("created inv:", inv._id);
    }
    
    process.exit(0);
  } catch (err) {
    console.error("ERROR:", err.message);
    process.exit(1);
  }
}

test();
