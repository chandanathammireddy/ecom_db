const db = require("../config/db");

const Support = {
    getByUserId: async (userId) => {
        const query = `
      SELECT id, subject, message, status, created_at
      FROM support_tickets
      WHERE user_id = ?
      ORDER BY created_at DESC
    `;
        const [rows] = await db.query(query, [userId]);
        return rows;
    },

    create: async (userId, subject, message) => {
        const query = "INSERT INTO support_tickets (user_id, subject, message) VALUES (?, ?, ?)";
        const [result] = await db.query(query, [userId, subject, message]);
        return result;
    },

    getAll: async () => {
        const query = `
      SELECT st.id, st.subject, st.message, st.status, st.created_at, u.id AS user_id, u.name, u.email
      FROM support_tickets st
      JOIN users u ON st.user_id = u.id
      ORDER BY st.created_at DESC
    `;
        const [rows] = await db.query(query);
        return rows;
    },

    updateStatus: async (id, status) => {
        const [result] = await db.query("UPDATE support_tickets SET status = ? WHERE id = ?", [status, id]);
        return result;
    }
};

module.exports = Support;
