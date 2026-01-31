const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/authMiddleware");

const {
  getUserCart,
  addToCart,
  updateCartItemQuantity,
  getCartItemCount
} = require("../controllers/cartController");

router.get("/", auth, getUserCart);
router.get("/count", auth, getCartItemCount);
router.post("/add", auth, addToCart);
router.put("/update", auth, updateCartItemQuantity);

module.exports = router;
