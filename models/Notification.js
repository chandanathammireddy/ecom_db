const db = require("../config/db");

const Notification = {
    getByUserId: async (userId) => {
        const query = `
      SELECT id, title, message, is_read, created_at
      FROM notifications
      WHERE user_id = ?
      ORDER BY created_at DESC
    `;
        const [rows] = await db.query(query, [userId]);
        return rows;
    }
};

module.exports = Notification;
