const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema({
  job_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "JobModel",
    required: false,
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "LogInModel",
    required: false,
  },
  resume: {
    type: String,
    required: true,
  },
  coverLetter: {
    type: String,
    required: false,
  },
  status: {
    type: String,
    enum: ["pending", "reviewed", "interview", "accepted", "rejected"],
    default: "pending",
  },
  appliedDate: {
    type: Date,
    default: Date.now,
  },
});

const ApplicationModel = mongoose.model("ApplicationModel", applicationSchema);

module.exports = { ApplicationModel };
