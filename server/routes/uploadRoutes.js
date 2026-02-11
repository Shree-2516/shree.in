const multer = require("multer");
const express = require("express");
const router = express.Router();

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

router.post("/upload", upload.fields([
  { name: "photo" },
  { name: "resume" }
]), (req, res) => {
  res.json(req.files);
});

module.exports = router;