const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  filename: String,
  filepath: String,
  addedBy: String,
  // Add any other fields as needed
});

const file = mongoose.model('file', fileSchema);

module.exports = file;
