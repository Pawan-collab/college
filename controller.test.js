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
  
  const { LogInModel } = require("../models/logInModel");
  const { JobModel } = require("../models/JobModel");
  const { ApplicationModel } = require("../models/ApplicationModel");
  const nodemailer = require("nodemailer");
  const bcrypt = require("bcrypt");
  const jwt = require("jsonwebtoken");
  
  jest.mock("../models/logInModel.js");
  jest.mock("../models/JobModel.js");
  jest.mock("../models/ApplicationModel.js");
  jest.mock("nodemailer");
  jest.mock("bcrypt");
  jest.mock("jsonwebtoken");
  
  describe("Controller Tests", () => {
    const mockRes = {
      render: jest.fn(),
      redirect: jest.fn(),
      cookie: jest.fn(),
      status: jest.fn(() => mockRes),
      send: jest.fn(),
      clearCookie: jest.fn(),
    };
  
    beforeEach(() => {
      jest.clearAllMocks();
    });
  
    describe("getLogin", () => {
      it("should render the login page", () => {
        const mockReq = {};
        getLogin(mockReq, mockRes);
        expect(mockRes.render).toHaveBeenCalledWith("login");
      });
    });
  
    describe("postLogin", () => {
      it("should redirect user based on role after successful login", async () => {
        const mockReq = { body: { name: "testuser", password: "password123" } };
        const mockUser = {
          _id: "123",
          categories: "Admin",
          isCompany: false,
          password: "hashedpassword",
        };
        LogInModel.findOne.mockResolvedValue(mockUser);
        bcrypt.compare.mockResolvedValue(true);
        jwt.sign.mockReturnValue("mockToken");
  
        await postLogin(mockReq, mockRes);
  
        expect(LogInModel.findOne).toHaveBeenCalledWith({ name: "testuser" });
        expect(bcrypt.compare).toHaveBeenCalledWith(
          "password123",
          "hashedpassword"
        );
        expect(jwt.sign).toHaveBeenCalled();
        expect(mockRes.cookie).toHaveBeenCalledWith("token", "mockToken", {
          httpOnly: true,
          secure: true,
        });
        expect(mockRes.redirect).toHaveBeenCalledWith("/admin-dashboard");
      });
  
      it("should render login page with error if credentials are incorrect", async () => {
        const mockReq = { body: { name: "testuser", password: "wrongpassword" } };
        LogInModel.findOne.mockResolvedValue(null);
  
        await postLogin(mockReq, mockRes);
  
        expect(mockRes.render).toHaveBeenCalledWith("login", {
          error: "Username or Password is incorrect",
        });
      });
    });
  
    describe("postSignup", () => {
      it("should create a user and render success message for job seekers", async () => {
        const mockReq = {
          body: {
            name: "testseeker",
            password: "password123",
            email: "test@example.com",
            categories: "Job-Seeker",
          },
          files: {
            resume: [{ filename: "resume.pdf" }],
          },
        };
        const hashedPassword = "hashedpassword";
        bcrypt.hash.mockResolvedValue(hashedPassword);
        LogInModel.create.mockResolvedValue({ _id: "123" });
        ApplicationModel.create.mockResolvedValue({});
  
        await postSignup(mockReq, mockRes);
  
        expect(LogInModel.create).toHaveBeenCalledWith({
          name: "testseeker",
          password: hashedPassword,
          email: "test@example.com",
          categories: "Job-Seeker",
          isCompany: false,
        });
        expect(mockRes.render).toHaveBeenCalledWith("signup", {
          success: "Your account has been created successfully.",
        });
      });
  
      it("should render error if required fields are missing", async () => {
        const mockReq = { body: {} };
  
        await postSignup(mockReq, mockRes);
  
        expect(mockRes.render).toHaveBeenCalledWith("signup", {
          error: "All required fields must be filled.",
        });
      });
    });
  
    describe("postForget", () => {
      it("should redirect to OTP page if email exists", async () => {
        const mockReq = { body: { email: "test@example.com" } };
        LogInModel.exists.mockResolvedValue(true);
  
        await postForget(mockReq, mockRes);
  
        expect(LogInModel.exists).toHaveBeenCalledWith({
          email: "test@example.com",
        });
        expect(mockRes.redirect).toHaveBeenCalledWith("/otp");
      });
  
      it("should render forget page with error if email does not exist", async () => {
        const mockReq = { body: { email: "nonexistent@example.com" } };
        LogInModel.exists.mockResolvedValue(false);
  
        await postForget(mockReq, mockRes);
  
        expect(mockRes.redirect).toHaveBeenCalledWith("forget");
      });
    });
  
    describe("postOtp", () => {
      it("should send OTP via email", async () => {
        const mockReq = { body: { email: "test@example.com" } };
        const transporterMock = {
          sendMail: jest.fn().mockResolvedValue({}),
        };
        LogInModel.findOne.mockResolvedValue({ email: "test@example.com" });
        nodemailer.createTransport.mockReturnValue(transporterMock);
  
        await postOtp(mockReq, mockRes);
  
        expect(transporterMock.sendMail).toHaveBeenCalledWith(
          expect.objectContaining({
            to: "test@example.com",
          })
        );
        expect(mockRes.render).toHaveBeenCalledWith("otp", {
          success: "OTP has been sent to test@example.com. Please enter it below to reset your password.",
          email: "test@example.com",
        });
      });
  
      it("should render error if user not found", async () => {
        const mockReq = { body: { email: "unknown@example.com" } };
        LogInModel.findOne.mockResolvedValue(null);
  
        await postOtp(mockReq, mockRes);
  
        expect(mockRes.render).toHaveBeenCalledWith("otp", {
          error: "No account found with that email",
        });
      });
    });
  });
  