const mongoose = require('mongoose');

const billingSchema = new mongoose.Schema({
  invoiceId: { type: String, required: true, unique: true },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  items: [{
    description: String,
    cost: Number
  }],
  totalAmount: { type: Number, required: true },
  discountAmount: { type: Number, default: 0 },
  insuranceClaimed: { type: Boolean, default: false },
  insuranceAmountCovered: { type: Number, default: 0 },
  amountPaid: { type: Number, default: 0 },
  paymentStatus: { type: String, enum: ['Paid', 'Pending', 'Partially Paid', 'Overdue'], default: 'Pending' },
  dueDate: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Billing', billingSchema);
