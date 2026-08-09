const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  logId: { type: String, required: true, unique: true },
  userName: { type: String, required: true },
  userRole: { type: String, required: true },
  action: { type: String, required: true }, // e.g., VIEW_PATIENT, EDIT_EHR, CREATE_APPOINTMENT, ACCESS_DENIED
  targetResource: { type: String, required: true },
  patientId: { type: String },
  status: { type: String, enum: ['GRANTED', 'DENIED', 'MASKED_ACCESS'], required: true },
  reason: { type: String },
  ipAddress: { type: String, default: '192.168.1.100' },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
