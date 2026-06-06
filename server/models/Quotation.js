const mongoose = require('mongoose');

const quotationItemSchema = new mongoose.Schema({
  description: { type: String, required: true },
  unit: { type: String },
  quantity: { type: Number, required: true },
  unitPrice: { type: Number, required: true },
  lineTotal: { type: Number, required: true }
});

const quotationSchema = new mongoose.Schema({
  rfqId: { type: mongoose.Schema.Types.ObjectId, ref: 'RFQ', required: true },
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
  quotationId: { type: String, required: true, unique: true },
  quotationItems: [quotationItemSchema],
  taxSummary: {
    gstPercentage: { type: Number, default: 0 },
    gstAmount: { type: Number, default: 0 },
    tdsPercentage: { type: Number, default: 0 },
    tdsAmount: { type: Number, default: 0 },
    otherCharges: { type: Number, default: 0 },
    otherChargesDescription: { type: String }
  },
  paymentTerms: {
    advancePercentage: { type: Number, default: 0 },
    creditDays: { type: Number, default: 0 },
    paymentMethod: { type: String },
    milestones: { type: String }
  },
  deliveryTimeline: {
    expectedDeliveryDate: { type: Date },
    deliveryLocation: { type: String },
    shippingMode: { type: String },
    partialDelivery: { type: Boolean, default: false },
    warrantyPeriod: { type: String }
  },
  quotationForm: {
    validityDays: { type: Number, default: 30 }
  },
  grandTotal: { type: Number, required: true },
  notes: { type: String },
  status: { type: String, enum: ['Draft', 'Submitted', 'Selected', 'Rejected'], default: 'Submitted' }
}, { timestamps: true });

const Quotation = mongoose.model('Quotation', quotationSchema);
module.exports = Quotation;
