const express = require("express");
const { LogInModel } = require("../models/logInModel");
const { JobModel } = require("../models/JobModel");
const { ApplicationModel } = require("../models/ApplicationModel");
const adminDashboardController = require("../controllers/adminDashboardController");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

// Main Admin Dashboard Route
router.get(
  "/admin-dashboard",
  authMiddleware(["Admin"]),
  adminDashboardController.mainRoutes
);

// Fetch Registered Companies
router.get(
  "/admin-dashboard/companies",
  authMiddleware(["Admin"]),
  adminDashboardController.fetchRegisteredCompanies
);

// Fetch Registered Job Seekers
router.get(
  "/admin-dashboard/job-seekers",
  authMiddleware(["Admin"]),
  adminDashboardController.fetchRegisteredJobSeekers
);

// Fetch Jobs
router.get(
  "/admin-dashboard/jobs",
  authMiddleware(["Admin"]),
  adminDashboardController.fetchJobs
);

// Fetch Applications
router.get(
  "/admin-dashboard/applications",
  authMiddleware(["Admin"]),
  adminDashboardController.fetchApplications
);

// Delete a company
router.delete(
  "/admin-dashboard/company/:id/delete",
  authMiddleware(["Admin"]),
  adminDashboardController.deleteCompany
);

// Delete a job seeker
router.delete(
  "/admin-dashboard/job-seeker/:id/delete",
  authMiddleware(["Admin"]),
  adminDashboardController.deleteJobSeekers
);

// Delete a job
router.delete(
  "/admin-dashboard/job/:id/delete",
  authMiddleware(["Admin"]),
  adminDashboardController.deleteJobs
);

router.get(
  "/company-dashboard",
  authMiddleware(["Company"]),
  async (req, res) => {
    try {
      const companyId = req.user._id;

      // Fetch all job seekers
      const jobSeekers = await LogInModel.find({
        isCompany: false,
        categories: { $ne: "Admin" },
      });

      // Fetch jobs posted by the company
      const jobs = await JobModel.find({ company_id: companyId });

      // Fetch applications for jobs posted by the company
      const applications = await ApplicationModel.find({
        job_id: { $in: jobs.map((job) => job._id) },
      })
        .populate("user_id", "name email") // Populate applicant details
        .populate("job_id", "title"); // Populate job title

      // Render the company dashboard with the fetched data
      res.render("companyDashboard", {
        user: req.user,
        jobSeekers,
        jobs,
        applications,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      res
        .status(500)
        .render("error", { error: "Error loading the dashboard." });
    }
  }
);

// Create a new job
router.post("/jobs/create", authMiddleware(["Company"]), async (req, res) => {
  try {
    const { title, description, category } = req.body;
    const company_id = req.user._id; // Get the logged-in company ID

    const newJob = new JobModel({
      title,
      description,
      category,
      company_id,
    });

    await newJob.save();
    res.status(201).json(newJob);
  } catch (error) {
    console.log("Error creating job:", error);
    res.status(500).json({ message: "Error while creating job", error });
  }
});

// Read all jobs for the company
router.get("/jobs/read", authMiddleware(["Company"]), async (req, res) => {
  try {
    const jobs = await JobModel.find({ company_id: req.user._id });
    res.status(200).json(jobs);
  } catch (error) {
    console.log("Error reading jobs:", error);
    res.status(500).json({ message: "Error while fetching jobs", error });
  }
});

// Update a job
router.put(
  "/jobs/:id/update",
  authMiddleware(["Company"]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const updatedJob = await JobModel.findByIdAndUpdate(id, req.body, {
        new: true,
      });

      if (!updatedJob) {
        return res.status(404).json({ message: "Job not found" });
      }

      res.status(200).json(updatedJob);
    } catch (error) {
      console.log("Error updating job:", error);
      res.status(500).json({ message: "Error while updating job", error });
    }
  }
);

// Delete a job
router.delete(
  "/jobs/:id/delete",
  authMiddleware(["Company"]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const deletedJob = await JobModel.findByIdAndDelete(id);

      if (!deletedJob) {
        return res.status(404).json({ message: "Job not found" });
      }

      res.status(204).send();
    } catch (error) {
      console.log("Error deleting job:", error);
      res.status(500).json({ message: "Error while deleting job", error });
    }
  }
);

// Send Job Notification to All Registered Job Seekers
router.post(
  "/jobs/send-notification",
  authMiddleware(["Company"]),
  async (req, res) => {
    try {
      const jobSeekers = await LogInModel.find({
        isCompany: false,
        categories: { $ne: "Admin" },
      });

      if (!jobSeekers.length) {
        return res.status(404).json({ message: "No job seekers found." });
      }

      const { jobTitle } = req.body; // Get the job title from the request body for the email content

      // Set up the mail transporter
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
      });

      // Send email to each job seeker
      const mailPromises = jobSeekers.map((jobSeeker) => {
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: jobSeeker.email,
          subject: "New Job Posting Notification",
          text: `Hello ${jobSeeker.name},\n\nA new job titled "${jobTitle}" has been posted that may match your interests.\n\nBest Regards,\nNext Step Workforce Solutions`,
        };
        return transporter.sendMail(mailOptions);
      });

      await Promise.all(mailPromises);
      console.log("Job notifications sent to all registered job seekers.");

      res.json({ success: "Notifications sent to all job seekers." });
    } catch (error) {
      console.error("Error sending notifications:", error);
      res.status(500).json({ error: "Error sending notifications." });
    }
  }
);

router.get(
  "/jobseeker-dashboard",
  authMiddleware(["Job-Seeker"]),
  (req, res) => {
    res.render("jobSeekerDashboard", { user: req.user });
  }
);

router.get("/admin-dashboard", authMiddleware(["Admin"]), (req, res) => {
  res.render("adminDashboard"); // Render admin dashboard view
});

module.exports = router;
