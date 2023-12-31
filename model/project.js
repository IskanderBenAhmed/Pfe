const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
  backend: String,
  frontend: String,
  database: String,
  category: String,
  projectName: String,
  selectedTemplate : String, // Array of checked pack


  projectType: String,
  status: {
    type: String,
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Personal Cheque', 'Debit Card', 'Credit Card', 'Other'],
    default: ''
  },
  startDate: Date,             
  endDate: Date  ,
  
  Estimated_price:Number,
  maxBudget: {
    type: Number,
    min: 300
  },
  pack: [String],
  createdBy: {
    type: String
  },
   rejection_reason: {
    type: String,
  },

},


{ collection: 'projects' });

const project = mongoose.model('Project', projectSchema);

module.exports = project;
