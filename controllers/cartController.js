const db = require("../config/db");

// GET user cart (create if not exists)
const getUserCart = (req, res) => {
  const userId = req.user.id;

  db.query(
    "SELECT * FROM carts WHERE user_id = ?",
    [userId],
    (err, carts) => {
      if (err) return res.status(500).json(err);

      if (carts.length > 0) {
        return res.json({
          cartId: carts[0].id,
          items: []
        });
      }

      db.query(
        "INSERT INTO carts (user_id) VALUES (?)",
        [userId],
        (err, result) => {
          if (err) return res.status(500).json(err);

          res.json({
            cartId: result.insertId,
            items: []
          });
        }
      );
    }
  );
};

// ADD item to cart
const addToCart = (req, res) => {
  const userId = req.user.id;
  const { productId, quantity } = req.body;

  if (!productId) {
    return res.status(400).json({ message: "Product ID is required" });
  }

  const qty = quantity || 1;

  db.query(
    "SELECT * FROM carts WHERE user_id = ?",
    [userId],
    (err, carts) => {
      if (err) return res.status(500).json(err);

      if (carts.length === 0) {
        db.query(
          "INSERT INTO carts (user_id) VALUES (?)",
          [userId],
          (err, result) => {
            if (err) return res.status(500).json(err);
            addItem(result.insertId);
          }
        );
      } else {
        addItem(carts[0].id);
      }
    }
  );

  function addItem(cartId) {
    db.query(
      "SELECT * FROM cart_items WHERE cart_id = ? AND product_id = ?",
      [cartId, productId],
      (err, items) => {
        if (err) return res.status(500).json(err);

        if (items.length > 0) {
          db.query(
            "UPDATE cart_items SET quantity = quantity + ? WHERE id = ?",
            [qty, items[0].id],
            () => res.json({ message: "Cart updated" })
          );
        } else {
          db.query(
            "INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)",
            [cartId, productId, qty],
            () => res.json({ message: "Item added to cart" })
          );
        }
      }
    );
  }
};

// UPDATE cart item
const updateCartItemQuantity = (req, res) => {
  const userId = req.user.id;
  const { productId, quantity } = req.body;

  if (!productId || quantity === undefined) {
    return res.status(400).json({ message: "productId and quantity required" });
  }

  db.query(
    "SELECT * FROM carts WHERE user_id = ?",
    [userId],
    (err, carts) => {
      if (err) return res.status(500).json(err);
      if (carts.length === 0) {
        return res.status(404).json({ message: "Cart not found" });
      }

      const cartId = carts[0].id;

      if (quantity === 0) {
        db.query(
          "DELETE FROM cart_items WHERE cart_id = ? AND product_id = ?",
          [cartId, productId],
          () => res.json({ message: "Item removed" })
        );
      } else {
        db.query(
          "UPDATE cart_items SET quantity = ? WHERE cart_id = ? AND product_id = ?",
          [quantity, cartId, productId],
          () => res.json({ message: "Quantity updated" })
        );
      }
    }
  );
};

// Get cart items count
// Get cart items count
const getCartItemCount = (req, res) => {
  const userId = req.user.id;

  db.query(
    "SELECT id FROM carts WHERE user_id = ?",
    [userId],
    (err, carts) => {
      if (err) return res.status(500).json(err);

      if (carts.length === 0) {
        return res.json({ count: 0 });
      }

      const cartId = carts[0].id;

      db.query(
        "SELECT SUM(quantity) AS count FROM cart_items WHERE cart_id = ?",
        [cartId],
        (err, result) => {
          if (err) return res.status(500).json(err);

          res.json({
            count: result[0].count || 0
          });
        }
      );
    }
  );
};

// ✅ EXPORT EVERYTHING (ONLY ONE EXPORT STYLE)
module.exports = {
  getUserCart,
  addToCart,
  updateCartItemQuantity,
  getCartItemCount
};
