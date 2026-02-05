const db = require("../config/db");

const Category = {
    getById: async (id) => {
        const [rows] = await db.query("SELECT * FROM categories WHERE id = ?", [id]);
        return rows;
    },

    create: async (name) => {
        const [result] = await db.query("INSERT INTO categories (name) VALUES (?)", [name]);
        return result;
    },

    update: async (id, name, status) => {
        let fields = [];
        let values = [];

        if (name) { fields.push("name = ?"); values.push(name); }
        if (status) { fields.push("status = ?"); values.push(status); }

        if (fields.length === 0) return { affectedRows: 0 }; // Nothing to update

        values.push(id);
        const query = `UPDATE categories SET ${fields.join(", ")} WHERE id = ?`;
        const [result] = await db.query(query, values);
        return result;
    }
};

module.exports = Category;
