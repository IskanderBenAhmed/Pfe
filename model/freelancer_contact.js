
const mongoose = require('mongoose');

// Define the schema for the freelancer contact
const FreelancerContactSchema = new mongoose.Schema({
  freelancerEmail: {
    type: String,
    required: true,
    trim: true,
  },
  message: {
    type: String,
    required: true,
    trim: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    get: function () {
      return this.createdAt.toLocaleString(); // Change the timestamp format to a human-readable format
    }
  },
  freelancerUsername: { // Add the freelancerUsername field to the schema
    type: String,
    required: true,
    trim: true,
  },
});

// Create and export the FreelancerContact model
module.exports = mongoose.model('FreelancerContact', FreelancerContactSchema);
