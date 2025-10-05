const multer = require("multer");
const path = require("path");
// Set storage destination and filename
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // folder where files will be saved
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

// Export the configured multer instance
const upload = multer({ storage });

module.exports = upload;
