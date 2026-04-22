const mongoose = require('mongoose');

const LeaveSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  leaveType: {
    type: String,
    enum: ['casual', 'lop', 'sick', 'emergency'],
    required: true
  },
  fromDate: { type: Date, required: true },
  toDate: { type: Date, required: true },
  days: { type: Number, required: true },
  reason: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  adminRemarks: { type: String, default: '' },
  isLOP: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Leave', LeaveSchema);