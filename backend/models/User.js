const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  skills: [{ type: String }],
  location: { type: String },
  preferredCategories: [{ type: String }],
  profilePicture: {
    type: String, // URL to the profile picture
  },
  headline: {
    type: String, // Short professional headline
  },
  experience: [
    {
      title: String,
      company: String,
      location: String,
      from: Date,
      to: Date,
      current: Boolean,
      description: String,
    },
  ],
  education: [
    {
      school: String,
      degree: String,
      fieldOfStudy: String,
      from: Date,
      to: Date,
      current: Boolean,
      description: String,
    },
  ],
  projects: [
    {
      title: String,
      description: String,
      link: String, // Link to the project (e.g., GitHub, live demo)
      technologies: [String],
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema); 