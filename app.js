const https = require("https");
const fs = require("fs");
const express = require("express");
const path = require("path");
const hbs = require("hbs");
const mongoose = require("mongoose");
const passport = require("passport");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const methodOverride = require("method-override");
const dotenv = require("dotenv");
dotenv.config();

// Import route files
const authRoutes = require("./routes/authRoutes");
const googleAuthRoutes = require("./routes/googleAuthRoutes");
require("./controllers/googleAuthController");
const jobRoutes = require("./routes/jobRoutes");
const ApplicationRoutes = require("./routes/applicationRoutes");
const dashboardRoutes = require("./routes/adminDashBoardRoutes");
// const authMiddleware = require("./middleware/authMiddleware");


const app = express();
const port = process.env.PORT || 3000;

// SSL options
const options = {
  key: fs.readFileSync(process.env.SSL_KEY_PATH),
  cert: fs.readFileSync(process.env.SSL_CERT_PATH),
};

// MongoDB connection
mongoose
  .connect("mongodb://localhost:27017/LoginSignupCredentials")
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });

// Set view engine and views path
const templatePath = path.join(__dirname, "templates");
app.set("view engine", "hbs");
app.set("views", templatePath);

// Register Handlebars partials if you have any
hbs.registerPartials(path.join(__dirname, "templates", "partials"));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride("_method"));
app.use(cookieParser());

// Static files
app.use("/public", express.static(path.join(__dirname, "public"))); // Public assets
app.use(express.static("css"));

app.use("/imageSources", express.static(path.join(__dirname, "imageSources"))); // Public assets
app.use(express.static("imageSources"));
// Session management
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 24 * 60 * 60 * 1000 }, // 1 day
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Route handling
app.use("/google", googleAuthRoutes);
app.use("/", authRoutes);
app.use("/", jobRoutes);
app.use("/job", ApplicationRoutes);
app.use("/", dashboardRoutes);


// Catch-all error route
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  res.status(500).render("error", { message: "An error occurred", error: err });
});


// app.get("/admin-dashboard", authMiddleware(["Admin"]), (req, res) => {
//   res.render("adminDashboard"); // Render admin dashboard view
// });

// HTTPS server
https.createServer(options, app).listen(port, () => {
  console.log(`server running on port ${port}`);
});