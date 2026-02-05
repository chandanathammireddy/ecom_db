const db = require("../config/db");

const Order = {
    create: async (userId) => {
        const [result] = await db.query("INSERT INTO orders (user_id, status) VALUES (?, 'pending')", [userId]);
        return result;
    },

    getByUserId: async (userId) => {
        const [rows] = await db.query("SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC", [userId]);
        return rows;
    },

    getById: async (orderId) => {
        const [rows] = await db.query("SELECT * FROM orders WHERE id = ?", [orderId]);
        return rows;
    },

    getByIdAndUser: async (orderId, userId) => {
        const [rows] = await db.query("SELECT * FROM orders WHERE id = ? AND user_id = ?", [orderId, userId]);
        return rows;
    },

    updateStatus: async (orderId, status) => {
        const [result] = await db.query("UPDATE orders SET status = ? WHERE id = ?", [status, orderId]);
        return result;
    },

    updatePaymentStatus: async (orderId, status) => {
        const [result] = await db.query("UPDATE orders SET payment_status = ? WHERE id = ?", [status, orderId]);
        return result;
    },

    getWithItems: async (orderId) => {
        const query = `
        SELECT 
          oi.product_id,
          p.name,
          oi.quantity,
          oi.price,
          (oi.quantity * oi.price) AS total
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
      `;
        const [rows] = await db.query(query, [orderId]);
        return rows;
    },

    getAll: async (filters) => {
        let query = `
        SELECT o.id, o.user_id, u.name AS user_name, u.email, o.status
        FROM orders o
        JOIN users u ON o.user_id = u.id
        WHERE 1=1
      `;
        const values = [];

        if (filters.status) {
            query += " AND o.status = ?";
            values.push(filters.status);
        }
        if (filters.userId) {
            query += " AND o.user_id = ?";
            values.push(filters.userId);
        }

        query += " ORDER BY o.id DESC";
        const [rows] = await db.query(query, values);
        return rows;
    },

    processPayment: async (orderId, paymentMethod) => {
        const [result] = await db.query(
            `UPDATE orders 
         SET payment_status = 'paid',
             payment_method = ?,
             status = 'confirmed',
             paid_at = NOW()
         WHERE id = ?`,
            [paymentMethod, orderId]
        );
        return result;
    },

    verifyPayment: async (orderId, paymentStatus, orderStatus, paidAt) => {
        const [result] = await db.query(
            `UPDATE orders 
         SET payment_status = ?, 
             status = ?, 
             paid_at = ?
         WHERE id = ?`,
            [paymentStatus, orderStatus, paidAt, orderId]
        );
        return result;
    },

    processRefund: async (orderId) => {
        const [result] = await db.query(
            `UPDATE orders 
         SET refund_status = 'refunded',
             payment_status = 'refunded',
             status = 'refunded',
             refunded_at = NOW()
         WHERE id = ?`,
            [orderId]
        );
        return result;
    }
};

module.exports = Order;
