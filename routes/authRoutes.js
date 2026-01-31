const express = require("express");
const router = express.Router();

// ✅ Import both signup and login
const { signup, login } = require("../controllers/authController");

// Routes
router.post("/signup", signup);
router.post("/login", login);  // use login after importing

module.exports = router;
