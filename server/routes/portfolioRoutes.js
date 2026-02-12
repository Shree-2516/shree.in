const express = require("express");
const router = express.Router();
const upload = require("../config/upload");
// Import both functions from the controller
const { updatePortfolio, getPortfolio } = require("../controllers/portfolioController");

const { protect } = require("../middleware/authMiddleware");

// Route to fetch portfolio data
router.get("/", getPortfolio);

// Route to update/create portfolio data
router.post(
  "/",
  protect,
  upload.fields([
    { name: "profilePhoto", maxCount: 1 }, //
    { name: "resume", maxCount: 1 },       //
    { name: "projectImages" },             // NEW: Accepts project images from image 5
    { name: "achievementImages" },
  ]),
  updatePortfolio
);

module.exports = router;
