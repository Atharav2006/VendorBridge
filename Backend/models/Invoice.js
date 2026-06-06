const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    required: true,
    unique: true,
  },
  purchaseOrderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PurchaseOrder',
    required: true,
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true,
  },
  billingDetails: {
    companyName: { type: String, required: true },
    address: { type: String, required: true },
    gst: { type: String, required: true }
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
    default: 'Draft',
  },
  pdfUrl: { type: String, default: null },
  emailSentTo: { type: String, default: null },
  emailSentAt: { type: Date, default: null }
}, {
  timestamps: true,
});

invoiceSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
    
    returnedObject.purchaseOrderId = returnedObject.purchaseOrderId.toString();
    returnedObject.vendorId = returnedObject.vendorId.toString();
  }
});

const Invoice = mongoose.model('Invoice', invoiceSchema);
module.exports = Invoice;
