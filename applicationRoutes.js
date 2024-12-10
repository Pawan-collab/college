const express = require("express");
const router = express.Router();
const applicationController = require("../controllers/applicatioController");
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../multer/multerConfig");

router.get(
  "/jobSeeker/profile",
  authMiddleware(["Job-Seeker"]),
  (req, res, next) => {
    console.log("getJobSeekerProfile route hit");
    next();
  },
  applicationController.getJobSeekerProfile
);

router.post(
  "/jobSeeker/update",
  authMiddleware(["Job-Seeker"]),
  upload.single("resume"),
  applicationController.updateJobSeekerProfile
);

router.get(
  "/jobseeker/jobs",
  authMiddleware(["Admin", "Job-Seeker"]),
  applicationController.getJob
);

router.post(
  "/:id/apply",
  authMiddleware(["Job-Seeker"]),
  upload.single("resume"), 
  applicationController.applyJob
);

router.get(
  "/application",
  authMiddleware(["Admin", "Job-Seeker"]),
  applicationController.getApplication
);

router.get("/jobseeker-dashboard", authMiddleware(["Job-Seeker"]), (req, res) => {
  res.render("jobSeekerDashboard"); // Render job seeker dashboard view
});

module.exports = router;
