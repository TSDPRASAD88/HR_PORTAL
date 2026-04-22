const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Attendance = require('../models/Attendance');

const OFFICE_START = 9; // 9:00 AM
const LATE_CUTOFF = 10; // After 10:00 AM = half-day LOP

// Check In
router.post('/checkin', auth, async (req, res) => {
  try {
    const { lat, lng, address } = req.body;
    const today = new Date().toISOString().split('T')[0];

    let record = await Attendance.findOne({ employee: req.user.id, date: today });
    if (record && record.checkIn) {
      return res.status(400).json({ msg: 'Already checked in today' });
    }

    const now = new Date();
    const hour = now.getHours();
    let status = 'present';
    let lopDeducted = false;

    if (hour >= LATE_CUTOFF) {
      status = 'half-day';
      lopDeducted = true;
    } else if (hour >= OFFICE_START) {
      status = 'late';
    }

    if (!record) {
      record = new Attendance({
        employee: req.user.id,
        date: today,
        checkIn: now,
        checkInLocation: { lat, lng, address },
        status,
        lopDeducted
      });
    } else {
      record.checkIn = now;
      record.checkInLocation = { lat, lng, address };
      record.status = status;
      record.lopDeducted = lopDeducted;
    }

    await record.save();
    res.json({ msg: 'Checked in successfully', record });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// Check Out
router.post('/checkout', auth, async (req, res) => {
  try {
    const { lat, lng, address } = req.body;
    const today = new Date().toISOString().split('T')[0];

    const record = await Attendance.findOne({ employee: req.user.id, date: today });
    if (!record || !record.checkIn) {
      return res.status(400).json({ msg: 'No check-in found for today' });
    }
    if (record.checkOut) {
      return res.status(400).json({ msg: 'Already checked out today' });
    }

    const now = new Date();
    const workMs = now - new Date(record.checkIn);
    const workHours = workMs / (1000 * 60 * 60);

    record.checkOut = now;
    record.checkOutLocation = { lat, lng, address };
    record.workHours = parseFloat(workHours.toFixed(2));

    await record.save();
    res.json({ msg: 'Checked out successfully', record });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// Get my attendance
router.get('/my', auth, async (req, res) => {
  try {
    const { month } = req.query; // e.g., "2024-06"
    let query = { employee: req.user.id };
    if (month) {
      query.date = { $regex: `^${month}` };
    }
    const records = await Attendance.find(query).sort({ date: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get today's status
router.get('/today', auth, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const record = await Attendance.findOne({ employee: req.user.id, date: today });
    res.json(record || null);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Admin: Get all attendance
router.get('/all', auth, async (req, res) => {
  try {
    const { date } = req.query;
    let query = {};
    if (date) query.date = date;
    const records = await Attendance.find(query).populate('employee', 'name email department').sort({ date: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;