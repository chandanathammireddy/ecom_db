const db = require("../config/db");

const User = {
    // Find user by email
    findByEmail: async (email) => {
        const query = "SELECT * FROM users WHERE email = ?";
        const [rows] = await db.query(query, [email]);
        return rows;
    },

    // Create new user
    create: async (userData) => {
        const { name, email, password } = userData;
        const query = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
        const [result] = await db.query(query, [name, email, password]);
        return result;
    },

    // Find user by ID
    findById: async (id) => {
        const query = "SELECT id, name, email, role FROM users WHERE id = ?";
        const [rows] = await db.query(query, [id]);
        return rows;
    },

    // Update user profile
    update: async (id, userData) => {
        let fields = [];
        let values = [];

        if (userData.name) {
            fields.push("name = ?");
            values.push(userData.name);
        }
        if (userData.email) {
            fields.push("email = ?");
            values.push(userData.email);
        }
        if (userData.password) {
            fields.push("password = ?");
            values.push(userData.password);
        }
        if (userData.role) {
            fields.push("role = ?");
            values.push(userData.role);
        }

        if (fields.length === 0) {
            return { affectedRows: 0 };
        }

        values.push(id);
        const query = `UPDATE users SET ${fields.join(", ")} WHERE id = ?`;
        const [result] = await db.query(query, values);
        return result;
    },

    // Count all users
    countAll: async () => {
        const query = "SELECT COUNT(*) AS total FROM users";
        const [rows] = await db.query(query);
        return rows;
    },

    // Get all users with pagination
    getAll: async (limit, offset) => {
        const query = "SELECT id, name, email, role FROM users LIMIT ? OFFSET ?";
        const [rows] = await db.query(query, [limit, offset]);
        return rows;
    },

    // Search users
    search: async (keyword) => {
        const query = `
      SELECT id, name, email, role
      FROM users
      WHERE name LIKE ? OR email LIKE ?
    `;
        const value = `%${keyword}%`;
        const [rows] = await db.query(query, [value, value]);
        return rows;
    }
};

module.exports = User;
