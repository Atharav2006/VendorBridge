const mongoose = require('mongoose');

const purchaseOrderSchema = new mongoose.Schema({
  poNumber: { type: String, required: true, unique: true },
  rfqId: { type: mongoose.Schema.Types.ObjectId, ref: 'RFQ' },
  quotationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quotation', required: true },
  vendorDetails: {
    name: String,
    email: String,
    phone: String,
    address: String,
    taxId: String
  },
  billingDetails: {
    companyName: String,
    address: String,
    taxId: String
  },
  invoiceDetails: {
    invoiceNumber: String,
    invoiceDate: Date,
    dueDate: Date
  },
  orderDate: { type: Date, default: Date.now },
  invoiceItems: [{
    description: String,
    qty: Number,
    unitPrice: Number,
    total: Number
  }],
  taxSummary: {
    subtotal: Number,
    taxRate: Number,
    taxAmount: Number,
    grandTotal: Number
  },
  invoiceStatus: { type: String, enum: ['Draft', 'Sent', 'Paid', 'Overdue'], default: 'Draft' },
  paymentStatus: { type: String, enum: ['Unpaid', 'Partially Paid', 'Paid'], default: 'Unpaid' }
}, { timestamps: true });

const PurchaseOrder = mongoose.model('PurchaseOrder', purchaseOrderSchema);
module.exports = PurchaseOrder;
