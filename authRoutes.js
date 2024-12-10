const express = require("express");
const router = express.Router();
const controller = require("../controllers/controller");
const upload = require("../multer/multerConfig");

router.get("/", controller.getLogin);
router.get("/signup", controller.getSignup);
router.get("/forget", controller.getForget);
router.get("/reset", controller.getReset);
router.get("/otp", controller.getOtp);
router.get("/home", controller.getHome);
router.get("/logout", controller.getLogout);

router.post("/login", controller.postLogin);
router.post(
  "/signup",
  upload.fields([
    { name: "document", maxCount: 1 },
    { name: "resume", maxCount: 1 },
  ]),
  controller.postSignup
);
router.post("/forget", controller.postForget);
router.post("/otp", controller.postOtp);
router.post("/verify-otp", controller.postVerifyOtp);
router.post("/reset", controller.postReset);

module.exports = router;
