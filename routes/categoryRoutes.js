const express = require("express");
const router = express.Router();

const { auth, isAdmin } = require("../middleware/authMiddleware");
const {
  getCategoryById,
  createCategory,
  updateCategory
} = require("../controllers/categoryController");

// Create category (Admin)
router.post("/", auth, isAdmin, createCategory);

// Get category by ID
router.get("/:id", getCategoryById);

// Update category (Admin)
router.put("/:id", auth, isAdmin, updateCategory);


module.exports = router;