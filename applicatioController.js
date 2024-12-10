const { JobModel } = require("../models/JobModel");
const { ApplicationModel } = require("../models/ApplicationModel");
const { LogInModel } = require("../models/logInModel");

const getJobSeekerProfile = async (req, res) => {
  try {
    console.log("Request user ID:", req.user._id);
    const user = await LogInModel.findById(req.user._id).select("name email");
    console.log("Request user ID:", req.user._id);
    console.log("Fetched user:", user);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    console.log("Rendering with user data:", user);
    res.render("jobSeekerDashboard", { user });
  } catch (error) {
    console.error("Error fetching job seeker profile:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const updateJobSeekerProfile = async (req, res) => {
  const { coverLetter } = req.body;
  const resume = req.file ? req.file.path : null; // Handle the resume file path

  try {
    const application = await ApplicationModel.findOneAndUpdate(
      { user_id: req.user._id },
      { resume, coverLetter },
      { new: true }
    );

    if (!application) {
      return res
        .status(404)
        .json({ success: false, message: "Application not found" });
    }

    res.json({ success: true, message: "Profile updated successfully" });
  } catch (error) {
    console.error("Error updating job seeker profile:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const getJob = async (req, res) => {
  try {
    // Fetch all jobs, including company details
    const jobs = await JobModel.find().populate("company_id", "name email");
    res.render("jobSeekerDashboard", { user: req.user, jobs });
  } catch (error) {
    res.status(500).render("error", { message: "Error fetching jobs", error });
  }
};

const applyJob = async (req, res) => {
  try {
    const jobId = req.params.id;
    const userId = req.user._id; // Get user ID from `req.user`
    const coverLetter = req.body.coverLetter;
    const resume = req.file ? req.file.path : null; // Path to the uploaded resume file

    const application = new ApplicationModel({
      job_id: jobId,
      user_id: userId,
      resume,
      coverLetter,
    });
    await application.save();
    res.status(201).json({ message: "Application submitted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error applying for job", error });
  }
};

const getApplication = async (req, res) => {
  try {
    const userId = req.user._id;
    const applications = await ApplicationModel.find({
      user_id: userId,
    }).populate("job_id", "title description");

    // res.status(200).json(applications);
    res.render("jobSeekerDashboard", { user: req.user, applications });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving applications", error });
  }
};

module.exports = {
  getJob,
  applyJob,
  getJobSeekerProfile,
  updateJobSeekerProfile,
  getApplication,
};