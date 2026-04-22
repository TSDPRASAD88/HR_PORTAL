const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Leave = require('../models/Leave');
const User = require('../models/User');

// Apply for leave
router.post('/apply', auth, async (req, res) => {
  try {
    const { leaveType, fromDate, toDate, reason } = req.body;
    const user = await User.findById(req.user.id);

    const from = new Date(fromDate);
    const to = new Date(toDate);
    const days = Math.ceil((to - from) / (1000 * 60 * 60 * 24)) + 1;

    let isLOP = false;
    if (leaveType === 'casual') {
      if (user.casualLeavesUsed >= user.casualLeavesTotal) {
        isLOP = true;
      }
    } else {
      isLOP = true;
    }

    const leave = new Leave({
      employee: req.user.id,
      leaveType: isLOP ? 'lop' : leaveType,
      fromDate: from,
      toDate: to,
      days,
      reason,
      isLOP
    });

    await leave.save();
    res.json({ msg: 'Leave applied successfully', leave, isLOP });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// Get my leaves
router.get('/my', auth, async (req, res) => {
  try {
    const leaves = await Leave.find({ employee: req.user.id }).sort({ createdAt: -1 });
    res.json(leaves);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Admin: Get all leaves
router.get('/all', auth, async (req, res) => {
  try {
    const leaves = await Leave.find({})
      .populate('employee', 'name email department')
      .populate('approvedBy', 'name')
      .sort({ createdAt: -1 });
    res.json(leaves);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Admin: Approve/Reject leave
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status, adminRemarks } = req.body;
    const leave = await Leave.findById(req.params.id).populate('employee');

    leave.status = status;
    leave.adminRemarks = adminRemarks || '';
    leave.approvedBy = req.user.id;

    if (status === 'approved' && leave.leaveType === 'casual' && !leave.isLOP) {
      await User.findByIdAndUpdate(leave.employee._id, {
        $inc: { casualLeavesUsed: leave.days }
      });
    }

    await leave.save();
    res.json({ msg: `Leave ${status}`, leave });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;