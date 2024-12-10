const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: false,
  },
  description: {
    type: String,
    required: false,
  },
  location: {
    type: String,
    required: false,
  },
  category: {
    type: String,
    required: false,
  },
  company_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "LogInModel",
    required: false,
  },
  document: {
    type: String,
    required: false,
  },

  postedDate: {
    type: Date,
    default: Date.now,
  },
});

const JobModel = mongoose.model("JobModel", jobSchema);

module.exports = { JobModel };
