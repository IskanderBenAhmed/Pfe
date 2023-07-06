const mongoose = require('mongoose');

const propositionSchema = new mongoose.Schema({
  projectName: {
    type: String,
    required: true,
  },
  freelancerUsername: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    default: 'pending'
  },
  selected: {
    type: Boolean,
    default: false,
  },
  price: {
    type: Number,
    required: true,
  },
  // Add any additional fields as needed
});

const propositions = mongoose.model('propositions', propositionSchema);

module.exports = propositions;
