const jwt = require('jsonwebtoken');
const AuditLog = require('../models/AuditLog');

const JWT_SECRET = process.env.JWT_SECRET || 'hospital_mis_privacy_secret_key_2026';

const logAuditEvent = async ({ userName, userRole, action, targetResource, patientId, status, reason }) => {
  try {
    const log = new AuditLog({
      logId: 'LOG-' + Math.floor(100000 + Math.random() * 900000),
      userName: userName || 'Anonymous',
      userRole: userRole || 'Guest',
      action,
      targetResource,
      patientId: patientId || 'N/A',
      status,
      reason: reason || 'Action evaluated by RBAC engine',
      timestamp: new Date()
    });
    await log.save();
  } catch (err) {
    console.error('Audit Log Error:', err.message);
  }
};

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  const demoRole = req.headers['x-demo-role'];

  if (!token && !demoRole) {
    return res.status(401).json({ message: 'Authentication token or active role required' });
  }

  if (token) {
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) return res.status(403).json({ message: 'Token invalid or expired' });
      req.user = user;
      next();
    });
  } else {
    // Demo header fallback for interactive UI testing
    req.user = {
      id: req.headers['x-demo-userid'] || 'demo-id',
      username: req.headers['x-demo-username'] || 'demouser',
      name: req.headers['x-demo-name'] || 'Demo User',
      role: demoRole
    };
    next();
  }
};

const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      logAuditEvent({
        userName: req.user ? req.user.name : 'Unknown',
        userRole: req.user ? req.user.role : 'Guest',
        action: 'ACCESS_ATTEMPT',
        targetResource: req.originalUrl,
        status: 'DENIED',
        reason: `Role '${req.user ? req.user.role : 'None'}' unauthorized for endpoint`
      });
      return res.status(403).json({ message: 'Access Denied: Insufficient Role Permissions' });
    }
    next();
  };
};

module.exports = {
  JWT_SECRET,
  authenticateToken,
  authorizeRoles,
  logAuditEvent
};
