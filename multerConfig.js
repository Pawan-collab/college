const multer = require("multer");
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  console.log("Uploaded file:", file);
  const allowedTypes = /pdf|doc|docx/;
  const isAllow = allowedTypes.test(
    file.originalname.split(".").pop().toLowerCase()
  );
  console.log("File size:", file.size);
 
  if (isAllow) {
    cb(null, true);
  } else {
    const errorMessage = !isAllow
      ? "Invalid file type. Only .pdf, .doc, and .docx files are allowed."
      : "File size is too large. Maximum size allowed is 5 MB.";
    cb(new Error(errorMessage), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

module.exports = upload;