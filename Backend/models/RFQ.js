const mongoose = require('mongoose');

const rfqSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  items: [{
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    unit: { type: String, required: true }
  }],
  deadline: {
    type: Date,
    required: true,
  },
  attachmentUrl: {
    type: String,
    default: null,
  },
  assignedVendorIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
  }],
  status: {
    type: String,
    default: 'Open',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }
}, {
  timestamps: true,
});

rfqSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
    
    returnedObject.assignedVendorIds = returnedObject.assignedVendorIds.map(v => v.toString());
    returnedObject.createdBy = returnedObject.createdBy.toString();
  }
});

const RFQ = mongoose.model('RFQ', rfqSchema);
module.exports = RFQ;
