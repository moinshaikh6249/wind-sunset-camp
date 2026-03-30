export const adminMiddleware = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.',
    });
  }

  if (req.user.role !== 'admin' && req.user.role !== 'super-admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.',
    });
  }

  next();
};

export const superAdminMiddleware = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.',
    });
  }

  if (req.user.role !== 'super-admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Super admin privileges required.',
    });
  }

  next();
};

export const requirePermission = (permission) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.',
    });
  }

  if (req.user.role === 'super-admin') {
    return next();
  }

  if (req.user.permissions && req.user.permissions[permission]) {
    return next();
  }

  res.status(403).json({
    success: false,
    message: `Access denied. Permission '${permission}' required.`,
  });
};
