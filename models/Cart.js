const db = require("../config/db");

const Cart = {
    getByUserId: async (userId) => {
        const [rows] = await db.query("SELECT * FROM carts WHERE user_id = ?", [userId]);
        return rows;
    },

    create: async (userId) => {
        const [result] = await db.query("INSERT INTO carts (user_id) VALUES (?)", [userId]);
        return result;
    },

    getItem: async (cartId, productId) => {
        const [rows] = await db.query("SELECT * FROM cart_items WHERE cart_id = ? AND product_id = ?", [cartId, productId]);
        return rows;
    },

    addItem: async (cartId, productId, quantity) => {
        const [result] = await db.query(
            "INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)",
            [cartId, productId, quantity]
        );
        return result;
    },

    updateItemQuantity: async (id, quantity) => {
        const [result] = await db.query("UPDATE cart_items SET quantity = quantity + ? WHERE id = ?", [quantity, id]);
        return result;
    },

    setItemQuantity: async (cartId, productId, quantity) => {
        const [result] = await db.query(
            "UPDATE cart_items SET quantity = ? WHERE cart_id = ? AND product_id = ?",
            [quantity, cartId, productId]
        );
        return result;
    },

    removeItem: async (cartId, productId) => {
        const [result] = await db.query("DELETE FROM cart_items WHERE cart_id = ? AND product_id = ?", [cartId, productId]);
        return result;
    },

    countItems: async (cartId) => {
        const [rows] = await db.query("SELECT SUM(quantity) AS count FROM cart_items WHERE cart_id = ?", [cartId]);
        return rows;
    }
};

module.exports = Cart;
