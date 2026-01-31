const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/authMiddleware");

const {
  getUserWishlist,
  addToWishlist,
  removeFromWishlist,
  moveWishlistToCart
} = require("../controllers/wishlistController");

router.get("/", auth, getUserWishlist);
router.post("/add", auth, addToWishlist);
router.delete("/remove", auth, removeFromWishlist);
router.post("/move-to-cart", auth, moveWishlistToCart);

module.exports = router;
