const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Reminder = require('../models/Reminder');
const Event = require('../models/Event');

// @route   POST api/reminders/:eventId
// @desc    Set a reminder for an event
// @access  Private
router.post('/:eventId', auth, async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user;
    const { reminderDate } = req.body;

    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if reminderDate is valid and in the future
    if (!reminderDate || new Date(reminderDate) <= new Date()) {
      return res.status(400).json({ message: 'Reminder date must be a future date' });
    }

    // Check if reminder already exists for this user and event
    let reminder = await Reminder.findOne({ user: userId, event: eventId });
    if (reminder) {
      return res.status(400).json({ message: 'Reminder already set for this event' });
    }

    reminder = new Reminder({
      user: userId,
      event: eventId,
      reminderDate: new Date(reminderDate),
    });

    await reminder.save();
    res.status(201).json({ message: 'Reminder set successfully', reminder });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/reminders/my
// @desc    Get all reminders for the logged-in user
// @access  Private
router.get('/my', auth, async (req, res) => {
  try {
    const reminders = await Reminder.find({ user: req.user })
      .populate('event', 'title date location organizer')
      .sort({ reminderDate: 1 }); // Sort by upcoming reminders
    res.json(reminders);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/reminders/:id
// @desc    Cancel a reminder
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const reminder = await Reminder.findById(req.params.id);

    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    // Ensure user owns the reminder
    if (reminder.user.toString() !== req.user) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    await reminder.deleteOne();
    res.json({ message: 'Reminder cancelled successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router; 