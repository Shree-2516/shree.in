const multer = require("multer");
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let targetDir = "uploads/";

    if (file.fieldname === "projectImages") {
      targetDir = "uploads/projects/";
    } else if (file.fieldname === "achievementImages") {
      targetDir = "uploads/achievements/";
    }

    fs.mkdirSync(path.resolve(targetDir), { recursive: true });
    cb(null, targetDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype.startsWith("image/") ||
    file.mimetype === "application/pdf"
  ) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type"), false);
  }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
