const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Message = require('../models/Message');
const Event = require('../models/Event');

// @route   POST api/messages/:eventId
// @desc    Send a message in an event chat
// @access  Private
router.post('/:eventId', [auth, [check('text', 'Message text is required').not().isEmpty()]], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { eventId } = req.params;
    const userId = req.user;
    const { text } = req.body;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Optional: Check if user is registered for the event to send messages
    // const isRegistered = event.registeredUsers.some(reg => reg.userId.toString() === userId);
    // if (!isRegistered) {
    //   return res.status(403).json({ message: 'You must be registered for this event to send messages' });
    // }

    const newMessage = new Message({
      user: userId,
      event: eventId,
      text,
    });

    const message = await newMessage.save();
    res.status(201).json(message);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/messages/:eventId
// @desc    Get all messages for an event
// @access  Private (or Public if desired)
router.get('/:eventId', auth, async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Optional: Check if user is registered for the event to view messages
    // const isRegistered = event.registeredUsers.some(reg => reg.userId.toString() === req.user);
    // if (!isRegistered) {
    //   return res.status(403).json({ message: 'You must be registered for this event to view messages' });
    // }

    const messages = await Message.find({ event: eventId })
      .populate('user', 'name profilePicture')
      .sort({ date: 1 }); // Sort by date ascending

    res.json(messages);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router; 