const ActivityLog = require('../models/ActivityLog');

exports.getLogs = async (req, res) => {
  try {
    const { entityType, userId, limit = 50, page = 1 } = req.query;
    let query = {};
    
    if (entityType) query.entityType = entityType;
    if (userId) query.userId = userId;

    const skip = (page - 1) * limit;

    const logs = await ActivityLog.find(query)
      .sort({ timestamp: -1 })
      .skip(Number(skip))
      .limit(Number(limit));

    const total = await ActivityLog.countDocuments(query);

    res.status(200).json({ logs, total });
  } catch (error) {
    res.status(500).json({ error: true, message: 'Server error', code: 'SERVER_ERROR' });
  }
};
