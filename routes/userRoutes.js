const express = require("express");
const router = express.Router();
// ✅ import middleware
const { auth, isAdmin } = require("../middleware/authMiddleware");
//✅ import controllers
const {
  getProfile,
  updateProfile,
  deleteAccount,
  getOrderHistory,
  getWishlist,
  getAllUsers,
  getUserById,
  updateUser,
  changeUserRole,
  searchUsers
} = require("../controllers/userController");


const { getUserSupportTickets } = require("../controllers/supportController");
const { createSupportTicket } = require("../controllers/supportController");



// ---------------- CUSTOMER ROUTES ----------------
router.get("/profile", auth, getProfile);
router.put("/profile", auth, updateProfile);
router.delete("/account", auth, deleteAccount);
router.get("/orders", auth, getOrderHistory);
router.get("/wishlist", auth, getWishlist);
router.get("/support-tickets", auth, getUserSupportTickets);
router.post("/support-tickets", auth, createSupportTicket);
// ---------------- ADMIN ROUTES ----------------
router.get("/", auth, isAdmin, getAllUsers);
router.get("/:id", auth, isAdmin, getUserById);
router.put("/:id", auth, isAdmin, updateUser);
router.put("/:id/role", auth, isAdmin, changeUserRole);
router.get("/search/users", auth, isAdmin, searchUsers);

module.exports = router;
