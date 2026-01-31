const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  if (path.extname(file.originalname) === ".csv") {
    cb(null, true);
  } else {
    cb(new Error("Only CSV files allowed"), false);
  }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
