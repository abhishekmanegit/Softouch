const mongoose = require('mongoose');

const ReminderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
  },
  reminderDate: {
    type: Date,
    required: true,
  },
  // Add more fields if needed, e.g., notificationMethod (email, in-app), sent (boolean)
  sent: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Ensure a user can only set one reminder per event
ReminderSchema.index({ user: 1, event: 1 }, { unique: true });

module.exports = mongoose.model('Reminder', ReminderSchema); 