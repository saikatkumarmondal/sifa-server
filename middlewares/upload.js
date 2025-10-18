const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure uploads folder exists
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads", { recursive: true });
}

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

// File filter: only allow images
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExt = [".png", ".jpg", ".jpeg", ".gif", ".webp"];

  if (allowedExt.includes(ext)) {
    cb(null, true); // accept file
  } else {
    // Reject file but don’t crash server for multiple files
    return cb(null, false);
    // optionally, log rejected file
    // console.log("Rejected file:", file.originalname);
  }
};

// Multer setup
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per file
});

module.exports = upload;
