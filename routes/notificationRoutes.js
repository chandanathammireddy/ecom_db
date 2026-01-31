const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/authMiddleware");
const {
  getUserNotifications
} = require("../controllers/notificationController");

// GET user notifications
router.get("/", auth, getUserNotifications);

module.exports = router;
