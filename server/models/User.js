const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['Admin', 'Doctor', 'Staff', 'Patient'], 
    required: true 
  },
  department: { type: String, default: 'General' },
  specialization: { type: String },
  phone: { type: String },
  privacyClearance: { 
    type: String, 
    enum: ['High', 'Medium', 'Standard', 'PersonalOnly'], 
    default: 'Standard' 
  },
  avatar: { type: String, default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
