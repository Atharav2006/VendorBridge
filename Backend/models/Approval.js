const mongoose = require('mongoose');

const approvalSchema = new mongoose.Schema({
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
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  status: {
    type: String,
    default: 'Pending',
  },
  remarks: {
    type: String,
    default: null,
  },
  approvalTimeline: [{
    action: { type: String, required: true },
    by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    at: { type: Date, default: Date.now },
    remarks: { type: String, default: null }
  }]
}, {
  timestamps: true,
});

approvalSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
    
    returnedObject.rfqId = returnedObject.rfqId.toString();
    returnedObject.quotationId = returnedObject.quotationId.toString();
    returnedObject.requestedBy = returnedObject.requestedBy.toString();
    if (returnedObject.approvedBy) returnedObject.approvedBy = returnedObject.approvedBy.toString();
    
    if (returnedObject.approvalTimeline) {
      returnedObject.approvalTimeline = returnedObject.approvalTimeline.map(t => {
        t.by = t.by.toString();
        return t;
      });
    }
  }
});

const Approval = mongoose.model('Approval', approvalSchema);
module.exports = Approval;
