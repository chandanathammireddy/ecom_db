const Notification = require("../models/Notification");

// GET user notifications
const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const notifications = await Notification.getByUserId(userId);
    res.json({ total: notifications.length, notifications });
  } catch (err) {
    res.status(500).json(err);
  }
};

module.exports = { getUserNotifications };
