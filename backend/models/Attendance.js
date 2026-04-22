const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  checkIn: { type: Date },
  checkOut: { type: Date },
  checkInLocation: {
    lat: Number,
    lng: Number,
    address: String
  },
  checkOutLocation: {
    lat: Number,
    lng: Number,
    address: String
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'half-day', 'late', 'lop'],
    default: 'absent'
  },
  lopDeducted: { type: Boolean, default: false },
  workHours: { type: Number, default: 0 },
  remarks: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Attendance', AttendanceSchema);