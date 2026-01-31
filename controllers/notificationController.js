const db = require("../config/db");

// GET user notifications
const getUserNotifications = (req, res) => {
  const userId = req.user.id;

  db.query(
    `
    SELECT 
      id,
      title,
      message,
      is_read,
      created_at
    FROM notifications
    WHERE user_id = ?
    ORDER BY created_at DESC
    `,
    [userId],
    (err, notifications) => {
      if (err) return res.status(500).json(err);

      res.json({
        total: notifications.length,
        notifications
      });
    }
  );
};

module.exports = {
  getUserNotifications
};
