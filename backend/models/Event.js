const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  checkedIn: { type: Boolean, default: false },
  registrationDetails: { // Example fields, can be expanded
    contact: { type: String },
    // Add more fields as needed, e.g., statementOfInterest, resumeLink, etc.
  },
  registeredAt: { type: Date, default: Date.now },
});

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  organizer: { type: String, required: true },
  organizerEmail: { type: String, required: true },
  eventImage: { type: String },
  date: { type: Date, required: true },
  location: { type: String, required: true },
  skillsRequired: [{ type: String }],
  categories: [{ type: String }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  registeredUsers: [registrationSchema],
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema); 