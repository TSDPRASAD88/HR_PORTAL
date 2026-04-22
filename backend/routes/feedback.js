const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Feedback = require('../models/Feedback');

// Add feedback
router.post('/', auth, async (req, res) => {
  try {
    const { employee, type, rating, comment, month } = req.body;
    const feedback = new Feedback({
      employee,
      givenBy: req.user.id,
      type,
      rating,
      comment,
      month: month || new Date().toISOString().slice(0, 7)
    });
    await feedback.save();
    res.json({ msg: 'Feedback added', feedback });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// Get feedback for an employee
router.get('/employee/:id', auth, async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ employee: req.params.id })
      .populate('givenBy', 'name role')
      .sort({ createdAt: -1 });
    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get all feedbacks (admin)
router.get('/all', auth, async (req, res) => {
  try {
    const feedbacks = await Feedback.find({})
      .populate('employee', 'name department')
      .populate('givenBy', 'name role')
      .sort({ createdAt: -1 });
    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;