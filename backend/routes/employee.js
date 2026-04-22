const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const Feedback = require('../models/Feedback');

// Get all employees (admin)
router.get('/', auth, async (req, res) => {
  try {
    const employees = await User.find({ role: { $ne: 'admin' } }).select('-password');
    res.json(employees);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get single employee profile
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Update responsibilities
router.put('/:id/responsibilities', auth, async (req, res) => {
  try {
    const { responsibilities } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { responsibilities },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get employee stats (for dashboard)
router.get('/:id/stats', auth, async (req, res) => {
  try {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const attendance = await Attendance.find({
      employee: req.params.id,
      date: { $regex: `^${currentMonth}` }
    });

    const totalDays = attendance.length;
    const presentDays = attendance.filter(a => a.status === 'present').length;
    const lopDays = attendance.filter(a => a.lopDeducted).length;
    const lateDays = attendance.filter(a => a.status === 'late').length;

    const leaves = await Leave.find({ employee: req.params.id, status: 'approved' });
    const feedbacks = await Feedback.find({ employee: req.params.id }).sort({ createdAt: -1 }).limit(5);

    const avgRating = feedbacks.length
      ? (feedbacks.reduce((s, f) => s + f.rating, 0) / feedbacks.length).toFixed(1)
      : 0;

    res.json({ totalDays, presentDays, lopDays, lateDays, leaves: leaves.length, avgRating, feedbacks });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;