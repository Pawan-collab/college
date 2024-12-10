const express = require("express");
const router = express.Router();
const jobController = require("../controllers/jobController");
const authMiddleware = require("../middleware/authMiddleware");

router.post(
  "/create",
  authMiddleware(["Admin", "Company"]),
  jobController.createJob
);
router.get(
  "/read",
  authMiddleware(["Admin", "Company"]),
  jobController.readJob
);
router.put(
  "/:id/update",
  authMiddleware(["Admin", "Company"]),
  jobController.updateJob
);
router.delete(
  "/:id/delete",
  authMiddleware(["Admin", "Company"]),
  jobController.deleteJob
);
router.get(
  "/company-dashboard/job-seekers",
  authMiddleware(["Company"]),
  jobController.RegisteredJobSeekers
);

router.get("/company-dashboard", authMiddleware(["Company"]), (req, res) => {
  res.render("companyDashboard"); // Render company dashboard view
});
module.exports = router;
