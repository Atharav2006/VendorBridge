const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  gst: {
    type: String,
    required: true,
  },
  contactPerson: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['Active', 'Onboarding', 'Suspended', 'active', 'inactive', 'blacklisted'],
    default: 'Active',
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: null,
  },
  linkedUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  profile: {
    description: { type: String, default: '' },
    founded: { type: String, default: '' },
    website: { type: String, default: '' },
    address: { type: String, default: '' }
  }
}, {
  timestamps: true,
});

vendorSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
    
    // Ensure linkedUserId is a string or null
    if (returnedObject.linkedUserId) {
      returnedObject.linkedUserId = returnedObject.linkedUserId.toString();
    }
  }
});

const Vendor = mongoose.model('Vendor', vendorSchema);
module.exports = Vendor;
