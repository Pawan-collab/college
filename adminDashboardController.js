const { JobModel } = require("../models/JobModel");
const { ApplicationModel } = require("../models/ApplicationModel");
const { LogInModel } = require("../models/logInModel");

const mainRoutes = async (req, res) => {
  try {
    res.render("adminDashBoard");
  } catch (error) {
    console.error("Error rendering admin dashboard:", error);
    res
      .status(500)
      .render("error", { error: "Error rendering admin dashboard." });
  }
};

const fetchRegisteredCompanies = async (req, res) => {
  try {
    // Fetch jobs and populate company details
    const jobs = await JobModel.find()
      .populate("company_id", "name email location")
      .lean();

    console.log("Fetched Jobs with Company Documents:", jobs);

    // Group documents by each company, skipping jobs with null company_id
    const companyDocs = {};
    jobs.forEach((job) => {
      if (job.company_id) {  // Only process jobs with a valid company_id
        const companyId = job.company_id._id.toString();
        if (!companyDocs[companyId]) {
          companyDocs[companyId] = {
            _id: job.company_id._id,
            name: job.company_id.name,
            email: job.company_id.email,
            location: job.company_id.location,
            documents: [],
          };
        }
        companyDocs[companyId].documents.push(`/public/${job.document}`);
      }
    });

    // Convert companyDocs object to an array
    const companies = Object.values(companyDocs);

    res.render("adminDashBoard", { companies });
  } catch (error) {
    console.error("Error fetching companies:", error);
    res.status(500).render("error", { error: "Error fetching companies." });
  }
};

  
  
  
  

const fetchRegisteredJobSeekers = async (req, res) => {
  try {
    // Find job seekers, populate applications, and fetch job details with job_id fallback
    const jobSeekers = await LogInModel.find({ isCompany: false })
      .populate({
        path: "applications",
        model: "ApplicationModel",
        populate: {
          path: "job_id",
          model: "JobModel",
          select: "title",
        },
      })
      .lean();

    console.log("Fetched Job Seekers with Applications:", jobSeekers); // Verify output

    res.render("adminDashBoard", { jobSeekers });
  } catch (error) {
    console.error("Error fetching job seekers:", error);
    res.status(500).render("error", { error: "Error fetching job seekers." });
  }
};

const fetchJobs = async (req, res) => {
  try {
    const jobs = await JobModel.find().populate("company_id");
    res.render("adminDashBoard", { jobs });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    res.status(500).render("error", { error: "Error fetching jobs." });
  }
};

const fetchApplications = async (req, res) => {
  try {
    const applications = await ApplicationModel.find()
      .populate({
        path: "user_id",
        model: "LogInModel",
        select: "name", // Fetch the applicant's name
      })
      .populate({
        path: "job_id",
        model: "JobModel",
        select: "title", // Fetch the job title
      })
      .lean(); // Convert Mongoose docs to plain objects

    console.log("Applications with Populated Data:", applications); // Check output in console
    res.render("adminDashBoard", { applications });
  } catch (error) {
    console.error("Error fetching applications:", error);
    res.status(500).render("error", { error: "Error fetching applications." });
  }
};

const deleteCompany = async (req, res) => {
  try {
    await LogInModel.findByIdAndDelete(req.params.id);
    res.redirect("/admin-dashboard/companies");
  } catch (error) {
    console.error("Error deleting company:", error);
    res.status(500).render("error", { error: "Error deleting company." });
  }
};

const deleteJobSeekers = async (req, res) => {
  try {
    await LogInModel.findByIdAndDelete(req.params.id);
    res.redirect("/admin-dashboard/job-seekers");
  } catch (error) {
    console.error("Error deleting job seeker:", error);
    res.status(500).render("error", { error: "Error deleting job seeker." });
  }
};

const deleteJobs = async (req, res) => {
  try {
    await JobModel.findByIdAndDelete(req.params.id);
    res.redirect("/admin-dashboard/jobs");
  } catch (error) {
    console.error("Error deleting job:", error);
    res.status(500).render("error", { error: "Error deleting job." });
  }
};
module.exports = {
  mainRoutes,
  fetchRegisteredCompanies,
  fetchRegisteredJobSeekers,
  fetchJobs,
  fetchApplications,
  deleteCompany,
  deleteJobSeekers,
  deleteJobs,
};