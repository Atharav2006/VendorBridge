const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  website: { type: String },
  category: { type: String },
  city: { type: String },
  country: { type: String },
  notes: { type: String },
  gstNumber: { type: String },
  status: { 
    type: String, 
    enum: ['Active', 'Inactive', 'Pending', 'Blacklisted'],
    default: 'Active'
  },
  rating: { type: Number, default: 0, min: 0, max: 5 }
}, { timestamps: true });

const Vendor = mongoose.model('Vendor', vendorSchema);
module.exports = Vendor;
