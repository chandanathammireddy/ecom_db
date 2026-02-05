const db = require("../config/db");

const Admin = {
  getCounts: async (table, conditions = "") => {
    let query = `SELECT COUNT(*) AS count FROM ${table}`;
    if (conditions) query += ` WHERE ${conditions}`;
    const [rows] = await db.query(query);
    return rows;
  },

  getRevenue: async (conditions = "") => {
    let query = "SELECT IFNULL(SUM(total),0) AS revenue FROM orders WHERE payment_status = 'paid'";
    if (conditions) query += ` AND ${conditions}`;
    const [rows] = await db.query(query);
    return rows;
  },

  getDailyRevenue: async () => {
    const query = `
        SELECT DATE(created_at) AS date, SUM(total) AS revenue
        FROM orders
        WHERE payment_status = 'paid' AND created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        GROUP BY DATE(created_at) ORDER BY date
      `;
    const [rows] = await db.query(query);
    return rows;
  },

  getMonthlyRevenue: async () => {
    const query = `
        SELECT MONTH(created_at) AS month, SUM(total) AS revenue
        FROM orders
        WHERE payment_status = 'paid' AND YEAR(created_at) = YEAR(CURDATE())
        GROUP BY MONTH(created_at) ORDER BY month
      `;
    const [rows] = await db.query(query);
    return rows;
  },

  getSalesSummary: async () => {
    const query = `
        SELECT 
           COUNT(DISTINCT o.id) AS totalOrders,
           SUM(oi.quantity) AS totalItemsSold,
           SUM(o.total) AS totalSales
        FROM orders o JOIN order_items oi ON o.id = oi.order_id
        WHERE o.payment_status = 'paid'
      `;
    const [rows] = await db.query(query);
    return rows;
  },

  getSalesByDate: async () => {
    const query = `
        SELECT DATE(o.created_at) AS date, COUNT(DISTINCT o.id) AS orders, SUM(oi.quantity) AS itemsSold, SUM(o.total) AS sales
        FROM orders o JOIN order_items oi ON o.id = oi.order_id
        WHERE o.payment_status = 'paid'
        GROUP BY DATE(o.created_at) ORDER BY date DESC
      `;
    const [rows] = await db.query(query);
    return rows;
  },

  getSalesByProduct: async () => {
    const query = `
        SELECT p.id, p.name, SUM(oi.quantity) AS quantitySold, SUM(oi.quantity * oi.price) AS revenue
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        JOIN products p ON oi.product_id = p.id
        WHERE o.payment_status = 'paid'
        GROUP BY p.id ORDER BY revenue DESC
      `;
    const [rows] = await db.query(query);
    return rows;
  },

  getTopSellingProducts: async (limit) => {
    const query = `
        SELECT p.id, p.name, SUM(oi.quantity) AS totalSold, SUM(oi.quantity * oi.price) AS revenue
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        JOIN products p ON oi.product_id = p.id
        WHERE o.payment_status = 'paid'
        GROUP BY p.id ORDER BY totalSold DESC LIMIT ?
      `;
    const [rows] = await db.query(query, [limit]);
    return rows;
  },

  getTopCustomers: async (limit) => {
    const query = `
        SELECT u.id AS user_id, u.name, u.email, COUNT(o.id) AS total_orders, SUM(o.total) AS total_spent
        FROM orders o JOIN users u ON o.user_id = u.id
        WHERE o.payment_status = 'paid'
        GROUP BY u.id ORDER BY total_spent DESC LIMIT ?
      `;
    const [rows] = await db.query(query, [limit]);
    return rows;
  },

  getRecentOrders: async (limit) => {
    const query = `
        SELECT o.id AS order_id, u.name AS customer_name, u.email, o.total, o.status, o.payment_status
        FROM orders o JOIN users u ON o.user_id = u.id
        ORDER BY o.id DESC LIMIT ?
      `;
    const [rows] = await db.query(query, [limit]);
    return rows;
  },

  getCustomerStats: async () => {
    const query = `
        SELECT u.id, u.name, u.email, COUNT(o.id) AS total_orders, IFNULL(SUM(o.total), 0) AS total_spent
        FROM users u LEFT JOIN orders o ON u.id = o.user_id
        WHERE u.role = 'customer'
        GROUP BY u.id ORDER BY total_spent DESC
      `;
    const [rows] = await db.query(query);
    return rows;
  }
};

module.exports = Admin;
