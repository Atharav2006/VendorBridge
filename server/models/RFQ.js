const mongoose = require('mongoose');

const rfqItemSchema = new mongoose.Schema({
  description: { type: String, required: true },
  unit: { type: String, required: true },
  quantity: { type: Number, required: true },
  estimatedUnitPrice: { type: Number, default: 0 },
  remarks: { type: String }
});

const rfqSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  rfqNumber: { type: String, required: true, unique: true },
  priority: { type: String, enum: ['Low', 'Medium', 'High', 'Urgent'], default: 'Medium' },
  department: { type: String },
  deadline: { type: Date, required: true },
  rfqItems: [rfqItemSchema],
  assignedVendors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['Draft', 'Active', 'Closed'], default: 'Active' }
}, { timestamps: true });

const RFQ = mongoose.model('RFQ', rfqSchema);
module.exports = RFQ;
