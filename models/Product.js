const db = require("../config/db");

const Product = {
    // Get all products with complex filtering
    getAll: async (filters, limit, offset) => {
        let conditions = [];
        let values = [];

        // Search
        if (filters.keyword) {
            conditions.push("(name LIKE ? OR description LIKE ?)");
            values.push(`%${filters.keyword}%`, `%${filters.keyword}%`);
        }

        // Category
        if (filters.category) {
            conditions.push("category = ?");
            values.push(filters.category);
        }

        // Min Price
        if (filters.minPrice) {
            conditions.push("price >= ?");
            values.push(filters.minPrice);
        }

        // Max Price
        if (filters.maxPrice) {
            conditions.push("price <= ?");
            values.push(filters.maxPrice);
        }

        const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

        // Main Query
        const query = `
      SELECT * FROM products
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;

        const [products] = await db.query(query, [...values, limit, offset]);

        // Count Query
        const countQuery = `SELECT COUNT(*) AS total FROM products ${whereClause}`;
        const [countResult] = await db.query(countQuery, values);

        return { products, total: countResult[0].total };
    },

    // Get single product
    findById: async (id) => {
        const query = "SELECT * FROM products WHERE id = ?";
        const [rows] = await db.query(query, [id]);
        return rows;
    },

    // Create product
    create: async (data) => {
        const { name, description, price, category, stock, is_featured } = data;
        const query = `
      INSERT INTO products (name, description, price, category, stock, is_featured)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
        const [result] = await db.query(query, [name, description, price, category, stock || 0, is_featured || false]);
        return result;
    },

    // Update product
    update: async (id, data) => {
        let fields = [];
        let values = [];

        if (data.name) { fields.push("name = ?"); values.push(data.name); }
        if (data.description) { fields.push("description = ?"); values.push(data.description); }
        if (data.price !== undefined) { fields.push("price = ?"); values.push(data.price); }
        if (data.category) { fields.push("category = ?"); values.push(data.category); }
        if (data.stock !== undefined) { fields.push("stock = ?"); values.push(data.stock); }
        if (data.is_featured !== undefined) { fields.push("is_featured = ?"); values.push(data.is_featured); }
        if (data.status) { fields.push("status = ?"); values.push(data.status); }

        if (fields.length === 0) return { affectedRows: 0 };

        values.push(id);
        const query = `UPDATE products SET ${fields.join(", ")} WHERE id = ?`;
        const [result] = await db.query(query, values);
        return result;
    },

    // Featured products
    getFeatured: async () => {
        const query = "SELECT * FROM products WHERE is_featured = 1 ORDER BY created_at DESC";
        const [rows] = await db.query(query);
        return rows;
    },

    // New arrivals
    getNewArrivals: async (limit) => {
        const query = "SELECT * FROM products ORDER BY created_at DESC LIMIT ?";
        const [rows] = await db.query(query, [limit]);
        return rows;
    },

    // Get by category
    getByCategory: async (category) => {
        const query = "SELECT * FROM products WHERE category = ? ORDER BY created_at DESC";
        const [rows] = await db.query(query, [category]);
        return rows;
    },

    // Low stock
    getLowStock: async (threshold) => {
        const query = "SELECT id, name, stock, category, status FROM products WHERE stock <= ? AND status = 'active' ORDER BY stock ASC";
        const [rows] = await db.query(query, [threshold]);
        return rows;
    },

    // Get all categories
    getAllCategories: async () => {
        const query = "SELECT DISTINCT category FROM products WHERE category IS NOT NULL";
        const [rows] = await db.query(query);
        return rows;
    },

    // Bulk Create
    bulkCreate: async (products) => {
        const query = "INSERT INTO products (name, description, price, category, stock, is_featured, status) VALUES ?";
        const [result] = await db.query(query, [products]);
        return result;
    }
};

module.exports = Product;
