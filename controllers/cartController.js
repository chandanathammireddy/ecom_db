const Cart = require("../models/Cart");

// GET user cart (create if not exists)
const getUserCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const carts = await Cart.getByUserId(userId);

    if (carts.length > 0) {
      return res.json({ cartId: carts[0].id, items: [] });
    }

    const result = await Cart.create(userId);
    res.json({ cartId: result.insertId, items: [] });
  } catch (err) {
    res.status(500).json(err);
  }
};

// ADD item to cart
const addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity } = req.body;

    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    const qty = quantity || 1;

    let cartId;
    const carts = await Cart.getByUserId(userId);

    if (carts.length === 0) {
      const result = await Cart.create(userId);
      cartId = result.insertId;
    } else {
      cartId = carts[0].id;
    }

    // Check if item exists
    const items = await Cart.getItem(cartId, productId);

    if (items.length > 0) {
      await Cart.updateItemQuantity(items[0].id, qty);
      res.json({ message: "Cart updated" });
    } else {
      await Cart.addItem(cartId, productId, qty);
      res.json({ message: "Item added to cart" });
    }

  } catch (err) {
    res.status(500).json(err);
  }
};

// UPDATE cart item
const updateCartItemQuantity = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity } = req.body;

    if (!productId || quantity === undefined) {
      return res.status(400).json({ message: "productId and quantity required" });
    }

    const carts = await Cart.getByUserId(userId);
    if (carts.length === 0) return res.status(404).json({ message: "Cart not found" });

    const cartId = carts[0].id;
    if (quantity === 0) {
      await Cart.removeItem(cartId, productId);
      res.json({ message: "Item removed" });
    } else {
      await Cart.setItemQuantity(cartId, productId, quantity);
      res.json({ message: "Quantity updated" });
    }
  } catch (err) {
    res.status(500).json(err);
  }
};

// Get cart items count
const getCartItemCount = async (req, res) => {
  try {
    const userId = req.user.id;
    const carts = await Cart.getByUserId(userId);
    if (carts.length === 0) return res.json({ count: 0 });

    const cartId = carts[0].id;
    const result = await Cart.countItems(cartId);
    res.json({ count: result[0].count || 0 });
  } catch (err) {
    res.status(500).json(err);
  }
};

module.exports = {
  getUserCart,
  addToCart,
  updateCartItemQuantity,
  getCartItemCount
};
