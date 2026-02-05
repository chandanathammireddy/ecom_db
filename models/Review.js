const db = require("../config/db");

const Review = {
    upsert: async (data) => {
        const { userId, productId, rating, comment } = data;
        const query = `
      INSERT INTO reviews (user_id, product_id, rating, comment)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        rating = VALUES(rating),
        comment = VALUES(comment)
    `;
        const [result] = await db.query(query, [userId, productId, rating, comment]);
        return result;
    },

    getByProductId: async (productId) => {
        const query = `
      SELECT r.id, u.name AS user, r.rating, r.comment, r.created_at
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.product_id = ?
      ORDER BY r.created_at DESC
    `;
        const [rows] = await db.query(query, [productId]);
        return rows;
    },

    updateOwn: async (userId, productId, rating, comment) => {
        const query = `
      UPDATE reviews
      SET rating = ?, comment = ?
      WHERE user_id = ? AND product_id = ?
    `;
        const [result] = await db.query(query, [rating, comment, userId, productId]);
        return result;
    },

    getAll: async () => {
        const query = `
      SELECT r.id, r.rating, r.comment, r.created_at, p.name AS product_name, u.name AS user_name
      FROM reviews r
      JOIN products p ON r.product_id = p.id
      JOIN users u ON r.user_id = u.id
      ORDER BY r.id DESC
    `;
        const [rows] = await db.query(query);
        return rows;
    },

    delete: async (id) => {
        const [result] = await db.query("DELETE FROM reviews WHERE id = ?", [id]);
        return result;
    },

    updateStatus: async (id, status) => {
        const [result] = await db.query("UPDATE reviews SET status = ? WHERE id = ?", [status, id]);
        return result;
    }
};

module.exports = Review;
