const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  action: { type: String, required: true },
  entityType: { 
    type: String, 
    enum: ['rfq', 'vendor', 'quotation', 'approval', 'purchase_order', 'invoice', 'user'],
    required: true 
  },
  entityId: { type: mongoose.Schema.Types.ObjectId, required: true },
  metadata: { type: Object, default: null },
  timestamp: { type: Date, default: Date.now }
});

activityLogSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
    
    returnedObject.userId = returnedObject.userId.toString();
    returnedObject.entityId = returnedObject.entityId.toString();
  }
});

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);
module.exports = ActivityLog;
