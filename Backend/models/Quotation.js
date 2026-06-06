const mongoose = require('mongoose');

const quotationSchema = new mongoose.Schema({
  rfqId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RFQ',
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
  deliveryDays: {
    type: Number,
    required: true,
  },
  notes: {
    type: String,
    default: null,
  },
  subtotal: {
    type: Number,
    required: true,
  },
  taxPercent: {
    type: Number,
    required: true,
  },
  taxAmount: {
    type: Number,
    required: true,
  },
  grandTotal: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    default: 'Pending',
  }
}, {
  timestamps: true,
});

quotationSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
    
    returnedObject.rfqId = returnedObject.rfqId.toString();
    returnedObject.vendorId = returnedObject.vendorId.toString();
    
    // API contract uses submittedAt and updatedAt
    returnedObject.submittedAt = returnedObject.createdAt;
  }
});

const Quotation = mongoose.model('Quotation', quotationSchema);
module.exports = Quotation;
