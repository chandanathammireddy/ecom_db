const Review = require("../models/Review");

// ADD / UPDATE product review
const addReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, rating, comment } = req.body;

    if (!productId || !rating) {
      return res.status(400).json({ message: "Product ID and rating are required" });
    }

    await Review.upsert({ userId, productId, rating, comment });
    res.json({ message: "Review submitted successfully" });
  } catch (err) {
    res.status(500).json(err);
  }
};

// GET product reviews
const getProductReviews = async (req, res) => {
  try {
    const productId = req.params.id;
    const reviews = await Review.getByProductId(productId);
    res.json({ total: reviews.length, reviews });
  } catch (err) {
    res.status(500).json(err);
  }
};

// UPDATE own review
const updateOwnReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, rating, comment } = req.body;
    if (!productId) return res.status(400).json({ message: "Product ID is required" });

    const result = await Review.updateOwn(userId, productId, rating, comment);
    if (result.affectedRows === 0) return res.status(404).json({ message: "Review not found" });
    res.json({ message: "Review updated successfully" });
  } catch (err) {
    res.status(500).json(err);
  }
};

// GET all reviews (ADMIN)
const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.getAll();
    res.json({ total: reviews.length, reviews });
  } catch (err) {
    res.status(500).json(err);
  }
};

// DELETE any review (ADMIN)
const deleteReview = async (req, res) => {
  try {
    const reviewId = req.params.id;
    const result = await Review.delete(reviewId);
    if (result.affectedRows === 0) return res.status(404).json({ message: "Review not found" });
    res.json({ message: "Review deleted successfully" });
  } catch (err) {
    res.status(500).json(err);
  }
};

// APPROVE or REJECT review (ADMIN)
const updateReviewStatus = async (req, res) => {
  try {
    const reviewId = req.params.id;
    const { status } = req.body;
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Status must be 'approved' or 'rejected'" });
    }

    const result = await Review.updateStatus(reviewId, status);
    if (result.affectedRows === 0) return res.status(404).json({ message: "Review not found" });
    res.json({ message: `Review ${status} successfully` });
  } catch (err) {
    res.status(500).json(err);
  }
};

module.exports = {
  addReview,
  getProductReviews,
  updateOwnReview,
  getAllReviews,
  deleteReview,
  updateReviewStatus
};
