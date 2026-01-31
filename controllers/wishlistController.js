const db = require("../config/db");

// Get user's wishlist
const getUserWishlist = (req, res) => {
  const userId = req.user.id;

  const query = `
    SELECT p.*
    FROM wishlists w
    JOIN products p ON w.product_id = p.id
    WHERE w.user_id = ?
  `;

  db.query(query, [userId], (err, results) => {
    if (err) return res.status(500).json(err);

    res.json({
      total: results.length,
      products: results
    });
  });
};

// Add product to wishlist
const addToWishlist = (req, res) => {
  const userId = req.user.id;
  const { productId } = req.body;

  if (!productId) {
    return res.status(400).json({ message: "Product ID is required" });
  }

  const query =
    "INSERT IGNORE INTO wishlists (user_id, product_id) VALUES (?, ?)";

  db.query(query, [userId, productId], (err) => {
    if (err) return res.status(500).json(err);

    res.json({ message: "Product added to wishlist" });
  });
};

// Remove product from wishlist
const removeFromWishlist = (req, res) => {
  const userId = req.user.id;
  const { productId } = req.body;

  if (!productId) {
    return res.status(400).json({ message: "Product ID is required" });
  }

  db.query(
    "DELETE FROM wishlists WHERE user_id = ? AND product_id = ?",
    [userId, productId],
    () => {
      res.json({ message: "Product removed from wishlist" });
    }
  );
};

// Move wishlist item to cart
const moveWishlistToCart = (req, res) => {
  const userId = req.user.id;
  const { productId } = req.body;

  if (!productId) {
    return res.status(400).json({ message: "Product ID is required" });
  }

  // 1️⃣ Get user's cart
  db.query(
    "SELECT * FROM carts WHERE user_id = ?",
    [userId],
    (err, carts) => {
      if (err) return res.status(500).json(err);

      if (carts.length === 0) {
        // create cart
        db.query(
          "INSERT INTO carts (user_id) VALUES (?)",
          [userId],
          (err, result) => {
            if (err) return res.status(500).json(err);
            addToCart(result.insertId);
          }
        );
      } else {
        addToCart(carts[0].id);
      }
    }
  );

  // 2️⃣ Add product to cart
  function addToCart(cartId) {
    db.query(
      "INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, 1)",
      [cartId, productId],
      (err) => {
        if (err) return res.status(500).json(err);

        // 3️⃣ Remove from wishlist
        db.query(
          "DELETE FROM wishlists WHERE user_id = ? AND product_id = ?",
          [userId, productId],
          () => {
            res.json({ message: "Wishlist item moved to cart" });
          }
        );
      }
    );
  }
};

module.exports = {
  getUserWishlist,
  addToWishlist,
  removeFromWishlist,
  moveWishlistToCart
};

