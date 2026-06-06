const mongoose = require('mongoose');

const purchaseOrderSchema = new mongoose.Schema({
  poNumber: {
    type: String,
    required: true,
    unique: true,
  },
  rfqId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RFQ',
    required: true,
  },
  quotationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quotation',
    required: true,
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true,
  },
  items: [{
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    totalPrice: { type: Number, required: true }
  }],
  subtotal: { type: Number, required: true },
  taxPercent: { type: Number, required: true },
  taxAmount: { type: Number, required: true },
  grandTotal: { type: Number, required: true },
  status: {
    type: String,
    default: 'Pending',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }
}, {
  timestamps: true,
});

purchaseOrderSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
    
    returnedObject.rfqId = returnedObject.rfqId.toString();
    returnedObject.quotationId = returnedObject.quotationId.toString();
    returnedObject.vendorId = returnedObject.vendorId.toString();
    returnedObject.createdBy = returnedObject.createdBy.toString();
  }
});

const PurchaseOrder = mongoose.model('PurchaseOrder', purchaseOrderSchema);
module.exports = PurchaseOrder;
