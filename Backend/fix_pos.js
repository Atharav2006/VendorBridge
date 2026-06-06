require('dotenv').config();
const mongoose = require('mongoose');
const Approval = require('./models/Approval');
const Quotation = require('./models/Quotation');
const PurchaseOrder = require('./models/PurchaseOrder');

async function fixMissingPOs() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const approvals = await Approval.find({ status: 'approved' });
    let created = 0;
    
    for (const approval of approvals) {
      const existingPO = await PurchaseOrder.findOne({ approvalId: approval._id });
      if (!existingPO) {
        const quotation = await Quotation.findById(approval.quotationId);
        if (quotation) {
          const poCount = await PurchaseOrder.countDocuments();
          const poNumber = `PO-${new Date().getFullYear()}-${String(poCount + 1).padStart(4, '0')}`;
          
          await PurchaseOrder.create({
            poNumber,
            rfqId: approval.rfqId,
            quotationId: quotation._id,
            vendorId: quotation.vendorId,
            items: quotation.items,
            subtotal: quotation.subtotal,
            taxPercent: quotation.taxPercent,
            taxAmount: quotation.taxAmount,
            grandTotal: quotation.grandTotal,
            createdBy: approval.approvedBy
          });
          created++;
        }
      }
    }
    console.log(`Successfully generated ${created} missing Purchase Orders!`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

fixMissingPOs();
