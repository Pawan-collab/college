const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const router = express.Router();
const { LogInModel } = require("../models/logInModel");

require("../controllers/googleAuthController");

router.get(
  "/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);

router.get(
  "/auth",
  passport.authenticate("google", { failureRedirect: "/login" }),
  async (req, resp) => {
    try {
      const user = await LogInModel.findById(req.user.id);

      // Generate JWT
      const token = jwt.sign(
        {
          _id: user._id,
          role: user.categories,
          isCompany: user.isCompany,
        },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      // Log the JWT to verify generation
      console.log("Generated JWT:", token);

      // Set the JWT as a cookie
      resp.cookie("token", token, { httpOnly: true, secure: true });

      // Redirect based on user role
      const roleRedirects = {
        Admin: "/admin-dashboard",
        Company: "/company-dashboard",
        "Job-Seeker": "/jobseeker-dashboard",
      };
      const redirectUrl = roleRedirects[user.categories] || "/login";

      resp.redirect(redirectUrl);
    } catch (error) {
      console.error("Error during Google auth role-based redirection:", error);
      resp.redirect("/login"); // Redirect to login in case of an error
    }
  }
);

module.exports = router;
