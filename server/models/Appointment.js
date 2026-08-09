const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  appointmentId: { type: String, required: true, unique: true },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  department: { type: String, required: true },
  type: { type: String, enum: ['Consultation', 'Follow-up', 'Emergency', 'Routine Checkup'], default: 'Consultation' },
  status: { type: String, enum: ['Scheduled', 'Completed', 'Cancelled', 'In-Progress'], default: 'Scheduled' },
  reason: { type: String },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Appointment', appointmentSchema);
