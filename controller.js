const { LogInModel } = require("../models/logInModel");
const { JobModel } = require("../models/JobModel");
const { ApplicationModel } = require("../models/ApplicationModel");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const otpMap = new Map();

// Render views
const renderView = (res, view, options = {}) => res.render(view, options);

const getLogin = (req, res) => renderView(res, "login");
const getSignup = (req, res) => renderView(res, "signup");
const getForget = (req, res) => renderView(res, "forget");
const getReset = (req, res) => renderView(res, "reset");
const getOtp = (req, res) => renderView(res, "otp");

const getHome = (req, res) => {
  if (req.isAuthenticated()) {
    const roleRedirects = {
      Admin: "/admin-dashboard",
      Company: "/company-dashboard",
      "Job-Seeker": "/jobseeker-dashboard",
    };
    const redirectPath = roleRedirects[req.user.categories] || "/login";
    return res.redirect(redirectPath);
  } else {
    return res.redirect("/login");
  }
};


const getLogout = (req, res) => {
  req.logout((error) => {
    if (error) return res.status(500).send("Error during logout");
    req.session.destroy((err) => {
      if (err) return res.status(500).send("Error destroying session");
      res.clearCookie("connect.sid");
      renderView(res, "login");
    });
  });
};

const postLogin = async (req, res) => {
  const { name, password } = req.body;
  if (!name || !password) {
    return renderView(res, "login", {
      error: "Username and Password must be filled",
    });
  }

  try {
    const user = await LogInModel.findOne({ name });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return renderView(res, "login", {
        error: "Username or Password is incorrect",
      });
    }

    const token = jwt.sign(
      { _id: user._id, role: user.categories, isCompany: user.isCompany },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    console.log(token)
    res.cookie("token", token, { httpOnly: true, secure: true });

    const roleRedirects = {
      Admin: "/admin-dashboard",
      Company: "company-dashboard",
      "Job-Seeker": "/jobseeker-dashboard",
    };
    return res.redirect(roleRedirects[user.categories] || "login");
  } catch (error) {
    console.error("Login error:", error);
    return renderView(res, "error", {
      error: "An error occurred during login",
    });
  }
};

const postSignup = async (req, res) => {
  const {
    name,
    password,
    email,
    categories,
    title,
    description,
    location,
    category,
    coverLetter,
  } = req.body;
  const document = req.files?.document?.[0]?.filename || null;
  const resume = req.files?.resume?.[0]?.filename || null;

  if (!name || !password || !email || !categories) {
    return renderView(res, "signup", {
      error: "All required fields must be filled.",
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const isCompany = categories === "Company";

  try {
    const user = await LogInModel.create({
      name,
      password: hashedPassword,
      email,
      categories,
      isCompany,
    });
    console.log("User created successfully:", user);

    if (isCompany && !document) {
      return renderView(res, "signup", {
        error: "Company document is required.",
      });
    }
    if (isCompany) {
      const job = await JobModel.create({
        title,
        description,
        location,
        category,
        company_id: user._id,
        document,
      });
      console.log("Job created for company:", job);
    }

    if (categories === "Job-Seeker" && !resume) {
      return renderView(res, "signup", {
        error: "Resume is required for job seekers.",
      });
    }
    if (categories === "Job-Seeker") {
      const application = await ApplicationModel.create({
        job_id: user._id,
        user_id: user._id,
        resume,
        coverLetter,
      });
      console.log("Application created for job seeker:", application);
    }

    renderView(res, "signup", {
      success: "Your account has been created successfully.",
    });
  } catch (error) {
    console.error("Error during sign-up:", error);
    renderView(res, "signup", {
      error: "An error occurred during sign-up. Please try again.",
    });
  }
};

const postForget = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return renderView(res, "forget", {
      error: "Must enter the email, cannot leave blank",
    });
  }

  try {
    const userExists = await LogInModel.exists({ email });
    res.redirect(userExists ? "/otp" : "forget");
  } catch (error) {
    renderView(res, "forget", {
      error: "Error while processing forget password",
    });
  }
};

const postOtp = async (req, res) => {
  const { email } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000);

  try {
    const user = await LogInModel.findOne({ email });
    if (!user)
      return renderView(res, "otp", {
        error: "No account found with that email",
      });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
      secure: true,
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP code is ${otp}`,
    });
    otpMap.set(email, otp);
    renderView(res, "otp", {
      success: `OTP has been sent to ${email}. Please enter it below to reset your password.`,
      email,
    });
  } catch (error) {
    console.error("Error sending OTP:", error);
    renderView(res, "otp", { error: "Error sending OTP" });
  }
};

const postVerifyOtp = (req, res) => {
  const { email, otp } = req.body;
  const storedOtp = otpMap.get(email);

  if (!storedOtp || storedOtp !== parseInt(otp, 10)) {
    return renderView(res, "otp", {
      error: "Invalid OTP. Please try again.",
      email,
    });
  }

  renderView(res, "reset", {
    email,
    success: "OTP verified. Please reset your password.",
  });
};

const postReset = async (req, res) => {
  const { email, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return renderView(res, "reset", {
      error: "Passwords do not match.",
      email,
    });
  }

  try {
    await LogInModel.updateOne(
      { email },
      { password: await bcrypt.hash(password, 10) }
    );
    otpMap.delete(email);
    res.redirect("/");
  } catch (error) {
    console.error("Error while resetting password:", error);
    renderView(res, "reset", {
      error: "Error while resetting password",
      email,
    });
  }
};

module.exports = {
  getLogin,
  getSignup,
  getForget,
  getReset,
  getOtp,
  getHome,
  getLogout,
  postLogin,
  postSignup,
  postForget,
  postOtp,
  postVerifyOtp,
  postReset,
};