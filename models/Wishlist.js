const db = require("../config/db");

exports.getByUserId = async (userId) => {
    const query = "SELECT id, product_name, added_at FROM wishlist WHERE user_id = ?";
    const [rows] = await db.query(query, [userId]);
    return rows;
};
