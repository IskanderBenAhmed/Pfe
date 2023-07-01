const mongoose = require('mongoose');

// Define the schema for the Project model
const projectSchema = new mongoose.Schema({
  projectName: {
    type: String,
    required: true
  },
  projectDescription: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  createdBy: {
    type: String,
    required: true,
  },
  
});

// Create the Project model from the schema
const project = mongoose.model('project', projectSchema);

module.exports = project;
