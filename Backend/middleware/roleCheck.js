const roleCheck = (roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ error: true, message: 'Authentication required', code: 'UNAUTHENTICATED' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: true, message: 'Not authorized to perform this action', code: 'FORBIDDEN' });
    }

    next();
  };
};

module.exports = roleCheck;
