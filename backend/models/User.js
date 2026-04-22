const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['employee', 'admin', 'hr'], default: 'employee' },
  department: { type: String, default: '' },
  position: { type: String, default: '' },
  phone: { type: String, default: '' },
  joiningDate: { type: Date, default: Date.now },
  responsibilities: [{ type: String }],
  casualLeavesUsed: { type: Number, default: 0 },
  casualLeavesTotal: { type: Number, default: 1 },
  avatar: { type: String, default: '' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);