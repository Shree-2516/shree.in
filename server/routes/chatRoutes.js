const express = require("express");
const router = express.Router();
const { handleChat } = require("../controllers/chatController");

// Route to handle chat messages
router.post("/", handleChat);

module.exports = router;
