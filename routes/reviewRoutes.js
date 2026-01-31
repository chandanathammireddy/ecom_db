const express = require("express");
const router = express.Router();
const { auth, isAdmin } = require("../middleware/authMiddleware");
const {
  addReview,
  getProductReviews,
  updateOwnReview,
  getAllReviews,
  deleteReview,
  updateReviewStatus
} = require("../controllers/reviewController");

// User adds / updates review
router.post("/", auth, addReview);

// User updates own review
router.put("/", auth, updateOwnReview);

// ADMIN: Get all reviews
router.get("/", auth, isAdmin, getAllReviews);


// Get reviews of a product
router.get("/product/:id", getProductReviews);

// DELETE any review (ADMIN)
router.delete("/:id", auth, isAdmin, deleteReview);

// APPROVE or REJECT review (ADMIN)
router.put("/:id/status", auth, isAdmin, updateReviewStatus);



module.exports = router;


