const db = require("../config/db");

const Address = {
    getByUserId: async (userId) => {
        const [rows] = await db.query("SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, id DESC", [userId]);
        return rows;
    },

    getByIdAndUser: async (id, userId) => {
        const [rows] = await db.query("SELECT * FROM addresses WHERE id = ? AND user_id = ?", [id, userId]);
        return rows;
    },

    create: async (data) => {
        const { userId, full_name, phone, address_line1, address_line2, city, state, pincode, country, is_default } = data;
        const query = `
      INSERT INTO addresses
      (user_id, full_name, phone, address_line1, address_line2, city, state, pincode, country, is_default)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
        const [result] = await db.query(query, [userId, full_name, phone, address_line1, address_line2 || null, city, state, pincode, country || "India", is_default ? 1 : 0]);
        return result;
    },

    update: async (id, userId, data) => {
        // Build dynamic update
        let fields = [];
        let values = [];
        const { full_name, phone, address_line1, address_line2, city, state, pincode, country, is_default } = data;

        fields.push("full_name = ?"); values.push(full_name);
        fields.push("phone = ?"); values.push(phone);
        fields.push("address_line1 = ?"); values.push(address_line1);
        fields.push("address_line2 = ?"); values.push(address_line2 || null);
        fields.push("city = ?"); values.push(city);
        fields.push("state = ?"); values.push(state);
        fields.push("pincode = ?"); values.push(pincode);
        fields.push("country = ?"); values.push(country || "India");
        fields.push("is_default = ?"); values.push(is_default ? 1 : 0);

        const query = `UPDATE addresses SET ${fields.join(", ")} WHERE id = ? AND user_id = ?`;
        values.push(id, userId);

        const [result] = await db.query(query, values);
        return result;
    },

    unsetDefault: async (userId) => {
        const [result] = await db.query("UPDATE addresses SET is_default = 0 WHERE user_id = ?", [userId]);
        return result;
    },

    setDefault: async (id, userId) => {
        const [result] = await db.query("UPDATE addresses SET is_default = 1 WHERE id = ? AND user_id = ?", [id, userId]);
        return result;
    }
};

module.exports = Address;
