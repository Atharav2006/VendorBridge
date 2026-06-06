const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['rfq_assigned', 'quotation_received', 'approval_requested', 'approval_done', 'po_generated', 'invoice_sent'],
    required: true
  },
  message: { type: String, required: true },
  entityType: { type: String, required: true },
  entityId: { type: mongoose.Schema.Types.ObjectId, required: true },
  isRead: { type: Boolean, default: false }
}, {
  timestamps: true,
});

notificationSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
    
    returnedObject.userId = returnedObject.userId.toString();
    returnedObject.entityId = returnedObject.entityId.toString();
  }
});

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;
