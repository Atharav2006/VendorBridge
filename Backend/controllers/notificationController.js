const Notification = require('../models/Notification');

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 });
    const unreadCount = await Notification.countDocuments({ userId: req.user._id, isRead: false });

    res.status(200).json({ notifications, unreadCount });
  } catch (error) {
    res.status(500).json({ error: true, message: 'Server error', code: 'SERVER_ERROR' });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ error: true, message: 'Notification not found', code: 'NOT_FOUND' });
    }

    res.status(200).json({ message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ error: true, message: 'Server error', code: 'SERVER_ERROR' });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user._id, isRead: false }, { isRead: true });
    res.status(200).json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ error: true, message: 'Server error', code: 'SERVER_ERROR' });
  }
};
