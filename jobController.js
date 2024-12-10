const { JobModel } = require("../models/JobModel");
const { LogInModel } = require("../models/logInModel");
const nodemailer = require("nodemailer");

const createJob = async (req, resp) => {
  try {
    const { title, description, category, company_id } = req.body;
    const newJob = new JobModel({
      title,
      description,
      category,
      company_id,
    });
    await newJob.save();

    resp.status(201).json({ message: "Job created successfully!" });
  } catch (error) {
    console.log(error);
    resp.status(500).json({ message: "Error while creating job", error });
  }
};

const readJob = async (req, resp) => {
  try {
    const jobs = await JobModel.find({ company_id: req.user._id }).populate(
      "company_id"
    );
    resp.render("companyDashBoard", { user: req.user, jobs });
  } catch (error) {
    resp.status(500).render("error", { message: "Error fetching jobs", error });
  }
};

const updateJob = async (req, resp) => {
  try {
    const { id } = req.params;
    const updatedJob = await JobModel.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (updatedJob) {
      resp
        .status(200)
        .json({ message: "Job updated successfully", updatedJob });
    } else {
      resp.status(404).json({ message: "Job not found" });
    }
  } catch (error) {
    console.log(error);
    resp.status(500).json({ message: "Error updating job", error });
  }
};

const deleteJob = async (req, resp) => {
  try {
    const { id } = req.params;
    const deletedJob = await JobModel.findByIdAndDelete(id);
    if (deletedJob) {
      resp
        .status(200)
        .json({ message: `Job with ID ${id} deleted successfully.` });
    } else {
      resp.status(404).json({ message: `Job with ID ${id} not found.` });
    }
  } catch (error) {
    resp.status(500).json({ message: "Error deleting job", error });
  }
};

// const fetchData = async (req, res) => {
//   try {
//     const companyId = req.user._id;
//     const jobSeekers = await LogInModel.find({
//       isCompany: false,
//       categories: { $ne: "Admin" },
//     });
//     const jobs = await JobModel.find({ company_id: companyId });
//     const applications = await ApplicationModel.find({
//       job_id: { $in: jobs.map((job) => job._id) },
//     })
//       .populate("user_id", "name email") 
//       .populate("job_id", "title"); 
//     res.render("companyDashboard", {
//       user: req.user,
//       jobSeekers,
//       jobs,
//       applications,
//     });
//   } catch (error) {
//     console.error("Error fetching dashboard data:", error);
//     res.status(500).render("error", { error: "Error loading the dashboard." });
//   }
// };

const RegisteredJobSeekers = async (req, res) => {
  try {
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

    console.log("Fetched Job Seekers with Applications:", jobSeekers); 

    res.render("companyDashboard", { jobSeekers });
  } catch (error) {
    console.error("Error fetching job seekers:", error);
    res.status(500).render("error", { error: "Error fetching job seekers." });
  }
};

module.exports = {
  createJob,
  readJob,
  updateJob,
  deleteJob,
  // fetchData,
  RegisteredJobSeekers,
};