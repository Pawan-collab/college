const mongoose = require("mongoose");

const loginSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  isCompany: {
    type: Boolean,
    default: false,
  },
  categories: {
    type: String,
    required: false,
  },
});

loginSchema.virtual("applications", {
  ref: "ApplicationModel",
  localField: "_id",
  foreignField: "user_id",
});

loginSchema.set("toJSON", { virtuals: true });
loginSchema.set("toObject", { virtuals: true });

const LogInModel = mongoose.model("LogInModel", loginSchema);

module.exports = { LogInModel };
