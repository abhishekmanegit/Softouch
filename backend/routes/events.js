const express = require('express');
const jwt = require('jsonwebtoken');
const Event = require('../models/Event');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose'); // Import mongoose for ObjectId
const Notification = require('../models/Notification');

const router = express.Router();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads/events');
if (!fs.existsSync(uploadsDir)) {
  fs.existsSync(path.join(__dirname, '../uploads')) || fs.mkdirSync(path.join(__dirname, '../uploads'));
  fs.mkdirSync(uploadsDir);
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ storage: storage });

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
router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    const { title, description, organizer, organizerEmail, eventImage, date, location, skillsRequired, categories } = req.body;
    const imageUrl = req.file ? `/uploads/events/${req.file.filename}` : null;

    const event = new Event({
      title,
      description,
      organizer,
      organizerEmail,
      eventImage,
      date,
      location,
      skillsRequired,
      categories,
      createdBy: req.user.userId,
      imageUrl
    });
    await event.save();
    res.status(201).json(event);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// List Events (with optional filters: skills, location, search query, categories)
router.get('/', async (req, res) => {
  try {
    const { skills, location, search, startDate, endDate, sortBy, categories } = req.query;
    let filter = {};
    let sort = { date: -1 }; // Default sort by date descending

    if (skills) {
      filter.skillsRequired = { $in: skills.split(',').map(s => new RegExp(s.trim(), 'i')) };
    }
    if (location) {
      filter.location = new RegExp(location, 'i');
    }
    if (categories) {
      filter.categories = { $in: categories.split(',').map(c => new RegExp(c.trim(), 'i')) };
    }
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      filter.$or = [
        { title: searchRegex },
        { description: searchRegex }
      ];
    }

    // Date range filtering
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) {
        filter.date.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.date.$lte = new Date(endDate);
      }
    }

    // Sorting options
    if (sortBy) {
      switch (sortBy) {
        case 'dateAsc':
          sort = { date: 1 };
          break;
        case 'dateDesc':
          sort = { date: -1 };
          break;
        // Add more sorting options like 'popularity' if a relevant field is added to Event model
        // case 'popularity':
        //   sort = { registeredUsers: -1 }; // Example: sort by number of registered users
        //   break;
        default:
          sort = { date: -1 };
      }
    }

    const events = await Event.find(filter).sort(sort).populate('createdBy', 'name email');
    res.json(events);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a single event by ID
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('createdBy', 'name email').populate('registeredUsers.userId', 'name email');
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(event);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get events created by the logged-in user
router.get('/my-created', auth, async (req, res) => {
  try {
    const createdEvents = await Event.find({ createdBy: req.user.userId }).populate('createdBy', 'name email');
    res.json(createdEvents);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get events the logged-in user is registered for
router.get('/my-registered', auth, async (req, res) => {
  try {
    const registeredEvents = await Event.find({ 'registeredUsers.userId': req.user.userId }).populate('createdBy', 'name email');
    res.json(registeredEvents);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Register for Event (now includes registration details)
router.post('/:id/register', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    // Check if user is already registered (any status)
    const alreadyRegistered = event.registeredUsers.some(
      (reg) => reg.userId.toString() === req.user.userId
    );
    if (alreadyRegistered) {
      return res.status(400).json({ message: 'Already registered for this event' });
    }

    const { contact } = req.body; // Get registration details from request body

    event.registeredUsers.push({
      userId: new mongoose.Types.ObjectId(req.user.userId), // Ensure userId is ObjectId
      status: 'pending', // Default to pending
      registrationDetails: { contact },
    });

    await event.save();
    res.json({ message: 'Registered successfully! Awaiting organizer approval.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update Registration Status (Organizer Only)
router.put('/:eventId/registrations/:registrationId/status', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    // Check if the logged-in user is the event creator
    if (event.createdBy.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to update this registration status' });
    }

    const registration = event.registeredUsers.id(req.params.registrationId);
    if (!registration) return res.status(404).json({ message: 'Registration not found' });

    const { status } = req.body;
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status provided' });
    }

    registration.status = status;
    await event.save();

    // Create a notification for the user whose registration status was updated
    const notificationMessage = `Your registration for '${event.title}' has been ${status}.`;
    const notification = new Notification({
      recipient: registration.userId,
      sender: req.user.userId,
      type: 'registration_status',
      message: notificationMessage,
      event: event._id,
    });
    await notification.save();

    res.json({ message: 'Registration status updated successfully', registration });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Check-in a registered user (Organizer Only)
router.put('/:eventId/checkin/:registrationId', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    // Check if the logged-in user is the event creator
    if (event.createdBy.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to check-in users for this event' });
    }

    const registration = event.registeredUsers.id(req.params.registrationId);
    if (!registration) return res.status(404).json({ message: 'Registration not found' });

    if (registration.status !== 'approved') {
      return res.status(400).json({ message: 'Only approved users can be checked in' });
    }

    registration.checkedIn = true;
    await event.save();

    res.json({ message: 'User checked in successfully', registration });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 