const db = require("../config/db");

// ADD / UPDATE product review
const addReview = (req, res) => {
  const userId = req.user.id;
  const { productId, rating, comment } = req.body;

  if (!productId || !rating) {
    return res.status(400).json({ message: "Product ID and rating are required" });
  }

  const query = `
    INSERT INTO reviews (user_id, product_id, rating, comment)
    VALUES (?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      rating = VALUES(rating),
      comment = VALUES(comment)
  `;

  db.query(query, [userId, productId, rating, comment], (err) => {
    if (err) return res.status(500).json(err);

    res.json({ message: "Review submitted successfully" });
  });
};

// GET product reviews
const getProductReviews = (req, res) => {
  const productId = req.params.id;

  const query = `
    SELECT 
      r.id,
      u.name AS user,
      r.rating,
      r.comment,
      r.created_at
    FROM reviews r
    JOIN users u ON r.user_id = u.id
    WHERE r.product_id = ?
    ORDER BY r.created_at DESC
  `;

  db.query(query, [productId], (err, reviews) => {
    if (err) return res.status(500).json(err);

    res.json({
      total: reviews.length,
      reviews
    });
  });
};

// UPDATE own review
const updateOwnReview = (req, res) => {
  const userId = req.user.id;
  const { productId, rating, comment } = req.body;

  if (!productId) {
    return res.status(400).json({ message: "Product ID is required" });
  }

  db.query(
    `UPDATE reviews
     SET rating = ?, comment = ?
     WHERE user_id = ? AND product_id = ?`,
    [rating, comment, userId, productId],
    (err, result) => {
      if (err) return res.status(500).json(err);

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Review not found" });
      }

      res.json({ message: "Review updated successfully" });
    }
  );
};




// GET all reviews (ADMIN)
const getAllReviews = (req, res) => {
  db.query(
    `SELECT 
       r.id,
       r.rating,
       r.comment,
       r.created_at,
       p.name AS product_name,
       u.name AS user_name
     FROM reviews r
     JOIN products p ON r.product_id = p.id
     JOIN users u ON r.user_id = u.id
     ORDER BY r.id DESC`,
    (err, reviews) => {
      if (err) return res.status(500).json(err);

      res.json({
        total: reviews.length,
        reviews
      });
    }
  );
};


// DELETE any review (ADMIN)
const deleteReview = (req, res) => {
  const reviewId = req.params.id;

  db.query(
    "DELETE FROM reviews WHERE id = ?",
    [reviewId],
    (err, result) => {
      if (err) return res.status(500).json(err);

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Review not found" });
      }

      res.json({ message: "Review deleted successfully" });
    }
  );
};



// APPROVE or REJECT review (ADMIN)
const updateReviewStatus = (req, res) => {
  const reviewId = req.params.id;
  const { status } = req.body;

  if (!["approved", "rejected"].includes(status)) {
    return res.status(400).json({
      message: "Status must be 'approved' or 'rejected'"
    });
  }

  db.query(
    "UPDATE reviews SET status = ? WHERE id = ?",
    [status, reviewId],
    (err, result) => {
      if (err) return res.status(500).json(err);

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Review not found" });
      }

      res.json({
        message: `Review ${status} successfully`
      });
    }
  );
};





module.exports = {
  addReview,
  getProductReviews,
  updateOwnReview,
  getAllReviews,
  deleteReview,
  updateReviewStatus

};
