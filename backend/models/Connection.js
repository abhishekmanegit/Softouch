const mongoose = require('mongoose');

const ConnectionSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending',
  },
}, {
  timestamps: true,
});

// Ensure that a user cannot send a duplicate connection request to the same person
ConnectionSchema.index({ sender: 1, receiver: 1 }, { unique: true });

module.exports = mongoose.model('Connection', ConnectionSchema); 