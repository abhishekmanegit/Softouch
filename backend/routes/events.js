const express = require('express');
const jwt = require('jsonwebtoken');
const Event = require('../models/Event');
const User = require('../models/User');

const router = express.Router();

// Middleware to verify JWT
function auth(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });
  try {
    const decoded = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
}

// Create Event (organizer only)
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, organizer, date, location, skillsRequired } = req.body;
    const event = new Event({
      title,
      description,
      organizer,
      date,
      location,
      skillsRequired,
      createdBy: req.user.userId,
    });
    await event.save();
    res.status(201).json(event);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// List Events (with optional filters)
router.get('/', async (req, res) => {
  try {
    const { skills, location } = req.query;
    let filter = {};
    if (skills) filter.skillsRequired = { $in: skills.split(',') };
    if (location) filter.location = location;
    const events = await Event.find(filter).populate('createdBy', 'name email');
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Register for Event
router.post('/:id/register', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (event.registeredUsers.includes(req.user.userId)) {
      return res.status(400).json({ message: 'Already registered' });
    }
    event.registeredUsers.push(req.user.userId);
    await event.save();
    res.json({ message: 'Registered successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 