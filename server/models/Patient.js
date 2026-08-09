const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  patientId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  bloodGroup: { type: String, required: true },
  ssn: { type: String, required: true }, // PII: Masked for unauthorized roles
  phone: { type: String, required: true }, // PII: Masked for unauthorized roles
  email: { type: String, required: true },
  address: { type: String, required: true }, // PII: Masked for unauthorized roles
  emergencyContact: { type: String },
  assignedDoctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  privacyLevel: { 
    type: String, 
    enum: ['Standard', 'Confidential', 'Restricted'], 
    default: 'Standard' 
  },
  consentForResearch: { type: Boolean, default: false },
  medicalHistorySummary: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Linked patient user account if exists
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Patient', patientSchema);
