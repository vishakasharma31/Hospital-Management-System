const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema({
  recordId: { type: String, required: true, unique: true },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  diagnosis: { type: String, required: true },
  symptoms: [String],
  treatmentPlan: { type: String },
  prescriptions: [{
    medicine: String,
    dosage: String,
    frequency: String,
    duration: String
  }],
  labResults: {
    testName: String,
    resultSummary: String,
    status: { type: String, enum: ['Pending', 'Normal', 'Abnormal', 'Critical'], default: 'Normal' }
  },
  privacyClassification: { 
    type: String, 
    enum: ['Public', 'Internal-Doctor-Only', 'High-Security-Confidential'], 
    default: 'Internal-Doctor-Only' 
  },
  date: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);
