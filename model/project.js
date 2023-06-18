const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
  backend: String,
  frontend: String,
  database: String,
  category: String,
  projectType: String,
  status: {
    type: String,
    default: 'pending'
  }
}, { collection: 'projects' });

const project = mongoose.model('Project', projectSchema);

module.exports = project;
